/**
 * 藏品索引 Index —— 美术馆藏品目录式观看：先看清单，再调阅单件。
 * 与画廊的「看大图」相反：这张页面相信「编号、年份、系列、尺寸、媒介」本身就是内容，
 * 作品图放在可展开的条目里，一次调阅一件。
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

export const INDEX_CSS = `
.artist-index{--ix-bg:#f6f5f1;--ix-ink:#141412;--ix-mute:#6b6862;--ix-line:rgba(20,20,18,.16);--ix-mark:#8a1c1c;
  background:var(--ix-bg);color:var(--ix-ink);font-family:Georgia,'Times New Roman',serif;
  container-type:inline-size;min-height:100%}
.artist-index *{box-sizing:border-box}
.artist-index a{color:inherit;text-decoration:none;transition:color .2s ease}
.artist-index a:hover{color:var(--ix-mark)}
.artist-index :where(a,summary):focus-visible{outline:2px solid var(--ix-ink);outline-offset:3px}
.ix-wrap{max-width:1080px;margin:0 auto;padding:clamp(26px,5vw,60px) clamp(16px,4vw,44px) 48px}
.ix-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;border-bottom:2px solid var(--ix-ink);padding-bottom:14px}
.ix-kicker{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--ix-mute)}
@keyframes ix-settle{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.ix-title{margin:10px 0 0;font-weight:400;font-size:clamp(44px,6.4vw,68px);line-height:1.02;letter-spacing:-.01em;animation:ix-settle .7s cubic-bezier(.3,1.1,.64,1) both}
.ix-lead{max-width:34ch;margin:0;font-size:13.5px;line-height:1.8;color:var(--ix-mute)}
.ix-list{margin:24px 0 0}
.ix-head{display:grid;grid-template-columns:44px 1fr 120px 96px;gap:12px;align-items:baseline;padding:0 0 8px;border-bottom:1px solid var(--ix-line);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ix-mute)}
.ix-row{border-bottom:1px solid var(--ix-line)}
.ix-row summary{display:grid;grid-template-columns:44px 1fr 120px 96px;gap:12px;align-items:baseline;padding:12px 0;cursor:pointer;list-style:none}
.ix-row summary::-webkit-details-marker{display:none}
.ix-no{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--ix-mark)}
.ix-name{font-size:17px;line-height:1.35}
.ix-series,.ix-meta{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--ix-mute)}
.ix-row[open] summary{background:rgba(20,20,18,.045)}
.ix-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,320px);gap:22px;padding:6px 0 22px}
.ix-plate{border:1px solid var(--ix-line);background:#fff;padding:10px}
.ix-plate img{display:block;width:100%;height:auto;max-height:62vh;object-fit:contain}
.ix-blank{display:grid;place-items:center;height:180px;font-size:11px;letter-spacing:.2em;color:var(--ix-mute)}
.ix-note p{margin:0 0 10px;font-size:13.5px;line-height:1.85;color:var(--ix-mute);max-width:46ch}
.ix-sect{margin-top:clamp(30px,5vw,56px);display:grid;grid-template-columns:120px 1fr;gap:20px;border-top:1px solid var(--ix-line);padding-top:18px}
.ix-sect h2{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--ix-mute);font-weight:400}
.ix-cv{list-style:none;margin:0;padding:0;font-size:13px}
.ix-cv li{display:grid;grid-template-columns:58px 48px 1fr;gap:12px;padding:6px 0;border-bottom:1px solid var(--ix-line)}
.cv-year{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ix-mark)}
.cv-role,.cv-show{color:var(--ix-mute)}
.ix-cm-list{margin:0;display:grid;gap:6px;font-size:13px}
.ix-cm-list > div{display:grid;grid-template-columns:52px 1fr;gap:12px}
.ix-cm-list dt{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ix-mute)}
.ix-cm-list dd{margin:0;line-height:1.75}
.ix-cm-state{margin:10px 0 0;font-size:12px;color:var(--ix-mark)}
.ix-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--ix-mark);margin-right:7px}
.mail-cta{display:inline-flex;align-items:center;min-height:24px;margin-top:10px;font-size:13px;border-bottom:1px solid var(--ix-mark)}
.ix-foot{margin-top:28px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ix-mute)}
@container (max-width:640px){.ix-head{display:none}.ix-head{flex-direction:column;align-items:flex-start}.ix-row summary{grid-template-columns:36px 1fr}.ix-series,.ix-meta{grid-column:2}.ix-body{grid-template-columns:1fr}.ix-sect{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.ix-title{animation:none}.artist-index a{transition:none}}
`

export function renderIndexBody(data: ArtistSiteData): string {
  const works = curated(data.artworks)
  const rows = works
    .map((artwork, index) => {
      const src = coverOf(artwork)
      const plate = src
        ? '<img src="' + src + '" alt="' + esc(artwork.title) + '" loading="lazy">'
        : '<div class="ix-blank">无图像</div>'
      const meta = metaLine(artwork)
      return [
        '<details class="ix-row">',
        '<summary><span class="ix-no">' +
          String(index + 1).padStart(3, '0') +
          '</span>' +
          '<span class="ix-name">' +
          esc(artwork.title) +
          '</span>' +
          '<span class="ix-series">' +
          esc(artwork.series || '—') +
          '</span>' +
          '<span class="ix-meta">' +
          esc(artwork.year || '—') +
          '</span></summary>',
        '<div class="ix-body"><div class="ix-plate">' +
          plate +
          '</div>' +
          '<div class="ix-note">' +
          (meta ? '<p>' + esc(meta) + '</p>' : '') +
          (artwork.description.trim() ? '<p>' + esc(artwork.description.trim()) + '</p>' : '') +
          '</div></div>',
        '</details>',
      ].join('')
    })
    .join('')
  const cv = cvItems(data)
  const cm = commissionList(data, 'ix')
  return [
    '<div class="site-root artist-index site-index">',
    '  <div class="ix-wrap">',
    '    <header class="ix-head"><div>',
    '      <p class="ix-kicker">Catalogue raisonné · ' + works.length + ' entries</p>',
    '      <h1 class="ix-title">' + esc(data.name) + '</h1>',
    '    </div><p class="ix-lead">' +
      esc(data.title) +
      (data.location ? ' · ' + esc(data.location) : '') +
      '</p></header>',
    '    <div class="ix-list">',
    '      <div class="ix-head" aria-hidden="true"><span>编号</span><span>作品</span><span>系列</span><span>年份</span></div>',
    rows,
    '    </div>',
    cv.length
      ? '    <section class="ix-sect"><h2>展览履历</h2><ul class="ix-cv">' +
        cv.join('') +
        '</ul></section>'
      : '',
    cm
      ? '    <section class="ix-sect"><h2>合作</h2><div>' +
        cm +
        commissionState(data, 'ix') +
        mailLink(data, 'mail-cta') +
        '</div></section>'
      : '',
    '    <footer class="ix-foot"><span>© ' +
      new Date().getFullYear() +
      ' ' +
      esc(data.name) +
      '</span><span>Index · SiteCraft</span></footer>',
    '  </div>',
    '</div>',
  ]
    .filter(Boolean)
    .join('\n')
}
