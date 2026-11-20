/**
 * 首屏：左侧文案阶梯入场（animationDelay 递增）+ 中英标语轮换。
 * 交互层（InkBlob）：大墨团跟随鼠标 + 标题被墨团覆盖处反白 + SITECRAFT 字母水印。
 * 注：原「浏览器橱窗」模板轮换板块已按需求移除——模板预览的入口
 * 保留在下方模板画廊（真实渲染卡片）与「试衣间」交互区。
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LayoutTemplate } from 'lucide-react'
import { TEMPLATES } from '@/lib/templates'
import { InkBlob } from '@/components/home/ink-blob'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SWAP_MS = 4800

/** 首屏标语：中英双版轮换（呼应「部署到全世界」），accent 为印泥红强调词；
 * 两版都保持两行，避免轮换时 h1 高度变化引起布局跳动 */
const HEADLINES = [
  { l1: '把你自己，', l2a: '部署到', accent: '全世界', l2b: '。' },
  { l1: 'DEPLOY', l2a: 'TO ', accent: 'THE WORLD', l2b: '.' },
]

/** 标语渲染：ghost=true 时输出纯白副本（供墨团反白裁切，不带红色强调） */
function HeadlineLines({ h, ghost = false }: { h: (typeof HEADLINES)[number]; ghost?: boolean }) {
  return (
    <>
      {h.l1}
      <br />
      {h.l2a}
      {ghost ? h.accent : <span className="accent-mark">{h.accent}</span>}
      {h.l2b}
    </>
  )
}

export function Hero() {
  // 中英标语轮换：idxRef 保存当前索引，prevIdx 让旧句以 hero-swap-out 退场
  const idxRef = useRef(0)
  const [hi, setHi] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      setPrevIdx(idxRef.current)
      idxRef.current = (idxRef.current + 1) % HEADLINES.length
      setHi(idxRef.current)
    }, SWAP_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (prevIdx === null) return
    const t = setTimeout(() => setPrevIdx(null), 600)
    return () => clearTimeout(t)
  }, [prevIdx])

  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-32 lg:pt-40">
      <InkBlob />
      <div className="relative">
        <p
          className="inline-flex animate-fade-up items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={{ animationDelay: '0.05s' }}
        >
          SiteCraft — 个人官网生成器
          <span aria-hidden="true" className="inline-block h-px w-12 bg-foreground/40" />
        </p>
        <h1
          className="mt-6 animate-fade-up font-display text-4xl font-bold leading-[1.18] tracking-tight sm:text-5xl xl:text-[3.5rem]"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="relative block">
            {prevIdx !== null && (
              <span aria-hidden="true" className="hero-swap-out absolute inset-0">
                <HeadlineLines h={HEADLINES[prevIdx]} />
              </span>
            )}
            <span key={hi} className="hero-swap-in block">
              <HeadlineLines h={HEADLINES[hi]} />
            </span>
            {/* 反白副本：与基础标语同盒同流，clip-path 圆随墨团移动（见 InkBlob） */}
            <span
              aria-hidden="true"
              data-ink-ghost
              className="absolute inset-0 text-white"
              style={{ clipPath: 'circle(0px at 0 0)' }}
            >
              <HeadlineLines h={HEADLINES[hi]} ghost />
            </span>
          </span>
        </h1>
        <p
          className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground"
          style={{ animationDelay: '0.25s' }}
        >
          填写资料、挑选模板、实时预览——三分钟生成一个完全属于你的个人官网。 一键导出静态
          HTML，或直接部署到 GitHub Pages。往下滚，画廊与试衣间可以直接玩。
        </p>
        <div
          className="mt-8 flex animate-fade-up flex-wrap gap-3"
          style={{ animationDelay: '0.35s' }}
        >
          <Button asChild size="lg" className="gap-2">
            <Link href="/editor">
              立即创建官网 <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-background hover:bg-accent">
            <a href="#templates">
              <LayoutTemplate /> 浏览模板
            </a>
          </Button>
        </div>
        {/* 统计行：墨团盖到时由白色副本反白（终值静态副本，计数动画只发生在正本上） */}
        <div className="relative mt-10 animate-fade-up" style={{ animationDelay: '0.45s' }}>
          <dl className="flex items-center gap-6 text-sm">
            {[
              { value: TEMPLATES.length, suffix: '', label: '套独立版式' },
              { value: 100, suffix: '%', label: '响应式布局' },
              { value: 1, suffix: ' 键', label: '导出与部署' },
            ].map((stat, i) => (
              <StatItem key={stat.label} {...stat} first={i === 0} />
            ))}
          </dl>
          <dl
            aria-hidden="true"
            data-ink-ghost
            className="absolute inset-0 flex items-center gap-6 text-sm text-white"
            style={{ clipPath: 'circle(0px at 0 0)' }}
          >
            {[
              { value: String(TEMPLATES.length), suffix: '', label: '套独立版式' },
              { value: '100', suffix: '%', label: '响应式布局' },
              { value: '1', suffix: ' 键', label: '导出与部署' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn('flex items-center gap-6', i > 0 && 'border-l border-white/50 pl-6')}
              >
                <div>
                  <dd className="font-mono text-xl font-bold">
                    {stat.value}
                    {stat.suffix}
                  </dd>
                  <dd className="mt-0.5 text-xs">{stat.label}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/** 首页统计项：进入视口后数字从 0 滚动到目标值（reduced-motion 直接显示终值） */
function StatItem({
  value,
  suffix,
  label,
  first,
}: {
  value: number
  suffix: string
  label: string
  first: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        observer.disconnect()
        const t0 = performance.now()
        const duration = 900
        const tick = (t: number) => {
          const p = Math.min((t - t0) / duration, 1)
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
          if (p < 1) frame = requestAnimationFrame(tick)
        }
        setDisplay(0)
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-6', !first && 'border-l border-border pl-6')}
    >
      <div>
        <dt className="sr-only">{label}</dt>
        <dd className="font-mono text-xl font-bold text-foreground">
          {display}
          {suffix}
        </dd>
        <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
      </div>
    </div>
  )
}
