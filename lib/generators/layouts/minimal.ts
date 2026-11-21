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
  orderSections,
  skillLevelVisible,
} from './shared'

export const MINIMAL_CSS = `
.m-epoint{margin-top:6px;display:grid;gap:2px;list-style:none}
.m-epoint li{position:relative;padding-left:13px;font-size:12.5px;line-height:1.65;color:var(--fg2, var(--muted, #555))}
.m-epoint li::before{content:"";position:absolute;left:0;top:.62em;width:5px;height:1px;background:var(--sp)}
.m-hl{display:inline-block;margin-right:8px;padding:1px 5px;font-size:10.5px;letter-spacing:.12em;
  color:var(--sp-ink);border:1px solid currentColor;border-radius:2px;vertical-align:2px;}
.site-minimal{--bg:#fafaf9;--fg:#1c1917;--muted:#78716c;--line:#e7e5e4;--panel:#ffffff;--fd:${FONT_SERIF};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.m-col{position:relative;max-width:680px;margin:0 auto;padding:0 24px}
/* 主视觉锚点：一条书脊线贴住版口，右侧留白里压一枚极淡的年份 —— 空白从此是"封面"而不是"没排完" */
.m-col::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;
  background:linear-gradient(180deg,var(--fg) 0,var(--fg) 96px,var(--line) 96px,var(--line) 100%);opacity:.9}
/* 5% 的水印在真实屏幕上等于不存在：改成描边数字 + 12% 填充，
   一眼能看出"这里有个年份在压阵"，又不至于抢名字 */
.m-year{position:absolute;right:-150px;top:18px;font-family:var(--fd);font-size:216px;line-height:.74;
  font-weight:700;letter-spacing:-.06em;color:var(--fg);opacity:.10;pointer-events:none;user-select:none}
@container (max-width:1080px){.m-year{display:none}}
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
.m-wpoint{margin-top:6px;font-size:13px;line-height:1.7;color:var(--fg)}
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
/* 入场：只做一次，落在名字上 */
.m-name{animation:sf-rise .72s cubic-bezier(.22,.7,.2,1) .05s both}
`

export function renderMinimal(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '技能',
    projects: '作品',
    experience: '年表',
    contact: '来信',
  }
  /** 章节小标（极简版的编辑符号：编号 + 栏目词） */
  const KICK: Record<string, string> = {
    skills: 'SKILLS',
    projects: 'WORKS',
    experience: 'YEARS',
    contact: 'LETTER',
  }
  const nav = orderSections(sections, ['projects', 'experience', 'skills', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map((s) =>
      skillLevelVisible(data)
        ? `<li class="m-skill"><b>${esc(s.name)}</b><i class="m-leader"></i><span class="m-pct">${clampLevel(s.level)} / 100</span></li>`
        : `<li class="m-skill"><b>${esc(s.name)}</b></li>`
    )
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      const tags = tagItems(p.tags, '')
      return `<article class="m-work"><span class="m-idx">${String(i + 1).padStart(2, '0')}</span>
  <div>
    ${p.highlight ? `<span class="m-hl">精选</span>` : ''}<h3 class="m-wname">${esc(p.name)}</h3>
    ${p.description.trim() ? `<p class="m-wdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.points && p.points.length > 0 ? `<p class="m-wpoint">— ${esc(p.points[0])}</p>` : ''}
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
  ${e.points && e.points.length > 0 ? `<p class="m-epoint">— ${esc(e.points[0])}</p>` : ''}
  </div></article>`
    )
    .join('')

  const sec = (id: SectionDef['id'], body: string) =>
    sections.some((s) => s.id === id)
      ? `<section class="m-sec" id="${id}"><h2 class="m-h2">${String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')} · ${KICK[id]}</h2>${body}</section>`
      : ''

  const socials = socialLinks(data, 'm-soc', 'm-soc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-minimal">
  <div class="m-col">
    <header class="m-top"><span>${esc(data.name)}</span><nav aria-label="站点导航">${nav}</nav></header>
    <main>
      <section class="m-head">
        <span class="m-year" aria-hidden="true">${year}</span>
      <h1 class="s-name m-name">${esc(data.name)}</h1>
        <p class="m-role">${esc(data.title)}</p>
        ${avatarHTML(data, 'm-face', 'm-monogram')}
        ${data.status.trim() ? `<p class="m-status">${esc(data.status.trim())}</p>` : ''}
        ${data.bio.trim() ? `<p class="m-bio">${esc(data.bio.trim())}</p>` : ''}
      </section>
      ${sec('projects', projects)}
      ${sec('experience', experience)}
      ${sections.some((s) => s.id === 'skills') ? sec('skills', `<ul>${skills}</ul>`) : ''}
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
