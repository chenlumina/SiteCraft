/**
 * 站点样式单一来源：结构基样式 + 十二套模板差异样式 + 主题变量拼装。
 * 模板专属 CSS 只覆盖视觉变量与差异规则，避免十二份重复的结构代码。
 * 注意两条陷阱规则（见行内注释）：:where(a) 与 @container。
 */
import type { SiteData, TemplateName } from '@/types'
import { isValidHexColor } from '@/lib/utils'
import { getTemplate } from '@/lib/templates'
import { themeVars } from './color'

const FONT_SANS = `'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif`
const FONT_MONO = `'Cascadia Code',Consolas,ui-monospace,Menlo,monospace`
const FONT_SERIF = `Georgia,'Times New Roman','Songti SC','SimSun',serif`

// 与 public/images/avatar-default.svg 保持一致；内联保证导出单文件在 file:// 下也能显示头像
const DEFAULT_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e2640"/><stop offset="100%" stop-color="#0b0f1e"/></linearGradient><linearGradient id="fig" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c6cff"/><stop offset="60%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><rect width="240" height="240" fill="url(#bg)"/><circle cx="196" cy="44" r="30" fill="#22d3ee" opacity="0.14"/><circle cx="36" cy="204" r="42" fill="#7c6cff" opacity="0.16"/><path d="M0 176 L240 120 L240 240 L0 240 Z" fill="#151b31"/><circle cx="120" cy="92" r="38" fill="url(#fig)"/><path d="M52 208c6-40 34-62 68-62s62 22 68 62" fill="url(#fig)" opacity="0.9"/><path d="M96 92l-10 10 10 10M144 92l10 10-10 10" stroke="#0b0f1e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/></svg>`

export const DEFAULT_AVATAR_PATH = '/images/avatar-default.svg'
export const DEFAULT_AVATAR_DATA_URI = `data:image/svg+xml,${encodeURIComponent(DEFAULT_AVATAR_SVG)}`

/**
 * 十二套模板共享的结构基样式：reset、布局骨架、技能条/项目卡/时间线/联系区。
 */
const BASE_CSS = `
.site-root{container-type:inline-size;min-height:100%;background:var(--bg);color:var(--fg);font-family:var(--fb);line-height:1.65;font-size:16px;-webkit-font-smoothing:antialiased}
.site-root *,.site-root *::before,.site-root *::after{box-sizing:border-box;margin:0;padding:0}
.site-root img{display:block;max-width:100%}
/* :where() 把这条重置的特异性降为 (0,1,0)，否则 .site-root a (0,1,1) 会压过
   .s-btn-primary (0,1,0) 的 color，导致深色按钮继承深色文字而「隐形」 */
.site-root :where(a){color:inherit;text-decoration:none}
.site-root ul,.site-root ol{list-style:none}
.site-root ::selection{background:var(--sp);color:var(--on-sp)}
.site-root ::-webkit-scrollbar{width:10px;height:10px}
.site-root ::-webkit-scrollbar-track{background:var(--bg)}
.site-root ::-webkit-scrollbar-thumb{background:var(--line);border-radius:99px;border:2px solid var(--bg)}
.site-root ::-webkit-scrollbar-thumb:hover{background:var(--sp)}
.wrap{width:min(1060px,100% - 48px);margin-inline:auto}
.s-nav{position:sticky;top:0;z-index:50;background:var(--nav-bg);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.s-nav-in{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:14px}
.s-brand{display:inline-flex;align-items:center;gap:10px;font-weight:700;font-size:15px}
.s-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:var(--sp);color:var(--on-sp);font-size:15px;font-weight:800;flex:none}
.s-links{display:flex;align-items:center;gap:22px;font-size:14px}
.s-links a{color:var(--muted);transition:color .2s}
.s-links a:hover{color:var(--sp)}
.s-hero{padding:88px 0 72px;position:relative;overflow:hidden}
.s-hero-in{display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center;position:relative}
.s-status{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);border:1px solid var(--line);padding:6px 14px;border-radius:999px;margin-bottom:22px;background:var(--panel)}
.s-dot{width:8px;height:8px;border-radius:50%;background:#34d399;flex:none;animation:sp-pulse 2.4s infinite}
@keyframes sp-pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.45)}70%{box-shadow:0 0 0 9px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
.s-name{font-family:var(--fd);font-size:clamp(40px,6cqw,64px);line-height:1.1;font-weight:800;letter-spacing:-.02em;overflow-wrap:anywhere}
.s-title{margin-top:12px;font-size:clamp(17px,2.2cqw,21px);color:var(--sp);font-weight:600}
.s-bio{margin-top:18px;max-width:56ch;color:var(--muted);font-size:15.5px}
.s-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.s-chip{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:6px 13px;background:var(--panel)}
.s-chip svg{width:14px;height:14px;flex:none}
.s-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.s-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:var(--btn-r);font-size:14.5px;font-weight:600;border:1.5px solid transparent;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,color .18s;cursor:pointer}
.s-btn svg{width:16px;height:16px;flex:none}
.s-btn-primary{background:var(--sp);color:var(--on-sp)}
.s-btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 26px var(--sp-glow)}
.s-btn-ghost{border-color:var(--line);color:var(--fg);background:var(--panel)}
.s-btn-ghost:hover{border-color:var(--sp);color:var(--sp)}
.s-btn-lg{padding:14px 30px;font-size:16px}
.s-socials{display:flex;gap:10px;margin-top:26px}
.s-social{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;border:1px solid var(--line);color:var(--muted);background:var(--panel);transition:color .2s,border-color .2s,transform .2s}
.s-social:hover{color:var(--sp);border-color:var(--sp);transform:translateY(-2px)}
.s-social svg{width:17px;height:17px}
.s-hero-avatar{position:relative;width:220px;height:220px;flex:none}
.s-avatar-img{width:100%;height:100%;object-fit:cover;border-radius:var(--avatar-r);border:3px solid var(--line);background:var(--panel)}
.s-monogram{width:100%;height:100%;display:grid;place-items:center;font-family:var(--fd);font-size:76px;font-weight:800;color:var(--on-sp);background:linear-gradient(135deg,var(--sp),var(--sp2));border-radius:var(--avatar-r)}
.s-section{padding:64px 0;border-top:1px solid var(--line)}
.s-kicker{font-family:var(--fm);font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--sp);margin-bottom:10px}
.s-h2{font-family:var(--fd);font-size:clamp(26px,3.6cqw,36px);font-weight:800;letter-spacing:-.01em;margin-bottom:34px}
.skill-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px 40px}
.skill-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;gap:10px}
.skill-name{font-weight:600;font-size:15px}
.skill-pct{font-family:var(--fm);font-size:12.5px;color:var(--muted)}
.skill-track{height:6px;border-radius:99px;background:var(--track);overflow:hidden}
.skill-fill{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--sp),var(--sp2))}
.skill-dots{display:none}
.project-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.project{background:var(--panel);border:1px solid var(--line);border-radius:var(--card-r);padding:26px;display:flex;flex-direction:column;gap:12px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.project:hover{transform:translateY(-4px);border-color:var(--sp);box-shadow:0 16px 36px var(--shadow)}
.project-head{display:flex;justify-content:space-between;align-items:center}
.project-index{font-family:var(--fm);font-size:13px;color:var(--sp);font-weight:700}
.project-badge{font-size:11.5px;font-weight:700;color:var(--on-sp);background:var(--sp);padding:3px 10px;border-radius:999px}
.project-name{font-family:var(--fd);font-size:19px;font-weight:700;overflow-wrap:anywhere}
.project-desc{font-size:14px;color:var(--muted);flex:1}
.project-tags{display:flex;flex-wrap:wrap;gap:7px}
.project-tags li{font-family:var(--fm);font-size:11.5px;color:var(--sp);background:var(--sp-soft);padding:4px 10px;border-radius:6px}
.project-links{display:flex;gap:16px;font-size:13.5px;font-weight:600}
.project-links a{display:inline-flex;align-items:center;gap:5px;color:var(--sp)}
.project-links a:hover{text-decoration:underline}
.project-links svg{width:14px;height:14px}
.exp-list{display:flex;flex-direction:column}
.exp{display:grid;grid-template-columns:170px 1fr;gap:24px;padding:24px 0;border-bottom:1px solid var(--line)}
.exp:last-child{border-bottom:none}
.exp-period{font-family:var(--fm);font-size:13px;color:var(--sp);padding-top:3px}
.exp-role{font-size:17px;font-weight:700;font-family:var(--fd)}
.exp-org{font-size:14px;color:var(--muted);margin-top:2px}
.exp-desc{font-size:14px;color:var(--muted);margin-top:10px;max-width:64ch}
.s-contact{text-align:center}
.contact-lead{color:var(--muted);max-width:52ch;margin:0 auto 28px;font-size:15px}
.s-contact .s-socials{justify-content:center;margin-top:30px}
.s-footer{border-top:1px solid var(--line);padding:26px 0;font-size:13px;color:var(--muted)}
.s-footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
/* 容器查询：按站点根容器自身宽度切换移动版式（预览容器≠视口，媒体查询会误判） */
@container (max-width: 760px){
.s-hero{padding:56px 0 48px}
.s-hero-in{grid-template-columns:1fr;gap:32px}
.s-hero-avatar{width:150px;height:150px;order:-1}
.s-monogram{font-size:52px}
.skill-grid{grid-template-columns:1fr}
.project-grid{grid-template-columns:1fr}
.exp{grid-template-columns:1fr;gap:6px}
.s-links{gap:14px;font-size:13px}
.s-links a:not(.s-cta-link){display:none}
.s-section{padding:48px 0}
}
`

