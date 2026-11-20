/**
 * 地铁 Metro —— 「线路图」版式（第 13 套，结构母题与前 12 套不同）。
 *
 * 母题：整站是一条线路。页头是线路牌，名字是第一站，技能是图例，
 * 项目与经历是同一条轨道上的站点（编号 S01…Sn），联系是终点站（双环）。
 * 一条竖线从页头贯到页脚，站点靠在这条线上——信息靠"线路"组织，不靠区块堆叠。
 *
 * 排版：无衬线正文 + 等宽站号（地铁导视就是这两样），字号阶梯与站距走 8 的倍数。
 * 动效只做一次：轨道自上而下生长，随后名字上浮；其余是回应动作的微交互。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { icon, socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import { avatarHTML, clampLevel, getSections, mailBtn, projectLinks, tagItems } from './shared'

export const METRO_CSS = `
.site-metro{position:relative;--bg:#ffffff;--fg:#101418;--fg2:#5b6570;--rule:#e3e8ee;--panel:#f6f8fa;--rail:#101418;
  --fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};
  --t-hero:clamp(44px,7.2cqw,84px);--t-h2:clamp(20px,2.6cqw,26px);--t-body:15px;--t-fine:11.5px;
  font-variant-numeric:tabular-nums lining-nums}
.mt-reg{max-width:1000px;margin:0 auto;padding-inline:clamp(18px,4cqw,44px)}

/* 线路牌：编号方块 + 站名 + 站台导航 */
.mt-top{display:flex;align-items:center;gap:14px;padding-block:18px 16px;border-bottom:2px solid var(--rail)}
.mt-badge{display:grid;place-items:center;width:34px;height:34px;border-radius:6px;background:var(--sp);
  color:var(--on-sp);font-family:var(--fm);font-size:13px;font-weight:700;letter-spacing:.02em;flex:none}
.mt-brand{font-weight:800;font-size:15px;letter-spacing:-.01em}
.mt-nav{margin-left:auto;display:flex;gap:20px;font-size:var(--t-fine);color:var(--fg2)}
.mt-nav a{padding-bottom:2px}
.mt-nav a:hover{color:var(--fg);box-shadow:0 1px 0 var(--sp)}

/* 页头站台 */
.mt-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;
  align-items:center;padding:44px 0 40px 54px;border-bottom:1px solid var(--rule)}
.mt-hero::before{content:"";position:absolute;left:11px;top:0;bottom:0;width:3px;background:var(--sp);
  transform-origin:top;animation:mt-grow .7s cubic-bezier(.22,.7,.2,1) both}
.mt-kicker{display:flex;align-items:center;gap:8px;font-family:var(--fm);font-size:var(--t-fine);
  letter-spacing:.14em;color:var(--fg2)}
.mt-dot{width:8px;height:8px;border-radius:50%;background:var(--sp);flex:none}
.mt-name{margin-top:12px;font-size:var(--t-hero);font-weight:800;line-height:.98;letter-spacing:-.035em;
  margin-left:-.03em;font-style:normal;background:none;-webkit-text-fill-color:currentColor;
  animation:sf-rise .7s cubic-bezier(.22,.7,.2,1) .12s both}
.mt-role{margin-top:14px;font-size:clamp(15px,1.9cqw,18px);font-weight:600;color:var(--fg)}
.mt-bio{margin-top:12px;max-width:58ch;color:var(--fg2);font-size:var(--t-body);line-height:1.75}
.mt-plate{margin-top:18px;display:flex;flex-wrap:wrap;gap:8px 22px;font-size:13px;color:var(--fg2);
  padding-top:14px;border-top:1px dashed var(--rule)}
.mt-plate span{display:inline-flex;align-items:center;gap:7px}
.mt-plate svg{width:13px;height:13px;opacity:.7}
.mt-face,.mt-logo{width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid var(--sp);flex:none}
.mt-logo{display:grid;place-items:center;background:var(--panel);font-family:var(--fm);font-size:26px;
  font-weight:700;color:var(--fg)}

/* 线路段：一条竖轨 + 靠在线上的站点 */
.mt-sec{position:relative;padding:38px 0 34px 54px;border-bottom:1px solid var(--rule)}
.mt-sec::before{content:"";position:absolute;left:11px;top:0;bottom:0;width:3px;background:var(--rail);opacity:.16}
.mt-sec:last-of-type{border-bottom:none}
.mt-stop{position:absolute;left:0;top:34px;width:25px;height:25px;border-radius:50%;
  background:var(--bg);border:3px solid var(--sp);display:grid;place-items:center}
.mt-stop i{width:7px;height:7px;border-radius:50%;background:var(--sp);display:block}
.mt-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.mt-code{font-family:var(--fm);font-size:var(--t-fine);letter-spacing:.16em;color:var(--sp-ink);font-weight:700}
.mt-h2{font-size:var(--t-h2);font-weight:800;letter-spacing:-.02em;font-style:normal}
.mt-note{margin-left:auto;font-size:var(--t-fine);color:var(--fg2)}

