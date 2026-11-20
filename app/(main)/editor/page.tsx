/**
 * 编辑器页面：左表单右预览的双栏工作台（移动端改为「编辑/预览」双视图切换）。
 * URL 初始化：?id= 从数据库加载站点；?template= 以指定模板新建（画廊入口）。
 * 水合门控：未 hydrated 前渲染骨架屏，避免 localStorage 恢复导致的水合不一致。
 * Suspense 包裹是 Next 14 对 useSearchParams 的静态预渲染强制要求。
 */
'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Briefcase, Eye, FilePlus2, FolderGit2, Palette, Sparkles, User } from 'lucide-react'
import { toast } from 'sonner'
import type { ApiResponse, SiteRecord, TemplateName } from '@/types'
import { useEditorHydrated, useEditorStore } from '@/lib/stores/editor-store'
import { isTemplateName } from '@/lib/templates'
import { EditorToolbar } from '@/components/editor/editor-toolbar'
import { BasicInfoForm } from '@/components/editor/basic-info-form'
import { SkillInput } from '@/components/editor/skill-input'
import { ProjectInput } from '@/components/editor/project-input'
import { ExperienceInput } from '@/components/editor/experience-input'
import { ThemePanel } from '@/components/editor/theme-panel'
import { LivePreview } from '@/components/preview/live-preview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/** 左栏宽度约束：太窄表单挤成一条，太宽预览没地方站 */
const LEFT_MIN = 320
const LEFT_MAX = 720
const PREVIEW_MIN = 420
const LEFT_DEFAULT = 420
const LEFT_STORAGE_KEY = 'sitecraft-panel-width'

function EditorSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="h-14 animate-pulse border-b bg-muted" />
      <div className="flex flex-1 gap-4 p-4">
        <div className="w-[420px] animate-pulse rounded-xl bg-muted" />
        <div className="flex-1 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}

