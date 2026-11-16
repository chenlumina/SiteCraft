/**
 * 全局共享类型定义（规范 3.2：类型/接口 PascalCase）。
 *
 * SiteData 是整个应用的「唯一数据契约」：
 * 编辑器表单、Zustand store、实时预览、HTML 导出、数据库 content 字段（JSON 字符串）
 * 全部围绕它流转，改字段时只需改这里 + lib/validators/site-schema.ts 的校验器。
 */

/**
 * 十二套官网模板的标识符，与 components/templates/ 目录、数据库 Site.template 取值一一对应。
 * 新增模板：改这里 + lib/templates.ts 元数据 + lib/generators/styles.ts 差异 CSS
 * + lib/validators/site-schema.ts 的 z.enum，四处保持同名。
 */
export type TemplateName =
  | 'minimal'
  | 'tech'
  | 'creative'
  | 'professional'
  | 'ink'
  | 'brutal'
  | 'aurora'
  | 'editorial'
  | 'gold'
  | 'vapor'
  | 'swiss'
  | 'kraft'

export type SiteStatus = 'draft' | 'published'

export type DeviceMode = 'desktop' | 'mobile'

export interface SocialLinks {
  github: string
  twitter: string
  website: string
  bilibili: string
}

export interface Skill {
  id: string
  name: string
  level: number
}

export interface Project {
  id: string
  name: string
  description: string
  tags: string[]
  link: string
  repo: string
  highlight: boolean
}

export interface Experience {
  id: string
  role: string
  organization: string
  period: string
  description: string
}

export interface SiteTheme {
  primaryColor: string
}

/** 站点全部内容。注意：数组项都带 id，供拖拽排序 / 删除撤销时稳定定位（React key 也用它） */
export interface SiteData {
  name: string
  title: string
  status: string
  bio: string
  avatar: string
  location: string
  email: string
  socials: SocialLinks
  skills: Skill[]
  projects: Project[]
  experience: Experience[]
  theme: SiteTheme
}

/** 数据库 Site 行序列化后的前端形态：content 已从 JSON 字符串解析为对象，日期转为 ISO 字符串 */
export interface SiteRecord {
  id: string
  name: string
  template: TemplateName
  status: SiteStatus
  content: SiteData
  createdAt: string
  updatedAt: string
}

export interface TemplateMeta {
  name: TemplateName
  displayName: string
  tagline: string
  description: string
  mood: 'light' | 'dark'
  defaultColor: string
  swatches: string[]
  features: string[]
}

/** 规范 3.5 强制的统一 API 响应格式：成功带 data，失败带 error，前端据此判断而非 HTTP 状态码 alone */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface DeployResult {
  repoUrl: string
  pagesUrl: string | null
  owner: string
  repo: string
}