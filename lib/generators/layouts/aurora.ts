/**
 * 极光 Aurora —— 「光屿」版式：
 * 居中构图 + 环形技能（conic-gradient 圆环 + 中央数字）、上下浮动的玻璃岛项目卡、
 * 发光时间线。特点：环形进度与漂浮节奏，深空里的玻璃质感。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import {
  avatarHTML,
  chipsHTML,
  clampLevel,
  skillLevelVisible,
  getSections,
  mailBtn,
  projectLinks,
  tagItems,
  orderSections,
} from './shared'

export const AURORA_CSS = `
.site-aurora{--bg:#070b16;--fg:#e8eef8;--muted:#93a3ba;--line:rgba(148,163,184,.16);--panel:rgba(17,26,46,.52);--track:rgba(148,163,184,.14);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.a-space{position:relative;overflow:hidden;background-image:radial-gradient(760px 420px at 50% -12%,rgba(139,92,246,.16),transparent 70%),radial-gradient(560px 320px at 85% 8%,rgba(56,189,248,.1),transparent 72%)}
.a-nav{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px clamp(20px,4cqw,48px);border-bottom:1px solid rgba(148,163,184,.12);backdrop-filter:blur(14px)}
.a-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px}
.a-mark{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-weight:800;font-size:14px;background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp);box-shadow:0 0 18px var(--sp-glow)}
.a-navlinks{display:flex;gap:22px;font-size:13.5px}
.a-navlinks a{color:var(--muted)}
.a-navlinks a:hover{color:var(--sp)}
.a-hero{position:relative;z-index:1;text-align:center;padding:88px 24px 84px}
/* 主视觉锚点：一道压扁的巨大椭圆边线，像地平线上的极光弧。
   弧线本身是结构（不是又一层模糊光斑），上面那层极淡的径向渐变只是它的大气辉光 */
.a-hero::after{content:"";position:absolute;left:50%;top:54px;width:168%;height:560px;z-index:-1;
  transform:translateX(-50%) rotate(-7deg);border-radius:50%;
  border-top:1px solid rgba(45,212,191,.42);
  background:radial-gradient(120% 90% at 50% 0%,rgba(167,139,250,.12),transparent 62%);
  pointer-events:none;opacity:0;animation:a-arc 1.1s .15s cubic-bezier(.22,.7,.2,1) both}
@keyframes a-arc{from{opacity:0;transform:translateX(-50%) rotate(-7deg) translateY(18px)}
  to{opacity:1;transform:translateX(-50%) rotate(-7deg) translateY(0)}}
