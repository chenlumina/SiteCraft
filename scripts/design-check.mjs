/**
 * 版式度量门（design gate）v2：面向 12 套版式的通用审计，不依赖某套的类名。
 *
 * 断言的六件事（都是可量化、与审美无关的硬指标）：
 * 1. 横向溢出：390 / 1440 两档都不能出现滚动条。
 * 2. 主标题不出界：h1 左右都不能越过视口。
 * 3. 字号阶梯：主标题在桌面 ≥60px、移动 ≥32px（排版驱动页面的下限）。
 * 4. 最差正文对比度：遍历所有叶子文本节点，跳到最近的不透明背景算对比度，
 *    按 WCAG 大/小字阈值判定，报出最差的那个元素。aria-hidden 的装饰文字不计。
 * 5. CSS 能力探针（直接读产物里的 <style>）：prefers-reduced-motion / :focus-visible / @keyframes。
 * 6. 交互目标尺寸：移动端每个可见链接的可点高度 ≥ 28px（触摸下限的宽松值）。
 *
 * 用法：node scripts/design-check.mjs [template...]   缺省跑全部 12 套
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// 直接渲染源码（同一份 generateSiteHTML），不读黄金快照：
// 快照可能过期，拿过期产物量版面会把门变成自欺欺人的绿灯。
import { generateSiteHTML } from '../lib/generators/html-generator'
import { createSampleData } from '../lib/sample-data'
import { generateArtistSiteHTML } from '../lib/generators/artist/html-generator'
import { createGallerySampleData } from '../lib/artist/sample-gallery'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(root, 'screenshots')
const htmlDir = path.join(root, '.design-out')
fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(htmlDir, { recursive: true })

const ALL = ['minimal', 'tech', 'creative', 'professional', 'ink', 'brutal', 'aurora', 'editorial', 'gold', 'vapor', 'swiss', 'kraft', 'metro', 'gallery', 'exhibition']

/**
 * 每个被检查的对象：标签 + 产物 HTML。
 * gallery 走的是艺术专用渲染器，但视觉规矩和 13 套一致——
 * 所以它必须吃同一批断言，否则"导出引用外部路径"这种漏网还会再犯。
 */
function buildCases() {
  const ARTIST_LABELS = ['gallery', 'exhibition']
  const cases = ALL.filter((name) => !ARTIST_LABELS.includes(name)).map((name) => ({
    label: name,
    html: generateSiteHTML(createSampleData(), name),
  }))
  cases.push({ label: 'gallery', html: generateArtistSiteHTML(createGallerySampleData(), 'gallery') })
  cases.push({ label: 'exhibition', html: generateArtistSiteHTML(createGallerySampleData(), 'exhibition') })
  return cases
}
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ALL

const results = []
const check = (tpl, name, pass, detail) => {
  results.push({ tpl, name, pass, detail })
  process.stdout.write((pass ? 'PASS  ' : 'FAIL  ') + name.padEnd(34) + (detail ? detail : '') + '\n')
}

// Windows 可能没有 %ProgramFiles% 环境变量（playwright 靠它推路径），显式给候选；
// Linux/macOS 候选让同一个门能在 CI 与队友机器上直接跑。
const exeCandidates = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]
const exe = exeCandidates.find((p) => p && fs.existsSync(p))
const browser = await chromium.launch(exe ? { executablePath: exe, headless: true } : { channel: 'msedge', headless: true })

