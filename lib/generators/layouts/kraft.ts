/**
 * 手账 Kraft —— 「手帐页」版式：
 * 拍立得头像（和纸胶带）、波浪线姓名、标签 + 五格点评分的技能、
 * 交错微旋转的胶带便签项目、日期戳日记式经历、明信片联系卡（邮票框 + 地址线）。
 * 特点：手作质感组件（胶带/虚线/点评分/明信片）。
 */
import type { SiteData } from '@/types'
import { esc, monogram } from '../escape'
import { icon, socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import { avatarHTML, getSections, levelDots, projectLinks, tagItems, orderSections } from './shared'

export const KRAFT_CSS = `
.site-kraft{--bg:#f6ecdd;--fg:#3d2f22;--muted:#6e6252;--line:#e0d2bc;--panel:#fffbf2;--tape:rgba(255,252,240,.7);--dashed:#c9b691;--shadow:rgba(61,47,34,.14);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.k-page{position:relative;max-width:920px;margin:0 auto;padding:0 24px 72px;background-image:radial-gradient(rgba(61,47,34,.05) 1px,transparent 1px);background-size:16px 16px}
/* 主视觉锚点：左边一列打孔 —— 这页手账是被装订起来的，不是飘着的 */
/* 装订孔要够大才读得出来是"孔"：4.5px 实心 + 内阴影，再加一条骑缝虚线 */
.k-page::before{content:"";position:absolute;left:-38px;top:52px;bottom:56px;width:18px;pointer-events:none;
  background-image:radial-gradient(circle at 9px 9px,rgba(61,47,34,.34) 4.5px,rgba(61,47,34,.10) 5.2px,transparent 5.6px);
  background-size:18px 52px;background-repeat:repeat-y}
.k-page::after{content:"";position:absolute;left:-16px;top:52px;bottom:56px;width:1px;pointer-events:none;
  background:repeating-linear-gradient(180deg,rgba(61,47,34,.28) 0 6px,transparent 6px 13px)}
@container (max-width:1000px){.k-page::before{display:none}}
.k-nav{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;padding:20px 0;border-bottom:1.5px dashed var(--dashed)}
.k-nav a{border:1.5px dashed var(--dashed);background:var(--panel);border-radius:10px;padding:7px 16px;font-weight:700;font-size:13px;color:var(--fg)}
.k-nav a:hover{background:var(--sp-soft);border-color:var(--sp)}
.k-hero{text-align:center;padding:62px 0 46px}
.k-polaroid{position:relative;width:196px;margin:0 auto;background:var(--panel);border:1px solid var(--line);padding:12px 12px 36px;box-shadow:0 10px 24px var(--shadow);transform:rotate(-2deg);border-radius:3px}
.k-polaroid::before{content:'';position:absolute;top:-12px;left:50%;transform:translateX(-50%) rotate(-3deg);width:92px;height:26px;background:var(--tape);border:1px solid rgba(61,47,34,.1);box-shadow:0 2px 6px var(--shadow);z-index:2}
.k-pimg{width:100%;height:148px;object-fit:cover;border-radius:2px;display:block}
.k-pmono{width:100%;height:148px;display:grid;place-items:center;font-weight:800;font-size:52px;background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp);border-radius:2px}
.k-pcap{position:absolute;bottom:9px;left:0;right:0;font-family:var(--fm);font-size:10.5px;color:var(--muted);letter-spacing:.2em}
.k-status{display:inline-block;margin-top:36px;background:var(--tape);border:1px solid rgba(61,47,34,.12);padding:7px 18px;font-size:13px;font-weight:700;transform:rotate(-1deg);border-radius:3px;box-shadow:0 3px 8px var(--shadow)}
.k-name{margin-top:16px;font-size:clamp(42px,7cqw,64px);font-weight:800;letter-spacing:.01em;font-style:normal;background:none;-webkit-text-fill-color:currentColor;text-decoration:underline wavy var(--sp) 3px;text-underline-offset:12px}
.k-role{margin-top:16px;font-size:16px;color:var(--muted);font-weight:600}
.k-bio{margin:16px auto 0;max-width:54ch;color:var(--muted);line-height:1.9;font-size:14.5px}
.k-chips{margin-top:22px;display:flex;justify-content:center;flex-wrap:wrap;gap:10px}
.k-chip{display:inline-flex;align-items:center;gap:7px;background:var(--panel);border:1.5px dashed var(--dashed);border-radius:999px;padding:6px 15px;font-size:12.5px;color:var(--muted)}
.k-chip svg{width:13px;height:13px}
.k-sec{padding:40px 0}
.k-h2{display:flex;align-items:center;gap:14px;font-size:20px;font-weight:800;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.k-h2::before{content:'';width:12px;height:12px;background:var(--sp);border-radius:3px;transform:rotate(-4deg);flex:none}
.k-h2::after{content:'';flex:1;border-top:1.5px dashed var(--dashed)}
.k-tags{display:flex;flex-wrap:wrap;gap:12px 26px;margin-top:22px}
.k-tagrow{display:flex;align-items:center;gap:10px}
.k-tag{background:var(--panel);border:1.5px dashed var(--dashed);border-radius:10px 16px 12px 18px;padding:7px 14px;font-weight:700;font-size:14px}
.k-tagrow:nth-child(even) .k-tag{transform:rotate(.8deg)}
.k-tagrow:nth-child(odd) .k-tag{transform:rotate(-.6deg)}
.k-dots{display:flex;gap:4px}
.k-dots i{width:9px;height:9px;border-radius:50%;border:1.5px solid var(--sp);display:block}
.k-dots i.on{background:var(--sp)}
.k-notes{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:22px}
.k-note{position:relative;background:var(--panel);border:1.5px dashed var(--dashed);border-radius:14px;padding:20px;box-shadow:0 8px 18px var(--shadow)}
.k-note:nth-child(odd){transform:rotate(-.5deg)}
.k-note:nth-child(even){transform:rotate(.5deg)}
.k-note::before{content:'';position:absolute;top:-11px;left:30px;width:74px;height:22px;background:var(--tape);border:1px solid rgba(61,47,34,.1);transform:rotate(-2deg)}
.k-nname{font-weight:800;font-size:17px;overflow-wrap:anywhere}
.k-ndesc{margin-top:8px;color:var(--muted);font-size:13.5px;line-height:1.8}
.k-ntags{margin-top:12px;display:flex;flex-wrap:wrap;gap:7px;list-style:none}
.k-ntag{background:var(--sp-soft);border-radius:999px;padding:3px 11px;font-size:11.5px;font-weight:700}
.k-nlinks{margin-top:12px;display:flex;gap:14px}
.k-nlinks a{font-size:12.5px;font-weight:700;color:var(--sp-ink);border-bottom:1.5px dashed var(--sp);padding-bottom:1px}
.k-diary{margin-top:22px;display:flex;flex-direction:column;gap:20px}
.k-entry{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start}
.k-stamp{background:var(--panel);border:1.5px dashed var(--dashed);border-radius:8px;padding:8px 13px;font-family:var(--fm);font-size:11px;color:var(--sp-ink);font-weight:700;white-space:nowrap;transform:rotate(-1deg)}
.k-ebody b{font-size:15.5px;font-weight:800}
.k-eorg{font-size:12.5px;color:var(--muted);margin-top:2px}
.k-edesc{margin-top:7px;font-size:13.5px;color:var(--muted);line-height:1.8}
.k-postcard{margin-top:40px;background:var(--panel);border:1.5px solid var(--dashed);border-radius:14px;box-shadow:0 10px 24px var(--shadow);padding:30px;display:grid;grid-template-columns:1fr 180px;gap:28px;position:relative}
.k-postcard::before{content:'';position:absolute;top:-12px;left:50%;transform:translateX(-50%) rotate(2deg);width:96px;height:26px;background:var(--tape);border:1px solid rgba(61,47,34,.1);box-shadow:0 2px 6px var(--shadow)}
.k-pch2{font-size:22px;font-weight:800;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.k-pclead{margin-top:10px;color:var(--muted);font-size:13.5px;line-height:1.85}
.k-mail{display:inline-flex;align-items:center;gap:9px;margin-top:16px;background:var(--sp);color:#fffbf2;font-weight:800;padding:11px 24px;border-radius:999px;font-size:14px}
.k-mail svg{width:15px;height:15px}
.k-pcside{display:flex;flex-direction:column;gap:14px}
.k-stampbox{border:1.5px dashed var(--dashed);border-radius:8px;height:76px;display:grid;place-items:center;color:var(--sp-ink)}
.k-stampbox svg{width:26px;height:26px;opacity:.7}
.k-addr{display:flex;flex-direction:column;gap:14px}
.k-addr i{display:block;height:1.5px;background:#d9c8a8}
.k-addr i:last-child{width:62%}
.k-soc{display:flex;gap:10px}
.k-soc a{width:36px;height:36px;display:grid;place-items:center;border:1.5px dashed var(--dashed);border-radius:10px;background:var(--panel);color:var(--muted)}
.k-soc a:hover{color:var(--sp);border-color:var(--sp)}
.k-foot{margin-top:40px;text-align:center;font-family:var(--fm);font-size:11px;color:var(--muted)}
@container (max-width:760px){
.k-notes{grid-template-columns:1fr}
.k-note:nth-child(odd),.k-note:nth-child(even){transform:none}
.k-postcard{grid-template-columns:1fr}
.k-entry{grid-template-columns:1fr;gap:8px}
}
/* 入场：只做一次，落在名字上 */
.k-name{animation:sf-rise .72s cubic-bezier(.22,.7,.2,1) .05s both}
`

export function renderKraft(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '技能',
    projects: '贴纸',
    experience: '日子',
    contact: '留言',
  }
  const nav = orderSections(sections, ['experience', 'projects', 'skills', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map(
      (s) =>
        `<div class="k-tagrow"><span class="k-tag">${esc(s.name)}</span><span class="k-dots">${levelDots(s.level)}</span></div>`
    )
    .join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="k-note"><h3 class="k-nname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="k-ndesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="k-ntags">${tagItems(p.tags, 'k-ntag')}</ul>` : ''}
  ${links ? `<div class="k-nlinks">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="k-entry"><span class="k-stamp">${esc(e.period)}</span>
  <div class="k-ebody"><b>${esc(e.role)}</b><p class="k-eorg">${esc(e.organization)}</p>${e.description.trim() ? `<p class="k-edesc">${esc(e.description.trim())}</p>` : ''}</div></div>`
    )
    .join('')

  const socials = socialLinks(data, 'k-soc', 'k-soc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-kraft">
  <div class="k-page">
    <nav class="k-nav" aria-label="站点导航">${nav}</nav>
    <main>
      <section class="k-hero">
        <div class="k-polaroid">
          ${avatarHTML(data, 'k-pimg', 'k-pmono')}
          <span class="k-pcap">NO.${year} · ${monogram(data.name)}</span>
        </div>
        ${data.status.trim() ? `<span class="k-status">${esc(data.status.trim())}</span>` : ''}
        <h1 class="s-name k-name">${esc(data.name)}</h1>
        <p class="k-role">${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="k-bio">${esc(data.bio.trim())}</p>` : ''}
        <div class="k-chips">
          ${data.location.trim() ? `<span class="k-chip">${icon('pin')}${esc(data.location.trim())}</span>` : ''}
          ${data.email.trim() ? `<span class="k-chip">${icon('mail')}${esc(data.email.trim())}</span>` : ''}
        </div>
      </section>
      ${sections.some((s) => s.id === 'experience') ? `<section class="k-sec" id="experience"><h2 class="k-h2">手帐日记</h2><div class="k-diary">${experience}</div></section>` : ''}
      ${sections.some((s) => s.id === 'projects') ? `<section class="k-sec" id="projects"><h2 class="k-h2">便签作品</h2><div class="k-notes">${projects}</div></section>` : ''}
      ${sections.some((s) => s.id === 'skills') ? `<section class="k-sec" id="skills"><h2 class="k-h2">技能标签</h2><div class="k-tags">${skills}</div></section>` : ''}
      <section class="k-sec" id="contact" style="padding-bottom:0">
        <div class="k-postcard">
          <div>
            <h2 class="k-pch2">一起聊聊？</h2>
            <p class="k-pclead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
            ${data.email.trim() ? `<a class="k-mail" href="mailto:${esc(data.email.trim())}">${icon('mail')}寄封信</a>` : ''}
          </div>
          <div class="k-pcside">
            <span class="k-stampbox">${icon('mail')}</span>
            <div class="k-addr"><i></i><i></i><i></i></div>
            ${socials}
          </div>
        </div>
      </section>
    </main>
    <footer class="k-foot">© ${year} ${esc(data.name)} · 由 SiteCraft 个人官网生成器构建</footer>
  </div>
</div>`
}
