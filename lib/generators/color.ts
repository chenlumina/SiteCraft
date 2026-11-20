/**
 * 主题色派生数学：用户只选一个主色，渐变搭档色 / 光晕 / 按钮文字色
 * 全部由这里计算，避免引入色彩库。纯函数，无 DOM / 无 IO。
 */
import { hexToRgb, rgba } from '@/lib/utils'

/**
 * 色相旋转：把主题色在 HSL 空间反向旋转 degrees 度得到渐变第二色 --sp2。
 * 这样用户任选一个主题色，渐变/光晕都会自动派生出「同族但不同色相」的搭档色，
 * 而不是写死第二色导致换主题后配色打架。纯数学实现，避免引入色彩库。
 * 注意方向是「减」：调用方传 18，实际色相 -18°（与历史产物一致，勿改符号与角度）。
 */
export function hueShift(hex: string, degrees: number): string {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  // RGB → HSL：max==min 时为无彩色（s=0），旋转色相后仍是同灰度
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - gn) / d + 2) / 6
    else h = ((bn - gn) / d + 4) / 6
  }
  h = (h - degrees / 360 + 1) % 1
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  let outR = l
  let outG = l
  let outB = l
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    outR = hue2rgb(p, q, h + 1 / 3)
    outG = hue2rgb(p, q, h)
    outB = hue2rgb(p, q, h - 1 / 3)
  }
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(outR)}${toHex(outG)}${toHex(outB)}`
}

/** 按感知亮度决定主题色上的文字用黑还是白（WCAG 对比度思路），保证按钮文字永远可读 */
export function onColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.58 ? '#0b1220' : '#ffffff'
}

/**
 * 把强调色往黑/白两端推，直到它在给定背景上达到 WCAG 正文对比度。
 * 为什么不直接用 --sp 当文字色：用户只选一个主色，浅色（#22d3ee、#facc15）
 * 放在浅纸底上对比度只有 1.6~1.8，正文直接不可读。强调色当背景永远安全，
 * 当文字必须先过这道换算。
 */
export function contrastInk(hex: string, bg: string, target = 4.8): string {
  const rel = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const lum = (h: string) => {
    const { r, g, b } = hexToRgb(h)
    return 0.2126 * rel(r / 255) + 0.7152 * rel(g / 255) + 0.0722 * rel(b / 255)
  }
  const ratio = (a: string, b: string) => {
    const pair = [lum(a), lum(b)].sort((x, y) => y - x)
    return (pair[0] + 0.05) / (pair[1] + 0.05)
  }
  if (ratio(hex, bg) >= target) return hex
  const towardsWhite = lum(bg) < 0.18
  const toHex = (r: number, g: number, b: number) =>
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  const base = hexToRgb(hex)
  for (let step = 1; step <= 20; step += 1) {
    const t = step / 20
    const mix = (v: number) => (towardsWhite ? v + (255 - v) * t : v * (1 - t))
    const candidate = toHex(mix(base.r), mix(base.g), mix(base.b))
    if (ratio(candidate, bg) >= target) return candidate
  }
  return towardsWhite ? '#ffffff' : '#000000'
}

/** 由主题色派生整组 CSS 变量：主色/渐变搭档/柔和底/光晕/主色上的文字色 */
export function themeVars(sp: string, bg = '#ffffff'): string {
  const sp2 = hueShift(sp, 18)
  // --sp-ink：浅底上的强调色文字（已推到 ≥4.6:1）；--sp-inkd：深底版本
  return `--sp:${sp};--sp2:${sp2};--sp-soft:${rgba(sp, 0.14)};--sp-glow:${rgba(sp, 0.32)};--on-sp:${onColor(sp)};--sp-ink:${contrastInk(sp, bg)};--sp-inkd:${contrastInk(sp, '#0b1220')};`
}
