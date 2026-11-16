/**
 * 首屏：左侧文案阶梯入场（animationDelay 递增），右侧「浏览器橱窗」
 * 用真实 SiteFrame 渲染十二套模板并每 5.2s 自动轮换（悬停暂停），
 * 让访客第一眼就看到产品产出物而非抽象插画。
 * 橱窗缩放关键：内层固定 1280px 宽 + transform scale，且必须 absolute 定位——
 * transform 不改变布局盒尺寸，若留在文档流会把网格列撑到 1280px 挤爆左栏。
 */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LayoutTemplate, Smartphone } from 'lucide-react'
import type { SiteData, TemplateName } from '@/types'
import { SAMPLE_SITE_DATA } from '@/lib/sample-data'
import { TEMPLATES } from '@/lib/templates'
import { SiteFrame } from '@/components/templates/site-frame'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SHOWCASE_WIDTH = 1280
const SHOWCASE_HEIGHT = 860
const ROTATE_MS = 5200

function HeroShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [scale, setScale] = useState(0.35)
  const containerRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const variants = useMemo<(SiteData & { template: TemplateName })[]>(
    () =>
      TEMPLATES.map((t) => ({
        ...SAMPLE_SITE_DATA,
        template: t.name,
        theme: { primaryColor: t.defaultColor },
      })),
    []
  )

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setActive((v) => (v + 1) % variants.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [paused, variants.length])

  // ResizeObserver 实测容器宽度 → scale = 容器宽 / 1280，高度同比例收缩，
  // 保证橱窗在任何列宽下都完整显示缩略站点而不溢出
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? SHOWCASE_WIDTH
      setScale(width / SHOWCASE_WIDTH)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 视差：滚动时橱窗轻微下移制造纵深；rAF 合帧节流，passive 监听不阻塞滚动
  useEffect(() => {
    let frame = 0
    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${Math.min(window.scrollY * 0.06, 60)}px)`
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const current = variants[active]

  // 鼠标 3D 倾斜：跟随光标轻微 rotate，离开后弹回；reduced-motion 用户直接跳过
  function onTilt(e: React.MouseEvent) {
    const el = cardRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transition = 'transform .12s ease-out'
    el.style.transform = `perspective(1100px) rotateY(${(px * 6).toFixed(2)}deg) rotateX(${(-py * 5).toFixed(2)}deg)`
  }
  function onTiltEnd() {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'transform .55s cubic-bezier(.2,.8,.2,1)'
    el.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)'
  }

  return (
    <div ref={parallaxRef} className="relative will-change-transform">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false)
          onTiltEnd()
        }}
        onMouseMove={onTilt}
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full border border-foreground/40 bg-transparent" />
          <span className="h-2.5 w-2.5 rounded-full border border-foreground/40 bg-transparent" />
          <span className="h-2.5 w-2.5 rounded-full border border-foreground/40 bg-transparent" />
          <span
            key={current.template}
            className="ml-3 flex-1 truncate rounded-sm bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground animate-fade-in"
          >
            https://zhangliang.site/{current.template}
          </span>
        </div>

        <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height: SHOWCASE_HEIGHT * scale }}>
          <div
            key={current.template}
            className="absolute left-0 top-0 origin-top-left animate-fade-in"
            style={{ width: SHOWCASE_WIDTH, height: SHOWCASE_HEIGHT, transform: `scale(${scale})` }}
          >
            <SiteFrame data={current} template={current.template} />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-muted px-4 py-2.5">
          {TEMPLATES.map((t, index) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`预览 ${t.displayName}`}
              aria-pressed={index === active}
              className={cn(
                'flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                index === active
                  ? 'bg-primary/20 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.defaultColor }} />
              {t.displayName.split(' ')[0]}
            </button>
          ))}
          <div className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-border">
            <div
              key={`${active}-${paused}`}
              className="h-full rounded-full bg-foreground"
              style={{
                animation: paused ? 'none' : `shimmer-progress ${ROTATE_MS}ms linear forwards`,
                width: paused ? '100%' : undefined,
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute -right-3 top-10 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold shadow-sm">
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-success align-middle" />
        实时预览 · 所见即所得
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Smartphone className="h-3.5 w-3.5" />
        桌面 / 移动端全响应式 · 容器查询驱动 · 每 5 秒自动轮换版式
      </p>

      <style>{`@keyframes shimmer-progress{from{width:0}to{width:100%}}`}</style>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-32 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pt-40">
      <div>
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
          把你自己，
          <br />
          部署到<span className="accent-mark">全世界</span>。
        </h1>
        <p
          className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground"
          style={{ animationDelay: '0.25s' }}
        >
          填写资料、挑选模板、实时预览——三分钟生成一个完全属于你的个人官网。
          一键导出静态 HTML，或直接部署到 GitHub Pages。往下滚，试衣间可以直接玩。
        </p>
        <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: '0.35s' }}>
          <Button asChild size="lg" className="gap-2">
            <Link href="/editor">
              立即创建官网 <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#templates">
              <LayoutTemplate /> 浏览模板
            </a>
          </Button>
        </div>
        <dl
          className="mt-10 flex animate-fade-up items-center gap-6 text-sm"
          style={{ animationDelay: '0.45s' }}
        >
          {[
            { value: TEMPLATES.length, suffix: '', label: '套独立版式' },
            { value: 100, suffix: '%', label: '响应式布局' },
            { value: 1, suffix: ' 键', label: '导出与部署' },
          ].map((stat, i) => (
            <StatItem key={stat.label} {...stat} first={i === 0} />
          ))}
        </dl>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <HeroShowcase />
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
    <div ref={ref} className={cn('flex items-center gap-6', !first && 'border-l border-border pl-6')}>
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