/* 极简：编辑感衬线标题 + 大留白 + 列表式项目（无卡片边框），内容即主角 */
const MINIMAL_CSS = `
.site-minimal{--bg:#fafaf9;--fg:#1c1917;--muted:#78716c;--line:#e7e5e4;--panel:#ffffff;--track:#e7e5e4;--nav-bg:rgba(250,250,249,.86);--shadow:rgba(28,25,23,.08);--fd:${FONT_SERIF};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:4px;--card-r:6px;--avatar-r:50%}
.site-minimal .s-mark{border-radius:50%;background:var(--fg);color:var(--bg)}
.site-minimal .s-hero{padding:96px 0 84px}
.site-minimal .s-name{font-weight:700}
.site-minimal .s-title{color:var(--muted);font-family:var(--fd);font-style:italic;font-weight:400}
.site-minimal .s-avatar-img{border:1px solid var(--line);padding:6px;background:#fff}
.site-minimal .skill-track{height:3px;border-radius:0}
.site-minimal .skill-fill{border-radius:0;background:var(--sp)}
.site-minimal .project-grid{grid-template-columns:1fr;gap:0}
.site-minimal .project{background:transparent;border:none;border-top:1px solid var(--line);border-radius:0;padding:28px 0}
.site-minimal .project:last-child{border-bottom:1px solid var(--line)}
.site-minimal .project:hover{transform:none;box-shadow:none;border-color:var(--fg)}
.site-minimal .project-name{font-size:22px}
.site-minimal .project-index{font-size:15px;color:var(--muted)}
.site-minimal .project-badge{background:transparent;color:var(--sp);border:1px solid var(--sp)}
.site-minimal .project-tags li{background:transparent;border:1px solid var(--line);color:var(--muted);border-radius:999px}
.site-minimal .s-btn-primary:hover{box-shadow:0 10px 24px rgba(28,25,23,.18)}
.site-minimal .s-contact .s-h2{font-size:clamp(30px,5cqw,46px)}
.site-minimal .s-footer{font-family:var(--fm)}
`

