import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { UNGROUPED_LABEL, groupBySeries } from '@/lib/generators/artist/series'
import { generateArtistSiteHTML } from '@/lib/generators/artist/html-generator'
import { createGallerySampleData } from '@/lib/artist/sample-gallery'
import type { Artwork } from '@/types/artist'

const sample = createGallerySampleData()
const base = sample.artworks[0]
const make = (id: string, series: string, title: string): Artwork => ({
  ...base,
  id,
  series,
  title,
})

describe('系列分组', () => {
  it('按 series 原样分组，保持首次出现顺序', () => {
    const groups = groupBySeries([make('1', '甲', 'A'), make('2', '乙', 'B'), make('3', '甲', 'C')])
    assert.deepEqual(
      groups.map((g) => g.series),
      ['甲', '乙']
    )
    assert.deepEqual(
      groups[0].works.map((w) => w.title),
      ['A', 'C']
    )
  })

  it('只 trim，不猜错字：前后空格并到同一组', () => {
    const groups = groupBySeries([make('1', '甲', 'A'), make('2', ' 甲 ', 'B')])
    assert.equal(groups.length, 1)
    assert.equal(groups[0].works.length, 2)
  })

  it('空系列归入「未归系列」且排最后', () => {
    const groups = groupBySeries([make('1', '', 'A'), make('2', '甲', 'B'), make('3', '   ', 'C')])
    assert.equal(groups[groups.length - 1].series, UNGROUPED_LABEL)
    assert.deepEqual(
      groups[groups.length - 1].works.map((w) => w.title),
      ['A', 'C']
    )
  })

  it('全空时不产生分组', () => {
    assert.deepEqual(groupBySeries([]), [])
  })
})

describe('系列在产物里的呈现', () => {
  it('画廊按系列分成多个区块，重点作品不重复出现', () => {
    const html = generateArtistSiteHTML(sample, 'gallery')
    const heads = (html.match(/class="ag-series-head"/g) || []).length
    assert.ok(heads >= 2, '应至少两组，实际 ' + heads)
    const featuredTitle = sample.artworks.find((w) => w.featured)?.title ?? ''
    if (featuredTitle) {
      const count = html.split('>' + featuredTitle + '<').length - 1
      assert.ok(count <= 2, '重点作品不应在分组里重复（标题出现 ' + count + ' 次）')
    }
  })

  it('展览在组之间插入系列牌，首组没有牌', () => {
    const html = generateArtistSiteHTML(sample, 'exhibition')
    const dividers = (html.match(/class="ex-divider"/g) || []).length
    const groups = groupBySeries(
      [...sample.artworks].sort((a, b) => Number(b.featured) - Number(a.featured))
    )
    assert.equal(dividers, Math.max(0, groups.length - 1))
  })
})
