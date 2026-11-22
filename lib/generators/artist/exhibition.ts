/**
 * 展览 Exhibition —— 艺术方向的第二套呈现。
 *
 * 与 Gallery 的差别不是换皮，是观看方式：
 * Gallery 是「画册」——竖排可扫、一次看很多；
 * Exhibition 是「动线」——横向一面墙挂一件，观众按策展顺序走过去。
 *
 * 刻意保留的三处不同于 Gallery：
 * 1. 横向 scroll-snap 作品墙，每屏一件（重点作品在前）；
 * 2. 展厅式顶栏与结尾的展览履历时间线；
 * 3. 作品墙可聚焦、可用键盘左右滚动；reduced-motion 下关闭平滑滚动。
 *
 * 实现上刻意不使用模板字符串拼接 HTML：本文件由多处条件片段组成，
 * 嵌套模板字面量极易写错（反引号会提前终止外层字符串），一律用字符串相加。
 */
import type { ArtistSiteData, Artwork } from '@/types/artist'
import { esc } from '../escape'
import { safeImageSource } from './gallery'

const ROLE_LABEL: Record<string, string> = { solo: '个展', group: '群展', other: '其他' }

function coverOf(artwork: Artwork): string {
  const first = artwork.media[0]?.url ?? ''
  return safeImageSource(artwork.cover) || safeImageSource(first) || ''
}

function renderPiece(artwork: Artwork, index: number): string {
  const src = coverOf(artwork)
  const meta = [artwork.medium.trim(), artwork.dimensions.trim()].filter(Boolean).join(' · ')
  const metaLine = [meta, artwork.year].filter(Boolean).join(' · ')
  const frame = src
    ? '<img src="' +
      src +
      '" alt="' +
      esc(artwork.title) +
      '" loading="' +
      (index < 2 ? 'eager' : 'lazy') +
      '">'
    : '<div class="ex-blank" aria-hidden="true"></div>'
  const lines = [
    '<figure class="ex-piece" aria-label="' + esc(artwork.title) + '">',
    '  <div class="ex-frame">' + frame + '</div>',
    '  <figcaption>',
    '    <p class="ex-index">' +
      String(index + 1).padStart(2, '0') +
      (artwork.series ? ' · ' + esc(artwork.series) : '') +
      '</p>',
    '    <h3>' + esc(artwork.title) + '</h3>',
    metaLine ? '    <p class="ex-meta">' + esc(metaLine) + '</p>' : '',
    artwork.description.trim()
      ? '    <p class="ex-desc">' + esc(artwork.description.trim()) + '</p>'
      : '',
    '  </figcaption>',
    '</figure>',
  ]
  return lines.filter(Boolean).join('\n    ')
}

/** 合作条目：只输出有内容的行 */
function commissionRows(commissions: ArtistSiteData['commissions']): string[][] {
  if (!commissions) return []
  const rows: Array<[string, string]> = [
    ['范围', commissions.scope.trim()],
    ['流程', commissions.process.trim()],
    ['档期', commissions.leadTime.trim()],
    ['起价', commissions.priceFrom.trim()],
  ]
  return rows.filter(([, value]) => value !== '').map(([k, value]) => [k, value])
}