/* 极客：深色终端风 —— 网格背景、等宽字体、霓虹光晕、分段式技能能量条、时间线节点 */
const TECH_CSS = `
.site-tech{--bg:#0b1220;--fg:#e2e8f0;--muted:#8b9bb4;--line:#1e2a44;--panel:#101a2e;--track:#16213a;--nav-bg:rgba(11,18,32,.84);--shadow:rgba(0,0,0,.45);--fd:${FONT_MONO};--fb:${FONT_MONO};--fm:${FONT_MONO};--btn-r:8px;--card-r:12px;--avatar-r:16px;background-image:linear-gradient(rgba(148,163,184,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.05) 1px,transparent 1px);background-size:36px 36px}
.site-tech .s-hero::before{content:'';position:absolute;inset:-40% -20% auto;height:560px;background:radial-gradient(620px 320px at 72% 18%,var(--sp-soft),transparent 70%);pointer-events:none}
.site-tech .s-name{background:linear-gradient(92deg,var(--fg) 18%,var(--sp) 62%,var(--sp2));-webkit-background-clip:text;background-clip:text;color:transparent}
.site-tech .s-title::before{content:'// ';color:var(--muted)}
.site-tech .s-mark{background:transparent;border:1.5px solid var(--sp);color:var(--sp);box-shadow:0 0 18px var(--sp-soft)}
.site-tech .s-btn-primary{box-shadow:0 0 24px var(--sp-soft)}
.site-tech .skill-track{height:10px;border-radius:3px;border:1px solid var(--line)}
.site-tech .skill-fill{border-radius:2px;background:repeating-linear-gradient(90deg,var(--sp) 0 8px,transparent 8px 12px);box-shadow:0 0 12px var(--sp-soft)}
.site-tech .project{position:relative;overflow:hidden}
.site-tech .project::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--sp),var(--sp2));opacity:.75}
.site-tech .project:hover{box-shadow:0 0 0 1px var(--sp),0 18px 44px rgba(0,0,0,.5)}
.site-tech .project-index::before{content:'> '}
.site-tech .exp-list{gap:6px;margin-left:6px}
.site-tech .exp{border-bottom:none;border-left:2px solid var(--line);padding-left:26px;position:relative}
.site-tech .exp::before{content:'';position:absolute;left:-6px;top:30px;width:10px;height:10px;border-radius:50%;background:var(--sp);box-shadow:0 0 12px var(--sp-glow)}
.site-tech .s-contact .wrap{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:56px 32px}
.site-tech .s-contact{border-top:none;padding-bottom:72px}
.site-tech .s-footer{font-size:12.5px}
`

/* 创意：奶油底 + 硬阴影贴纸 + 不规则头像 blob + 技能圆点（隐藏进度条改用 5 格圆点） */
const CREATIVE_CSS = `
.site-creative{--bg:#fff8f0;--fg:#292524;--muted:#78716c;--line:#292524;--panel:#ffffff;--track:#f5e9dc;--nav-bg:rgba(255,248,240,.9);--shadow:rgba(41,37,36,.16);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:999px;--card-r:18px;--avatar-r:58% 42% 55% 45% / 48% 55% 45% 52%}
.site-creative .s-nav{border-bottom:2px solid var(--fg)}
.site-creative .s-mark{border-radius:12px;transform:rotate(-6deg);border:2px solid var(--fg);box-shadow:3px 3px 0 var(--fg)}
.site-creative .s-hero{background-image:radial-gradient(rgba(41,37,36,.08) 1.5px,transparent 1.5px);background-size:22px 22px}
.site-creative .s-hero::before{content:'';position:absolute;right:-90px;top:-90px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,var(--sp-soft),transparent 70%);pointer-events:none}
.site-creative .s-name{font-weight:900;letter-spacing:-.03em;background:linear-gradient(100deg,var(--sp),var(--sp2));-webkit-background-clip:text;background-clip:text;color:transparent}
.site-creative .s-status{border:2px solid var(--fg);background:#fff;box-shadow:3px 3px 0 var(--fg);font-weight:700;color:var(--fg);transform:rotate(-1.5deg)}
.site-creative .s-avatar-img{border:3px solid var(--fg);box-shadow:8px 8px 0 var(--sp-soft)}
.site-creative .s-monogram{border:3px solid var(--fg)}
.site-creative .s-btn{border:2px solid var(--fg);font-weight:800}
.site-creative .s-btn-primary{box-shadow:4px 4px 0 var(--fg)}
.site-creative .s-btn-primary:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--fg)}
.site-creative .s-btn-ghost{box-shadow:4px 4px 0 var(--fg);background:#fff}
.site-creative .s-btn-ghost:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--fg);color:var(--fg)}
.site-creative .s-social{border:2px solid var(--fg);border-radius:12px;background:#fff;color:var(--fg);box-shadow:3px 3px 0 var(--shadow)}
.site-creative .s-h2{position:relative;display:inline-block;isolation:isolate}
.site-creative .s-h2::after{content:'';position:absolute;left:-4px;right:-4px;bottom:2px;height:12px;background:var(--sp-soft);border-radius:99px;z-index:-1}
.site-creative .skill{background:#fff;border:2px solid var(--fg);border-radius:14px;padding:14px 16px;box-shadow:4px 4px 0 var(--shadow)}
.site-creative .skill-grid{gap:16px}
.site-creative .skill-track,.site-creative .skill-pct{display:none}
.site-creative .skill-dots{display:inline-flex;gap:5px}
.site-creative .skill-dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--fg);background:#fff}
.site-creative .skill-dot.on{background:var(--sp)}
.site-creative .project{border:2px solid var(--fg);box-shadow:6px 6px 0 var(--shadow)}
.site-creative .project:nth-child(even){transform:rotate(.5deg)}
.site-creative .project:hover{transform:translate(-3px,-3px) rotate(0deg);box-shadow:9px 9px 0 var(--sp);border-color:var(--fg)}
.site-creative .project-badge{border:2px solid var(--fg);box-shadow:2px 2px 0 var(--fg);transform:rotate(3deg);border-radius:8px}
.site-creative .project-tags li{border:1.5px solid var(--fg);background:#fff;color:var(--fg);border-radius:999px;font-weight:700}
.site-creative .project-tags li:nth-child(3n+1){background:var(--sp-soft)}
.site-creative .exp-list{gap:16px}
.site-creative .exp{grid-template-columns:1fr;gap:8px;border:2px solid var(--fg);border-radius:16px;background:#fff;padding:20px;box-shadow:5px 5px 0 var(--shadow)}
.site-creative .exp-period{display:inline-block;background:var(--sp);color:var(--on-sp);border:2px solid var(--fg);padding:4px 12px;border-radius:999px;font-weight:800;width:max-content}
.site-creative .s-contact{border-top:none;padding-bottom:72px}
.site-creative .s-contact .wrap{background:var(--fg);color:#fff8f0;border-radius:24px;padding:56px 32px;border:2px solid var(--fg);box-shadow:8px 8px 0 var(--sp)}
.site-creative .s-contact .s-kicker{color:var(--sp2)}
.site-creative .s-contact .contact-lead{color:#d6d3d1}
.site-creative .s-contact .s-h2{font-size:clamp(30px,5cqw,48px);font-weight:900}
.site-creative .s-contact .s-h2::after{background:rgba(255,255,255,.16)}
.site-creative .s-contact .s-social{background:rgba(255,255,255,.08);border-color:#fff8f0;color:#fff8f0;box-shadow:none}
`