/* 技能 = 图例：色点 + 名称 + 线长表示熟练度 */
.mt-legend{margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:2px 40px}
.mt-sk{display:grid;grid-template-columns:12px minmax(0,1fr) 40px;align-items:center;gap:12px;padding:9px 0;
  border-top:1px solid var(--rule)}
.mt-sk:nth-child(-n+2){border-top:none}
.mt-sk b{width:10px;height:10px;border-radius:50%;background:var(--sp);opacity:.9}
.mt-sk span{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mt-sk em{font-family:var(--fm);font-style:normal;font-size:12px;color:var(--fg2);text-align:right}
.mt-bar{grid-column:2/4;height:2px;background:var(--rule);position:relative;margin-top:-4px}
.mt-bar i{position:absolute;inset:0 auto 0 0;background:var(--sp);transform-origin:left;
  animation:mt-grow-x .9s cubic-bezier(.22,.7,.2,1) both}

/* 项目站：站名 + 描述 + 换乘标签 */
.mt-station{position:relative;padding:18px 0 20px;border-top:1px solid var(--rule)}
.mt-station:first-child{border-top:none}
.mt-station::before{content:"";position:absolute;left:-43px;top:26px;width:11px;height:11px;border-radius:50%;
  background:var(--bg);border:2px solid var(--rail);opacity:.5}
.mt-station:hover::before{border-color:var(--sp);opacity:1}
.mt-stations{margin-top:10px}
.mt-sname{font-size:17px;font-weight:800;letter-spacing:-.01em;overflow-wrap:anywhere}
.mt-sdesc{margin-top:7px;color:var(--fg2);font-size:13.5px;line-height:1.7;max-width:62ch}
.mt-tags{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;list-style:none}
.mt-tag{font-family:var(--fm);font-size:10.5px;letter-spacing:.08em;color:var(--fg2);
  border:1px solid var(--rule);border-radius:3px;padding:2px 7px}
.mt-links{margin-top:10px;display:flex;gap:18px}
.mt-links a{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--fg);
  box-shadow:inset 0 -1px 0 var(--rule);padding-bottom:3px}
.mt-links a:hover{box-shadow:inset 0 -2px 0 var(--sp)}
.mt-links svg{width:12px;height:12px;opacity:.7}

/* 经历 = 站点时刻表 */
.mt-timetable{margin-top:12px}
.mt-leg{position:relative;display:grid;grid-template-columns:112px minmax(0,1fr);gap:6px 22px;
  padding:16px 0;border-top:1px solid var(--rule)}
.mt-leg:first-child{border-top:none}
.mt-leg::before{content:"";position:absolute;left:-43px;top:24px;width:9px;height:9px;border-radius:50%;
  background:var(--rail);opacity:.35}
.mt-when{font-family:var(--fm);font-size:12px;color:var(--sp-ink);letter-spacing:.04em;padding-top:2px}
.mt-role{font-weight:800;font-size:15px;letter-spacing:-.01em}
.mt-org{font-size:12.5px;color:var(--fg2);margin-top:2px}
.mt-desc{grid-column:2;font-size:13.5px;color:var(--fg2);line-height:1.7;max-width:54ch}

/* 终点站：双环 + 反白牌 */
.mt-end{background:var(--panel);padding-block:44px 40px}
/* 终点站必须和上面同一条轨道：轨道画在内层 register 上（外层是全宽底色，坐标不可用） */
.mt-endin{position:relative;padding:0 0 0 54px}
.mt-endin::before{content:"";position:absolute;left:11px;top:-44px;bottom:0;width:3px;background:var(--rail);opacity:.16}
.mt-terminus{position:absolute;left:0;top:0;width:25px;height:25px;border-radius:50%;
  background:var(--bg);border:3px solid var(--sp);display:grid;place-items:center}
.mt-terminus::after{content:"";width:9px;height:9px;border-radius:50%;background:var(--sp)}
.mt-end h2{font-size:clamp(24px,3.2cqw,32px);font-weight:800;letter-spacing:-.02em;font-style:normal}
.mt-clead{margin-top:10px;color:var(--fg2);font-size:var(--t-body);line-height:1.7;max-width:48ch}
.mt-ctas{margin-top:20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.mt-mail{display:inline-flex;align-items:center;gap:9px;padding:12px 20px;border-radius:999px;
  background:var(--sp);color:var(--on-sp);font-weight:700;font-size:14px}
.mt-mail:hover{filter:brightness(1.05)}
.mt-soc{display:flex;gap:10px}
.mt-soc a{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;border:1px solid var(--rule);
  color:var(--fg);background:var(--bg)}
.mt-soc a:hover{border-color:var(--sp);color:var(--sp)}
.mt-foot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-block:16px;
  font-size:var(--t-fine);color:var(--fg2);border-top:1px solid var(--rule)}

.site-metro a:focus-visible{outline:2px solid var(--sp);outline-offset:3px}
@keyframes mt-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes mt-grow-x{from{transform:scaleX(0)}to{transform:scaleX(1)}}

