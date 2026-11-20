/**
 * 首屏「墨团」交互层（参考 MiMo 式光标墨块，融入本项目纸面语言）：
 * 1. 字母水印瓷砖：SITECRAFT 字母平铺在首屏背景（对应 MiMo 的 MOMI 底纹）；
 * 2. 大墨团跟随鼠标：rAF 每帧向光标位置做 lerp 缓动（带拖尾滞后感），
 *    核心圆用 border-radius 关键帧做有机形变；
 *    内部字母是「X 光透镜」——世界锚定的字母场铺满整层，clip 圆随墨团移动，
 *    墨团移动时窗口里透出的字母随之变化（对齐 MiMo 官网的逻辑），
 * 3. 内容反白：所有标记 data-ink-ghost 的纯白副本由 clip-path 圆形裁切，
 *    圆心 = 墨团中心、半径 = 墨团半径 × 当前缩放——墨团盖到哪，
 *    标题/统计等墨色内容就反白到哪（同一坐标系，永远对齐）。
 * 生命周期：mouseenter 显现并吸附光标，mouseleave 缩回消失；rAF 空闲时自动停帧（零常驻开销）。
 * 门控：仅 (hover:hover)+(pointer:fine) 且非 reduced-motion 时启用；
 * 触屏/减少动效用户看不到墨团，副本被裁切为 0，页面保持常规墨色。
 * 水合安全：初始样式全部写死在 JSX（opacity 0 / clip 0），无随机值、无 SSR/客户端分歧。
 */
'use client'

import { useEffect, useRef } from 'react'

const BLOB_SIZE = 440
const R = BLOB_SIZE / 2

/** SITECRAFT 字母瓷砖：两行错位的衬线粗体字母，repeat 后成整片水印 */
function letterTile(fill: string, opacity: string) {
  const svg =
    `%3Csvg xmlns='http://www.w3.org/2000/svg' width='340' height='170'%3E` +
    `%3Cg fill='${fill}' fill-opacity='${opacity}' font-family='Georgia,serif' font-weight='700' font-size='46'%3E` +
    `%3Ctext x='20' y='64'%3ES%3C/text%3E%3Ctext x='100' y='64'%3EI%3C/text%3E%3Ctext x='180' y='64'%3ET%3C/text%3E%3Ctext x='258' y='64'%3EE%3C/text%3E` +
    `%3Ctext x='60' y='150'%3EC%3C/text%3E%3Ctext x='140' y='150'%3ER%3C/text%3E%3Ctext x='220' y='150'%3EA%3C/text%3E%3Ctext x='298' y='150'%3EF%3C/text%3E` +
    `%3C/g%3E%3C/svg%3E`
  return `url("data:image/svg+xml,${svg}")`
}

/** 墨团内部字母瓷砖：字距更密的独立字母场，世界锚定（不随墨团移动） */
function innerTile(fill: string, opacity: string) {
  const svg =
    `%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='140'%3E` +
    `%3Cg fill='${fill}' fill-opacity='${opacity}' font-family='Georgia,serif' font-weight='700' font-size='44'%3E` +
    `%3Ctext x='24' y='52'%3ES%3C/text%3E%3Ctext x='96' y='52'%3EI%3C/text%3E%3Ctext x='168' y='52'%3ET%3C/text%3E%3Ctext x='236' y='52'%3EE%3C/text%3E` +
    `%3Ctext x='60' y='126'%3EC%3C/text%3E%3Ctext x='132' y='126'%3ER%3C/text%3E%3Ctext x='204' y='126'%3EA%3C/text%3E%3Ctext x='244' y='126'%3EF%3C/text%3E` +
    `%3C/g%3E%3C/svg%3E`
  return `url("data:image/svg+xml,${svg}")`
}

const TILE_PAPER = letterTile('%231b1917', '0.05')
const TILE_INK = innerTile('%23ffffff', '0.08')

