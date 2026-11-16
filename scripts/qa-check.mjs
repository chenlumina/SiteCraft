// 质检脚本（临时）：编辑器纸面改版截图（桌面 + 移动预览 + 手机设备模式 + portal 弹窗）
import { chromium } from 'playwright-core'

const b = await chromium.launch({ channel: 'msedge', headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
const errs = []
p.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text())
})
p.on('pageerror', (e) => errs.push(String(e)))

await p.goto('http://localhost:3000/editor?template=ink', { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForSelector('.site-root', { timeout: 20000 })
await p.waitForTimeout(1200)
await p.screenshot({ path: 'screenshots/qa-editor.png' })

// 手机设备模式
await p.click('[aria-label="移动端预览"]')
await p.waitForTimeout(600)
await p.screenshot({ path: 'screenshots/qa-editor-mobile.png' })
await p.click('[aria-label="桌面预览"]')

// portal 弹窗（Radix portal 渲染在 body，需验证纸面令牌穿透）：先制造 dirty 再新建
await p.fill('[aria-label="站点名称"]', '测试草稿')
await p.waitForTimeout(200)
await p.click('button:has-text("新建站点")')
await p.waitForSelector('[role="dialog"]', { timeout: 5000 })
await p.waitForTimeout(300)
await p.screenshot({ path: 'screenshots/qa-editor-dialog.png' })
await p.click('[role="dialog"] button:has-text("继续编辑")')

// 移动端整页溢出检查
await p.setViewportSize({ width: 390, height: 844 })
await p.goto('http://localhost:3000/editor', { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(1000)
const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
process.stdout.write('mobile overflow px: ' + overflow + '\nconsole errors: ' + errs.length + (errs.length ? ' :: ' + errs.slice(0, 3).join(' | ') : '') + '\n')
await b.close()
