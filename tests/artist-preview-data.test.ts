import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildArtistPreviewData } from '@/lib/artist/preview-data'
import { createGallerySampleData } from '@/lib/artist/sample-gallery'

/**
 * 回归：同一套版式在「版式展区 / 试玩区 / 编辑器」三处必须显示同一个人。
 * 之前三处各用一份数据，导致展区是示例人物、试玩是你输入的名字、编辑器又是第三个。
 */
describe('艺术预览数据唯一来源', () => {
  it('不传覆盖时等于示例数据', () => {
    const base = createGallerySampleData()
    const data = buildArtistPreviewData()
    assert.equal(data.name, base.name)
    assert.equal(data.title, base.title)
    assert.equal(data.location, base.location)
    assert.equal(data.artworks.length, base.artworks.length)
  })

  it('只覆盖名字时，方向与城市仍取示例值', () => {
    const base = createGallerySampleData()
    const data = buildArtistPreviewData({ name: 'cheer' })
    assert.equal(data.name, 'cheer')
    assert.equal(data.title, base.title)
    assert.equal(data.location, base.location)
  })

  it('空串视为未填写，回落到示例值（避免 location 被抹空）', () => {
    const base = createGallerySampleData()
    const data = buildArtistPreviewData({ name: '  ', title: '', location: '' })
    assert.equal(data.name, base.name)
    assert.equal(data.title, base.title)
    assert.equal(data.location, base.location)
  })

  it('三项都给时全部生效', () => {
    const data = buildArtistPreviewData({ name: 'cheer', title: '插画师', location: '上海' })
    assert.equal(data.name, 'cheer')
    assert.equal(data.title, '插画师')
    assert.equal(data.location, '上海')
  })

  it('返回副本，改动不污染示例数据', () => {
    const data = buildArtistPreviewData()
    data.artworks[0].title = '改坏了'
    assert.notEqual(createGallerySampleData().artworks[0].title, '改坏了')
  })
})