export function InkBlob() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const lettersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const section = wrap?.parentElement
    const core = coreRef.current
    if (!wrap || !section || !core) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    // 反白副本列表：DOM 结构静态（轮换只改文本不换节点），挂载时缓存一次即可
    const ghosts = Array.from(section.querySelectorAll<HTMLElement>('[data-ink-ghost]'))
    if (ghosts.length === 0) return

    let raf = 0
    let running = false
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    let scale = 0.4
    let tScale = 0.4
    let snapped = false
    // 闭包内使用的非空别名：TS 的空值收窄不穿透函数声明，这里显式落成非空引用
    const secEl: HTMLElement = section

    // 单帧：位置/缩放向目标缓动 → 写墨团位移 + 按墨团当前圆心/半径裁切标题白色副本
    function tick() {
      pos.x += (target.x - pos.x) * 0.15
      pos.y += (target.y - pos.y) * 0.15
      scale += (tScale - scale) * 0.2
      const blob = blobRef.current
      if (blob) {
        blob.style.transform = `translate3d(${(pos.x - R).toFixed(1)}px, ${(pos.y - R).toFixed(1)}px, 0)`
      }
      // 墨团内部字母场是世界锚定的整层平铺，clip 圆随墨团移动：
      // 墨团像 X 光透镜，移动时窗口里透出的字母随之变化（MiMo 的逻辑）
      const letters = lettersRef.current
      if (letters) {
        letters.style.clipPath =
          scale > 0.02
            ? `circle(${(R * scale).toFixed(1)}px at ${pos.x.toFixed(1)}px ${pos.y.toFixed(1)}px)`
            : 'circle(0px at 0 0)'
      }
      if (scale > 0.02) {
        // 墨团中心（section 坐标系）换算到各副本盒坐标系，clip 与墨团永远同心同径
        const sec = secEl.getBoundingClientRect()
        const cxSec = sec.left + pos.x
        const cySec = sec.top + pos.y
        for (const ghost of ghosts) {
          const g = ghost.getBoundingClientRect()
          const cx = cxSec - g.left
          const cy = cySec - g.top
          ghost.style.clipPath = `circle(${(R * scale).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`
        }
      } else {
        for (const ghost of ghosts) {
          ghost.style.clipPath = 'circle(0px at 0 0)'
        }
      }
      if (
        Math.abs(target.x - pos.x) > 0.4 ||
        Math.abs(target.y - pos.y) > 0.4 ||
        Math.abs(tScale - scale) > 0.004
      ) {
        raf = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }
    function kick() {
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    function onMove(e: MouseEvent) {
      const rect = secEl.getBoundingClientRect()
      target.x = e.clientX - rect.left
      target.y = e.clientY - rect.top
      kick()
    }
    function onEnter(e: MouseEvent) {
      if (!snapped) {
        // 首次进入直接吸附到光标处，避免墨团从 (0,0) 飞入的突兀感
        const rect = secEl.getBoundingClientRect()
        pos.x = target.x = e.clientX - rect.left
        pos.y = target.y = e.clientY - rect.top
        snapped = true
      }
      tScale = 1
      coreRef.current?.style.setProperty('opacity', '1')
      coreRef.current?.style.setProperty('transform', 'scale(1)')
      kick()
    }
    function onLeave() {
      tScale = 0.4
      coreRef.current?.style.setProperty('opacity', '0')
      coreRef.current?.style.setProperty('transform', 'scale(0.4)')
      kick()
    }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseenter', onEnter)
    section.addEventListener('mouseleave', onLeave)
    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseenter', onEnter)
      section.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ backgroundImage: TILE_PAPER }}
    >
      <div
        ref={blobRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ width: BLOB_SIZE, height: BLOB_SIZE }}
      >
        <div
          ref={coreRef}
          className="ink-blob-core h-full w-full"
          style={{ opacity: 0, transform: 'scale(0.4)' }}
        />
      </div>
      {/* 内部字母场：世界锚定 + clip 圆开窗（层级在墨团之上，白色字母落在黑底上呈暗灰） */}
      <div
        ref={lettersRef}
        className="absolute inset-0"
        style={{ backgroundImage: TILE_INK, clipPath: 'circle(0px at 0 0)' }}
      />
    </div>
  )
}
