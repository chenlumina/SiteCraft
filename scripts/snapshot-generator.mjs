/**
 * 黄金快照录制脚本（重构前运行一次）：
 * 用示例数据渲染十二套模板的完整 HTML，写入 tests/__snapshots__/。
 * 页脚年份取运行当年，快照与测试在同一年份内逐字节可比；
 * 跨年后重录一次即可（node --import tsx scripts/snapshot-generator.mjs）。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { generateSiteHTML } from '../lib/generators/html-generator'
import { createSampleData } from '../lib/sample-data'
import { generateArtistSiteHTML } from '../lib/generators/artist/html-generator'
import { createGallerySampleData } from '../lib/artist/sample-gallery'

const outDir = path.resolve('tests/__snapshots__')
mkdirSync(outDir, { recursive: true })
for (const template of [
  'minimal',
  'tech',
  'creative',
  'professional',
  'ink',
  'brutal',
  'aurora',
  'editorial',
  'gold',
  'vapor',
  'swiss',
  'kraft',
  'metro',
]) {
  const html = generateSiteHTML(createSampleData(), template)
  writeFileSync(path.join(outDir, `${template}.html`), html, 'utf-8')
  process.stdout.write(`snapshot: ${template}.html (${html.length} chars)\n`)
}

const artistGallery = generateArtistSiteHTML(createGallerySampleData(), 'gallery')
writeFileSync(path.join(outDir, 'artist-gallery.html'), artistGallery, 'utf-8')
process.stdout.write(`snapshot: artist-gallery.html (${artistGallery.length} chars)\n`)

const artistExhibition = generateArtistSiteHTML(createGallerySampleData(), 'exhibition')
writeFileSync(path.join(outDir, 'artist-exhibition.html'), artistExhibition, 'utf-8')
process.stdout.write(`snapshot: artist-exhibition.html (${artistExhibition.length} chars)\n`)

const artistContact = generateArtistSiteHTML(createGallerySampleData(), 'contact')
writeFileSync(path.join(outDir, 'artist-contact.html'), artistContact, 'utf-8')
process.stdout.write(`snapshot: artist-contact.html (${artistContact.length} chars)\n`)

const artistIndex = generateArtistSiteHTML(createGallerySampleData(), 'index')
writeFileSync(path.join(outDir, 'artist-index.html'), artistIndex, 'utf-8')
process.stdout.write(`snapshot: artist-index.html (${artistIndex.length} chars)\n`)

const artistStudio = generateArtistSiteHTML(createGallerySampleData(), 'studio')
writeFileSync(path.join(outDir, 'artist-studio.html'), artistStudio, 'utf-8')
process.stdout.write(`snapshot: artist-studio.html (${artistStudio.length} chars)\n`)

const artistScroll = generateArtistSiteHTML(createGallerySampleData(), 'scroll')
writeFileSync(path.join(outDir, 'artist-scroll.html'), artistScroll, 'utf-8')
process.stdout.write(`snapshot: artist-scroll.html (${artistScroll.length} chars)\n`)

const artistPoster = generateArtistSiteHTML(createGallerySampleData(), 'poster')
writeFileSync(path.join(outDir, 'artist-poster.html'), artistPoster, 'utf-8')
process.stdout.write(`snapshot: artist-poster.html (${artistPoster.length} chars)\n`)

const exhibitionHtml = generateArtistSiteHTML(createGallerySampleData(), 'exhibition')
writeFileSync(path.join(outDir, 'artist-exhibition.html'), exhibitionHtml, 'utf-8')
process.stdout.write(`snapshot: artist-exhibition.html (${exhibitionHtml.length} chars)\n`)