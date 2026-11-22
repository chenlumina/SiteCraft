/**
 * 站点体检：纯函数、零副作用、可单测。
 * 检查对象是 generateSiteHTML 的真实产物（与导出/部署同一份 HTML）加上 SiteData 本身，
 * 所以「体检通过」意味着导出文件满足这些条件，而不是另一套模拟逻辑。
 * 评分只统计 pass / warn / fail（info 为提示项，不计入分母）。
 */
import type { SiteData, TemplateName } from '@/types'
import { generateSiteHTML } from '@/lib/generators/html-generator'

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info'

export interface CheckItem {
  id: string
  label: string
  status: CheckStatus
  /** 实测到的值或结论，让用户知道检查了什么 */
  detail: string
  /** 不通过时的具体修复建议 */
  hint?: string
}

export interface CheckupReport {
  passed: number
  /** 计分项总数（不含 info） */
  total: number
  items: CheckItem[]
}

const TITLE_MIN = 5
const TITLE_MAX = 70
const DESC_MIN = 10
const DESC_MAX = 160
const BIO_MIN_SUGGEST = 60
const HTML_MAX_BYTES = 1.5 * 1024 * 1024

function charLen(value: string): number {
  return [...value].length
}

export function runSiteCheckup(data: SiteData, template: TemplateName): CheckupReport {
  const html = generateSiteHTML(data, template)
  const items: CheckItem[] = []

  // 1. 页面标题
  const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? ''
  const titleLen = charLen(title)
  items.push({
    id: 'title',
    label: '页面标题',
    status: titleLen >= TITLE_MIN && titleLen <= TITLE_MAX ? 'pass' : 'fail',
    detail: title ? `${titleLen} 字：${title.slice(0, 40)}` : '缺少 <title>',
    hint:
      titleLen < TITLE_MIN || !title
        ? '补全姓名与头衔，标题建议 5–70 字'
        : titleLen > TITLE_MAX
          ? '标题过长，浏览器标签页会截断'
          : undefined,
  })

  // 2. 描述摘要
  const desc = /<meta\s+name="description"\s+content="([^"]*)"/i.exec(html)?.[1] ?? ''
  const descLen = charLen(desc)
  items.push({
    id: 'description',
    label: '描述摘要',
    status: descLen >= DESC_MIN && descLen <= DESC_MAX ? 'pass' : 'warn',
    detail: desc ? `${descLen} 字` : '缺少 meta description',
    hint:
      descLen < DESC_MIN
        ? '简介会作为搜索与分享摘要，至少写 10 字，建议 40–160 字'
        : descLen > DESC_MAX
          ? '摘要过长，搜索结果会被截断'
          : undefined,
  })

  // 3. 社交分享标签（og:*）
  const hasOgTitle = /property="og:title"/.test(html)
  const hasOgDesc = /property="og:description"/.test(html)
  items.push({
    id: 'og',
    label: '社交分享标签',
    status: hasOgTitle && hasOgDesc ? 'pass' : 'fail',
    detail: hasOgTitle && hasOgDesc ? 'og:title / og:description 已生成' : '缺少 og:* 分享标签',
  })

  // 4. 标题结构
  const h1Count = (html.match(/<h1\b/gi) ?? []).length
  items.push({
    id: 'h1',
    label: '标题结构',
    status: h1Count === 1 ? 'pass' : 'fail',
    detail: `h1 共 ${h1Count} 个`,
    hint:
      h1Count === 0
        ? '页面需要且只需要一个 h1'
        : h1Count > 1
          ? '多个 h1 会让搜索引擎分不清页面主旨'
          : undefined,
  })

  // 5. 图片替代文本
  const imgs = html.match(/<img\b[^>]*>/gi) ?? []
  const missingAlt = imgs.filter((tag) => !/\balt\s*=/i.test(tag)).length
  items.push({
    id: 'img-alt',
    label: '图片替代文本',
    status: imgs.length === 0 || missingAlt === 0 ? 'pass' : 'fail',
    detail: imgs.length === 0 ? '页面无图片' : `${imgs.length} 张图片，${missingAlt} 张缺少 alt`,
    hint: missingAlt > 0 ? '为每张图片补充 alt，读屏与图片加载失败时都依赖它' : undefined,
  })

  // 6. 个人简介
  const bioLen = charLen(data.bio.trim())
  items.push({
    id: 'bio',
    label: '个人简介',
    status: bioLen === 0 ? 'fail' : bioLen < BIO_MIN_SUGGEST ? 'warn' : 'pass',
    detail: bioLen === 0 ? '未填写' : `${bioLen} 字`,
    hint:
      bioLen === 0
        ? '访客第一眼看到的就是简介，建议 60–200 字'
        : bioLen < BIO_MIN_SUGGEST
          ? '简介偏短，建议补充方向、经历与在找什么（60 字以上）'
          : undefined,
  })

  // 7. 技能 / 作品 / 经历的数量（内容充实度）
  items.push({
    id: 'skills',
    label: '技能条目',
    status: data.skills.length >= 3 ? 'pass' : 'warn',
    detail: `${data.skills.length} 项`,
    hint: data.skills.length < 3 ? '至少列 3 项，访客才能形成能力画像' : undefined,
  })
  items.push({
    id: 'projects',
    label: '项目 / 作品',
    status: data.projects.length >= 2 ? 'pass' : 'warn',
    detail: `${data.projects.length} 个`,
    hint: data.projects.length < 2 ? '至少放 2 个，一个作品撑不起信任' : undefined,
  })

  // 8. 联系方式：邮箱为空时联系区按钮整体消失
  const email = data.email.trim()
  items.push({
    id: 'email',
    label: '联系邮箱',
    status: email ? 'pass' : 'fail',
    detail: email || '未填写（站点联系按钮会消失）',
    hint: email ? undefined : '补一个邮箱，否则访客找不到你',
  })

  // 9. 社交链接
  const socialCount = Object.values(data.socials).filter((url) => url.trim()).length
  items.push({
    id: 'socials',
    label: '社交链接',
    status: socialCount > 0 ? 'pass' : 'warn',
    detail: socialCount > 0 ? `${socialCount} 个` : '全部为空',
    hint: socialCount === 0 ? '至少填一个（GitHub / B站 / 个人主页），方便访客顺着看' : undefined,
  })

  // 10. 导出体积
  const bytes = new TextEncoder().encode(html).length
  const kb = Math.round(bytes / 1024)
  items.push({
    id: 'size',
    label: '导出体积',
    status: bytes <= HTML_MAX_BYTES ? 'pass' : 'warn',
    detail: `${kb} KB（单文件）`,
    hint: bytes > HTML_MAX_BYTES ? '体积偏大，检查是否内联了过大的图片' : undefined,
  })

  // 提示项（不计分）
  items.push({
    id: 'og-image',
    label: '社交预览图',
    status: 'info',
    detail: 'og:image 需部署后按域名补充（本地导出无法预知公网地址）',
  })
  items.push({
    id: 'target',
    label: '体检对象',
    status: 'info',
    detail: `${template} 版式 · 导出 ${kb} KB`,
  })

  const scored = items.filter((item) => item.status !== 'info')
  return {
    passed: scored.filter((item) => item.status === 'pass').length,
    total: scored.length,
    items,
  }
}
