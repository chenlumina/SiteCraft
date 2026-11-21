/** Gallery 完整 HTML 门面：艺术编辑器预览与导出共用，保证所见即所得 */
import type { ArtistSiteData } from '@/types/artist'
import { esc } from '../escape'
import type { ArtistTemplateName } from '@/types/artist'
import { renderGalleryBody, renderGalleryCSS } from './gallery'
import { renderExhibitionBody, renderExhibitionCSS } from './exhibition'

/** 按模板取片段：艺术方向的两套版式共用同一份数据契约 */
export function renderArtistFragment(
  data: ArtistSiteData,
  template: ArtistTemplateName = 'gallery'
): { css: string; body: string } {
  return template === 'exhibition'
    ? { css: renderExhibitionCSS(), body: renderExhibitionBody(data) }
    : { css: renderGalleryCSS(data), body: renderGalleryBody(data) }
}

/** 兼容旧调用：默认画廊 */
export function renderGalleryFragment(data: ArtistSiteData): { css: string; body: string } {
  return renderArtistFragment(data, 'gallery')
}

export function generateArtistSiteHTML(
  data: ArtistSiteData,
  template: ArtistTemplateName = 'gallery'
): string {
  const { css, body } = renderArtistFragment(data, template)
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
