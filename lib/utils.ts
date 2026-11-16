/**
 * 通用纯工具函数（无 React / 无 DOM 依赖的除 downloadTextFile 外）。
 * 放在 lib/ 下以便服务端（API 路由、生成器）与客户端组件共用。
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className：clsx 负责条件拼接，twMerge 负责解决 Tailwind 冲突
 * （如同时传入 p-2 与 p-4 时后者胜出），避免样式互相覆盖的隐蔽 bug。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 生成列表项稳定 id：优先浏览器/Node 原生 UUID，旧环境降级为时间戳+随机数 */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

/** 把 #RRGGBB 拆成 r/g/b，供生成器计算光晕 rgba() 与对比前景色 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // 非法输入兜底为品牌紫，保证生成器永远不会产出坏 CSS
  const safe = isValidHexColor(hex) ? hex : '#7c6cff'
  return {
    r: parseInt(safe.slice(1, 3), 16),
    g: parseInt(safe.slice(3, 5), 16),
    b: parseInt(safe.slice(5, 7), 16),
  }
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function formatDateTime(iso: string | number): string {
  const date = typeof iso === 'number' ? new Date(iso) : new Date(iso)
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function safeFileName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '').slice(0, 60)
  return cleaned || 'my-site'
}

/**
 * 触发浏览器下载：Blob + 临时 <a download> 是零依赖的标准做法。
 * revokeObjectURL 延迟 4s 执行，确保下载已开始后再释放内存，避免大文件下载中断。
 */
export function downloadTextFile(fileName: string, text: string, mime = 'text/html') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/** 不可变地移动数组元素（拖拽排序 / 撤销恢复位置共用）：越界或原地移动时原样返回，避免无意义重渲染 */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}