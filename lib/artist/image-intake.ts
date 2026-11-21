/**
 * 图片接入策略：把用户选的文件变成可内联的图源。
 *
 * 为什么不直传服务器：导出契约要求产物是零依赖单文件，图必须内联进 HTML。
 * 所以这里做"进门前先压缩"——超过阈值的位图缩到 1600px 长边、按 webp 重编码，
 * 避免一张 4MB 的相机照片把导出的 HTML 撑到 5MB。
 *
 * 策略与压缩分开：planIntake 是纯函数（可单测），fileToDataUri 才碰 DOM。
 */

/** 单张原图上限：超过直接拒绝，避免浏览器端长时间卡死 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
/** 小于这个体积原样内联（保留原始格式与透明度） */
export const PASSTHROUGH_BYTES = 400 * 1024
/** 位图长边上限 */
export const MAX_DIMENSION = 1600
/** 重编码质量 */
export const TARGET_QUALITY = 0.82

export type IntakePlan =
  { action: 'keep' } | { action: 'downscale' } | { action: 'reject'; reason: string }

/** 纯策略：只根据类型与体积决定怎么处理，不做任何 IO */
export function planIntake(input: { size: number; type: string }): IntakePlan {
  if (!input.type || !input.type.startsWith('image/'))
    return { action: 'reject', reason: '只能上传图片文件' }
  if (input.size <= 0) return { action: 'reject', reason: '文件是空的' }
  if (input.size > MAX_UPLOAD_BYTES)
    return {
      action: 'reject',
      reason: '单张图片不能超过 ' + Math.round(MAX_UPLOAD_BYTES / 1024 / 1024) + 'MB',
    }
  // 矢量图无需缩放，直接内联
  if (input.type === 'image/svg+xml') return { action: 'keep' }
  if (input.size <= PASSTHROUGH_BYTES) return { action: 'keep' }
  return { action: 'downscale' }
}

export interface IntakeResult {
  uri: string
  bytes: number
  downscaled: boolean
  name: string
}

function readAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

async function shrinkToDataUri(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('浏览器不支持画布压缩')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  // webp 体积最优；不支持的浏览器会自动回退成 png
  const uri = canvas.toDataURL('image/webp', TARGET_QUALITY)
  return uri.startsWith('data:image/webp') ? uri : canvas.toDataURL('image/png')
}

/** 按策略把文件变成 data URI（浏览器环境） */
export async function fileToDataUri(file: File): Promise<IntakeResult> {
  const plan = planIntake({ size: file.size, type: file.type })
  if (plan.action === 'reject') throw new Error(plan.reason)
  const name = file.name.replace(/\.[^.]+$/, '') || '未命名'
  if (plan.action === 'keep') {
    const uri = await readAsDataUri(file)
    return { uri, bytes: uri.length, downscaled: false, name }
  }
  try {
    const uri = await shrinkToDataUri(file)
    return { uri, bytes: uri.length, downscaled: true, name }
  } catch {
    // 压缩失败（浏览器不支持 createImageBitmap / 画布被禁用）时退回原图，
    // 宁可用量大一点的图，也不能让用户传不上去。
    const uri = await readAsDataUri(file)
    return { uri, bytes: uri.length, downscaled: false, name }
  }
}

/** 给界面看的体积描述 */
export function formatBytes(n: number): string {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB'
  return (n / 1024 / 1024).toFixed(1) + ' MB'
}
