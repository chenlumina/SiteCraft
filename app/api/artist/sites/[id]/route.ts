/** 艺术站点读取（编辑时恢复现场）与删除：均限定当前用户 + 艺术模板范围 */
import { fail, ok } from '@/lib/api'
import { ensureDefaultUser } from '@/lib/default-user'
import {
  ArtistSiteNotFoundError,
  deleteArtistSite,
  getArtistSite,
} from '@/lib/artist/artist-site-service'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await ensureDefaultUser()
  const site = await getArtistSite(user.id, params.id)
  return site ? ok(site) : fail('作品站点不存在', 404)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await ensureDefaultUser()
    await deleteArtistSite(user.id, params.id)
    return ok({ id: params.id })
  } catch (error) {
    if (error instanceof ArtistSiteNotFoundError) return fail(error.message, 404)
    return fail('删除失败', 500)
  }
}
