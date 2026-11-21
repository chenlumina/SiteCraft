/**
 * 瑞士 Swiss —— 「网格样张」版式（v2 重设计）。
 *
 * 设计依据：frontend-design（审美意图 / 排版 / 动效节制）、better-typography（字号阶梯 /
 * 光学对齐 / 表格数字）、apple-design（单一入场编排 / reduced-motion）、
 * design-taste-frontend（等边距、hover 微互动、只放真实信息不放装饰）。
 *
 * 母题：一张活着的排版样张。三条不让步的系统规则——
 * 1. 一切数值走 tabular-nums：技能刻度、项目索引、年份在同一列严格对齐。是等宽数字，
 *    不是等宽字体；等宽字体做小标签恰恰是"生成感"头号特征，故本版式零 mono。
 * 2. 章节号是真信息：01/02/03 与该章节在页面中的实际位置一致，导航里复现同一串号，
 *    左侧竖排标签是排版样张的页边索引，不是标题上方的 eyebrow。
 * 3. 光学对齐：大标题与 h2 负边距悬挂，让字形左边距沉进页边；正文行宽 60ch。
 *
 * 动效只编排一次：载入时顶线画出 + 标题上浮 + 强调色块落位（错峰 80ms）。
 * 其余全部是回应动作的微交互（顶线延伸、标题位移、下划线转色）；
 * prefers-reduced-motion 下全部关闭。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { icon, socialLinks } from '../icons'
import { FONT_SANS } from '../theme-consts'
import {
  avatarHTML,
  clampLevel,
  getSections,
  projectLinks,
  tagItems,
  skillLevelVisible,
} from './shared'

export const SWISS_CSS = `
.sw-epoints{margin-top:6px;display:grid;gap:2px;list-style:none}
.sw-epoints li{position:relative;padding-left:13px;font-size:12.5px;line-height:1.65;color:var(--fg2, var(--muted, #555))}
.sw-epoints li::before{content:"";position:absolute;left:0;top:.62em;width:5px;height:1px;background:var(--sp)}
.sw-hl{display:inline-block;margin-right:8px;padding:1px 5px;font-size:10.5px;letter-spacing:.12em;
  color:var(--sp-ink);border:1px solid currentColor;border-radius:2px;vertical-align:2px;}
.site-swiss{--bg:#fff;--fg:#111;--fg2:#575757;--rule:#e4e4e4;--rulek:#111;--tint:#f7f7f7;--fd:${FONT_SANS};--fb:${FONT_SANS};
  --t-hero:clamp(46px,9.4cqw,104px);--t-h2:clamp(22px,2.8cqw,30px);--t-lead:clamp(16px,1.9cqw,19px);
  --t-body:15.5px;--t-data:13px;--t-fine:12px;
  font-variant-numeric:tabular-nums lining-nums}
.s-reg{max-width:1120px;margin:0 auto;padding-inline:clamp(20px,4.2cqw,48px)}

/* 顶栏：2px 实线由左向右画出，唯一一次入场编排的第一拍 */
.sw-top{position:relative;display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding-block:22px 18px}
.sw-top::after{content:"";position:absolute;inset:auto 0 0 0;height:2px;background:var(--rulek);
  transform-origin:left;animation:sw-draw .72s cubic-bezier(.22,.7,.2,1) both}
.sw-brand{font-weight:800;font-size:16px;letter-spacing:-.015em}
.sw-nav{display:flex;gap:26px;font-size:var(--t-data);color:var(--fg2)}
.sw-nav a{display:inline-flex;align-items:baseline;gap:7px;padding-bottom:2px}
.sw-nav a b{font-weight:700;color:var(--fg)}
.sw-nav a:hover{color:var(--fg);box-shadow:0 1px 0 var(--sp)}

/* Hero：悬挂式大标题 + 右端 1px 描边头像 */
.sw-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(28px,5cqw,64px);align-items:end;
  padding-block:clamp(56px,8cqw,84px) clamp(48px,6cqw,64px)}
.sw-name{animation:sw-rise .8s cubic-bezier(.22,.7,.2,1) .06s both}
.sw-face,.sw-monogram{animation:sw-rise .8s cubic-bezier(.22,.7,.2,1) .16s both}
.sw-name{font-family:var(--fd);font-size:var(--t-hero);font-weight:800;line-height:.9;
  letter-spacing:-.045em;margin-left:-.05em;font-style:normal;background:none;-webkit-text-fill-color:currentColor}
