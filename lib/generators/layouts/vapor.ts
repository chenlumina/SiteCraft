/**
 * 蒸汽波 Vapor —— 「霓虹窗」版式：
 * 条纹落日 + 透视网格 hero、镀铬渐变大字、技能藏在复古窗口的凹槽进度条里、
 * 项目是 Win95 风格窗口卡（渐变标题条 + ✕ 按钮 + 凹陷边框）、经历是 history.log 对话行。
 * 特点：整套界面组件都是复古操作系统隐喻。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import { clampLevel, getSections, mailBtn, projectLinks, tagItems, orderSections } from './shared'

export const VAPOR_CSS = `
.site-vapor{--bg:#12071f;--fg:#fdf4ff;--muted:#b6a3d9;--line:#37205a;--panel:rgba(55,32,90,.45);--track:#1c1030;--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.v-scene{background-image:linear-gradient(180deg,#1a0b2e 0%,#12071f 55%,#0d0518 100%);min-height:100%}
.v-nav{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px clamp(20px,4cqw,44px);border-bottom:1px solid rgba(255,113,206,.3)}
.v-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px}
.v-mark{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;font-weight:800;background:linear-gradient(135deg,var(--sp),#01cdfe);color:#12071f}
.v-navlinks{display:flex;gap:20px;font-family:var(--fm);font-size:12.5px}
.v-navlinks a{color:#01cdfe}
.v-navlinks a:hover{text-shadow:0 0 10px rgba(1,205,254,.8)}
.v-hero{position:relative;text-align:center;padding:96px 24px 78px;overflow:hidden}
.v-hero::before{content:'';position:absolute;left:50%;top:2%;width:340px;height:340px;transform:translateX(-50%);border-radius:50%;background:repeating-linear-gradient(180deg,transparent 0 16px,rgba(18,7,31,.85) 16px 22px),radial-gradient(circle at 50% 42%,#fffb96 0%,#ff6e27 36%,var(--sp) 68%,transparent 74%);opacity:.4;pointer-events:none}
.v-hero::after{content:'';position:absolute;left:-20%;right:-20%;bottom:-40px;height:300px;z-index:0;background:repeating-linear-gradient(transparent 0 22px,rgba(1,205,254,.3) 22px 24px),repeating-linear-gradient(90deg,transparent 0 44px,rgba(255,113,206,.24) 44px 46px);transform:perspective(340px) rotateX(58deg);transform-origin:top;pointer-events:none}
.v-hello{position:relative;z-index:1;font-family:var(--fm);color:#01cdfe;font-size:12.5px;letter-spacing:.3em}
.v-name{position:relative;z-index:1;margin-top:14px;font-size:clamp(48px,8cqw,86px);font-weight:800;letter-spacing:-.01em;font-style:normal;background:linear-gradient(180deg,#fdf4ff 18%,var(--sp) 58%,#b967ff 95%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 18px rgba(255,113,206,.35))}
.v-role{position:relative;z-index:1;margin-top:12px;font-family:var(--fm);color:#01cdfe;font-size:clamp(14px,2.2cqw,18px)}
.v-bio{position:relative;z-index:1;margin:20px auto 0;max-width:54ch;color:var(--muted);line-height:1.85;font-size:14.5px}
.v-status{position:relative;z-index:1;display:inline-block;margin-top:22px;font-family:var(--fm);font-size:12px;color:#01cdfe;border:1px solid rgba(1,205,254,.4);background:rgba(1,205,254,.08);padding:6px 16px;border-radius:999px}
.v-chips{position:relative;z-index:1;margin-top:20px;display:flex;justify-content:center;flex-wrap:wrap;gap:10px}
.v-chip{font-family:var(--fm);font-size:12px;color:var(--muted);border:1px solid var(--line);background:var(--panel);padding:6px 14px;border-radius:6px}
.v-ctas{position:relative;z-index:1;margin-top:28px;display:flex;justify-content:center;flex-wrap:wrap;gap:16px}
.v-btn{display:inline-flex;align-items:center;gap:9px;padding:12px 26px;border-radius:999px;font-weight:700;font-size:14px;font-family:var(--fm)}
.v-btn.primary{background:linear-gradient(95deg,var(--sp),#b967ff);color:var(--on-sp);box-shadow:0 0 26px rgba(255,113,206,.4)}
.v-btn.primary:hover{transform:translateY(-2px)}
.v-btn.ghost{border:1.5px solid #01cdfe;color:#01cdfe;background:transparent}
.v-btn.ghost:hover{box-shadow:0 0 18px rgba(1,205,254,.5)}
.v-wrap{max-width:1020px;margin:0 auto;padding:0 24px}
.v-sec{padding:56px 0}
.v-h2{font-family:var(--fm);font-size:12px;letter-spacing:.3em;color:#01cdfe;margin-bottom:16px}
.v-h2::before{content:'▸ ';color:var(--sp)}
.v-win{border:2px solid #b967ff;background:rgba(18,7,31,.78);border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px rgba(1,205,254,.14),0 18px 50px rgba(0,0,0,.45)}
.v-titlebar{display:flex;justify-content:space-between;align-items:center;padding:9px 14px;background:linear-gradient(90deg,var(--sp),#b967ff 58%,#01cdfe);color:#12071f;font-weight:800;font-size:13px;letter-spacing:.04em}
.v-x{font-family:var(--fm);font-weight:700;letter-spacing:3px;opacity:.85}
.v-body{padding:20px}
.v-bar{margin-bottom:14px}
.v-bartop{display:flex;justify-content:space-between;font-family:var(--fm);font-size:12.5px;color:var(--fg)}
.v-bartop em{font-style:normal;color:#01cdfe}
.v-track{height:16px;margin-top:7px;background:var(--track);border:2px solid;border-color:#0d0518 #4a2c78 #4a2c78 #0d0518}
.v-fill{display:block;height:100%;background:repeating-linear-gradient(90deg,#01cdfe 0 10px,var(--sp) 10px 20px);box-shadow:0 0 0 1.5px var(--fg),0 0 12px rgba(1,205,254,.4)}
.v-app{border:2px solid;border-color:#0d0518 #4a2c78 #4a2c78 #0d0518;background:rgba(55,32,90,.3);padding:14px 16px;margin-bottom:14px}
.v-app:last-child{margin-bottom:0}
.v-appbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;font-weight:700;font-size:15.5px;color:var(--fg)}
.v-appbar i{font-style:normal;font-family:var(--fm);font-size:11.5px;color:var(--sp)}
.v-appdesc{margin-top:8px;color:var(--muted);font-size:13.5px;line-height:1.75}
.v-apptags{margin-top:11px;display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.v-apptag{font-family:var(--fm);font-size:11px;color:#01cdfe;border:1px solid rgba(1,205,254,.3);padding:2px 10px;border-radius:999px}
.v-applinks{margin-top:11px;display:flex;gap:16px}
.v-applinks a{color:#01cdfe;font-family:var(--fm);font-size:12.5px;text-decoration:underline dotted}
.v-log{padding:6px 20px 14px}
.v-logline{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;padding:12px 0;border-bottom:1px dashed var(--line)}
.v-logline:last-child{border-bottom:none}
.v-logwhen{font-family:var(--fm);color:var(--sp);font-size:12px;white-space:nowrap;padding-top:2px}
.v-logwhat b{font-size:15.5px;color:var(--fg);font-weight:700}
.v-logwhat .v-org{font-size:12.5px;color:var(--muted);margin-left:10px}
.v-logwhat p{margin-top:5px;font-size:13px;color:var(--muted);line-height:1.7}
.v-cwin .v-body{text-align:center;padding:34px 20px}
.v-ctitle{font-family:var(--fm);font-size:clamp(20px,3.4cqw,28px);letter-spacing:.1em;color:var(--fg)}
.v-ctitle em{font-style:normal;color:var(--sp);text-shadow:0 0 16px rgba(255,113,206,.6)}
.v-clead{margin-top:12px;color:var(--muted);font-size:13.5px}
.v-cmail{display:inline-flex;align-items:center;gap:10px;margin-top:22px;font-family:var(--fm);font-weight:700;font-size:14px;color:#12071f;background:linear-gradient(95deg,var(--sp),#b967ff);padding:13px 30px;border-radius:4px;box-shadow:0 0 26px rgba(255,113,206,.35)}
.v-cmail:hover{transform:translateY(-2px)}
.v-csoc{margin-top:24px;display:flex;justify-content:center;gap:12px}
.v-csoc a{width:42px;height:42px;display:grid;place-items:center;border:1.5px solid #01cdfe;color:#01cdfe;background:rgba(1,205,254,.06)}
.v-csoc a:hover{box-shadow:0 0 16px rgba(1,205,254,.5)}
.v-foot{padding:18px 24px;text-align:center;font-family:var(--fm);font-size:11px;color:var(--muted)}
@container (max-width:760px){
.v-logline{grid-template-columns:1fr}
.v-navlinks{display:none}
}
/* 入场：只做一次，落在名字上 */
.v-name{animation:sf-glitch .75s cubic-bezier(.22,.7,.2,1) .05s both}
`

export function renderVapor(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '模块',
    projects: '档案',
    experience: '日志',
    contact: '联络',
  }
  const nav = orderSections(sections, ['experience', 'projects', 'skills', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map(
      (
        s
      ) => `<div class="v-bar"><div class="v-bartop"><span>${esc(s.name)}</span><em>${clampLevel(s.level)}%</em></div>
  <div class="v-track"><span class="v-fill" style="width:${clampLevel(s.level)}%"></span></div></div>`
    )
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      return `<div class="v-app"><div class="v-appbar"><span>${esc(p.name)}</span><i>proc ${String(i + 1).padStart(2, '0')}</i></div>
  ${p.description.trim() ? `<p class="v-appdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="v-apptags">${tagItems(p.tags, 'v-apptag')}</ul>` : ''}
  ${links ? `<div class="v-applinks">${links}</div>` : ''}</div>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="v-logline"><span class="v-logwhen">${esc(e.period)}</span>
  <div class="v-logwhat"><b>${esc(e.role)}</b><span class="v-org">${esc(e.organization)}</span>${e.description.trim() ? `<p>${esc(e.description.trim())}</p>` : ''}</div></div>`
    )
    .join('')

  const socials = socialLinks(data, 'v-csoc', 'v-csoc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-vapor">
  <div class="v-scene">
    <header class="v-nav"><span class="v-brand"><span class="v-mark">${esc(data.name.trim().charAt(0).toUpperCase())}</span>${esc(data.name)}</span><nav class="v-navlinks" aria-label="站点导航">${nav}</nav></header>
    <main>
      <section class="v-hero">
        <p class="v-hello">~ WELCOME TO MY HOMEPAGE ~</p>
        <h1 class="s-name v-name">${esc(data.name)}</h1>
        <p class="v-role">${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="v-bio">${esc(data.bio.trim())}</p>` : ''}
        ${data.status.trim() ? `<p class="v-status">${esc(data.status.trim())}</p>` : ''}
        <div class="v-chips">
          ${data.location.trim() ? `<span class="v-chip">${esc(data.location.trim())}</span>` : ''}
          ${data.email.trim() ? `<span class="v-chip">${esc(data.email.trim())}</span>` : ''}
        </div>
        <div class="v-ctas">
          ${sections.some((s) => s.id === 'projects') ? `<a class="v-btn primary" href="#projects">查看项目</a>` : ''}
          ${mailBtn(data, '联系我 ↵', 'v-btn ghost')}
        </div>
      </section>
      <div class="v-wrap">
        ${sections.some((s) => s.id === 'experience') ? `<section class="v-sec" id="experience"><h2 class="v-h2">EXPERIENCE</h2><div class="v-win"><div class="v-titlebar"><span>history.log</span><span class="v-x">— □ ✕</span></div><div class="v-log">${experience}</div></div></section>` : ''}
        ${sections.some((s) => s.id === 'projects') ? `<section class="v-sec" id="projects"><h2 class="v-h2">PROJECTS</h2><div class="v-win"><div class="v-titlebar"><span>projects.exe</span><span class="v-x">— □ ✕</span></div><div class="v-body">${projects}</div></div></section>` : ''}
        ${sections.some((s) => s.id === 'skills') ? `<section class="v-sec" id="skills"><h2 class="v-h2">SKILLS</h2><div class="v-win"><div class="v-titlebar"><span>skills.exe</span><span class="v-x">— □ ✕</span></div><div class="v-body">${skills}</div></div></section>` : ''}
        <section class="v-sec" id="contact" style="padding-bottom:0">
          <div class="v-win v-cwin"><div class="v-titlebar"><span>contact.exe</span><span class="v-x">— □ ✕</span></div>
            <div class="v-body">
              <h2 class="v-ctitle">INSERT <em>MAIL</em> TO CONTINUE</h2>
              <p class="v-clead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
              ${mailBtn(data, data.email.trim() || 'SEND MAIL', 'v-cmail')}
              ${socials}
            </div>
          </div>
        </section>
      </div>
    </main>
    <footer class="v-foot">© ${year} ${esc(data.name)} · 由 SiteCraft 个人官网生成器构建 · PRESS ANY KEY</footer>
  </div>
</div>`
}
