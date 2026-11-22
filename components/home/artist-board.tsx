/**
 * Digital Gallery：艺术创作人员的独立作品空间。
 * 原生横向 scroll-snap 负责观看，策展模式负责调整观众顺序；
 * 示例视觉全部内联 SVG，无图片请求、无脚本动画依赖。
 */
'use client'

import { useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Layers,
  Images,
  SlidersHorizontal,
} from 'lucide-react'
import { SiteNav } from '@/components/home/site-nav'
import { TemplateGallery } from '@/components/home/template-gallery'
import { ArtistPlayground } from '@/components/home/artist-playground'
import { cn } from '@/lib/utils'
import { ARTWORK_URI, type ArtworkKey } from '@/lib/artist/artwork-uris'

interface Artwork {
  id: string
  title: string
  series: string
  year: string
  medium: string
  note: string
  variant: ArtworkKey
  background: string
}

const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'aw-starry',
    title: '星月夜',
    series: '圣雷米时期',
    year: '1889',
    medium: '布面油画 · 73.7 × 92.1 cm',
    note: '柏树与星云被画成漩涡。只有柏树与远山来自窗外，村庄与教堂尖顶取自荷兰的记忆。',
    variant: 'starry',
    background: '#0d2545',
  },
  {
    id: 'aw-sunflowers',
    title: '向日葵',
    series: '阿尔勒时期',
    year: '1888',
    medium: '布面油画 · 92.1 × 73 cm',
    note: '为迎接高更到阿尔勒，他在南法的烈日里画了一整组向日葵，只用黄与赭两种颜色。',
    variant: 'sunflowers',
    background: '#e8b93c',
  },
  {
    id: 'aw-irises',
    title: '鸢尾花',
    series: '圣雷米时期',
    year: '1889',
    medium: '布面油画 · 74.3 × 94.3 cm',
    note: '疗养院花园的第一批画。他说这是被空气与雨水冲洗过的蓝紫色，节奏来自叶片的交叉线。',
    variant: 'irises',
    background: '#dfe3cf',
  },
  {
    id: 'aw-bedroom',
    title: '阿尔勒的卧室',
    series: '阿尔勒时期',
    year: '1888',
    medium: '布面油画 · 72.4 × 91.4 cm',
    note: '他称之为以颜色来休息的房间：黄、蓝、绿三组平涂，透视刻意放松，为的是留出睡意。',
    variant: 'bedroom',
    background: '#c3cfd6',
  },
  {
    id: 'aw-wheatfield',
    title: '麦田群鸦',
    series: '奥维尔时期',
    year: '1890',
    medium: '布面油画 · 50.5 × 103 cm',
    note: '三条小路从前景分开，没有一条通往画面之外；群鸦从暗下来的天空掠过。',
    variant: 'wheatfield',
    background: '#2b3d56',
  },
  {
    id: 'aw-portrait',
    title: '自画像',
    series: '圣雷米时期',
    year: '1889',
    medium: '布面油画 · 65 × 54 cm',
    note: '四十余幅自画像之一：背景的笔触方向与胡须、外套一体流动，像把人也放进那场漩涡。',
    variant: 'portrait',
    background: '#4a7c86',
  },
]

function ArtworkVisual({ variant }: { variant: Artwork['variant'] }) {
  // 图源与导出共用同一份 data URI，首页与成品像素一致
  return (
    // 图片已预压到 ≤1200px，用原生 img 直接走静态文件，避免 next/image 再套一层优化
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ARTWORK_URI[variant]}
      alt=""
      aria-hidden="true"
      className="h-full w-full object-contain"
    />
  )
}

