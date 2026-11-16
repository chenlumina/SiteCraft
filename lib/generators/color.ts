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

/** 由主题色派生整组 CSS 变量：主色/渐变搭档/柔和底/光晕/主色上的文字色 */
export function themeVars(sp: string): string {
  const sp2 = hueShift(sp, 18)
  return `--sp:${sp};--sp2:${sp2};--sp-soft:${rgba(sp, 0.14)};--sp-glow:${rgba(sp, 0.32)};--on-sp:${onColor(sp)};`
}