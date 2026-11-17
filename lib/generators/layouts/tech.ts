/**
 * 极客 Tech —— 「终端机」版式：
 * 整站装进一个终端窗口：标题条 + 提示符段落 + ASCII 方块进度条 +
 * 文件卡式项目 + git log 式经历，全部等宽字体。特点：窗口框架与命令行隐喻。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { FONT_MONO } from '../theme-consts'
import { clampLevel, getSections, projectLinks, tagItems } from './shared'

export const TECH_CSS = `
.site-tech{--bg:#0a0f1a;--fg:#d7e2f2;--muted:#7d8ca6;--line:#1d2a44;--panel:#0e1626;--fd:${FONT_MONO};--fb:${FONT_MONO};--fm:${FONT_MONO}}
.t-stage{min-height:100%;display:flex;justify-content:center;align-items:flex-start;padding:40px 16px 72px}
.t-term{width:min(1020px,100%);background:rgba(10,16,28,.94);border:1px solid var(--line);border-radius:10px;box-shadow:0 30px 90px rgba(0,0,0,.55);overflow:hidden}
.t-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#111a2c;border-bottom:1px solid var(--line)}
.t-dot{width:11px;height:11px;border-radius:50%}
.t-dot.d1{background:#ff5f57}.t-dot.d2{background:#febc2e}.t-dot.d3{background:#28c840}
.t-cap{margin-left:10px;font-size:12px;color:var(--muted)}
.t-nav{display:flex;flex-wrap:wrap;gap:14px;padding:14px clamp(18px,4cqw,44px);border-bottom:1px dashed var(--line);font-size:12.5px;color:var(--muted)}
.t-nav::before{content:'$ cd';color:var(--sp)}
.t-nav a{color:var(--muted)}
.t-nav a:hover{color:var(--sp)}
.t-screen{padding:30px clamp(18px,4cqw,44px) 40px;font-size:14.5px;line-height:1.75}
.t-p::before{content:'> ';color:var(--sp)}
.t-line{color:var(--muted)}
.t-name{font-size:clamp(34px,6cqw,56px);font-weight:700;color:var(--fg);margin:4px 0 0}
.t-name::after{content:'▌';color:var(--sp);margin-left:6px;animation:t-blink 1.2s steps(1) infinite}
@keyframes t-blink{50%{opacity:0}}
.t-role{color:var(--sp);margin-top:6px}
.t-comment{color:var(--muted);margin-top:16px;max-width:66ch}
.t-comment::before{content:'/* '}.t-comment::after{content:' */'}
.t-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.t-tag{border:1px solid var(--line);background:var(--panel);padding:3px 12px;border-radius:4px;font-size:12.5px;color:var(--muted)}
.t-h{margin:44px 0 16px;font-size:13.5px;font-weight:700;color:var(--fg);letter-spacing:.06em}
.t-h::before{content:'$ ';color:var(--sp)}
.t-skill{display:grid;grid-template-columns:140px 1fr 54px;gap:14px;align-items:center;padding:7px 0}
.t-track{height:15px;border:1px solid var(--line);background:var(--panel);overflow:hidden}
.t-fill{display:block;height:100%;background:repeating-linear-gradient(90deg,var(--sp) 0 8px,transparent 8px 12px);box-shadow:0 0 0 1.5px var(--fg),0 0 12px var(--sp-soft)}
.t-pct{color:var(--muted);text-align:right;font-size:12.5px}
.t-file{border:1px solid var(--line);border-radius:6px;background:var(--panel);margin-bottom:14px;overflow:hidden}
.t-filebar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 14px;background:rgba(29,42,68,.45);border-bottom:1px solid var(--line);font-size:13px}
.t-filebar b{color:var(--fg);font-weight:600}
.t-filebar .t-links{display:flex;gap:14px}
.t-filebar .t-links a{color:var(--sp)}
.t-filebar .t-links a:hover{text-decoration:underline}
.t-filebody{padding:12px 14px;color:var(--muted);font-size:13.5px;line-height:1.75}
.t-filetags{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.t-filetags li{color:var(--sp);font-size:12px}
.t-filetags li::before{content:'#';margin-right:2px;color:var(--muted)}
.t-commit{display:grid;grid-template-columns:auto 130px 1fr;gap:4px 16px;padding:12px 0;border-bottom:1px dashed var(--line)}
.t-commit:last-child{border-bottom:none}
.t-hash{color:var(--sp)}
.t-when{color:var(--muted)}
.t-what b{color:var(--fg);font-weight:600}
.t-what .t-org{color:var(--muted)}
.t-what p{color:var(--muted);margin-top:4px;font-size:13px}
.t-box{margin-top:44px;border:1px solid var(--line);border-radius:8px;background:var(--panel);padding:22px}
.t-ctitle{font-weight:700;color:var(--fg)}
.t-mail{display:inline-block;margin-top:10px;color:var(--sp)}
.t-mail:hover{text-decoration:underline}
.t-foot{padding:12px 18px;border-top:1px solid var(--line);background:#111a2c;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:11.5px}
@container (max-width:760px){
.t-skill{grid-template-columns:100px 1fr 44px;gap:10px}
.t-commit{grid-template-columns:1fr;gap:2px}
.t-when::before{content:'@ '}
}
`

export function renderTech(data: SiteData): string {
  const sections = getSections(data)
  const nav = sections.map((s) => `<a href="#${s.id}">${s.navLabel}</a>`).join('')

  const skills = data.skills
    .map(
      (s) => `<div class="t-skill"><span>${esc(s.name)}</span>
  <span class="t-track"><span class="t-fill" style="width:${clampLevel(s.level)}%"></span></span>
  <span class="t-pct">${clampLevel(s.level)}%</span></div>`
    )
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      return `<div class="t-file">
  <div class="t-filebar"><b>${String(i + 1).padStart(2, '0')}-${esc(p.name.toLowerCase().replace(/\s+/g, '-'))}</b>${links ? `<span class="t-links">${links}</span>` : ''}</div>
  <div class="t-filebody">${esc(p.description.trim())}
    ${p.tags.some((t) => t.trim()) ? `<ul class="t-filetags">${tagItems(p.tags, '')}</ul>` : ''}
  </div></div>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="t-commit"><span class="t-hash">${esc(e.period)}</span><span class="t-when">${esc(e.organization)}</span>
  <span class="t-what"><b>${esc(e.role)}</b>${e.description.trim() ? `<p>${esc(e.description.trim())}</p>` : ''}</span></div>`
    )
    .join('')

  const year = new Date().getFullYear()

  return `<div class="site-root site-tech">
  <div class="t-stage">
    <div class="t-term">
      <div class="t-bar"><span class="t-dot d1"></span><span class="t-dot d2"></span><span class="t-dot d3"></span><span class="t-cap">${esc(data.name.toLowerCase().replace(/\s+/g, ''))}@sitecraft: ~/about</span></div>
      <nav class="t-nav" aria-label="站点导航">${nav}</nav>
      <main class="t-screen">
        <p class="t-p">whoami</p>
        <h1 class="s-name t-name">${esc(data.name)}</h1>
        <p class="t-role">${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="t-comment">${esc(data.bio.trim())}</p>` : ''}
        <div class="t-tags">
          ${data.status.trim() ? `<span class="t-tag">${esc(data.status.trim())}</span>` : ''}
          ${data.location.trim() ? `<span class="t-tag">${esc(data.location.trim())}</span>` : ''}
          ${data.email.trim() ? `<span class="t-tag">${esc(data.email.trim())}</span>` : ''}
        </div>
        ${sections.some((s) => s.id === 'skills') ? `<h2 class="t-h" id="skills" style="margin-top:44px">ls skills/</h2><div>${skills}</div>` : ''}
        ${sections.some((s) => s.id === 'projects') ? `<h2 class="t-h" id="projects">ls projects/</h2>${projects}` : ''}
        ${sections.some((s) => s.id === 'experience') ? `<h2 class="t-h" id="experience">git log --oneline</h2>${experience}` : ''}
        <div class="t-box" id="contact">
          <p class="t-p t-ctitle">sendmail -t "一起聊聊？"</p>
          <p class="t-line">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
          ${data.email.trim() ? `<a class="t-mail" href="mailto:${esc(data.email.trim())}">${esc(data.email.trim())}</a>` : ''}
        </div>
      </main>
      <div class="t-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></div>
    </div>
  </div>
</div>`
}