/* 商务：简历式结构 —— 顶部强调条、头像浮动徽章、左轨时间线、深色联系面板 */
const PROFESSIONAL_CSS = `
.site-professional{--bg:#f8fafc;--fg:#0f172a;--muted:#64748b;--line:#e2e8f0;--panel:#ffffff;--track:#e2e8f0;--nav-bg:rgba(255,255,255,.9);--shadow:rgba(15,23,42,.08);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:8px;--card-r:12px;--avatar-r:18px;border-top:4px solid var(--sp)}
.site-professional .s-title{color:var(--muted)}
.site-professional .s-hero-avatar::after{content:'';position:absolute;inset:-10px;border:2px solid var(--sp-soft);border-radius:26px;pointer-events:none}
.site-professional .s-hero-avatar[data-badge]::before{content:attr(data-badge);position:absolute;bottom:-14px;left:-18px;z-index:2;background:#fff;border:1px solid var(--line);box-shadow:0 8px 20px var(--shadow);padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;color:var(--sp);white-space:nowrap}
.site-professional .s-h2{position:relative;padding-bottom:12px}
.site-professional .s-h2::after{content:'';position:absolute;left:0;bottom:0;width:44px;height:3px;background:var(--sp);border-radius:2px}
.site-professional .skill{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px}
.site-professional .skill-grid{gap:14px}
.site-professional .skill-top{margin-bottom:10px}
.site-professional .project{box-shadow:0 1px 3px var(--shadow)}
.site-professional .exp-list{gap:4px}
.site-professional .exp{position:relative;padding-left:28px;border-bottom:none}
.site-professional .exp::before{content:'';position:absolute;left:0;top:8px;width:11px;height:11px;border-radius:50%;background:#fff;border:3px solid var(--sp)}
.site-professional .exp::after{content:'';position:absolute;left:5px;top:26px;bottom:-6px;width:1.5px;background:var(--line)}
.site-professional .exp:last-child::after{display:none}
.site-professional .s-contact{background:#0f172a;border-top:none}
.site-professional .s-contact .s-h2{color:#f8fafc}
.site-professional .s-contact .s-kicker{color:var(--sp2)}
.site-professional .s-contact .contact-lead{color:#94a3b8}
.site-professional .s-contact .s-social{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16);color:#cbd5e1}
`

/* 水墨：宣纸底 + 朱砂印章 + 墨韵笔触 + 挂轴式项目卡 + 印章式联系区 */
const INK_CSS = `
.site-ink{--bg:#f7f3ea;--fg:#1c1a17;--muted:#6f6656;--line:#ddd3c2;--panel:#fbf8f1;--track:#e9e1d1;--nav-bg:rgba(247,243,234,.9);--shadow:rgba(28,26,23,.1);--fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO};--btn-r:3px;--card-r:6px;--avatar-r:50%;background-image:radial-gradient(rgba(28,26,23,.035) 1px,transparent 1px);background-size:18px 18px}
.site-ink .s-mark{border-radius:6px;background:var(--sp);color:#fbf8f1;box-shadow:0 0 0 1px var(--sp-glow),0 2px 10px var(--sp-glow)}
.site-ink .s-hero{padding:96px 0 80px}
.site-ink .s-name{font-weight:700;letter-spacing:.04em}
.site-ink .s-title{color:var(--muted);font-style:italic}
.site-ink .s-title::before{content:'「';color:var(--sp)}
.site-ink .s-title::after{content:'」';color:var(--sp)}
.site-ink .s-avatar-img{border:2px solid var(--line);box-shadow:0 0 0 6px var(--panel),0 0 0 7px var(--line)}
.site-ink .s-kicker{color:var(--sp);letter-spacing:.35em}
.site-ink .s-h2{font-weight:700;position:relative;padding-bottom:14px}
.site-ink .s-h2::after{content:'';position:absolute;left:0;bottom:0;width:76px;height:10px;background:radial-gradient(ellipse 58px 8px at 38% 50%,var(--sp-soft),transparent 75%),radial-gradient(ellipse 26px 5px at 80% 55%,var(--sp-glow),transparent 72%)}
.site-ink .skill-track{height:8px;border-radius:4px}
.site-ink .skill-fill{background:linear-gradient(90deg,var(--sp),var(--sp2) 78%,transparent);border-radius:4px 2px 2px 4px}
.site-ink .project{background:linear-gradient(180deg,var(--panel),#f3ede0);border:1px solid var(--line);position:relative;overflow:hidden}
.site-ink .project::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--sp),var(--sp2) 45%,transparent 92%);opacity:.85}
.site-ink .project-name{font-weight:700}
.site-ink .project-index{color:var(--sp)}
.site-ink .exp{position:relative;padding-left:28px;border-bottom:none}
.site-ink .exp::before{content:'';position:absolute;left:0;top:10px;width:9px;height:9px;border-radius:50%;background:var(--sp);box-shadow:0 0 0 4px var(--sp-soft)}
.site-ink .exp::after{content:'';position:absolute;left:4px;top:26px;bottom:-4px;width:1px;background:linear-gradient(var(--sp-soft),transparent)}
.site-ink .exp:last-child::after{display:none}
.site-ink .s-contact{border-top:none;padding-bottom:72px}
.site-ink .s-contact .wrap{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:52px 32px;position:relative}
.site-ink .s-contact .wrap::before{content:'';position:absolute;right:22px;top:20px;width:26px;height:26px;background:var(--sp);border-radius:4px;opacity:.9;box-shadow:0 0 0 3px var(--sp-soft)}
.site-ink .s-footer{font-family:var(--fm);font-size:12.5px}
`

