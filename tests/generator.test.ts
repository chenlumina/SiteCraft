/**
 * 生成器行为特征测试（重构安全网）。
 * 断言的是「用户可见产物」：转义是否挡住注入、空区块是否消失、
 * 主题色是否派生正确、八套模板完整 HTML 是否与黄金快照逐字节一致。
 * 黄金快照由 scripts/snapshot-generator.mjs 在重构前生成，重构后必须不变。
 * 运行：pnpm test:unit（Node 内置测试运行器 + tsx，零新增依赖）。
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateSiteHTML, renderSiteFragment } from '../lib/generators/html-generator'
import { createSampleData } from '../lib/sample-data'
import type { SiteData, TemplateName } from '../types'

const TEMPLATES: TemplateName[] = [
  'minimal',
  'tech',
  'creative',
  'professional',
  'ink',
  'brutal',
  'aurora',
  'editorial',
]
const snapshotDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__snapshots__')

function emptySite(): SiteData {
  const data = createSampleData()
  return { ...data, skills: [], projects: [], experience: [] }
}

describe('黄金快照：八套模板完整 HTML 逐字节一致', () => {
  for (const template of TEMPLATES) {
    it(`${template} 模板输出与重构前快照一致`, () => {
      const expected = readFileSync(path.join(snapshotDir, `${template}.html`), 'utf-8')
      const actual = generateSiteHTML(createSampleData(), template)
      if (actual !== expected) {
        let i = 0
        while (i < Math.min(actual.length, expected.length) && actual[i] === expected[i]) i += 1
        assert.fail(
          `首个差异 @${i}（长度 ${actual.length} vs ${expected.length}）\n` +
            `actual:   ${JSON.stringify(actual.slice(Math.max(0, i - 60), i + 60))}\n` +
            `expected: ${JSON.stringify(expected.slice(Math.max(0, i - 60), i + 60))}`
        )
      }
    })
  }
})

describe('XSS 防护：用户输入不能逃逸出标签与属性', () => {
  it('姓名中的 HTML 被转义而不是被渲染', () => {
    const data = { ...createSampleData(), name: '<img src=x onerror=alert(1)>' }
    const html = generateSiteHTML(data, 'minimal')
    assert.ok(!html.includes('<img src=x'))
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  })

  it('javascript: 协议的社交链接被整体丢弃', () => {
    const data = createSampleData()
    data.socials.github = 'javascript:alert(1)'
    const html = generateSiteHTML(data, 'tech')
    assert.ok(!html.includes('javascript:'))
  })

  it('简介中的引号被转义，无法逃出 meta 属性', () => {
    const data = { ...createSampleData(), bio: '简介" onload="alert(1)' }
    const html = generateSiteHTML(data, 'minimal')
    assert.ok(html.includes('&quot; onload=&quot;alert(1)'))
    assert.ok(!html.includes('" onload="'))
  })
})

describe('动态区块：没有内容的区块与锚点不出现', () => {
  it('技能/项目/经历全空时只保留联系区块', () => {
    const { body } = renderSiteFragment(emptySite(), 'minimal')
    assert.ok(!body.includes('id="skills"'))
    assert.ok(!body.includes('id="projects"'))
    assert.ok(!body.includes('id="experience"'))
    assert.ok(body.includes('id="contact"'))
    assert.ok(body.includes('01 / CONTACT'))
  })

  it('只有项目时导航编号从 01 开始且不含技能锚点', () => {
    const data = emptySite()
    data.projects = createSampleData().projects.slice(0, 1)
    const { body } = renderSiteFragment(data, 'creative')
    assert.ok(body.includes('01 / PROJECTS'))
    assert.ok(body.includes('02 / CONTACT'))
    assert.ok(!body.includes('href="#skills"'))
  })
})

describe('主题色派生', () => {
  it('自定义主色覆盖模板默认色并派生渐变搭档色', () => {
    const data = { ...createSampleData(), theme: { primaryColor: '#ff0000' } }
    const { css } = renderSiteFragment(data, 'minimal')
    assert.ok(css.includes('--sp:#ff0000'))
    // 基线行为为色相 -18°（由 #22d3ee→#2244ee 实证）。红色 h=0 → h=0.95：
    // R: t=0.95+1/3→1.283→0.283，落在 [1/6,1/2) 返回 q=1 → 255
    // G: t=0.95，≥2/3 返回 p=0 → 0
    // B: t=0.95-1/3=0.6167，落在 [1/2,2/3) 返回 (2/3-0.6167)*6=0.3 → round(76.5)=76=0x4c
    // 即 #ff004c。
    assert.ok(css.includes('--sp2:#ff004c'))
  })

  it('非法颜色回退模板默认色', () => {
    const data = { ...createSampleData(), theme: { primaryColor: 'red;}' } }
    const { css } = renderSiteFragment(data, 'tech')
    assert.ok(css.includes('--sp:#22d3ee'))
    assert.ok(!css.includes('red;}'))
  })

  it('浅色主色上的按钮文字用深色保证对比度', () => {
    const data = { ...createSampleData(), theme: { primaryColor: '#ffffff' } }
    const { css } = renderSiteFragment(data, 'minimal')
    assert.ok(css.includes('--on-sp:#0b1220'))
  })
})

describe('导出单文件契约', () => {
  it('产物零脚本、样式内联、默认头像内联为 data URI', () => {
    const html = generateSiteHTML(createSampleData(), 'professional')
    assert.ok(html.startsWith('<!doctype html>'))
    assert.ok(!html.includes('<script'))
    assert.ok(html.includes('<style>'))
    assert.ok(html.includes('data:image/svg+xml,'))
    assert.ok(!html.includes('src="/images/avatar-default.svg"'))
  })
})