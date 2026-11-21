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

const artistHtml = generateArtistSiteHTML(createGallerySampleData(), 'gallery')
writeFileSync(path.join(outDir, 'artist-gallery.html'), artistHtml, 'utf-8')
process.stdout.write(`snapshot: artist-gallery.html (${artistHtml.length} chars)\n`)

const exhibitionHtml = generateArtistSiteHTML(createGallerySampleData(), 'exhibition')
writeFileSync(path.join(outDir, 'artist-exhibition.html'), exhibitionHtml, 'utf-8')
process.stdout.write(`snapshot: artist-exhibition.html (${exhibitionHtml.length} chars)\n`)