export function renderExhibitionBody(data: ArtistSiteData): string {
  const works = [...data.artworks].sort((a, b) => Number(b.featured) - Number(a.featured))
  const mail = data.email.trim()
  const lead = data.bio.trim().split('。')[0] + (data.bio.trim().includes('。') ? '。' : '')
  const city = data.location ? ' · ' + esc(data.location) : ''

  // 展览履历
  const cv = (data.exhibitions ?? [])
    .filter((item) => item.title.trim())
    .sort((a, b) => (b.year || '').localeCompare(a.year || ''))
    .map((item) => {
      const name = esc(item.title) + (item.venue ? '，' + esc(item.venue) : '')
      return (
        '<li><span class="ex-year">' +
        esc(item.year || '—') +
        '</span>' +
        '<span class="ex-role">' +
        esc(ROLE_LABEL[item.role] ?? '') +
        '</span>' +
        '<span class="ex-show">' +
        name +
        '</span></li>'
      )
    })
    .join('')

  // 合作/约稿
  const rows = commissionRows(data.commissions)
  const commissionsHtml = rows
    .map((pair) => '<div><dt>' + esc(pair[0]) + '</dt><dd>' + esc(pair[1]) + '</dd></div>')
    .join('')
  const commissionBlock = rows.length
    ? '<section id="commissions" class="ex-commissions"><div class="ex-cvhead"><h2>合作</h2>' +
      '<span class="ex-kicker">' +
      (data.commissions?.open ? 'Open for commissions' : 'Closed') +
      '</span></div>' +
      '<p class="ex-cm-state">' +
      (data.commissions?.open ? '目前接单中' : '暂不接单，仍欢迎来信交流') +
      '</p>' +
      '<dl class="ex-cm-list">' +
      commissionsHtml +
      '</dl>' +
      (mail
        ? '<p class="ex-cm-cta"><a href="mailto:' +
          esc(mail) +
          '?subject=' +
          encodeURIComponent('合作咨询') +
          '">来信谈合作 →</a></p>'
        : '') +
      '</section>'
    : ''

  const cvBlock = cv
    ? '<section id="cv" class="ex-cv"><div class="ex-cvhead"><h2>展览履历</h2>' +
      '<span class="ex-kicker">Exhibitions &amp; CV</span></div><ul class="ex-list">' +
      cv +
      '</ul></section>'
    : ''

  const navItems = [
    '<a href="#wall">作品墙</a>',
    cv ? '<a href="#cv">展览履历</a>' : '',
    commissionBlock ? '<a href="#commissions">合作</a>' : '',
    mail ? '<a href="mailto:' + esc(mail) + '">联系</a>' : '',
  ].join('')

  const contact = [
    mail ? '<a href="mailto:' + esc(mail) + '">' + esc(mail) + '</a>' : '',
    data.socials.website
      ? '<a href="' + esc(data.socials.website) + '" rel="noopener noreferrer">个人网站</a>'
      : '',
  ]
    .filter(Boolean)
    .join('')

  const wall = works.map((artwork, index) => renderPiece(artwork, index)).join('\n')

  return [
    '<div class="site-root artist-exhibition site-exhibition">',
    '  <header class="ex-bar">',
    '    <a class="ex-brand" href="#top">' + esc(data.name) + '</a>',
    '    <nav class="ex-nav" aria-label="展览导航">' + navItems + '</nav>',
    '  </header>',
    '  <main id="top" class="ex-main">',
    '    <section class="ex-intro">',
    '      <p class="ex-kicker">Exhibition · ' + esc(data.title) + city + '</p>',
    '      <h1 class="ex-title">' + esc(works[0]?.series || data.name) + '</h1>',
    '      <p class="ex-lead">' + esc(lead) + '</p>',
    '      <p class="ex-count">' + works.length + ' 件作品 · 按策展顺序排列 · 左右滑动观看</p>',
    '    </section>',
    '    <section id="wall" class="ex-wall-section" aria-label="作品墙">',
    '      <div class="ex-wall" tabindex="0" role="group" aria-label="作品墙：每屏一件作品，可用左右方向键切换">',
    wall,
    '      </div>',
    '    </section>',
    cvBlock,
    commissionBlock,
    '    <section class="ex-outro">',
    '      <div>',
    '        <p class="ex-kicker">Contact</p>',
    '        <h2>' + esc(data.name) + '</h2>',
    '        <p class="ex-meta">' + esc(data.title) + city + '</p>',
    '      </div>',
    '      <div class="ex-contact">' + contact + '</div>',
    '    </section>',
    '  </main>',
    '  <footer class="ex-footer"><span>© ' +
      new Date().getFullYear() +
      ' ' +
      esc(data.name) +
      '</span><span>Exhibition · SiteCraft</span></footer>',
    '</div>',
  ]
    .filter(Boolean)
    .join('\n')
}
export function renderExhibitionCSS(): string {
  return `body{margin:0;background:#eeeee9}
.artist-exhibition,.artist-exhibition *{box-sizing:border-box}
.artist-exhibition{--ex-ink:#191817;--ex-mute:#6a6660;--ex-line:rgba(25,24,23,.16);--ex-paper:#eeeee9;
  background:var(--ex-paper);color:var(--ex-ink);font-family:Georgia,'Times New Roman',serif;
  min-height:100vh;display:flex;flex-direction:column}
.artist-exhibition :where(a){color:inherit;text-decoration:none;transition:opacity .2s ease}
.artist-exhibition :where(a:hover){opacity:.6}
.artist-exhibition :where(a,button):focus-visible{outline:2px solid var(--ex-ink);outline-offset:3px}
.ex-bar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:10px clamp(16px,4vw,48px);border-bottom:1px solid var(--ex-line);
  background:rgba(238,238,233,.9);backdrop-filter:blur(8px)}
.ex-brand{display:inline-flex;align-items:center;min-height:24px;font-size:15px;letter-spacing:.02em}
.ex-nav{display:flex;gap:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase}
.ex-nav a{display:inline-flex;align-items:center;min-height:24px;color:var(--ex-mute)}
.ex-main{flex:1;width:100%;max-width:1360px;margin:0 auto;box-sizing:border-box;padding:clamp(28px,5vw,64px) clamp(16px,4vw,48px) 40px}
@keyframes ex-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.ex-intro{max-width:820px}
.ex-kicker{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--ex-mute);margin:0 0 12px}
.ex-title{margin:0;font-size:clamp(44px,7vw,76px);line-height:1.02;letter-spacing:-.01em;font-weight:400;
  animation:ex-in .8s cubic-bezier(.3,1.1,.64,1) both}
.ex-lead{margin:18px 0 0;font-size:16px;line-height:1.9;color:var(--ex-mute);max-width:60ch}
.ex-count{margin:14px 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;
  letter-spacing:.12em;color:var(--ex-mute)}
.ex-wall-section{margin:clamp(24px,4vw,44px) 0 0}
.ex-wall{display:flex;gap:clamp(16px,3vw,40px);overflow-x:auto;overscroll-behavior-x:contain;
  scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:4px 4px 18px;scrollbar-width:thin}
.ex-wall:focus-visible{outline:2px solid var(--ex-ink);outline-offset:4px}
.ex-piece{flex:0 0 clamp(260px,58vw,520px);margin:0;scroll-snap-align:center;scroll-snap-stop:always}
.ex-frame{background:rgba(25,24,23,.04);border:1px solid var(--ex-line);display:flex;align-items:center;justify-content:center;
  height:clamp(300px,52vh,520px);overflow:hidden}
.ex-frame img{width:100%;height:100%;object-fit:contain;transition:transform .6s cubic-bezier(.2,.7,.3,1)}
.ex-piece:hover .ex-frame img{transform:scale(1.02)}
.ex-blank{width:100%;height:100%;background:repeating-linear-gradient(45deg,rgba(25,24,23,.05) 0 8px,transparent 8px 16px)}
.ex-piece figcaption{margin-top:12px}
.ex-index{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.14em;color:var(--ex-mute)}
.ex-piece h3{margin:6px 0 0;font-size:19px;font-weight:400;line-height:1.35}
.ex-meta{margin:6px 0 0;font-size:12.5px;color:var(--ex-mute);font-variant-numeric:tabular-nums}
.ex-desc{margin:8px 0 0;font-size:13px;line-height:1.8;color:var(--ex-mute);max-width:42ch}
.ex-cv{margin-top:clamp(36px,6vw,72px);border-top:1px solid var(--ex-line);padding-top:26px}
.ex-cvhead{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:14px}
.ex-cvhead h2{margin:0;font-size:24px;font-weight:400}
.ex-list{list-style:none;margin:0;padding:0}
.ex-list li{display:grid;grid-template-columns:64px 52px 1fr;gap:14px;align-items:baseline;
  padding:10px 0;border-bottom:1px solid rgba(25,24,23,.09)}
.ex-year{font-variant-numeric:tabular-nums;font-size:13px;color:var(--ex-mute)}
.ex-role{font-size:11px;letter-spacing:.08em;color:var(--ex-mute)}
.ex-show{font-size:14.5px;line-height:1.6}
.ex-commissions{margin-top:clamp(36px,6vw,72px);border-top:1px solid var(--ex-line);padding-top:26px}
.ex-cm-state{margin:0 0 14px;font-size:13.5px;color:var(--ex-mute)}
.ex-cm-list{margin:0;display:grid;gap:10px}
.ex-cm-list > div{display:grid;grid-template-columns:64px 1fr;gap:14px;align-items:baseline;padding-bottom:10px;border-bottom:1px solid rgba(25,24,23,.09)}
.ex-cm-list dt{font-size:11px;letter-spacing:.1em;color:var(--ex-mute);text-transform:uppercase}
.ex-cm-list dd{margin:0;font-size:14px;line-height:1.75}
.ex-cm-c2{}
.ex-cm-cta{margin:18px 0 0;font-size:15px}
.ex-cm-cta a{display:inline-flex;align-items:center;min-height:24px;border-bottom:1px solid rgba(25,24,23,.35)}
.ex-outro{margin-top:clamp(36px,6vw,72px);border-top:1px solid var(--ex-line);padding-top:26px;
  display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-end}
.ex-outro h2{margin:0;font-size:28px;font-weight:400}
.ex-contact{display:flex;flex-direction:column;gap:6px;font-size:13.5px}
.ex-contact a{display:inline-flex;align-items:center;min-height:24px;border-bottom:1px solid var(--ex-line)}
.ex-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;
  padding:18px clamp(16px,4vw,48px);border-top:1px solid var(--ex-line);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.1em;color:var(--ex-mute)}
@container (max-width:640px){
  .ex-list li{grid-template-columns:52px 1fr;gap:8px}
  .ex-role{grid-column:2;font-size:10.5px}
  .ex-show{grid-column:2}
  .ex-outro{flex-direction:column;align-items:flex-start}
}
@media (prefers-reduced-motion:reduce){
  .ex-title{animation:none}
  .ex-wall{scroll-behavior:auto}
  .ex-frame img,.artist-exhibition :where(a){transition:none}
  .ex-piece:hover .ex-frame img{transform:none}
}`
}