/* 粗野：冷灰底 + 3px 粗黑边 + 硬投影 + 零圆角 + 标签式副标题 */
const BRUTAL_CSS = `
.site-brutal{--bg:#f4f4f3;--fg:#0a0a0a;--muted:#4b4b4b;--line:#0a0a0a;--panel:#ffffff;--track:#e4e4e2;--nav-bg:rgba(244,244,243,.94);--shadow:rgba(10,10,10,.85);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:0px;--card-r:0px;--avatar-r:0px}
.site-brutal .s-nav{border-bottom:3px solid var(--fg)}
.site-brutal .s-mark{border-radius:0;border:2.5px solid var(--fg);box-shadow:3px 3px 0 var(--fg);font-weight:900}
.site-brutal .s-hero{padding:80px 0 64px}
.site-brutal .s-name{font-weight:900;letter-spacing:-.01em}
.site-brutal .s-title{display:inline-block;background:var(--sp);color:var(--on-sp);padding:6px 14px;font-weight:800;margin-top:16px}
.site-brutal .s-status{border:2.5px solid var(--fg);background:var(--panel);box-shadow:4px 4px 0 var(--fg);font-weight:700;color:var(--fg);border-radius:0}
.site-brutal .s-dot{background:var(--sp);animation:none}
.site-brutal .s-avatar-img{border:3px solid var(--fg);box-shadow:10px 10px 0 var(--sp)}
.site-brutal .s-monogram{border:3px solid var(--fg);box-shadow:10px 10px 0 var(--sp)}
.site-brutal .s-btn{border:2.5px solid var(--fg);font-weight:800}
.site-brutal .s-btn-primary{box-shadow:5px 5px 0 var(--fg)}
.site-brutal .s-btn-primary:hover{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--sp)}
.site-brutal .s-btn-ghost{box-shadow:5px 5px 0 var(--fg);background:var(--panel)}
.site-brutal .s-btn-ghost:hover{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--fg);color:var(--fg)}
.site-brutal .s-social{border:2.5px solid var(--fg);border-radius:0;background:var(--panel);color:var(--fg);box-shadow:3px 3px 0 var(--fg)}
.site-brutal .s-kicker{background:var(--fg);color:var(--bg);display:inline-block;padding:5px 12px;font-weight:800;letter-spacing:.18em}
.site-brutal .s-h2{font-weight:900;letter-spacing:-.01em}
.site-brutal .skill{background:var(--panel);border:2.5px solid var(--fg);padding:14px 16px;box-shadow:5px 5px 0 var(--fg)}
.site-brutal .skill-track{height:14px;border-radius:0;border:2px solid var(--fg);background:var(--panel)}
.site-brutal .skill-fill{border-radius:0;background:repeating-linear-gradient(45deg,var(--sp) 0 10px,var(--sp2) 10px 20px)}
.site-brutal .project{border:3px solid var(--fg);box-shadow:8px 8px 0 var(--fg)}
.site-brutal .project:hover{transform:translate(-4px,-4px);box-shadow:12px 12px 0 var(--sp);border-color:var(--fg)}
.site-brutal .project-badge{border:2px solid var(--fg);border-radius:0;box-shadow:2px 2px 0 var(--fg)}
.site-brutal .project-tags li{border:2px solid var(--fg);background:var(--panel);color:var(--fg);border-radius:0;font-weight:700}
.site-brutal .exp{grid-template-columns:1fr;gap:6px;border:3px solid var(--fg);background:var(--panel);padding:18px;box-shadow:6px 6px 0 var(--fg)}
.site-brutal .exp-period{display:inline-block;background:var(--fg);color:var(--bg);padding:4px 10px;font-weight:800;width:max-content}
.site-brutal .s-contact{border-top:3px solid var(--fg);background:var(--sp-soft)}
.site-brutal .s-footer{border-top:3px solid var(--fg);background:var(--fg);color:var(--bg)}
.site-brutal .s-footer .wrap{color:var(--bg)}
`

/* 极光：深空底 + 玻璃拟态卡片 + 多层极光光斑 + 渐变标题 */
const AURORA_CSS = `
.site-aurora{--bg:#070b16;--fg:#e8eef8;--muted:#93a3ba;--line:rgba(148,163,184,.16);--panel:rgba(17,26,46,.52);--track:rgba(148,163,184,.14);--nav-bg:rgba(7,11,22,.72);--shadow:rgba(0,0,0,.55);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:12px;--card-r:18px;--avatar-r:22px}
.site-aurora .s-nav{backdrop-filter:blur(18px) saturate(1.4);border-bottom:1px solid rgba(148,163,184,.12)}
.site-aurora .s-mark{background:linear-gradient(135deg,var(--sp),var(--sp2));box-shadow:0 0 18px var(--sp-glow);border-radius:10px}
.site-aurora .s-hero{padding:110px 0 88px}
.site-aurora .s-hero::before{content:'';position:absolute;inset:-30% -15% auto;height:640px;background:radial-gradient(480px 280px at 18% 22%,var(--sp-soft),transparent 68%),radial-gradient(520px 300px at 78% 12%,rgba(139,92,246,.18),transparent 70%),radial-gradient(420px 260px at 55% 55%,rgba(56,189,248,.12),transparent 72%);filter:blur(8px);pointer-events:none}
.site-aurora .s-hero::after{content:'';position:absolute;right:8%;top:18%;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle at 35% 35%,var(--sp-soft),transparent 65%);filter:blur(28px);pointer-events:none}
.site-aurora .s-name{background:linear-gradient(96deg,var(--fg) 20%,var(--sp) 58%,var(--sp2));-webkit-background-clip:text;background-clip:text;color:transparent}
.site-aurora .s-status{background:rgba(17,26,46,.55);backdrop-filter:blur(10px);border:1px solid rgba(148,163,184,.18)}
.site-aurora .s-chip{background:rgba(17,26,46,.5);backdrop-filter:blur(8px);border:1px solid rgba(148,163,184,.16)}
.site-aurora .s-btn-primary{background:linear-gradient(120deg,var(--sp),var(--sp2));box-shadow:0 8px 28px var(--sp-glow)}
.site-aurora .s-btn-ghost{background:rgba(17,26,46,.5);backdrop-filter:blur(8px);border-color:rgba(148,163,184,.2)}
.site-aurora .s-social{background:rgba(17,26,46,.5);backdrop-filter:blur(8px);border:1px solid rgba(148,163,184,.18)}
.site-aurora .s-avatar-img{border:2px solid rgba(148,163,184,.25);box-shadow:0 0 32px var(--sp-glow)}
.site-aurora .s-monogram{box-shadow:0 0 32px var(--sp-glow)}
.site-aurora .s-kicker{color:var(--sp);letter-spacing:.28em}
.site-aurora .s-h2{background:linear-gradient(92deg,var(--fg),var(--sp));-webkit-background-clip:text;background-clip:text;color:transparent}
.site-aurora .skill{background:var(--panel);backdrop-filter:blur(12px);border:1px solid rgba(148,163,184,.14);border-radius:14px}
.site-aurora .skill-track{height:8px;background:rgba(148,163,184,.12)}
.site-aurora .skill-fill{background:linear-gradient(90deg,var(--sp),var(--sp2));box-shadow:0 0 14px var(--sp-glow)}
.site-aurora .project{background:var(--panel);backdrop-filter:blur(14px);border:1px solid rgba(148,163,184,.14);position:relative;overflow:hidden}
.site-aurora .project::before{content:'';position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.06),transparent 40%);pointer-events:none}
.site-aurora .project:hover{border-color:var(--sp);box-shadow:0 18px 48px var(--shadow),0 0 0 1px var(--sp-glow)}
.site-aurora .project-tags li{background:var(--sp-soft);color:var(--fg)}
.site-aurora .exp{border-bottom:none;border-left:2px solid rgba(148,163,184,.18);padding-left:24px;position:relative}
.site-aurora .exp::before{content:'';position:absolute;left:-5px;top:28px;width:8px;height:8px;border-radius:50%;background:var(--sp);box-shadow:0 0 12px var(--sp-glow)}
.site-aurora .s-contact{border-top:none;padding-bottom:72px}
.site-aurora .s-contact .wrap{background:var(--panel);backdrop-filter:blur(16px);border:1px solid rgba(148,163,184,.16);border-radius:20px;padding:56px 32px}
.site-aurora .s-footer{border-top:1px solid rgba(148,163,184,.12);font-size:12.5px}
`

