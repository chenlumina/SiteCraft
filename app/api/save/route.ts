/**
 * POST /api/save：保存站点的 upsert 入口（编辑器「保存」按钮调用）。
 * 带 id → 校验所有权后更新；不带 id → 新建（201）。
 * 落库逻辑统一在 lib/site-service.saveSite，本路由只做校验与响应。
 * 命名说明：原名 /api/generate 名不副实（实际不生成任何东西），已更名为 save；
 * 旧路由保留为薄别名以兼容外部调用方。
 */
import { ensureDefaultUser } from '@/lib/default-user'
import { fail, failFrom, ok } from '@/lib/api'
import { saveSiteSchema } from '@/lib/validators/site-schema'
import { saveSite, SiteNotFoundError } from '@/lib/site-service'

export async function POST(req: Request) {
  try {
    const user = await ensureDefaultUser()
    const body: unknown = await req.json()
    const input = saveSiteSchema.parse(body)
    const record = await saveSite(user.id, input)
    return ok(record, input.id ? 200 : 201)
  } catch (error) {
    if (error instanceof SiteNotFoundError) return fail(error.message, 404)
    return failFrom(error)
  }
}