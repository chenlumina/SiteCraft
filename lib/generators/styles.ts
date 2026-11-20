/**
 * 站点样式聚合：共享基样式 + 十二套「独立版式」样式 + 主题变量拼装。
 *
 * v2 架构：每套版式的结构 CSS 在 lib/generators/layouts/<name>.ts 里与
 * 它的 HTML 骨架放在一起（一个版式一个文件，骨架和皮肤同源）；
 * 本文件只保留所有版式共享的底层原语与聚合逻辑。
 *
 * 注意两条陷阱规则（见行内注释）：:where(a) 与 @container。
 */
import type { SiteData, TemplateName } from '@/types'
import { isValidHexColor } from '@/lib/utils'
import { getTemplate } from '@/lib/templates'
import { themeVars } from './color'
import { MINIMAL_CSS } from './layouts/minimal'
import { TECH_CSS } from './layouts/tech'
import { CREATIVE_CSS } from './layouts/creative'
import { PROFESSIONAL_CSS } from './layouts/professional'
import { INK_CSS } from './layouts/ink'
import { BRUTAL_CSS } from './layouts/brutal'
import { AURORA_CSS } from './layouts/aurora'
import { EDITORIAL_CSS } from './layouts/editorial'
import { GOLD_CSS } from './layouts/gold'
import { VAPOR_CSS } from './layouts/vapor'
import { SWISS_CSS } from './layouts/swiss'
import { KRAFT_CSS } from './layouts/kraft'
import { METRO_CSS } from './layouts/metro'

/**
 * 全版式共享的底层原语：reset、根容器（container-type 是预览缩放的基石）、
 * 链接/列表重置、选区与滚动条。各版式在此之上完全自由地组织自己的骨架。
 */
const BASE_CSS = `
.site-root{container-type:inline-size;min-height:100%;background:var(--bg);color:var(--fg);font-family:var(--fb);line-height:1.65;font-size:16px;-webkit-font-smoothing:antialiased}
.site-root *,.site-root *::before,.site-root *::after{box-sizing:border-box;margin:0;padding:0}
.site-root img{display:block;max-width:100%}
/* :where() 把这条重置的特异性降为 (0,1,0)，否则 .site-root a (0,1,1) 会压过各版式按钮的 color */
.site-root :where(a){color:inherit;text-decoration:none}
.site-root ul,.site-root ol{list-style:none}
/* 图标 SVG 统一尺寸：icon() 产出的 svg 无 width/height 属性，默认会撑到 300×150 把按钮撑爆。
   这里必须是 :where(svg) 把特异性压到 (0,1,0)——原写法 .site-root svg 是 (0,1,1)，
   版式里 .g-wave{width:100%} 这类单类覆盖根本盖不过去（后加载不算数，特异性才算数），
   结果是 gold 的水波 SVG 被压成 16px，整池水缩小 6 倍 */
.site-root :where(svg){width:16px;height:16px;flex:none}
.site-root ::selection{background:var(--sp);color:var(--on-sp)}
.site-root ::-webkit-scrollbar{width:10px;height:10px}
.site-root ::-webkit-scrollbar-track{background:var(--bg)}
.site-root ::-webkit-scrollbar-thumb{background:var(--line);border-radius:99px;border:2px solid var(--bg)}
.site-root ::-webkit-scrollbar-thumb:hover{background:var(--sp)}
.s-name{overflow-wrap:anywhere}
/* 交互层：所有版式的链接与按钮共用同一条缓动，按下给一次轻反馈。
   :where() 保持 0 特异性，版式自有时序可以覆盖它 */
.site-root :where(a,button){transition:color .22s cubic-bezier(.22,.7,.2,1),background-color .22s cubic-bezier(.22,.7,.2,1),border-color .22s cubic-bezier(.22,.7,.2,1),box-shadow .22s cubic-bezier(.22,.7,.2,1),opacity .22s}
.site-root :where(a,button):active{opacity:.72}
/* 入场关键帧共用；用哪个由各版式自己挑，不在这里统一套用 */
@keyframes sf-rise{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}
@keyframes sf-land{from{opacity:0;transform:scale(.965)}to{opacity:1;transform:none}}
@keyframes sf-type{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes sf-glow{from{opacity:0;filter:blur(7px)}to{opacity:1;filter:blur(0)}}
@keyframes sf-glitch{0%{opacity:0;transform:translateX(-7px)}55%{opacity:1;transform:translateX(2px)}100%{opacity:1;transform:none}}

/* 键盘焦点环：所有版式共享，版式可用更高特异性覆盖颜色 */
/* 导航类链接的触摸下限：line box 只有 19~21px，垫到 WCAG 2.5.8 的 24px */
.site-root nav a,.site-root header a{display:inline-flex;align-items:center;min-height:24px}
.site-root a:focus-visible,.site-root button:focus-visible{outline:2px solid var(--sp);outline-offset:3px;border-radius:1px}
/* 动效整体开关：用户在系统层拒绝动效时，全部版式的动画与过渡一律关闭 */
@media (prefers-reduced-motion:reduce){
.site-root *,.site-root *::before,.site-root *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}
@keyframes sp-pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.45)}70%{box-shadow:0 0 0 9px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
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
  metro: METRO_CSS,
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
  metro: '#ffffff',
}

/** 旧渲染链路兼容：默认头像常量迁移到 theme-consts，这里保持原导出位 */
export { DEFAULT_AVATAR_DATA_URI, DEFAULT_AVATAR_PATH } from './theme-consts'

/**
 * 拼装完整 CSS。顺序即覆盖优先级：基样式 → 版式样式 → 主题变量最后写入，
 * 保证用户自定义主题色永远覆盖版式默认色。非法 hex 回退版式默认色。
 */
export function renderSiteCSS(data: SiteData, template: TemplateName): string {
  const meta = getTemplate(template)
  const sp = isValidHexColor(data.theme.primaryColor) ? data.theme.primaryColor : meta.defaultColor
  return `${BASE_CSS}\n${TEMPLATE_CSS[template]}\n.site-${template}{${themeVars(sp, TEMPLATE_BG[template])}}`
}
