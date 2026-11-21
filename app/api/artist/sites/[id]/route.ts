/** 艺术站点读取（编辑时恢复现场）：仅允许读取当前用户的记录 */
import { fail, ok } from '@/lib/api'
import { ensureDefaultUser } from '@/lib/default-user'
import { getArtistSite } from '@/lib/artist/artist-site-service'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await ensureDefaultUser()
  const site = await getArtistSite(user.id, params.id)
  return site ? ok(site) : fail('作品站点不存在', 404)
}
