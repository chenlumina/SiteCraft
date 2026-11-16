/**
 * 商务 Professional —— 「简历纸」版式：
 * A4 纸张容器：页眉姓名区 + 联系信息横排 + 双栏正文（左主栏项目/经历，右侧栏技能/联系）。
 * 特点：真实简历的版式骨架，信息密度高、层级清晰。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { icon, socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import {
  avatarHTML,
  clampLevel,
  getSections,
  projectLinks,
  tagItems,
} from './shared'

export const PROFESSIONAL_CSS = `
.site-professional{--bg:#eef1f6;--fg:#0f172a;--muted:#5b6b81;--line:#dbe2ec;--panel:#ffffff;--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.p-desk{padding:36px 16px 72px}
.p-page{max-width:980px;margin:0 auto;background:var(--panel);border:1px solid var(--line);border-top:6px solid var(--sp);box-shadow:0 24px 60px rgba(15,23,42,.12)}
.p-head{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;padding:34px 44px 24px;border-bottom:1px solid var(--line)}
.p-name{font-size:clamp(34px,5cqw,48px);font-weight:800;letter-spacing:-.01em;font-style:normal}
.p-role{margin-top:6px;color:var(--sp);font-weight:600;font-size:15.5px}
.p-status{display:inline-block;margin-top:10px;font-family:var(--fm);font-size:11.5px;letter-spacing:.08em;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 12px;background:#f8fafc}
.p-face,.p-monogram{width:96px;height:96px;border-radius:14px;object-fit:cover;border:1px solid var(--line)}
.p-monogram{display:grid;place-items:center;font-weight:800;font-size:34px;background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp)}
.p-contactrow{display:flex;flex-wrap:wrap;gap:10px 26px;padding:13px 44px;border-bottom:1px solid var(--line);font-family:var(--fm);font-size:12.5px;color:var(--muted)}
.p-contactrow span{display:inline-flex;align-items:center;gap:7px}
.p-contactrow svg{width:13px;height:13px}
.p-body{display:grid;grid-template-columns:1fr 292px}
.p-main{padding:28px 44px 40px;border-right:1px solid var(--line)}
.p-side{padding:28px 30px 40px;background:#f8fafc}
.p-h{display:flex;align-items:center;gap:10px;font-size:14.5px;font-weight:800;letter-spacing:.06em;margin:28px 0 16px}
.p-h:first-child{margin-top:0}
.p-h::before{content:'';width:10px;height:10px;background:var(--sp);border-radius:3px;flex:none}
.p-card{border:1px solid var(--line);border-radius:10px;padding:16px;margin-bottom:14px;transition:border-color .2s,box-shadow .2s}
.p-card:hover{border-color:var(--sp);box-shadow:0 6px 18px rgba(15,23,42,.08)}
.p-cname{font-weight:700;font-size:16.5px;overflow-wrap:anywhere}
.p-cdesc{margin-top:6px;font-size:13.5px;color:var(--muted);line-height:1.7}
.p-ctags{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;list-style:none}
.p-ctag{background:var(--sp-soft);color:var(--sp);font-family:var(--fm);font-size:11.5px;padding:3px 9px;border-radius:4px}
.p-clinks{margin-top:10px;display:flex;gap:14px}
.p-clinks a{color:var(--sp);font-size:12.5px;font-weight:600}
.p-clinks a:hover{text-decoration:underline}
.p-tl{position:relative;padding-left:24px}
.p-tl::before{content:'';position:absolute;left:6px;top:8px;bottom:8px;width:1.5px;background:var(--line)}
.p-titem{position:relative;padding-bottom:22px}
.p-titem:last-child{padding-bottom:0}
.p-titem::before{content:'';position:absolute;left:-22px;top:6px;width:11px;height:11px;border-radius:50%;background:#fff;border:3px solid var(--sp)}
.p-twhen{font-family:var(--fm);font-size:12px;color:var(--sp)}
.p-trole{font-weight:700;font-size:15.5px;margin-top:2px}
.p-torg{font-size:13px;color:var(--muted);margin-top:1px}
.p-tdesc{font-size:13.5px;color:var(--muted);margin-top:6px;line-height:1.7;max-width:60ch}
.p-skill{padding:8px 0}
.p-srow{display:flex;justify-content:space-between;align-items:baseline;font-size:13.5px;font-weight:600}
.p-spct{font-family:var(--fm);font-size:11.5px;color:var(--muted)}
.p-strack{height:7px;border-radius:99px;background:var(--line);margin-top:6px;overflow:hidden}
.p-sfill{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--sp),var(--sp2))}
.p-sidebox{border:1px solid var(--line);border-radius:10px;padding:14px;background:#fff;margin-top:8px}
.p-sidelead{font-size:12.5px;color:var(--muted);line-height:1.7}
.p-smail{display:inline-flex;align-items:center;gap:8px;margin-top:10px;color:var(--sp);font-weight:600;font-size:13px}
.p-smail svg{width:14px;height:14px}
.p-soc{margin-top:8px;display:flex;flex-direction:column;gap:2px}
.p-soc a{display:inline-flex;align-items:center;gap:9px;padding:7px 0;color:var(--muted);font-size:13px;font-weight:600}
.p-soc a:hover{color:var(--sp)}
.p-soc svg{width:15px;height:15px}
.p-foot{padding:15px 44px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--fm);font-size:11.5px;color:var(--muted)}
@container (max-width:800px){
.p-body{grid-template-columns:1fr}
.p-main{border-right:none;border-bottom:1px solid var(--line)}
.p-head{grid-template-columns:1fr;padding:28px 26px 20px}
.p-contactrow{padding:12px 26px}
.p-main{padding:26px 26px 32px}
.p-side{padding:26px}
.p-foot{padding:15px 26px}
}
`

export function renderProfessional(data: SiteData): string {
  const sections = getSections(data)
  const nav = sections.map((s) => `<a href="#${s.id}">${s.navLabel}</a>`).join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="p-card"><h3 class="p-cname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="p-cdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="p-ctags">${tagItems(p.tags, 'p-ctag')}</ul>` : ''}
  ${links ? `<div class="p-clinks">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="p-titem"><span class="p-twhen">${esc(e.period)}</span>
  <h3 class="p-trole">${esc(e.role)}</h3>
  <p class="p-torg">${esc(e.organization)}</p>
  ${e.description.trim() ? `<p class="p-tdesc">${esc(e.description.trim())}</p>` : ''}</div>`
    )
    .join('')

  const skills = data.skills
    .map(
      (s) => `<div class="p-skill"><div class="p-srow"><span>${esc(s.name)}</span><span class="p-spct">${clampLevel(s.level)}%</span></div>
  <div class="p-strack"><span class="p-sfill" style="width:${clampLevel(s.level)}%"></span></div></div>`
    )
    .join('')

  const socials = socialLinks(data, 'p-soc', 'p-soc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-professional">
  <div class="p-desk">
    <div class="p-page">
      <header class="p-head">
        <div>
          <h1 class="s-name p-name">${esc(data.name)}</h1>
          <p class="p-role">${esc(data.title)}</p>
          ${data.status.trim() ? `<span class="p-status">${esc(data.status.trim())}</span>` : ''}
        </div>
        ${avatarHTML(data, 'p-face', 'p-monogram')}
      </header>
      <div class="p-contactrow">
        ${data.location.trim() ? `<span>${icon('pin')}${esc(data.location.trim())}</span>` : ''}
        ${data.email.trim() ? `<span>${icon('mail')}${esc(data.email.trim())}</span>` : ''}
        ${nav ? `<span style="margin-left:auto;display:flex;gap:16px">${nav}</span>` : ''}
      </div>
      <div class="p-body">
        <main class="p-main">
          ${sections.some((s) => s.id === 'projects') ? `<h2 class="p-h">项目作品</h2>${projects}` : ''}
          ${sections.some((s) => s.id === 'experience') ? `<h2 class="p-h" style="margin-top:32px">经历</h2><div class="p-tl" id="experience">${experience}</div>` : ''}
        </main>
        <aside class="p-side">
          ${sections.some((s) => s.id === 'skills') ? `<h2 class="p-h" id="skills">技能栈</h2>${skills}` : ''}
          <div class="p-sidebox" id="contact" style="margin-top:24px">
            <p class="p-sidelead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
            ${data.email.trim() ? `<a class="p-smail" href="mailto:${esc(data.email.trim())}">${icon('mail')}${esc(data.email.trim())}</a>` : ''}
          </div>
          ${socials}
        </aside>
      </div>
      <footer class="p-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
    </div>
  </div>
</div>`
}
