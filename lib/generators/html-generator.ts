/**
 * 网站 HTML 生成器 —— 全应用的「渲染单一事实来源」，对外门面。
 *
 * 实时预览（SiteFrame）、全屏预览、导出静态 HTML、GitHub 部署推送的 index.html
 * 全部调用本文件，因此「所见即所得」：预览长什么样，导出/部署就是什么样。
 *
 * 职责拆分（各模块单一职责，行为由 tests/generator.test.ts 黄金快照锁定）：
 * - escape.ts      文本转义 / URL 协议白名单（XSS 防护）
 * - color.ts       主题色派生数学（色相旋转 / 对比度）
 * - icons.ts       内联 SVG 图标与社交链接
 * - styles.ts      结构基样式 + 十三套模板差异样式 + 主题变量
 * - render-body.ts 语义化页面结构（区块按内容动态出现）
 *
 * 三个关键设计不变：
 * 1. 安全：所有用户文本经 esc() 转义、URL 经 safeUrl() 协议白名单、颜色经 hex 校验。
 * 2. 响应式：CSS 容器查询（@container）按站点自身宽度切版式，预览容器≠视口。
 * 3. 零依赖：图标内联 SVG、样式内联 <style>，导出单文件离线可开。
 */
import type { SiteData, TemplateName } from '@/types'
import { esc } from './escape'
import { renderSiteBody } from './render-body'
import { renderSiteCSS, TEMPLATE_BG } from './styles'

export { DEFAULT_AVATAR_DATA_URI, DEFAULT_AVATAR_PATH, TEMPLATE_BG } from './styles'

export function renderSiteFragment(
  data: SiteData,
  template: TemplateName
): { css: string; body: string } {
  return { css: renderSiteCSS(data, template), body: renderSiteBody(data, template) }
}

/**
 * 生成可独立托管的完整 HTML 文档（导出 / GitHub 部署共用）。
 * favicon 用 data URI 内联：单文件在 file:// 下打开时浏览器仍会请求 /favicon.ico，
 * 内联后既消除 404 控制台报错，也让导出站点带上品牌标识。
 */
export function generateSiteHTML(data: SiteData, template: TemplateName): string {
  const { css, body } = renderSiteFragment(data, template)
  const title = `${esc(data.name)} · ${esc(data.title)}`
  const description = esc(data.bio.trim() || `${data.name} 的个人官网`)
  const favicon =
    "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2040%2040'%3E%3Crect%20x='2'%20y='2'%20width='36'%20height='36'%20rx='10'%20fill='%231b1917'/%3E%3Cpath%20d='M15%2014l-6%206%206%206M25%2014l6%206-6%206'%20stroke='%23f8f7f1'%20stroke-width='2.6'%20stroke-linecap='round'%20stroke-linejoin='round'%20fill='none'/%3E%3Ccircle%20cx='20'%20cy='20'%20r='2.2'%20fill='%23f8f7f1'/%3E%3C/svg%3E"
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="generator" content="SiteCraft 个人官网生成器">
<link rel="icon" href="${favicon}">
<style>
${css}
html{scroll-behavior:smooth;scrollbar-color:${TEMPLATE_BG[template]} auto}
body{margin:0;background:${TEMPLATE_BG[template]}}
</style>
</head>
<body>
${body}
</body>
</html>`
}
