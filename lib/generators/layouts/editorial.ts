/**
 * 杂志 Editorial —— 「报刊」版式：
 * 报头（刊号线 + 大号衬线报名 + 双细线）、首字下沉双栏导语、
 * 表格化技能栏、大号斜体数字编号的特稿式项目、分类广告式双栏经历、读者来信联系框。
 * 特点：整页按报纸版面组织，栏目感与编号系统。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SERIF } from '../theme-consts'
import { clampLevel, getSections, projectLinks, type SectionDef } from './shared'

export const EDITORIAL_CSS = `
.site-editorial{--bg:#fafaf6;--fg:#1a1712;--muted:#5c554a;--line:#d6d0c4;--panel:#ffffff;--fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO}}
.e-paper{max-width:1020px;margin:0 auto;padding:0 clamp(20px,4cqw,48px) 72px}
.e-mast-top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:22px 0 12px;border-bottom:1px solid var(--fg);font-family:var(--fm);font-size:11px;letter-spacing:.24em;color:var(--muted);text-transform:uppercase}
.e-masthead{padding:36px 0 6px;text-align:center}
.e-title{font-family:var(--fd);font-size:clamp(56px,10cqw,108px);font-weight:800;line-height:1;letter-spacing:.01em;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.e-subtitle{margin-top:12px;text-align:center;font-family:var(--fd);font-style:italic;font-size:clamp(16px,2.6cqw,21px);color:var(--muted);font-weight:400}
.e-rule{margin-top:20px;height:4px;background:var(--fg)}
.e-rule2{margin-top:2px;height:1px;background:var(--fg);margin-bottom:0}
.e-nav{display:flex;justify-content:center;flex-wrap:wrap;gap:30px;padding:13px 0;border-bottom:1px solid var(--fg);font-family:var(--fm);font-size:11.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted)}
.e-nav a:hover{color:var(--fg)}
.e-statusline{text-align:center;padding:24px 0 0;font-family:var(--fm);font-size:11.5px;letter-spacing:.22em;color:var(--sp);text-transform:uppercase}
.e-lede{padding:26px 0 44px;border-bottom:1px solid var(--fg);column-count:2;column-gap:44px;font-size:15.5px;line-height:1.95;color:#3a342b}
.e-lede::first-letter{float:left;font-size:3.2em;line-height:.88;padding:2px 12px 0 0;font-weight:700;color:var(--sp);font-family:var(--fd)}
.e-sec{padding:46px 0;border-bottom:1px solid var(--fg)}
.e-sechead{display:flex;align-items:baseline;gap:16px;margin-bottom:28px}
.e-num{font-family:var(--fd);font-style:italic;font-size:36px;color:var(--sp);font-weight:700;line-height:1}
.e-h2{font-family:var(--fd);font-size:clamp(24px,3.4cqw,33px);font-weight:800;letter-spacing:-.01em;font-style:normal}
.e-hline{flex:1;border-bottom:1px solid var(--fg);transform:translateY(-7px)}
.e-table{width:100%;border-collapse:collapse;font-size:14.5px}
.e-table td{padding:11px 0;border-top:1px solid var(--line);vertical-align:middle}
.e-table tr:first-child td{border-top:none}
.e-tdname{font-weight:600}
.e-tdnum{text-align:right;font-family:var(--fm);font-size:12.5px;color:var(--muted);white-space:nowrap}
.e-sq{display:inline-block;width:9px;height:9px;background:var(--sp);margin-left:12px;vertical-align:middle}
.e-features{margin-top:6px}
.e-feat{display:grid;grid-template-columns:104px 1fr;gap:6px 24px;padding:26px 0;border-top:2px solid var(--fg)}
.e-feat:first-child{border-top:none;padding-top:0}
.e-fnum{font-family:var(--fd);font-style:italic;font-size:64px;line-height:.85;color:#d8d2c4;font-weight:700}
.e-feat:hover .e-fnum{color:var(--sp)}
.e-fhead h3{font-family:var(--fd);font-style:italic;font-size:clamp(21px,3.2cqw,29px);font-weight:700;overflow-wrap:anywhere}
.e-fdek{margin-top:8px;color:var(--muted);font-size:14px;line-height:1.8;max-width:68ch}
.e-fmeta{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px 18px;font-family:var(--fm);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.14em;list-style:none;align-items:center}
.e-fmeta a{color:var(--sp);border-bottom:1px solid var(--sp)}
.e-class{display:grid;grid-template-columns:1fr 1fr;gap:0 44px;margin-top:4px}
.e-citem{padding:16px 0;border-top:1px solid var(--fg)}
.e-cwhen{font-family:var(--fm);font-size:11.5px;color:var(--sp);letter-spacing:.16em}
.e-crole{font-family:var(--fd);font-weight:700;font-size:17px;margin-top:4px}
.e-corg{font-size:12.5px;color:var(--muted);margin-top:1px}
.e-cdesc{margin-top:6px;font-size:13.5px;color:var(--muted);line-height:1.7}
.e-letter{margin-top:48px;border:1px solid var(--fg);padding:40px 44px 36px;text-align:center;position:relative}
.e-letter::before{content:'“';position:absolute;top:-38px;left:22px;font-family:var(--fd);font-size:96px;color:#d8d2c4;line-height:1}
.e-lead{color:var(--muted);font-size:14.5px;max-width:50ch;margin:0 auto;line-height:1.8}
.e-mail{display:inline-block;margin-top:20px;font-family:var(--fd);font-size:19px;border-bottom:2px solid var(--sp);padding-bottom:3px;color:var(--fg)}
.e-mail:hover{color:var(--sp)}
.e-soc{margin-top:24px;display:flex;justify-content:center;gap:22px}
.e-soc a{width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--fg);border-radius:0;color:var(--fg)}
.e-soc a:hover{background:var(--fg);color:var(--bg)}
.e-foot{padding-top:26px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--fm);font-size:11px;color:var(--muted);letter-spacing:.16em;text-transform:uppercase}
@container (max-width:760px){
.e-lede{column-count:1}
.e-feat{grid-template-columns:1fr;gap:4px}
.e-fnum{font-size:40px}
.e-class{grid-template-columns:1fr}
.e-letter{padding:30px 24px}
}
`

export function renderEditorial(data: SiteData): string {
  const sections = getSections(data)
  const nav = sections.map((s) => `<a href="#${s.id}">${s.navLabel}</a>`).join('')
  const year = new Date().getFullYear()

  const skills = data.skills
    .map(
      (s) => `<tr><td class="e-tdname">${esc(s.name)}</td><td class="e-tdnum">${clampLevel(s.level)} / 100<span class="e-sq"></span></td></tr>`
    )
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      const meta = [
        ...p.tags.filter((t) => t.trim()).map((t) => `<li>${esc(t.trim())}</li>`),
        ...(links ? [`<li style="list-style:none">${links}</li>`] : []),
      ]
      return `<article class="e-feat"><span class="e-fnum">${String(i + 1).padStart(2, '0')}</span>
  <div class="e-fhead">
    <h3>${esc(p.name)}</h3>
    ${p.description.trim() ? `<p class="e-fdek">${esc(p.description.trim())}</p>` : ''}
    ${meta.length ? `<ul class="e-fmeta">${meta.join('')}</ul>` : ''}
  </div></article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<article class="e-citem"><span class="e-cwhen">${esc(e.period)}</span>
  <h3 class="e-crole">${esc(e.role)}</h3>
  <p class="e-corg">${esc(e.organization)}</p>
  ${e.description.trim() ? `<p class="e-cdesc">${esc(e.description.trim())}</p>` : ''}</article>`
    )
    .join('')

  const socials = socialLinks(data, 'e-soc', 'e-soc-a')
  const num = (id: SectionDef['id']) =>
    String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')

  return `<div class="site-root site-editorial">
  <div class="e-paper">
    <div class="e-mast-top"><span>PERSONAL ISSUE — ${year}</span><span>${esc(data.location.trim() || data.name)}</span></div>
    <header class="e-masthead">
      <h1 class="s-name e-title">${esc(data.name)}</h1>
      <p class="e-subtitle">${esc(data.title)}</p>
    </header>
    <div class="e-rule"></div>
    <div class="e-rule2"></div>
    <nav class="e-nav" aria-label="站点导航">${nav}</nav>
    <main>
      ${data.status.trim() ? `<p class="e-statusline">● ${esc(data.status.trim())}</p>` : ''}
      ${data.bio.trim() ? `<p class="e-lede">${esc(data.bio.trim())}</p>` : ''}
      ${sections.some((s) => s.id === 'skills') ? `<section class="e-sec" id="skills"><div class="e-sechead"><span class="e-num">${num('skills')}</span><h2 class="e-h2">技能栈</h2><span class="e-hline"></span></div><table class="e-table">${skills}</table></section>` : ''}
      ${sections.some((s) => s.id === 'projects') ? `<section class="e-sec" id="projects"><div class="e-sechead"><span class="e-num">${num('projects')}</span><h2 class="e-h2">项目特稿</h2><span class="e-hline"></span></div><div class="e-features">${projects}</div></section>` : ''}
      ${sections.some((s) => s.id === 'experience') ? `<section class="e-sec" id="experience"><div class="e-sechead"><span class="e-num">${num('experience')}</span><h2 class="e-h2">经历</h2><span class="e-hline"></span></div><div class="e-class">${experience}</div></section>` : ''}
      <section class="e-letter" id="contact">
        <h2 class="e-h2" style="font-style:italic">一起聊聊？</h2>
        <p class="e-lead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
        ${data.email.trim() ? `<a class="e-mail" href="mailto:${esc(data.email.trim())}">${esc(data.email.trim())}</a>` : ''}
        ${socials}
      </section>
      <footer class="e-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
    </main>
  </div>
</div>`
}
