// 质检脚本（临时）：排查顶部区域渲染状态
import { chromium } from 'playwright-core'

const b = await chromium.launch({ channel: 'msedge', headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
const errs = []
p.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text())
})
p.on('pageerror', (e) => errs.push(String(e)))

await p.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(1500)
await p.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
})
await p.waitForTimeout(600)
const info = await p.evaluate(() => {
  const root = document.querySelector('.paper')
  const body = document.body
  return {
    scrollY: window.scrollY,
    rootClass: root?.className,
    rootBg: root ? getComputedStyle(root).backgroundColor : null,
    bodyBg: getComputedStyle(body).backgroundColor,
    bodyChildren: body.children.length,
    heroVisible: !!document.querySelector('h1'),
    heroText: document.querySelector('h1')?.textContent?.slice(0, 30) ?? null,
    heroRect: document.querySelector('h1')?.getBoundingClientRect(),
  }
})
process.stdout.write(JSON.stringify(info, null, 1) + '\n')
await p.screenshot({ path: 'screenshots/qa-top2.png' })
process.stdout.write('console errors: ' + errs.length + '\n')
await b.close()
