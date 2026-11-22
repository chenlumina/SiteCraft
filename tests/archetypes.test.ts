import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ARCHETYPE_LIST,
  ARCHETYPES,
  createArchetypeSample,
  getArchetype,
  getArchetypeForData,
} from '@/lib/archetypes'
import { isTemplateName, TEMPLATE_NAMES } from '@/lib/templates'
import { siteDataSchema } from '@/lib/validators/site-schema'

describe('archetype 配置：引用与示例数据必须完整', () => {
  it('标识唯一且注册表键与配置 id 一致', () => {
    const ids = ARCHETYPE_LIST.map((item) => item.id)
    assert.equal(new Set(ids).size, ids.length)
    for (const item of ARCHETYPE_LIST) assert.equal(ARCHETYPES[item.id], item)
  })

  it('所有推荐版式都真实存在，技术人保留全部版式', () => {
    for (const archetype of ARCHETYPE_LIST) {
      assert.ok(archetype.templates.length > 0)
      for (const template of archetype.templates) assert.ok(isTemplateName(template))
    }
    assert.deepEqual(ARCHETYPES.developer.templates, TEMPLATE_NAMES)
  })

  it('每个方向的示例都能通过保存 API 使用的同一份 Zod 契约', () => {
    for (const archetype of ARCHETYPE_LIST) {
      const sample = archetype.createSample()
      const parsed = siteDataSchema.parse(sample)
      assert.equal(parsed.name, sample.name)
      assert.ok(parsed.skills.length > 0)
      assert.ok(parsed.projects.length > 0)
      assert.ok(parsed.experience.length > 0)
    }
  })

  it('示例数据显式声明方向：艺术为 artist，技术人为 developer', () => {
    assert.equal(ARCHETYPES.artist.createSample().archetype, 'artist')
    assert.equal(ARCHETYPES.developer.createSample().archetype, 'developer')
  })

  it('示例每次返回独立深拷贝，编辑一个站点不会串改其他站点', () => {
    const first = createArchetypeSample('artist')
    const second = createArchetypeSample('artist')
    first.skills[0].name = '已修改'
    first.projects[0].tags.push('新标签')
    assert.notEqual(first.skills[0].name, second.skills[0].name)
    assert.ok(!second.projects[0].tags.includes('新标签'))
  })
})

describe('archetype 回退：旧数据不需要迁移', () => {
  it('缺省、未知值都回退技术人', () => {
    assert.equal(getArchetype().id, 'developer')
    assert.equal(getArchetype('not-exists').id, 'developer')
    assert.equal(getArchetypeForData({}).id, 'developer')
  })

  it('显式艺术方向不会回退', () => {
    assert.equal(getArchetypeForData({ archetype: 'artist' }).id, 'artist')
    assert.equal(getArchetype('artist').copy.projects, '作品与系列')
  })
})
