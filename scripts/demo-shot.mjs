// 临时截图：用本机 Edge 无头渲染演示网页，输出桌面整页 + 移动版式两张图。
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const file = path.resolve('demo/千问工作助理-极简模板.html')
const url = pathToFileURL(file).href
const browser = await chromium.launch({ channel: 'msedge', headless: true })

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await desktop.goto(url, { waitUntil: 'networkidle' })
await desktop.screenshot({ path: 'demo/预览-桌面整页.png', fullPage: true })

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mobile.goto(url, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'demo/预览-移动版式.png', fullPage: false })

await browser.close()
process.stdout.write('screenshots done\n')