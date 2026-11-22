/**
 * 艺术创作方向示例（SiteData 骨架版）：与技术人共用同一套字段，
 * 内容换成绘画的媒介、系列与创作历程。示例人物为文森特·梵高（1853–1890），
 * 史实到年代、地点与作品名，叙述为本产品整理的示例文案。
 */
import type { SiteData } from '@/types'

export const ARTIST_SAMPLE_SITE_DATA: SiteData = {
  archetype: 'artist',
  name: '文森特·梵高',
  title: '后印象派画家 · 1853–1890',
  status: '作品现藏于梵高博物馆、MoMA 与奥赛博物馆 · 公共收藏',
  bio: '1853 年生于荷兰津德尔特，1890 年在法国奥维尔去世。二十七岁转向绘画，此后十年留下约九百幅油画与近千件素描，用厚涂与互补色记录麦田、夜空、卧室与劳作的人。',
  avatar: '/images/avatar-default.svg',
  location: '法国 · 阿尔勒',
  email: 'vincent@example.com',
  socials: {
    github: '',
    twitter: '',
    website: '',
    bilibili: '',
  },
  skills: [
    { id: 'sk-oil', name: '油画厚涂', level: 92 },
    { id: 'sk-color', name: '互补色研究', level: 88 },
    { id: 'sk-drawing', name: '素描与速写', level: 80 },
    { id: 'sk-letter', name: '书信与文稿', level: 74 },
    { id: 'sk-print', name: '版画与临摹', level: 62 },
  ],
  projects: [
    {
      id: 'pr-sunflowers',
      name: '《向日葵》系列',
      description:
        '1888 年阿尔勒，为迎接高更到来而画的一组静物，只用黄与赭两种颜色推演盛开到结籽。',
      points: ['共五幅，分藏伦敦国家美术馆、梵高博物馆等处', '实验同色系内的明度与笔触差异'],
      tags: ['油画', '静物', '阿尔勒'],
      link: '',
      repo: '',
      highlight: true,
    },
    {
      id: 'pr-bedroom',
      name: '《阿尔勒的卧室》',
      description: '以黄、蓝、绿三组平涂构成的房间，透视刻意放松，他称之为「以颜色来休息」。',
      points: ['共三个版本，分藏梵高博物馆与芝加哥艺术博物馆', '平涂与放松透视的自觉选择'],
      tags: ['油画', '室内', '色彩实验'],
      link: '',
      repo: '',
      highlight: true,
    },
    {
      id: 'pr-wheatfield',
      name: '《麦田群鸦》',
      description: '奥维尔时期横幅构图：三条小路从前景分开，群鸦掠过暗下来的天空。',
      tags: ['油画', '风景', '奥维尔'],
      link: '',
      repo: '',
      highlight: true,
    },
  ],
  experience: [
    {
      id: 'ex-arles',
      role: '绘画创作',
      organization: '阿尔勒（黄房子）',
      period: '1888.02 - 1889.05',
      description: '南法时期的高产阶段：向日葵、卧室、夜间咖啡馆与罗纳河夜景均完成于此。',
      points: ['完成《向日葵》与《阿尔勒的卧室》', '与高更短期共同工作，随后关系破裂'],
    },
    {
      id: 'ex-saintremy',
      role: '疗养与创作',
      organization: '圣雷米圣保罗疗养院',
      period: '1889.05 - 1890.05',
      description: '在疗养院期间以花园、柏树与夜空为题材，完成《星月夜》《鸢尾花》等作品。',
      points: ['一年内完成约一百五十幅油画', '以记忆与想象重构窗外风景'],
    },
    {
      id: 'ex-auvers',
      role: '最后阶段',
      organization: '奥维尔',
      period: '1890.05 - 1890.07',
      description: '在加歇医生处接受照看，持续以麦田、教堂与肖像为题材作画。',
    },
  ],
  theme: {
    primaryColor: '#1f4e79',
  },
}

/** 深拷贝，避免不同站点或预览共享数组引用 */
export function createArtistSampleData(): SiteData {
  return JSON.parse(JSON.stringify(ARTIST_SAMPLE_SITE_DATA)) as SiteData
}
