/**
 * 粗野 Brutal —— 「海报墙」版式：
 * 顶部整宽黑条状态、满幅超大名字、整宽技能色块条（大百分比内嵌）、
 * 全宽海报式项目（黑白交替）、粗线表格经历、整宽反色联系区。
 * 特点：海报级的字号与色块，一切比别的版式大两号。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import {
  avatarHTML,
  clampLevel,
  getSections,
  projectLinks,
  tagItems,
  orderSections,
} from './shared'

export const BRUTAL_CSS = `
.b-hl{display:inline-block;margin-right:8px;padding:1px 5px;font-size:10.5px;letter-spacing:.12em;
  color:var(--sp-ink);border:1px solid currentColor;border-radius:2px;vertical-align:2px;}
.site-brutal{--bg:#f4f4f3;--fg:#0a0a0a;--muted:#4b4b4b;--line:#0a0a0a;--panel:#ffffff;--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.b-strip{background:var(--fg);color:var(--bg);padding:10px 16px;text-align:center;font-family:var(--fm);font-size:12px;letter-spacing:.24em;text-transform:uppercase}
.b-nav{display:flex;flex-wrap:wrap;border-bottom:3px solid var(--fg)}
.b-nav a{flex:1;text-align:center;padding:16px 10px;font-weight:900;font-size:15px;letter-spacing:.08em;border-right:3px solid var(--fg);min-width:110px}
.b-nav a:last-child{border-right:none}
.b-nav a:hover{background:var(--fg);color:var(--bg)}
.b-hero{position:relative;padding:64px 24px 56px;border-bottom:3px solid var(--fg);display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center}
.b-kick{font-family:var(--fm);letter-spacing:.3em;font-size:11.5px;color:var(--muted);text-transform:uppercase}
.b-name{font-size:clamp(64px,13cqw,148px);line-height:.95;font-weight:900;letter-spacing:-.02em;margin-top:10px;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.b-role{display:inline-block;margin-top:20px;background:var(--sp);color:var(--on-sp);padding:10px 18px;font-weight:800;font-size:clamp(15px,2.4cqw,21px)}
.b-meta{margin-top:24px;display:flex;flex-wrap:wrap}
.b-meta span{border:2px solid var(--fg);padding:8px 14px;font-family:var(--fm);font-size:12px;margin:0 -2px -2px 0;background:var(--panel);font-weight:600}
.b-face,.b-monogram{width:190px;height:190px;object-fit:cover;border:3px solid var(--fg);box-shadow:12px 12px 0 var(--sp)}
.b-monogram{display:grid;place-items:center;font-weight:900;font-size:64px;background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp)}
.b-sec{border-bottom:3px solid var(--fg);padding:52px 24px}
.b-h2{font-size:clamp(34px,6cqw,60px);font-weight:900;letter-spacing:-.01em;display:flex;align-items:center;gap:16px;font-style:normal}
.b-h2 i{display:inline-grid;place-items:center;background:var(--fg);color:var(--bg);font-family:var(--fm);font-size:13px;font-weight:700;padding:6px 11px;font-style:normal;flex:none}
.b-bars{margin-top:30px}
.b-bar{position:relative;height:54px;border:3px solid var(--fg);background:var(--panel);margin-bottom:14px;overflow:hidden}
.b-fill{position:absolute;inset:0;background:repeating-linear-gradient(45deg,var(--sp) 0 12px,var(--sp2) 12px 24px)}
.b-barlabel{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;height:100%;padding:0 14px;font-weight:900;font-size:17px;gap:12px}
/* 文字牌：技能名/百分比压在条纹填充上，背景可能是任意主题色（含黑色），
   所以给文字垫一块 panel 底 + 描边，保证任何主题色下都可读 */
