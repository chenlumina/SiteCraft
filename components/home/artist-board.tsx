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
import { cn } from '@/lib/utils'

interface Artwork {
  id: string
  title: string
  series: string
  year: string
  medium: string
  note: string
  variant: 'city' | 'botanical' | 'tram' | 'garden'
  background: string
}

const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'city-breath',
    title: '城市呼吸 No.04',
    series: '城市呼吸',
    year: '2026',
    medium: '水彩、数字拼贴',
    note: '把通勤途中那些没有被注意的窗光、墙角与天空，重新拼成一座会呼吸的城市。',
    variant: 'city',
    background: '#dedbd2',
  },
  {
    id: 'between-leaves',
    title: '植物的间隙',
    series: '附近',
    year: '2026',
    medium: '综合材料',
    note: '从叶片之间观看日常。遮挡不是阻碍，而是让视线找到另一条路径。',
    variant: 'botanical',
    background: '#dce3d5',
  },
  {
    id: 'night-tram',
    title: '夜班电车',
    series: '城市呼吸',
    year: '2025',
    medium: '数字绘画',
    note: '车窗把陌生人的片段连成电影，城市在每个站点短暂地换了一次字幕。',
    variant: 'tram',
    background: '#151d2a',
  },
  {
    id: 'silent-garden',
    title: '无声花园',
    series: '柔软标本',
    year: '2025',
    medium: '丙烯、纸面',
    note: '一组关于生长速度的标本：有些花在开放，有些颜色正在退场。',
    variant: 'garden',
    background: '#eadde0',
  },
]

