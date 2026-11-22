/**
 * 按系列分组：只按 series 字符串原样分组，不引入「系列实体」（无封面、无系列说明）。
 * 理由：系列名是用户手打的，错字与空格会让分组碎掉；这里只 trim，不猜、不纠正。
 * 空系列统一归入「未归系列」，且永远排在最后。
 */
import type { Artwork } from '@/types/artist'

export interface SeriesGroup {
  series: string
  works: Artwork[]
}

export const UNGROUPED_LABEL = '未归系列'

export function groupBySeries(works: Artwork[]): SeriesGroup[] {
  const named = new Map<string, Artwork[]>()
  const ungrouped: Artwork[] = []
  for (const artwork of works) {
    const key = artwork.series.trim()
    if (!key) {
      ungrouped.push(artwork)
      continue
    }
    const list = named.get(key)
    if (list) list.push(artwork)
    else named.set(key, [artwork])
  }
  const groups: SeriesGroup[] = [...named.entries()].map(([series, list]) => ({
    series,
    works: list,
  }))
  if (ungrouped.length) groups.push({ series: UNGROUPED_LABEL, works: ungrouped })
  return groups
}
