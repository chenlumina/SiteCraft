/**
 * 创意 Creative —— 「贴纸板」版式：
 * 撞色圆环技能贴纸（conic-gradient 环形进度）、拍立得项目卡、左右交错便签经历。
 * 特点：无进度条、无规则卡片流，一切像手工贴上去的。
 */
import type { SiteData } from '@/types'
import { esc } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SANS } from '../theme-consts'
import {
  avatarHTML,
  chipsHTML,
  clampLevel,
  getSections,
  mailBtn,
  projectLinks,
  tagItems,
  orderSections,
} from './shared'

export const CREATIVE_CSS = `
.c-hl{display:inline-block;margin-right:8px;padding:1px 5px;font-size:10.5px;letter-spacing:.12em;
  color:var(--sp-ink);border:1px solid currentColor;border-radius:2px;vertical-align:2px;}
.site-creative{--bg:#fff8f0;--fg:#292524;--muted:#78716c;--line:#292524;--panel:#ffffff;--shadow:rgba(41,37,36,.16);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO}}
.c-nav{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:18px 20px;border-bottom:3px solid var(--fg)}
.c-nav a{border:2px solid var(--fg);background:#fff;padding:7px 16px;border-radius:999px;font-weight:800;font-size:13px;box-shadow:3px 3px 0 var(--fg);transition:transform .15s,box-shadow .15s}
.c-nav a:hover{transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--fg)}
.c-hero{position:relative;text-align:center;padding:76px 24px 60px;border-bottom:3px solid var(--fg);background-image:radial-gradient(rgba(41,37,36,.08) 1.5px,transparent 1.5px);background-size:22px 22px;overflow:hidden}
/* 主视觉锚点：马克笔手绘圈注。路径是手画的、故意不闭合，
   描边用 dashoffset 从"笔尖落下"画出来；reduced-motion 下直接是画好的圈 */
.c-namewrap{position:relative;display:inline-block;padding:6px 18px}
.c-circle{position:absolute;inset:-6% -4%;width:108%;height:112%;overflow:visible;pointer-events:none}
.c-circle path{fill:none;stroke:var(--sp);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;
  stroke-dasharray:920;stroke-dashoffset:0;animation:c-draw .85s .25s cubic-bezier(.4,.1,.3,1) both}
@keyframes c-draw{from{stroke-dashoffset:920}to{stroke-dashoffset:0}}
.c-hero::before{content:'';position:absolute;right:-70px;top:-70px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,var(--sp-soft),transparent 70%);pointer-events:none}
.c-status{display:inline-block;transform:rotate(-2deg);border:2px solid var(--fg);background:var(--sp);color:var(--on-sp);font-weight:800;padding:8px 18px;border-radius:12px;box-shadow:4px 4px 0 var(--fg);font-size:14px}
.c-name{margin-top:26px;font-size:clamp(46px,8cqw,78px);font-weight:900;letter-spacing:-.02em;transform:rotate(-1.5deg);background:linear-gradient(100deg,var(--sp),var(--sp2));-webkit-background-clip:text;background-clip:text;color:transparent;font-style:normal}
.c-role{display:inline-block;margin-top:16px;border:2px solid var(--fg);background:#fff;padding:7px 18px;border-radius:999px;font-weight:700;transform:rotate(1deg);box-shadow:3px 3px 0 var(--sp-soft);font-size:15px}
.c-face,.c-monogram{width:150px;height:150px;margin:36px auto 0;border-radius:42% 58% 55% 45%/52% 44% 56% 48%;border:3px solid var(--fg);box-shadow:8px 8px 0 var(--sp-soft);object-fit:cover;transform:rotate(2deg)}
.c-monogram{display:grid;place-items:center;font-weight:900;font-size:52px;background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp)}
.c-chips{margin-top:24px;display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.c-chip{display:inline-flex;align-items:center;gap:7px;border:2px solid var(--fg);background:#fff;padding:6px 14px;border-radius:999px;font-weight:700;font-size:13px;box-shadow:3px 3px 0 var(--shadow)}
.c-chip svg{width:14px;height:14px}
.c-wrap{max-width:1000px;margin:0 auto;padding:0 24px}
.c-h2{display:inline-block;margin:60px 0 26px;font-size:clamp(28px,4cqw,38px);font-weight:900;transform:rotate(-1deg);position:relative;isolation:isolate;font-style:normal}
.c-h2::after{content:'';position:absolute;left:-6px;right:-6px;bottom:4px;height:14px;background:var(--sp-soft);border-radius:99px;z-index:-1;transform:rotate(-.6deg)}
.c-rings{display:flex;flex-wrap:wrap;gap:28px;justify-content:center}
.c-ring{width:126px;text-align:center;transform:rotate(-2deg)}
.c-ring:nth-child(even){transform:rotate(2deg)}
.c-disc{width:92px;height:92px;margin:0 auto;border-radius:50%;background:conic-gradient(var(--sp) calc(var(--p)*1%),#f5e9dc 0);border:2.5px solid var(--fg);box-shadow:4px 4px 0 var(--shadow);display:grid;place-items:center}
.c-disc i{width:62px;height:62px;border-radius:50%;background:#fff;border:2.5px solid var(--fg);display:grid;place-items:center;font-style:normal;font-weight:800;font-size:14.5px}
.c-ring b{display:block;margin-top:12px;font-size:14px;font-weight:800}
.c-polos{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px}
.c-polo{background:#fff;border:2.5px solid var(--fg);border-radius:14px;padding:16px;box-shadow:6px 6px 0 var(--shadow);transform:rotate(-1deg);transition:transform .2s,box-shadow .2s}
.c-polo:nth-child(even){transform:rotate(1.2deg)}
.c-polo:hover{transform:translate(-3px,-3px) rotate(0deg);box-shadow:9px 9px 0 var(--sp)}
.c-polo-head{height:12px;border-radius:8px;background:linear-gradient(90deg,var(--sp),var(--sp2));border:2px solid var(--fg);margin-bottom:14px}
.c-pname{font-weight:900;font-size:19px;overflow-wrap:anywhere}
.c-pdesc{color:var(--muted);font-size:14px;margin-top:7px;line-height:1.75}
.c-ptags{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.c-ptag{border:2px solid var(--fg);border-radius:999px;padding:3px 12px;font-size:12px;font-weight:700;background:#fff}
.c-plinks{margin-top:12px;display:flex;gap:16px;font-weight:800;font-size:13.5px}
.c-plinks a{color:var(--sp)}
.c-plinks a:hover{text-decoration:underline}
.c-notes{display:flex;flex-direction:column;gap:20px;margin-top:8px;max-width:560px}
.c-note{position:relative;background:#fff;border:2.5px solid var(--fg);border-radius:16px;padding:18px 20px;box-shadow:5px 5px 0 var(--shadow);transform:rotate(-1deg)}
.c-note:nth-child(even){margin-left:auto;transform:rotate(1deg)}
.c-note::before{content:'';position:absolute;top:-12px;left:38px;width:76px;height:24px;background:rgba(255,252,240,.7);border:1px solid rgba(41,37,36,.15);transform:rotate(-3deg)}
.c-nwhen{display:inline-block;background:var(--sp-soft);border:2px solid var(--fg);border-radius:999px;padding:3px 13px;font-size:12.5px;font-weight:800}
.c-nrole{margin-top:9px;font-weight:900;font-size:17px}
.c-norg{color:var(--muted);font-size:13px;margin-top:2px}
.c-ndesc{margin-top:8px;font-size:14px;color:var(--muted);line-height:1.75}
.c-big{margin-top:64px;background:var(--fg);color:#fff8f0;border-radius:24px;padding:52px 32px;text-align:center;box-shadow:8px 8px 0 var(--sp)}
.c-big .c-h2{margin:0 0 10px;color:#fff8f0}
.c-big .c-h2::after{background:rgba(255,255,255,.16)}
.c-blead{color:#d6d3d1;max-width:46ch;margin:0 auto}
.c-bmail{display:inline-flex;align-items:center;gap:9px;margin-top:22px;background:var(--sp);color:var(--on-sp);border:2px solid #fff8f0;font-weight:800;padding:13px 28px;border-radius:999px;font-size:15px}
.c-bmail svg{width:16px;height:16px}
.c-soc{margin-top:24px;display:flex;justify-content:center;gap:12px}
.c-soc a{width:42px;height:42px;display:grid;place-items:center;border:2px solid #fff8f0;border-radius:12px;color:#fff8f0;background:rgba(255,255,255,.08)}
.c-foot{padding:24px;text-align:center;font-family:var(--fm);font-size:12px;color:var(--muted)}
@container (max-width:760px){
.c-polos{grid-template-columns:1fr}
.c-note{max-width:none}
}
/* 入场：只做一次，落在名字上 */
.c-name{animation:sf-land .7s cubic-bezier(.34,1.3,.64,1) .05s both}
`

