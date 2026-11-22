import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { createGallerySampleData } from '@/lib/artist/sample-gallery'
import {
  generateArtistSiteHTML,
  renderGalleryFragment,
} from '@/lib/generators/artist/html-generator'

const ALL_ARTIST = [
  'gallery',
  'exhibition',
  'contact',
  'index',
  'studio',
  'scroll',
  'poster',
] as const

const snapshotDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__snapshots__')

describe('Gallery 真实渲染器', () => {
  it('输出与黄金快照一致', () => {
    const expected = readFileSync(path.join(snapshotDir, 'artist-gallery.html'), 'utf-8')
    assert.equal(generateArtistSiteHTML(createGallerySampleData()), expected)
  })

  it('重点作品优先，完整作品与联系信息出现', () => {
    const { body } = renderGalleryFragment(createGallerySampleData())
    assert.ok(body.indexOf('星月夜') < body.indexOf('向日葵'))
    assert.ok(body.includes('全部作品'))
    assert.ok(body.includes('vincent@example.com'))
    assert.ok(body.includes('data:image/svg+xml;base64,'), '作品封面应内联为 data URI')
  })

  it('拒绝危险媒体 URL 与文本注入', () => {
    const data = createGallerySampleData()
    data.name = '<img src=x onerror=alert(1)>'
    data.artworks[0].cover = 'javascript:alert(1)'
    data.artworks[0].media = [{ id: 'bad', url: 'javascript:alert(1)' }]
    const html = generateArtistSiteHTML(data)
    assert.ok(!html.includes('<img src=x onerror=alert(1)>'))
    assert.ok(!html.includes('src="javascript:alert(1)"'))
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  })

  it('无作品时不生成空展厅，无脚本且样式内联', () => {
    const data = { ...createGallerySampleData(), artworks: [] }
    const html = generateArtistSiteHTML(data)
    assert.ok(!html.includes('id="works"'))
    assert.ok(html.includes('关于') || html.includes('About the artist'))
    assert.ok(!html.includes('<script'))
    assert.ok(html.includes('<style>'))
  })

  it('导出内联图片 data URI 可渲染，其他 data 协议仍拒绝', () => {
    const data = createGallerySampleData()
    data.artworks[0].cover = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='
    data.artworks[1].cover = 'data:text/html;base64,PHNjcmlwdD4='
    const html = generateArtistSiteHTML(data)
    assert.ok(html.includes('src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="'))
    assert.ok(!html.includes('src="data:text/html'))
  })

  it('导出产物自包含：不引用站点相对图片路径，作品图为 data URI', () => {
    const html = generateArtistSiteHTML(createGallerySampleData())
    assert.ok(!html.includes('/images/artworks'), '不应残留 /images/ 相对路径')
    assert.equal((html.match(/<script/g) || []).length, 0, '不应包含 <script>')
    const dataUri = (html.match(/data:image\/svg\+xml;base64,/g) || []).length
    assert.ok(dataUri >= 4, '四张示例作品应内联为 data URI，实际 ' + dataUri)
  })

  it('作品尺寸与展览履历进入产物，且导航出现展览入口', () => {
    const html = generateArtistSiteHTML(createGallerySampleData())
    assert.ok(html.includes('73.7 × 92.1 cm'), '作品尺寸应出现在产物中')
    assert.ok(html.includes('id="exhibitions"'), '应有展览区块')
    assert.ok(html.includes('个展') || html.includes('群展'), '应标注展览类型')
    assert.ok(html.includes('href="#exhibitions"'), '导航应指向展览区块')
  })

  it('展览版式：横向作品墙、可聚焦、展览履历与尺寸都在', () => {
    const html = generateArtistSiteHTML(createGallerySampleData(), 'exhibition')
    assert.ok(html.includes('class="ex-wall"'), '应有作品墙容器')
    assert.ok(html.includes('scroll-snap'), '作品墙应使用 scroll-snap')
    assert.ok(/tabindex="0"/.test(html), '作品墙应可聚焦（键盘左右切换）')
    assert.ok(html.includes('id="cv"'), '应有展览履历区块')
    assert.ok(html.includes('73.7 × 92.1 cm'), '尺寸应出现在展览版式')
    assert.equal((html.match(/<script/g) || []).length, 0, '展览版式同样零脚本')
    assert.ok(!html.includes('/images/artworks'), '展览版式同样自包含')
  })

  it('七套艺术版式共用同一份数据，各自产出不同结构', () => {
    const data = createGallerySampleData()
    const outputs = ALL_ARTIST.map((tpl) => generateArtistSiteHTML(data, tpl))
    assert.equal(new Set(outputs).size, ALL_ARTIST.length, '七套产物必须互不相同')
    for (const [index, tpl] of ALL_ARTIST.entries()) {
      const html = outputs[index]
      assert.ok(html.includes('site-root'), tpl + ' 应有 site-root 契约')
      assert.equal((html.match(/<script/g) || []).length, 0, tpl + ' 不应含脚本')
      assert.ok(!html.includes('/images/artworks'), tpl + ' 应自包含')
      assert.ok(html.includes('data:image'), tpl + ' 图片应内联')
    }
  })

  it('五套新模板各自的专属结构都在', () => {
    const data = createGallerySampleData()
    const expect = {
      contact: 'cs-strip',
      index: 'ix-table',
      studio: 'st-card',
      scroll: 'sc-axis',
      poster: 'po-wall',
    } as const
    for (const [tpl, marker] of Object.entries(expect)) {
      const html = generateArtistSiteHTML(data, tpl as (typeof ALL_ARTIST)[number])
      assert.ok(html.includes(marker), tpl + ' 缺少专属结构 ' + marker)
      assert.ok(html.includes('artist-' + tpl), tpl + ' 根类名应为 artist-' + tpl)
    }
  })

  it('合作区块：有内容才渲染，接单状态可切换，邮件带主题', () => {
    // 示例人物是已故画家，默认不接单：只保留「收藏说明」一行
    const sample = createGallerySampleData()
    const sampleHtml = generateArtistSiteHTML(sample, 'gallery')
    assert.ok(sampleHtml.includes('id="commissions"'), '示例应有合作区块（含收藏说明）')
    assert.ok(sampleHtml.includes('暂不接单'), '示例默认应显示暂不接单')

    // 正向路径用构造数据：接单中 + 起价 + 邮件主题
    const data: typeof sample = {
      ...sample,
      commissions: {
        open: true,
        scope: '编辑插画、书籍封面',
        process: '邮件说明需求 → 三个工作日回报价',
        leadTime: '2027 春季',
        priceFrom: '单张 3,000 元起',
      },
    }
    for (const tpl of ['gallery', 'exhibition'] as const) {
      const html = generateArtistSiteHTML(data, tpl)
      assert.ok(html.includes('id="commissions"'), tpl + ' 应有合作区块')
      assert.ok(html.includes('接单中'), tpl + ' 应显示接单状态')
      assert.ok(html.includes('3,000'), tpl + ' 应显示起价')
      assert.ok(/subject=/.test(html), tpl + ' 邮件应带主题')
    }
    const closed = generateArtistSiteHTML(
      { ...data, commissions: { ...data.commissions, open: false } },
      'gallery'
    )
    assert.ok(closed.includes('暂不接单'), '关闭接单后应改为暂不接单')
    const empty = generateArtistSiteHTML(
      {
        ...data,
        commissions: { open: false, scope: '', process: '', leadTime: '', priceFrom: '' },
      },
      'gallery'
    )
    assert.ok(!empty.includes('id="commissions"'), '四项全空时不应渲染空区块')
  })
})
