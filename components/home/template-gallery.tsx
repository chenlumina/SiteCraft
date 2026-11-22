/**
 * 模板画廊 —— 「样册」式浏览（取代同构卡片的堆砌），按身份分开陈列：
 * 开发者首页只列 13 套开发者版式，艺术首页只列 7 套艺术作品集版式，
 * 不再把两个方向的版式混在同一张索引里（此前 14 号起混入艺术版式，容易误导）。
 * 左：当前样张的真实渲染（SiteFrame + 缩放），装进印刷 Plate 框——
 *     双细线框 + 四角裁切规线 + 「PLATE nn / 总数」铭牌，全视口 sticky 随索引滚动常驻；
 * 右：编辑索引（编号 / 色点 / 衬线名 / 斜体标语 / 深浅标签），
 *     悬停 / 聚焦 / 点击即换左侧样张（plate-in 落定动效），行级阶梯入场。
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
import { buildArtistPreviewData } from '@/lib/artist/preview-data'
import dynamic from 'next/dynamic'
import type { ArtistTemplateName } from '@/types/artist'
import { TEMPLATES } from '@/lib/templates'
import { SiteFrame } from '@/components/templates/site-frame'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useReveal } from '@/lib/hooks/use-reveal'

/**
 * 艺术版式清单：只出现在艺术首页的样册里。
 * 艺术版式不放进 TEMPLATES（那是开发方向的模板表）。
 */
const ARTIST_SHOWCASE = [
  {
    id: 'gallery',
    displayName: '画廊',
    tagline: '竖排画册，一次看很多',
    color: '#171917',
    mood: 'light' as const,
  },
  {
    id: 'exhibition',
    displayName: '展览',
    tagline: '横向动线，一面墙一件',
    color: '#191817',
    mood: 'light' as const,
  },
  {
    id: 'contact',
    displayName: '印样',
    tagline: '密排小图，摄影师的选片台',
    color: '#d8ff3e',
    mood: 'dark' as const,
  },
  {
    id: 'index',
    displayName: '索引',
    tagline: '藏品目录，先清单后单件',
    color: '#8a1c1c',
    mood: 'light' as const,
  },
  {
    id: 'studio',
    displayName: '工作室',
    tagline: '墙面卡片配摊开的作品',
    color: '#3c6b4a',
    mood: 'light' as const,
  },
  {
    id: 'scroll',
    displayName: '长卷',
    tagline: '竖向叙事，年份刻度贯穿',
    color: '#a8461f',
    mood: 'light' as const,
  },
  {
    id: 'poster',
    displayName: '海报墙',
    tagline: '块面强，街头贴纸气质',
    color: '#c8341f',
    mood: 'light' as const,
  },
]
const ArtistSiteFrame = dynamic(
  () => import('@/components/artist-editor/artist-site-frame').then((m) => m.ArtistSiteFrame),
  {
    ssr: false,
    // 艺术版式只在用户点到时才下载，首屏包体不背它
    loading: () => (
      <div className="grid h-full place-items-center font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
        载入版式…
      </div>
    ),
  }
)
// 艺术版式与开发版式同样跟随访客名字（此前写死示例人物，两个入口内容不一致）

type ShowcaseItem = {
  kind: 'dev' | 'artist'
  name: string
  displayName: string
  tagline: string
  defaultColor: string
  mood: 'light' | 'dark'
}

const SHOWCASE: ShowcaseItem[] = [
  ...TEMPLATES.map((meta) => ({
    kind: 'dev' as const,
    name: meta.name,
    displayName: meta.displayName,
    tagline: meta.tagline,
    defaultColor: meta.defaultColor,
    mood: meta.mood,
  })),
  ...ARTIST_SHOWCASE.map((item) => ({
    kind: 'artist' as const,
    name: item.id,
    displayName: item.displayName,
    tagline: item.tagline,
    defaultColor: item.color,
    mood: item.mood,
  })),
]

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