.b-barlabel > span{background:var(--panel);border:2px solid var(--fg);padding:3px 12px}
.b-barlabel em{font-family:var(--fm);font-style:normal;font-weight:700;font-size:14px;background:var(--panel);border:2px solid var(--fg);padding:3px 10px}
.b-barlabel em{font-family:var(--fm);font-style:normal;font-weight:700;font-size:15px}
.b-slabs{margin-top:30px}
.b-slab{border:3px solid var(--fg);background:var(--panel);padding:22px;margin-bottom:20px;box-shadow:8px 8px 0 var(--fg)}
.b-slab:nth-child(even){background:var(--fg);color:var(--bg)}
.b-slab:nth-child(even) .b-sdesc{color:#b5b5b5}
.b-slab:nth-child(even) .b-sidx,.b-slab:nth-child(even) .b-when{color:var(--sp-inkd)}
.b-slab:nth-child(even) .b-stag{color:var(--bg);border-color:var(--bg)}
.b-slab:nth-child(even) .b-slinks a{color:var(--bg);border-bottom-color:var(--bg)}
.b-sidx{font-family:var(--fm);font-weight:700;color:var(--sp-ink);font-size:13px;letter-spacing:.2em}
.b-sname{font-size:clamp(24px,4cqw,34px);font-weight:900;margin-top:8px;overflow-wrap:anywhere}
.b-sdesc{margin-top:10px;font-size:14.5px;color:var(--muted);max-width:72ch;line-height:1.75}
.b-stags{margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.b-stag{border:2px solid currentColor;padding:3px 10px;font-size:11.5px;font-weight:800;font-family:var(--fm)}
.b-slinks{margin-top:14px;display:flex;gap:18px}
.b-slinks a{font-weight:900;font-size:13.5px;border-bottom:3px solid var(--sp);padding-bottom:2px;color:inherit}
.b-rows{margin-top:26px}
.b-row{display:grid;grid-template-columns:170px 1fr;gap:8px 20px;padding:20px 0;border-bottom:3px solid var(--fg)}
.b-row:last-child{border-bottom:none}
.b-when{font-family:var(--fm);font-weight:700;color:var(--sp-ink);font-size:13px}
.b-rrole{font-size:19px;font-weight:900}
.b-rorg{color:var(--muted);font-size:13.5px;margin-top:2px}
.b-rdesc{margin-top:8px;font-size:14px;color:var(--muted);grid-column:2}
.b-contact{background:var(--fg);color:var(--bg);padding:76px 24px;text-align:center}
.b-ctitle{font-size:clamp(42px,7cqw,74px);font-weight:900;font-style:normal;color:var(--bg)}
.b-clead{margin-top:14px;color:#a3a3a3;font-size:14.5px}
.b-cmail{display:inline-block;margin-top:28px;background:var(--sp);color:var(--on-sp);padding:16px 36px;font-weight:900;font-size:17px}
.b-cmail:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--bg);transition:.15s}
.b-csoc{margin-top:28px;display:flex;justify-content:center;gap:14px}
.b-csoc a{width:46px;height:46px;display:grid;place-items:center;border:2.5px solid var(--bg);color:var(--bg)}
.b-csoc a:hover{background:var(--bg);color:var(--fg)}
.b-foot{background:var(--fg);color:var(--bg);padding:14px 24px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--fm);font-size:11.5px}
@container (max-width:800px){
.b-hero{grid-template-columns:1fr}
.b-face,.b-monogram{width:150px;height:150px}
.b-row{grid-template-columns:1fr;gap:4px}
.b-rdesc{grid-column:1}
}
/* 入场：只做一次，落在名字上 */
.b-name{animation:sf-land .6s cubic-bezier(.2,.9,.3,1.3) both}
`

export function renderBrutal(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '本事',
    projects: '作品',
    experience: '履历',
    contact: '联络',
  }
  const nav = orderSections(sections, ['projects', 'skills', 'experience', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map(
      (s) => `<div class="b-bar"><span class="b-fill" style="width:${clampLevel(s.level)}%"></span>
  <span class="b-barlabel"><span>${esc(s.name)}</span><em>${clampLevel(s.level)}%</em></span></div>`
    )
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="b-slab"><span class="b-sidx">NO.${String(i + 1).padStart(2, '0')}</span>
  ${p.highlight ? `<span class="b-hl">精选</span>` : ''}<h3 class="b-sname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="b-sdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="b-stags">${tagItems(p.tags, 'b-stag')}</ul>` : ''}
  ${links ? `<div class="b-slinks">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="b-row"><span class="b-when">${esc(e.period)}</span>
  <div><h3 class="b-rrole">${esc(e.role)}</h3><p class="b-rorg">${esc(e.organization)}</p></div>
  ${e.description.trim() ? `<p class="b-rdesc">${esc(e.description.trim())}</p>` : ''}</div>`
    )
    .join('')

  const year = new Date().getFullYear()
  const strip = data.status.trim() || `${data.name} · PERSONAL SITE`

  return `<div class="site-root site-brutal">
  <div class="b-strip">${esc(strip)}</div>
  <nav class="b-nav" aria-label="站点导航">${nav}</nav>
  <main>
    <section class="b-hero">
      <div>
        <p class="b-kick">WHO IS ${esc(data.name)} ?</p>
        <h1 class="s-name b-name">${esc(data.name)}</h1>
        <span class="b-role">${esc(data.title)}</span>
        <div class="b-meta">
          ${data.location.trim() ? `<span>${esc(data.location.trim())}</span>` : ''}
          ${data.email.trim() ? `<span>${esc(data.email.trim())}</span>` : ''}
        </div>
      </div>
      ${avatarHTML(data, 'b-face', 'b-monogram')}
    </section>
    ${sections.some((s) => s.id === 'projects') ? `<section class="b-sec" id="projects"><h2 class="b-h2"><i>02</i>项目作品</h2><div class="b-slabs">${projects}</div></section>` : ''}
    ${sections.some((s) => s.id === 'skills') ? `<section class="b-sec" id="skills"><h2 class="b-h2"><i>01</i>技能栈</h2><div class="b-bars">${skills}</div></section>` : ''}
    ${sections.some((s) => s.id === 'experience') ? `<section class="b-sec" id="experience"><h2 class="b-h2"><i>03</i>经历</h2><div class="b-rows">${experience}</div></section>` : ''}
    <section class="b-contact" id="contact">
      <h2 class="b-ctitle">一起聊聊？</h2>
      <p class="b-clead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
      ${data.email.trim() ? `<a class="b-cmail" href="mailto:${esc(data.email.trim())}">${esc(data.email.trim())}</a>` : ''}
      ${socialLinks(data, 'b-csoc', 'b-csoc-a')}    </section>
  </main>
  <footer class="b-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
</div>`
}
