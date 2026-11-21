/** 艺术站点保存与列表：与开发站点 API 分离，避免两套内容契约互相污染 */
import type { Site } from '@prisma/client'
import type { ArtistSiteData, ArtistSiteRecord } from '@/types/artist'
import type { SiteStatus } from '@/types'
import { prisma } from '@/lib/prisma'

export interface SaveArtistSiteInput {
  id?: string
  name: string
  template: 'gallery'
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
    template: 'gallery',
    status: site.status === 'published' ? 'published' : 'draft',
    content: JSON.parse(site.content) as ArtistSiteRecord['content'],
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
  }
}

export async function listArtistSites(userId: string): Promise<ArtistSiteRecord[]> {
  const sites = await prisma.site.findMany({
    where: { userId, template: 'gallery' },
    orderBy: { updatedAt: 'desc' },
  })
  return sites.map(artistSiteToRecord)
}

export async function getArtistSite(userId: string, id: string): Promise<ArtistSiteRecord | null> {
  const site = await prisma.site.findFirst({ where: { id, userId, template: 'gallery' } })
  return site ? artistSiteToRecord(site) : null
}

export async function saveArtistSite(
  userId: string,
  input: SaveArtistSiteInput
): Promise<ArtistSiteRecord> {
  const data = {
    name: input.name,
    template: 'gallery',
    content: JSON.stringify(input.content),
    ...(input.status !== undefined ? { status: input.status } : {}),
  }
  if (input.id) {
    const existing = await prisma.site.findFirst({
      where: { id: input.id, userId, template: 'gallery' },
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
