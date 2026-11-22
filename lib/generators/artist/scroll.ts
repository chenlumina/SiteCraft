/**
 * 长卷 Scroll —— 绘本 / 插画式观看：一件作品一屏，读下去像展开手卷。
 * 左缘一条年份刻度贯穿全篇，作品与创作笔记交替出现；没有网格，只有顺序。
 * 与画廊（可扫）和展览（横向）都不同：这里唯一的导航是「往下」。
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

export const SCROLL_CSS = `
.artist-scroll{--sc-bg:#f7f5ef;--sc-ink:#191714;--sc-mute:#6f6a5f;--sc-line:rgba(25,23,20,.14);--sc-mark:#a8461f;
  background:var(--sc-bg);color:var(--sc-ink);font-family:Georgia,'Times New Roman',serif;container-type:inline-size;min-height:100%}
.artist-scroll *{box-sizing:border-box}
.artist-scroll a{color:inherit;text-decoration:none;transition:color .2s ease}
.artist-scroll a:hover{color:var(--sc-mark)}
.artist-scroll :where(a,button):focus-visible{outline:2px solid var(--sc-ink);outline-offset:3px}
.sc-wrap{max-width:960px;margin:0 auto;padding:clamp(26px,5vw,64px) clamp(16px,4vw,40px) 48px;position:relative}
.sc-head{padding-bottom:26px;border-bottom:1px solid var(--sc-line)}
.sc-kicker{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--sc-mute)}
@keyframes sc-unroll{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.sc-title{margin:12px 0 0;font-weight:400;font-size:clamp(44px,7vw,72px);line-height:1.02;letter-spacing:-.015em;animation:sc-unroll .85s cubic-bezier(.3,1.1,.64,1) both}
.sc-lead{margin:16px 0 0;max-width:56ch;font-size:15.5px;line-height:1.9;color:var(--sc-mute)}
.sc-axis{list-style:none;margin:0;padding:0}
.sc-piece{display:grid;grid-template-columns:78px minmax(0,1fr);gap:clamp(12px,2.5vw,28px);
  padding:clamp(26px,5vw,56px) 0;border-bottom:1px solid var(--sc-line)}
.sc-mark{position:relative;padding-top:6px}
.sc-mark::before{content:'';position:absolute;left:64px;top:0;bottom:-100%;width:1px;background:var(--sc-line)}
.sc-piece:last-child .sc-mark::before{bottom:0}
.sc-year{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.1em;color:var(--sc-mark)}
.sc-no{display:block;margin-top:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;color:var(--sc-mute)}
.sc-body{min-width:0}
.sc-plate{margin:0 0 16px;background:#fff;padding:10px;border:1px solid var(--sc-line)}
.sc-plate img{display:block;width:100%;height:auto;max-height:70vh;object-fit:contain;transition:transform .7s cubic-bezier(.2,.7,.3,1)}
.sc-piece:hover .sc-plate img{transform:scale(1.015)}
.sc-blank{display:grid;place-items:center;height:240px;font-size:11px;letter-spacing:.2em;color:var(--sc-mute)}
.sc-h2{margin:0;font-weight:400;font-size:clamp(21px,2.4vw,27px);line-height:1.3}
.sc-meta{margin:8px 0 0;font-size:12.5px;color:var(--sc-mute);line-height:1.7}
.sc-text{margin:12px 0 0;font-size:14px;line-height:1.95;color:var(--sc-mute);max-width:58ch}
.sc-sect{margin-top:clamp(30px,5vw,56px)}
.sc-sect h2{margin:0 0 12px;font-weight:400;font-size:22px}
.sc-cv{list-style:none;margin:0;padding:0;font-size:13px}
.sc-cv li{display:grid;grid-template-columns:58px 46px 1fr;gap:12px;padding:7px 0;border-bottom:1px solid var(--sc-line)}
.cv-year{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--sc-mark)}
.cv-role,.cv-show{color:var(--sc-mute)}
.sc-cm-list{margin:0;display:grid;gap:8px;font-size:13.5px}
.sc-cm-list > div{display:grid;grid-template-columns:52px 1fr;gap:12px}
.sc-cm-list dt{margin:0;font-size:11px;letter-spacing:.1em;color:var(--sc-mute)}
.sc-cm-list dd{margin:0;line-height:1.8}
.sc-cm-state{margin:12px 0 0;font-size:12px;color:var(--sc-mark)}
.sc-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--sc-mark);margin-right:7px}
.mail-cta{display:inline-flex;align-items:center;min-height:24px;margin-top:12px;font-size:13px;border-bottom:1px solid var(--sc-mark)}
.sc-foot{margin-top:30px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--sc-mute)}
@container (max-width:560px){.sc-piece{grid-template-columns:1fr}.sc-mark{display:flex;gap:10px;align-items:baseline}.sc-mark::before{display:none}.sc-no{margin-top:0}.sc-cv li{grid-template-columns:52px 1fr}.cv-role{grid-column:2}}
@media (prefers-reduced-motion:reduce){.sc-title{animation:none}.sc-plate img{transition:none}.sc-piece:hover .sc-plate img{transform:none}}
`

export function renderScrollBody(data: ArtistSiteData): string {
  const works = curated(data.artworks)
  const pieces = works
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
        : '<div class="sc-blank">无图像</div>'
      const meta = metaLine(artwork)
      return (
        '<li class="sc-piece">' +
        '<div class="sc-mark"><span class="sc-year">' +
        esc(artwork.year || '—') +
        '</span>' +
        '<span class="sc-no">' +
        String(index + 1).padStart(2, '0') +
        '</span></div>' +
        '<div class="sc-body"><figure class="sc-plate">' +
        plate +
        '</figure>' +
        '<h2 class="sc-h2">' +
        esc(artwork.title) +
        '</h2>' +
        (meta
          ? '<p class="sc-meta">' +
            esc(meta) +
            (artwork.series ? ' · ' + esc(artwork.series) : '') +
            '</p>'
          : '') +
        (artwork.description.trim()
          ? '<p class="sc-text">' + esc(artwork.description.trim()) + '</p>'
          : '') +
        '</div></li>'
      )
    })
    .join('')
  const cv = cvItems(data)
  const cm = commissionList(data, 'sc')
  return [
    '<div class="site-root artist-scroll site-scroll">',
    '  <div class="sc-wrap">',
    '    <header class="sc-head">',
    '      <p class="sc-kicker">Scroll · ' +
      works.length +
      ' works · ' +
      esc(data.location || data.title) +
      '</p>',
    '      <h1 class="sc-title">' + esc(works[0]?.series || data.name) + '</h1>',
    '      <p class="sc-lead">' + esc(data.bio.trim()) + '</p>',
    '    </header>',
    '    <ol class="sc-axis">' + pieces + '</ol>',
    cv.length
      ? '    <section class="sc-sect"><h2>展览履历</h2><ul class="sc-cv">' +
        cv.join('') +
        '</ul></section>'
      : '',
    cm
      ? '    <section class="sc-sect"><h2>合作</h2>' +
        commissionState(data, 'sc') +
        cm +
        mailLink(data, 'mail-cta') +
        '</section>'
      : '',
    '    <footer class="sc-foot"><span>© ' +
      new Date().getFullYear() +
      ' ' +
      esc(data.name) +
      '</span><span>Scroll · SiteCraft</span></footer>',
    '  </div>',
    '</div>',
  ]
    .filter(Boolean)
    .join('\n')
}
