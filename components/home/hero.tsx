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
import { ArrowRight, LayoutTemplate, Smartphone, Sparkles } from 'lucide-react'
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

  return (
    <div ref={parallaxRef} className="relative will-change-transform">
      <div
        className="relative overflow-hidden rounded-2xl border border-ink-600/60 bg-ink-850 shadow-2xl shadow-ink-950/70"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex items-center gap-2 border-b border-ink-700 bg-ink-800 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          <span className="ml-3 flex-1 truncate rounded-md bg-ink-900 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            https://zhangliang.site
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-850 to-transparent" />
        </div>

        <div className="flex items-center gap-2 border-t border-ink-700 bg-ink-800 px-4 py-2.5">
          {TEMPLATES.map((t, index) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`预览 ${t.displayName}`}
              aria-pressed={index === active}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                index === active
                  ? 'bg-primary/20 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.defaultColor }} />
              {t.displayName.split(' ')[0]}
            </button>
          ))}
          <div className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-ink-600">
            <div
              key={`${active}-${paused}`}
              className="h-full rounded-full bg-brand-cyan"
              style={{
                animation: paused ? 'none' : `shimmer-progress ${ROTATE_MS}ms linear forwards`,
                width: paused ? '100%' : undefined,
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute -right-3 top-10 animate-float rounded-xl border border-ink-600/60 bg-ink-800/95 px-3 py-2 text-xs font-semibold shadow-xl backdrop-blur">
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-success align-middle" />
        实时预览 · 所见即所得
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Smartphone className="h-3.5 w-3.5 text-brand-cyan" />
        桌面 / 移动端全响应式 · 容器查询驱动 · 每 5 秒自动轮换模板
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
          className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-violet/10 px-3.5 py-1.5 text-xs font-medium text-brand-violet"
          style={{ animationDelay: '0.05s' }}
        >
          <Sparkles className="h-3.5 w-3.5" /> 可视化建站 · 无需代码 · 开源可控
        </p>
        <h1
          className="mt-6 animate-fade-up font-display text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl xl:text-[3.4rem]"
          style={{ animationDelay: '0.15s' }}
        >
          把你自己，
          <br />
          <span className="text-gradient-brand">部署到全世界。</span>
        </h1>
        <p
          className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground"
          style={{ animationDelay: '0.25s' }}
        >
          填写资料、挑选模板、实时预览——三分钟生成一个完全属于你的个人官网。
          一键导出静态 HTML，或直接部署到 GitHub Pages。
        </p>
        <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: '0.35s' }}>
          <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/25">
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
            ['4', '套风格模板'],
            ['100%', '响应式布局'],
            ['1 键', '导出与部署'],
          ].map(([value, label], i) => (
            <div key={label} className={cn('flex items-center gap-6', i > 0 && 'border-l border-ink-600 pl-6')}>
              <div>
                <dt className="sr-only">{label}</dt>
                <dd className="font-mono text-xl font-bold text-brand-cyan">{value}</dd>
                <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <HeroShowcase />
      </div>
    </section>
  )
}