.sw-role{display:flex;align-items:center;gap:11px;margin-top:26px;font-size:var(--t-lead);font-weight:600;
  letter-spacing:-.008em;color:var(--fg)}
.sw-mark{width:10px;height:10px;flex:none;background:var(--sp);transform-origin:center;
  animation:sw-land .5s .34s cubic-bezier(.34,1.45,.64,1) both}
.sw-bio{margin-top:16px;max-width:60ch;color:var(--fg2);font-size:var(--t-body);line-height:1.78}
.sw-meta{display:flex;flex-wrap:wrap;gap:9px 28px;margin-top:26px;font-size:var(--t-data);color:var(--fg2)}
.sw-meta li{display:inline-flex;align-items:center;gap:7px}
.sw-meta svg{width:13px;height:13px;opacity:.75}
.sw-face,.sw-monogram{width:104px;height:104px;object-fit:cover;border:1px solid var(--rulek)}
.sw-monogram{display:grid;place-items:center;font-weight:800;font-size:32px;letter-spacing:-.02em;
  background:var(--fg);color:#fff}

/* 章节：左侧页边索引（竖排）+ 右侧正文，等边距由 grid 保证 */
.sw-sec{display:grid;grid-template-columns:96px minmax(0,1fr);gap:0 36px;
  padding:clamp(40px,5cqw,54px) 0 clamp(44px,5.4cqw,58px);border-top:1px solid var(--rule)}
.sw-sec:first-of-type{border-top:0}
.sw-sidx{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding-top:4px}
.sw-sidx b{font-size:var(--t-fine);font-weight:800;letter-spacing:.08em;color:var(--fg)}
.sw-sidx i{display:block;width:1px;height:28px;background:var(--rulek)}
.sw-sidx span{font-size:var(--t-fine);color:var(--fg2);writing-mode:vertical-rl;letter-spacing:.3em}
.sw-h2{font-size:var(--t-h2);font-weight:800;letter-spacing:-.022em;line-height:1.15;
  margin-left:-.03em;font-style:normal;background:none;-webkit-text-fill-color:currentColor}

/* 技能：真表格——名称 / 数值 / 刻度三列对齐，数值走 tabular-nums */
.sw-list{margin-top:20px}
.sw-row{display:grid;grid-template-columns:minmax(0,1fr) 46px 148px;gap:16px;align-items:center;
  padding:12px 0;border-top:1px solid var(--rule)}
.sw-row:first-child{border-top:0}
.sw-k{font-weight:600;font-size:14.5px;letter-spacing:-.005em}
.sw-v{text-align:right;font-size:var(--t-data);color:var(--fg2)}
.sw-track{position:relative;height:8px;background:var(--tint);box-shadow:inset 0 0 0 1px var(--rule)}
.sw-fill{position:absolute;inset:0 auto 0 0;background:var(--sp);transform-origin:left;
  animation:sw-grow .9s cubic-bezier(.22,.7,.2,1) both}

/* 项目：双栏索引卡，悬停时顶线由左延伸为强调色 */
.sw-grid{margin-top:6px;display:grid;grid-template-columns:1fr 1fr;column-gap:clamp(28px,4cqw,48px)}
.sw-p{position:relative;padding:24px 0 30px;border-top:1px solid var(--rule)}
.sw-p::after{content:"";position:absolute;inset:-1px 0 auto 0;height:2px;background:var(--sp);
  transform:scaleX(0);transform-origin:left;transition:transform .45s cubic-bezier(.22,.7,.2,1)}
.sw-p:hover::after{transform:scaleX(1)}
.sw-p:hover .sw-pname{transform:translateX(3px)}
.sw-pidx{font-size:var(--t-fine);font-weight:800;letter-spacing:.1em;color:var(--fg2)}
.sw-pname{margin-top:9px;font-size:19px;font-weight:800;letter-spacing:-.015em;line-height:1.25;
  overflow-wrap:anywhere;transition:transform .32s cubic-bezier(.22,.7,.2,1)}
.sw-pdesc{margin-top:9px;color:var(--fg2);font-size:13.5px;line-height:1.72;max-width:46ch}
.sw-ppoints{margin-top:8px;display:grid;gap:2px;list-style:none}
.sw-ppoints li{position:relative;padding-left:12px;font-size:12.5px;line-height:1.65;color:var(--fg)}
.sw-ppoints li::before{content:"";position:absolute;left:0;top:.62em;width:6px;height:1px;background:var(--sp)}
.sw-tags{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:13px;font-size:var(--t-fine);color:var(--fg2)}
.sw-links{display:flex;gap:22px;margin-top:14px}
.sw-links a{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:var(--t-data);
  padding-bottom:4px;box-shadow:inset 0 -1px 0 var(--rule)}
.sw-links a:hover{box-shadow:inset 0 -2px 0 var(--sp)}
.sw-links svg{width:12px;height:12px;opacity:.7}

/* 经历：三栏数据表，时间段单独成列便于纵向扫读 */
.sw-rows{margin-top:14px}
.sw-rowx{display:grid;grid-template-columns:132px 232px minmax(0,1fr);gap:6px 24px;
  padding:18px 0;border-top:1px solid var(--rule)}
.sw-rowx:first-child{border-top:0}
.sw-when{font-size:var(--t-data);color:var(--fg2);padding-top:2px}
.sw-r{font-weight:700;font-size:15px;letter-spacing:-.008em}
.sw-org{font-size:12.5px;color:var(--fg2);margin-top:3px}
.sw-desc{font-size:13.5px;color:var(--fg2);line-height:1.72;grid-column:3;max-width:52ch}

/* 联系：整幅反白；强调色只做背景不做文字，用户选浅色也不会踩对比度 */
.sw-cta{background:var(--fg);color:#fff;text-align:center;padding:clamp(60px,8cqw,88px) 24px}
.sw-cth2{font-size:clamp(32px,5.6cqw,54px);font-weight:800;letter-spacing:-.03em;line-height:1.05;
  font-style:normal;color:#fff;margin-left:-.03em}
.sw-clead{margin-top:16px;color:#a3a3a3;font-size:var(--t-body);line-height:1.7;max-width:44ch;margin-inline:auto}
.sw-cmail{display:inline-block;margin-top:30px;background:#fff;color:var(--fg);font-size:var(--t-data);
  font-weight:700;letter-spacing:.02em;padding:15px 34px;transition:box-shadow .25s}
.sw-cmail:hover{box-shadow:inset 0 -3px 0 var(--sp)}
.sw-csoc{margin-top:28px;display:flex;justify-content:center;gap:12px}
.sw-csoc a{width:42px;height:42px;display:grid;place-items:center;border:1px solid #757575;color:#fff;
  transition:border-color .25s,color .25s}
.sw-csoc a:hover{border-color:#fff;background:#1c1c1c}
.sw-foot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;
  padding:18px clamp(20px,4.2cqw,48px);font-size:11.5px;color:var(--fg2);border-top:2px solid var(--rulek)}

.site-swiss a:focus-visible{outline:2px solid var(--sp);outline-offset:3px}

@keyframes sw-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes sw-rise{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}
@keyframes sw-land{from{opacity:0;transform:scale(.15)}to{opacity:1;transform:scale(1)}}
@keyframes sw-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}

@container (max-width:820px){
.sw-hero{grid-template-columns:1fr;align-items:start}
.sw-hero>*:nth-child(2){order:-1}
.sw-face,.sw-monogram{width:76px;height:76px}
.sw-sec{grid-template-columns:1fr;gap:14px}
.sw-sidx{flex-direction:row;align-items:center;gap:10px;padding-top:0}
.sw-sidx i{width:28px;height:1px}
.sw-sidx span{writing-mode:horizontal-tb;letter-spacing:.16em}
.sw-grid{grid-template-columns:1fr}
.sw-rowx{grid-template-columns:1fr}
.sw-desc{grid-column:1}
.sw-nav{display:none}
}
@container (max-width:520px){
.sw-row{grid-template-columns:minmax(0,1fr) 40px;row-gap:8px}
.sw-track{grid-column:1/-1}
.sw-cta{padding:52px 20px}
}
@media (prefers-reduced-motion:reduce){
.site-swiss *,.site-swiss *::before,.site-swiss *::after{animation:none!important;transition:none!important}
}
`

export function renderSwiss(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '技能',
    projects: '项目',
    experience: '经历',
    contact: '联系',
  }
  const order = (id: string) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')
  const nav = sections
    .map((s) => `<a href="#${s.id}"><b>${order(s.id)}</b>${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map((s, i) => {
      const lv = clampLevel(s.level)
      if (!skillLevelVisible(data))
        return `<li class="sw-row"><span class="sw-k">${esc(s.name)}</span></li>`
      return `<li class="sw-row"><span class="sw-k">${esc(s.name)}</span><span class="sw-v">${lv}</span><span class="sw-track"><span class="sw-fill" style="width:${lv}%;animation-delay:${140 + i * 45}ms"></span></span></li>`
    })
    .join('')

  const projects = data.projects
    .map((p, i) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="sw-p"><span class="sw-pidx">${String(i + 1).padStart(2, '0')}</span>
  ${p.highlight ? `<span class="sw-hl">精选</span>` : ''}<h3 class="sw-pname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="sw-pdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.points && p.points.length > 0 ? `<ul class="sw-ppoints">${p.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="sw-tags">${tagItems(p.tags, 'sw-tag')}</ul>` : ''}
  ${links ? `<div class="sw-links">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<div class="sw-rowx"><span class="sw-when">${esc(e.period)}</span>
  <div><div class="sw-r">${esc(e.role)}</div><div class="sw-org">${esc(e.organization)}</div></div>
  ${e.description.trim() ? `<p class="sw-desc">${esc(e.description.trim())}</p>` : ''}
  ${e.points && e.points.length > 0 ? `<ul class="sw-epoints">${e.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>` : ''}</div>`
    )
    .join('')

  const socials = socialLinks(data, 'sw-csoc', 'sw-csoc-a')
  const year = new Date().getFullYear()
  const rail = (id: string, label: string) =>
    `<div class="sw-sidx" aria-hidden="true"><b>${order(id)}</b><i></i><span>${label}</span></div>`

  return `<div class="site-root site-swiss">
  <header class="s-reg sw-top"><span class="sw-brand">${esc(data.name)}</span><nav class="sw-nav" aria-label="站点导航">${nav}</nav></header>
  <main>
    <div class="s-reg sw-hero">
      <div>
        <h1 class="s-name sw-name">${esc(data.name)}</h1>
        <p class="sw-role"><span class="sw-mark" aria-hidden="true"></span>${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="sw-bio">${esc(data.bio.trim())}</p>` : ''}
        <ul class="sw-meta">
          ${data.status.trim() ? `<li>${esc(data.status.trim())}</li>` : ''}
          ${data.location.trim() ? `<li>${icon('pin')}${esc(data.location.trim())}</li>` : ''}
          ${data.email.trim() ? `<li>${icon('mail')}${esc(data.email.trim())}</li>` : ''}
        </ul>
      </div>
      ${avatarHTML(data, 'sw-face', 'sw-monogram')}
    </div>
    <div class="s-reg">
      ${sections.some((s) => s.id === 'skills') ? `<section class="sw-sec" id="skills">${rail('skills', '技能')}<div><h2 class="sw-h2">技能</h2><ul class="sw-list">${skills}</ul></div></section>` : ''}
      ${sections.some((s) => s.id === 'projects') ? `<section class="sw-sec" id="projects">${rail('projects', '项目')}<div><h2 class="sw-h2">项目</h2><div class="sw-grid">${projects}</div></div></section>` : ''}
      ${sections.some((s) => s.id === 'experience') ? `<section class="sw-sec" id="experience">${rail('experience', '经历')}<div><h2 class="sw-h2">经历</h2><div class="sw-rows">${experience}</div></div></section>` : ''}
    </div>
    <section class="sw-cta" id="contact">
      <h2 class="sw-cth2">一起聊聊？</h2>
      <p class="sw-clead">实习、项目合作，或者只是打个招呼，都写信给我。</p>
      ${data.email.trim() ? `<a class="sw-cmail" href="mailto:${esc(data.email.trim())}">${esc(data.email.trim())}</a>` : ''}
      ${socials}
    </section>
  </main>
  <footer class="sw-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
</div>`
}
