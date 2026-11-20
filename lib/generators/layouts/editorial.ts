/**
 * 杂志 Editorial —— 「报纸内页」版式（v2 重设计）。
 *
 * 设计判定（frontend-design / better-typography / apple-design / design-taste-frontend）：
 * - 删掉 5 处 text-transform:uppercase 小标签：那正是"生成感"的头号特征，而且会把
 *   iOS / npm 这类专名改成全大写。改用 font-variant-caps:small-caps —— 印刷的真做法，
 *   只对拉丁字母生效，中文标签原样保留。
 * - 删掉 96px 的装饰引号与 ● 圆点：装饰不承载信息就删。
 * - 全站单一字体家族（衬线），数据靠 tabular-nums 对齐；衬线正文按规范给更宽行距（1.9）。
 * - 唯一的主角是"刊头的双线系统"：3px 章节线 + 1px 栏内线，全页同一条线的两种粗细。
 *   入场只编一次——双线由左画出、报名上浮落定；其余是回应动作的微交互。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_SERIF } from '../theme-consts'
import { clampLevel, getSections, projectLinks, type SectionDef, orderSections } from './shared'

export const EDITORIAL_CSS = `
.e-epoints{margin-top:6px;display:grid;gap:2px;list-style:none}
.e-epoints li{position:relative;padding-left:13px;font-size:12.5px;line-height:1.65;color:var(--fg2, var(--muted, #555))}
.e-epoints li::before{content:"";position:absolute;left:0;top:.62em;width:5px;height:1px;background:var(--sp)}
.site-editorial{--bg:#faf8f3;--fg:#1a1712;--fg2:#565045;--line:#d9d3c6;--tint:#f2eee4;--fd:${FONT_SERIF};--fb:${FONT_SERIF};
  --t-title:clamp(48px,9.2cqw,100px);--t-h2:clamp(21px,2.9cqw,29px);--t-body:15px;--t-lead:16.5px;--t-fine:11.5px;
  font-variant-numeric:tabular-nums lining-nums}
.e-paper{max-width:1040px;margin:0 auto;padding:0 clamp(20px,4cqw,48px) 64px}

/* 刊头：这条 3px 线是整份版面的主音，它画出之后整页才开始说话 */
.e-mast{display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap;
  padding:22px 0 10px;font-size:var(--t-fine);color:var(--fg2);font-variant-caps:small-caps;letter-spacing:.08em}
.e-masthead{padding:30px 0 4px;text-align:center}
.e-title{font-family:var(--fd);font-size:var(--t-title);font-weight:800;line-height:.94;letter-spacing:-.025em;
  margin-left:-.03em;font-style:normal;background:none;-webkit-text-fill-color:currentColor;
  animation:e-rise .75s cubic-bezier(.22,.7,.2,1) .12s both}
.e-sub{margin-top:12px;font-style:italic;font-size:clamp(15px,2.2cqw,19px);color:var(--fg2);letter-spacing:.01em}
.e-rule{margin-top:18px;height:3px;background:var(--fg);transform-origin:left;animation:e-draw .8s cubic-bezier(.22,.7,.2,1) both}
.e-rule2{margin-top:2px;height:1px;background:var(--fg);transform-origin:left;
  animation:e-draw .8s cubic-bezier(.22,.7,.2,1) .1s both}
.e-nav{display:flex;justify-content:center;flex-wrap:wrap;gap:28px;padding:12px 0;
  border-bottom:1px solid var(--fg);font-size:12px;font-variant-caps:small-caps;letter-spacing:.1em;color:var(--fg2)}
.e-nav a{padding-bottom:1px}
.e-nav a:hover{color:var(--fg);box-shadow:0 2px 0 var(--sp)}

.e-status{margin-top:24px;text-align:center;font-style:italic;font-size:13.5px;color:var(--fg2)}
.e-status::before{content:"";display:inline-block;width:6px;height:6px;background:var(--sp);
  margin-right:9px;vertical-align:middle;transform:translateY(-1px)}

