/**
 * 印样 Contact Sheet —— 摄影师式观看：一格一格选片。
 * 母题来自暗房：胶片齿孔带、帧号、烧边；密排小图让人一眼看到全部素材，
 * 与画廊的「大图巡览」、展览的「横向动线」都不同。
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

export const CONTACT_CSS = `
.artist-contact{--cs-bg:#12110f;--cs-ink:#f2efe8;--cs-mute:#9a948a;--cs-line:rgba(242,239,232,.16);--cs-accent:#d8ff3e;
  background:var(--cs-bg);color:var(--cs-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  container-type:inline-size;min-height:100%}
.artist-contact *{box-sizing:border-box}
.artist-contact a{color:inherit;text-decoration:none;transition:color .2s ease,opacity .2s ease}
.artist-contact a:hover{color:var(--cs-accent)}
.artist-contact :where(a,button,summary):focus-visible{outline:2px solid var(--cs-accent);outline-offset:3px}
.cs-wrap{max-width:1200px;margin:0 auto;padding:clamp(24px,5vw,56px) clamp(16px,4vw,44px) 48px}
.cs-head{border-bottom:1px solid var(--cs-line);padding-bottom:18px}
.cs-kicker{margin:0;font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:var(--cs-mute)}
@keyframes cs-draw{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.cs-title{margin:12px 0 0;font-family:Georgia,serif;font-weight:400;font-size:clamp(44px,7vw,74px);line-height:1;letter-spacing:-.02em;animation:cs-draw .8s cubic-bezier(.3,1.1,.64,1) both}
.cs-lead{margin:14px 0 0;max-width:58ch;font-family:Georgia,serif;font-size:15.5px;line-height:1.8;color:var(--cs-mute)}
.cs-strip{list-style:none;margin:clamp(20px,4vw,34px) 0 0;padding:14px 0;display:grid;gap:2px;
  grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  background:repeating-linear-gradient(90deg,var(--cs-line) 0 6px,transparent 6px 18px) top/100% 10px no-repeat,
             repeating-linear-gradient(90deg,var(--cs-line) 0 6px,transparent 6px 18px) bottom/100% 10px no-repeat}
.cs-frame{margin:0;background:#1b1917;border:1px solid var(--cs-line);padding:8px 8px 6px}
.cs-shot{display:block;position:relative;overflow:hidden;background:#0a0a09;aspect-ratio:4/5}
.cs-shot img{width:100%;height:100%;object-fit:cover;filter:grayscale(.15) contrast(1.05);transition:transform .6s cubic-bezier(.2,.7,.3,1),filter .3s ease}
.cs-frame:hover .cs-shot img{transform:scale(1.03);filter:none}
.cs-blank{display:grid;place-items:center;height:100%;font-size:10px;letter-spacing:.2em;color:var(--cs-mute)}
.cs-cap{display:flex;gap:8px;align-items:baseline;margin:7px 0 0;font-size:10.5px;letter-spacing:.06em;color:var(--cs-mute)}
.cs-no{color:var(--cs-accent);font-weight:700}
.cs-cap b{color:var(--cs-ink);font-weight:500}
.cs-sect{margin-top:clamp(32px,6vw,60px);border-top:1px solid var(--cs-line);padding-top:20px}
.cs-sect h2{margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:22px}
.cs-cv{list-style:none;margin:0;padding:0;font-size:12.5px}
.cs-cv li{display:grid;grid-template-columns:58px 52px 1fr;gap:12px;padding:7px 0;border-bottom:1px dashed var(--cs-line)}
.cv-year{color:var(--cs-accent)}
.cv-role,.cv-show{color:var(--cs-mute)}
.cs-cm-list{margin:0;display:grid;gap:8px;font-size:12.5px}
.cs-cm-list > div{display:grid;grid-template-columns:56px 1fr;gap:12px}
.cs-cm-list dt{margin:0;color:var(--cs-mute);letter-spacing:.1em}
.cs-cm-list dd{margin:0;line-height:1.7}
.cs-cm-state{margin:10px 0 0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--cs-accent)}
.cs-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--cs-accent);margin-right:7px}
.mail-cta{display:inline-flex;align-items:center;min-height:24px;margin-top:12px;font-size:12.5px;border-bottom:1px solid var(--cs-accent)}
.cs-foot{margin-top:32px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--cs-mute)}
@container (max-width:560px){.cs-cv li{grid-template-columns:52px 1fr;gap:8px}.cv-role{grid-column:2}}
@media (prefers-reduced-motion:reduce){.cs-title{animation:none}.cs-shot img{transition:none}.cs-frame:hover .cs-shot img{transform:none}}
`

export function renderContactBody(data: ArtistSiteData): string {
  const works = curated(data.artworks)
  const lead = data.bio.trim().split('。')[0]
  const frames = works
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
        : '<span class="cs-blank">NO FRAME</span>'
      const meta = metaLine(artwork)
      return (
        '<li class="cs-frame"><span class="cs-shot">' +
        shot +
        '</span>' +
        '<p class="cs-cap"><span class="cs-no">' +
        String(index + 1).padStart(2, '0') +
        '</span>' +
        '<b>' +
        esc(artwork.title) +
        '</b>' +
        (meta ? ' · ' + esc(meta) : '') +
        '</p></li>'
      )
    })
    .join('')
  const cv = cvItems(data)
  const cm = commissionList(data, 'cs')
  return [
    '<div class="site-root artist-contact site-contact">',
    '  <div class="cs-wrap">',
    '    <header class="cs-head">',
    '      <p class="cs-kicker">Contact sheet · ' +
      works.length +
      ' frames · ' +
      esc(data.location || data.title) +
      '</p>',
    '      <h1 class="cs-title">' + esc(works[0]?.series || data.name) + '</h1>',
    '      <p class="cs-lead">' + esc(lead) + '</p>',
    '    </header>',
    '    <ol class="cs-strip">' + frames + '</ol>',
    cv.length
      ? '    <section class="cs-sect"><h2>展览履历</h2><ul class="cs-cv">' +
        cv.join('') +
        '</ul></section>'
      : '',
    cm
      ? '    <section class="cs-sect"><h2>合作</h2>' +
        cm +
        commissionState(data, 'cs') +
        mailLink(data, 'mail-cta') +
        '</section>'
      : '',
    '    <footer class="cs-foot"><span>© ' +
      new Date().getFullYear() +
      ' ' +
      esc(data.name) +
      '</span><span>Contact sheet · SiteCraft</span></footer>',
    '  </div>',
    '</div>',
  ]
    .filter(Boolean)
    .join('\n')
}
