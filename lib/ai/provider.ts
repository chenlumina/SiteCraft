/**
 * AI 提供方契约：只返回结构化草稿所需的 JSON 字符串，不参与 HTML 或版式渲染。
 * 真实 LLM 后续实现同一接口；管道、路由与测试均不依赖某一家模型。
 */
import type { ArchetypeId } from '@/types'

export interface AiProviderInput {
  text: string
  archetype: ArchetypeId
  prompt: string
}

export interface AiProvider {
  generate(input: AiProviderInput): Promise<string>
}
