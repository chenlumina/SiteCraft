/**
 * AI 预填：输入用户材料，返回可编辑的 SiteData 草稿；不落库、不改写现有站点。
 * 无密钥时使用 mock provider，接口契约与真实模型保持一致。
 */
import { z } from 'zod'
import { fail, failFrom, ok } from '@/lib/api'
import { AiDraftError, runAiFill } from '@/lib/ai/pipeline'
import { getAiProvider } from '@/lib/ai/get-provider'
import { MockAiProvider } from '@/lib/ai/mock-provider'
import { FEATURES } from '@/lib/features'

const aiFillRequestSchema = z.object({
  text: z.string().trim().min(10, '请至少提供 10 个字的材料').max(12000, '材料最多 12000 字'),
  archetype: z.enum(['developer', 'artist']).optional(),
})

export async function POST(request: Request) {
  try {
    if (!FEATURES.AI_FILL) return fail('AI 预填暂未开放', 503)
    const input = aiFillRequestSchema.parse(await request.json())
    const provider = getAiProvider()
    const result = await runAiFill({
      ...input,
      provider,
      providerKind: provider instanceof MockAiProvider ? 'mock' : 'llm',
    })
    return ok(result)
  } catch (error) {
    if (error instanceof AiDraftError) return fail(error.message, 502)
    return failFrom(error)
  }
}