/* 导语：首字下沉是这份报纸的签名，保留；行宽收窄到 62ch，衬线行距 1.9 */
.e-lede{padding:22px 0 40px;border-bottom:1px solid var(--fg);column-count:2;column-gap:46px;
  font-size:var(--t-lead);line-height:1.9;color:#332e26;max-width:none}
.e-lede::first-letter{float:left;font-size:3.1em;line-height:.86;padding:3px 11px 0 0;font-weight:700;
  color:var(--sp-ink);font-family:var(--fd)}

.e-sec{padding:42px 0;border-bottom:1px solid var(--fg)}
.e-sechead{display:flex;align-items:baseline;gap:14px;margin-bottom:24px}
.e-num{font-family:var(--fd);font-style:italic;font-size:34px;color:var(--sp-ink);font-weight:700;line-height:1}
.e-h2{font-family:var(--fd);font-size:var(--t-h2);font-weight:800;letter-spacing:-.015em;font-style:normal;
  margin-left:-.02em}
.e-hline{flex:1;height:1px;background:var(--fg);transform:translateY(-6px)}

/* 技能：三列数据表（名称 / 刻度 / 数值），刻度用线长表示比例，数值 tabular 右对齐 */
.e-table{width:100%;border-collapse:collapse;font-size:14.5px}
.e-table td{padding:10px 0;border-top:1px solid var(--line);vertical-align:middle}
.e-table tr:first-child td{border-top:none}
.e-tdname{font-weight:600;white-space:nowrap;padding-right:18px!important}
.e-tdbar{width:62%}
.e-bar{display:block;height:2px;background:var(--line)}
.e-bar i{display:block;height:2px;background:var(--sp);transform-origin:left;
  animation:e-draw 1s cubic-bezier(.22,.7,.2,1) both}
.e-tdnum{text-align:right;font-size:12.5px;color:var(--fg2);white-space:nowrap;padding-left:14px!important}

/* 特稿：编号 + 标题 + 摘要，悬停时编号右移、顶线转金 */
.e-feat{display:grid;grid-template-columns:100px 1fr;gap:4px 22px;padding:24px 0;border-top:2px solid var(--fg);
  position:relative}
.e-feat:first-child{border-top:none;padding-top:0}
.e-feat::after{content:"";position:absolute;inset:-2px 0 auto 0;height:2px;background:var(--sp);
  transform:scaleX(0);transform-origin:left;transition:transform .45s cubic-bezier(.22,.7,.2,1)}
.e-feat:hover::after{transform:scaleX(1)}
.e-fnum{font-family:var(--fd);font-style:italic;font-size:60px;line-height:.85;color:var(--sp-ink);font-weight:700;
  transition:transform .32s cubic-bezier(.22,.7,.2,1)}
.e-feat:hover .e-fnum{transform:translateX(3px)}
.e-fhead h3{font-family:var(--fd);font-style:italic;font-size:clamp(20px,3cqw,28px);font-weight:700;
  line-height:1.2;overflow-wrap:anywhere}
.e-fdek{margin-top:8px;color:var(--fg2);font-size:14px;line-height:1.8;max-width:62ch}
.e-topmark{display:inline-block;margin-bottom:6px;padding:1px 7px;font-size:10.5px;letter-spacing:.18em;
  color:var(--sp-ink);border:1px solid currentColor;border-radius:2px}
.e-ppoints{margin-top:10px;list-style:none;display:grid;gap:4px}
.e-ppoints li{position:relative;padding-left:16px;font-size:13px;line-height:1.7;color:#332e26}
.e-ppoints li::before{content:"—";position:absolute;left:0;color:var(--sp-ink)}
.e-fmeta{margin-top:11px;display:flex;flex-wrap:wrap;gap:8px 18px;font-size:var(--t-fine);color:var(--fg2);
  font-variant-caps:small-caps;letter-spacing:.08em;list-style:none;align-items:center}
.e-fmeta a{color:var(--sp-ink);box-shadow:inset 0 -1px 0 var(--sp-ink);padding-bottom:2px}
.e-fmeta a:hover{box-shadow:inset 0 -2px 0 var(--sp)}

/* 经历：双栏分类广告式排版 */
.e-class{display:grid;grid-template-columns:1fr 1fr;gap:0 46px}
.e-citem{padding:16px 0;border-top:1px solid var(--fg)}
.e-cwhen{font-size:var(--t-fine);color:var(--sp-ink);letter-spacing:.04em;font-variant-caps:small-caps}
.e-crole{font-family:var(--fd);font-weight:700;font-size:16.5px;margin-top:5px;line-height:1.3}
.e-corg{font-size:12.5px;color:var(--fg2);margin-top:2px}
.e-cdesc{margin-top:6px;font-size:13.5px;color:var(--fg2);line-height:1.7;max-width:46ch}

/* 联系：去掉装饰引号，只剩一条框线和一个可点的地址 */
.e-letter{margin-top:44px;border:1px solid var(--fg);padding:38px 40px 34px;text-align:center}
.e-lead{color:var(--fg2);font-size:14.5px;max-width:46ch;margin:0 auto;line-height:1.85}
.e-mail{display:inline-block;margin-top:18px;font-family:var(--fd);font-size:19px;
  box-shadow:inset 0 -2px 0 var(--sp);padding-bottom:3px;color:var(--fg)}
.e-mail:hover{box-shadow:inset 0 -4px 0 var(--sp)}
.e-soc{margin-top:24px;display:flex;justify-content:center;gap:20px}
.e-soc a{width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--fg);border-radius:0;color:var(--fg)}
.e-soc a:hover{background:var(--fg);color:var(--bg)}
.e-foot{padding-top:24px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;
  font-size:var(--t-fine);color:var(--fg2);letter-spacing:.04em;font-variant-caps:small-caps}

@keyframes e-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes e-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

@container (max-width:760px){
.e-lede{column-count:1}
.e-feat{grid-template-columns:1fr;gap:2px}
.e-fnum{font-size:38px}
.e-class{grid-template-columns:1fr}
.e-letter{padding:28px 22px}
}
`

export function renderEditorial(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '技能版',
    projects: '特稿',
    experience: '纪事',
    contact: '读者来信',
  }
  const nav = orderSections(sections, ['projects', 'experience', 'skills', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')
  const year = new Date().getFullYear()

  const skills = data.skills
    .map(
      (s, i) =>
        `<tr><td class="e-tdname">${esc(s.name)}</td><td class="e-tdbar"><span class="e-bar"><i style="width:${clampLevel(s.level)}%;animation-delay:${160 + i * 40}ms"></i></span></td><td class="e-tdnum">${clampLevel(s.level)}</td></tr>`
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
    ${p.highlight ? '<span class="e-topmark">头条</span>' : ''}<h3>${esc(p.name)}</h3>
    ${p.description.trim() ? `<p class="e-fdek">${esc(p.description.trim())}</p>` : ''}
    ${p.points && p.points.length > 0 ? `<ul class="e-ppoints">${p.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>` : ''}
    ${meta.length ? `<ul class="e-fmeta">${meta.join('')}</ul>` : ''}
  </div></article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<article class="e-citem"><span class="e-cwhen">${esc(e.period)}</span>
  <h3 class="e-crole">${esc(e.role)}</h3>
  <p class="e-corg">${esc(e.organization)}</p>
  ${e.description.trim() ? `<p class="e-cdesc">${esc(e.description.trim())}</p>` : ''}
  ${e.points && e.points.length > 0 ? `<ul class="e-epoints">${e.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>` : ''}</article>`
    )
    .join('')

  const socials = socialLinks(data, 'e-soc', 'e-soc-a')
  // 章节号按本版的叙事顺序编号（特稿=01、纪事=02、技能版=03），不能沿用 getSections 的索引
  const PAGE_ORDER: SectionDef['id'][] = ['projects', 'experience', 'skills', 'contact']
  const num = (id: SectionDef['id']) => String(PAGE_ORDER.indexOf(id) + 1).padStart(2, '0')

  return `<div class="site-root site-editorial">
  <div class="e-paper">
<div class="e-mast"><span>第 ${year - 2019} 期 · ${year}</span><span>${esc(data.location.trim() || data.name)}</span></div>
    <header class="e-masthead">
      <h1 class="s-name e-title">${esc(data.name)}</h1>
      <p class="e-sub">${esc(data.title)}</p>
    </header>
    <div class="e-rule"></div>
    <div class="e-rule2"></div>
    <nav class="e-nav" aria-label="站点导航">${nav}</nav>
    <main>
      ${data.status.trim() ? `<p class="e-status">${esc(data.status.trim())}</p>` : ''}
      ${data.bio.trim() ? `<p class="e-lede">${esc(data.bio.trim())}</p>` : ''}
      ${sections.some((s) => s.id === 'projects') ? `<section class="e-sec" id="projects"><div class="e-sechead"><span class="e-num">${num('projects')}</span><h2 class="e-h2">项目</h2><span class="e-hline"></span></div><div class="e-features">${projects}</div></section>` : ''}
      ${sections.some((s) => s.id === 'experience') ? `<section class="e-sec" id="experience"><div class="e-sechead"><span class="e-num">${num('experience')}</span><h2 class="e-h2">经历</h2><span class="e-hline"></span></div><div class="e-class">${experience}</div></section>` : ''}
      ${sections.some((s) => s.id === 'skills') ? `<section class="e-sec" id="skills"><div class="e-sechead"><span class="e-num">${num('skills')}</span><h2 class="e-h2">技能</h2><span class="e-hline"></span></div><table class="e-table">${skills}</table></section>` : ''}
      <section class="e-letter" id="contact">
        <h2 class="e-h2" style="font-style:italic">一起聊聊？</h2>
        <p class="e-lead">实习、项目合作，或者只是打个招呼，都写信给我。</p>
        ${data.email.trim() ? `<a class="e-mail" href="mailto:${esc(data.email.trim())}">${esc(data.email.trim())}</a>` : ''}
        ${socials}
      </section>
      <footer class="e-foot"><span>© ${year} ${esc(data.name)}</span><span>由 SiteCraft 个人官网生成器构建</span></footer>
    </main>
  </div>
</div>`
}