const CASES = buildCases()
const selected = CASES.filter((c) => targets.includes(c.label))
for (const { label: tpl, html } of selected) {
  process.stdout.write('\n--- ' + tpl + ' ---\n')
  const file = path.join(htmlDir, tpl + '.html')
  fs.writeFileSync(file, html, 'utf8')

  // 5. CSS 能力探针
  const css = (html.match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1]
  check(tpl, tpl + ' 有 prefers-reduced-motion', /prefers-reduced-motion/.test(css))
  check(tpl, tpl + ' 有 :focus-visible', /:focus-visible/.test(css))

  for (const vp of [{ w: 1440, h: 900, tag: 'desktop' }, { w: 390, h: 844, tag: 'mobile' }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, locale: 'zh-CN' })
    const page = await ctx.newPage()
    await page.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'load' })
    await page.waitForTimeout(1100)

    const m = await page.evaluate(() => {
      const parse = (c) => {
        const n = String(c).match(/[\d.]+/g)
        return n ? n.slice(0, 3).map(Number) : null
      }
      const lum = (rgb) => {
        const c = rgb.map((v) => {
          const x = v / 255
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
      }
      const ratio = (a, b) => {
        const pair = [lum(a), lum(b)].sort((p, q) => q - p)
        return (pair[0] + 0.05) / (pair[1] + 0.05)
      }
      // 有效背景：优先不透明纯色；遇到渐变（bgColor 透明）取渐变里的第一个颜色近似，
      // 否则会把"黑字压渐变按钮"误判成"黑字压深色页面"（对比度 1.05 的假阳性）
      const effBg = (el) => {
        let n = el
        while (n && n !== document.documentElement) {
          const cs = getComputedStyle(n)
          const bg = cs.backgroundColor
          const p = parse(bg)
          const alpha = String(bg).match(/rgba?\([^)]*,\s*([\d.]+)\)/)
          if (p && (!alpha || Number(alpha[1]) > 0.9)) return p
          const img = cs.backgroundImage
          if (img && img !== 'none' && /gradient/.test(img)) {
            const m = img.match(/rgb\(([^)]+)\)/) || img.match(/#([0-9a-f]{6})/i)
            if (m) {
              if (m[1].includes(',')) return parse(m[1])
              const h = m[1]
              return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
            }
          }
          n = n.parentElement
        }
        return [255, 255, 255]
      }
      const hidden = (el) => {
        let n = el
        while (n) {
          if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return true
          n = n.parentElement
        }
        return false
      }

      const root = document.querySelector('.site-root')
      const h1 = document.querySelector('h1')
      const h1r = h1 && h1.getBoundingClientRect()

      let worst = null
      const leaves = Array.from(document.querySelectorAll('.site-root *')).filter(
        (el) => el.children.length === 0 && (el.textContent || '').trim().length > 1 && !hidden(el)
      )
      for (const el of leaves) {
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none') continue
        const r = el.getBoundingClientRect()
        if (r.width < 2 || r.height < 2) continue
        const fg = parse(cs.color)
        if (!fg) continue
        const cr = ratio(fg, effBg(el))
        const size = parseFloat(cs.fontSize)
        const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700
        const large = size >= 24 || (size >= 18.66 && bold)
        const need = large ? 3 : 4.5
        if (!worst || cr - need < worst.cr - worst.need) {
          worst = { cr: Math.round(cr * 100) / 100, need, text: (el.textContent || '').trim().slice(0, 14), size, tag: el.tagName.toLowerCase(), cls: el.className }
        }
      }

      // 只量"块状"交互目标：WCAG 2.5.8 对正文内联链接有明确豁免，
      // 把段落里的行内链当按钮量会制造假阳性
      const famSet = new Set(
        Array.from(document.querySelectorAll('.site-root *'))
          .map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim())
          .filter(Boolean)
      )
      const firstLink = document.querySelector('.site-root a')
      const linkDur = firstLink ? getComputedStyle(firstLink).transitionDuration : '0s'
      const h1Anim = h1 ? getComputedStyle(h1).animationName : 'none'

      const links = Array.from(document.querySelectorAll('.site-root a')).filter((a) => {
        const r = a.getBoundingClientRect()
        if (r.width <= 0 || r.height <= 0) return false
        const cs = getComputedStyle(a)
        const boxish =
          cs.display !== 'inline' ||
          parseFloat(cs.paddingTop) > 0 ||
          cs.borderTopWidth !== '0px' ||
          cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
        return boxish
      })
      const minTap = links.length ? Math.min(...links.map((a) => a.getBoundingClientRect().height)) : 99

      return {
        scrollW: document.scrollingElement.scrollWidth,
        innerW: window.innerWidth,
        h1Size: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
        h1Left: h1r ? h1r.left : null,
        h1Right: h1r ? h1r.right : null,
        worst,
        minTap: Math.round(minTap * 10) / 10,
        famCount: famSet.size,
        famList: Array.from(famSet).join(' / '),
        h1Anim,
        linkDur,
        hasRoot: !!root,
      }
    })

    const label = tpl + ' / ' + vp.tag
    check(tpl, label + ' 无横向溢出', m.scrollW <= m.innerW + 1, m.scrollW + ' vs ' + m.innerW)
    check(
      tpl,
      label + ' 主标题不出界',
      m.h1Left !== null && m.h1Left >= -0.5 && m.h1Right <= m.innerW + 0.5,
      Number(m.h1Left).toFixed(1) + ' .. ' + Number(m.h1Right).toFixed(1)
    )
    check(tpl, label + ' 主标题字号', m.h1Size >= (vp.tag === 'desktop' ? 44 : 32), m.h1Size + 'px')
    if (vp.tag === 'desktop') {
      check(tpl, tpl + ' 字体家族 ≤3', m.famCount <= 3, m.famCount + ' 个（' + m.famList + '）')
      check(tpl, tpl + ' 标题有入场动画', m.h1Anim !== 'none', m.h1Anim)
      check(tpl, tpl + ' 交互元素有过渡', m.linkDur !== '0s', m.linkDur)
    }
    check(
      tpl,
      label + ' 正文对比度',
      m.worst && m.worst.cr >= m.worst.need,
      m.worst ? m.worst.cr + ' / 需 ' + m.worst.need + ' <' + m.worst.tag + '> "' + m.worst.text + '" ' + m.worst.size + 'px' : 'no text'
    )
    if (vp.tag === 'mobile') {
      check(tpl, label + ' 块状链接可点高度 ≥24', m.minTap >= 24, m.minTap + 'px')
    }

    await page.screenshot({ path: path.join(outDir, tpl + '-' + vp.tag + '.png'), fullPage: true })
    await ctx.close()
  }
}

await browser.close()
process.stdout.write('\n' + '='.repeat(66) + '\n')
const byTpl = {}
for (const r of results) {
  byTpl[r.tpl] = byTpl[r.tpl] || { pass: 0, fail: 0, names: [] }
  r.pass ? byTpl[r.tpl].pass++ : byTpl[r.tpl].fail++
  if (!r.pass) byTpl[r.tpl].names.push(r.name.replace(r.tpl + ' / ', ''))
}
for (const [tpl, v] of Object.entries(byTpl)) {
  process.stdout.write(
    tpl.padEnd(13) + String(v.pass).padStart(2) + ' 通过 / ' + String(v.fail).padStart(2) + ' 失败   ' + v.names.join('、') + '\n'
  )
}
const failed = results.filter((r) => !r.pass)
process.stdout.write('='.repeat(66) + '\n合计 ' + (results.length - failed.length) + '/' + results.length + ' 通过\n')
process.exit(failed.length ? 1 : 0)
