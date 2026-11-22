/**
 * 工作室 Studio —— 设计师 / 插画师式观看：像走进一间工作室。
 * 左栏是钉在墙上的工作台卡片（作者、媒介、档期、接单状态），右栏是摊开的作品。
 * 母题是纸张与胶带，不是屏幕：卡片轻微歪斜、胶带压角、说明用衬线段落。
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

export const STUDIO_CSS = `
.artist-studio{--st-bg:#efece4;--st-card:#fbf9f3;--st-ink:#1d1b17;--st-mute:#6d675c;--st-line:rgba(29,27,23,.14);--st-tape:rgba(226,214,180,.75);
  background:var(--st-bg);color:var(--st-ink);font-family:Georgia,'Times New Roman',serif;container-type:inline-size;min-height:100%}
.artist-studio *{box-sizing:border-box}
.artist-studio a{color:inherit;text-decoration:none;transition:opacity .2s ease,color .2s ease}
.artist-studio a:hover{opacity:.62}
.artist-studio :where(a,button):focus-visible{outline:2px solid var(--st-ink);outline-offset:3px}
.st-shell{max-width:1200px;margin:0 auto;padding:clamp(20px,4vw,44px) clamp(16px,4vw,40px) 44px;display:grid;gap:clamp(20px,3vw,36px);grid-template-columns:290px minmax(0,1fr)}
.st-card{background:var(--st-card);border:1px solid var(--st-line);padding:22px 20px 20px;position:relative;
  box-shadow:0 10px 24px rgba(29,27,23,.07);transform:rotate(-.4deg);align-self:start}
@container (min-width:880px){.st-card{position:sticky;top:24px}}
.st-card::before,.st-card::after{content:'';position:absolute;top:-9px;width:62px;height:18px;background:var(--st-tape);
  border-left:1px solid rgba(0,0,0,.05);border-right:1px solid rgba(0,0,0,.05)}
.st-card::before{left:14px;transform:rotate(-3.5deg)}
.st-card::after{right:14px;transform:rotate(4deg)}
.st-kicker{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--st-mute)}
@keyframes st-lay{from{opacity:0;transform:translateY(10px) rotate(-.4deg)}to{opacity:1;transform:rotate(-.4deg)}}
.st-title{margin:10px 0 0;font-weight:400;font-size:clamp(34px,3.8vw,46px);line-height:1.05;letter-spacing:-.01em;animation:st-lay .75s cubic-bezier(.3,1.1,.64,1) both}
.st-role{margin:8px 0 0;font-style:italic;color:var(--st-mute);font-size:14px}
.st-facts{margin:16px 0 0;padding:14px 0 0;border-top:1px solid var(--st-line);display:grid;gap:8px;font-size:12.5px}
.st-facts > div{display:grid;grid-template-columns:52px 1fr;gap:10px}
.st-facts dt{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--st-mute)}
.st-facts dd{margin:0;line-height:1.6}
.st-cm-state{margin:14px 0 0;font-size:12px;color:#3c6b4a}
.st-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#3c6b4a;margin-right:7px}
.st-cm-list{margin:12px 0 0;display:grid;gap:6px;font-size:12.5px}
.st-cm-list > div{display:grid;grid-template-columns:48px 1fr;gap:10px}
.st-cm-list dt{margin:0;color:var(--st-mute);font-size:11px}
.st-cm-list dd{margin:0;line-height:1.65}
.mail-cta{display:inline-flex;align-items:center;min-height:24px;margin-top:12px;font-size:12.5px;border-bottom:1px solid var(--st-ink)}
.st-main{min-width:0}
.st-work{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,220px);gap:clamp(14px,2vw,26px);align-items:start;
  padding:0 0 clamp(22px,3vw,34px);margin:0 0 clamp(22px,3vw,34px);border-bottom:1px solid var(--st-line)}
.st-work:last-of-type{border-bottom:none}
.st-plate{margin:0;background:#fff;padding:8px;border:1px solid var(--st-line);box-shadow:0 6px 18px rgba(29,27,23,.06)}
.st-plate img{display:block;width:100%;height:auto;max-height:64vh;object-fit:contain;transition:transform .6s cubic-bezier(.2,.7,.3,1)}
.st-work:hover .st-plate img{transform:scale(1.02)}
.st-blank{display:grid;place-items:center;height:200px;font-size:11px;letter-spacing:.2em;color:var(--st-mute)}
.st-note{margin:0}
.st-no{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.18em;color:var(--st-mute)}
.st-note h2{margin:8px 0 0;font-weight:400;font-size:21px;line-height:1.3}
.st-meta{margin:8px 0 0;font-size:12px;color:var(--st-mute);line-height:1.7}
.st-desc{margin:12px 0 0;font-size:13.5px;line-height:1.85;color:var(--st-mute)}
.st-sect{margin-top:clamp(24px,4vw,40px);border-top:1px solid var(--st-line);padding-top:16px}
.st-sect h2{margin:0 0 10px;font-weight:400;font-size:20px}
.st-cv{list-style:none;margin:0;padding:0;font-size:13px}
.st-cv li{display:grid;grid-template-columns:56px 46px 1fr;gap:10px;padding:6px 0;border-bottom:1px solid var(--st-line)}
.cv-year{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--st-mute)}
.cv-role,.cv-show{color:var(--st-mute)}
.st-foot{grid-column:1/-1;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--st-line);padding-top:14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--st-mute)}
@container (max-width:879px){.st-shell{grid-template-columns:1fr}.st-card{transform:none}.st-work{grid-template-columns:1fr}.st-cv li{grid-template-columns:52px 1fr}.cv-role{grid-column:2}}
@media (prefers-reduced-motion:reduce){.st-title{animation:none}.st-plate img{transition:none}.st-work:hover .st-plate img{transform:none}}
`

export function renderStudioBody(data: ArtistSiteData): string {
  const works = curated(data.artworks)
  const worksHtml = works
    .map((artwork, index) => {
      const src = coverOf(artwork)
      const plate = src
        ? '<img src="' +
          src +
          '" alt="' +
          esc(artwork.title) +
          '" loading="' +
          (index < 2 ? 'eager' : 'lazy') +
          '">'
        : '<div class="st-blank">无图像</div>'
      const meta = metaLine(artwork)
      return (
        '<article class="st-work"><figure class="st-plate">' +
        plate +
        '</figure>' +
        '<div class="st-note"><p class="st-no">' +
        String(index + 1).padStart(2, '0') +
        (artwork.series ? ' · ' + esc(artwork.series) : '') +
        '</p>' +
        '<h2>' +
        esc(artwork.title) +
        '</h2>' +
        (meta ? '<p class="st-meta">' + esc(meta) + '</p>' : '') +
        (artwork.description.trim()
          ? '<p class="st-desc">' + esc(artwork.description.trim()) + '</p>'
          : '') +
        '</div></article>'
      )
    })
    .join('')
  const cv = cvItems(data)
  const cm = commissionList(data, 'st')
  const facts =
    (data.location ? '<div><dt>地点</dt><dd>' + esc(data.location) + '</dd></div>' : '') +
    '<div><dt>作品</dt><dd>' +
    works.length +
    ' 件</dd></div>' +
    (data.commissions?.leadTime
      ? '<div><dt>档期</dt><dd>' + esc(data.commissions.leadTime) + '</dd></div>'
      : '')
  return [
    '<div class="site-root artist-studio site-studio">',
    '  <div class="st-shell">',
    '    <aside class="st-card">',
    '      <p class="st-kicker">Studio</p>',
    '      <h1 class="st-title">' + esc(data.name) + '</h1>',
    '      <p class="st-role">' + esc(data.title) + '</p>',
    '      <dl class="st-facts">' + facts + '</dl>',
    cm ? '      ' + commissionState(data, 'st') + cm + mailLink(data, 'mail-cta') : '',
    '    </aside>',
    '    <main class="st-main">' +
      worksHtml +
      (cv.length
        ? '<section class="st-sect"><h2>展览履历</h2><ul class="st-cv">' +
          cv.join('') +
          '</ul></section>'
        : '') +
      '</main>',
    '    <footer class="st-foot"><span>© ' +
      new Date().getFullYear() +
      ' ' +
      esc(data.name) +
      '</span><span>Studio · SiteCraft</span></footer>',
    '  </div>',
    '</div>',
  ]
    .filter(Boolean)
    .join('\n')
}
