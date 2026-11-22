import type { ArtistSiteData } from '@/types/artist'
import { ARTWORK_URI } from './artwork-uris'

/**
 * 艺术方向示例：文森特·梵高（1853–1890）。
 * 文字为史实（年代、尺寸、现藏地、展览），图像为六幅名作的矢量重绘（公有领域母题、自绘 SVG）。
 * 选他做示例的理由很直接：作品辨识度高，一眼能看出「这是一个作品集」而不是占位图。
 */
export const GALLERY_SAMPLE_DATA: ArtistSiteData = {
  archetype: 'artist',
  name: '文森特·梵高',
  title: '后印象派画家 · 1853–1890',
  bio: '1853 年生于荷兰津德尔特，1890 年在法国奥维尔去世。二十七岁转向绘画，此后十年留下约九百幅油画与近千件素描。他用厚涂与互补色记录麦田、夜空、卧室与劳作的人，生前几乎未被承认。',
  avatar: '/images/avatar-default.svg',
  location: '法国 · 阿尔勒',
  email: 'vincent@example.com',
  socials: { github: '', twitter: '', website: '', bilibili: '' },
  commissions: {
    open: false,
    scope: '作品现藏于梵高博物馆、MoMA、奥赛博物馆与盖蒂博物馆等公共收藏。',
    process: '',
    leadTime: '',
    priceFrom: '',
  },
  exhibitions: [
    { id: 'ex-1', year: '1890', title: '二十人展（Les XX）', venue: '布鲁塞尔', role: 'group' },
    {
      id: 'ex-2',
      year: '1905',
      title: '梵高回顾展',
      venue: '阿姆斯特丹市立博物馆',
      role: 'solo',
    },
    {
      id: 'ex-3',
      year: '2016',
      title: '梵高的卧室',
      venue: '芝加哥艺术博物馆',
      role: 'solo',
    },
  ],
  artworks: [
    {
      id: 'aw-starry',
      title: '星月夜',
      series: '圣雷米时期',
      year: '1889',
      medium: '布面油画',
      dimensions: '73.7 × 92.1 cm',
      description:
        '在圣雷米疗养院的窗前，他把夜里看到的柏树与星云画成漩涡。画面是想象的：只有柏树与远山来自窗外，村庄与教堂尖顶取自荷兰的记忆。',
      cover: ARTWORK_URI.starry,
      featured: true,
      media: [
        { id: 'md-starry-1', url: ARTWORK_URI.starry, title: '星月夜 · 全幅' },
        { id: 'md-starry-2', url: ARTWORK_URI.portrait, title: '同期作品 · 自画像' },
      ],
    },
    {
      id: 'aw-sunflowers',
      title: '向日葵',
      series: '阿尔勒时期',
      year: '1888',
      medium: '布面油画',
      dimensions: '92.1 × 73 cm',
      description:
        '为迎接高更到阿尔勒，他在南法的烈日里画了一整组向日葵。花从盛开到结籽，只用黄与赭两种颜色。',
      cover: ARTWORK_URI.sunflowers,
      featured: false,
      media: [{ id: 'md-sunflowers-1', url: ARTWORK_URI.sunflowers, title: '向日葵' }],
    },
    {
      id: 'aw-irises',
      title: '鸢尾花',
      series: '圣雷米时期',
      year: '1889',
      medium: '布面油画',
      dimensions: '74.3 × 94.3 cm',
      description:
        '疗养院花园的第一批画。他说这是「被空气与雨水冲洗过的蓝紫色」，节奏来自叶片的交叉线。',
      cover: ARTWORK_URI.irises,
      featured: false,
      media: [{ id: 'md-irises-1', url: ARTWORK_URI.irises, title: '鸢尾花' }],
    },
    {
      id: 'aw-bedroom',
      title: '阿尔勒的卧室',
      series: '阿尔勒时期',
      year: '1888',
      medium: '布面油画',
      dimensions: '72.4 × 91.4 cm',
      description:
        '他自己称之为「以颜色来休息」的房间：黄、蓝、绿三组平涂，透视刻意放松，为的是留出空白与睡意。',
      cover: ARTWORK_URI.bedroom,
      featured: false,
      media: [{ id: 'md-bedroom-1', url: ARTWORK_URI.bedroom, title: '阿尔勒的卧室' }],
    },
    {
      id: 'aw-wheatfield',
      title: '麦田群鸦',
      series: '奥维尔时期',
      year: '1890',
      medium: '布面油画',
      dimensions: '50.5 × 103 cm',
      description:
        '三条小路从前景分开，没有一条通往画面之外；群鸦从暗下来的天空掠过。常被当作他的最后一件作品，但这一说法没有证据。',
      cover: ARTWORK_URI.wheatfield,
      featured: false,
      media: [{ id: 'md-wheatfield-1', url: ARTWORK_URI.wheatfield, title: '麦田群鸦' }],
    },
    {
      id: 'aw-portrait',
      title: '自画像',
      series: '圣雷米时期',
      year: '1889',
      medium: '布面油画',
      dimensions: '65 × 54 cm',
      description:
        '四十余幅自画像中的一幅：背景的笔触方向与胡须、外套一体流动，像把人也放进了那场漩涡里。',
      cover: ARTWORK_URI.portrait,
      featured: false,
      media: [{ id: 'md-portrait-1', url: ARTWORK_URI.portrait, title: '自画像' }],
    },
  ],
  theme: { primaryColor: '#1f4e79' },
}

export function createGallerySampleData(): ArtistSiteData {
  return JSON.parse(JSON.stringify(GALLERY_SAMPLE_DATA)) as ArtistSiteData
}