export function TemplateGallery({
  visitorName = '',
  scope = 'developer',
}: {
  visitorName?: string
  /** 'developer'（默认）只列开发者版式，'artist' 只列艺术作品集版式 */
  scope?: 'developer' | 'artist'
}) {
  // 自己解锁 .reveal：本组件会被开发首页与艺术首页两处挂载，
  // 不能依赖父页面调用 useReveal（艺术首页此前就没有调用，导致整块空白）
  useReveal()
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

  const items = useMemo(
    () =>
      scope === 'artist'
        ? SHOWCASE.filter((item) => item.kind === 'artist')
        : SHOWCASE.filter((item) => item.kind === 'dev'),
    [scope]
  )
  const current = Math.min(active, items.length - 1)
  const meta = items[current]
  const artistData = useMemo(() => buildArtistPreviewData({ name: visitorName }), [visitorName])
  const isArtist = meta.kind === 'artist'
  const tone =
    scope === 'artist'
      ? {
          muted: 'text-black/55',
          subtle: 'text-black/45',
          strong: 'text-[#171917]',
          border: 'border-black/10',
          borderStrong: 'border-black/15',
          panel: 'border-black/15 bg-white shadow-black/5',
          activeBg: 'bg-black/[0.05]',
          hoverBg: 'hover:bg-black/[0.04]',
          accent: 'text-[#171917]',
        }
      : {
          muted: 'text-muted-foreground',
          subtle: 'text-muted-foreground',
          strong: 'text-foreground',
          border: 'border-border',
          borderStrong: 'border-border',
          panel: 'border-border bg-card shadow-black/5',
          activeBg: 'bg-secondary/60',
          hoverBg: 'hover:bg-secondary/40',
          accent: 'accent-mark',
        }
  const data = useMemo<SiteData>(
    () => ({
      ...SAMPLE_SITE_DATA,
      name: visitorName || SAMPLE_SITE_DATA.name,
      theme: { primaryColor: meta.defaultColor },
    }),
    [meta, visitorName]
  )
  const plateNo = String(current + 1).padStart(2, '0')

  return (
    <section id="templates" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="reveal mb-10 max-w-xl">
        <p className={cn('font-mono text-xs uppercase tracking-[0.3em]', tone.muted)}>
          {scope === 'artist' ? 'Portfolio templates' : 'Templates'}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {scope === 'artist' ? '七套版式，七种看法' : '十三套版式，十三种性格'}
        </h2>
        <p className={cn('mt-3', tone.muted)}>
          {scope === 'artist'
            ? '同一批作品，换一种观看方式：画册、动线、选片台、藏品目录、工作台、手卷、海报墙。样张是真实渲染，选中即进入编辑器。'
            : '像翻样册一样浏览：索引悬停即换，样张全部真实渲染，看到的就是选用后得到的。艺术作品集版式在艺术方向首页单独陈列。'}
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* 小屏：样张 sticky 在顶部，翻索引时始终能看到变化 */}

        {/* 左：样张 Plate（全视口 sticky，翻索引时样张常驻可见） */}
        <div className="reveal sticky top-20 lg:top-24">
          <div className={cn('relative border p-3 shadow-lg', tone.panel)}>
            <CropMarks />
            <div
              ref={boxRef}
              className={cn('relative overflow-hidden border', tone.borderStrong)}
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
                  {isArtist ? (
                    <ArtistSiteFrame
                      data={artistData}
                      template={meta.name as ArtistTemplateName}
                      className="h-full overflow-hidden"
                    />
                  ) : (
                    <SiteFrame data={data} template={meta.name as never} />
                  )}
                </div>
              </div>
            </div>
            <div
              className={cn(
                'flex flex-wrap items-center gap-x-3 gap-y-1 px-1 pt-3 font-mono text-[11px] uppercase tracking-[0.18em]',
                tone.muted
              )}
            >
              <span className={tone.strong}>
                Plate {plateNo} / {String(items.length).padStart(2, '0')}
              </span>
              <span aria-hidden="true" className="h-px w-6 bg-current opacity-30" />
              <span>{meta.displayName}</span>
              <span className={cn('ml-auto rounded-sm border px-1.5 py-0.5', tone.border)}>
                {meta.mood === 'dark' ? '深色' : '浅色'}
              </span>
            </div>
          </div>
          <Button asChild size="lg" className="mt-5 w-full gap-2">
            <Link
              href={
                isArtist ? `/artist-editor?template=${meta.name}` : `/editor?template=${meta.name}`
              }
            >
              {isArtist ? '用这套布置作品集' : '用这套开始'} <ArrowRight />
            </Link>
          </Button>
          <p className={cn('mt-3 text-center font-mono text-[11px]', tone.subtle)}>
            悬停 / 聚焦 / 点按索引即可换张
          </p>
        </div>

        {/* 右：样册索引 */}
        <ol className={cn('border-t', tone.border)}>
          {items.map((t, index) => {
            const isActive = index === current
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
                    'group grid w-full grid-cols-[2.2rem_1fr_auto] items-center gap-x-3 border-b px-2 py-3 text-left transition-all duration-200 sm:grid-cols-[2.2rem_1.2fr_1fr_auto]',
                    tone.border,
                    isActive ? tone.activeBg : tone.hoverBg
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-xs transition-colors',
                      isActive ? cn(tone.accent, 'font-bold') : tone.muted
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn('h-2.5 w-2.5 flex-none rounded-full border', tone.borderStrong)}
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
                  <span
                    className={cn(
                      'hidden truncate font-display text-sm italic sm:block',
                      tone.muted
                    )}
                  >
                    {t.tagline}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn('font-mono text-[11px] uppercase tracking-wider', tone.muted)}
                    >
                      {t.mood === 'dark' ? 'Dark' : 'Light'}
                    </span>
                    <ArrowRight
                      className={cn(
                        'h-3.5 w-3.5 transition-all duration-200',
                        isActive
                          ? cn(tone.accent, 'translate-x-0 opacity-100')
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
