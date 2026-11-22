/**
 * 艺术首页「我的作品集站点」：只列 7 套艺术模板的站点（服务端已按模板过滤）。
 * 白盒风格：白卡片 + 黑字灰阶 + 细分隔线；删除是两步确认，4 秒未确认自动取消。
 */
'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ApiResponse } from '@/types'
import type { ArtistSiteRecord, ArtistTemplateName } from '@/types/artist'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const TEMPLATE_LABEL: Record<ArtistTemplateName, string> = {
  gallery: '画廊',
  exhibition: '展览',
  contact: '印样',
  index: '索引',
  studio: '工作室',
  scroll: '长卷',
  poster: '海报墙',
}

export function ArtistSites() {
  const [sites, setSites] = useState<ArtistSiteRecord[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/artist/sites')
      const json = (await res.json()) as ApiResponse<ArtistSiteRecord[]>
      if (!json.success || !json.data) throw new Error(json.error ?? '加载失败')
      setSites(json.data)
      setLoadError('')
    } catch (error) {
      // 失败与「没有站点」是两回事：不能伪装成空列表，否则用户以为作品集丢了
      setLoadError(error instanceof Error ? error.message : '加载失败')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // 两步删除的确认态 4 秒后自动取消，避免误按后一直挂着
  useEffect(() => {
    if (!confirmId) return
    const timer = setTimeout(() => setConfirmId(null), 4000)
    return () => clearTimeout(timer)
  }, [confirmId])

  async function remove(id: string) {
    setConfirmId(null)
    try {
      const res = await fetch(`/api/artist/sites/${id}`, { method: 'DELETE' })
      const json = (await res.json()) as ApiResponse<unknown>
      if (!json.success) {
        toast.error(json.error ?? '删除失败')
        return
      }
      toast.success('已删除站点')
      void load()
    } catch {
      toast.error('网络错误，无法删除')
    }
  }

  return (
    <section id="sites" className="mt-16 scroll-mt-24" aria-label="我的作品集站点">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-black/50">
            My portfolio sites
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">我的作品集站点</h2>
          <p className="mt-2 text-sm text-black/60">已保存的作品集站点，随时回来继续整理。</p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/artist-editor?new=1">
            <Plus className="h-4 w-4" /> 新建作品集站点
          </Link>
        </Button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-dashed border-black/15 p-10 text-center">
          <p className="font-medium">作品集站点加载失败</p>
          <p className="mt-1 text-sm text-black/55">{loadError}</p>
          <Button variant="outline" className="mt-5 border-black/15" onClick={() => void load()}>
            重试
          </Button>
        </div>
      ) : sites === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg border border-black/10 bg-white/60"
            />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 p-10 text-center">
          <p className="font-medium">还没有作品集站点</p>
          <p className="mt-1 text-sm text-black/55">挑一套版式，从这里开始整理你的数字展厅。</p>
          <Button asChild className="mt-5">
            <Link href="/artist-editor?new=1">开始策展</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <li
              key={site.id}
              className="rounded-lg border border-black/10 bg-white p-4 transition-colors hover:border-black/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">{site.name}</p>
                  <p className="mt-1 font-mono text-[11px] text-black/50">
                    {TEMPLATE_LABEL[site.template] ?? site.template} · 更新于{' '}
                    {formatDateTime(site.updatedAt)}
                  </p>
                </div>
                <span className="rounded-sm border border-black/15 px-1.5 py-0.5 text-[11px] text-black/55">
                  {site.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 border-black/15 hover:border-black/40"
                >
                  <Link href={`/artist-editor?id=${site.id}`}>
                    <Pencil className="h-3.5 w-3.5" /> 编辑
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-black/55 hover:text-[#9e2b25]"
                  onClick={() =>
                    confirmId === site.id ? void remove(site.id) : setConfirmId(site.id)
                  }
                  aria-label={confirmId === site.id ? `确认删除 ${site.name}` : `删除 ${site.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {confirmId === site.id ? '确认删除？' : '删除'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