function NewSiteButton() {
  const dirty = useEditorStore((s) => s.dirty)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function createNew() {
    useEditorStore.getState().newSite()
    setConfirmOpen(false)
    toast.success('已创建新站点', { description: '已预填示例内容，直接修改即可' })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground"
        onClick={() => (dirty ? setConfirmOpen(true) : createNew())}
      >
        <FilePlus2 /> 新建站点
      </Button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>放弃未保存的修改？</DialogTitle>
            <DialogDescription>当前站点有未保存的修改，新建站点后将无法恢复。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              继续编辑
            </Button>
            <Button variant="destructive" onClick={createNew}>
              放弃并新建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EditorInner() {
  const splitRef = useRef<HTMLDivElement | null>(null)
  /** 容器真正挂载（水合门控前是骨架屏，那时拿不到宽度） */
  const [splitReady, setSplitReady] = useState(false)
  const draggingRef = useRef(false)
  const [leftWidth, setLeftWidth] = useState(LEFT_DEFAULT)
  /** 只有 lg 以上才固定左栏宽度：手机上左栏是整屏宽，不能被内联宽度锁死 */
  const [isLg, setIsLg] = useState(false)

  /** 夹到「左栏最小 / 右栏最小」之间——窗口越窄，左栏能拖的上限越小 */
  const clampWidth = useCallback((next: number) => {
    const total = splitRef.current?.clientWidth ?? 0
    // total=0 说明布局还没就位（首次挂载时恢复 localStorage 会撞上这情况），
    // 此时不能按「总宽 - 预览最小」去夹，否则会把记住的宽度压成 320
    // 减去 1px 分隔条，保证预览真的拿到 PREVIEW_MIN
    const max =
      total > LEFT_MIN + PREVIEW_MIN ? Math.min(LEFT_MAX, total - PREVIEW_MIN - 1) : LEFT_MAX
    return Math.round(Math.max(LEFT_MIN, Math.min(max, next)))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsLg(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // 恢复上次拖到的宽度（刷新/重新进编辑器都还在）
  useEffect(() => {
    const saved = Number(window.localStorage.getItem(LEFT_STORAGE_KEY))
    if (Number.isFinite(saved) && saved >= LEFT_MIN) setLeftWidth(clampWidth(saved))
  }, [clampWidth])

  // 容器一挂载就夹一次，并持续跟随尺寸变化：骨架屏阶段拿不到宽度，
  // 只靠 rAF 会在骨架消失前跑完，留下「700 + 预览 399」这种错误状态
  useEffect(() => {
    const el = splitRef.current
    if (!splitReady || !el) return
    setLeftWidth((w) => clampWidth(w))
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setLeftWidth((w) => clampWidth(w)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [splitReady, clampWidth])

  // 窗口变窄时把左栏收回来，避免把预览挤没
  useEffect(() => {
    const onResize = () => setLeftWidth((w) => clampWidth(w))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clampWidth])

  const commitWidth = useCallback(
    (next: number) => {
      const w = clampWidth(next)
      setLeftWidth(w)
      window.localStorage.setItem(LEFT_STORAGE_KEY, String(w))
    },
    [clampWidth]
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const rect = splitRef.current?.getBoundingClientRect()
      if (!rect) return
      e.preventDefault()
      commitWidth(e.clientX - rect.left)
    }
    const onUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [commitWidth])

  const hydrated = useEditorHydrated()
  const searchParams = useSearchParams()
  const [loadingSite, setLoadingSite] = useState(false)
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const siteId = useEditorStore((s) => s.siteId)

  useEffect(() => {
    if (!hydrated) return
    const id = searchParams.get('id')
    const templateParam = searchParams.get('template')
    if (id) {
      setLoadingSite(true)
      fetch(`/api/sites/${id}`)
        .then((res) => res.json() as Promise<ApiResponse<SiteRecord>>)
        .then((json) => {
          if (json.success && json.data) {
            useEditorStore.getState().loadSite(json.data)
          } else {
            toast.error(json.error ?? '站点不存在，已为你打开新站点')
          }
        })
        .catch(() => toast.error('加载站点失败，请检查网络'))
        .finally(() => setLoadingSite(false))
    } else if (templateParam && isTemplateName(templateParam)) {
      useEditorStore.getState().newSite(templateParam as TemplateName)
    }
    // 仅在挂载时根据 URL 初始化一次；searchParams 变化不应重置用户正在编辑的内容
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  if (!hydrated || loadingSite) return <EditorSkeleton />

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorToolbar />
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-1.5 lg:hidden">
        <div className="flex gap-1 rounded-lg bg-background p-1">
          <button
            type="button"
            onClick={() => setMobileView('edit')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              mobileView === 'edit' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            编辑内容
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={cn(
              'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
              mobileView === 'preview'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Eye className="h-3 w-3" /> 实时预览
          </button>
        </div>
      </div>

      <div
        ref={(el) => {
          splitRef.current = el
          if (el) setSplitReady(true)
        }}
        className="flex min-h-0 flex-1"
      >
        <aside
          className={cn(
            'panel-scroll w-full shrink-0 overflow-y-auto bg-card p-4 lg:block',
            mobileView === 'preview' && 'hidden'
          )}
          style={isLg ? { width: leftWidth } : undefined}
          data-panel="form"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">站点内容</h2>
            <NewSiteButton />
          </div>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" aria-label="资料">
                <User /> <span className="hidden xl:inline">资料</span>
              </TabsTrigger>
              <TabsTrigger value="skills" aria-label="技能">
                <Sparkles /> <span className="hidden xl:inline">技能</span>
              </TabsTrigger>
              <TabsTrigger value="projects" aria-label="项目">
                <FolderGit2 /> <span className="hidden xl:inline">项目</span>
              </TabsTrigger>
              <TabsTrigger value="experience" aria-label="经历">
                <Briefcase /> <span className="hidden xl:inline">经历</span>
              </TabsTrigger>
              <TabsTrigger value="theme" aria-label="主题">
                <Palette /> <span className="hidden xl:inline">主题</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              {/* key=siteId：加载/新建站点时重挂载表单，defaultValues 重新取自 store */}
              <BasicInfoForm key={siteId ?? 'new'} />
            </TabsContent>
            <TabsContent value="skills">
              <SkillInput />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectInput />
            </TabsContent>
            <TabsContent value="experience">
              <ExperienceInput />
            </TabsContent>
            <TabsContent value="theme">
              <ThemePanel />
            </TabsContent>
          </Tabs>
        </aside>

        {/* 拖拽分栏：lg 以上才出现；键盘可调（←/→ 16px，Home/End 到底），双击复位 */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="拖动调整左右宽度"
          aria-valuenow={leftWidth}
          aria-valuemin={LEFT_MIN}
          aria-valuemax={LEFT_MAX}
          tabIndex={0}
          onPointerDown={(e) => {
            draggingRef.current = true
            document.body.style.userSelect = 'none'
            document.body.style.cursor = 'col-resize'
            e.preventDefault()
          }}
          onDoubleClick={() => commitWidth(LEFT_DEFAULT)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') commitWidth(leftWidth - 16)
            else if (e.key === 'ArrowRight') commitWidth(leftWidth + 16)
            else if (e.key === 'Home') commitWidth(LEFT_MIN)
            else if (e.key === 'End') commitWidth(LEFT_MAX)
          }}
          className="group relative hidden w-px shrink-0 cursor-col-resize bg-border lg:block"
        >
          <span className="absolute inset-y-0 -left-2 -right-2" />
          <span className="absolute left-1/2 top-1/2 h-9 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border transition-colors group-hover:bg-primary/60 group-focus-visible:bg-primary" />
        </div>

        <main className={cn('min-w-0 flex-1 lg:block', mobileView === 'edit' && 'hidden')}>
          <LivePreview />
        </main>
      </div>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorInner />
    </Suspense>
  )
}
