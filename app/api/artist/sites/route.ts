/** 艺术站点保存 / 列表：仅接受 ArtistSiteData，不落库前不过开发站点 schema */
import { fail, failFrom, ok } from '@/lib/api'
import { ensureDefaultUser } from '@/lib/default-user'
import { artistSaveSiteSchema } from '@/lib/validators/artist-schema'
import {
  ArtistSiteNotFoundError,
  listArtistSites,
  saveArtistSite,
} from '@/lib/artist/artist-site-service'

export async function GET() {
  const user = await ensureDefaultUser()
  return ok(await listArtistSites(user.id))
}

export async function POST(request: Request) {
  try {
    const user = await ensureDefaultUser()
    const input = artistSaveSiteSchema.parse(await request.json())
    const site = await saveArtistSite(user.id, input)
    return ok(site, input.id ? 200 : 201)
  } catch (error) {
    if (error instanceof ArtistSiteNotFoundError) return fail(error.message, 404)
    return failFrom(error)
  }
}
