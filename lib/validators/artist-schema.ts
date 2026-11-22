/**
 * 艺术作品集校验：基础资料复用开发人员同一份字段规则，媒体与作品独立约束。
 * 允许三类图源：http(s) 外链、/ 开头的站内路径、以及 data:image 内联（导出要求单文件自包含）。
 */
import { z } from 'zod'
import { siteDataSchema } from './site-schema'

export const MAX_ARTWORK_COUNT = 24
export const MAX_MEDIA_PER_ARTWORK = 12

const mediaUrl = z
  .string()
  .trim()
  .min(1, '媒体链接不能为空')
  .max(2048, '链接过长')
  .refine(
    (v) =>
      /^https?:\/\/[^\s]+$/i.test(v) ||
      v.startsWith('/') ||
      /^data:image\/[a-z+.-]+;base64,/.test(v),
    '请输入 http(s) 链接、以 / 开头的本地路径，或内联的 data:image 数据'
  )

const optionalMediaUrl = z
  .string()
  .trim()
  .max(2048, '链接过长')
  .refine(
    (v) =>
      v === '' ||
      /^https?:\/\/[^\s]+$/i.test(v) ||
      v.startsWith('/') ||
      /^data:image\/[a-z+.-]+;base64,/.test(v),
    '媒体封面链接不正确'
  )

export const mediaItemSchema = z.object({
  id: z.string().min(1),
  url: mediaUrl,
  title: z.string().trim().max(80, '媒体说明最多 80 字').optional().default(''),
})

export const artworkSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, '作品标题不能为空').max(60, '作品标题最多 60 字'),
  series: z.string().trim().max(40, '系列名最多 40 字'),
  year: z.string().trim().max(12, '年份最多 12 字'),
  medium: z.string().trim().max(60, '媒介最多 60 字'),
  dimensions: z.string().trim().max(24, '尺寸最多 24 字'),
  description: z.string().trim().max(600, '创作说明最多 600 字'),
  cover: optionalMediaUrl,
  media: z
    .array(mediaItemSchema)
    .max(MAX_MEDIA_PER_ARTWORK, `每件作品最多 ${MAX_MEDIA_PER_ARTWORK} 个媒体`),
  featured: z.boolean(),
})

export const MAX_EXHIBITION_COUNT = 12

export const exhibitionSchema = z.object({
  id: z.string().min(1),
  year: z.string().trim().max(12, '年份最多 12 字'),
  title: z.string().trim().min(1, '展览名不能为空').max(60, '展览名最多 60 字'),
  venue: z.string().trim().max(60, '展出场馆最多 60 字'),
  role: z.enum(['solo', 'group', 'other']),
})

export const commissionsSchema = z.object({
  open: z.boolean().default(false),
  scope: z.string().trim().max(120, '接单范围最多 120 字').default(''),
  process: z.string().trim().max(200, '合作流程最多 200 字').default(''),
  leadTime: z.string().trim().max(40, '档期最多 40 字').default(''),
  priceFrom: z.string().trim().max(40, '起价最多 40 字').default(''),
})

export const artistSiteDataSchema = siteDataSchema
  .pick({
    name: true,
    title: true,
    bio: true,
    avatar: true,
    location: true,
    email: true,
    socials: true,
    theme: true,
  })
  .extend({
    archetype: z.literal('artist'),
    artworks: z.array(artworkSchema).max(MAX_ARTWORK_COUNT, `最多 ${MAX_ARTWORK_COUNT} 件作品`),
    exhibitions: z
      .array(exhibitionSchema)
      .max(MAX_EXHIBITION_COUNT, `最多 ${MAX_EXHIBITION_COUNT} 条展览履历`)
      .default([]),
    commissions: commissionsSchema.default({
      open: false,
      scope: '',
      process: '',
      leadTime: '',
      priceFrom: '',
    }),
  })

export const artistSaveSiteSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, '站点名称不能为空').max(60, '站点名称最多 60 字'),
  template: z.enum(['gallery', 'exhibition']),
  content: artistSiteDataSchema,
  status: z.enum(['draft', 'published']).optional(),
})
