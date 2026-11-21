/**
 * 艺术作品集数据契约：与开发人员 SiteData 平行，不复用技能/项目/履历语义。
 * Gallery 第一阶段只开放图片编辑，媒体类型预留给后续 Exhibition / Showreel。
 */
import type { SiteStatus, SiteTheme, SocialLinks } from './index'

export type ArtistTemplateName = 'gallery' | 'exhibition'
export type MediaType = 'image' | 'audio' | 'video'

export interface MediaItem {
  id: string
  type: MediaType
  url: string
  poster?: string
  title?: string
}

export interface Artwork {
  id: string
  title: string
  series: string
  year: string
  medium: string
  /** 尺寸，自由文本（"120 × 90 cm"、"可变尺寸"、"A2"），艺术评论第一眼看的就是它 */
  dimensions: string
  description: string
  cover: string
  media: MediaItem[]
  featured: boolean
}

/** 展览履历：艺术家的 CV，等价于开发者的仓库链接。role 用于区分个展/群展 */
export interface Exhibition {
  id: string
  year: string
  title: string
  venue: string
  role: string
}

export interface ArtistSiteRecord {
  id: string
  name: string
  template: ArtistTemplateName
  status: SiteStatus
  content: ArtistSiteData
  createdAt: string
  updatedAt: string
}

export interface ArtistSiteData {
  archetype: 'artist'
  name: string
  title: string
  bio: string
  avatar: string
  location: string
  email: string
  socials: SocialLinks
  theme: SiteTheme
  artworks: Artwork[]
  exhibitions: Exhibition[]
}
