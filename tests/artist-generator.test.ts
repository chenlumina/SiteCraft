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

const snapshotDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__snapshots__')

describe('Gallery 真实渲染器', () => {
  it('输出与黄金快照一致', () => {
    const expected = readFileSync(path.join(snapshotDir, 'artist-gallery.html'), 'utf-8')
    assert.equal(generateArtistSiteHTML(createGallerySampleData()), expected)
  })

  it('重点作品优先，完整作品与联系信息出现', () => {
    const { body } = renderGalleryFragment(createGallerySampleData())
    assert.ok(body.indexOf('城市呼吸 No.04') < body.indexOf('植物的间隙'))
    assert.ok(body.includes('全部作品'))
    assert.ok(body.includes('artist@example.com'))
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
    assert.ok(html.includes('120 × 90 cm'), '作品尺寸应出现在产物中')
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
    assert.ok(html.includes('120 × 90 cm'), '尺寸应出现在展览版式')
    assert.equal((html.match(/<script/g) || []).length, 0, '展览版式同样零脚本')
    assert.ok(!html.includes('/images/artworks'), '展览版式同样自包含')
  })

  it('两套艺术版式共用同一份数据，产物结构不同', () => {
    const data = createGallerySampleData()
    const gallery = generateArtistSiteHTML(data, 'gallery')
    const exhibition = generateArtistSiteHTML(data, 'exhibition')
    assert.notEqual(gallery, exhibition)
    assert.ok(gallery.includes('artist-gallery'))
    assert.ok(exhibition.includes('artist-exhibition'))
  })
})
