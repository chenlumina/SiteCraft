/**
 * 数据库种子（pnpm db:seed）：幂等写入默认用户 + 十二套模板 + 两个示例站点。
 * 全部用 upsert：重复执行不会报错也不会产生重复数据（CI/新环境可放心重跑）。
 * 示例站点让首页「我的站点」首屏即有可信记录，而非空状态。
 * 注意：本脚本由 tsx 直接运行（不经过 Next），故用相对路径 import，
 * 不依赖 Next 的 @/ 别名解析链。
 */
import { PrismaClient } from '@prisma/client'
import { TEMPLATES } from '../lib/templates'
import { SAMPLE_SITE_DATA } from '../lib/sample-data'
import type { SiteData } from '../types'

const prisma = new PrismaClient()

const DEFAULT_USER_ID = 'local-user'

async function main() {
  await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID, email: 'demo@sitecraft.local', name: '本地用户' },
  })

  for (const template of TEMPLATES) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: {
        displayName: template.displayName,
        description: template.description,
        config: JSON.stringify(template),
      },
      create: {
        name: template.name,
        displayName: template.displayName,
        description: template.description,
        config: JSON.stringify(template),
        isDefault: template.name === 'minimal',
      },
    })
  }

  // 示例站点 1：tech 模板 + 已发布状态，展示深色终端风与发布徽章
  const techData: SiteData = {
    ...SAMPLE_SITE_DATA,
    theme: { primaryColor: '#22d3ee' },
  }
  await prisma.site.upsert({
    where: { id: 'seed-site-tech' },
    // update 必须带上内容：写成 {} 的话重跑种子永远不会刷新示例数据，
    // 改一次示例文案就得手动清库（这正是示例姓名残留的原因）
    update: {
      name: 'Lead 的个人主页',
      template: 'tech',
      content: JSON.stringify(techData),
      status: 'published',
    },
    create: {
      id: 'seed-site-tech',
      name: 'Lead 的个人主页',
      template: 'tech',
      content: JSON.stringify(techData),
      status: 'published',
      userId: DEFAULT_USER_ID,
    },
  })

  // 示例站点 2：professional 模板 + 草稿状态，展示简历风与草稿徽章；
  // 项目只取前三条，演示「同一份数据在不同模板/裁剪下的呈现」
  const proData: SiteData = {
    ...SAMPLE_SITE_DATA,
    title: '求职简历 · 计算机科学与技术',
    status: '开放实习与合作机会',
    theme: { primaryColor: '#2563eb' },
    projects: SAMPLE_SITE_DATA.projects.slice(0, 3),
  }
  await prisma.site.upsert({
    where: { id: 'seed-site-pro' },
    update: {
      name: '求职简历站',
      template: 'professional',
      content: JSON.stringify(proData),
      status: 'draft',
    },
    create: {
      id: 'seed-site-pro',
      name: '求职简历站',
      template: 'professional',
      content: JSON.stringify(proData),
      status: 'draft',
      userId: DEFAULT_USER_ID,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    process.stderr.write(`${String(error)}\n`)
    await prisma.$disconnect()
    process.exit(1)
  })
