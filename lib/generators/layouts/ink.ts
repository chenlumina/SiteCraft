/**
 * 水墨 Ink —— 「立轴」版式（v2，按国风水墨画的画法重做）。
 *
 * 不是"把网站染成米黄色"，而是照水墨画的几条规矩办事：
 * 1. 墨分五色：焦／浓／重／淡／清五档墨阶，正文用浓，注脚用重，规矩线用清；
 *    纯黑是不存在的，最深处也带一点暖褐。
 * 2. 边角构图：主标题压在左下，右上是一片远山与留白（马远、夏圭的路子），
 *    不再把内容居中摆成海报。
 * 3. 题跋落款：右侧竖排写落款（地名 + 年份），上压一枚引首长印，名字旁是名章。
 * 4. 笔意：章节分隔线收笔渐隐，技能条是飞白干笔（横向断续的墨），不是实心色块。
 * 5. 纸：底色叠了极淡的帘纹与纸斑，近看才看得出，远看仍是一张素纸。
 */
import type { SiteData } from '@/types'
import { esc, monogram } from '../escape'
import { socialLinks } from '../icons'
import { FONT_MONO, FONT_SERIF } from '../theme-consts'
import {
  avatarHTML,
  clampLevel,
  getSections,
  mailBtn,
  projectLinks,
  tagItems,
  skillLevelVisible,
} from './shared'

