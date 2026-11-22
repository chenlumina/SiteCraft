/** 艺术站点保存与列表：与开发站点 API 分离，避免两套内容契约互相污染 */
import type { Site } from '@prisma/client'
import type { ArtistSiteData, ArtistSiteRecord, ArtistTemplateName } from '@/types/artist'
import type { SiteStatus } from '@/types'
import { prisma } from '@/lib/prisma'

/** 艺术方向当前的版式集合：两套共用同一份内容契约，列表查询按这个集合过滤 */
export const ARTIST_TEMPLATES: ArtistTemplateName[] = [
  'gallery',
  'exhibition',
  'contact',
  'index',
  'studio',
  'scroll',
  'poster',
]

export interface SaveArtistSiteInput {
  id?: string
  name: string
  template: ArtistTemplateName
  content: ArtistSiteData
  status?: SiteStatus
}

export class ArtistSiteNotFoundError extends Error {
  constructor() {
    super('作品站点不存在或无权修改')
    this.name = 'ArtistSiteNotFoundError'
  }
}

export function artistSiteToRecord(site: Site): ArtistSiteRecord {
  return {
    id: site.id,
    name: site.name,
    template: (ARTIST_TEMPLATES.includes(site.template as ArtistTemplateName)
      ? site.template
      : 'gallery') as ArtistTemplateName,
    status: site.status === 'published' ? 'published' : 'draft',
    content: JSON.parse(site.content) as ArtistSiteRecord['content'],
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
  }
}

export async function listArtistSites(userId: string): Promise<ArtistSiteRecord[]> {
  const sites = await prisma.site.findMany({
    where: { userId, template: { in: ARTIST_TEMPLATES } },
    orderBy: { updatedAt: 'desc' },
  })
  return sites.map(artistSiteToRecord)
}

export async function getArtistSite(userId: string, id: string): Promise<ArtistSiteRecord | null> {
  const site = await prisma.site.findFirst({
    where: { id, userId, template: { in: ARTIST_TEMPLATES } },
  })
  return site ? artistSiteToRecord(site) : null
}

export async function saveArtistSite(
  userId: string,
  input: SaveArtistSiteInput
): Promise<ArtistSiteRecord> {
  const data = {
    name: input.name,
    template: input.template,
    content: JSON.stringify(input.content),
    ...(input.status !== undefined ? { status: input.status } : {}),
  }
  if (input.id) {
    const existing = await prisma.site.findFirst({
      where: { id: input.id, userId, template: { in: ARTIST_TEMPLATES } },
    })
    if (!existing) throw new ArtistSiteNotFoundError()
    const site = await prisma.site.update({ where: { id: input.id }, data })
    return artistSiteToRecord(site)
  }
  const site = await prisma.site.create({
    data: { ...data, status: input.status ?? 'draft', userId },
  })
  return artistSiteToRecord(site)
}

/** 删除艺术站点：先按用户 + 艺术模板范围确认归属，再删，避免误删开发站点 */
export async function deleteArtistSite(userId: string, id: string): Promise<void> {
  const existing = await prisma.site.findFirst({
    where: { id, userId, template: { in: ARTIST_TEMPLATES } },
  })
  if (!existing) throw new ArtistSiteNotFoundError()
  await prisma.site.delete({ where: { id } })
}
