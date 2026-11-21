/** Gallery 完整 HTML 门面：艺术编辑器预览与导出共用，保证所见即所得 */
import type { ArtistSiteData } from '@/types/artist'
import { esc } from '../escape'
import { renderGalleryBody, renderGalleryCSS } from './gallery'

export function renderGalleryFragment(data: ArtistSiteData): { css: string; body: string } {
  return { css: renderGalleryCSS(data), body: renderGalleryBody(data) }
}

export function generateArtistSiteHTML(data: ArtistSiteData): string {
  const { css, body } = renderGalleryFragment(data)
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(data.name)} · ${esc(data.title)}</title>
<meta name="description" content="${esc(data.bio.trim() || `${data.name} 的艺术作品集`)}">
<meta name="generator" content="SiteCraft 个人官网生成器">
<style>${css}</style>
</head>
<body style="margin:0;background:#f3f3f0">
${body}
</body>
</html>`
}
