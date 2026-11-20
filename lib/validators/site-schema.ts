/**
 * Zod 校验器「单一来源」（规范 9：所有用户输入必须用 Zod 验证）。
 * 同一份 schema 既给前端 React Hook Form 做即时校验（zodResolver），
 * 也给后端 API 路由做边界校验（parse），保证两端规则永不漂移。
 * 上限常量（MAX_*）同时被编辑器 UI 用来禁用「添加」按钮。
 */
import { z } from 'zod'

export const MAX_SKILL_COUNT = 24
export const MAX_PROJECT_COUNT = 16
export const MAX_EXPERIENCE_COUNT = 12
export const MAX_TAG_COUNT = 6
export const MAX_POINT_COUNT = 3
export const MAX_POINT_LEN = 60

// 不用 z.string().url()：它拒绝空串，而社交链接「留空=不展示」是合法状态；
// 这里用 refine 实现「空串 或 合法 http(s)」，并顺带限制长度防滥用。
const httpUrl = z
  .string()
  .trim()
  .max(2048, '链接过长')
  .refine((v) => v === '' || /^https?:\/\/[^\s]+$/i.test(v), '请输入合法的 http(s) 链接')

// 头像额外允许 / 开头的站内路径（如内置 /images/avatar-default.svg）；
// 导出单文件时这类相对路径会被内联为 data URI（见 use-site-actions / deploy 路由）。
const avatarUrl = z
  .string()
  .trim()
  .max(2048, '链接过长')
  .refine(
    (v) => v === '' || /^https?:\/\/[^\s]+$/i.test(v) || v.startsWith('/'),
    '请输入 http(s) 链接或以 / 开头的本地路径'
  )

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, '颜色需为 #RRGGBB 格式')

export const socialsSchema = z.object({
  github: httpUrl,
  twitter: httpUrl,
  website: httpUrl,
  bilibili: httpUrl,
})

export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, '技能名称不能为空').max(24, '技能名称最多 24 字'),
  level: z.number().int().min(0).max(100),
})

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, '项目名称不能为空').max(40, '项目名称最多 40 字'),
  description: z.string().trim().max(300, '项目描述最多 300 字'),
  points: z
    .array(z.string().trim().max(60, '单条要点最多 60 字'))
    .max(3, '最多 3 条要点')
    .default([]),
  tags: z
    .array(z.string().trim().min(1).max(16, '标签最多 16 字'))
    .max(MAX_TAG_COUNT, `最多 ${MAX_TAG_COUNT} 个标签`),
  link: httpUrl,
  repo: httpUrl,
  highlight: z.boolean(),
})

export const experienceSchema = z.object({
  id: z.string().min(1),
  role: z.string().trim().min(1, '角色不能为空').max(40, '角色最多 40 字'),
  organization: z.string().trim().min(1, '组织不能为空').max(40, '组织最多 40 字'),
  period: z.string().trim().min(1, '时间段不能为空').max(30, '时间段最多 30 字'),
  description: z.string().trim().max(300, '描述最多 300 字'),
  points: z
    .array(z.string().trim().max(60, '单条职责最多 60 字'))
    .max(3, '最多 3 条职责')
    .default([]),
})

export const siteDataSchema = z.object({
  name: z.string().trim().min(1, '姓名不能为空').max(30, '姓名最多 30 字'),
  title: z.string().trim().min(1, '头衔不能为空').max(60, '头衔最多 60 字'),
  status: z.string().trim().max(40, '状态最多 40 字'),
  bio: z.string().trim().max(600, '简介最多 600 字'),
  avatar: avatarUrl,
  location: z.string().trim().max(40, '地点最多 40 字'),
  email: z.union([z.literal(''), z.string().trim().email('邮箱格式不正确')]),
  socials: socialsSchema,
  skills: z.array(skillSchema).max(MAX_SKILL_COUNT, `最多 ${MAX_SKILL_COUNT} 项技能`),
  projects: z.array(projectSchema).max(MAX_PROJECT_COUNT, `最多 ${MAX_PROJECT_COUNT} 个项目`),
  experience: z
    .array(experienceSchema)
    .max(MAX_EXPERIENCE_COUNT, `最多 ${MAX_EXPERIENCE_COUNT} 段经历`),
  theme: z.object({ primaryColor: hexColor }),
})

/** 资料区子集：编辑器「资料」Tab 的 RHF 表单只校验这些字段，避免整份 SiteData 参与表单状态 */
export const basicInfoSchema = siteDataSchema.pick({
  name: true,
  title: true,
  status: true,
  bio: true,
  avatar: true,
  location: true,
  email: true,
  socials: true,
})

export type BasicInfoValues = z.infer<typeof basicInfoSchema>

export const templateNameSchema = z.enum([
  'minimal',
  'tech',
  'creative',
  'professional',
  'ink',
  'brutal',
  'aurora',
  'editorial',
  'gold',
  'vapor',
  'swiss',
  'kraft',
  'metro',
])

export const siteStatusSchema = z.enum(['draft', 'published'])

/** POST /api/save：带 id 为更新、不带 id 为新建（upsert 语义，见路由实现） */
export const saveSiteSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, '站点名称不能为空').max(60, '站点名称最多 60 字'),
  template: templateNameSchema,
  content: siteDataSchema,
  status: siteStatusSchema.optional(),
})

/** PUT /api/sites/:id：全部字段可选的补丁式更新（如只改 status 发布/草稿） */
export const updateSiteSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    template: templateNameSchema,
    content: siteDataSchema,
    status: siteStatusSchema,
  })
  .partial()

/**
 * 仓库名规则单一来源：限制为 GitHub 合法字符，防止注入 API URL 路径。
 * 后端 deploySchema 与前端部署对话框共用这一份，改规则只需改这里。
 */
export const repoNameSchema = z
  .string()
  .trim()
  .min(1, '仓库名不能为空')
  .max(100, '仓库名最多 100 字符')
  .regex(/^[A-Za-z0-9._-]+$/, '仓库名仅允许字母、数字、. _ -')

/** POST /api/deploy：仓库名限制见 repoNameSchema */
export const deploySchema = z.object({
  siteId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  repoName: repoNameSchema,
  description: z.string().trim().max(200).optional(),
  template: templateNameSchema,
  content: siteDataSchema,
})
