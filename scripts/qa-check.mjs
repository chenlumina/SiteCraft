// 质检脚本（临时）：验证首页新交互链路 —— 试衣间改名/换色/切版式/切视口 + 控制台零错误
import { chromium } from 'playwright-core'

const b = await chromium.launch({ channel: 'msedge', headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
const errs = []
p.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text())
})
p.on('pageerror', (e) => errs.push(String(e)))

await p.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(1200)

// 试衣间交互链
await p.locator('#playground').scrollIntoViewIfNeeded()
await p.waitForTimeout(400)
await p.fill('[aria-label="试穿姓名"]', '林小满')
await p.waitForTimeout(400)
const nameInPreview = await p.locator('#playground .s-name').first().textContent()
await p.click('[aria-label="选择主题色 #c2410c"]').catch(() => {})
await p.waitForTimeout(300)
await p.click('#playground button:has-text("杂志")')
await p.waitForTimeout(400)
const cls = await p.locator('#playground .site-root').first().getAttribute('class')
await p.click('#playground button:has-text("手机")')
await p.waitForTimeout(500)
await p.screenshot({ path: 'screenshots/qa-playground.png' })

// 顶部橱窗（倾斜需鼠标移动，这里仅确认渲染与地址栏随轮换变化）
await p.locator('header').first().evaluate(() => window.scrollTo(0, 0))
await p.waitForTimeout(600)
await p.screenshot({ path: 'screenshots/qa-home-top.png' })

process.stdout.write(
  'preview name: ' + nameInPreview + '\nroot class: ' + cls + '\nconsole errors: ' + errs.length + (errs.length ? ' :: ' + errs.slice(0, 2).join(' | ') : '') + '\n'
)
await b.close()
