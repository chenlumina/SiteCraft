/**
 * Gallery 真实渲染器：艺术作品数据 → 静态展览页。
 * 图片/音频/视频使用原生标签；所有文本与 URL 继续走生成器安全边界。
 */
import type { ArtistSiteData, Artwork, MediaItem } from '@/types/artist'
import { esc, safeUrl } from '../escape'
import { isValidHexColor } from '@/lib/utils'

export const GALLERY_CSS = `
.artist-gallery{--ag-bg:#f3f3f0;--ag-fg:#171917;--ag-muted:#666862;--ag-line:rgba(23,25,23,.14);min-height:100%;background:var(--ag-bg);color:var(--ag-fg);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;container-type:inline-size}
.artist-gallery *{box-sizing:border-box}
.artist-gallery a{color:inherit;text-decoration:none}
.artist-gallery a:focus-visible{outline:2px solid var(--ag-accent);outline-offset:5px}
.ag-header{max-width:1440px;margin:auto;min-height:72px;padding:0 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid var(--ag-line)}
.ag-brand{font-family:Georgia,serif;font-weight:700;font-size:19px}
.ag-nav{display:flex;align-items:center;gap:24px;font-size:12px;color:var(--ag-muted)}
.ag-nav a{min-height:32px;display:inline-flex;align-items:center;transition:color .2s}
.ag-nav a:hover{color:var(--ag-fg)}
.ag-main{max-width:1440px;margin:auto;padding:52px 32px 72px}
.ag-kicker{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--ag-muted)}
.ag-hero-title{max-width:1000px;margin:16px 0 0;font-family:Georgia,serif;font-size:clamp(42px,6.2cqw,82px);line-height:1.08;letter-spacing:-.035em;overflow-wrap:anywhere}
.ag-hero{margin:34px 0 0;display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:28px;align-items:end}
.ag-hero-media{margin:0;background:#e4e4df;overflow:hidden}
.ag-hero-media img{display:block;width:100%;height:min(64cqw,720px);object-fit:cover}
.ag-caption{padding:0 0 5px;border-top:1px solid var(--ag-line)}
.ag-caption h2{margin:16px 0 0;font-family:Georgia,serif;font-size:26px;line-height:1.25;overflow-wrap:anywhere}
.ag-caption p{margin:12px 0 0;font-size:13px;line-height:1.8;color:var(--ag-muted)}
.ag-meta{font-family:ui-monospace,monospace;font-size:10px!important;letter-spacing:.12em;text-transform:uppercase}
.ag-works{margin-top:64px;padding-top:20px;border-top:1px solid var(--ag-line)}
.ag-exhibitions{padding:56px 0 8px}
.ag-ex-list{list-style:none;margin:0;padding:0;border-top:1px solid rgba(0,0,0,.14)}
.ag-ex-list li{display:grid;grid-template-columns:64px 52px 1fr;gap:14px;align-items:baseline;padding:11px 0;border-bottom:1px solid rgba(0,0,0,.09)}
.ag-ex-year{font-variant-numeric:tabular-nums;color:rgba(0,0,0,.55);font-size:13px}
.ag-ex-role{font-size:11px;letter-spacing:.08em;color:rgba(0,0,0,.45)}
.ag-ex-title{font-size:14.5px;line-height:1.6}
@container (max-width:560px){.ag-ex-list li{grid-template-columns:52px 1fr;gap:8px}.ag-ex-role{grid-column:2;font-size:10.5px}.ag-ex-title{grid-column:2}}
.ag-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:20px;margin-bottom:22px}
.ag-section-head h2{margin:0;font-family:Georgia,serif;font-size:24px}
.ag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:42px 24px}
.ag-work{margin:0;min-width:0}
.ag-work-cover{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#e4e4df}
.ag-work h3{margin:14px 0 0;font-family:Georgia,serif;font-size:22px;line-height:1.3;overflow-wrap:anywhere}
.ag-work p{margin:8px 0 0;font-size:12.5px;line-height:1.75;color:var(--ag-muted)}
.ag-media-list{display:grid;gap:12px;margin-top:14px}
.ag-media-list img,.ag-media-list video{display:block;width:100%;height:auto}
.ag-media-list audio{width:100%}
.ag-about{margin-top:72px;padding-top:24px;border-top:1px solid var(--ag-line);display:grid;grid-template-columns:1fr 1fr;gap:32px}
.ag-about h2{margin:0;font-family:Georgia,serif;font-size:30px}
.ag-about p{margin:0;font-size:14px;line-height:1.9;color:var(--ag-muted)}
.ag-footer{max-width:1440px;margin:auto;padding:20px 32px;border-top:1px solid var(--ag-line);font-family:ui-monospace,monospace;font-size:10px;color:var(--ag-muted);display:flex;justify-content:space-between;gap:16px}
@container (max-width:700px){
.ag-header{padding:0 18px}.ag-main{padding:34px 18px 52px}.ag-nav{gap:14px}
.ag-hero{grid-template-columns:1fr}.ag-hero-media img{height:72cqw}
.ag-grid{grid-template-columns:1fr}.ag-about{grid-template-columns:1fr}.ag-footer{padding:18px;flex-wrap:wrap}
}
@media (prefers-reduced-motion:reduce){.artist-gallery *{animation:none!important;transition:none!important}}
`

function safeImageSource(value: string): string {
  const standard = safeUrl(value)
  if (standard) return standard
  // 仅导出流程生成的图片 data URI 放行；用户输入仍受 Zod 的 http(s)/站内路径限制
  return /^data:image\/(?:png|jpeg|gif|webp|svg\+xml);/i.test(value.trim()) ? esc(value.trim()) : ''
}

