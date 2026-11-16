/**
 * 站点落库服务层：保存（upsert）的唯一实现。
 * 原先 /api/generate、/api/deploy、/api/sites/:id 各写一份落库逻辑，
 * 字段拼装方式还不一致；现在统一收敛到这里，路由只做校验与响应。
 *
 * 所有权校验内置：带 id 更新时先按 userId 查，查不到即拒绝，
 * 保证「拿到别人的 id 也改不了」这条隔离规则只维护一处。
 */
import type { Site } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { siteToRecord } from '@/lib/api'
import type { SiteRecord, SiteStatus, TemplateName, SiteData } from '@/types'

export interface SaveSiteInput {
  /** 带 id 为更新（需属于该用户），不带 id 为新建 */
  id?: string
  name: string
  template: TemplateName
  content: SiteData
  /** 省略时：新建默认 draft，更新保留原状态（补丁语义） */
  status?: SiteStatus
}

export class SiteNotFoundError extends Error {
  constructor() {
    super('站点不存在或无权修改')
    this.name = 'SiteNotFoundError'
  }
}

/** upsert 语义保存站点，返回前端契约形态的 SiteRecord */
export async function saveSite(userId: string, input: SaveSiteInput): Promise<SiteRecord> {
  const content = JSON.stringify(input.content)

  if (input.id) {
    const existing = await prisma.site.findFirst({ where: { id: input.id, userId } })
    if (!existing) throw new SiteNotFoundError()
    const site = await prisma.site.update({
      where: { id: input.id },
      data: {
        name: input.name,
        template: input.template,
        content,
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    })
    return siteToRecord(site)
  }

  const site: Site = await prisma.site.create({
    data: {
      name: input.name,
      template: input.template,
      content,
      status: input.status ?? 'draft',
      userId,
    },
  })
  return siteToRecord(site)
}

export interface PatchSiteInput {
  name?: string
  template?: TemplateName
  content?: SiteData
  status?: SiteStatus
}

/** 补丁式更新（PUT /api/sites/:id 语义）：只写请求里出现的字段，所有权校验同 saveSite */
export async function patchSite(
  userId: string,
  id: string,
  patch: PatchSiteInput
): Promise<SiteRecord> {
  const existing = await prisma.site.findFirst({ where: { id, userId } })
  if (!existing) throw new SiteNotFoundError()
  const site = await prisma.site.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.template !== undefined ? { template: patch.template } : {}),
      ...(patch.content !== undefined ? { content: JSON.stringify(patch.content) } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    },
  })
  return siteToRecord(site)
}