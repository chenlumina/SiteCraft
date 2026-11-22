/**
 * 分享卡片：浏览器端 Canvas 绘制的 1200×630 站点名片（OG 图尺寸）。
 * 不复刻截图：纸面底 + 名字 + 头衔 + 三项技能 + 联系方式 + 生成者标记，
 * 沿用首页印刷工坊语言（内框 / 裁切角线 / 主题色细带）；高 DPI 2x 渲染。
 * 填入部署地址时附二维码（qrcode 按需动态加载，不填则画一枚印记占位）。
 * 全本地生成，不上传任何内容。
 */
import type { SiteData } from '@/types'
import { safeFileName } from '@/lib/utils'

const W = 1200
const H = 630
const PAPER = '#f8f7f1'
const INK = '#1b1917'
const SERIF = '"Songti SC","STSong","SimSun",serif'
const MONO = '"Cascadia Code",Consolas,"Courier New",monospace'

export interface ShareCardInput {
  data: SiteData
  url?: string
}

/** 名字过长时逐级缩小字号，保证单行放得下 */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: number,
  family: string,
  start: number
): number {
  let size = start
  do {
    ctx.font = `${weight} ${size}px ${family}`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 4
  } while (size > 44)
  return size
}

/** 字号缩到下限仍放不下时截断加省略号（按码点切，避免截断 emoji） */
function clampWithEllipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  const chars = [...text]
  while (chars.length > 1 && ctx.measureText(`${chars.join('')}…`).width > maxWidth) chars.pop()
  return `${chars.join('')}…`
}

export async function renderShareCard({ data, url }: ShareCardInput): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  const accent = data.theme.primaryColor
  const left = 88

  // 纸底 + 内框 + 四角裁切线
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(27,25,23,0.18)'
  ctx.lineWidth = 1
  ctx.strokeRect(24.5, 24.5, W - 49, H - 49)
  ctx.strokeStyle = 'rgba(27,25,23,0.35)'
  ctx.lineWidth = 1.5
  const corners = [
    [40, 40, 1, 1],
    [W - 40, 40, -1, 1],
    [40, H - 40, 1, -1],
    [W - 40, H - 40, -1, -1],
  ] as const
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath()
    ctx.moveTo(x + dx * 14, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * 14)
    ctx.stroke()
  }

  // 左侧主题色细带
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, 8, H)

  // 眉标
  ctx.fillStyle = 'rgba(27,25,23,0.5)'
  ctx.font = `600 20px ${MONO}`
  const spaced = ctx as unknown as { letterSpacing?: string }
  // 不支持的浏览器赋值即无效，无需 try/catch；不支持时退回默认字距
  spaced.letterSpacing = '4px'
  ctx.fillText('SITECRAFT · PERSONAL SITE', left, 92)
  spaced.letterSpacing = '0px'

  // 名字与头衔
  const nameSize = fitFont(ctx, data.name, 640, 700, SERIF, 96)
  ctx.fillStyle = INK
  ctx.font = `700 ${nameSize}px ${SERIF}`
  ctx.fillText(clampWithEllipsis(ctx, data.name, 640), left, 200)
  ctx.font = `400 30px ${SERIF}`
  ctx.fillStyle = 'rgba(27,25,23,0.68)'
  ctx.fillText(clampWithEllipsis(ctx, data.title, 640), left, 252)

  ctx.strokeStyle = 'rgba(27,25,23,0.18)'
  ctx.beginPath()
  ctx.moveTo(left, 292)
  ctx.lineTo(left + 520, 292)
  ctx.stroke()

  // 技能（最多三项，圆点用主题色）
  let sx = left
  ctx.font = `400 22px ${MONO}`
  for (const skill of data.skills.slice(0, 3)) {
    const label =
      [...skill.name].length > 10 ? `${[...skill.name].slice(0, 10).join('')}…` : skill.name
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(sx + 5, 340, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(27,25,23,0.75)'
    ctx.fillText(label, sx + 18, 347)
    sx += 18 + ctx.measureText(label).width + 28
    if (sx > left + 620) break
  }

  if (data.email.trim()) {
    ctx.font = `400 22px ${MONO}`
    ctx.fillStyle = 'rgba(27,25,23,0.6)'
    ctx.fillText(data.email.trim(), left, 400)
  }

  // 底部分隔线与生成者标记
  ctx.strokeStyle = 'rgba(27,25,23,0.15)'
  ctx.beginPath()
  ctx.moveTo(left, H - 108)
  ctx.lineTo(W - left, H - 108)
  ctx.stroke()
  ctx.font = `400 18px ${MONO}`
  ctx.fillStyle = 'rgba(27,25,23,0.45)'
  ctx.fillText('由 SiteCraft · 个人官网生成器生成', left, H - 72)

  // 右侧：二维码或印记
  const cx = W - 88 - 100
  let qrDrawn = false
  if (url) {
    try {
      const QR = await import('qrcode')
      const qr = document.createElement('canvas')
      await QR.toCanvas(qr, url, { margin: 0, width: 200, color: { dark: INK, light: PAPER } })
      const qx = W - 88 - 200
      const qy = 150
      ctx.strokeStyle = 'rgba(27,25,23,0.2)'
      ctx.lineWidth = 1
      ctx.strokeRect(qx - 10.5, qy - 10.5, 221, 221)
      ctx.drawImage(qr, qx, qy, 200, 200)
      ctx.textAlign = 'center'
      ctx.font = `400 18px ${MONO}`
      ctx.fillStyle = 'rgba(27,25,23,0.5)'
      ctx.fillText('扫码访问', cx, qy + 244)
      ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(27,25,23,0.55)'
      let shown = url
      while (ctx.measureText(shown).width > 380 && shown.length > 8) shown = shown.slice(0, -1)
      ctx.fillText(shown === url ? url : `${shown}…`, W - left, H - 72)
      ctx.textAlign = 'left'
      qrDrawn = true
    } catch {
      // 二维码生成失败时退回印记，不阻塞下载
    }
  }
  if (!qrDrawn) {
    ctx.strokeStyle = accent
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, 255, 108, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, 255, 94, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.font = `700 64px ${SERIF}`
    ctx.fillText([...data.name][0] ?? 'S', cx, 277)
    ctx.font = `400 16px ${MONO}`
    ctx.fillStyle = 'rgba(27,25,23,0.5)'
    ctx.fillText('填入网址后显示二维码', cx, 400)
    ctx.textAlign = 'left'
  }

  return canvas
}

/** 触发 PNG 下载（Blob + 临时 <a download>） */
export function downloadShareCard(canvas: HTMLCanvasElement, siteName: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${safeFileName(siteName)}-分享卡.png`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
