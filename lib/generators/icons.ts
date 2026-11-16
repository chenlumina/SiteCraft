/**
 * 内联 SVG 图标与社交链接渲染。图标不引外部字体/CDN，
 * 保证导出的单文件 HTML 离线打开图标也不缺失。
 */
import type { SiteData } from '@/types'
import { safeUrl } from './escape'

// 内联 SVG 图标路径（lucide 风格描边 + 品牌实心）
const ICON_PATHS = {
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  arrowDown: '<path d="M12 5v14m-7-7 7 7 7-7"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  github:
    '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  x: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  bilibili:
    '<path d="m7 3 3 3m7-3-3 3"/><rect x="2" y="6" width="20" height="15" rx="3"/><path d="M9 11v3m6-3v3"/>',
} as const

export type IconName = keyof typeof ICON_PATHS

export function icon(name: IconName): string {
  const filled = name === 'github' || name === 'x'
  return `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="${
    filled ? 'none' : 'currentColor'
  }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`
}

const SOCIAL_DEFS: { key: keyof SiteData['socials']; label: string; icon: IconName }[] = [
  { key: 'github', label: 'GitHub', icon: 'github' },
  { key: 'twitter', label: 'X / Twitter', icon: 'x' },
  { key: 'website', label: '个人网站', icon: 'globe' },
  { key: 'bilibili', label: '哔哩哔哩', icon: 'bilibili' },
]

export function socialLinks(data: SiteData, className: string): string {
  const items = SOCIAL_DEFS.map(({ key, label, icon: iconName }) => {
    const url = safeUrl(data.socials[key])
    if (!url) return ''
    return `<a class="${className}" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${icon(iconName)}</a>`
  }).join('')
  return items ? `<div class="s-socials">${items}</div>` : ''
}