function ArtworkVisual({ variant }: { variant: Artwork['variant'] }) {
  if (variant === 'city') {
    return (
      <svg viewBox="0 0 1200 760" className="h-full w-full" aria-hidden="true">
        <rect width="1200" height="760" fill="#e9e4d8" />
        <circle cx="930" cy="170" r="116" fill="#d77256" />
        <rect x="0" y="430" width="1200" height="330" fill="#b7c0b0" />
        <path d="M0 430L280 280L450 430Z" fill="#f5f0e5" />
        <path d="M360 430L650 150L820 430Z" fill="#c2bba9" />
        <rect x="92" y="340" width="196" height="420" fill="#34454a" />
        <rect x="330" y="455" width="240" height="305" fill="#e8e0d1" />
        <rect x="620" y="310" width="206" height="450" fill="#7c8d88" />
        <rect x="850" y="390" width="254" height="370" fill="#e9d8bd" />
        {[0, 1, 2].map((row) =>
          [0, 1].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={125 + col * 82}
              y={390 + row * 102}
              width="42"
              height="54"
              fill="#e8bd78"
            />
          ))
        )}
        {[0, 1, 2, 3].map((row) => (
          <rect key={row} x={670} y={360 + row * 86} width="106" height="24" fill="#dfe5df" />
        ))}
        <path d="M0 694C240 650 390 736 610 686S1000 640 1200 702V760H0Z" fill="#263b3a" />
        <path d="M480 760C530 668 620 628 734 650C604 676 574 714 560 760Z" fill="#f2eee4" />
      </svg>
    )
  }
  if (variant === 'botanical') {
    return (
      <svg viewBox="0 0 1200 760" className="h-full w-full" aria-hidden="true">
        <rect width="1200" height="760" fill="#edf0e5" />
        <circle cx="580" cy="360" r="210" fill="#d9cdb1" />
        <path d="M174 760C220 518 318 308 522 62" stroke="#294c3a" strokeWidth="24" fill="none" />
        <path d="M376 486C232 454 136 350 128 212C278 234 392 328 376 486Z" fill="#648164" />
        <path d="M430 340C458 188 560 96 706 82C694 238 586 346 430 340Z" fill="#8ca47c" />
        <path d="M274 624C128 626 46 548 10 438C154 420 266 492 274 624Z" fill="#a6b68d" />
        <path d="M730 760C756 520 874 302 1070 146" stroke="#48644a" strokeWidth="18" fill="none" />
        <path d="M858 480C872 326 982 240 1134 240C1090 396 996 478 858 480Z" fill="#607b58" />
        <path d="M780 608C672 548 632 452 662 344C794 398 846 500 780 608Z" fill="#a2b894" />
        <path d="M540 760C568 652 660 574 762 588C746 696 664 754 540 760Z" fill="#d07c62" />
        <circle cx="574" cy="350" r="36" fill="#f4f0e4" />
      </svg>
    )
  }
  if (variant === 'tram') {
    return (
      <svg viewBox="0 0 1200 760" className="h-full w-full" aria-hidden="true">
        <rect width="1200" height="760" fill="#111923" />
        <path d="M0 154H1200M0 604H1200" stroke="#354151" strokeWidth="2" />
        <path d="M90 0L370 760M1080 0L796 760" stroke="#293746" strokeWidth="3" />
        <rect x="160" y="214" width="880" height="352" rx="22" fill="#263746" />
        <rect x="194" y="250" width="812" height="244" rx="8" fill="#0b1019" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={224 + i * 198} y="278" width="156" height="174" fill="#d69c61" />
            <rect x={224 + i * 198} y="278" width="156" height="42" fill="#f0c985" />
            <path
              d={`M${238 + i * 198} 452L${292 + i * 198} 344L${350 + i * 198} 452Z`}
              fill="#5c5b55"
            />
          </g>
        ))}
        <path d="M0 652C260 594 450 690 660 634C866 580 1024 606 1200 654V760H0Z" fill="#1f303b" />
        <path d="M70 700H1130" stroke="#e0ad6b" strokeWidth="5" strokeDasharray="62 38" />
        <circle cx="110" cy="118" r="46" fill="#e9c581" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 1200 760" className="h-full w-full" aria-hidden="true">
      <rect width="1200" height="760" fill="#f0e5e3" />
      <path d="M0 580C260 492 436 626 650 544C850 468 1018 510 1200 572V760H0Z" fill="#a7b2a2" />
      <path
        d="M312 760C322 530 366 362 450 170M764 760C746 526 790 366 902 148"
        stroke="#475f50"
        strokeWidth="15"
        fill="none"
      />
      <g transform="translate(448 232)">
        <ellipse cx="0" cy="-92" rx="60" ry="112" fill="#d47c87" />
        <ellipse cx="90" cy="-10" rx="112" ry="58" fill="#dc9397" />
        <ellipse cx="0" cy="82" rx="64" ry="108" fill="#bd687a" />
        <ellipse cx="-92" cy="-4" rx="106" ry="60" fill="#e0a0a0" />
        <circle r="58" fill="#d9b65f" />
      </g>
      <g transform="translate(890 210)">
        <ellipse cx="0" cy="-72" rx="48" ry="90" fill="#738da4" />
        <ellipse cx="72" cy="0" rx="88" ry="46" fill="#91a5b8" />
        <ellipse cx="0" cy="68" rx="50" ry="84" fill="#657f99" />
        <ellipse cx="-72" cy="0" rx="86" ry="48" fill="#a7b7c3" />
        <circle r="44" fill="#e4c87c" />
      </g>
      <circle cx="586" cy="510" r="68" fill="#d9b85e" />
      <path d="M566 760C574 654 592 584 626 522" stroke="#526a57" strokeWidth="12" fill="none" />
    </svg>
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
              Exhibition 001 · Selected works
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              城市与植物之间
            </h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-black/55 lg:justify-self-end">
            {name}
            的作品正在这里展出。图像先开口，创作说明退到边缘；你也可以进入策展模式，重新安排观众遇见它们的顺序。
          </p>
        </div>

        <section id="gallery" className="mt-10 scroll-mt-24" aria-label="作品展厅">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs tabular-nums text-black/55">
              {String(activeIndex + 1).padStart(2, '0')}{' '}
              <span className="mx-2 text-black/25">/</span>{' '}
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
            ref={trackRef}
            tabIndex={0}
            role="region"
            aria-label="作品轮播，可使用左右方向键浏览"
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') goTo(activeIndex - 1)
              if (event.key === 'ArrowRight') goTo(activeIndex + 1)
            }}
            onScroll={(event) => {
              const track = event.currentTarget
              const index = Math.round(track.scrollLeft / track.clientWidth)
              const artwork = artworks[index]
              if (artwork && artwork.id !== activeId) setActiveId(artwork.id)
            }}
            className="flex h-[58vh] min-h-[380px] snap-x snap-mandatory overflow-x-auto scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black lg:h-[64vh]"
            style={{ backgroundColor: active.background, scrollbarWidth: 'none' }}
          >
            {artworks.map((artwork) => (
              <figure
                key={artwork.id}
                aria-hidden={activeId !== artwork.id}
                className="h-full w-full flex-none snap-center"
              >
                <ArtworkVisual variant={artwork.variant} />
              </figure>
            ))}
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
