/**
 * 端到端验证脚本（pnpm test:e2e，需先 pnpm start 或 dev 启动服务）。
 * 用 playwright-core 驱动本机 Edge 的 headless 模式（不弹窗、不抢焦点），
 * 覆盖：首页渲染/搜索、编辑器完整链路（改资料→换模板→移动预览→加技能/项目→
 * 换主题色→保存→导出）、全屏预览、删除+撤销、移动端视口无横向溢出、控制台零错误。
 * 每个 step 独立 try/catch：单项失败不中断后续检查，最后汇总退出码供 CI 使用。
 * 结尾清理本脚本产生的测试站点，保证数据库回到种子状态。
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'

// 允许用 E2E_BASE 指向非 3000 端口（例如 3000 被占用时另起的验证服务）
const BASE = process.env.E2E_BASE || 'http://localhost:3000'
const OUT = 'screenshots'
fs.mkdirSync(OUT, { recursive: true })

const results = []
// 收集控制台 error 与未捕获异常；DevTools 提示类噪音在最后过滤掉
const consoleErrors = []
function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  process.stdout.write(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}\n`)
}

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
  locale: 'zh-CN',
})
// 首页现在有身份门禁：主上下文预置开发者身份，直达开发者首页（欢迎页流程单独用新上下文测）
await context.addInitScript(() => {
  try {
    localStorage.setItem('sitecraft-profile', JSON.stringify({ name: '张亮', archetype: 'developer' }))
  } catch {}
})
const page = await context.newPage()
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(String(err)))

async function step(name, fn) {
  try {
    await fn()
    record(name, true)
  } catch (err) {
    record(name, false, String(err).slice(0, 220))
  }
}

// ---------- 首页 ----------
await step('首页加载与关键内容', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  // 首屏标语每 4.8s 中英轮换：冷启动编译可能跨过首轮轮换，断言需兼容两种语言
  await page.waitForSelector('h1')
  const headline = (await page.locator('h1').first().textContent()) || ''
  if (!/把你自己|DEPLOY/.test(headline)) throw new Error(`首屏标语异常: ${headline.slice(0, 40)}`)
  // 开发者样册 = 13 套开发者版式（艺术版式只在艺术首页陈列，不再混排）
  const cards = await page.locator('#templates [data-template-row]').count()
  if (cards !== 13) throw new Error(`样册索引行数 ${cards} != 13`)
  await page.waitForSelector('#sites article')
  const sites = await page.locator('#sites article').count()
  if (sites < 2) throw new Error(`种子站点数量 ${sites} < 2`)
  const showcaseBox = await page.locator('#templates').boundingBox()
  if (!showcaseBox || showcaseBox.width > 1440) throw new Error('模板区宽度溢出')
})
// 整页截图前滚到底再回顶：触发 IntersectionObserver 的滚动显现，
// 否则 fullPage 截图不经过滚动，below-the-fold 区块会停在隐藏态。
// 停留/回顶后的等待需覆盖「最大阶梯延迟(11*80ms)+过渡时长(700ms)」，
// 否则最后一张卡片会被拍在半透明中间态。
await page.evaluate(async () => {
  window.scrollTo(0, document.body.scrollHeight)
  await new Promise((r) => setTimeout(r, 900))
  window.scrollTo(0, 0)
})
await page.waitForTimeout(1300)
await page.screenshot({ path: `${OUT}/01-home.png`, fullPage: true })

// 欢迎页登记主旅程（独立上下文，无预置身份）：移动端首屏可达、进入首页回顶、埋点触发
await step('首次登记流程', async () => {
  const wctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' })
  const wp = await wctx.newPage()
  await wp.goto(BASE, { waitUntil: 'networkidle' })
  await wp.waitForSelector('text=先认识一下')
  const nameBox = await wp.locator('#welcome-name').boundingBox()
  if (!nameBox) throw new Error('姓名输入框缺失')
  if (nameBox.y > 844) throw new Error(`移动端首屏看不到姓名输入框: y=${Math.round(nameBox.y)}`)
  await wp.fill('#welcome-name', '张亮')
  await wp.click('[role="radio"]:has-text("开发人员")')
  await wp.click('button[type="submit"]')
  await wp.getByRole('button', { name: /进入我的首页/ }).click()
  await wp.waitForSelector('[data-workbench-strip]')
  await wp.waitForTimeout(400)
  const after = await wp.evaluate(() => ({
    scrollY: window.scrollY,
    events: (window.__sitecraftEvents || []).map((e) => e.event),
  }))
  if (after.scrollY > 2) throw new Error(`进入首页未回到顶部: scrollY=${after.scrollY}`)
  if (!after.events.includes('registration_complete')) throw new Error('缺少 registration_complete 埋点')
  await wctx.close()
})

await step('首页 API 数据', async () => {
  const templates = await page.evaluate(async () => {
    const res = await fetch('/api/templates')
    return res.json()
  })
  if (!templates.success || templates.data.length !== 13) throw new Error('templates API 异常')
  const sites = await page.evaluate(async () => {
    const res = await fetch('/api/sites')
    return res.json()
  })
  if (!sites.success || sites.data.length < 2) throw new Error('sites API 异常')
})

await step('首页搜索过滤', async () => {
  await page.fill('input[aria-label="搜索站点"]', '求职')
  await page.waitForTimeout(300)
  const count = await page.locator('#sites article').count()
  if (count !== 1) throw new Error(`搜索后站点数 ${count} != 1`)
  await page.fill('input[aria-label="搜索站点"]', '')
  await page.waitForTimeout(300)
})

// ---------- 编辑器 ----------
await step('编辑器加载与实时预览', async () => {
  await page.goto(`${BASE}/editor`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.site-root', { timeout: 15000 })
  await page.waitForSelector('#field-name')
})
await page.screenshot({ path: `${OUT}/02-editor.png` })

await step('编辑姓名 → 预览实时更新', async () => {
  await page.fill('#field-name', '测试姓名')
  await page.waitForTimeout(500)
  const name = await page.locator('.site-name, .s-name').first().textContent()
  if (!name?.includes('测试姓名')) throw new Error(`预览姓名未更新: ${name}`)
})

await step('切换模板 → tech 生效', async () => {
  await page.click('button[aria-label="选择模板"]')
  await page.click('[role="option"]:has-text("极客 Tech")')
  await page.waitForSelector('.site-tech', { timeout: 5000 })
})

await step('移动端预览切换', async () => {
  await page.click('button[aria-label="移动端预览"]')
  await page.waitForTimeout(600)
  const root = page.locator('.site-root').first()
  const box = await root.boundingBox()
  if (!box || box.width > 420) throw new Error(`移动预览宽度异常: ${box?.width}`)
})
await page.screenshot({ path: `${OUT}/03-editor-mobile-preview.png` })

// 体检与分享卡：本地纯函数/Canvas，验证清单渲染与 PNG 下载
await step('站点体检与分享卡片', async () => {
  await page.getByRole('button', { name: /体检/ }).click()
  await page.waitForSelector('[data-checkup-item]')
  const itemCount = await page.locator('[data-checkup-item]').count()
  const score = await page.locator('[data-checkup-score]').innerText()
  if (itemCount < 8) throw new Error(`体检项过少: ${itemCount}`)
  if (!/通过 \d+ \/ \d+/.test(score)) throw new Error(`体检评分异常: ${score}`)
  await page.getByRole('tab', { name: '分享卡片' }).click()
  await page.waitForSelector('[data-share-preview]')
  await page.fill('[data-share-url]', 'https://example.github.io/demo')
  await page.waitForTimeout(900)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /下载分享卡/ }).click()
  const file = await downloadPromise
  if (!file.suggestedFilename().endsWith('.png')) throw new Error('分享卡文件名异常')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
})

await step('添加技能', async () => {
  await page.click('button[aria-label="桌面预览"]')
  await page.click('[role="tab"][aria-label="技能"]')
  const before = await page.locator('aside ul li').count()
  await page.click('button:has-text("添加技能")')
  await page.waitForTimeout(300)
  const after = await page.locator('aside ul li').count()
  if (after !== before + 1) throw new Error(`技能数量 ${before} -> ${after}`)
})

await step('添加项目（对话框表单）', async () => {
  await page.click('[role="tab"][aria-label="项目"]')
  await page.click('button:has-text("添加项目（")')
  await page.waitForSelector('#project-name')
  await page.fill('#project-name', 'E2E 测试项目')
  await page.fill('#project-desc', '由自动化测试创建的项目')
  await page.fill('#project-tags', 'Test, E2E')
  await page.click('button:has-text("添加项目"):not(:has-text("（"))')
  await page.waitForSelector('text=E2E 测试项目', { timeout: 5000 })
})

await step('主题色切换', async () => {
  await page.click('[role="tab"][aria-label="主题"]')
  await page.click('button[aria-label="选择主题色 #f472b6"]')
  await page.waitForTimeout(400)
  const sp = await page.locator('.site-root').first().evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--sp').trim()
  )
  if (sp.toLowerCase() !== '#f472b6') throw new Error(`主题色未生效: ${sp}`)
})

await step('保存站点 → 数据库', async () => {
  await page.click('header button:has-text("保存")')
  await page.waitForSelector('[data-sonner-toast]:has-text("站点已保存")', { timeout: 8000 })
  const stored = await page.evaluate(() => localStorage.getItem('sitecraft-editor'))
  const parsed = JSON.parse(stored)
  if (!parsed.state.siteId) throw new Error('保存后未获得 siteId')
})

await step('导出 HTML 下载', async () => {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 8000 }),
    page.click('header button:has-text("导出 HTML")'),
  ])
  const path = `${OUT}/exported-site.html`
  await download.saveAs(path)
  const html = fs.readFileSync(path, 'utf-8')
  if (!html.includes('<!doctype html>') || !html.includes('测试姓名')) {
    throw new Error('导出内容不完整')
  }
  if (html.includes('<script')) throw new Error('导出 HTML 含脚本，应为零依赖静态页')
})

// ---------- 全屏预览 ----------
await step('全屏预览页', async () => {
  await page.goto(`${BASE}/preview`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.site-tech', { timeout: 10000 })
  const name = await page.locator('.s-name').first().textContent()
  if (!name?.includes('测试姓名')) throw new Error('预览页未读取编辑器状态')
})
await page.screenshot({ path: `${OUT}/04-preview-full.png`, fullPage: true })

// ---------- 首页删除 + 撤销 ----------
await step('删除站点并撤销', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('#sites article')
  const before = await page.locator('#sites article').count()
  const target = page.locator('#sites article', { hasText: '求职简历站' }).first()
  await target.locator('button[aria-label*="更多操作"]').click()
  await page.click('[role="menuitem"]:has-text("删除站点")')
  await page.click('[role="dialog"] button:has-text("确认删除")')
  await page.waitForTimeout(500)
  const mid = await page.locator('#sites article').count()
  if (mid !== before - 1) throw new Error(`删除未生效 ${before} -> ${mid}`)
  await page.click('[data-sonner-toast] button:has-text("撤销")')
  await page.waitForTimeout(500)
  const after = await page.locator('#sites article').count()
  if (after !== before) throw new Error(`撤销未恢复 ${mid} -> ${after}`)
})

// ---------- 移动端视口 ----------
await step('移动端首页布局', async () => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  )
  if (overflow > 2) throw new Error(`首页横向溢出 ${overflow}px`)
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight)
    await new Promise((r) => setTimeout(r, 900))
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(900)
})
await page.screenshot({ path: `${OUT}/05-home-mobile.png`, fullPage: true })

// 艺术首页完整性：七套版式、作品集站点板块、工作台条、页脚、无运行错误与横向溢出
await step('艺术首页完整性', async () => {
  const actx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
  await actx.addInitScript(() => {
    try {
      localStorage.setItem('sitecraft-profile', JSON.stringify({ name: '张亮', archetype: 'artist' }))
    } catch {}
  })
  const ap = await actx.newPage()
  const artistErrors = []
  ap.on('pageerror', (e) => artistErrors.push(String(e)))
  await ap.goto(BASE, { waitUntil: 'networkidle' })
  await ap.waitForSelector('#templates')
  const info = await ap.evaluate(() => ({
    rows: document.querySelectorAll('#templates [data-template-row]').length,
    title: document.querySelector('#templates h2')?.textContent || '',
    hasSites: !!document.querySelector('#sites'),
    hasStrip: !!document.querySelector('[data-workbench-strip]'),
    hasFooter: document.body.innerText.includes('本地运行，数据属于你'),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }))
  if (info.rows !== 7) throw new Error(`艺术样册行数 ${info.rows} != 7`)
  if (!info.title.includes('七套')) throw new Error(`艺术样册标题异常: ${info.title}`)
  if (!info.hasSites) throw new Error('缺少作品集站点板块')
  if (!info.hasStrip) throw new Error('缺少工作台提示条')
  if (!info.hasFooter) throw new Error('缺少统一页脚')
  if (info.overflow) throw new Error('艺术首页横向溢出')
  if (artistErrors.length) throw new Error(`艺术首页运行错误: ${artistErrors[0]}`)
  await actx.close()
})

await step('移动端编辑器布局', async () => {
  await page.goto(`${BASE}/editor`, { waitUntil: 'networkidle' })
  await page.waitForSelector('#field-name', { timeout: 15000 })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  )
  if (overflow > 2) throw new Error(`编辑器横向溢出 ${overflow}px`)
  await page.click('button:has-text("实时预览")')
  await page.waitForSelector('.site-root', { timeout: 8000 })
})
await page.screenshot({ path: `${OUT}/06-editor-mobile.png` })

// 两个编辑器分家后的回归：旧快照残留 artist 方向时，开发编辑器必须仍按「技能/项目/经历」渲染，
// 并由 persist 迁移 v3 把数据矫正回 developer（否则界面会变成「创作媒介/作品与系列」）。
await step('开发编辑器方向残留矫正', async () => {
  const ectx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
  await ectx.addInitScript(() => {
    try {
      localStorage.setItem('sitecraft-profile', JSON.stringify({ name: '张亮', archetype: 'developer' }))
    } catch {}
  })
  const ep = await ectx.newPage()
  await ep.goto(`${BASE}/editor`, { waitUntil: 'networkidle' })
  await ep.waitForSelector('#field-name', { timeout: 15000 })
  // 首次访问 persist 还没落盘，先改一次站点名把快照写进 localStorage，再伪造 artist 残留
  await ep.fill('input[aria-label="站点名称"]', '方向残留测试')
  await ep.waitForTimeout(300)
  const seeded = await ep.evaluate(() => {
    const raw = localStorage.getItem('sitecraft-editor')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    parsed.version = 2
    parsed.state.data.archetype = 'artist'
    localStorage.setItem('sitecraft-editor', JSON.stringify(parsed))
    return true
  })
  if (!seeded) throw new Error('未能种入旧版编辑器快照')
  await ep.reload({ waitUntil: 'networkidle' })
  await ep.waitForSelector('#field-name', { timeout: 15000 })
  const state = await ep.evaluate(() => {
    const parsed = JSON.parse(localStorage.getItem('sitecraft-editor'))
    return {
      version: parsed.version,
      archetype: parsed.state.data.archetype,
      labels: Array.from(document.querySelectorAll('[role="tab"]')).map((el) =>
        el.getAttribute('aria-label')
      ),
    }
  })
  if (state.version !== 3) throw new Error(`迁移后版本号 ${state.version} != 3`)
  if (state.archetype !== 'developer') throw new Error(`迁移后方向 ${state.archetype} != developer`)
  for (const label of ['资料', '技能', '项目', '经历', '主题']) {
    if (!state.labels.includes(label)) throw new Error(`缺少板块「${label}」: ${state.labels.join('/')}`)
  }
  if (state.labels.includes('创作媒介')) throw new Error(`仍渲染艺术方向词汇: ${state.labels.join('/')}`)
  await ectx.close()
})

// ---------- 清理测试数据 ----------
await step('清理 E2E 产生的测试站点', async () => {
  const res = await page.evaluate(async () => {
    const list = await fetch('/api/sites').then((r) => r.json())
    const targets = (list.data ?? []).filter((s) => s.name === '我的个人官网')
    for (const site of targets) {
      await fetch(`/api/sites/${site.id}`, { method: 'DELETE' })
    }
    return targets.length
  })
  record('清理测试站点数', true, String(res))
})

// ---------- 汇总 ----------
const realErrors = consoleErrors.filter(
  (e) => !e.includes('Download the React DevTools') && !e.includes('Failed to load resource')
)
record('控制台无运行时错误', realErrors.length === 0, realErrors.slice(0, 3).join(' | ').slice(0, 300))

await browser.close()

const failed = results.filter((r) => !r.pass)
process.stdout.write(`\n==== ${results.length - failed.length}/${results.length} 通过 ====\n`)
if (failed.length > 0) process.exit(1)