function artworkCover(artwork: Artwork): string {
  return (
    safeImageSource(artwork.cover) ||
    safeImageSource(artwork.media.find((item) => item.type === 'image')?.url ?? '')
  )
}

function renderMedia(item: MediaItem, artworkTitle: string): string {
  const url = item.type === 'image' ? safeImageSource(item.url) : safeUrl(item.url)
  if (!url) return ''
  const title = esc(item.title?.trim() || `${artworkTitle} · ${item.type}`)
  if (item.type === 'image') return `<img src="${url}" alt="${title}" loading="lazy">`
  if (item.type === 'audio')
    return `<audio controls preload="none" src="${url}" aria-label="${title}"></audio>`
  const poster = safeUrl(item.poster ?? '')
  return `<video controls preload="none" src="${url}"${poster ? ` poster="${poster}"` : ''} aria-label="${title}"></video>`
}

function renderWork(artwork: Artwork, featured = false): string {
  const cover = artworkCover(artwork)
  const description = artwork.description.trim()
  const extraMedia = artwork.media
    .filter((item) => {
      const source = item.type === 'image' ? safeImageSource(item.url) : safeUrl(item.url)
      return source && source !== cover
    })
    .map((item) => renderMedia(item, artwork.title))
    .filter(Boolean)
    .join('')
  return `<figure class="${featured ? 'ag-hero-media' : 'ag-work'}">
    ${cover ? `<img class="${featured ? '' : 'ag-work-cover'}" src="${cover}" alt="${esc(artwork.title)}"${featured ? '' : ' loading="lazy"'}>` : ''}
    ${!featured ? `<figcaption><p class="ag-meta">${esc(artwork.series)}${artwork.year ? ` · ${esc(artwork.year)}` : ''}</p><h3>${esc(artwork.title)}</h3><p>${esc(artwork.medium)}${artwork.dimensions ? ` · ${esc(artwork.dimensions)}` : ''}</p>${description ? `<p>${esc(description)}</p>` : ''}</figcaption>${extraMedia ? `<div class="ag-media-list">${extraMedia}</div>` : ''}` : ''}
  </figure>`
}

export function renderGalleryBody(data: ArtistSiteData): string {
  const ordered = [...data.artworks].sort((a, b) => Number(b.featured) - Number(a.featured))
  const featured = ordered[0]
  const rest = featured ? ordered.slice(1) : []
  const mail = data.email.trim()
  const roleLabel: Record<string, string> = { solo: '个展', group: '群展', other: '其他' }
  const exhibitions = (data.exhibitions ?? [])
    .filter((item) => item.title.trim())
    .map(
      (item) =>
        `<li><span class="ag-ex-year">${esc(item.year || '—')}</span><span class="ag-ex-role">${esc(roleLabel[item.role] ?? '')}</span><span class="ag-ex-title">${esc(item.title)}${item.venue ? `，${esc(item.venue)}` : ''}</span></li>`
    )
    .join('')
  return `<div class="artist-gallery">
<header class="ag-header"><a class="ag-brand" href="#top">${esc(data.name)}</a><nav class="ag-nav" aria-label="作品导航">${featured ? '<a href="#works">作品</a>' : ''}${exhibitions ? '<a href="#exhibitions">展览</a>' : ''}<a href="#about">关于</a>${mail ? `<a href="mailto:${esc(mail)}">联系</a>` : ''}</nav></header>
<main id="top" class="ag-main">
  <p class="ag-kicker">Selected works · ${esc(data.title)}</p>
  <h1 class="ag-hero-title">${esc(featured?.series || data.name)}</h1>
  ${featured ? `<div class="ag-hero">${renderWork(featured, true)}<div class="ag-caption"><p class="ag-meta">${esc(featured.series)}${featured.year ? ` · ${esc(featured.year)}` : ''}</p><h2>${esc(featured.title)}</h2><p>${esc(featured.medium)}${featured.dimensions ? ` · ${esc(featured.dimensions)}` : ''}</p>${featured.description ? `<p>${esc(featured.description)}</p>` : ''}</div></div>` : ''}
  ${rest.length ? `<section id="works" class="ag-works"><div class="ag-section-head"><h2>全部作品</h2><span class="ag-kicker">${rest.length} pieces</span></div><div class="ag-grid">${rest.map((artwork) => renderWork(artwork)).join('')}</div></section>` : ''}
${exhibitions.length ? `<section id="exhibitions" class="ag-exhibitions"><div class="ag-section-head"><h2>展览</h2><span class="ag-kicker">Exhibitions</span></div><ul class="ag-ex-list">${exhibitions}</ul></section>` : ''}
  <section id="about" class="ag-about"><div><p class="ag-kicker">About the artist</p><h2>${esc(data.name)}</h2></div><div><p>${esc(data.bio)}</p>${data.location ? `<p style="margin-top:14px">${esc(data.location)}</p>` : ''}${mail ? `<p style="margin-top:14px"><a href="mailto:${esc(mail)}">${esc(mail)}</a></p>` : ''}</div></section>
</main>
<footer class="ag-footer"><span>© ${new Date().getFullYear()} ${esc(data.name)}</span><span>Digital Gallery · SiteCraft</span></footer>
</div>`
}

export function renderGalleryCSS(data: ArtistSiteData): string {
  const accent = isValidHexColor(data.theme.primaryColor) ? data.theme.primaryColor : '#171917'
  return `${GALLERY_CSS}\n.artist-gallery{--ag-accent:${accent}}`
}
