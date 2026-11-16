/**
 * 编辑器页面：左表单右预览的双栏工作台（移动端改为「编辑/预览」双视图切换）。
 * URL 初始化：?id= 从数据库加载站点；?template= 以指定模板新建（画廊入口）。
 * 水合门控：未 hydrated 前渲染骨架屏，避免 localStorage 恢复导致的水合不一致。
 * Suspense 包裹是 Next 14 对 useSearchParams 的静态预渲染强制要求。
 */
'use client'

import { Suspense, useEffect, useState } from 'react'
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
              mobileView === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            <Eye className="h-3 w-3" /> 实时预览
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            'panel-scroll w-full shrink-0 overflow-y-auto border-r bg-card p-4 lg:block lg:w-[420px]',
            mobileView === 'preview' && 'hidden'
          )}
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