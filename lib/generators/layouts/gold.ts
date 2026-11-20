/**
 * 鎏金 Gold —— 「殿堂」版式：
 * 中轴对称构图：金线装饰对、居中头像、徽章式技能（金色填充圆）、
 * 双线框展牌项目、菱形节点编年金线、邀请函式联系卡。
 * 特点：对称仪式感 + 金色细节（双框、菱形、渐变字）。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SERIF } from '../theme-consts'
import {
  avatarHTML,
  clampLevel,
  getSections,
  mailBtn,
  projectLinks,
  tagItems,
  orderSections,
} from './shared'

export const GOLD_CSS = `
.g-hl{display:inline-block;margin-right:8px;padding:1px 5px;font-size:10.5px;letter-spacing:.12em;
  color:var(--sp-ink);border:1px solid currentColor;border-radius:2px;vertical-align:2px;}
.site-gold{--bg:#0d0b08;--fg:#f5efe0;--muted:#a89e88;--line:#2e2a20;--panel:#171410;--fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO}}
.g-nav{display:flex;justify-content:center;flex-wrap:wrap;gap:32px;padding:20px 24px;border-bottom:1px solid var(--line)}
.g-nav a{font-family:var(--fm);font-size:11.5px;letter-spacing:.3em;color:var(--muted);text-transform:uppercase}
.g-nav a:hover{color:var(--sp)}
.g-hero{text-align:center;padding:64px 24px 72px;position:relative}
/* 主视觉锚点：一条金箔高光斜扫过整块 hero。不用渐变文字（失败即不可读），
   只在上层叠一条一次性掠光，播完 opacity 归零；reduced-motion 下默认不可见 */
.g-hero::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;
  background:linear-gradient(105deg,transparent 38%,rgba(247,231,161,.16) 47%,rgba(255,255,255,.24) 50%,rgba(247,231,161,.16) 53%,transparent 62%);
  background-size:260% 100%;background-repeat:no-repeat;opacity:0;
  animation:g-foil 1.6s .25s cubic-bezier(.3,.7,.4,1) both}