export const INK_CSS = `
.site-ink{--bg:#f8f4e9;--panel:#fbf8f0;
  /* 墨分五色 */
  --m-jiao:#14120f;--m-nong:#332e24;--m-zhong:#5f5747;--m-dan:#8d8472;--m-qing:#cabfa9;
  --fg:#332e24;--muted:#5f5747;--line:rgba(60,52,38,.16);--track:rgba(60,52,38,.10);
  --fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO};
  background-color:var(--bg);
  /* 宣纸：帘纹（极细竖纹）+ 纸斑（稀疏点） */
  background-image:
    repeating-linear-gradient(92deg,rgba(120,105,80,.045) 0 1px,transparent 1px 5px),
    radial-gradient(rgba(120,105,80,.055) 1px,transparent 1.4px);
  background-size:auto,24px 24px}

.i-layout{display:grid;grid-template-columns:1fr auto}
.i-side{writing-mode:vertical-rl;display:flex;align-items:center;gap:20px;padding:26px 12px;
  border-left:1px solid var(--line);align-self:stretch}
.i-side nav{display:flex;gap:18px}
.i-side nav a{letter-spacing:.46em;font-size:13px;color:var(--m-zhong);transition:color .2s}
.i-side nav a:hover{color:var(--sp)}

/* 名章：方印，微斜，像真盖上去的 */
.i-seal{width:36px;height:36px;border-radius:2px;background:var(--sp);color:var(--on-sp);
  display:grid;place-items:center;font-family:var(--fd);font-weight:700;font-size:17px;
  transform:rotate(-2.5deg);box-shadow:inset 0 0 0 2px rgba(255,255,255,.28),0 2px 10px var(--sp-glow)}

.i-main{min-width:0;position:relative}

/* 页头：左下压标题，右上留远山 */
.i-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:44px;
  align-items:end;min-height:420px;padding:96px clamp(20px,5cqw,72px) 64px;border-bottom:1px solid var(--line)}
/* 远山：真山脊（SVG 折线），不是径向渐变的模糊团。
   三层远近用三条不同 opaciy 的路径叠出来；顶部用 mask 渐隐，像淡墨往上化开。
   不用 <defs>/gradient 是为了避免 id 冲突——首页橱窗会把同一套模板渲染多份。 */
.i-far{position:absolute;left:0;top:0;width:min(72%,780px);height:54%;pointer-events:none;
  -webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 54%,#000 100%);
  mask-image:linear-gradient(180deg,transparent 0%,#000 54%,#000 100%)}
.i-far path{fill:var(--m-nong)}
.i-far .f1{opacity:.07}
.i-far .f2{opacity:.11}
.i-far .f3{opacity:.16}
.i-heroin{position:relative}

/* 起笔：名字左上一点焦墨 */
.i-qibi{position:absolute;left:-2px;top:-26px;width:9px;height:9px;border-radius:50% 50% 50% 12%;
  background:var(--m-jiao);opacity:.85}
.i-name{font-family:var(--fd);font-size:clamp(46px,7.4cqw,76px);font-weight:700;letter-spacing:.05em;
  font-style:normal;line-height:1.1;color:var(--m-jiao)}
.i-role{margin-top:16px;font-style:italic;color:var(--m-zhong);font-size:17px}
.i-bio{margin-top:16px;color:var(--m-zhong);font-size:15px;line-height:2;max-width:52ch}

/* 题跋 + 引首章 */
.i-fig{display:flex;align-items:flex-start;gap:14px;position:relative}
.i-inscribe{writing-mode:vertical-rl;font-family:var(--fd);font-size:12.5px;letter-spacing:.42em;
  color:var(--m-zhong);line-height:2.4;padding-top:4px}
.i-yinshou{width:22px;height:46px;border-radius:1.5px;background:var(--sp);opacity:.92;
  transform:rotate(-1.5deg);flex:none;margin-top:2px}
.i-figbox{position:relative}
.i-face,.i-monogram{width:146px;height:146px;border-radius:2px;object-fit:cover;
  border:1px solid var(--line);box-shadow:0 0 0 6px var(--panel),0 0 0 7px var(--line)}
.i-monogram{display:grid;place-items:center;font-family:var(--fd);font-weight:700;font-size:50px;
  background:linear-gradient(135deg,var(--sp),var(--sp2));color:var(--on-sp)}
.i-vsign{writing-mode:vertical-rl;font-size:12px;letter-spacing:.5em;color:var(--m-zhong);padding-top:4px}

.i-sec{padding:56px clamp(20px,5cqw,72px);border-bottom:1px solid var(--line)}
.i-h2{font-family:var(--fd);font-size:clamp(25px,3.4cqw,33px);font-weight:700;position:relative;
  padding-bottom:18px;margin-bottom:32px;font-style:normal;color:var(--m-jiao)}
/* 收笔：墨线不是均匀的直线，尾巴淡出 */
.i-h2::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:1px;
  background:linear-gradient(90deg,var(--m-nong) 0,rgba(51,46,36,.35) 26%,transparent 68%)}
/* 淡墨只能做规矩线，不能做字：12px + 淡墨 = 3.37:1，读不清。字退回重墨。 */
.i-kick{position:absolute;right:0;bottom:14px;font-family:var(--fd);font-size:12px;letter-spacing:.3em;
  color:var(--m-zhong)}

.i-skills{display:flex;flex-direction:column;gap:15px}
.i-skill{display:grid;grid-template-columns:126px 1fr 44px;gap:16px;align-items:center}
.i-sname{font-family:var(--fd);font-size:15.5px;font-weight:700;color:var(--m-nong)}
.i-bar{height:10px;background:var(--track);border-radius:1px;overflow:hidden}
/* 飞白：干笔横扫，横向有断续的露白 */
.i-brush{display:block;height:100%;background:linear-gradient(90deg,var(--sp),var(--sp2) 74%,var(--sp) 100%);
  -webkit-mask-image:
    linear-gradient(90deg,#000 84%,transparent 99%),
    repeating-linear-gradient(90deg,#000 0 7px,rgba(0,0,0,.32) 7px 10px);
  -webkit-mask-composite:source-in;
  mask-image:
    linear-gradient(90deg,#000 84%,transparent 99%),
    repeating-linear-gradient(90deg,#000 0 7px,rgba(0,0,0,.32) 7px 10px);
  mask-composite:intersect}
.i-spct{font-family:var(--fm);font-size:11.5px;color:var(--m-zhong);text-align:right}

/* 挂轴：项目是一幅幅裱好的小画 */
.i-hangs{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
.i-hang{background:var(--panel);border:1px solid var(--line);border-radius:2px;overflow:hidden;position:relative;
  transition:transform .2s,box-shadow .2s}
.i-hang:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(40,34,24,.10)}
.i-brocade{height:7px;background:linear-gradient(90deg,var(--sp),var(--sp2) 48%,transparent 92%)}
.i-hangin{padding:18px 20px 20px}
.i-hname{font-family:var(--fd);font-size:18px;font-weight:700;overflow-wrap:anywhere;color:var(--m-jiao)}
.i-hdesc{margin-top:8px;color:var(--m-zhong);font-size:13.5px;line-height:1.85}
.i-htags{margin-top:12px;display:flex;flex-wrap:wrap;gap:7px;list-style:none}
.i-htag{border:1px solid var(--line);color:var(--m-zhong);border-radius:2px;padding:2px 9px;
  font-family:var(--fd);font-size:11.5px}
.i-hlinks{margin-top:12px;display:flex;gap:16px;font-size:13px}
.i-hlinks a{color:var(--sp-ink);box-shadow:inset 0 -1px 0 var(--line);padding-bottom:2px}
.i-hlinks a:hover{box-shadow:inset 0 -1px 0 var(--sp)}

/* 经历：一条淡墨的"卷"线，节点是墨点 */
.i-scroll{position:relative;padding-left:26px;max-width:760px}
.i-scroll::before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:1px;
  background:linear-gradient(180deg,var(--m-dan),rgba(141,132,114,.12) 82%,transparent)}
.i-era{position:relative;padding-bottom:28px}
.i-era:last-child{padding-bottom:0}
.i-era::before{content:"";position:absolute;left:-25px;top:9px;width:8px;height:8px;
  border-radius:50% 50% 50% 8%;background:var(--m-nong)}
.i-ewhen{font-family:var(--fd);font-size:12.5px;color:var(--m-zhong);letter-spacing:.06em}
.i-erole{font-family:var(--fd);font-size:18px;font-weight:700;margin-top:4px;color:var(--m-jiao)}
.i-eorg{font-size:13px;color:var(--m-zhong);margin-top:2px}
.i-edesc{margin-top:8px;font-size:13.5px;color:var(--m-zhong);line-height:1.9;max-width:56ch}

/* 落款处：一张信笺 */
.i-letter{background:var(--panel);border:1px solid var(--line);border-radius:2px;padding:46px 34px;
  text-align:center;position:relative;margin:0 clamp(20px,5cqw,72px)}
.i-letter::after{content:"";position:absolute;right:22px;top:20px;width:26px;height:26px;background:var(--sp);
  border-radius:1.5px;opacity:.9;transform:rotate(-3deg);box-shadow:inset 0 0 0 2px rgba(255,255,255,.3)}
.i-lead{color:var(--m-zhong);font-size:14.5px;max-width:46ch;margin:0 auto;line-height:1.9}
.i-mail{display:inline-block;margin-top:20px;font-family:var(--fd);font-size:19px;color:var(--m-jiao);
  box-shadow:inset 0 -2px 0 var(--sp);padding-bottom:3px}
.i-soc{margin-top:24px;display:flex;justify-content:center;gap:12px}
.i-soc a{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--line);
  border-radius:2px;color:var(--m-zhong);background:var(--panel)}
.i-soc a:hover{color:var(--sp);border-color:var(--sp)}
.i-foot{padding:22px clamp(20px,5cqw,72px);display:flex;justify-content:space-between;gap:12px;
  flex-wrap:wrap;font-size:11.5px;color:var(--m-zhong);letter-spacing:.04em}

@keyframes i-spread{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
/* 入场：只做一次，落在名字上 */
.i-name{animation:sf-land .8s cubic-bezier(.3,1.15,.64,1) .05s both}

@container (max-width:880px){
.i-side{display:none}
.i-hero{grid-template-columns:1fr;gap:26px;min-height:0;padding-top:64px;align-items:start}
.i-fig{order:-1;align-items:flex-start}
.i-inscribe{display:none}
.i-hangs{grid-template-columns:1fr}
.i-skill{grid-template-columns:96px 1fr 40px;gap:10px}
.i-far{width:100%;height:40%;opacity:.75}
}
`

