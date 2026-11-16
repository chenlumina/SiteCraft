/**
 * 水墨 Ink —— 「卷轴」版式：
 * 右侧竖排导航 + 竖排落款签名、笔锋墨条技能、挂轴式竖项目卡、画卷式经历。
 * 特点：竖排文字（writing-mode）与留白构图，东方文人气质来自结构而非颜色。
 */
import type { SiteData } from '@/types'
import { esc, monogram } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SERIF } from '../theme-consts'
import { avatarHTML, clampLevel, getSections, mailBtn, projectLinks, tagItems } from './shared'

export const INK_CSS = `
.site-ink{--bg:#f7f3ea;--fg:#1c1a17;--muted:#6f6656;--line:#ddd3c2;--panel:#fbf8f1;--fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO}}
.i-layout{display:grid;grid-template-columns:1fr auto}
.i-side{writing-mode:vertical-rl;display:flex;align-items:center;gap:18px;padding:26px 14px;border-left:1px solid var(--line);align-self:stretch}
.i-side nav{display:flex;gap:16px}
.i-side nav a{letter-spacing:.42em;font-size:13.5px;color:var(--muted);transition:color .2s}
.i-side nav a:hover{color:var(--sp)}
.i-seal{width:34px;height:34px;border-radius:6px;background:var(--sp);color:#fbf8f1;display:grid;place-items:center;font-family:var(--fd);font-weight:700;font-size:16px;box-shadow:0 0 0 1px var(--sp-glow),0 2px 10px var(--sp-glow)}
.i-main{min-width:0}
.i-hero{display:grid;grid-template-columns:1fr auto;gap:44px;align-items:start;padding:88px clamp(20px,5cqw,72px) 68px;border-bottom:1px solid var(--line)}
.i-name{font-family:var(--fd);font-size:clamp(46px,7cqw,72px);font-weight:700;letter-spacing:.04em;font-style:normal;line-height:1.15}
.i-role{margin-top:14px;font-style:italic;color:var(--muted);font-size:17px;font-weight:400}
.i-role::before{content:'「';color:var(--sp)}
.i-role::after{content:'」';color:var(--sp)}
.i-status{display:inline-flex;align-items:center;gap:9px;margin-top:22px;font-family:var(--fm);font-size:12px;color:var(--muted)}
.i-status::before{content:'';width:7px;height:7px;border-radius:50%;background:#34d399;animation:sp-pulse 2.4s infinite}
.i-bio{margin-top:18px;color:var(--muted);font-size:15px;line-height:1.95;max-width:54ch}
.i-fig{display:flex;align-items:flex-start;gap:16px}
.i-figbox{position:relative}
.i-face,.i-monogram{width:150px;height:150px;border-radius:50%;object-fit:cover;border:2px solid var(--line);box-shadow:0 0 0 7px var(--panel),0 0 0 8px var(--line)}
.i-monogram{display:grid;place-items:center;font-family:var(--fd);font-weight:700;font-size:52px;background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp)}
.i-vsign{writing-mode:vertical-rl;font-size:12.5px;letter-spacing:.5em;color:var(--muted);padding-top:6px}
.i-sec{padding:60px clamp(20px,5cqw,72px);border-bottom:1px solid var(--line)}
.i-h2{font-family:var(--fd);font-size:clamp(26px,3.6cqw,34px);font-weight:700;position:relative;padding-bottom:16px;margin-bottom:34px;font-style:normal}
.i-h2::after{content:'';position:absolute;left:0;bottom:0;width:76px;height:10px;background:radial-gradient(ellipse 58px 8px at 38% 50%,var(--sp-soft),transparent 75%),radial-gradient(ellipse 26px 5px at 80% 55%,var(--sp-glow),transparent 72%)}
.i-h2 .i-kick{position:absolute;right:0;bottom:18px;font-family:var(--fm);font-size:11px;letter-spacing:.34em;color:var(--sp)}
.i-skills{display:flex;flex-direction:column;gap:14px}
.i-skill{display:grid;grid-template-columns:120px 1fr 46px;gap:16px;align-items:center}
.i-sname{font-family:var(--fd);font-size:15.5px;font-weight:700}
.i-bar{height:12px;background:var(--track);border-radius:6px 3px 3px 6px;overflow:hidden}
.i-brush{display:block;height:100%;background:linear-gradient(90deg,var(--sp),var(--sp2) 72%,transparent 98%);-webkit-mask:linear-gradient(90deg,#000 80%,transparent 99%);mask:linear-gradient(90deg,#000 80%,transparent 99%);border-radius:8px 3px 3px 8px}
.i-spct{font-family:var(--fm);font-size:11.5px;color:var(--muted);text-align:right}
.i-hangs{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
.i-hang{background:var(--panel);border:1px solid var(--line);border-radius:8px;overflow:hidden;position:relative;transition:transform .2s,box-shadow .2s}
.i-hang:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(28,26,23,.12)}
.i-brocade{height:9px;background:linear-gradient(90deg,var(--sp),var(--sp2) 46%,transparent 94%)}
.i-hangin{padding:18px 20px 20px}
.i-hname{font-family:var(--fd);font-size:18px;font-weight:700;overflow-wrap:anywhere}
.i-hdesc{margin-top:8px;color:var(--muted);font-size:13.5px;line-height:1.8}
.i-htags{margin-top:12px;display:flex;flex-wrap:wrap;gap:7px;list-style:none}
.i-htag{border:1px solid var(--line);color:var(--muted);border-radius:999px;padding:3px 11px;font-family:var(--fm);font-size:11px}
.i-hlinks{margin-top:12px;display:flex;gap:16px;font-size:13px}
.i-hlinks a{color:var(--sp)}
.i-hlinks a:hover{text-decoration:underline}
.i-scroll{position:relative;padding-left:30px;max-width:760px}
.i-scroll::before{content:'';position:absolute;left:6px;top:8px;bottom:8px;width:1px;background:linear-gradient(var(--sp-soft),transparent)}
.i-era{position:relative;padding-bottom:30px}
.i-era:last-child{padding-bottom:0}
.i-era::before{content:'';position:absolute;left:-28px;top:8px;width:9px;height:9px;border-radius:50%;background:var(--sp);box-shadow:0 0 0 4px var(--sp-soft)}
.i-ewhen{font-family:var(--fm);font-size:12px;color:var(--sp)}
.i-erole{font-family:var(--fd);font-size:18px;font-weight:700;margin-top:4px}
.i-eorg{font-size:13px;color:var(--muted);margin-top:2px}
.i-edesc{margin-top:8px;font-size:13.5px;color:var(--muted);line-height:1.85;max-width:58ch}
.i-letter{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:48px 34px;text-align:center;position:relative;margin:0 clamp(20px,5cqw,72px)}
.i-letter::after{content:'';position:absolute;right:24px;top:22px;width:26px;height:26px;background:var(--sp);border-radius:4px;opacity:.9;box-shadow:0 0 0 3px var(--sp-soft)}
.i-lead{color:var(--muted);font-size:14.5px;max-width:46ch;margin:0 auto}
.i-mail{display:inline-block;margin-top:20px;font-family:var(--fd);font-size:19px;color:var(--fg);border-bottom:2px solid var(--sp);padding-bottom:3px}
.i-mail:hover{color:var(--sp)}
.i-soc{margin-top:24px;display:flex;justify-content:center;gap:12px}
.i-soc a{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--line);border-radius:8px;color:var(--muted);background:#fff}
.i-soc a:hover{color:var(--sp);border-color:var(--sp)}
.i-foot{padding:22px clamp(20px,5cqw,72px);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--fm);font-size:11.5px;color:var(--muted)}
@container (max-width:860px){
.i-side{display:none}
.i-hero{grid-template-columns:1fr}
.i-fig{order:-1}
.i-hangs{grid-template-columns:1fr}
.i-skill{grid-template-columns:92px 1fr 42px;gap:10px}
}
`

