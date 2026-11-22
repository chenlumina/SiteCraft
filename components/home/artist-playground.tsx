/**
 * 「作品集试衣间」——艺术首页的核心交互区，与技术首页 Playground 同构：
 * 改称呼、填创作方向与城市、切七套版式、切桌面/手机视口，右侧实时看到成品。
 * 预览复用 ArtistSiteFrame（与编辑器、导出同一渲染源），缩放策略同技术侧：
 * 内层固定宽度 + ResizeObserver 实测 + transform scale + 绝对定位防撑爆。
 */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, Monitor, Smartphone } from 'lucide-react'
import type { ArtistSiteData, ArtistTemplateName } from '@/types/artist'
import { buildArtistPreviewData } from '@/lib/artist/preview-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useReveal } from '@/lib/hooks/use-reveal'

// 七套艺术版式按需加载：首屏不背七份渲染器
const ArtistSiteFrame = dynamic(
  () => import('@/components/artist-editor/artist-site-frame').then((m) => m.ArtistSiteFrame),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center font-mono text-[11px] uppercase tracking-[0.2em] text-black/40">
        载入版式…
      </div>
    ),
  }
)

const TEMPLATES: Array<{ id: ArtistTemplateName; label: string; note: string }> = [
  { id: 'gallery', label: '画廊', note: '竖排画册' },
  { id: 'exhibition', label: '展览', note: '横向动线' },
  { id: 'contact', label: '印样', note: '密排选片' },
  { id: 'index', label: '索引', note: '藏品目录' },
  { id: 'studio', label: '工作室', note: '墙卡 + 作品流' },
  { id: 'scroll', label: '长卷', note: '竖向叙事' },
  { id: 'poster', label: '海报墙', note: '块面强' },
]

const DESKTOP_W = 1280
const DESKTOP_H = 820
const MOBILE_W = 390
const MOBILE_H = 780

type Device = 'desktop' | 'mobile'

function useFitScale(innerW: number, innerH: number) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  const [boxH, setBoxH] = useState(340)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? innerW
      const next = Math.min(width / innerW, 0.92)
      setScale(next)
      setBoxH(Math.round(innerH * next))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [innerW, innerH])

  return { boxRef, scale, boxH }
}

export function ArtistPlayground({ visitorName = '' }: { visitorName?: string }) {
  useReveal()
  const [template, setTemplate] = useState<ArtistTemplateName>('gallery')
  const [name, setName] = useState(visitorName)
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  // 小屏默认预览手机视口，否则整页被缩成一条
  const [device, setDevice] = useState<Device>(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 'mobile' : 'desktop'
  )

  const innerW = device === 'desktop' ? DESKTOP_W : MOBILE_W
  const innerH = device === 'desktop' ? DESKTOP_H : MOBILE_H
  const { boxRef, scale, boxH } = useFitScale(innerW, innerH)

  const data = useMemo<ArtistSiteData>(
    () => buildArtistPreviewData({ name, title, location: city }),
    [name, title, city]
  )

  return (
    <section id="playground" className="mt-14 scroll-mt-24" aria-label="作品集试玩">
      <div className="reveal mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/45">
            Playground
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            先试后建 · 作品集试衣间
          </h2>
          <p className="mt-2 text-sm leading-7 text-black/55">
            填上你的称呼、方向与城市，点一套版式——右边立刻就是你的作品集。满意就带着这套配置进编辑器。
          </p>
        </div>
      </div>

      <div className="reveal grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="border-black/12 space-y-4 rounded-xl border bg-white/70 p-5">
          <div>
            <p className="mb-2 text-xs font-semibold text-black/60">① 版式（7 套）</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTemplate(item.id)}
                  aria-pressed={template === item.id}
                  className={cn(
                    'rounded-lg border px-2.5 py-2 text-left transition-colors',
                    template === item.id
                      ? 'border-black bg-black text-white'
                      : 'border-black/15 bg-white text-black/70 hover:border-black/50'
                  )}
                >
                  <span className="block text-xs font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-[10px] opacity-70">{item.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-black/60">② 你的称呼</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 12))}
              placeholder="输入名字，实时生效"
              maxLength={12}
              aria-label="试穿称呼"
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-black/60">③ 方向</p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 16))}
                placeholder="后印象派画家"
                aria-label="创作方向"
                className="bg-white"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-black/60">④ 城市</p>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value.slice(0, 16))}
                placeholder="法国 · 阿尔勒"
                aria-label="所在城市"
                className="bg-white"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-black/60">⑤ 视口</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                aria-pressed={device === 'desktop'}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-colors',
                  device === 'desktop'
                    ? 'border-black bg-black text-white'
                    : 'border-black/15 bg-white text-black/70 hover:border-black/50'
                )}
              >
                <Monitor className="h-3.5 w-3.5" /> 桌面
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                aria-pressed={device === 'mobile'}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-colors',
                  device === 'mobile'
                    ? 'border-black bg-black text-white'
                    : 'border-black/15 bg-white text-black/70 hover:border-black/50'
                )}
              >
                <Smartphone className="h-3.5 w-3.5" /> 手机
              </button>
            </div>
          </div>

          <Button asChild className="w-full gap-2 bg-black text-white hover:bg-black/85">
            <Link
              href={`/artist-editor?template=${template}&name=${encodeURIComponent(data.name)}&title=${encodeURIComponent(data.title)}&location=${encodeURIComponent(data.location)}`}
            >
              用这套开始 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-center text-[11px] leading-5 text-black/40">
            示例作品为程序绘制的占位视觉，进编辑器后可换成你自己的图片。
          </p>
        </div>

        <div className="min-w-0">
          <div
            ref={boxRef}
            className="border-black/12 relative overflow-hidden rounded-xl border bg-white"
            style={{ height: boxH }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: innerW, height: innerH, transform: `scale(${scale})` }}
            >
              <ArtistSiteFrame
                data={data}
                template={template}
                className="h-full overflow-hidden bg-white"
              />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
            <span className="text-black">{TEMPLATES.find((t) => t.id === template)?.label}</span>
            <span aria-hidden="true" className="h-px w-5 bg-black/20" />
            <span>{device === 'desktop' ? '1440 桌面' : '390 手机'}</span>
            <span className="ml-auto">实时渲染 · 与导出同源</span>
          </div>
        </div>
      </div>
    </section>
  )
}