export function ArtistBoard({ name, onReset }: { name: string; onReset: () => void }) {
  const [artworks, setArtworks] = useState(INITIAL_ARTWORKS)
  const [activeId, setActiveId] = useState(INITIAL_ARTWORKS[0].id)
  const [curating, setCurating] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const activeIndex = artworks.findIndex((artwork) => artwork.id === activeId)
  const active = artworks[activeIndex] ?? artworks[0]

  function goTo(index: number) {
    const next = Math.max(0, Math.min(artworks.length - 1, index))
    const id = artworks[next].id
    setActiveId(id)
    trackRef.current?.scrollTo({ left: next * trackRef.current.clientWidth, behavior: 'smooth' })
  }

  function moveArtwork(id: string, offset: number) {
    const from = artworks.findIndex((artwork) => artwork.id === id)
    const to = Math.max(0, Math.min(artworks.length - 1, from + offset))
    if (from === to) return
    const next = [...artworks]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setArtworks(next)
    setActiveId(id)
    window.requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: to * trackRef.current.clientWidth, behavior: 'smooth' })
    })
  }

  return (
    <div className="min-h-[100dvh] bg-[#f3f3f0] text-[#171917]">
      <SiteNav mode="artist" onEditProfile={onReset} />

      <main className="mx-auto max-w-[1600px] px-5 pb-16 pt-28 sm:px-8 lg:pt-32">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/50">
              Post-Impressionism · 1853–1890 · Selected works
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              星月夜与麦田
            </h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-black/55 lg:justify-self-end">
            {name}
            的作品正在这里展出。图像先开口，创作说明退到边缘；你也可以进入策展模式，重新安排观众遇见它们的顺序。
          </p>
        </div>

        <ArtistPlayground visitorName={name} />

        {/* 单件查看：点索引缩略图换这里，策展排序仍在下方 */}
        <section id="gallery" className="mt-8 scroll-mt-24" aria-label="作品查看">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-mono text-xs tabular-nums text-black/55">
              {String(activeIndex + 1).padStart(2, '0')}
              <span className="mx-2 text-black/25">/</span>
              {String(artworks.length).padStart(2, '0')}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurating((value) => !value)}
                aria-pressed={curating}
                className={cn(
                  'mr-2 flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs transition-colors',
                  curating
                    ? 'border-black bg-black text-white'
                    : 'border-black/20 hover:border-black'
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {curating ? '完成策展' : '策展模式'}
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex <= 0}
                aria-label="上一件作品"
                className="grid h-11 w-11 place-items-center rounded-full border border-black/20 transition-colors hover:border-black disabled:opacity-25"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                disabled={activeIndex >= artworks.length - 1}
                aria-label="下一件作品"
                className="grid h-11 w-11 place-items-center rounded-full border border-black/20 transition-colors hover:border-black disabled:opacity-25"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="当前作品大图，可用左右方向键切换"
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') goTo(activeIndex - 1)
              if (event.key === 'ArrowRight') goTo(activeIndex + 1)
            }}
            className="relative h-[46vh] min-h-[300px] overflow-hidden sm:h-[54vh]"
            style={{ backgroundColor: active.background }}
          >
            <figure key={active.id} className="hero-swap-in h-full w-full">
              <ArtworkVisual variant={active.variant} />
            </figure>
          </div>

          <div
            key={active.id}
            className="hero-swap-in grid gap-5 border-b border-black/10 py-6 md:grid-cols-[1fr_auto] md:items-start"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-black/45">
                {active.series} · {active.year}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{active.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">{active.note}</p>
            </div>
            <p className="text-xs text-black/50 md:border-l md:border-black/10 md:pl-6">
              {active.medium}
            </p>
          </div>
        </section>

        <section
          id="curation"
          className="mt-7 scroll-mt-24"
          aria-label={curating ? '策展排序' : '作品索引'}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold">{curating ? '调整观众观看顺序' : '展厅索引'}</h3>
            <p className="text-[11px] text-black/45">
              {curating ? '拖动作品，或使用箭头微调' : '点击缩略图，直接抵达作品'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {artworks.map((artwork, index) => (
              <div
                key={artwork.id}
                draggable={curating}
                onDragStart={(event) => event.dataTransfer.setData('text/artwork-id', artwork.id)}
                onDragOver={(event) => curating && event.preventDefault()}
                onDrop={(event) => {
                  if (!curating) return
                  const sourceId = event.dataTransfer.getData('text/artwork-id')
                  const from = artworks.findIndex((item) => item.id === sourceId)
                  const to = artworks.findIndex((item) => item.id === artwork.id)
                  if (from < 0 || from === to) return
                  const next = [...artworks]
                  const [item] = next.splice(from, 1)
                  next.splice(to, 0, item)
                  setArtworks(next)
                }}
                className={cn(
                  'group relative border bg-transparent text-left transition-colors',
                  activeId === artwork.id ? 'border-black' : 'border-black/15',
                  curating && 'cursor-grab active:cursor-grabbing'
                )}
              >
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`查看作品 ${artwork.title}`}
                  className="block w-full"
                >
                  <span className="block h-24 overflow-hidden sm:h-28">
                    <ArtworkVisual variant={artwork.variant} />
                  </span>
                  <span className="block px-3 py-3">
                    <span className="block truncate text-xs font-semibold">{artwork.title}</span>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-black/45">
                      {String(index + 1).padStart(2, '0')} · {artwork.medium}
                    </span>
                  </span>
                </button>
                {curating && (
                  <span className="absolute right-2 top-2 flex gap-1 bg-[#f3f3f0]/90 p-1">
                    <GripVertical className="mr-1 h-4 w-4 text-black/40" />
                    <button
                      type="button"
                      aria-label={`前移 ${artwork.title}`}
                      disabled={index === 0}
                      onClick={() => moveArtwork(artwork.id, -1)}
                      className="grid h-7 w-7 place-items-center border border-black/15 disabled:opacity-20"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`后移 ${artwork.title}`}
                      disabled={index === artworks.length - 1}
                      onClick={() => moveArtwork(artwork.id, 1)}
                      className="grid h-7 w-7 place-items-center border border-black/15 disabled:opacity-20"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <TemplateGallery scope="artist" visitorName={name} />
        <section className="mt-16 grid gap-8 border-t border-black/10 pt-8 md:grid-cols-2">
          <div className="flex gap-4">
            <Layers className="h-5 w-5 flex-none text-black/40" strokeWidth={1.5} />
            <div>
              <h2 className="font-display text-lg font-bold">两种看法：画册与动线</h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-black/50">
                画廊版竖排可扫，展览版横向一面墙一件——同一份作品，两种观看节奏。
              </p>
            </div>
          </div>
        </section>
        <div className="mt-10 flex items-center gap-2 text-[11px] text-black/40">
          <Images className="h-3.5 w-3.5" /> Gallery 交互原型 · 示例作品为程序绘制的占位视觉
        </div>
      </main>
    </div>
  )
}
