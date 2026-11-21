import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  MAX_DIMENSION,
  MAX_UPLOAD_BYTES,
  PASSTHROUGH_BYTES,
  formatBytes,
  planIntake,
} from '@/lib/artist/image-intake'

describe('图片接入策略', () => {
  it('非图片类型直接拒绝', () => {
    assert.equal(planIntake({ size: 1024, type: 'application/pdf' }).action, 'reject')
    assert.equal(planIntake({ size: 1024, type: '' }).action, 'reject')
  })

  it('空文件拒绝', () => {
    assert.equal(planIntake({ size: 0, type: 'image/png' }).action, 'reject')
  })

  it('超过 8MB 拒绝，并给出可读理由', () => {
    const plan = planIntake({ size: MAX_UPLOAD_BYTES + 1, type: 'image/jpeg' })
    assert.equal(plan.action, 'reject')
    assert.match((plan as { reason: string }).reason, /8MB/)
  })

  it('小图原样内联，大图压缩', () => {
    assert.equal(planIntake({ size: PASSTHROUGH_BYTES, type: 'image/png' }).action, 'keep')
    assert.equal(planIntake({ size: PASSTHROUGH_BYTES + 1, type: 'image/png' }).action, 'downscale')
  })

  it('SVG 始终原样保留（矢量不该位图化）', () => {
    assert.equal(planIntake({ size: 3 * 1024 * 1024, type: 'image/svg+xml' }).action, 'keep')
  })

  it('长边上限 1600，避免导出文件膨胀', () => {
    assert.equal(MAX_DIMENSION, 1600)
  })

  it('体积文案可读', () => {
    assert.equal(formatBytes(512), '512 B')
    assert.equal(formatBytes(2048), '2 KB')
    assert.equal(formatBytes(3 * 1024 * 1024), '3.0 MB')
  })
})
