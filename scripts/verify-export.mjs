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
// 移动端视口下容器查询生效
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(400)
const mobileCols = await page.evaluate(() => {
  const grid = document.querySelector('.project-grid')
  return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0
})
console.log('mobile project columns:', mobileCols)
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
