/**
 * AI 预填管道：模型只负责把任意材料翻译为 SiteData，不负责设计与 HTML。
 * 防线：限定 JSON 输出 → 补齐列表 id → 与保存 API 共用 Zod 校验 → 错误回喂一次。
 * 两次都失败则明确报错，绝不用示例数据冒充用户材料的识别结果。
 */
import { z } from 'zod'
import type { ArchetypeId, SiteData, TemplateName } from '@/types'
import { getArchetype } from '@/lib/archetypes'
import { uid } from '@/lib/utils'
import { archetypeSchema, siteDataSchema } from '@/lib/validators/site-schema'
import { isTemplateName } from '@/lib/templates'
import type { AiProvider } from './provider'
import { inferArchetypeFromText } from './mock-provider'

const aiResponseSchema = z.object({
  archetype: archetypeSchema,
  suggestedTemplate: z.string(),
  data: siteDataSchema,
  unmapped: z.array(z.string().trim().max(200)).max(12).default([]),
})

export interface AiFillResult {
  archetype: ArchetypeId
  suggestedTemplate: TemplateName
  data: SiteData
  unmapped: string[]
  provider: 'mock' | 'llm'
}

export class AiDraftError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiDraftError'
  }
}

export function buildAiPrompt(text: string, archetypeId: ArchetypeId): string {
  const archetype = getArchetype(archetypeId)
  return `你是个人网站资料整理器。把用户材料整理成 SiteData JSON，不创作 HTML，不推荐模板之外的字段。
内容方向为「${archetype.label}」：skills 表示${archetype.copy.skills}，projects 表示${archetype.copy.projects}，experience 表示${archetype.copy.experience}。
只输出 JSON，结构为 {"archetype":"${archetype.id}","suggestedTemplate":"${archetype.templates[0]}","data":{...},"unmapped":[]}。
必须保留用户事实，不得编造；没有的信息使用空字符串或空数组。avatar 无信息时使用 /images/avatar-default.svg。
姓名最多30字，头衔最多60字，简介最多600字；项目描述和经历描述最多300字；每条要点最多60字且每项最多3条；技能最多24项，项目最多16项，经历最多12段。
skills/projects/experience 的每一项都必须有非空 id。skills.level 必须是0到100的整数，仅用于排序与兼容，不要编造精确能力结论，无法判断时填60。
socials 必须包含 github/twitter/website/bilibili 四个字符串，未提及则为空。theme.primaryColor 使用 #RRGGBB。
suggestedTemplate 只能从 ${archetype.templates.join(', ')} 中选择。无法放入 SiteData 的原始信息摘要到 unmapped，不要丢失。
用户材料如下：
"""
${text}
"""`
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end <= start) throw new AiDraftError('AI 没有返回 JSON 草稿')
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    throw new AiDraftError('AI 返回的 JSON 无法解析')
  }
}

function normalizePayload(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  const payload = value as Record<string, unknown>
  const data = payload.data as Record<string, unknown> | undefined
  if (!data) return payload
  for (const key of ['skills', 'projects', 'experience']) {
    const list = data[key]
    if (Array.isArray(list)) {
      data[key] = list.map((item) =>
        item && typeof item === 'object' && !(item as Record<string, unknown>).id
          ? { id: uid(), ...(item as Record<string, unknown>) }
          : item
      )
    }
  }
  return payload
}

function parseDraft(raw: string, requestedArchetype: ArchetypeId): AiFillResult {
  const parsed = aiResponseSchema.safeParse(normalizePayload(extractJson(raw)))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw new AiDraftError(`${issue.path.join('.')}: ${issue.message}`)
  }
  const archetype = getArchetype(parsed.data.archetype || requestedArchetype)
  const suggested = parsed.data.suggestedTemplate
  return {
    archetype: archetype.id,
    suggestedTemplate:
      isTemplateName(suggested) && archetype.templates.includes(suggested)
        ? suggested
        : archetype.templates[0],
    data: { ...parsed.data.data, archetype: archetype.id },
    unmapped: parsed.data.unmapped,
    provider: 'llm',
  }
}

export async function runAiFill({
  text,
  archetype: requestedArchetype,
  provider,
  providerKind = 'llm',
}: {
  text: string
  archetype?: ArchetypeId
  provider: AiProvider
  providerKind?: 'mock' | 'llm'
}): Promise<AiFillResult> {
  const archetype = requestedArchetype ?? inferArchetypeFromText(text)
  const prompt = buildAiPrompt(text, archetype)
  let firstError = ''
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const raw = await provider.generate({
      text,
      archetype,
      prompt:
        attempt === 0
          ? prompt
          : `${prompt}\n上次输出未通过校验：${firstError}\n请修正后重新输出完整 JSON。`,
    })
    try {
      return { ...parseDraft(raw, archetype), provider: providerKind }
    } catch (error) {
      firstError = error instanceof Error ? error.message : '结构校验失败'
    }
  }
  throw new AiDraftError(`AI 草稿两次未通过结构校验：${firstError}`)
}
