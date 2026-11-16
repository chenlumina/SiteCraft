/**
 * 黄金快照录制脚本（重构前运行一次）：
 * 用示例数据渲染八套模板的完整 HTML，写入 tests/__snapshots__/。
 * 页脚年份取运行当年，快照与测试在同一年份内逐字节可比；
 * 跨年后重录一次即可（node --import tsx scripts/snapshot-generator.mjs）。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { generateSiteHTML } from '../lib/generators/html-generator'
import { createSampleData } from '../lib/sample-data'

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
]) {
  const html = generateSiteHTML(createSampleData(), template)
  writeFileSync(path.join(outDir, `${template}.html`), html, 'utf-8')
  process.stdout.write(`snapshot: ${template}.html (${html.length} chars)\n`)
}