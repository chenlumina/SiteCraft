/**
 * /api/sites/:id —— 单站点读/改/删。
 * 所有操作都带 userId 条件（所有权校验）：即使拿到别人的 id 也读不到/改不了/删不掉，
 * 这是一期无登录态下最低限度的数据隔离。
 * PUT 为补丁式更新：只写请求里出现的字段（如仅改 status 实现发布/草稿切换）。
 */
import { prisma } from '@/lib/prisma'
import { ensureDefaultUser } from '@/lib/default-user'
import { fail, failFrom, ok, siteToRecord } from '@/lib/api'
import { updateSiteSchema } from '@/lib/validators/site-schema'
import { patchSite, SiteNotFoundError } from '@/lib/site-service'

interface RouteContext {
  params: { id: string }
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await ensureDefaultUser()
    const site = await prisma.site.findFirst({ where: { id: params.id, userId: user.id } })
    if (!site) return fail('站点不存在', 404)
    return ok(siteToRecord(site))
  } catch (error) {
    return failFrom(error)
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const user = await ensureDefaultUser()
    const body: unknown = await req.json()
    const patch = updateSiteSchema.parse(body)
    const record = await patchSite(user.id, params.id, patch)
    return ok(record)
  } catch (error) {
    if (error instanceof SiteNotFoundError) return fail('站点不存在', 404)
    return failFrom(error)
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await ensureDefaultUser()
    const result = await prisma.site.deleteMany({ where: { id: params.id, userId: user.id } })
    if (result.count === 0) return fail('站点不存在', 404)
    return ok({ id: params.id })
  } catch (error) {
    return failFrom(error)
  }
}