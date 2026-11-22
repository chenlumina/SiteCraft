/**
 * GET /api/sites：列出当前用户的开发版式站点（按更新时间倒序）。
 * 艺术版式站点走 /api/artist/sites：两套数据契约不同，混在一起会让首页元数据错位。
 * 一期无登录态，统一归属 ensureDefaultUser() 的本地默认用户（二期换会话用户）。
 */
import { prisma } from '@/lib/prisma'
import { ensureDefaultUser } from '@/lib/default-user'
import { failFrom, ok, siteToRecord } from '@/lib/api'
import { TEMPLATE_NAMES } from '@/lib/templates'

export async function GET() {
  try {
    const user = await ensureDefaultUser()
    const sites = await prisma.site.findMany({
      where: { userId: user.id, template: { in: TEMPLATE_NAMES } },
      orderBy: { updatedAt: 'desc' },
    })
    return ok(sites.map(siteToRecord))
  } catch (error) {
    return failFrom(error)
  }
}
