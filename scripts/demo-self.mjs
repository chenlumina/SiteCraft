// 临时演示：用项目生成器把「千问工作助理」的公开身份信息填进极简模板。
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { generateSiteHTML } from '../lib/generators/html-generator'

const data = {
  name: '千问工作助理',
  title: '电脑端 AI 办公助手 · 阿里巴巴',
  bio: '我是千问工作助理，由阿里巴巴打造的电脑端 AI 助手。我能在你的电脑上帮你读写文件、调研整理信息、处理 Word/Excel/PPT/PDF、写代码排查问题，还能设置定时提醒。我的目标很简单：真正帮你把事办成，而不是表演。',
  location: '你的电脑 · 本地运行',
  email: '',
  avatar: '/images/avatar-default.svg',
  status: '随时待命',
  socials: { github: '', twitter: '', website: '', bilibili: '' },
  theme: { primaryColor: '#615ced' },
  skills: [
    { name: '本地文件读写与整理', level: 95 },
    { name: '调研与信息整理', level: 90 },
    { name: 'Office 文档处理', level: 92 },
    { name: '内容创作', level: 88 },
    { name: '编程与问题排查', level: 90 },
    { name: '定时提醒', level: 85 },
  ],
  projects: [
    {
      name: 'Office 文档流水线',
      description: '把零散资料整理成排版规范的 Word 报告、数据清晰的 Excel 表格和可直接演示的 PPT。',
      tags: ['Word', 'Excel', 'PPT', 'PDF'],
      link: '',
      repo: '',
      highlight: true,
    },
    {
      name: '深度调研报告',
      description: '多源检索、交叉核验、标注来源，产出一份结构完整、结论有据的研究报告。',
      tags: ['多源调研', '来源核验', '报告'],
      link: '',
      repo: '',
      highlight: false,
    },
    {
      name: '代码整洁化重构',
      description: '拆分上帝文件、统一重复逻辑、补齐测试，用黄金快照保证重构前后行为逐字节一致。',
      tags: ['重构', '测试', 'TypeScript'],
      link: '',
      repo: '',
      highlight: false,
    },
  ],
  experience: [
    {
      period: '现在',
      role: '电脑端办公 AI 助手',
      organization: '阿里巴巴 · 千问',
      description: '在用户授权的范围内操作本地文件与工具，把办公任务真正落地完成。',
    },
    {
      period: '持续',
      role: '迭代升级中',
      organization: '千问团队',
      description: '能力持续迭代，越来越好用。',
    },
  ],
}

const html = generateSiteHTML(data, 'minimal')
const outDir = path.resolve('demo')
mkdirSync(outDir, { recursive: true })
const outFile = path.join(outDir, '千问工作助理-极简模板.html')
writeFileSync(outFile, html, 'utf-8')
process.stdout.write('written: ' + outFile + ' (' + html.length + ' chars)\n')