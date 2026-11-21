/**
 * 内容方向（archetype）配置单一来源：编辑器词汇、字段显隐、推荐版式与新建示例。
 * 与视觉模板正交：方向只改变内容如何被组织和编辑，SiteData 骨架保持不变。
 * AI 管道后续也从这里生成提示词，避免界面与 AI 对同一方向使用两套说法。
 */
import type { ArchetypeId, SiteData, TemplateName } from '@/types'
import { createSampleData } from '@/lib/sample-data'
import { createArtistSampleData } from '@/lib/sample-artist'

export interface Archetype {
  id: ArchetypeId
  label: string
  description: string
  copy: {
    skills: string
    projects: string
    experience: string
  }
  fields: {
    /** 艺术方向隐藏掌握度百分比，由编辑器与版式共同消费 */
    skillLevel: 'bar' | 'none'
    repo: boolean
    github: boolean
  }
  /** 新建与模板选择时优先暴露的版式；用户已有站点不被强制改写 */
  templates: TemplateName[]
  createSample: () => SiteData
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  developer: {
    id: 'developer',
    label: '技术人',
    description: '项目作品、技术栈与开发经历',
    copy: { skills: '技能', projects: '项目', experience: '经历' },
    fields: { skillLevel: 'bar', repo: true, github: true },
    templates: [
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
    ],
    createSample: createSampleData,
  },
  artist: {
    id: 'artist',
    label: '艺术创作人员',
    description: '创作媒介、作品系列与创作历程',
    copy: { skills: '创作媒介', projects: '作品与系列', experience: '创作历程' },
    fields: { skillLevel: 'none', repo: false, github: false },
    templates: ['minimal', 'creative', 'aurora', 'editorial', 'gold', 'vapor', 'swiss', 'kraft'],
    createSample: createArtistSampleData,
  },
}

export const ARCHETYPE_LIST = Object.values(ARCHETYPES)

/** 旧数据没有 archetype 字段，统一回退技术人，保持原有编辑体验 */
export function getArchetype(id?: string): Archetype {
  return ARCHETYPES[(id as ArchetypeId) || 'developer'] ?? ARCHETYPES.developer
}

export function getArchetypeForData(data: Pick<SiteData, 'archetype'>): Archetype {
  return getArchetype(data.archetype)
}

export function createArchetypeSample(id?: string): SiteData {
  return getArchetype(id).createSample()
}
