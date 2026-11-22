/**
 * 艺术作品集数据契约：与开发人员 SiteData 平行，不复用技能/项目/履历语义。
 * 媒体只支持图片：音视频已在产品层放弃（导出单文件容不下，外链又违背零依赖契约）。
 */
import type { SiteStatus, SiteTheme, SocialLinks } from './index'

export type ArtistTemplateName = 'gallery' | 'exhibition'
/* 媒体只支持图片：音视频已在产品层放弃（导出单文件无法容纳，外链又会破坏零依赖契约） */

export interface MediaItem {
  id: string
  url: string
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

/**
 * 合作/约稿：艺术家对外的"接活"信息。
 * 不做价目表和结算——一旦有购物车，这就不是个人站生成器了，
 * 所以报价只留一句"起价"，具体靠邮件谈。
 */
export interface Commissions {
  /** 当前是否接单：false 时页面显示"暂不接单"，其余字段仍展示给人看 */
  open: boolean
  /** 接单范围 */
  scope: string
  /** 合作流程 */
  process: string
  /** 档期 / 周期 */
  leadTime: string
  /** 报价起点（自由文本） */
  priceFrom: string
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
  commissions: Commissions
}