/* 杂志：衬线意大利体 + 首字下沉 + 粗细双线 + 刊物式项目索引 */
const EDITORIAL_CSS = `
.site-editorial{--bg:#fafaf6;--fg:#1a1712;--muted:#5c554a;--line:#d6d0c4;--panel:#ffffff;--track:#e8e4da;--nav-bg:rgba(250,250,246,.94);--shadow:rgba(26,23,18,.1);--fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO};--btn-r:0px;--card-r:0px;--avatar-r:0px}
.site-editorial .s-nav{border-bottom:1px solid var(--fg)}
.site-editorial .s-nav::after{content:'';display:block;height:3px;border-top:1px solid var(--fg);margin-top:2px}
.site-editorial .s-mark{border-radius:0;background:var(--fg);color:var(--bg)}
.site-editorial .s-hero{padding:88px 0 72px}
.site-editorial .s-name{font-weight:800;font-style:italic;letter-spacing:-.01em}
.site-editorial .s-title{color:var(--muted);font-weight:400}
.site-editorial .s-bio{font-size:16.5px;line-height:1.85}
.site-editorial .s-bio::first-letter{float:left;font-size:2.6em;line-height:.85;padding:4px 10px 0 0;font-weight:700;color:var(--sp)}
.site-editorial .s-kicker{color:var(--sp);letter-spacing:.32em;font-weight:700}
.site-editorial .s-h2{font-weight:800;font-style:italic;position:relative;padding-bottom:12px}
.site-editorial .s-h2::after{content:'';position:absolute;left:0;bottom:0;width:100%;height:1px;background:var(--fg)}
.site-editorial .s-h2::before{content:'';position:absolute;left:0;bottom:-3px;width:56px;height:3px;background:var(--sp);z-index:1}
.site-editorial .skill-track{height:4px;border-radius:0}
.site-editorial .skill-fill{border-radius:0;background:var(--sp)}
.site-editorial .project-grid{grid-template-columns:1fr 1fr;gap:0 40px}
.site-editorial .project{background:transparent;border:none;border-top:1px solid var(--fg);border-radius:0;padding:22px 0}
.site-editorial .project:last-child{border-bottom:1px solid var(--fg)}
.site-editorial .project:hover{transform:none;box-shadow:none;border-color:var(--sp)}
.site-editorial .project-name{font-size:22px;font-style:italic;font-weight:700}
.site-editorial .project-index{font-size:18px;color:var(--sp);font-style:italic;font-weight:700}
.site-editorial .project-badge{background:transparent;color:var(--sp);border:1px solid var(--sp);border-radius:0}
.site-editorial .project-tags li{background:transparent;border:1px solid var(--line);color:var(--muted);border-radius:0}
.site-editorial .exp-period{color:var(--sp);font-weight:700}
.site-editorial .s-contact .s-h2{font-size:clamp(32px,5cqw,52px)}
.site-editorial .s-footer{font-family:var(--fm);font-size:12px;border-top:2px solid var(--fg)}
`

/* 鎏金：炭黑底 + 金色渐变字 + 发丝金线 + 暗夜项目卡 */
const GOLD_CSS = `
.site-gold{--bg:#0d0b08;--fg:#f5efe0;--muted:#a89e88;--line:#2e2a20;--panel:#171410;--track:#262117;--nav-bg:rgba(13,11,8,.86);--shadow:rgba(0,0,0,.5);--fd:${FONT_SERIF};--fb:${FONT_SERIF};--fm:${FONT_MONO};--btn-r:2px;--card-r:6px;--avatar-r:50%}
.site-gold .s-mark{background:linear-gradient(135deg,#f3d97c,var(--sp) 60%,#9c7a1e);color:#171204;font-weight:800}
.site-gold .s-nav{border-bottom:1px solid var(--line)}
.site-gold .s-hero{padding:104px 0 84px}
.site-gold .s-name{font-weight:700;letter-spacing:.03em;background:linear-gradient(100deg,#f7f0dd 12%,var(--sp) 52%,#f7f0dd 88%);-webkit-background-clip:text;background-clip:text;color:transparent}
.site-gold .s-title{color:var(--sp)}
.site-gold .s-avatar-img{border:2px solid var(--sp);box-shadow:0 0 0 1px var(--line),0 0 26px var(--sp-glow)}
.site-gold .s-kicker{color:var(--sp);letter-spacing:.3em}
.site-gold .s-h2{font-weight:700;position:relative;padding-bottom:12px}
.site-gold .s-h2::after{content:'';position:absolute;left:0;bottom:0;width:100%;height:1px;background:linear-gradient(90deg,var(--sp),transparent 72%)}
.site-gold .s-h2::before{content:'';position:absolute;left:0;bottom:-2px;width:48px;height:3px;background:var(--sp);z-index:1}
.site-gold .skill-track{height:6px;border-radius:3px}
.site-gold .skill-fill{background:linear-gradient(90deg,var(--sp),#f3d97c);box-shadow:0 0 12px var(--sp-glow)}
.site-gold .project{background:var(--panel);border:1px solid var(--line);position:relative;overflow:hidden}
.site-gold .project::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,var(--sp),transparent 82%)}
.site-gold .project:hover{border-color:var(--sp);box-shadow:0 16px 40px var(--shadow),0 0 0 1px var(--sp-glow)}
.site-gold .project-index{color:var(--sp)}
.site-gold .project-tags li{background:rgba(212,175,55,.1);color:var(--sp)}
.site-gold .exp{position:relative;padding-left:28px;border-bottom:none}
.site-gold .exp::before{content:'';position:absolute;left:0;top:10px;width:9px;height:9px;border-radius:50%;background:var(--sp);box-shadow:0 0 0 4px rgba(212,175,55,.15)}
.site-gold .exp::after{content:'';position:absolute;left:4px;top:26px;bottom:-4px;width:1px;background:linear-gradient(rgba(212,175,55,.3),transparent)}
.site-gold .exp:last-child::after{display:none}
.site-gold .s-contact{border-top:none;padding-bottom:72px}
.site-gold .s-contact .wrap{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:52px 32px}
.site-gold .s-footer{font-family:var(--fm);font-size:12.5px;border-top:1px solid var(--line)}
`

