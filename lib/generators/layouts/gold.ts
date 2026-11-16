/**
 * 鎏金 Gold —— 「殿堂」版式：
 * 中轴对称构图：金线装饰对、居中头像、徽章式技能（双环金章）、
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
} from './shared'

export const GOLD_CSS = `
.site-gold{--bg:#0d0b08;--fg:#f5efe0;--muted:#a89e88;--line:#2e2a20;--panel:#171410;--fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO}}
.g-nav{display:flex;justify-content:center;flex-wrap:wrap;gap:32px;padding:20px 24px;border-bottom:1px solid var(--line)}
.g-nav a{font-family:var(--fm);font-size:11.5px;letter-spacing:.3em;color:var(--muted);text-transform:uppercase}
.g-nav a:hover{color:var(--sp)}
.g-hero{text-align:center;padding:88px 24px 72px;position:relative}
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
.g-kick{font-family:var(--fm);font-size:10.5px;letter-spacing:.44em;color:var(--sp);text-transform:uppercase}
.g-h2{margin-top:10px;font-family:var(--fd);font-size:clamp(25px,3.4cqw,33px);font-weight:700;font-style:normal}
.g-hr{width:64px;height:2px;background:linear-gradient(90deg,transparent,var(--sp),transparent);margin:16px auto 0}
.g-medals{display:flex;flex-wrap:wrap;justify-content:center;gap:34px 44px;max-width:960px;margin:0 auto}
.g-medal{text-align:center}
.g-med{width:92px;height:92px;margin:0 auto;border-radius:50%;border:2px solid var(--sp);display:grid;place-items:center;box-shadow:0 0 0 5px rgba(212,175,55,.07),inset 0 0 0 5px rgba(212,175,55,.14);transition:box-shadow .2s}
.g-medal:hover .g-med{box-shadow:0 0 0 5px rgba(212,175,55,.07),inset 0 0 0 5px rgba(212,175,55,.14),0 0 26px var(--sp-glow)}
.g-med b{font-family:var(--fm);font-size:16px;color:var(--fg);font-weight:700}
.g-medal span{display:block;margin-top:13px;font-size:14px;color:var(--muted)}
.g-plates{display:grid;grid-template-columns:1fr 1fr;gap:26px;max-width:980px;margin:0 auto}
.g-plate{border:1px solid rgba(212,175,55,.42);outline:1px solid rgba(212,175,55,.16);outline-offset:5px;background:var(--panel);padding:24px;border-radius:3px;transition:outline-color .2s}
.g-plate:hover{outline-color:rgba(212,175,55,.4)}
.g-pname{font-family:var(--fd);font-size:20px;font-weight:700;overflow-wrap:anywhere}
.g-pdesc{margin-top:10px;color:var(--muted);font-size:13.5px;line-height:1.8}
.g-ptags{margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;list-style:none}
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
`

export function renderGold(data: SiteData): string {
  const sections = getSections(data)
  const nav = sections.map((s) => `<a href="#${s.id}">${s.navLabel}</a>`).join('')

  const skills = data.skills
    .map(
      (s) => `<div class="g-medal"><span class="g-med"><b>${clampLevel(s.level)}</b></span><span>${esc(s.name)}</span></div>`
    )
    .join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="g-plate"><h3 class="g-pname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="g-pdesc">${esc(p.description.trim())}</p>` : ''}
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
    ${sections.some((s) => s.id === 'skills') ? `<section class="g-sec" id="skills"><div class="g-sechead"><p class="g-kick">SKILLS</p><h2 class="g-h2">技能勋章</h2><div class="g-hr"></div></div><div class="g-medals">${skills}</div></section>` : ''}
    ${sections.some((s) => s.id === 'projects') ? `<section class="g-sec" id="projects"><div class="g-sechead"><p class="g-kick">WORKS</p><h2 class="g-h2">作品展牌</h2><div class="g-hr"></div></div><div class="g-plates">${projects}</div></section>` : ''}
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
    (data.location.trim()
      ? `<span class="g-chip">${esc(data.location.trim())}</span>`
      : '') +
    (data.email.trim() ? `<span class="g-chip">${esc(data.email.trim())}</span>` : '')
  )
}
