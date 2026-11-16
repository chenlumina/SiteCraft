/**
 * 模板画廊：四张卡片内嵌「真实渲染」的站点缩略（SiteFrame + 缩放），
 * 所见即所得——卡片里看到的就是选用后得到的版式。
 * 缩放取 max(宽比, 高比) 实现 cover 裁切：预览盒固定 192px 高，
 * 宽度随列宽变化，cover 保证不留白边；内层同样 absolute 防撑爆网格。
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
import { Badge } from '@/components/ui/badge'

const CARD_PREVIEW_WIDTH = 1280
const CARD_PREVIEW_HEIGHT = 720
const CARD_PREVIEW_BOX_HEIGHT = 192

function TemplateCard({ index }: { index: number }) {
  const meta = TEMPLATES[index]
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(CARD_PREVIEW_BOX_HEIGHT / CARD_PREVIEW_HEIGHT)
  const data = useMemo<SiteData>(
    () => ({ ...SAMPLE_SITE_DATA, theme: { primaryColor: meta.defaultColor } }),
    [meta.defaultColor]
  )

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? CARD_PREVIEW_WIDTH
      setScale(Math.max(width / CARD_PREVIEW_WIDTH, CARD_PREVIEW_BOX_HEIGHT / CARD_PREVIEW_HEIGHT))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      className="reveal group flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-lg"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        ref={boxRef}
        className="relative overflow-hidden border-b"
        style={{ height: CARD_PREVIEW_BOX_HEIGHT }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: CARD_PREVIEW_WIDTH,
            height: CARD_PREVIEW_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <SiteFrame data={data} template={meta.name} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card/80 to-transparent" />
        <Badge
          variant="secondary"
          className="absolute right-3 top-3 border border-border bg-background/90"
        >
          {meta.mood === 'dark' ? '深色' : '浅色'}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: meta.defaultColor }} />
          <h3 className="font-display text-lg font-bold">{meta.displayName}</h3>
        </div>
        <p className="mt-1 font-display text-sm italic text-muted-foreground">{meta.tagline}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{meta.description}</p>
        <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
          {meta.features.map((feature) => (
            <Badge key={feature} variant="outline" className="text-[11px] text-muted-foreground">
              {feature}
            </Badge>
          ))}
        </div>
        <Button asChild variant="outline" size="sm" className="mt-auto w-full group-hover:border-primary/50">
          <Link href={`/editor?template=${meta.name}`}>
            使用此模板 <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function TemplateGallery() {
  return (
    <section id="templates" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="reveal mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Templates</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          十二套版式，十二种性格
        </h2>
        <p className="mt-3 text-muted-foreground">
          每一套都是独立的版式骨架与视觉系统：结构、字体、配色各不相同。下方卡片为真实渲染，所见即所得。
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map((t, index) => (
          <TemplateCard key={t.name} index={index} />
        ))}
      </div>
    </section>
  )
}