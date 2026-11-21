import type { AiProvider } from './provider'
import { MockAiProvider } from './mock-provider'

/**
 * 当前默认 mock，保证无密钥环境可用。
 * M4 接入真实 OpenAI 兼容接口时，在这里按 AI_PROVIDER / AI_API_KEY 切换。
 */
export function getAiProvider(): AiProvider {
  return new MockAiProvider()
}