export function renderInk(data: SiteData): string {
  const sections = getSections(data)
  const NAV: Record<string, string> = {
    skills: '墨色',
    projects: '挂轴',
    experience: '行迹',
    contact: '书信',
  }
  const nav = sections.map((s) => `<a href="#${s.id}">${NAV[s.id]}</a>`).join('')
  const year = new Date().getFullYear()
  // 落款：地名 + 干支年（竖排题跋用，属装饰性落款，不参与阅读顺序）
  const gz = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][(year - 4) % 10]
  const place = data.location.trim().replace(/[·・]/g, ' ').trim()

  const skills = data.skills
    .map((s) =>
      skillLevelVisible(data)
        ? `<div class="i-skill"><span class="i-sname">${esc(s.name)}</span>
  <span class="i-bar"><span class="i-brush" style="width:${clampLevel(s.level)}%"></span></span>
  <span class="i-spct">${clampLevel(s.level)}</span></div>`
        : `<div class="i-skill"><span class="i-sname">${esc(s.name)}</span></div>`
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

  return `<div class="site-root site-ink">
  <div class="i-layout">
    <main class="i-main">
      <section class="i-hero">
        <svg class="i-far" viewBox="0 0 1200 320" preserveAspectRatio="none" aria-hidden="true">
          <path class="f1" d="M0,320 L0,196 C74,178 128,138 206,146 C284,154 322,196 386,200 C456,204 502,158 574,150 C646,142 692,182 762,188 C832,194 884,160 954,166 C1024,172 1082,196 1200,186 L1200,320 Z"/>
          <path class="f2" d="M0,320 L0,246 C88,232 148,206 228,210 C308,214 352,250 432,252 C522,254 562,220 642,216 C722,212 774,244 864,246 C954,248 1012,222 1082,226 C1142,229 1172,244 1200,240 L1200,320 Z"/>
          <path class="f3" d="M0,320 L0,286 C96,276 160,258 244,262 C328,266 372,290 452,292 C542,294 586,270 666,268 C746,266 796,288 886,290 C976,292 1032,276 1102,278 C1158,280 1184,288 1200,286 L1200,320 Z"/>
        </svg>
        <div class="i-heroin">
          <span class="i-qibi" aria-hidden="true"></span>
          <h1 class="s-name i-name">${esc(data.name)}</h1>
          <p class="i-role">${esc(data.title)}</p>
          ${data.bio.trim() ? `<p class="i-bio">${esc(data.bio.trim())}</p>` : ''}
        </div>
        <div class="i-fig">
          <span class="i-yinshou" aria-hidden="true"></span>
          <div class="i-figbox">${avatarHTML(data, 'i-face', 'i-monogram')}</div>
          <p class="i-inscribe" aria-hidden="true">${esc(place || '此地')} ${gz}辰</p>
          <p class="i-vsign">${esc(data.name)} 印</p>
        </div>
      </section>
      ${sections.some((s) => s.id === 'skills') ? `<section class="i-sec" id="skills"><h2 class="i-h2">技<span class="i-kick">墨色深浅</span></h2><div class="i-skills">${skills}</div></section>` : ''}
      ${sections.some((s) => s.id === 'projects') ? `<section class="i-sec" id="projects"><h2 class="i-h2">作<span class="i-kick">挂轴</span></h2><div class="i-hangs">${projects}</div></section>` : ''}
      ${sections.some((s) => s.id === 'experience') ? `<section class="i-sec" id="experience"><h2 class="i-h2">历<span class="i-kick">行迹</span></h2><div class="i-scroll">${experience}</div></section>` : ''}
      <section class="i-sec" id="contact" style="border-bottom:none;padding-bottom:64px">
        <div class="i-letter">
          <h2 class="i-h2" style="margin-bottom:12px;padding-bottom:0">一起聊聊？</h2>
          <p class="i-lead">实习、项目合作，或者只是打个招呼，都写信给我。</p>
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
