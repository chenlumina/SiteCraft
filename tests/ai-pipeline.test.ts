import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { AiProvider, AiProviderInput } from '@/lib/ai/provider'
import { AiDraftError, buildAiPrompt, runAiFill } from '@/lib/ai/pipeline'
import { inferArchetypeFromText, MockAiProvider } from '@/lib/ai/mock-provider'
import { createArchetypeSample } from '@/lib/archetypes'
import { generateSiteHTML } from '@/lib/generators/html-generator'

class StubProvider implements AiProvider {
  calls: AiProviderInput[] = []
  constructor(private readonly responses: string[]) {}
  async generate(input: AiProviderInput): Promise<string> {
    this.calls.push(input)
    return this.responses[Math.min(this.calls.length - 1, this.responses.length - 1)]
  }
}

function validPayload(archetype: 'developer' | 'artist' = 'artist') {
  return JSON.stringify({
    archetype,
    suggestedTemplate: archetype === 'artist' ? 'minimal' : 'tech',
    data: createArchetypeSample(archetype),
    unmapped: [],
  })
}

describe('AI 管道：方向与提示词', () => {
  it('艺术材料自动识别为创作方向，技术材料保持技术人', () => {
    assert.equal(inferArchetypeFromText('我专注水彩插画，正在整理城市系列作品'), 'artist')
    assert.equal(inferArchetypeFromText('我做了一个 Next.js 开源项目'), 'developer')
  })

  it('prompt 从 archetype 配置生成，并带字段长度约束', () => {
    const prompt = buildAiPrompt('我的创作自述', 'artist')
    assert.ok(prompt.includes('创作媒介'))
    assert.ok(prompt.includes('作品与系列'))
    assert.ok(prompt.includes('简介最多600字'))
    assert.ok(prompt.includes('minimal'))
    assert.ok(!prompt.includes('tech 的终端'))
  })
})

describe('AI 管道：mock 与结构化输出', () => {
  it('无 Key 的 mock 能返回完整合法草稿', async () => {
    const result = await runAiFill({
      text: '我专注水彩与数字插画，正在整理城市系列作品和创作过程。',
      provider: new MockAiProvider(),
      providerKind: 'mock',
    })
    assert.equal(result.archetype, 'artist')
    assert.equal(result.provider, 'mock')
    assert.equal(result.data.name, '文森特·梵高')
    assert.ok(result.data.skills.length > 0)
    assert.equal(result.suggestedTemplate, 'minimal')
  })

  it('模型漏掉列表 id 时由管道补齐，模板越界时回退白名单', async () => {
    const payload = JSON.parse(validPayload()) as {
      data: { skills: unknown }
      suggestedTemplate: string
      unmapped: string[]
    }
    payload.data.skills = createArchetypeSample('artist').skills.map(
      ({ id: _id, ...skill }) => skill
    )
    payload.suggestedTemplate = 'tech'
    payload.unmapped = ['周末到图书馆自习']
    const result = await runAiFill({
      text: '艺术创作记录',
      archetype: 'artist',
      provider: new StubProvider([JSON.stringify(payload)]),
    })
    assert.ok(result.data.skills.every((skill) => skill.id.length > 0))
    assert.equal(result.suggestedTemplate, 'minimal')
    assert.deepEqual(result.unmapped, ['周末到图书馆自习'])
  })
})

describe('AI 管道：失败重试与安全边界', () => {
  it('第一次 JSON 非法会把错误回喂一次，第二次合法则成功', async () => {
    const provider = new StubProvider(['不是 JSON', validPayload()])
    const result = await runAiFill({
      text: '艺术创作记录',
      archetype: 'artist',
      provider,
    })
    assert.equal(provider.calls.length, 2)
    assert.ok(provider.calls[1].prompt.includes('上次输出未通过校验'))
    assert.equal(result.archetype, 'artist')
  })

  it('两次都不合法则明确失败，不用示例冒充识别结果', async () => {
    const provider = new StubProvider(['{}', '仍然不是 JSON'])
    await assert.rejects(
      () => runAiFill({ text: '任意用户材料', provider }),
      (error: unknown) => error instanceof AiDraftError && error.message.includes('两次')
    )
    assert.equal(provider.calls.length, 2)
  })

  it('超出 schema 长度的模型输出不能绕过校验', async () => {
    const payload = JSON.parse(validPayload()) as {
      data: ReturnType<typeof createArchetypeSample>
    }
    payload.data.name = '超'.repeat(31)
    const provider = new StubProvider([JSON.stringify(payload)])
    await assert.rejects(() => runAiFill({ text: '任意用户材料', provider }), /姓名最多 30 字/)
    assert.equal(provider.calls.length, 2)
  })

  it('AI 带回恶意文本仍由现有生成器转义', async () => {
    const payload = JSON.parse(validPayload()) as {
      data: ReturnType<typeof createArchetypeSample>
    }
    payload.data.name = '<img src=x onerror=alert(1)>'
    const result = await runAiFill({
      text: '任意用户材料',
      provider: new StubProvider([JSON.stringify(payload)]),
    })
    const html = generateSiteHTML(result.data, 'minimal')
    assert.ok(!html.includes('<img src=x onerror=alert(1)>'))
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  })
})
