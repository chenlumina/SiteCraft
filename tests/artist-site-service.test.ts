import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { prisma } from '@/lib/prisma'
import { createGallerySampleData } from '@/lib/artist/sample-gallery'
import {
  ArtistSiteNotFoundError,
  getArtistSite,
  listArtistSites,
  saveArtistSite,
} from '@/lib/artist/artist-site-service'

const USER_ID = 'local-user'

beforeEach(async () => {
  await prisma.site.deleteMany({})
  await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: { id: USER_ID, email: 'artist-test@example.com', name: '测试用户' },
  })
})

function input() {
  return { name: '梵高的作品集', template: 'gallery' as const, content: createGallerySampleData() }
}

describe('艺术站点服务', () => {
  it('新建、读取与列表均保留完整作品 JSON', async () => {
    const saved = await saveArtistSite(USER_ID, input())
    assert.equal(saved.template, 'gallery')
    assert.equal(saved.status, 'draft')
    assert.equal(saved.content.artworks.length, createGallerySampleData().artworks.length)
    const loaded = await getArtistSite(USER_ID, saved.id)
    assert.deepEqual(loaded?.content.artworks[0].media, saved.content.artworks[0].media)
    assert.equal((await listArtistSites(USER_ID)).length, 1)
  })

  it('带 id 更新保留草稿状态并替换作品', async () => {
    const saved = await saveArtistSite(USER_ID, input())
    const content = createGallerySampleData()
    content.artworks = []
    const updated = await saveArtistSite(USER_ID, { ...input(), id: saved.id, content })
    assert.equal(updated.id, saved.id)
    assert.equal(updated.status, 'draft')
    assert.equal(updated.content.artworks.length, 0)
  })

  it('其他用户不能读取或覆盖作品站点', async () => {
    const saved = await saveArtistSite(USER_ID, input())
    assert.equal(await getArtistSite('another-user', saved.id), null)
    await assert.rejects(
      () => saveArtistSite('another-user', { ...input(), id: saved.id }),
      ArtistSiteNotFoundError
    )
  })
})