/* 蒸汽波：紫夜底 + 条纹落日 + 透视网格地板 + 粉青霓虹 */
const VAPOR_CSS = `
.site-vapor{--bg:#12071f;--fg:#fdf4ff;--muted:#b6a3d9;--line:#37205a;--panel:rgba(55,32,90,.45);--track:#2a1a3e;--nav-bg:rgba(18,7,31,.8);--shadow:rgba(0,0,0,.5);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:999px;--card-r:14px;--avatar-r:16px;background-image:linear-gradient(180deg,#1a0b2e 0%,#12071f 55%,#0d0518 100%)}
.site-vapor .s-nav{border-bottom:1px solid rgba(255,113,206,.3)}
.site-vapor .s-mark{background:linear-gradient(135deg,var(--sp),#01cdfe);color:#12071f;font-weight:800}
.site-vapor .s-hero::before{content:'';position:absolute;left:50%;top:4%;width:360px;height:360px;transform:translateX(-50%);border-radius:50%;background:repeating-linear-gradient(180deg,transparent 0 16px,rgba(18,7,31,.85) 16px 22px),radial-gradient(circle at 50% 42%,#fffb96 0%,#ff6e27 36%,var(--sp) 68%,transparent 74%);opacity:.38;pointer-events:none}
.site-vapor .s-hero::after{content:'';position:absolute;left:-20%;right:-20%;bottom:-46px;height:320px;z-index:-1;background:repeating-linear-gradient(transparent 0 22px,rgba(1,205,254,.35) 22px 24px),repeating-linear-gradient(90deg,transparent 0 44px,rgba(255,113,206,.28) 44px 46px);transform:perspective(340px) rotateX(58deg);transform-origin:top;pointer-events:none}
.site-vapor .s-name{background:linear-gradient(95deg,#01cdfe,var(--sp) 55%,#b967ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.site-vapor .s-title{color:#01cdfe}
.site-vapor .s-status{border:1px solid rgba(1,205,254,.4);color:#01cdfe;background:rgba(1,205,254,.08)}
.site-vapor .s-dot{background:#01cdfe}
.site-vapor .s-chip{background:var(--panel);border:1px solid var(--line)}
.site-vapor .s-btn-primary{background:linear-gradient(95deg,var(--sp),#b967ff);color:#fff;box-shadow:0 0 24px rgba(255,113,206,.4)}
.site-vapor .s-btn-ghost{border:1px solid #01cdfe;color:#01cdfe;background:transparent}
.site-vapor .s-btn-ghost:hover{box-shadow:0 0 16px rgba(1,205,254,.5);color:#01cdfe;border-color:#01cdfe}
.site-vapor .s-avatar-img{border:3px solid #01cdfe;box-shadow:0 0 28px rgba(1,205,254,.45)}
.site-vapor .s-monogram{border:3px solid var(--sp);box-shadow:0 0 28px rgba(255,113,206,.4)}
.site-vapor .s-kicker{color:#01cdfe;letter-spacing:.3em}
.site-vapor .s-h2{background:linear-gradient(90deg,#fdf4ff,var(--sp));-webkit-background-clip:text;background-clip:text;color:transparent}
.site-vapor .skill-track{height:10px;border:1px solid var(--line);background:#1c1030}
.site-vapor .skill-fill{background:repeating-linear-gradient(90deg,#01cdfe 0 10px,var(--sp) 10px 20px);box-shadow:0 0 12px rgba(1,205,254,.4)}
.site-vapor .project{background:var(--panel);border:1px solid var(--line);backdrop-filter:blur(8px)}
.site-vapor .project:hover{border-color:var(--sp);box-shadow:0 0 0 1px var(--sp),0 14px 40px rgba(0,0,0,.5)}
.site-vapor .project-index{color:#01cdfe}
.site-vapor .project-tags li{background:rgba(1,205,254,.1);color:#01cdfe;border:1px solid rgba(1,205,254,.25)}
.site-vapor .exp{border-bottom:none;border-left:2px solid var(--line);padding-left:24px;position:relative}
.site-vapor .exp::before{content:'';position:absolute;left:-6px;top:28px;width:8px;height:8px;border-radius:50%;background:var(--sp);box-shadow:0 0 10px var(--sp)}
.site-vapor .s-contact{border-top:none;padding-bottom:72px}
.site-vapor .s-contact .wrap{background:linear-gradient(160deg,rgba(255,113,206,.12),rgba(1,205,254,.08));border:1px solid rgba(255,113,206,.35);border-radius:18px;padding:56px 32px}
.site-vapor .s-footer{border-top:1px solid var(--line);font-size:12.5px}
`

/* 瑞士：纯白底 + 黑色规则线 + 红色强调条 + 无衬线大标题 */
const SWISS_CSS = `
.site-swiss{--bg:#ffffff;--fg:#111111;--muted:#666666;--line:#d6d6d6;--panel:#ffffff;--track:#e9e9e9;--nav-bg:rgba(255,255,255,.95);--shadow:rgba(17,17,17,.08);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:0px;--card-r:0px;--avatar-r:0px}
.site-swiss .s-nav{border-bottom:1px solid var(--fg)}
.site-swiss .s-mark{border-radius:0;background:var(--sp);color:#fff;font-weight:800}
.site-swiss .s-name{font-weight:800;letter-spacing:-.03em}
.site-swiss .s-title{color:var(--sp);font-weight:700}
.site-swiss .s-status{border:1px solid var(--fg);border-radius:0;background:var(--panel)}
.site-swiss .s-dot{background:var(--sp)}
.site-swiss .s-avatar-img{border:2px solid var(--fg);border-radius:0}
.site-swiss .s-kicker{color:var(--fg);font-weight:800;letter-spacing:.28em}
.site-swiss .s-section{border-top:1px solid var(--fg)}
.site-swiss .s-h2{font-weight:800;letter-spacing:-.02em;position:relative;padding-left:20px}
.site-swiss .s-h2::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:8px;background:var(--sp)}
.site-swiss .skill-track{height:6px;border-radius:0}
.site-swiss .skill-fill{border-radius:0;background:var(--sp)}
.site-swiss .skill-pct{color:var(--fg)}
.site-swiss .project{background:transparent;border:none;border-top:2px solid var(--fg);border-radius:0;padding:22px 0}
.site-swiss .project:hover{transform:none;box-shadow:none;border-color:var(--sp)}
.site-swiss .project-index{color:var(--fg);font-weight:800}
.site-swiss .project-badge{border-radius:0}
.site-swiss .project-tags li{background:transparent;border:1px solid var(--fg);color:var(--fg);border-radius:0}
.site-swiss .exp-period{color:var(--sp);font-weight:800}
.site-swiss .s-btn{border-radius:0}
.site-swiss .s-btn-primary{background:var(--fg);color:var(--bg)}
.site-swiss .s-btn-primary:hover{background:var(--sp);color:#fff;transform:none;box-shadow:none}
.site-swiss .s-btn-ghost{border:1px solid var(--fg);background:var(--panel);border-radius:0}
.site-swiss .s-contact .s-h2{font-size:clamp(34px,5.5cqw,56px)}
.site-swiss .s-footer{border-top:2px solid var(--fg);font-family:var(--fm);font-size:12px}
`

