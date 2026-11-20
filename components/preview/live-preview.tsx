/**
 * 编辑器右栏实时预览：订阅 store.data/template/device，任何编辑立即重渲染。
 *
 * 移动端两种看法（顶栏最后一个图标切换）：
 * - 滚动（默认）：机身固定 390×844 真机比例，内部滚动，模拟真机一屏；
 * - 整页：机身按页面全长展开，改由外层滚动，能从头看完整界面。
 *
 * 机身不能「撑满可用高度」——那样会变成 390×740 的矮胖方块，比例不像手机。
 * 现在是尺寸恒定 + 整体等比缩放：transform 只影响渲染、不改变布局尺寸，
 * 所以外面必须套一个「宽高 = 机身 × 缩放比」的占位盒，栅格才会按缩小后的尺寸居中。
 */
'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Monitor, Scaling, Smartphone } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { getTemplate } from '@/lib/templates'
import { SiteFrame } from '@/components/templates/site-frame'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** 机身外框：390×844 的屏幕 + 4px 描边 + 6px 内 padding */
/** 区块 id → 中文标签，避免从标题里截出「01 · SKILLS」这种碎片 */
const SECTION_LABEL: Record<string, string> = {
  skills: '技能',
  projects: '项目',
  experience: '经历',
  contact: '联系',
}

const PHONE_W = 390 + 8 + 12
const PHONE_H = 844 + 8 + 12 + 8

