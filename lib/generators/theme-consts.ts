/**
 * 主题常量（叶子模块）：字体栈与默认头像 SVG。
 * styles.ts 与 layouts/* 都要引用，抽到独立文件避免循环依赖
 * （styles 聚合各版式 CSS，版式文件又需要字体栈/头像常量）。
 */

export const FONT_SANS = `'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif`
export const FONT_MONO = `'Cascadia Code',Consolas,ui-monospace,Menlo,monospace`
export const FONT_SERIF = `Georgia,'Times New Roman','Songti SC','SimSun',serif`

// 与 public/images/avatar-default.svg 保持一致；内联保证导出单文件在 file:// 下也能显示头像
const DEFAULT_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e2640"/><stop offset="100%" stop-color="#0b0f1e"/></linearGradient><linearGradient id="fig" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c6cff"/><stop offset="60%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><rect width="240" height="240" fill="url(#bg)"/><circle cx="196" cy="44" r="30" fill="#22d3ee" opacity="0.14"/><circle cx="36" cy="204" r="42" fill="#7c6cff" opacity="0.16"/><path d="M0 176 L240 120 L240 240 L0 240 Z" fill="#151b31"/><circle cx="120" cy="92" r="38" fill="url(#fig)"/><path d="M52 208c6-40 34-62 68-62s62 22 68 62" fill="url(#fig)" opacity="0.9"/><path d="M96 92l-10 10 10 10M144 92l10 10-10 10" stroke="#0b0f1e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/></svg>`

export const DEFAULT_AVATAR_PATH = '/images/avatar-default.svg'
export const DEFAULT_AVATAR_DATA_URI = `data:image/svg+xml,${encodeURIComponent(DEFAULT_AVATAR_SVG)}`
