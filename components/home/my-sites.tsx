/**
 * 「我的站点」管理区（WebApp 核心 CRUD 面板）：
 * 搜索 / 模板筛选 / 排序（视图状态持久化到 localStorage，即「保存的视图」）、
 * 批量选择 + 批量删除、发布/草稿切换（乐观更新+失败回滚）、
 * 删除走「乐观移除 + 5s 撤销窗口」：先改 UI，定时器到期才真发 DELETE，
 * 撤销即取消定时器并恢复记录——误删有后悔药，且不需要服务端软删除字段。
 */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownUp,
  Eye,
  FileEdit,
  Globe,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ApiResponse, SiteRecord, SiteStatus } from '@/types'
import { TEMPLATES, getTemplate } from '@/lib/templates'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type SortKey = 'updated' | 'name' | 'created'

interface ViewState {
  query: string
  templateFilter: string
  sort: SortKey
}

const VIEW_STORAGE_KEY = 'sitecraft-sites-view'
const UNDO_WINDOW_MS = 5000

/**
 * 读取保存的视图状态。注意：不能在 useState 初始化里直接读 localStorage——
 * SSR/预渲染拿不到 window，会导致服务端与客户端首帧不一致（水合报错）。
 * 因此首帧用默认值，挂载后 useEffect 再加载持久化视图。
 */
function loadView(): ViewState {
  if (typeof window === 'undefined') return { query: '', templateFilter: 'all', sort: 'updated' }
  try {
    const raw = window.localStorage.getItem(VIEW_STORAGE_KEY)
    if (raw) return { query: '', templateFilter: 'all', sort: 'updated', ...JSON.parse(raw) }
  } catch {
    // 忽略损坏的本地视图状态
  }
  return { query: '', templateFilter: 'all', sort: 'updated' }
}