export function renderInk(data: SiteData): string {
  const sections = getSections(data)
  const nav = sections.map((s) => `<a href="#${s.id}">${s.navLabel}</a>`).join('')

  const skills = data.skills
    .map(
      (s) => `<div class="i-skill"><span class="i-sname">${esc(s.name)}</span>
  <span class="i-bar"><span class="i-brush" style="width:${clampLevel(s.level)}%"></span></span>
  <span class="i-spct">${clampLevel(s.level)}%</span></div>`
    )
    .join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="i-hang"><div class="i-brocade"></div>
  <div class="i-hangin">
    <h3 class="i-hname">${esc(p.name)}</h3>
    ${p.description.trim() ? `<p class="i-hdesc">${esc(p.description.trim())}</p>` : ''}
    ${p.tags.some((t) => t.trim()) ? `<ul class="i-htags">${tagItems(p.tags, 'i-htag')}</ul>` : ''}
    ${links ? `<div class="i-hlinks">${links}</div>` : ''}
  </div></article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="i-era"><span class="i-ewhen">${esc(e.period)}</span>
  <h3 class="i-erole">${esc(e.role)}</h3>
  <p class="i-eorg">${esc(e.organization)}</p>
  ${e.description.trim() ? `<p class="i-edesc">${esc(e.description.trim())}</p>` : ''}</div>`
    )
    .join('')

  const socials = socialLinks(data, 'i-soc', 'i-soc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-ink">
  <div class="i-layout">
    <main class="i-main">
      <section class="i-hero">
        <div>
          <h1 class="s-name i-name">${esc(data.name)}</h1>
          <p class="i-role">${esc(data.title)}</p>
          ${data.status.trim() ? `<p class="i-status">${esc(data.status.trim())}</p>` : ''}
          ${data.bio.trim() ? `<p class="i-bio">${esc(data.bio.trim())}</p>` : ''}
        </div>
        <div class="i-fig">
          <div class="i-figbox">${avatarHTML(data, 'i-face', 'i-monogram')}</div>
          <p class="i-vsign">${esc(data.name)} · 印</p>
        </div>
      </section>
      ${sections.some((s) => s.id === 'skills') ? `<section class="i-sec" id="skills"><h2 class="i-h2">技能栈<span class="i-kick">INK</span></h2><div class="i-skills">${skills}</div></section>` : ''}
      ${sections.some((s) => s.id === 'projects') ? `<section class="i-sec" id="projects"><h2 class="i-h2">项目作品<span class="i-kick">SCROLLS</span></h2><div class="i-hangs">${projects}</div></section>` : ''}
      ${sections.some((s) => s.id === 'experience') ? `<section class="i-sec" id="experience"><h2 class="i-h2">经历<span class="i-kick">TIMELINE</span></h2><div class="i-scroll">${experience}</div></section>` : ''}
      <section class="i-sec" id="contact" style="border-bottom:none;padding-bottom:72px">
        <div class="i-letter">
          <h2 class="i-h2" style="margin-bottom:12px">一起聊聊？</h2>
          <p class="i-lead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
          ${mailBtn(data, data.email.trim() || '', 'i-mail')}
          ${socials}
        </div>
      </section>
      <footer class="i-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
    </main>
    <aside class="i-side">
      <nav aria-label="站点导航">${nav}</nav>
      <span class="i-seal">${monogram(data.name)}</span>
    </aside>
  </div>
</div>`
}
