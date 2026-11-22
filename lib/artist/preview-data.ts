import type { ArtistSiteData } from '@/types/artist'
import { createGallerySampleData } from './sample-gallery'

export interface PreviewOverrides {
  name?: string
  title?: string
  location?: string
}

/**
 * 艺术方向的「预览数据」唯一来源。
 * 版式展区、试玩区、编辑器初值都必须走这里，否则同一套版式在三个入口
 * 会显示不同的人名和内容——这正是之前出现的问题。
 * 覆盖值只取非空项，空串视为「用示例默认值」。
 */
export function buildArtistPreviewData(overrides: PreviewOverrides = {}): ArtistSiteData {
  const base = createGallerySampleData()
  const name = overrides.name?.trim()
  const title = overrides.title?.trim()
  const location = overrides.location?.trim()
  return {
    ...base,
    name: name || base.name,
    title: title || base.title,
    location: location || base.location,
  }
}