export function LivePreview() {
  const data = useEditorStore((s) => s.data)
  const template = useEditorStore((s) => s.template)
  const device = useEditorStore((s) => s.device)
  const setDevice = useEditorStore((s) => s.setDevice)
  const paneRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const meta = getTemplate(template)
  /** 移动端「整页」：机身按页面全长展开，外层滚动 */
  const [fitAll, setFitAll] = useState(false)
  /** 机身等比缩放比：只由可用高度决定，保证整台机器完整落在预览区里 */
  const [fit, setFit] = useState(1)
  /** 舞台可用宽度：左栏拖宽后预览会变窄，结构导航要跟着收起（视口宽度不可靠） */
  const [stageW, setStageW] = useState(0)
  const mobileWholePage = device === 'mobile' && fitAll
  /** 手机预览左侧的「页面结构」：页面 3000px 长，光靠机身内滚动很难找位置 */
  const [outline, setOutline] = useState<{ id: string; label: string; pct: number }[]>([])
  const [active, setActive] = useState<string>('')
  /** 章节在站点内的绝对偏移（px），采集一次，滚动时只做数值比较 */
  const offsetsRef = useRef<{ id: string; y: number }[]>([])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage || device !== 'mobile') return
    const compute = () => {
      setStageW(stage.clientWidth)
      // clientHeight 含 padding，必须减掉，否则机身会超出预览区上下各 16px（被裁）
      const cs = getComputedStyle(stage)
      // 再留 40px：机身阴影（y+16 模糊 24）会画出元素盒子，不留空间就会被裁成"尾巴被切"
      const inner =
        stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 40
      setFit(Math.max(0.42, Math.min(1, inner / PHONE_H)))
    }
    compute()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(compute)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [device])

  // 采集章节：直接读生成出来的真实 DOM，不依赖模板内部的类名
  useLayoutEffect(() => {
    const pane = paneRef.current
    const root = pane?.querySelector('.site-root')
    if (!pane || !root || device !== 'mobile') {
      setOutline([])
      return
    }
    const total = root.scrollHeight || 1
    const items: { id: string; label: string; pct: number }[] = [{ id: '', label: '顶部', pct: 0 }]
    const offsets: { id: string; y: number }[] = []
    const base = root.getBoundingClientRect().top
    for (const el of Array.from(root.querySelectorAll('section[id]'))) {
      offsets.push({ id: el.id, y: el.getBoundingClientRect().top - base + pane.scrollTop })
      // 标签优先用区块 id 对应的中文名：标题里常带「01 · SKILLS」这类编号与英文 kicker，
      // 直接截标题会得到「0101 · SKI」这种垃圾
      const label =
        SECTION_LABEL[el.id] ?? (el.querySelector('h2')?.textContent ?? el.id).trim().slice(0, 6)
      items.push({
        id: el.id,
        label,
        pct: Math.round((el.getBoundingClientRect().height / total) * 100),
      })
    }
    offsetsRef.current = offsets
    setOutline(items)
  }, [data, template, device])

  // 机身内滚动时高亮当前章节
  useLayoutEffect(() => {
    const pane = paneRef.current
    const root = pane?.querySelector('.site-root')
    if (!pane || !root || device !== 'mobile') return
    // 用采集时算好的绝对偏移，避免每次滚动重算 rect（rect 会随滚动一起位移，容易算错基准）
    const onScroll = () => {
      const y = pane.scrollTop + 80
      let current = ''
      for (const o of offsetsRef.current) {
        if (o.y <= y) current = o.id
      }
      setActive(current)
    }
    pane.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => pane.removeEventListener('scroll', onScroll)
  }, [data, template, device, outline.length])

  function jumpTo(id: string) {
    const pane = paneRef.current
    const root = pane?.querySelector('.site-root')
    if (!pane || !root) return
    if (!id) {
      pane.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const hit = offsetsRef.current.find((o) => o.id === id)
    if (hit) pane.scrollTo({ top: Math.max(0, hit.y - 8), behavior: 'smooth' })
  }

  // 捕获阶段拦截：生成器 HTML 里的 a 不是 React 元素，只能在外层统一处理。
  function handleClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest('a')
    if (!anchor) return
    e.preventDefault()
    const href = anchor.getAttribute('href') ?? ''
    if (href.startsWith('#') && paneRef.current) {
      const id = href.slice(1)
      const target = paneRef.current.querySelector('[id="' + CSS.escape(id) + '"]')
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const phoneChrome = (
    <>
      <div className="mx-auto mb-1 h-1 w-16 shrink-0 rounded-full bg-background/40" />
      <div
        ref={paneRef}
        className={cn(
          'panel-scroll min-h-0 flex-1 rounded-[1.7rem]',
          mobileWholePage ? 'overflow-visible' : 'overflow-y-auto'
        )}
        style={mobileWholePage ? undefined : { maxHeight: 844 }}
      >
        <SiteFrame data={data} template={template} />
      </div>
    </>
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">实时预览</span>
          <Badge variant="secondary" className="gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.defaultColor }} />
            {meta.displayName}
          </Badge>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-background p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="桌面预览"
                aria-pressed={device === 'desktop'}
                className={cn('h-7 w-8', device === 'desktop' && 'bg-primary/20 text-primary')}
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>桌面宽度</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="移动端预览"
                aria-pressed={device === 'mobile'}
                className={cn('h-7 w-8', device === 'mobile' && 'bg-primary/20 text-primary')}
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>移动端（390×844 真机比例）</TooltipContent>
          </Tooltip>
          {device === 'mobile' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="整页预览"
                  aria-pressed={fitAll}
                  className={cn('h-7 w-8', fitAll && 'bg-primary/20 text-primary')}
                  onClick={() => setFitAll((v) => !v)}
                >
                  <Scaling className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {fitAll ? '切回：手机内滚动' : '整页：机身展开到页面全长'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div
        ref={stageRef}
        className={cn(
          'min-h-0 flex-1 p-4 lg:p-6',
          mobileWholePage
            ? 'overflow-y-auto'
            : 'flex items-center justify-center gap-10 overflow-hidden'
        )}
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.09) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        onClickCapture={handleClickCapture}
      >
        {device === 'mobile' && !mobileWholePage && outline.length > 1 && stageW >= 620 && (
          <nav aria-label="页面结构" className="flex w-44 shrink-0 flex-col gap-1">
            <p className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground">
              页面结构
            </p>
            {outline.map((s, i) => (
              <button
                key={s.id || 'top'}
                type="button"
                onClick={() => jumpTo(s.id)}
                aria-current={active === s.id ? 'true' : undefined}
                className={cn(
                  'group flex items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors',
                  active === s.id
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <span className="w-4 shrink-0 font-mono text-[10px] opacity-60">
                  {String(i).padStart(2, '0')}
                </span>
                <span className="truncate">{s.label}</span>
                <span className="ml-auto h-[3px] w-8 shrink-0 rounded-full bg-border">
                  <span
                    className="block h-full rounded-full bg-primary/70"
                    style={{ width: Math.max(6, Math.min(100, s.pct)) + '%' }}
                  />
                </span>
              </button>
            ))}
          </nav>
        )}
        {device === 'desktop' ? (
          <div
            ref={paneRef}
            className="panel-scroll h-full w-full max-w-[1100px] overflow-y-auto rounded-lg border bg-card shadow-xl shadow-black/10"
          >
            <SiteFrame data={data} template={template} />
          </div>
        ) : mobileWholePage ? (
          <div className="mx-auto w-[390px] max-w-full">
            <div className="flex flex-col rounded-[2.2rem] border-4 border-foreground/80 bg-foreground p-1.5 shadow-xl shadow-black/15">
              {phoneChrome}
            </div>
          </div>
        ) : (
          <div className="relative" style={{ width: PHONE_W * fit, height: PHONE_H * fit }}>
            <div
              className="absolute left-0 top-0 flex flex-col rounded-[2.2rem] border-4 border-foreground/80 bg-foreground p-1.5 shadow-xl shadow-black/15"
              style={{
                width: PHONE_W,
                height: PHONE_H,
                transform: 'scale(' + fit + ')',
                transformOrigin: 'top left',
              }}
            >
              {phoneChrome}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
