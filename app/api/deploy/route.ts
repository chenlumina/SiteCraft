/**
 * POST /api/deploy：一键发布到 GitHub Pages。
 * 流程：校验入参 → 检查 GITHUB_TOKEN（未配置返回 400+指引，前端降级为导出）→
 * 先把站点落库并标记 published → 读 GitHub 账号 → 创建公开仓库(auto_init) →
 * 推送生成的 index.html（失败重试一次，规避 auto_init 提交竞态）→ 开启 Pages。
 * 全程服务端持有 token，浏览器永远接触不到密钥（规范 9：敏感信息进环境变量）。
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ensureDefaultUser } from '@/lib/default-user'
import { fail, failFrom, ok } from '@/lib/api'
import { deploySchema } from '@/lib/validators/site-schema'
import { saveSite, SiteNotFoundError } from '@/lib/site-service'
import { DEFAULT_AVATAR_PATH, generateSiteHTML } from '@/lib/generators/html-generator'
import type { DeployResult, SiteData } from '@/types'

const GITHUB_API = 'https://api.github.com'

const AVATAR_MIME: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

/**
 * 部署前把站内相对路径头像读成 data URI 内联（仓库里只有 index.html，相对路径必 404）。
 * 路径穿越防护：normalize 后必须仍落在 public/ 内，否则原样返回不读盘，
 * 防止 avatar 填 /../../etc/passwd 之类读取任意文件。
 */
async function inlineServerAvatar(content: SiteData): Promise<SiteData> {
  const avatar = content.avatar.trim()
  if (!avatar.startsWith('/') || avatar === DEFAULT_AVATAR_PATH) return content
  const publicDir = path.join(process.cwd(), 'public')
  const filePath = path.normalize(path.join(publicDir, avatar))
  if (!filePath.startsWith(publicDir + path.sep)) return content
  try {
    const buffer = await readFile(filePath)
    const mime = AVATAR_MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
    return { ...content, avatar: `data:${mime};base64,${buffer.toString('base64')}` }
  } catch {
    return content
  }
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'sitecraft-personal-site-builder',
    'Content-Type': 'application/json',
  }
}

/** 推送 index.html：base64 内容走 GitHub Contents API；409/404 竞态时等 1.5s 重试一次 */
async function pushIndexHtml(
  token: string,
  owner: string,
  repo: string,
  html: string
): Promise<boolean> {
  const payload = JSON.stringify({
    message: 'feat: publish personal site via SiteCraft',
    content: Buffer.from(html, 'utf-8').toString('base64'),
    branch: 'main',
  })
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/index.html`, {
      method: 'PUT',
      headers: githubHeaders(token),
      body: payload,
    })
    if (res.ok) return true
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  return false
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()
    const input = deploySchema.parse(body)

    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return fail(
        '部署功能尚未配置：请在项目根目录 .env.local 中设置 GITHUB_TOKEN（具备 repo 权限的 GitHub Personal Access Token）并重启服务。也可以先使用「导出 HTML」手动托管。',
        400
      )
    }

    const user = await ensureDefaultUser()
    try {
      await saveSite(user.id, {
        id: input.siteId,
        name: input.name,
        template: input.template,
        content: input.content,
        status: 'published',
      })
    } catch (error) {
      // 保持原行为：带了不存在/非本人的 siteId 时静默跳过落库，部署主流程继续
      if (!(error instanceof SiteNotFoundError)) throw error
    }

    const headers = githubHeaders(token)
    const meRes = await fetch(`${GITHUB_API}/user`, { headers })
    if (!meRes.ok) return fail('GITHUB_TOKEN 无效或已过期，请检查后重试', 401)
    const me = (await meRes.json()) as { login?: string }
    if (!me.login) return fail('无法读取 GitHub 账户信息', 502)
    const owner = me.login

    const createRes = await fetch(`${GITHUB_API}/user/repos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: input.repoName,
        description: input.description ?? `${input.content.name} 的个人官网`,
        private: false,
        auto_init: true,
      }),
    })
    if (createRes.status === 422) {
      return fail(`仓库「${input.repoName}」已存在或名称不合法，请更换仓库名`, 409)
    }
    if (!createRes.ok) return fail('创建 GitHub 仓库失败，请稍后重试', 502)

    const html = generateSiteHTML(await inlineServerAvatar(input.content), input.template)
    const pushed = await pushIndexHtml(token, owner, input.repoName, html)
    if (!pushed) return fail('仓库已创建，但推送 index.html 失败，请在 GitHub 上手动检查', 502)

    let pagesUrl: string | null = null
    const pagesRes = await fetch(`${GITHUB_API}/repos/${owner}/${input.repoName}/pages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ source: { branch: 'main', path: '/' } }),
    })
    if (pagesRes.ok || pagesRes.status === 409) {
      pagesUrl = `https://${owner}.github.io/${input.repoName}/`
    }

    const result: DeployResult = {
      repoUrl: `https://github.com/${owner}/${input.repoName}`,
      pagesUrl,
      owner,
      repo: input.repoName,
    }
    return ok(result, 201)
  } catch (error) {
    return failFrom(error)
  }
}