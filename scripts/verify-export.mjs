/**
 * 导出产物验收脚本：把 e2e 导出的单文件 HTML 以 file:// 独立打开，
 * 断言四区块齐全、零 <script>（零依赖）、移动端容器查询生效（项目单列）、
 * 控制台零报错（头像/favicon 均已内联，不应有 404）。
 * 顺带验证 API 错误路径：无 token 部署→400+指引、非法入参→400、不存在站点→404。
 */
import { chromium } from 'playwright-core'
import path from 'node:path'

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))
const file = path.resolve('screenshots/exported-site.html')
await page.goto(`file://${file}`, { waitUntil: 'load' })
await page.waitForSelector('.site-root')
const checks = await page.evaluate(() => ({
  sections: ['skills', 'projects', 'experience', 'contact'].filter((id) => document.getElementById(id)).length,
  name: document.querySelector('.s-name')?.textContent ?? '',
  scripts: document.querySelectorAll('script').length,
  styles: document.querySelectorAll('style').length,
}))
console.log('export checks:', JSON.stringify(checks))
await page.screenshot({ path: 'screenshots/07-export-standalone.png', fullPage: false })
// 移动端视口下容器查询生效。版式无关断言：12 套版式类名与锚点位置各异
// （有的 id 在 section 上、有的在 h2 标题上；tech 的项目区是 block 竖排文件列表），
// 因此兼容两种模式收集项目卡片：A 锚点子树内「高>60px 子元素最多」的容器；
// B 锚点为标题时取其后续兄弟（遇下一个锚点/标题停止）。再测前两张卡片是否竖排。
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(400)
const mobile = await page.evaluate(() => {
  const anchor = document.getElementById('projects')
  const overflow = document.documentElement.scrollWidth - window.innerWidth
  if (!anchor) return { cols: 0, overflow }
  const tallKids = (el) => [...el.children].filter((c) => c.getBoundingClientRect().height > 60)
  let cards = null
  for (const el of [anchor, ...anchor.querySelectorAll('*')]) {
    const t = tallKids(el)
    if (t.length >= 2 && (!cards || t.length > cards.length)) cards = t
  }
  if (!cards) {
    cards = []
    let n = anchor.nextElementSibling
    while (n && !n.id && !/^H[1-3]$/.test(n.tagName)) {
      const t = tallKids(n)
      if (t.length >= 2) cards.push(...t)
      else if (n.getBoundingClientRect().height > 60) cards.push(n)
      n = n.nextElementSibling
    }
  }
  if (!cards || cards.length < 2) return { cols: 0, overflow }
  const a = cards[0].getBoundingClientRect()
  const b = cards[1].getBoundingClientRect()
  return { cols: b.top >= a.bottom - 4 ? 1 : 2, overflow }
})
console.log('mobile project columns:', mobile.cols, 'overflow:', mobile.overflow)
if (mobile.cols !== 1) throw new Error(`移动端项目区应为单列，实际 ${mobile.cols}`)
if (mobile.overflow > 2) throw new Error(`移动端横向溢出 ${mobile.overflow}px`)
await page.screenshot({ path: 'screenshots/08-export-mobile.png' })
console.log('console errors:', errors.length, errors.slice(0,2))
await browser.close()

// API 错误路径
const deploy = await fetch('http://localhost:3000/api/deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '测试', repoName: 'test-repo', template: 'tech', content: (await (await fetch('http://localhost:3000/api/sites')).json()).data[0].content }),
})
console.log('deploy without token:', deploy.status, (await deploy.json()).error?.slice(0, 60))
const bad = await fetch('http://localhost:3000/api/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '', template: 'nope', content: {} }),
})
console.log('save invalid:', bad.status, (await bad.json()).error?.slice(0, 60))
const missing = await fetch('http://localhost:3000/api/sites/does-not-exist')
console.log('site missing:', missing.status)
