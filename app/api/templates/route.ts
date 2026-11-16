/**
 * GET /api/templates：返回八套模板元数据（数据库 Template 表）。
 * config 字段存的是 lib/templates.ts 元数据的 JSON 快照，
 * 前端画廊/编辑器也可直接 import 元数据；此接口供外部消费者与二期管理端使用。
 */
import { prisma } from '@/lib/prisma'
import { failFrom, ok } from '@/lib/api'
import type { TemplateMeta } from '@/types'

export async function GET() {
  try {
    const templates = await prisma.template.findMany({ orderBy: { createdAt: 'asc' } })
    const data = templates.map((t) => ({
      id: t.id,
      name: t.name,
      displayName: t.displayName,
      description: t.description,
      thumbnail: t.thumbnail,
      isDefault: t.isDefault,
      config: JSON.parse(t.config) as TemplateMeta,
    }))
    return ok(data)
  } catch (error) {
    return failFrom(error)
  }
}