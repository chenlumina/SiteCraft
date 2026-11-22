/**
 * 艺术版式的共享零件：封面解析、说明行、展览履历、合作条目。
 * 七套艺术版式共用这些函数，保证「同一份数据、同一套安全边界」，差异只在结构与排版。
 */
import type { ArtistSiteData, Artwork } from '@/types/artist'
import { esc } from '../escape'
import { safeImageSource } from './gallery'

export const ROLE_LABEL: Record<string, string> = { solo: '个展', group: '群展', other: '其他' }

export function coverOf(artwork: Artwork): string {
  const first = artwork.media[0]?.url ?? ''
  return safeImageSource(artwork.cover) || safeImageSource(first) || ''
}

export function metaLine(artwork: Artwork): string {
  const meta = [artwork.medium.trim(), artwork.dimensions.trim()].filter(Boolean).join(' · ')
  return [meta, artwork.year].filter(Boolean).join(' · ')
}

/** 作品按策展顺序：重点作品在前，其余保持用户顺序 */
export function curated(artworks: Artwork[]): Artwork[] {
  return [...artworks].sort((a, b) => Number(b.featured) - Number(a.featured))
}

/** 展览履历条目：只输出有标题的，按年份倒序 */
export function cvItems(data: ArtistSiteData): string[] {
  return (data.exhibitions ?? [])
    .filter((item) => item.title.trim())
    .sort((a, b) => (b.year || '').localeCompare(a.year || ''))
    .map(
      (item) =>
        '<li><span class="cv-year">' +
        esc(item.year || '—') +
        '</span>' +
        '<span class="cv-role">' +
        esc(ROLE_LABEL[item.role] ?? '') +
        '</span>' +
        '<span class="cv-show">' +
        esc(item.title) +
        (item.venue ? '，' + esc(item.venue) : '') +
        '</span></li>'
    )
}

/** 合作条目：[标签, 值] */
export function commissionRows(data: ArtistSiteData): string[][] {
  const cm = data.commissions
  if (!cm) return []
  const rows: Array<[string, string]> = [
    ['范围', cm.scope.trim()],
    ['流程', cm.process.trim()],
    ['档期', cm.leadTime.trim()],
    ['起价', cm.priceFrom.trim()],
  ]
  return rows.filter(([, v]) => v !== '').map(([k, v]) => [k, v])
}

/** 合作条目列表（样式由各模板决定） */
export function commissionList(data: ArtistSiteData, prefix: string): string {
  const rows = commissionRows(data)
  if (rows.length === 0) return ''
  const items = rows
    .map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>')
    .join('')
  return '<dl class="' + prefix + '-cm-list">' + items + '</dl>'
}

export function commissionState(data: ArtistSiteData, prefix: string): string {
  return data.commissions?.open
    ? '<p class="' +
        prefix +
        '-cm-state"><span class="' +
        prefix +
        '-dot" aria-hidden="true"></span>目前接单中</p>'
    : '<p class="' + prefix + '-cm-state">暂不接单，仍欢迎来信交流</p>'
}

export function mailLink(data: ArtistSiteData, className: string): string {
  const mail = data.email.trim()
  if (!mail) return ''
  return (
    '<a class="' +
    className +
    '" href="mailto:' +
    esc(mail) +
    '?subject=' +
    encodeURIComponent('合作咨询') +
    '">来信谈合作 →</a>'
  )
}
