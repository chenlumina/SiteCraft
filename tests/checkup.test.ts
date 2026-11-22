import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { runSiteCheckup } from '@/lib/checkup'
import { TEMPLATE_NAMES } from '@/lib/templates'
import { SAMPLE_SITE_DATA } from '@/lib/sample-data'

describe('站点体检：13 套模板 × 示例数据', () => {
  it('全部模板零失败且满分', () => {
    for (const template of TEMPLATE_NAMES) {
      const report = runSiteCheckup(SAMPLE_SITE_DATA, template)
      const fails = report.items.filter((item) => item.status === 'fail')
      assert.deepEqual(
        fails.map((item) => item.id),
        [],
        `${template} 存在失败项`
      )
      assert.equal(report.passed, report.total, `${template} 未满分`)
    }
  })
})

describe('站点体检：问题定位', () => {
  it('缺邮箱直接失败，社交全空给警告', () => {
    const data = {
      ...SAMPLE_SITE_DATA,
      email: '',
      socials: { github: '', twitter: '', website: '', bilibili: '' },
    }
    const report = runSiteCheckup(data, 'minimal')
    assert.equal(report.items.find((item) => item.id === 'email')?.status, 'fail')
    assert.equal(report.items.find((item) => item.id === 'socials')?.status, 'warn')
  })

  it('简介过短给建议，空简介直接失败', () => {
    const short = runSiteCheckup({ ...SAMPLE_SITE_DATA, bio: '你好' }, 'minimal')
    assert.equal(short.items.find((item) => item.id === 'bio')?.status, 'warn')
    const empty = runSiteCheckup({ ...SAMPLE_SITE_DATA, bio: '' }, 'minimal')
    assert.equal(empty.items.find((item) => item.id === 'bio')?.status, 'fail')
  })

  it('评分只统计非 info 项，并包含分享标签检查', () => {
    const report = runSiteCheckup(SAMPLE_SITE_DATA, 'minimal')
    assert.equal(report.total, report.items.filter((item) => item.status !== 'info').length)
    assert.ok(report.items.some((item) => item.id === 'og' && item.status === 'pass'))
    assert.ok(report.items.some((item) => item.id === 'og-image' && item.status === 'info'))
  })
})
