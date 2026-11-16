/**
 * API 层公共工具：统一响应格式（规范 3.5）、错误到 HTTP 状态的映射、
 * 数据库行 → 前端 SiteRecord 的序列化。所有路由只通过这些函数返回响应，
 * 保证前端 fetch 后的判断逻辑（json.success）处处一致。
 */
import { ZodError } from 'zod'
import type { Site } from '@prisma/client'
import type { ApiResponse, SiteData, SiteRecord, SiteStatus, TemplateName } from '@/types'
import { isTemplateName } from '@/lib/templates'

export function ok<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data }
  return Response.json(body, { status })
}

export function fail(error: string, status = 400): Response {
  const body: ApiResponse<never> = { success: false, error }
  return Response.json(body, { status })
}

/**
 * 错误映射：Zod 校验失败 → 400 并带上「字段路径: 原因」的首条 issue（可直接 toast 展示）；
 * 其余未知异常 → 500 且不透漏内部细节（安全要求）。
 */
export function failFrom(error: unknown): Response {
  if (error instanceof ZodError) {
    const first = error.issues[0]
    const path = first.path.join('.')
    return fail(path ? `${path}: ${first.message}` : first.message, 400)
  }
  return fail('服务器错误，请稍后重试', 500)
}

/** DB 行 → 前端契约：content 是 JSON 字符串需解析；template/status 做非法值兜底，日期转 ISO */
export function siteToRecord(site: Site): SiteRecord {
  const template: TemplateName = isTemplateName(site.template) ? site.template : 'minimal'
  return {
    id: site.id,
    name: site.name,
    template,
    status: (site.status === 'published' ? 'published' : 'draft') as SiteStatus,
    content: JSON.parse(site.content) as SiteData,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
  }
}