/**
 * 首页全局氛围件（纯装饰、pointer-events-none、零布局影响）：
 * - ScrollProgress：顶部 2px 渐变进度条，随滚动 scaleX；
 * - Spotlight：跟随光标的聚光灯渐变（rAF 合帧），给深色落地页「活」的感觉。
 * 两者都尊重 prefers-reduced-motion：不监听不动画，只渲染静态态。
 */
'use client'

import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
        el.style.transform = `scaleX(${p})`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-magenta"
    />
  )
}

export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.background = `radial-gradient(520px circle at ${e.clientX}px ${e.clientY}px, rgba(124,108,255,.075), transparent 68%)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]" />
}
