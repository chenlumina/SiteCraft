/**
 * 示例站点内容：新建站点时预填（保证首屏不是空白表单），也供首页橱窗 /
 * 模板画廊缩略图与数据库种子复用。人物与项目为可信的示例文案，用户可直接改写。
 */
import type { SiteData } from '@/types'

export const SAMPLE_SITE_DATA: SiteData = {
  // 开发世界数据显式声明方向；旧数据库/旧快照缺省时仍由 getArchetype 回退技术人
  archetype: 'developer',
  name: 'Lead',
  title: '全栈开发学习者 · Java / Web',
  status: '正在寻找 2027 届实习机会',
  bio: '计算机科学与技术专业在读，专注 Java Web 与前端工程化。喜欢把课程项目打磨成真正能上线的产品，相信「做出来」比「想出来」更有说服力。',
  avatar: '/images/avatar-default.svg',
  location: '湖北 · 武汉',
  email: 'lead@example.com',
  socials: {
    github: 'https://github.com',
    twitter: '',
    website: '',
    bilibili: 'https://www.bilibili.com',
  },
  skills: [
    { id: 'sk-java', name: 'Java', level: 85 },
    { id: 'sk-spring', name: 'Spring Boot', level: 75 },
    { id: 'sk-mysql', name: 'MySQL', level: 72 },
    { id: 'sk-html', name: 'HTML / CSS', level: 82 },
    { id: 'sk-js', name: 'JavaScript', level: 74 },
    { id: 'sk-vue', name: 'Vue 3', level: 65 },
    { id: 'sk-next', name: 'Next.js', level: 62 },
    { id: 'sk-linux', name: 'Linux', level: 68 },
  ],
  projects: [
    {
      id: 'pr-music',
      name: '音乐网站 music-web',
      description:
        '基于 Jakarta EE 的个人音乐站点：歌曲上传、在线播放、歌单管理与评论互动，外置 Tomcat 10 部署。',
      points: [
        '300+ 首曲目上传后并发播放不卡顿',
        '手写 JDBC 连接池，QPS 提升约 3 倍',
        '外置 Tomcat 10 完成课程答辩部署',
      ],
      tags: ['Java', 'Jakarta EE', 'Tomcat', 'MySQL'],
      link: '',
      repo: '',
      highlight: true,
    },
    {
      id: 'pr-classroom',
      name: '教室预约系统',
      description:
        'Java Web 课程设计：教室查询、时段预约、审批管理与冲突检测，含完整 UI 规范文档。',
      tags: ['Servlet', 'JSP', 'MySQL'],
      link: '',
      repo: '',
      highlight: false,
    },
    {
      id: 'pr-builder',
      name: '个人官网生成器',
      description:
        'Next.js 14 全栈应用：可视化编辑、十三套模板、实时预览，一键导出静态 HTML 并部署到 GitHub Pages。',
      points: ['13 套版式共用一份渲染器，导出零依赖单文件', '210 项版面断言纳入 CI，回归当场拦下'],
      tags: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind'],
      link: '',
      repo: '',
      highlight: true,
    },
    {
      id: 'pr-oslab',
      name: '操作系统实验笔记',
      description: 'Linux 0.11 内核实验记录：系统启动、系统调用与信号量应用的完整实现与实验报告。',
      tags: ['C', 'Assembly', 'Linux'],
      link: '',
      repo: '',
      highlight: false,
    },
  ],
  experience: [
    {
      id: 'ex-bsc',
      role: '本科生 · 计算机科学与技术',
      organization: '计算机学院',
      period: '2024.09 - 至今',
      description:
        '主修 JavaEE、操作系统、数据库原理；独立完成多个课程项目的全流程开发，从需求分析到部署上线。',
      points: [
        '专业课均分 88 / 100',
        '独立完成 4 个课程项目并全部部署上线',
        '担任课程设计小组负责人',
      ],
    },
    {
      id: 'ex-indie',
      role: '独立开发者',
      organization: '个人项目',
      period: '2025.03 - 至今',
      description:
        '课余持续交付个人项目，实践前后端分离、数据库设计与 Linux 运维，积累工程化经验。',
    },
  ],
  theme: {
    primaryColor: '#22d3ee',
  },
}

/**
 * 深拷贝一份示例数据。必须拷贝：skills/projects 等是数组引用，
 * 若多个站点共享同一份对象，编辑 A 站会串改 B 站与首页缩略图。
 */
export function createSampleData(): SiteData {
  return JSON.parse(JSON.stringify(SAMPLE_SITE_DATA)) as SiteData
}
/** 历史示例身份：v1 起示例站点用的假人，v2 换成 Lead。仅用于一次性迁移判定 */
export const LEGACY_SAMPLE = { name: '张亮', email: 'zhangliang@example.com' } as const

/**
 * 逐字段把旧示例身份换成当前示例身份。
 * 必须逐字段判断而不是整体判断：用户可能只改了名字、留着示例邮箱，
 * 整体判断会把人家填的名字一起冲掉（这是动手前先写测试才发现的坑）。
 */
export function migrateLegacySample<T extends { name: string; email: string }>(data: T): T {
  const next = { ...data }
  if (data.name === LEGACY_SAMPLE.name) next.name = SAMPLE_SITE_DATA.name
  if (data.email === LEGACY_SAMPLE.email) next.email = SAMPLE_SITE_DATA.email
  return next
}