export function renderCreative(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '贴纸',
    projects: '拍立得',
    experience: '便签',
    contact: '来信',
  }
  const nav = orderSections(sections, ['projects', 'skills', 'experience', 'contact'])
    .map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`)
    .join('')

  const skills = data.skills
    .map(
      (s) =>
        `<div class="c-ring"><span class="c-disc" style="--p:${clampLevel(s.level)}"><i>${clampLevel(s.level)}</i></span><b>${esc(s.name)}</b></div>`
    )
    .join('')

  const projects = data.projects
    .map((p) => {
      const links = projectLinks(p.link, p.repo)
      return `<article class="c-polo"><div class="c-polo-head"></div>
  ${p.highlight ? `<span class="c-hl">精选</span>` : ''}<h3 class="c-pname">${esc(p.name)}</h3>
  ${p.description.trim() ? `<p class="c-pdesc">${esc(p.description.trim())}</p>` : ''}
  ${p.tags.some((t) => t.trim()) ? `<ul class="c-ptags">${tagItems(p.tags, 'c-ptag')}</ul>` : ''}
  ${links ? `<div class="c-plinks">${links}</div>` : ''}</article>`
    })
    .join('')

  const experience = data.experience
    .map(
      (e) => `<article class="c-note"><span class="c-nwhen">${esc(e.period)}</span>
  <h3 class="c-nrole">${esc(e.role)}</h3>
  <p class="c-norg">${esc(e.organization)}</p>
  ${e.description.trim() ? `<p class="c-ndesc">${esc(e.description.trim())}</p>` : ''}</article>`
    )
    .join('')

  const socials = socialLinks(data, 'c-soc', 'c-soc-a')
  const year = new Date().getFullYear()

  return `<div class="site-root site-creative">
  <nav class="c-nav" aria-label="站点导航">${nav}</nav>
  <main>
    <section class="c-hero">
      ${data.status.trim() ? `<p class="c-status">${esc(data.status.trim())}</p>` : ''}
      <div class="c-namewrap">
        <h1 class="s-name c-name">${esc(data.name)}</h1>
        <svg class="c-circle" viewBox="0 0 320 150" preserveAspectRatio="none" aria-hidden="true">
          <path d="M26,78 C22,34 118,10 205,14 C284,18 312,56 298,88 C284,120 158,138 88,128 C40,121 8,108 26,78 C34,64 58,54 88,48"/>
        </svg>
      </div>
      <p class="c-role">${esc(data.title)}</p>
      ${avatarHTML(data, 'c-face', 'c-monogram')}
      <div class="c-chips">${chipsHTML(data, 'c-chip')}</div>
    </section>
    <div class="c-wrap">
      ${sections.some((s) => s.id === 'projects') ? `<section id="projects"><h2 class="c-h2">作品拍立得</h2><div class="c-polos">${projects}</div></section>` : ''}
      ${sections.some((s) => s.id === 'skills') ? `<section id="skills"><h2 class="c-h2">技能贴纸</h2><div class="c-rings">${skills}</div></section>` : ''}
      ${sections.some((s) => s.id === 'experience') ? `<section id="experience"><h2 class="c-h2">足迹便签</h2><div class="c-notes">${experience}</div></section>` : ''}
      <section class="c-big" id="contact">
        <h2 class="c-h2">一起聊聊？</h2>
        <p class="c-blead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
        ${mailBtn(data, '发邮件给我', 'c-bmail')}
        ${socials}
      </section>
    </div>
  </main>
  <footer class="c-foot">© ${year} ${esc(data.name)} · 由 SiteCraft 个人官网生成器构建</footer>
</div>`
}