export function MySites() {
  const [sites, setSites] = useState<SiteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [view, setView] = useState<ViewState>({ query: '', templateFilter: 'all', sort: 'updated' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null)
  // 待真删队列：id → {原记录, 定时器}。撤销时 clearTimeout 并把记录放回列表
  const pendingDeletes = useRef<Map<string, { site: SiteRecord; timer: number }>>(new Map())

  useEffect(() => {
    setView(loadView())
  }, [])

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(view))
  }, [view])

  const fetchSites = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/sites')
      const json = (await res.json()) as ApiResponse<SiteRecord[]>
      if (!json.success || !json.data) throw new Error(json.error ?? '加载失败')
      setSites(json.data.filter((site) => site.content.archetype !== 'artist'))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSites()
    const pending = pendingDeletes.current
    return () => {
      pending.forEach(({ timer }) => window.clearTimeout(timer))
      pending.clear()
    }
  }, [fetchSites])

  const visible = useMemo(() => {
    const query = view.query.trim().toLowerCase()
    const filtered = sites.filter((site) => {
      const matchQuery = !query || site.name.toLowerCase().includes(query)
      const matchTemplate = view.templateFilter === 'all' || site.template === view.templateFilter
      return matchQuery && matchTemplate
    })
    return [...filtered].sort((a, b) => {
      if (view.sort === 'name') return a.name.localeCompare(b.name, 'zh-CN')
      if (view.sort === 'created') return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [sites, view])

  /** 乐观删除：立即从列表移除 → 挂 5s 定时器真删 → toast 提供撤销 */
  function scheduleDelete(ids: string[]) {
    const removed = sites.filter((s) => ids.includes(s.id))
    setSites((prev) => prev.filter((s) => !ids.includes(s.id)))
    setSelected(new Set())
    for (const site of removed) {
      const timer = window.setTimeout(() => {
        pendingDeletes.current.delete(site.id)
        fetch(`/api/sites/${site.id}`, { method: 'DELETE' }).catch(() => undefined)
      }, UNDO_WINDOW_MS)
      pendingDeletes.current.set(site.id, { site, timer })
    }
    toast.success(`已删除 ${removed.length} 个站点`, {
      description: `${UNDO_WINDOW_MS / 1000} 秒内可撤销`,
      duration: UNDO_WINDOW_MS,
      action: {
        label: '撤销',
        onClick: () => {
          const restored: SiteRecord[] = []
          for (const site of removed) {
            const pending = pendingDeletes.current.get(site.id)
            if (pending) {
              window.clearTimeout(pending.timer)
              pendingDeletes.current.delete(site.id)
              restored.push(pending.site)
            }
          }
          if (restored.length > 0) {
            setSites((prev) => [...prev, ...restored])
            toast.success('已恢复站点')
          }
        },
      },
    })
  }

  /** 发布状态切换：先乐观改 UI，请求失败则回滚到原状态并提示，保证界面与库最终一致 */
  async function toggleStatus(site: SiteRecord) {
    const nextStatus: SiteStatus = site.status === 'published' ? 'draft' : 'published'
    setSites((prev) => prev.map((s) => (s.id === site.id ? { ...s, status: nextStatus } : s)))
    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = (await res.json()) as ApiResponse<SiteRecord>
      if (!json.success) throw new Error(json.error)
      toast.success(
        nextStatus === 'published' ? `「${site.name}」已发布` : `「${site.name}」已转为草稿`
      )
    } catch {
      setSites((prev) => prev.map((s) => (s.id === site.id ? { ...s, status: site.status } : s)))
      toast.error('状态更新失败，已回滚')
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allVisibleSelected = visible.length > 0 && visible.every((s) => selected.has(s.id))

  return (
    <section id="sites" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="reveal mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            My Sites
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            我的站点
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            站点保存在本地 SQLite
            数据库，随时回来继续编辑；带「示例」标签的站点来自种子数据，可直接删除。
          </p>
        </div>
        <Button asChild>
          <Link href="/editor">
            <Plus /> 新建站点
          </Link>
        </Button>
      </div>

      <div className="reveal mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={view.query}
            onChange={(e) => setView((v) => ({ ...v, query: e.target.value }))}
            placeholder="搜索站点名称…"
            aria-label="搜索站点"
            className="pl-9"
          />
        </div>
        <Select
          value={view.templateFilter}
          onValueChange={(value) => setView((v) => ({ ...v, templateFilter: value }))}
        >
          <SelectTrigger className="w-40" aria-label="按模板筛选">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部模板</SelectItem>
            {TEMPLATES.map((t) => (
              <SelectItem key={t.name} value={t.name}>
                {t.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={view.sort}
          onValueChange={(value) => setView((v) => ({ ...v, sort: value as SortKey }))}
        >
          <SelectTrigger className="w-36" aria-label="排序方式">
            <ArrowDownUp className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">最近更新</SelectItem>
            <SelectItem value="created">最近创建</SelectItem>
            <SelectItem value="name">名称 A → Z</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          aria-label="刷新列表"
          onClick={() => void fetchSites()}
        >
          <RefreshCw className={cn(loading && 'animate-spin')} />
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm">
          <span className="font-medium">已选择 {selected.size} 个站点</span>
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() =>
              setSelected(allVisibleSelected ? new Set() : new Set(visible.map((s) => s.id)))
            }
          >
            {allVisibleSelected ? '取消全选' : '全选当前列表'}
          </button>
          <div className="ml-auto flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmIds(Array.from(selected))}
            >
              <Trash2 /> 批量删除
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              <X /> 取消
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-8 text-center">
          <p className="text-sm text-danger">{loadError}</p>
          <Button variant="outline" className="mt-4" onClick={() => void fetchSites()}>
            <RefreshCw /> 重试
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Globe className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-medium">{sites.length === 0 ? '还没有站点' : '没有匹配的站点'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sites.length === 0 ? '创建你的第一个个人官网吧' : '试试调整搜索或筛选条件'}
          </p>
          {sites.length === 0 && (
            <Button asChild className="mt-5">
              <Link href="/editor">
                <Plus /> 创建第一个站点
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((site) => {
            const meta = getTemplate(site.template)
            const isSelected = selected.has(site.id)
            return (
              <article
                key={site.id}
                className={cn(
                  'group relative rounded-xl border bg-card p-4 transition-all hover:border-foreground/50 hover:shadow-lg',
                  isSelected && 'border-primary/60 bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(site.id)}
                    aria-label={`选择站点 ${site.name}`}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#7c6cff]"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/editor?id=${site.id}`}
                      className="block truncate font-semibold hover:underline"
                    >
                      {site.name}
                    </Link>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: meta.defaultColor }}
                      />
                      {meta.displayName} · 更新于 {formatDateTime(site.updatedAt)}
                    </p>
                  </div>
                  <Badge variant={site.status === 'published' ? 'success' : 'warning'}>
                    {site.status === 'published' ? '已发布' : '草稿'}
                  </Badge>
                  {site.id.startsWith('seed-site-') && (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground">
                      示例
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/editor?id=${site.id}`}>
                      <Pencil /> 编辑
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/preview?id=${site.id}`} target="_blank">
                      <Eye /> 预览
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`站点 ${site.name} 更多操作`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => void toggleStatus(site)}>
                        {site.status === 'published' ? (
                          <>
                            <FileEdit /> 转为草稿
                          </>
                        ) : (
                          <>
                            <Globe /> 标记为已发布
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-danger focus:text-danger"
                        onClick={() => setConfirmIds([site.id])}
                      >
                        <Trash2 /> 删除站点
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            )
          })}
          <Link
            href="/editor"
            className="grid min-h-[150px] place-items-center rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <span className="flex flex-col items-center gap-2 text-sm">
              <Plus className="h-6 w-6" />
              新建站点
            </span>
          </Link>
        </div>
      )}

      <Dialog open={confirmIds !== null} onOpenChange={(open) => !open && setConfirmIds(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              确认删除
              {confirmIds && confirmIds.length > 1 ? ` ${confirmIds.length} 个站点` : '站点'}？
            </DialogTitle>
            <DialogDescription>
              删除后 {UNDO_WINDOW_MS / 1000} 秒内可在提示中撤销，超时将从数据库永久移除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmIds(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmIds) scheduleDelete(confirmIds)
                setConfirmIds(null)
              }}
            >
              <Trash2 /> 确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
