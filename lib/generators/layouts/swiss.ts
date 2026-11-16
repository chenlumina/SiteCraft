/**
 * 瑞士 Swiss —— 「网格志」版式：
 * 国际主义排版：粗/细规则线分区、每个区块左侧巨型灰编号 + 右侧内容、
 * 技能是带刻度条的数据行、项目是双栏索引卡（2px 顶线）、经历是三栏数据表、
 * 联系区是整幅黑底。无卡片、无阴影、无圆角，信息全靠网格与字重组织。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { icon, socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import { avatarHTML, clampLevel, getSections, projectLinks, tagItems } from './shared'

export const SWISS_CSS = `
.site-swiss{--bg:#ffffff;--fg:#111111;--muted:#666666;--hair:#dcdcdc;--track:#e9e9e9;--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.s-reg{max-width:1080px;margin:0 auto;padding:0 clamp(20px,4cqw,44px)}
.sw-top{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:22px 0;border-bottom:2px solid var(--fg)}
.sw-brand{font-weight:800;font-size:16px;letter-spacing:-.01em}
.sw-nav{display:flex;gap:24px;font-family:var(--fm);font-size:12px;letter-spacing:.16em;text-transform:uppercase}
.sw-nav a{color:var(--muted)}
.sw-nav a:hover{color:var(--fg);box-shadow:0 2px 0 var(--sp)}
.sw-hero{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end;padding:84px 0 60px;border-bottom:1px solid var(--hair)}
.sw-sq{display:block;width:15px;height:15px;background:var(--sp);margin-bottom:24px}
.sw-name{font-size:clamp(54px,9cqw,106px);font-weight:800;letter-spacing:-.035em;line-height:1;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.sw-role{margin-top:16px;font-size:clamp(16px,2.4cqw,20px);font-weight:600;color:var(--sp)}
.sw-bio{margin-top:20px;max-width:58ch;color:var(--muted);font-size:15px;line-height:1.85}
.sw-meta{margin-top:24px;display:flex;flex-wrap:wrap;gap:10px 28px;font-family:var(--fm);font-size:12px;color:var(--muted)}
.sw-meta span{display:inline-flex;align-items:center;gap:7px}
.sw-meta svg{width:13px;height:13px}
.sw-face,.sw-monogram{width:100px;height:100px;object-fit:cover;border:1px solid var(--fg)}
.sw-monogram{display:grid;place-items:center;font-weight:800;font-size:36px;background:var(--sp);color:#fff}
.sw-block{display:grid;grid-template-columns:100px 1fr;gap:28px;padding:56px 0;border-bottom:1px solid var(--hair)}
.sw-num{font-family:var(--fd);font-weight:800;font-size:48px;line-height:1;color:#e4e4e4;letter-spacing:-.02em}
.sw-h2{font-size:clamp(25px,3.4cqw,34px);font-weight:800;letter-spacing:-.02em;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.sw-table{margin-top:24px}
.sw-trow{display:grid;grid-template-columns:1fr 52px 44px;gap:16px;align-items:center;padding:11px 0;border-top:1px solid var(--hair)}
.sw-trow:first-child{border-top:none}
.sw-tname{font-weight:600;font-size:14.5px}
.sw-pct{font-family:var(--fm);font-size:12px;color:var(--muted);text-align:right}
.sw-tickbox{position:relative;height:10px;background:var(--track)}
.sw-tick{position:absolute;left:0;top:0;bottom:0;background:var(--sp)}
.sw-cards{margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:0 44px}
.sw-card{padding:18px 0 26px;border-top:2px solid var(--fg)}
.sw-cidx{font-family:var(--fm);font-size:11.5px;color:var(--sp);font-weight:700;letter-spacing:.14em}
.sw-cname{margin-top:8px;font-size:19px;font-weight:800;letter-spacing:-.01em;overflow-wrap:anywhere}
.sw-cdesc{margin-top:8px;color:var(--muted);font-size:13.5px;line-height:1.75}
.sw-ctags{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;list-style:none}
.sw-ctag{font-family:var(--fm);font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.sw-clinks{margin-top:12px;display:flex;gap:18px}
.sw-clinks a{font-family:var(--fm);font-size:11.5px;color:var(--fg);box-shadow:0 2px 0 var(--sp);padding-bottom:2px}
.sw-rows{margin-top:10px}
.sw-rrow{display:grid;grid-template-columns:150px 220px 1fr;gap:8px 20px;padding:16px 0;border-top:1px solid var(--hair)}
.sw-rrow:first-child{border-top:none}
.sw-when{font-family:var(--fm);font-size:12px;color:var(--sp);padding-top:3px}
.sw-rrole{font-weight:700;font-size:15px}
.sw-rorg{font-size:12.5px;color:var(--muted);margin-top:2px}
.sw-rdesc{margin-top:6px;font-size:13.5px;color:var(--muted);line-height:1.7;grid-column:3}
.sw-cta{background:var(--fg);color:#fff;text-align:center;padding:76px 24px}
.sw-cth2{font-size:clamp(34px,6cqw,56px);font-weight:800;letter-spacing:-.02em;font-style:normal;color:#fff}
.sw-clead{margin-top:14px;color:#999;font-size:14px;max-width:46ch;margin-inline:auto}
.sw-cmail{display:inline-block;margin-top:26px;background:#fff;color:var(--fg);font-family:var(--fm);font-weight:700;font-size:13.5px;letter-spacing:.1em;padding:14px 32px}
.sw-cmail:hover{background:var(--sp);color:#fff}
.sw-csoc{margin-top:26px;display:flex;justify-content:center;gap:12px}
.sw-csoc a{width:42px;height:42px;display:grid;place-items:center;border:1px solid #666;color:#fff}
.sw-csoc a:hover{border-color:#fff}
.sw-foot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:18px clamp(20px,4cqw,44px);font-family:var(--fm);font-size:11px;color:var(--muted);border-top:2px solid var(--fg)}
@container (max-width:800px){
.sw-hero{grid-template-columns:1fr}
.sw-block{grid-template-columns:1fr;gap:12px}
.sw-cards{grid-template-columns:1fr}
.sw-rrow{grid-template-columns:1fr}
.sw-rdesc{grid-column:1}
.sw-nav{display:none}
}
`

export function renderSwiss(data: SiteData): string {
  const sections = getSections(data)
  const nav = sections.map((s) => `<a href="#${s.id}">${s.navLabel}</a>`).join('')

  const skills = data.skills
    .map(
      (s) => `<div class="sw-trow"><span class="sw-tname">${esc(s.name)}</span><span class="sw-pct">${clampLevel(s.level)}</span><span class="sw-tickbox"><span class="sw-tick" style="width:${clampLevel(s.level)}%"></span></span></div>`
    )
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="sw-card"><span class="sw-cidx">${String(i + 1).padStart(2, '0')} / PROJECT</span>
  <h3 class="sw-cname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="sw-cdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="sw-ctags">${tagItems(p.tags, 'sw-ctag')}</ul>` : ''}
  ${links ? `<div class="sw-clinks">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="sw-rrow"><span class="sw-when">${esc(e.period)}</span>
  <div><div class="sw-rrole">${esc(e.role)}</div><div class="sw-rorg">${esc(e.organization)}</div></div>
  ${e.description.trim() ? `<p class="sw-rdesc">${esc(e.description.trim())}</p>` : ''}</div>`
    )
    .join('')

  const socials = socialLinks(data, 'sw-csoc', 'sw-csoc-a')
  const year = new Date().getFullYear()
  const num = (id: string) =>
    String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')

  return `<div class="site-root site-swiss">
  <header class="s-reg sw-top"><span class="sw-brand">${esc(data.name)}</span><nav class="sw-nav" aria-label="站点导航">${nav}</nav></header>
  <main>
    <div class="s-reg sw-hero">
      <div>
        <span class="sw-sq"></span>
        <h1 class="s-name sw-name">${esc(data.name)}</h1>
        <p class="sw-role">${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="sw-bio">${esc(data.bio.trim())}</p>` : ''}
        <div class="sw-meta">
          ${data.status.trim() ? `<span>${esc(data.status.trim())}</span>` : ''}
          ${data.location.trim() ? `<span>${icon('pin')}${esc(data.location.trim())}</span>` : ''}
          ${data.email.trim() ? `<span>${icon('mail')}${esc(data.email.trim())}</span>` : ''}
        </div>
      </div>
      ${avatarHTML(data, 'sw-face', 'sw-monogram')}
    </div>
    <div class="s-reg">
      ${sections.some((s) => s.id === 'skills') ? `<section class="sw-block" id="skills"><span class="sw-num">${num('skills')}</span><div><h2 class="sw-h2">技能栈</h2><div class="sw-table">${skills}</div></div></section>` : ''}
      ${sections.some((s) => s.id === 'projects') ? `<section class="sw-block" id="projects"><span class="sw-num">${num('projects')}</span><div><h2 class="sw-h2">项目作品</h2><div class="sw-cards">${projects}</div></div></section>` : ''}
      ${sections.some((s) => s.id === 'experience') ? `<section class="sw-block" id="experience"><span class="sw-num">${num('experience')}</span><div><h2 class="sw-h2">经历</h2><div class="sw-rows">${experience}</div></div></section>` : ''}
    </div>
    <section class="sw-cta" id="contact">
      <h2 class="sw-cth2">一起聊聊？</h2>
      <p class="sw-clead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
      ${data.email.trim() ? `<a class="sw-cmail" href="mailto:${esc(data.email.trim())}">${esc(data.email.trim())}</a>` : ''}
      ${socials}
    </section>
  </main>
  <footer class="sw-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
</div>`
}