@keyframes g-foil{0%{opacity:0;background-position:180% 0}18%{opacity:1}78%{opacity:1}100%{opacity:0;background-position:-80% 0}}
.g-rules{width:220px;margin:0 auto 30px}
.g-rules i{display:block;height:1px;background:linear-gradient(90deg,transparent,var(--sp),transparent)}
.g-rules i + i{margin-top:5px;height:2px}
.g-face,.g-monogram{width:150px;height:150px;border-radius:50%;object-fit:cover;margin:0 auto;border:2px solid var(--sp);box-shadow:0 0 0 6px rgba(212,175,55,.08),0 0 36px var(--sp-glow)}
.g-monogram{display:grid;place-items:center;font-family:var(--fd);font-weight:700;font-size:52px;background:linear-gradient(135deg,#f3d97c,var(--sp) 60%,#9c7a1e);color:#171204}
.g-name{margin-top:28px;font-family:var(--fd);font-size:clamp(44px,7cqw,74px);font-weight:700;letter-spacing:.06em;font-style:normal;background:linear-gradient(100deg,#f7f0dd 12%,var(--sp) 50%,#f7f0dd 88%);-webkit-background-clip:text;background-clip:text;color:transparent}
.g-role{margin-top:14px;font-family:var(--fm);letter-spacing:.36em;font-size:12.5px;color:var(--sp);text-transform:uppercase}
.g-status{display:inline-flex;align-items:center;gap:11px;margin-top:22px;font-size:13px;color:var(--muted)}
.g-status::before{content:'';width:8px;height:8px;background:var(--sp);transform:rotate(45deg)}
.g-bio{margin:20px auto 0;max-width:56ch;color:var(--muted);line-height:1.9;font-size:14.5px}
.g-chips{margin-top:24px;display:flex;justify-content:center;flex-wrap:wrap;gap:12px}
.g-chip{display:inline-flex;align-items:center;gap:8px;font-family:var(--fm);font-size:12px;color:var(--muted);border:1px solid var(--line);padding:6px 14px;border-radius:2px}
.g-chip svg{width:13px;height:13px}
.g-ctas{margin-top:30px;display:flex;justify-content:center;flex-wrap:wrap;gap:14px}
.g-btn{display:inline-flex;align-items:center;gap:9px;padding:12px 28px;border-radius:3px;font-weight:700;font-size:14px;font-family:var(--fm);letter-spacing:.06em}
.g-btn svg{width:15px;height:15px}
.g-btn.primary{background:linear-gradient(120deg,var(--sp),#f3d97c);color:#171204}
.g-btn.primary:hover{box-shadow:0 6px 24px var(--sp-glow)}
.g-btn.ghost{border:1px solid rgba(212,175,55,.4);color:var(--sp)}
.g-sec{padding:68px 24px;border-top:1px solid var(--line)}
.g-sechead{text-align:center;margin-bottom:42px}
.g-kick{font-family:var(--fm);font-size:11px;letter-spacing:.24em;color:var(--sp);font-variant-caps:small-caps}
.g-h2{margin-top:10px;font-family:var(--fd);font-size:clamp(25px,3.4cqw,33px);font-weight:700;font-style:normal}
.g-hr{width:64px;height:2px;background:linear-gradient(90deg,transparent,var(--sp),transparent);margin:16px auto 0}
.g-medals{display:flex;flex-wrap:wrap;justify-content:center;gap:34px 44px;max-width:960px;margin:0 auto}
.g-medal{text-align:center}
.g-medal{width:104px}
/* 标签行：名字 + 百分比，和刻度一起放在圆外（字永远不压在水面上，对比度天然成立） */
.g-cap{display:flex;align-items:baseline;justify-content:center;gap:8px;margin-bottom:10px}
.g-cname{font-size:12.5px;color:var(--muted);font-weight:400;letter-spacing:.02em;white-space:nowrap}
.g-cnum{font-family:var(--fm);font-style:normal;font-size:12.5px;color:var(--sp);font-weight:700}
/* 液面圆：容器做裁剪（border-radius + overflow），不需要 clipPath id，
   同一页渲染多份也不会互相串；水面是 SVG 路径，边缘按设备像素绘制，没有锯齿 */
.g-med{position:relative;display:block;width:92px;height:92px;margin:0 auto;border-radius:50%;
  border:2px solid var(--sp);overflow:hidden;background:var(--panel)}
.g-med .g-wave{position:absolute;inset:0;width:100%;height:100%;display:block}
.g-lvl{transform-box:fill-box}
/* 两层水波错速流动：前波实心，后波半透明，形成水面的层次 */
.g-wave-p{transform-box:view-box;transform-origin:0 0}
.g-wave-front{fill:var(--sp);animation:g-flow 5.5s linear infinite}
.g-wave-back{fill:var(--sp);opacity:.34;animation:g-flow 9s linear infinite reverse}
@keyframes g-flow{from{transform:translateX(0)}to{transform:translateX(-50px)}}
.g-medal:hover .g-wave-front{animation-duration:2.6s}
.g-medal:hover .g-wave-back{animation-duration:4.4s}
.g-medal:hover .g-med{box-shadow:0 0 22px var(--sp-glow)}
.g-medal span{display:block;margin-top:13px;font-size:14px;color:var(--muted)}
.g-plates{display:grid;grid-template-columns:1fr 1fr;gap:26px;max-width:980px;margin:0 auto}
.g-plate{border:1px solid rgba(212,175,55,.42);outline:1px solid rgba(212,175,55,.16);outline-offset:5px;background:var(--panel);padding:24px;border-radius:3px;transition:outline-color .2s}
.g-plate:hover{outline-color:rgba(212,175,55,.4)}
.g-pname{font-family:var(--fd);font-size:20px;font-weight:700;overflow-wrap:anywhere}
.g-pdesc{margin-top:10px;color:var(--muted);font-size:13.5px;line-height:1.8}
.g-ptags{margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.g-ppoints{margin-top:10px;list-style:none;display:grid;gap:4px}
.g-ppoints li{position:relative;padding-left:13px;font-size:12.5px;line-height:1.7;color:var(--muted)}
.g-ppoints li::before{content:"";position:absolute;left:0;top:.6em;width:5px;height:1px;background:var(--sp)}
.g-ptag{font-family:var(--fm);font-size:11px;color:var(--sp);border:1px solid rgba(212,175,55,.35);padding:3px 10px;border-radius:2px}
.g-plinks{margin-top:14px;display:flex;gap:16px}
.g-plinks a{color:var(--sp);font-size:12px;font-family:var(--fm);letter-spacing:.08em}
.g-plinks a:hover{text-decoration:underline}
.g-chron{position:relative;max-width:760px;margin:0 auto;padding-left:36px}
.g-chron::before{content:'';position:absolute;left:8px;top:8px;bottom:8px;width:1px;background:linear-gradient(rgba(212,175,55,.55),rgba(212,175,55,.08))}
.g-era{position:relative;padding-bottom:34px}
.g-era:last-child{padding-bottom:0}
.g-era::before{content:'';position:absolute;left:-32px;top:8px;width:9px;height:9px;transform:rotate(45deg);background:var(--sp);box-shadow:0 0 12px var(--sp-glow)}
.g-ewhen{font-family:var(--fm);font-size:11.5px;color:var(--sp);letter-spacing:.22em}
.g-erole{font-family:var(--fd);font-size:18px;font-weight:700;margin-top:5px}
.g-eorg{font-size:13px;color:var(--muted);margin-top:2px}
.g-edesc{margin-top:9px;font-size:13.5px;color:var(--muted);line-height:1.85;max-width:56ch}
.g-invite{max-width:660px;margin:0 auto;border:1px solid rgba(212,175,55,.42);outline:1px solid rgba(212,175,55,.16);outline-offset:6px;background:var(--panel);padding:52px 36px;text-align:center;border-radius:3px}
.g-ih2{font-family:var(--fd);font-size:clamp(25px,4cqw,34px);font-weight:700;font-style:normal}
.g-ilead{margin-top:12px;color:var(--muted);font-size:14px;line-height:1.8;max-width:44ch;margin-inline:auto}
.g-imail{display:inline-flex;align-items:center;gap:10px;margin-top:24px;background:linear-gradient(120deg,var(--sp),#f3d97c);color:#171204;font-weight:700;padding:13px 30px;border-radius:3px;font-size:14.5px;font-family:var(--fm)}
.g-imail svg{width:15px;height:15px}
.g-isoc{margin-top:26px;display:flex;justify-content:center;gap:14px}
.g-isoc a{width:40px;height:40px;display:grid;place-items:center;border:1px solid rgba(212,175,55,.4);border-radius:50%;color:var(--sp)}
.g-isoc a:hover{background:rgba(212,175,55,.1)}
.g-foot{border-top:1px solid var(--line);text-align:center;padding:22px;font-family:var(--fm);font-size:11px;color:var(--muted);letter-spacing:.24em;text-transform:uppercase}
@container (max-width:760px){
.g-plates{grid-template-columns:1fr}
}
/* 入场：只做一次，落在名字上 */
.g-name{animation:sf-rise .9s cubic-bezier(.22,.7,.2,1) .08s both}
`

export function renderGold(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '勋章',
    projects: '展牌',
    experience: '编年',
    contact: '联络',
  }
  const nav = orderSections(sections, ['projects', 'skills', 'experience', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map((s) =>
      (() => {
        const lv = clampLevel(s.level)
        // 液面高度：viewBox 是 100×100，水面基线在 y = 100 - 熟练度；
        // 路径自带 ±7 的波峰，翻译到这条基线上就是一池水
        const y = (100 - lv).toFixed(1)
        // 一个周期 50 单位、铺满 200 宽；动画平移一个周期即无缝循环
        const WAVE =
          'M0,0 C6.25,-7 18.75,-7 25,0 C31.25,7 43.75,7 50,0 C56.25,-7 68.75,-7 75,0 C81.25,7 93.75,7 100,0 C106.25,-7 118.75,-7 125,0 C131.25,7 143.75,7 150,0 C156.25,-7 168.75,-7 175,0 C181.25,7 193.75,7 200,0 L200,200 L0,200 Z'
        return `<div class="g-medal"><span class="g-cap"><b class="g-cname">${esc(s.name)}</b><i class="g-cnum">${lv}%</i></span>
  <span class="g-med" role="img" aria-label="${esc(s.name)} 熟练度 ${lv}%">
    <svg class="g-wave" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g class="g-lvl" style="transform:translateY(${y}px)">
        <path class="g-wave-p g-wave-back" d="${WAVE}"/>
        <path class="g-wave-p g-wave-front" d="${WAVE}"/>
      </g>
    </svg>
  </span></div>`
      })()
    )
    .join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="g-plate">${p.highlight ? `<span class="g-hl">精选</span>` : ''}<h3 class="g-pname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="g-pdesc">${esc(p.description.trim())}</p>` : ''}
    ${p.points && p.points.length > 0 ? `<ul class="g-ppoints">${p.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="g-ptags">${tagItems(p.tags, 'g-ptag')}</ul>` : ''}
  ${links ? `<div class="g-plinks">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="g-era"><span class="g-ewhen">${esc(e.period)}</span>
  <h3 class="g-erole">${esc(e.role)}</h3>
  <p class="g-eorg">${esc(e.organization)}</p>
  ${e.description.trim() ? `<p class="g-edesc">${esc(e.description.trim())}</p>` : ''}</div>`
    )
    .join('')

  const socials = socialLinks(data, 'g-isoc', 'g-isoc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-gold">
  <nav class="g-nav" aria-label="站点导航">${nav}</nav>
  <main>
    <section class="g-hero">
      <div class="g-rules"><i></i><i></i></div>
      ${avatarHTML(data, 'g-face', 'g-monogram')}
        <h1 class="s-name g-name">${esc(data.name)}</h1>
      <p class="g-role">${esc(data.title)}</p>
      ${data.status.trim() ? `<p class="g-status">${esc(data.status.trim())}</p>` : ''}
      ${data.bio.trim() ? `<p class="g-bio">${esc(data.bio.trim())}</p>` : ''}
      <div class="g-chips">${chips(data)}</div>
      <div class="g-ctas">
        ${sections.some((s) => s.id === 'projects') ? `<a class="g-btn primary" href="#projects">查看作品</a>` : ''}
        ${mailBtn(data, '来信', 'g-btn ghost')}
      </div>
    </section>
    ${sections.some((s) => s.id === 'projects') ? `<section class="g-sec" id="projects"><div class="g-sechead"><p class="g-kick">WORKS</p><h2 class="g-h2">作品展牌</h2><div class="g-hr"></div></div><div class="g-plates">${projects}</div></section>` : ''}
    ${sections.some((s) => s.id === 'skills') ? `<section class="g-sec" id="skills"><div class="g-sechead"><p class="g-kick">SKILLS</p><h2 class="g-h2">技能勋章</h2><div class="g-hr"></div></div><div class="g-medals">${skills}</div></section>` : ''}
    ${sections.some((s) => s.id === 'experience') ? `<section class="g-sec" id="experience"><div class="g-sechead"><p class="g-kick">CHRONICLE</p><h2 class="g-h2">编年史</h2><div class="g-hr"></div></div><div class="g-chron">${experience}</div></section>` : ''}
    <section class="g-sec" id="contact" style="border-top:none">
      <div class="g-invite">
        <h2 class="g-ih2">一起聊聊？</h2>
        <p class="g-ilead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
        ${mailBtn(data, data.email.trim() || '来信', 'g-imail')}
        ${socials}
      </div>
    </section>
  </main>
  <footer class="g-foot">© ${year} ${esc(data.name)} · SiteCraft</footer>
</div>`
}

/** 鎏金版信息片 */
function chips(data: SiteData): string {
  return (
    (data.location.trim() ? `<span class="g-chip">${esc(data.location.trim())}</span>` : '') +
    (data.email.trim() ? `<span class="g-chip">${esc(data.email.trim())}</span>` : '')
  )
}