@container (max-width:760px){
.mt-hero{grid-template-columns:1fr;gap:18px;padding-left:40px}
.mt-hero::before{left:8px}
.mt-hero>*:nth-child(2){order:-1}
.mt-face,.mt-logo{width:72px;height:72px}
.mt-sec{padding-left:40px}
.mt-sec::before,.mt-end::before{left:8px}
.mt-stop,.mt-terminus{width:21px;height:21px}
.mt-stop{left:0}
.mt-station::before,.mt-leg::before{left:-32px}
.mt-legend{grid-template-columns:1fr}
.mt-sk:nth-child(-n+2){border-top:1px solid var(--rule)}
.mt-sk:first-child{border-top:none}
.mt-leg{grid-template-columns:1fr}
.mt-desc{grid-column:1}
.mt-nav{display:none}
.mt-endin{padding-left:40px}
.mt-endin::before,.mt-end::before{left:8px}
}
`

export function renderMetro(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '图例',
    projects: '沿线',
    experience: '时刻',
    contact: '终点',
  }
  const nav = sections.map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`).join('')
  const year = new Date().getFullYear()
  let stopNo = 1
  const code = () => 'S' + String(stopNo++).padStart(2, '0')

  const skills = data.skills
    .map(
      (s) =>
        `<li class="mt-sk"><b></b><span>${esc(s.name)}</span><em>${clampLevel(s.level)}</em><span class="mt-bar"><i style="width:${clampLevel(s.level)}%"></i></span></li>`
    )
    .join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="mt-station"><h3 class="mt-sname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="mt-sdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="mt-tags">${tagItems(p.tags, 'mt-tag')}</ul>` : ''}
  ${links ? `<div class="mt-links">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="mt-leg"><span class="mt-when">${esc(e.period)}</span>
  <div><div class="mt-role">${esc(e.role)}</div><div class="mt-org">${esc(e.organization)}</div></div>
  ${e.description.trim() ? `<p class="mt-desc">${esc(e.description.trim())}</p>` : ''}</div>`
    )
    .join('')

  const socials = socialLinks(data, 'mt-soc', 'mt-soc-a')
  const mail = mailBtn(data, data.email.trim(), 'mt-mail')

  return `<div class="site-root site-metro">
  <header class="mt-reg mt-top">
    <span class="mt-badge">M</span>
    <span class="mt-brand">${esc(data.name)}</span>
    <nav class="mt-nav" aria-label="站点导航">${nav}</nav>
  </header>
  <main>
    <section class="mt-reg mt-hero">
      <div>
        <p class="mt-kicker"><span class="mt-dot" aria-hidden="true"></span>始发站 · 在线</p>
        <h1 class="s-name mt-name">${esc(data.name)}</h1>
        <p class="mt-role">${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="mt-bio">${esc(data.bio.trim())}</p>` : ''}
        <div class="mt-plate">
          ${data.status.trim() ? `<span>${esc(data.status.trim())}</span>` : ''}
          ${data.location.trim() ? `<span>${icon('pin')}${esc(data.location.trim())}</span>` : ''}
          ${data.email.trim() ? `<span>${icon('mail')}${esc(data.email.trim())}</span>` : ''}
        </div>
      </div>
      ${avatarHTML(data, 'mt-face', 'mt-logo')}
    </section>

    ${sections.some((s) => s.id === 'skills') ? `<section class="mt-reg mt-sec" id="skills"><span class="mt-stop" aria-hidden="true"><i></i></span><div class="mt-head"><span class="mt-code">${code()}</span><h2 class="mt-h2">技能图例</h2><span class="mt-note">${data.skills.length} 项 · 线长＝熟练度</span></div><ul class="mt-legend">${skills}</ul></section>` : ''}
    ${sections.some((s) => s.id === 'projects') ? `<section class="mt-reg mt-sec" id="projects"><span class="mt-stop" aria-hidden="true"><i></i></span><div class="mt-head"><span class="mt-code">${code()}</span><h2 class="mt-h2">沿线站点</h2><span class="mt-note">${data.projects.length} 站</span></div><div class="mt-stations">${projects}</div></section>` : ''}
    ${sections.some((s) => s.id === 'experience') ? `<section class="mt-reg mt-sec" id="experience"><span class="mt-stop" aria-hidden="true"><i></i></span><div class="mt-head"><span class="mt-code">${code()}</span><h2 class="mt-h2">运行时刻</h2><span class="mt-note">换乘记录</span></div><div class="mt-timetable">${experience}</div></section>` : ''}
  </main>
  <section class="mt-end" id="contact">
    <div class="mt-reg mt-endin">
      <span class="mt-terminus" aria-hidden="true"></span>
      <h2>终点站 · 一起聊聊？</h2>
      <p class="mt-clead">实习、项目合作，或者只是打个招呼，都写信给我。</p>
      <div class="mt-ctas">${mail}${socials}</div>
    </div>
  </section>
  <footer class="mt-reg mt-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
</div>`
}
