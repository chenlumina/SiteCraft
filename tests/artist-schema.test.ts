import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createGallerySampleData } from '@/lib/artist/sample-gallery'
import {
  artistSiteDataSchema,
  artworkSchema,
  MAX_MEDIA_PER_ARTWORK,
} from '@/lib/validators/artist-schema'

describe('艺术数据契约', () => {
  it('完整 Gallery 示例通过校验，且每次返回独立副本', () => {
    const first = createGallerySampleData()
    const second = createGallerySampleData()
    const parsed = artistSiteDataSchema.parse(first)
    assert.equal(parsed.archetype, 'artist')
    assert.equal(parsed.artworks[0].featured, true)
    first.artworks[0].title = '已修改'
    assert.notEqual(first.artworks[0].title, second.artworks[0].title)
  })

  it('拒绝危险媒体协议与空媒体链接', () => {
    const artwork = createGallerySampleData().artworks[0]
    assert.equal(
      artworkSchema.safeParse({
        ...artwork,
        media: [{ id: 'x', type: 'image', url: 'javascript:alert(1)' }],
      }).success,
      false
    )
    assert.equal(
      artworkSchema.safeParse({ ...artwork, media: [{ id: 'x', type: 'image', url: '' }] }).success,
      false
    )
  })

  it('允许站内媒体路径并约束媒体数量', () => {
    const artwork = createGallerySampleData().artworks[0]
    assert.equal(artworkSchema.safeParse(artwork).success, true)
    const media = Array.from({ length: MAX_MEDIA_PER_ARTWORK + 1 }, (_, index) => ({
      id: `m${index}`,
      type: 'image',
      url: '/images/test.svg',
    }))
    assert.equal(artworkSchema.safeParse({ ...artwork, media }).success, false)
  })

  it('作品标题必填且不能超过 60 字', () => {
    const artwork = createGallerySampleData().artworks[0]
    assert.equal(artworkSchema.safeParse({ ...artwork, title: '' }).success, false)
    assert.equal(artworkSchema.safeParse({ ...artwork, title: '作'.repeat(61) }).success, false)
  })
})
