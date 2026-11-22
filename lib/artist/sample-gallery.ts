import type { ArtistSiteData } from '@/types/artist'
import { ARTWORK_URI } from './artwork-uris'

/** Gallery 示例：内置 SVG 走站内路径，导出时可在后续流程内联为 data URI */
export const GALLERY_SAMPLE_DATA: ArtistSiteData = {
  archetype: 'artist',
  name: '林墨',
  title: '独立插画师 · 视觉创作者',
  bio: '以水彩、综合材料与数字绘画记录城市日常，关注建筑、植物和人的微小情绪。',
  avatar: '/images/avatar-default.svg',
  location: '浙江 · 杭州',
  email: 'artist@example.com',
  socials: { github: '', twitter: '', website: '', bilibili: '' },
  exhibitions: [
    { id: 'ex-1', year: '2025', title: '城市呼吸', venue: '拾光画廊', role: 'solo' },
    {
      id: 'ex-2',
      year: '2024',
      title: '纸上城市 · 青年插画联展',
      venue: '市立美术馆',
      role: 'group',
    },
    { id: 'ex-3', year: '2023', title: '植物的间隙', venue: '独立艺术书展', role: 'group' },
  ],
  artworks: [
    {
      id: 'aw-city',
      title: '城市呼吸 No.04',
      series: '城市呼吸',
      year: '2026',
      medium: '水彩、数字拼贴',
      dimensions: '120 × 90 cm',
      description: '把通勤途中那些没有被注意的窗光、墙角与天空，重新拼成一座会呼吸的城市。',
      cover: ARTWORK_URI.city,
      featured: true,
      media: [
        { id: 'md-city-1', url: ARTWORK_URI.city, title: '城市呼吸 No.04 · 完稿' },
        {
          id: 'md-city-2',
          url: ARTWORK_URI.botanical,
          title: '系列延伸 · 植物的间隙',
        },
      ],
    },
    {
      id: 'aw-botanical',
      title: '植物的间隙',
      series: '附近',
      year: '2026',
      medium: '综合材料',
      dimensions: '90 × 60 cm',
      description: '从叶片之间观看日常。遮挡不是阻碍，而是让视线找到另一条路径。',
      cover: ARTWORK_URI.botanical,
      featured: false,
      media: [{ id: 'md-botanical-1', url: ARTWORK_URI.botanical, title: '植物的间隙' }],
    },
    {
      id: 'aw-tram',
      title: '夜班电车',
      series: '城市呼吸',
      year: '2025',
      medium: '数字绘画',
      dimensions: '160 × 110 cm',
      description: '车窗把陌生人的片段连成电影，城市在每个站点短暂地换了一次字幕。',
      cover: ARTWORK_URI.tram,
      featured: false,
      media: [{ id: 'md-tram-1', url: ARTWORK_URI.tram, title: '夜班电车' }],
    },
    {
      id: 'aw-garden',
      title: '无声花园',
      series: '柔软标本',
      year: '2025',
      medium: '丙烯、纸面',
      dimensions: '直径 80 cm',
      description: '一组关于生长速度的标本：有些花在开放，有些颜色正在退场。',
      cover: ARTWORK_URI.garden,
      featured: false,
      media: [{ id: 'md-garden-1', url: ARTWORK_URI.garden, title: '无声花园' }],
    },
  ],
  theme: { primaryColor: '#9e2b25' },
}

export function createGallerySampleData(): ArtistSiteData {
  return JSON.parse(JSON.stringify(GALLERY_SAMPLE_DATA)) as ArtistSiteData
}