/* 手账：牛皮纸底 + 胶带贴纸 + 虚线手作边框 + 便签式经历 */
const KRAFT_CSS = `
.site-kraft{--bg:#f6ecdd;--fg:#3d2f22;--muted:#8a7a66;--line:#e0d2bc;--panel:#fffbf2;--track:#ecdcbc;--nav-bg:rgba(246,236,221,.92);--shadow:rgba(61,47,34,.12);--fd:${FONT_SANS};--fb:${FONT_SANS};--fm:${FONT_MONO};--btn-r:999px;--card-r:16px;--avatar-r:50%;background-image:radial-gradient(rgba(61,47,34,.04) 1px,transparent 1px);background-size:14px 14px}
.site-kraft .s-mark{border-radius:12px;transform:rotate(-4deg)}
.site-kraft .s-status{border:1.5px dashed var(--muted);background:var(--panel);border-radius:999px}
.site-kraft .s-hero-avatar::before{content:'';position:absolute;top:-12px;left:50%;transform:translateX(-50%) rotate(-3deg);width:92px;height:26px;background:rgba(255,252,240,.68);border:1px solid rgba(61,47,34,.08);box-shadow:0 2px 6px var(--shadow);z-index:2}
.site-kraft .s-avatar-img{border:4px solid var(--panel);box-shadow:0 8px 20px var(--shadow)}
.site-kraft .s-kicker{color:var(--sp)}
.site-kraft .s-h2{position:relative;display:inline-block;isolation:isolate}
.site-kraft .s-h2::after{content:'';position:absolute;left:-4px;bottom:4px;width:70%;height:12px;background:var(--sp-soft);border-radius:4px;transform:rotate(-1deg);z-index:-1}
.site-kraft .skill{background:var(--panel);border:1.5px dashed #c9b691;border-radius:14px;padding:14px 16px}
.site-kraft .skill-fill{background:linear-gradient(90deg,var(--sp),var(--sp2))}
.site-kraft .project{background:var(--panel);border:1.5px dashed #c9b691;border-radius:16px;box-shadow:0 6px 16px var(--shadow)}
.site-kraft .project:nth-child(even){transform:rotate(.4deg)}
.site-kraft .project:hover{transform:translateY(-3px) rotate(0deg);box-shadow:0 12px 24px var(--shadow);border-color:var(--sp)}
.site-kraft .project-tags li{background:#f3e7cd;color:#6b5636;border-radius:999px}
.site-kraft .exp{grid-template-columns:1fr;gap:8px;background:var(--panel);border:1.5px dashed #c9b691;border-radius:14px;padding:18px;position:relative}
.site-kraft .exp:nth-child(even){transform:rotate(-.35deg)}
.site-kraft .exp::before{content:'';position:absolute;top:-10px;left:24px;width:70px;height:22px;background:rgba(255,252,240,.7);border:1px solid rgba(61,47,34,.06);transform:rotate(-2deg)}
.site-kraft .exp-period{display:inline-block;background:var(--sp-soft);padding:4px 12px;border-radius:999px;font-weight:700;width:max-content}
.site-kraft .s-contact{border-top:none;padding-bottom:72px}
.site-kraft .s-contact .wrap{background:var(--panel);border:1.5px dashed #c9b691;border-radius:20px;padding:52px 32px;position:relative}
.site-kraft .s-contact .wrap::before{content:'';position:absolute;top:-12px;left:50%;transform:translateX(-50%) rotate(2deg);width:96px;height:26px;background:rgba(255,252,240,.68);border:1px solid rgba(61,47,34,.08);box-shadow:0 2px 6px var(--shadow)}
.site-kraft .s-footer{font-family:var(--fm);font-size:12px}
`

const TEMPLATE_CSS: Record<TemplateName, string> = {
  minimal: MINIMAL_CSS,
  tech: TECH_CSS,
  creative: CREATIVE_CSS,
  professional: PROFESSIONAL_CSS,
  ink: INK_CSS,
  brutal: BRUTAL_CSS,
  aurora: AURORA_CSS,
  editorial: EDITORIAL_CSS,
  gold: GOLD_CSS,
  vapor: VAPOR_CSS,
  swiss: SWISS_CSS,
  kraft: KRAFT_CSS,
}

export const TEMPLATE_BG: Record<TemplateName, string> = {
  minimal: '#fafaf9',
  tech: '#0b1220',
  creative: '#fff8f0',
  professional: '#f8fafc',
  ink: '#f7f3ea',
  brutal: '#f4f4f3',
  aurora: '#070b16',
  editorial: '#fafaf6',
  gold: '#0d0b08',
  vapor: '#12071f',
  swiss: '#ffffff',
  kraft: '#f6ecdd',
}

/**
 * 拼装完整 CSS。顺序即覆盖优先级：基样式 → 模板差异 → 主题变量最后写入，
 * 保证用户自定义主题色永远覆盖模板默认色。非法 hex 回退模板默认色。
 */
export function renderSiteCSS(data: SiteData, template: TemplateName): string {
  const meta = getTemplate(template)
  const sp = isValidHexColor(data.theme.primaryColor) ? data.theme.primaryColor : meta.defaultColor
  return `${BASE_CSS}\n${TEMPLATE_CSS[template]}\n.site-${template}{${themeVars(sp)}}`
}