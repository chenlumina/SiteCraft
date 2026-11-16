/**
 * 产物安全边界：所有进入 HTML 的用户文本必须过 esc()，
 * 所有 URL 必须过 safeUrl() 协议白名单。生成器各模块共用，
 * 保证预览 / 导出 / 部署三条产物链路的防注入规则完全一致。
 */

// HTML 五字符转义表：& < > " ' 全部替换，杜绝文本逃逸出标签/属性
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** 文本转义：任何进入 HTML 的用户输入都必须先过这里 */
export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch])
}

/**
 * URL 白名单：只放行 http(s) 与站内 / 路径。
 *  javascript: / data: 等协议一律丢弃返回空串（调用方见空串即不渲染链接），
 *  防止「个人简介里填恶意链接」变成存储型 XSS。
 */
export function safeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) return esc(trimmed)
  if (trimmed.startsWith('/')) return esc(trimmed)
  return ''
}

/** 姓名首字母徽标（无头像时的占位），同样经过转义 */
export function monogram(name: string): string {
  const first = Array.from(name.trim())[0] ?? 'S'
  return esc(first.toUpperCase())
}