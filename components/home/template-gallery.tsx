/**
 * 模板画廊 —— 「样册」式浏览（取代十二张同构卡片的堆砌）：
 * 左：当前样张的真实渲染（SiteFrame + 缩放），装进印刷 Plate 框——
 *     双细线框 + 四角裁切规线 + 「PLATE nn / 12」铭牌，全视口 sticky 随索引滚动常驻；
 * 右：十二行编辑索引（编号 / 色点 / 衬线名 / 斜体标语 / 深浅标签），
 *     悬停 / 聚焦 / 点击即换左側样张（plate-in 落定动效），行级阶梯入场。
 * 缩放关键：内层固定 1280px 宽 + transform scale 且 absolute 定位——
 * transform 不改变布局盒，留在文档流会撑爆列宽；plate-in 动效放在外层包装上，
 * 避免动画 transform 覆盖内层的 scale。
 * 所见即所得：样张与选用后得到的版式完全同源（同一 generateSiteHTML 渲染管线）。
 */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { SiteData } from '@/types'
import { SAMPLE_SITE_DATA } from '@/lib/sample-data'
import { TEMPLATES } from '@/lib/templates'
import { SiteFrame } from '@/components/templates/site-frame'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PREVIEW_WIDTH = 1280
const PREVIEW_HEIGHT = 860

/** 印刷裁切规线：Plate 四角的 L 形角标 */
function CropMarks() {
  const base = 'pointer-events-none absolute h-3.5 w-3.5 border-foreground/40'
  return (
    <>
      <span aria-hidden="true" className={cn(base, 'left-1.5 top-1.5 border-l border-t')} />
      <span aria-hidden="true" className={cn(base, 'right-1.5 top-1.5 border-r border-t')} />
      <span aria-hidden="true" className={cn(base, 'bottom-1.5 left-1.5 border-b border-l')} />
      <span aria-hidden="true" className={cn(base, 'bottom-1.5 right-1.5 border-b border-r')} />
    </>
  )
}

export function TemplateGallery({ visitorName = '' }: { visitorName?: string }) {
  const [active, setActive] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)

  // ResizeObserver 实测预览盒宽 → scale = 盒宽 / 1280，高度同比例收缩
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? PREVIEW_WIDTH
      setScale(width / PREVIEW_WIDTH)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const meta = TEMPLATES[active]
  const data = useMemo<SiteData>(
    () => ({
      ...SAMPLE_SITE_DATA,
      name: visitorName || SAMPLE_SITE_DATA.name,
      template: meta.name,
      theme: { primaryColor: meta.defaultColor },
    }),
    [meta, visitorName]
  )
  const plateNo = String(active + 1).padStart(2, '0')

  return (
    <section id="templates" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="reveal mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Templates
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          十二套版式，十二种性格
        </h2>
        <p className="mt-3 text-muted-foreground">
          像翻样册一样浏览：索引悬停即换，样张为真实渲染——看到的就是选用后得到的。
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* 左：样张 Plate（全视口 sticky，翻索引时样张常驻可见） */}
        <div className="reveal sticky top-20 lg:top-24">
          <div className="relative border border-border bg-card p-3 shadow-lg shadow-black/5">
            <CropMarks />
            <div
              ref={boxRef}
              className="relative overflow-hidden border border-border/60"
              style={{ height: PREVIEW_HEIGHT * scale }}
            >
              <div key={meta.name} className="plate-in absolute inset-0">
                <div
                  className="absolute left-0 top-0 origin-top-left"
                  style={{
                    width: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                    transform: `scale(${scale})`,
                  }}
                >
                  <SiteFrame data={data} template={meta.name} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-foreground">Plate {plateNo} / 12</span>
              <span aria-hidden="true" className="h-px w-6 bg-foreground/30" />
              <span>{meta.displayName}</span>
              <span className="ml-auto rounded-sm border border-border px-1.5 py-0.5">
                {meta.mood === 'dark' ? '深色' : '浅色'}
              </span>
            </div>
          </div>
          <Button asChild size="lg" className="mt-5 w-full gap-2">
            <Link href={`/editor?template=${meta.name}`}>
              使用此模板 <ArrowRight />
            </Link>
          </Button>
          <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
            悬停 / 聚焦 / 点按索引即可换张
          </p>
        </div>

        {/* 右：样册索引 */}
        <ol className="border-t border-border">
          {TEMPLATES.map((t, index) => {
            const isActive = index === active
            return (
              <li key={t.name} className="reveal" style={{ transitionDelay: `${index * 45}ms` }}>
                <button
                  type="button"
                  data-template-row
                  aria-pressed={isActive}
                  onClick={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className={cn(
                    'group grid w-full grid-cols-[2.2rem_1fr_auto] items-center gap-x-3 border-b border-border px-2 py-3 text-left transition-all duration-200 sm:grid-cols-[2.2rem_1.2fr_1fr_auto]',
                    isActive ? 'bg-secondary/60' : 'hover:bg-secondary/40'
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-xs transition-colors',
                      isActive ? 'accent-mark font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 flex-none rounded-full border border-foreground/20"
                      style={{ backgroundColor: t.defaultColor }}
                    />
                    <span
                      className={cn(
                        'truncate font-display text-base font-bold transition-transform duration-200',
                        isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'
                      )}
                    >
                      {t.displayName}
                    </span>
                  </span>
                  <span className="hidden truncate font-display text-sm italic text-muted-foreground sm:block">
                    {t.tagline}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t.mood === 'dark' ? 'Dark' : 'Light'}
                    </span>
                    <ArrowRight
                      className={cn(
                        'h-3.5 w-3.5 transition-all duration-200',
                        isActive
                          ? 'accent-mark translate-x-0 opacity-100'
                          : '-translate-x-1 opacity-0'
                      )}
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
