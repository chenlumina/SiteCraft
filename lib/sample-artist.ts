/**
 * 艺术创作方向示例：与技术人共用 SiteData 骨架，内容语义换成
 * 创作媒介、作品系列与创作历程。仅作新建草稿，不代表任何真实人物。
 */
import type { SiteData } from '@/types'

export const ARTIST_SAMPLE_SITE_DATA: SiteData = {
  archetype: 'artist',
  name: '林墨',
  title: '独立插画师 · 视觉创作者',
  status: '开放商业插画合作 · 2027 春季档期',
  bio: '以水彩、综合材料与数字绘画记录城市日常，关注建筑、植物和人的微小情绪。作品涵盖独立出版、编辑插画与展览视觉，持续整理每个系列背后的草图和创作过程。',
  avatar: '/images/avatar-default.svg',
  location: '浙江 · 杭州',
  email: 'artist@example.com',
  socials: {
    github: '',
    twitter: '',
    website: '',
    bilibili: '',
  },
  skills: [
    { id: 'sk-watercolor', name: '水彩与综合材料', level: 60 },
    { id: 'sk-digital', name: '数字插画', level: 60 },
    { id: 'sk-editorial', name: '编辑与版式设计', level: 60 },
    { id: 'sk-motion', name: '动态海报', level: 60 },
    { id: 'sk-photo', name: '摄影与图像记录', level: 60 },
  ],
  projects: [
    {
      id: 'pr-city',
      name: '《城市呼吸》插画系列',
      description: '以通勤途中的建筑间隙、窗光与植物为主题的一组水彩和数字绘画。',
      points: [
        '包含 24 幅完整作品与过程草图',
        '记录从现场速写到数字完稿的过程',
        '部分作品用于独立出版物内页',
      ],
      tags: ['插画', '水彩', '城市观察'],
      link: '',
      repo: '',
      highlight: true,
    },
    {
      id: 'pr-zine',
      name: '独立杂志《附近》视觉设计',
      description: '为一期关于街区生活的独立杂志完成封面、栏目插画与内页视觉规范。',
      points: ['建立整期色彩与插图语言', '封面与 12 幅栏目插画'],
      tags: ['独立出版', '版式', '编辑插画'],
      link: '',
      repo: '',
      highlight: true,
    },
    {
      id: 'pr-poster',
      name: '草地音乐会动态海报',
      description: '把手绘植物元素转译为轻量动态图形，用于演出预告与现场屏幕。',
      tags: ['动态设计', '海报', '活动视觉'],
      link: '',
      repo: '',
      highlight: false,
    },
  ],
  experience: [
    {
      id: 'ex-independent',
      role: '独立插画与视觉创作',
      organization: '个人工作室',
      period: '2024.06 - 至今',
      description: '持续进行个人系列创作，并与独立出版、文化活动合作完成视觉内容。',
      points: ['完成三个长期个人作品系列', '合作覆盖出版与活动视觉'],
    },
    {
      id: 'ex-residency',
      role: '驻留创作者',
      organization: '地方艺术空间',
      period: '2025.09 - 2025.11',
      description: '围绕街区步行与植物观察开展驻留创作，以开放工作室分享草图与过程。',
    },
  ],
  theme: {
    primaryColor: '#ec4899',
  },
}

/** 深拷贝，避免不同站点或预览共享数组引用 */
export function createArtistSampleData(): SiteData {
  return JSON.parse(JSON.stringify(ARTIST_SAMPLE_SITE_DATA)) as SiteData
}