.a-hero::before{content:'';position:absolute;right:6%;top:12%;width:230px;height:230px;border-radius:50%;background:radial-gradient(circle at 35% 35%,var(--sp-soft),transparent 65%);filter:blur(30px);pointer-events:none}
.a-face,.a-monogram{width:168px;height:168px;border-radius:50%;object-fit:cover;margin:0 auto;border:2px solid rgba(148,163,184,.35);box-shadow:0 0 0 12px rgba(148,163,184,.06),0 0 46px var(--sp-glow)}
.a-monogram{display:grid;place-items:center;font-weight:800;font-size:56px;background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp)}
.a-status{display:inline-flex;align-items:center;gap:9px;margin-top:30px;padding:8px 18px;border-radius:999px;border:1px solid rgba(148,163,184,.2);background:var(--panel);backdrop-filter:blur(8px);font-size:13px;color:var(--muted)}
.a-status::before{content:'';width:8px;height:8px;border-radius:50%;background:#34d399;animation:sp-pulse 2.4s infinite}
.a-name{margin-top:20px;font-size:clamp(46px,7cqw,74px);font-weight:800;letter-spacing:-.01em;font-style:normal;background:linear-gradient(96deg,var(--fg) 18%,var(--sp) 56%,var(--sp2));-webkit-background-clip:text;background-clip:text;color:transparent}
.a-role{margin-top:10px;color:var(--sp);font-size:16.5px;letter-spacing:.03em}
.a-bio{margin:18px auto 0;max-width:58ch;color:var(--muted);line-height:1.85;font-size:15px}
.a-chips{margin-top:26px;display:flex;justify-content:center;flex-wrap:wrap;gap:10px}
.a-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 15px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:var(--panel);backdrop-filter:blur(8px);font-size:12.5px;color:var(--muted)}
.a-chip svg{width:13px;height:13px}
.a-ctas{margin-top:30px;display:flex;justify-content:center;flex-wrap:wrap;gap:14px}
.a-btn{display:inline-flex;align-items:center;gap:9px;padding:12px 26px;border-radius:12px;font-weight:700;font-size:14.5px}
.a-btn svg{width:16px;height:16px}
.a-btn.primary{background:linear-gradient(120deg,var(--sp),var(--sp2));color:var(--on-sp);box-shadow:0 8px 30px var(--sp-glow)}
.a-btn.primary:hover{transform:translateY(-2px)}
.a-btn.ghost{border:1px solid rgba(148,163,184,.24);color:var(--fg);background:var(--panel);backdrop-filter:blur(8px)}
.a-wrap{max-width:1040px;margin:0 auto;padding:0 24px}
.a-sec{position:relative;z-index:1;padding:72px 0 0}
.a-kick{text-align:center;font-family:var(--fm);letter-spacing:.36em;font-size:11.5px;color:var(--sp);text-transform:uppercase}
.a-h2{text-align:center;margin-top:10px;font-size:clamp(26px,3.6cqw,36px);font-weight:800;font-style:normal;color:var(--fg);background:none;-webkit-text-fill-color:currentColor}
.a-rings{display:flex;flex-wrap:wrap;justify-content:center;gap:40px 52px;margin-top:46px}
.a-ring{width:128px;text-align:center}
.a-discbox{position:relative;width:102px;height:102px;margin:0 auto}
.a-disc{position:absolute;inset:0;border-radius:50%;background:conic-gradient(var(--sp) calc(var(--p)*1%),var(--track) 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 13px),#000 calc(100% - 12px));mask:radial-gradient(farthest-side,transparent calc(100% - 13px),#000 calc(100% - 12px));filter:drop-shadow(0 0 14px var(--sp-glow))}
.a-num{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--fm);font-weight:700;font-size:16px;color:var(--fg)}
.a-rname{display:block;margin-top:12px;font-size:13.5px;color:var(--muted)}
.a-isles{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:46px}
.a-isle{background:var(--panel);backdrop-filter:blur(14px);border:1px solid rgba(148,163,184,.15);border-radius:18px;padding:24px;position:relative;overflow:hidden;transition:border-color .2s,transform .2s}
.a-isle::before{content:'';position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.06),transparent 42%);pointer-events:none}
.a-isle:nth-child(odd){transform:translateY(8px)}
.a-isle:nth-child(even){transform:translateY(-8px)}
.a-isle:hover{border-color:var(--sp)}
.a-iname{font-weight:700;font-size:18px;overflow-wrap:anywhere}
.a-idesc{margin-top:8px;color:var(--muted);font-size:13.5px;line-height:1.75}
.a-itags{margin-top:13px;display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.a-itag{background:var(--sp-soft);color:var(--fg);padding:4px 12px;border-radius:999px;font-family:var(--fm);font-size:11.5px}
.a-ilinks{margin-top:13px;display:flex;gap:16px}
.a-ilinks a{color:var(--sp);font-size:13px;font-weight:600}
.a-ilinks a:hover{text-decoration:underline}
.a-tl{position:relative;margin-top:46px;padding-left:32px;max-width:760px}
.a-tl::before{content:'';position:absolute;left:8px;top:6px;bottom:6px;width:2px;background:linear-gradient(var(--sp-glow),transparent)}
.a-tev{position:relative;padding-bottom:30px}
.a-tev:last-child{padding-bottom:0}
.a-tev::before{content:'';position:absolute;left:-28px;top:7px;width:9px;height:9px;border-radius:50%;background:var(--sp);box-shadow:0 0 14px var(--sp-glow)}
.a-twhen{font-family:var(--fm);font-size:12px;color:var(--sp)}
.a-trole{font-weight:700;font-size:17px;margin-top:4px}
.a-torg{font-size:13px;color:var(--muted);margin-top:2px}
.a-tdesc{margin-top:8px;font-size:13.5px;color:var(--muted);line-height:1.8;max-width:58ch}
.a-dome{margin-top:72px;background:var(--panel);backdrop-filter:blur(16px);border:1px solid rgba(148,163,184,.18);border-radius:26px;padding:56px 32px;text-align:center;position:relative;z-index:1}
.a-dh2{font-size:clamp(26px,4cqw,36px);font-weight:800;font-style:normal;color:var(--fg);background:none;-webkit-text-fill-color:currentColor}
.a-dlead{margin-top:12px;color:var(--muted);font-size:14.5px;max-width:46ch;margin-inline:auto}
.a-dmail{display:inline-flex;align-items:center;gap:10px;margin-top:24px;background:linear-gradient(120deg,var(--sp),var(--sp2));color:var(--on-sp);padding:14px 30px;border-radius:14px;font-weight:700;font-size:15px;box-shadow:0 8px 30px var(--sp-glow)}
.a-dmail svg{width:16px;height:16px}
.a-dsoc{margin-top:26px;display:flex;justify-content:center;gap:12px}
.a-dsoc a{width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(148,163,184,.22);border-radius:12px;color:var(--muted);background:rgba(17,26,46,.5)}
.a-dsoc a:hover{color:var(--sp);border-color:var(--sp)}
.a-foot{position:relative;z-index:1;border-top:1px solid rgba(148,163,184,.12);margin-top:72px;padding:22px;text-align:center;font-family:var(--fm);font-size:11.5px;color:var(--muted)}
@container (max-width:760px){
.a-isles{grid-template-columns:1fr}
.a-isle:nth-child(odd),.a-isle:nth-child(even){transform:none}
.a-navlinks{display:none}
}
/* 入场：只做一次，落在名字上 */
.a-name{animation:sf-glow .95s cubic-bezier(.22,.7,.2,1) .1s both}
`

export function renderAurora(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '能力',
    projects: '作品',
    experience: '轨迹',
    contact: '联络',
  }
  const nav = orderSections(sections, ['projects', 'experience', 'skills', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map((s) =>
      skillLevelVisible(data)
        ? `<div class="a-ring"><span class="a-discbox"><span class="a-disc" style="--p:${clampLevel(s.level)}"></span><span class="a-num">${clampLevel(s.level)}</span></span><span class="a-rname">${esc(s.name)}</span></div>`
        : `<div class="a-ring"><span class="a-rname">${esc(s.name)}</span></div>`
    )
    .join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="a-isle"><h3 class="a-iname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="a-idesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="a-itags">${tagItems(p.tags, 'a-itag')}</ul>` : ''}
  ${links ? `<div class="a-ilinks">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="a-tev"><span class="a-twhen">${esc(e.period)}</span>
  <h3 class="a-trole">${esc(e.role)}</h3>
  <p class="a-torg">${esc(e.organization)}</p>
  ${e.description.trim() ? `<p class="a-tdesc">${esc(e.description.trim())}</p>` : ''}</div>`
    )
    .join('')

  const socials = socialLinks(data, 'a-dsoc', 'a-dsoc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-aurora">
  <div class="a-space">
    <header class="a-nav"><span class="a-brand"><span class="a-mark">${esc(data.name.trim().charAt(0).toUpperCase())}</span>${esc(data.name)}</span><nav class="a-navlinks" aria-label="站点导航">${nav}</nav></header>
    <main>
      <section class="a-hero">
        ${avatarHTML(data, 'a-face', 'a-monogram')}
        ${data.status.trim() ? `<p class="a-status">${esc(data.status.trim())}</p>` : ''}
        <h1 class="s-name a-name">${esc(data.name)}</h1>
        <p class="a-role">${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="a-bio">${esc(data.bio.trim())}</p>` : ''}
        <div class="a-chips">${chipsHTML(data, 'a-chip')}</div>
        <div class="a-ctas">
          ${sections.some((s) => s.id === 'projects') ? `<a class="a-btn primary" href="#projects">查看项目</a>` : ''}
          ${mailBtn(data, '联系我', 'a-btn ghost')}
        </div>
      </section>
      <div class="a-wrap">
        ${sections.some((s) => s.id === 'projects') ? `<section class="a-sec" id="projects"><p class="a-kick">PROJECTS</p><h2 class="a-h2">项目作品</h2><div class="a-isles">${projects}</div></section>` : ''}
        ${sections.some((s) => s.id === 'experience') ? `<section class="a-sec" id="experience"><p class="a-kick">EXPERIENCE</p><h2 class="a-h2">经历</h2><div class="a-tl">${experience}</div></section>` : ''}
        ${sections.some((s) => s.id === 'skills') ? `<section class="a-sec" id="skills"><p class="a-kick">SKILLS</p><h2 class="a-h2">技能栈</h2><div class="a-rings">${skills}</div></section>` : ''}
        <section class="a-dome" id="contact">
          <h2 class="a-dh2">一起聊聊？</h2>
          <p class="a-dlead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
          ${mailBtn(data, data.email.trim() || '联系我', 'a-dmail')}
          ${socials}
        </section>
      </div>
    </main>
    <footer class="a-foot">© ${year} ${esc(data.name)} · 由 SiteCraft 个人官网生成器构建</footer>
  </div>
</div>`
}
