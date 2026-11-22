/**
 * 海报墙 Poster —— 街头 / 平面设计式观看：把作品当海报贴出来。
 * 母题是贴海报的墙：块面强、字大、每张贴纸微微歪；不是相框，是胶带与墙角。
 * 与印样的密排、索引的清单相反：这里一张海报占一块版面。
 */
import type { ArtistSiteData } from '@/types/artist'
import { esc } from '../escape'
import {
  commissionList,
  commissionState,
  coverOf,
  curated,
  cvItems,
  mailLink,
  metaLine,
} from './common'

export const POSTER_CSS = `
.artist-poster{--po-bg:#e8e4da;--po-ink:#121110;--po-mute:#5f5a51;--po-line:rgba(18,17,16,.18);--po-accent:#c8341f;
  background:var(--po-bg);color:var(--po-ink);font-family:Georgia,'Times New Roman',serif;container-type:inline-size;min-height:100%}
.artist-poster *{box-sizing:border-box}
.artist-poster a{color:inherit;text-decoration:none;transition:color .2s ease,opacity .2s ease}
.artist-poster a:hover{color:var(--po-accent)}
.artist-poster :where(a,button):focus-visible{outline:2px solid var(--po-ink);outline-offset:3px}
.po-shell{max-width:1200px;margin:0 auto;padding:clamp(18px,4vw,40px) clamp(14px,3.5vw,36px) 40px}
.po-top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;border-bottom:3px solid var(--po-ink);padding-bottom:10px}
.po-kicker{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--po-mute)}
@keyframes po-slam{from{opacity:0;transform:translateY(18px) rotate(-1deg)}to{opacity:1;transform:none}}
.po-title{margin:10px 0 0;font-weight:700;font-size:clamp(44px,9vw,104px);line-height:.92;letter-spacing:-.03em;text-transform:uppercase;animation:po-slam .8s cubic-bezier(.25,1.1,.5,1) both}
.po-sub{max-width:30ch;margin:0 0 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.7;letter-spacing:.04em;color:var(--po-mute);text-align:right}
.po-wall{display:grid;gap:clamp(14px,2.4vw,26px);grid-template-columns:repeat(auto-fill,minmax(260px,1fr));margin-top:clamp(18px,3vw,30px);align-items:start}
.po-card{margin:0;background:#faf8f2;border:1px solid var(--po-line);padding:10px;
  box-shadow:4px 6px 0 rgba(18,17,16,.12);transform:rotate(-.8deg);transition:transform .25s ease,box-shadow .25s ease}
.po-card:nth-child(3n+2){transform:rotate(.9deg)}
.po-card:nth-child(3n){transform:rotate(-1.4deg)}
.po-card:hover{transform:rotate(0) translateY(-3px);box-shadow:6px 10px 0 rgba(18,17,16,.16)}
.po-shot{display:block;aspect-ratio:3/4;overflow:hidden;background:#ddd8cc}
.po-shot img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.3,1)}
.po-card:hover .po-shot img{transform:scale(1.03)}
.po-blank{display:grid;place-items:center;height:100%;font-size:10px;letter-spacing:.2em;color:var(--po-mute)}
.po-cap{display:flex;gap:8px;align-items:baseline;margin:8px 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--po-mute)}
.po-cap b{font-family:Georgia,serif;font-size:14px;letter-spacing:0;text-transform:none;color:var(--po-ink);font-weight:400}
.po-no{color:var(--po-accent);font-weight:700}
.po-sect{margin-top:clamp(28px,5vw,52px);border-top:3px solid var(--po-ink);padding-top:16px;display:grid;grid-template-columns:180px minmax(0,1fr);gap:20px}
.po-sect h2{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--po-mute);font-weight:400}
.po-cv{list-style:none;margin:0;padding:0;font-size:13px}
.po-cv li{display:grid;grid-template-columns:56px 46px 1fr;gap:12px;padding:6px 0;border-bottom:1px solid var(--po-line)}
.cv-year{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#8f2214}
.cv-role,.cv-show{color:var(--po-mute)}
.po-cm-list{margin:0;display:grid;gap:8px;font-size:13.5px}
.po-cm-list > div{display:grid;grid-template-columns:52px 1fr;gap:12px}
.po-cm-list dt{margin:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--po-mute)}
.po-cm-list dd{margin:0;line-height:1.8}
.po-cm-state{margin:12px 0 0;font-size:12px;color:var(--po-accent)}
.po-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--po-accent);margin-right:7px}
.mail-cta{display:inline-flex;align-items:center;min-height:24px;margin-top:12px;font-size:13px;border-bottom:2px solid var(--po-accent)}
.po-foot{margin-top:28px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--po-line);padding-top:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--po-mute)}
@container (max-width:560px){.po-top{flex-direction:column;align-items:flex-start}.po-sub{text-align:left}.po-sect{grid-template-columns:1fr}.po-cv li{grid-template-columns:52px 1fr}.cv-role{grid-column:2}}
@media (prefers-reduced-motion:reduce){.po-title{animation:none}.po-card,.po-shot img{transition:none}.po-card:hover{transform:none}}
`

export function renderPosterBody(data: ArtistSiteData): string {
  const works = curated(data.artworks)
  const cards = works
    .map((artwork, index) => {
      const src = coverOf(artwork)
      const shot = src
        ? '<img src="' +
          src +
          '" alt="' +
          esc(artwork.title) +
          '" loading="' +
          (index < 3 ? 'eager' : 'lazy') +
          '">'
        : '<span class="po-blank">NO PRINT</span>'
      const meta = metaLine(artwork)
      return (
        '<figure class="po-card"><span class="po-shot">' +
        shot +
        '</span>' +
        '<figcaption class="po-cap"><span class="po-no">' +
        String(index + 1).padStart(2, '0') +
        '</span>' +
        '<b>' +
        esc(artwork.title) +
        '</b>' +
        (meta ? '<span>' + esc(meta) + '</span>' : '') +
        '</figcaption></figure>'
      )
    })
    .join('')
  const cv = cvItems(data)
  const cm = commissionList(data, 'po')
  return [
    '<div class="site-root artist-poster site-poster">',
    '  <div class="po-shell">',
    '    <header class="po-top"><div>',
    '      <p class="po-kicker">Poster wall · ' + works.length + ' prints</p>',
    '      <h1 class="po-title">' + esc(data.name) + '</h1>',
    '    </div><p class="po-sub">' +
      esc(data.title) +
      (data.location ? '<br>' + esc(data.location) : '') +
      '</p></header>',
    '    <section class="po-wall">' + cards + '</section>',
    cv.length
      ? '    <section class="po-sect"><h2>展览履历</h2><ul class="po-cv">' +
        cv.join('') +
        '</ul></section>'
      : '',
    cm
      ? '    <section class="po-sect"><h2>合作</h2><div>' +
        commissionState(data, 'po') +
        cm +
        mailLink(data, 'mail-cta') +
        '</div></section>'
      : '',
    '    <footer class="po-foot"><span>© ' +
      new Date().getFullYear() +
      ' ' +
      esc(data.name) +
      '</span><span>Poster · SiteCraft</span></footer>',
    '  </div>',
    '</div>',
  ]
    .filter(Boolean)
    .join('\n')
}
