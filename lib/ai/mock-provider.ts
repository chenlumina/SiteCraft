/**
 * 确定性 mock：没有 API Key 时也能完整开发、演示与测试 AI 预填流程。
 * 它不是真识别文本内容，只按关键词选择方向并返回该方向的示例草稿。
 */
import type { ArchetypeId } from '@/types'
import { createArchetypeSample, getArchetype } from '@/lib/archetypes'
import type { AiProvider, AiProviderInput } from './provider'

export function inferArchetypeFromText(text: string): ArchetypeId {
  return /艺术|插画|绘画|水彩|油画|设计|摄影|作品|创作|展览|海报/.test(text)
    ? 'artist'
    : 'developer'
}

export class MockAiProvider implements AiProvider {
  async generate(input: AiProviderInput): Promise<string> {
    const archetype = getArchetype(input.archetype)
    return JSON.stringify({
      archetype: archetype.id,
      suggestedTemplate: archetype.templates[0],
      data: createArchetypeSample(archetype.id),
      unmapped: [],
    })
  }
}
