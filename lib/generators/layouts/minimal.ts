/**
 * 极简 Minimal —— 「文稿页」版式：
 * 单栏阅读列（680px）、点线引导的技能清单、无卡片的条目流、小圆头像内嵌。
 * 特点来自排版本身：leader dots、衬线大标题、细分隔线，页面即文稿。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS, FONT_SERIF } from '../theme-consts'
import {
  avatarHTML,
  clampLevel,
  getSections,
  projectLinks,
  tagItems,
  type SectionDef,
} from './shared'

export const MINIMAL_CSS = `
.site-minimal{--bg:#fafaf9;--fg:#1c1917;--muted:#78716c;--line:#e7e5e4;--panel:#ffffff;--fd:${FONT_SERIF};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.m-col{max-width:680px;margin:0 auto;padding:0 24px}
.m-top{display:flex;justify-content:space-between;align-items:center;padding:20px 0;border-bottom:1px solid var(--line);font-family:var(--fm);font-size:12px;letter-spacing:.16em;color:var(--muted)}
.m-top nav{display:flex;gap:18px}
.m-top nav a:hover{color:var(--fg)}
.m-head{padding:84px 0 64px;border-bottom:1px solid var(--line);position:relative}
.m-name{font-family:var(--fd);font-size:clamp(52px,8cqw,84px);line-height:1.05;font-weight:700;letter-spacing:-.02em;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.m-role{margin-top:14px;font-family:var(--fd);font-style:italic;font-size:19px;color:var(--muted);font-weight:400}
.m-face{position:absolute;right:0;top:92px;width:78px;height:78px;border-radius:50%;object-fit:cover;border:1px solid var(--line);background:var(--panel)}
.m-monogram{position:absolute;right:0;top:92px;width:78px;height:78px;border-radius:50%;border:1px solid var(--line);background:var(--panel);display:grid;place-items:center;font-family:var(--fd);font-weight:700;font-size:30px;color:var(--fg)}
.m-status{display:inline-flex;align-items:center;gap:9px;margin-top:28px;font-family:var(--fm);font-size:12.5px;color:var(--muted)}
.m-status::before{content:'';width:7px;height:7px;border-radius:50%;background:#34d399;animation:sp-pulse 2.4s infinite}
.m-bio{margin:20px 0 0;font-size:16px;line-height:1.9;color:var(--muted);max-width:56ch}
.m-sec{padding:52px 0;border-bottom:1px solid var(--line)}
.m-h2{font-family:var(--fm);font-size:11.5px;letter-spacing:.32em;text-transform:uppercase;color:var(--muted);margin-bottom:26px;font-weight:400}
.m-skill{display:flex;align-items:baseline;gap:14px;padding:12px 0;font-size:15.5px}
.m-skill b{font-weight:600}
.m-leader{flex:1;border-bottom:1px dotted var(--line);transform:translateY(-4px)}
.m-pct{font-family:var(--fm);font-size:12px;color:var(--muted)}
.m-work{display:grid;grid-template-columns:54px 1fr;gap:0 18px;padding:28px 0}
.m-work + .m-work{border-top:1px solid var(--line)}
.m-idx{font-family:var(--fd);font-style:italic;font-size:26px;color:var(--muted)}
.m-wname{font-family:var(--fd);font-size:21px;font-weight:700;overflow-wrap:anywhere}
.m-wdesc{margin-top:8px;color:var(--muted);font-size:14.5px;line-height:1.8}
.m-wmeta{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px 18px;font-family:var(--fm);font-size:12px;color:var(--muted);list-style:none}
.m-wmeta a{color:var(--fg);border-bottom:1px solid var(--line);padding-bottom:1px}
.m-wmeta a:hover{border-color:var(--fg)}
.m-job{display:grid;grid-template-columns:150px 1fr;gap:16px;padding:20px 0}
.m-job + .m-job{border-top:1px solid var(--line)}
.m-when{font-family:var(--fm);font-size:12px;color:var(--muted);padding-top:4px}
.m-role2{font-family:var(--fd);font-size:17px;font-weight:700}
.m-org{font-size:13.5px;color:var(--muted);margin-top:2px}
.m-jdesc{margin-top:8px;font-size:14px;color:var(--muted);line-height:1.8;max-width:60ch}
.m-contact{padding:64px 0 88px}
.m-mail{display:inline-block;margin-top:18px;font-family:var(--fd);font-size:23px;color:var(--fg);border-bottom:2px solid var(--fg);padding-bottom:4px}
.m-mail:hover{color:var(--sp);border-color:var(--sp)}
.m-soc{margin-top:26px;display:flex;gap:0}
.m-soc a{width:40px;height:40px;display:grid;place-items:center;color:var(--muted);border:1px solid var(--line);border-radius:50%;margin-right:10px}
.m-soc a:hover{color:var(--fg);border-color:var(--fg)}
.m-foot{padding:24px 0;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--fm);font-size:11.5px;color:var(--muted)}
@container (max-width:640px){
.m-face,.m-monogram{position:static;margin-top:24px}
.m-work{grid-template-columns:1fr;gap:6px}
.m-job{grid-template-columns:1fr;gap:4px}
}
`

export function renderMinimal(data: SiteData): string {
  const sections = getSections(data)
  const nav = sections
    .map((s) => `<a href="#${s.id}">${s.navLabel}</a>`)
    .join('')

  const skills = data.skills
    .map(
      (s) => `<li class="m-skill"><b>${esc(s.name)}</b><i class="m-leader"></i><span class="m-pct">${clampLevel(s.level)} / 100</span></li>`
    )
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      const tags = tagItems(p.tags, '')
      return `<article class="m-work"><span class="m-idx">${String(i + 1).padStart(2, '0')}</span>
  <div>
    <h3 class="m-wname">${esc(p.name)}</h3>
    ${p.description.trim() ? `<p class="m-wdesc">${esc(p.description.trim())}</p>` : ''}
    ${tags || links ? `<ul class="m-wmeta">${tags}${links}</ul>` : ''}
  </div></article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<article class="m-job"><span class="m-when">${esc(e.period)}</span>
  <div>
    <h3 class="m-role2">${esc(e.role)}</h3>
    <p class="m-org">${esc(e.organization)}</p>
    ${e.description.trim() ? `<p class="m-jdesc">${esc(e.description.trim())}</p>` : ''}
  </div></article>`
    )
    .join('')

  const sec = (id: SectionDef['id'], body: string) =>
    sections.some((s) => s.id === id)
      ? `<section class="m-sec" id="${id}"><h2 class="m-h2">${String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')} · ${sections.find((s) => s.id === id)!.kicker}</h2>${body}</section>`
      : ''

  const socials = socialLinks(data, 'm-soc', 'm-soc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-minimal">
  <div class="m-col">
    <header class="m-top"><span>${esc(data.name)}</span><nav aria-label="站点导航">${nav}</nav></header>
    <main>
      <section class="m-head">
        <h1 class="s-name m-name">${esc(data.name)}</h1>
        <p class="m-role">${esc(data.title)}</p>
        ${avatarHTML(data, 'm-face', 'm-monogram')}
        ${data.status.trim() ? `<p class="m-status">${esc(data.status.trim())}</p>` : ''}
        ${data.bio.trim() ? `<p class="m-bio">${esc(data.bio.trim())}</p>` : ''}
      </section>
      ${sections.some((s) => s.id === 'skills') ? sec('skills', `<ul>${skills}</ul>`) : ''}
      ${sec('projects', projects)}
      ${sec('experience', experience)}
      ${sec(
        'contact',
        `<p class="m-bio" style="margin-top:0">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
      ${data.email.trim() ? `<a class="m-mail" href="mailto:${esc(data.email.trim())}">${esc(data.email.trim())}</a>` : ''}
      ${socials}`
      )}
    </main>
    <footer class="m-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
  </div>
</div>`
}
