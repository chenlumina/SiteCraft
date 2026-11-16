/**
 * saveSite 服务层行为测试（统一落库逻辑的契约）。
 * 用真实 Prisma + 独立 SQLite 测试库（DATABASE_URL 由运行入口注入），
 * 不 mock 数据库：断言的是真实写入/读取/所有权隔离行为。
 * 每个用例前后清空 Site 表，保证互不串扰。
 */
import { after, before, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { prisma } from '../lib/prisma'
import { ensureDefaultUser } from '../lib/default-user'
import { patchSite, saveSite } from '../lib/site-service'
import { createSampleData } from '../lib/sample-data'

before(async () => {
  await ensureDefaultUser()
})

beforeEach(async () => {
  await prisma.site.deleteMany({})
})

after(async () => {
  await prisma.site.deleteMany({})
  await prisma.$disconnect()
})

describe('saveSite：无 id 新建', () => {
  it('写入数据库并返回含 id 的记录，默认草稿状态', async () => {
    const user = await ensureDefaultUser()
    const record = await saveSite(user.id, {
      name: '新站点',
      template: 'minimal',
      content: createSampleData(),
    })
    assert.ok(record.id)
    assert.equal(record.name, '新站点')
    assert.equal(record.status, 'draft')
    const row = await prisma.site.findUnique({ where: { id: record.id } })
    assert.ok(row)
    assert.equal(row.userId, user.id)
    assert.deepEqual(JSON.parse(row.content), createSampleData())
  })

  it('显式传入 published 时按发布状态落库', async () => {
    const user = await ensureDefaultUser()
    const record = await saveSite(user.id, {
      name: '发布站',
      template: 'tech',
      content: createSampleData(),
      status: 'published',
    })
    assert.equal(record.status, 'published')
  })
})

describe('saveSite：带 id 更新', () => {
  it('更新自己的站点并保留原 id', async () => {
    const user = await ensureDefaultUser()
    const created = await saveSite(user.id, {
      name: '原名',
      template: 'minimal',
      content: createSampleData(),
    })
    const updated = await saveSite(user.id, {
      id: created.id,
      name: '改名',
      template: 'creative',
      content: createSampleData(),
      status: 'published',
    })
    assert.equal(updated.id, created.id)
    assert.equal(updated.name, '改名')
    assert.equal(updated.template, 'creative')
    assert.equal(updated.status, 'published')
    const count = await prisma.site.count()
    assert.equal(count, 1)
  })

  it('不传 status 时保留原状态（补丁语义）', async () => {
    const user = await ensureDefaultUser()
    const created = await saveSite(user.id, {
      name: '状态站',
      template: 'minimal',
      content: createSampleData(),
      status: 'published',
    })
    const updated = await saveSite(user.id, {
      id: created.id,
      name: '状态站',
      template: 'minimal',
      content: createSampleData(),
    })
    assert.equal(updated.status, 'published')
  })

  it('更新不属于自己的站点时抛错且不改动数据', async () => {
    const user = await ensureDefaultUser()
    const created = await saveSite(user.id, {
      name: '他人站',
      template: 'minimal',
      content: createSampleData(),
    })
    await assert.rejects(
      () =>
        saveSite('another-user', {
          id: created.id,
          name: '劫持',
          template: 'minimal',
          content: createSampleData(),
        }),
      /站点不存在或无权修改/
    )
    const row = await prisma.site.findUnique({ where: { id: created.id } })
    assert.equal(row?.name, '他人站')
  })

  it('更新不存在的 id 时抛错', async () => {
    const user = await ensureDefaultUser()
    await assert.rejects(
      () =>
        saveSite(user.id, {
          id: '00000000-0000-0000-0000-000000000000',
          name: '不存在',
          template: 'minimal',
          content: createSampleData(),
        }),
      /站点不存在或无权修改/
    )
  })
})

describe('patchSite：补丁式更新（PUT /api/sites/:id 语义）', () => {
  it('只改 status 时其余字段原样保留', async () => {
    const user = await ensureDefaultUser()
    const created = await saveSite(user.id, {
      name: '补丁站',
      template: 'professional',
      content: createSampleData(),
    })
    const patched = await patchSite(user.id, created.id, { status: 'published' })
    assert.equal(patched.status, 'published')
    assert.equal(patched.name, '补丁站')
    assert.equal(patched.template, 'professional')
    assert.deepEqual(patched.content, createSampleData())
  })

  it('空补丁不改动任何字段', async () => {
    const user = await ensureDefaultUser()
    const created = await saveSite(user.id, {
      name: '空补丁',
      template: 'minimal',
      content: createSampleData(),
      status: 'published',
    })
    const patched = await patchSite(user.id, created.id, {})
    assert.deepEqual(patched, created)
  })

  it('更新他人站点时抛错且不改动数据', async () => {
    const user = await ensureDefaultUser()
    const created = await saveSite(user.id, {
      name: '他人补丁站',
      template: 'minimal',
      content: createSampleData(),
    })
    await assert.rejects(
      () => patchSite('another-user', created.id, { status: 'published' }),
      /站点不存在或无权修改/
    )
    const row = await prisma.site.findUnique({ where: { id: created.id } })
    assert.equal(row?.status, 'draft')
  })
})