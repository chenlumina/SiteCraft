/**
 * GET /api/sites：列出当前用户全部站点（按更新时间倒序）。
 * 一期无登录态，统一归属 ensureDefaultUser() 的本地默认用户（二期换会话用户）。
 */
import { prisma } from '@/lib/prisma'
import { ensureDefaultUser } from '@/lib/default-user'
import { failFrom, ok, siteToRecord } from '@/lib/api'

export async function GET() {
  try {
    const user = await ensureDefaultUser()
    const sites = await prisma.site.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    })
    return ok(sites.map(siteToRecord))
  } catch (error) {
    return failFrom(error)
  }
}