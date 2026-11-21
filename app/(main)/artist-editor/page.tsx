/**
 * 艺术作品编辑器：个人资料 / 作品与图片 / 主题，右侧 Gallery 实时预览。
 * 与开发编辑器平行，保存与导出均走艺术专用链路。
 */
'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowUp, Download, Eye, Loader2, Plus, Save, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ApiResponse } from '@/types'
import type { ArtistSiteRecord } from '@/types/artist'
import { BrandLogo } from '@/components/brand-logo'
import { ArtistSiteFrame } from '@/components/artist-editor/artist-site-frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useArtistEditorStore } from '@/lib/stores/artist-editor-store'
import { useArtistSiteActions } from '@/lib/hooks/use-artist-site-actions'
import { MAX_ARTWORK_COUNT, MAX_MEDIA_PER_ARTWORK } from '@/lib/validators/artist-schema'
import { cn } from '@/lib/utils'

function EditorSkeleton() {
  return <div className="min-h-[100dvh] animate-pulse bg-muted" />
}

function ArtistEditorInner() {
  const params = useSearchParams()
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<'profile' | 'artworks' | 'theme'>('artworks')
  const [mobilePreview, setMobilePreview] = useState(false)
  const { saveSite, exportHtml } = useArtistSiteActions()
  const { data, siteName, dirty, saving } = useArtistEditorStore()

  useEffect(() => {
    const id = params.get('id')
    if (id) {
      fetch(`/api/artist/sites/${id}`)
        .then((response) => response.json() as Promise<ApiResponse<ArtistSiteRecord>>)
        .then((json) => {
          if (json.success && json.data) useArtistEditorStore.getState().loadArtistSite(json.data)
          else toast.error(json.error ?? '作品站点不存在')
        })
        .catch(() => toast.error('读取作品站点失败'))
        .finally(() => setReady(true))
      return
    }
    if (params.get('new') === '1') {
      let name = params.get('name') ?? ''
      if (!name) {
        try {
          const profile = JSON.parse(localStorage.getItem('sitecraft-profile') ?? '{}') as {
            name?: string
          }
          name = profile.name ?? ''
        } catch {
          /* 使用示例称呼 */
        }
      }
      useArtistEditorStore.getState().newArtistSite(name)
    }
    setReady(true)
    // URL 只在挂载时初始化一次，避免覆盖用户编辑
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return <EditorSkeleton />

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <header className="flex min-h-16 flex-wrap items-center gap-3 border-b px-4 py-2">
        <Link href="/" aria-label="返回展厅">
          <BrandLogo withText={false} />
        </Link>
        <Input
          aria-label="作品集站点名称"
          value={siteName}
          onChange={(event) => useArtistEditorStore.getState().setSiteName(event.target.value)}
          className="h-8 w-44 border-transparent bg-transparent font-medium sm:w-56"
        />
        <span className="hidden text-xs text-muted-foreground md:inline">
          {dirty ? '有未保存修改' : '草稿已同步'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/artist-preview" target="_blank">
              <Eye /> <span className="hidden sm:inline">全屏预览</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void exportHtml()}>
            <Download /> <span className="hidden sm:inline">导出</span>
          </Button>
          <Button size="sm" disabled={saving} onClick={() => void saveSite()}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />} 保存
          </Button>
        </div>
      </header>

      <div className="flex gap-2 border-b px-4 py-2 lg:hidden">
        <Button
          size="sm"
          variant={mobilePreview ? 'ghost' : 'default'}
          onClick={() => setMobilePreview(false)}
        >
          编辑
        </Button>
        <Button
          size="sm"
          variant={mobilePreview ? 'default' : 'ghost'}
          onClick={() => setMobilePreview(true)}
        >
          预览
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside className={cn('overflow-y-auto border-r p-4', mobilePreview && 'hidden lg:block')}>
          <div className="mb-5 grid grid-cols-3 rounded-lg bg-muted p-1 text-xs">
            {(['profile', 'artworks', 'theme'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  'rounded-md px-3 py-2',
                  tab === item ? 'bg-card shadow-sm' : 'text-muted-foreground'
                )}
              >
                {item === 'profile' ? '个人资料' : item === 'artworks' ? '作品管理' : '主题'}
              </button>
            ))}
          </div>

          {tab === 'profile' && <ProfileForm />}
          {tab === 'artworks' && <ArtworkList />}
          {tab === 'theme' && (
            <div>
              <Label htmlFor="artist-color">强调色</Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="artist-color"
                  type="color"
                  aria-label="选择作品集强调色"
                  value={data.theme.primaryColor}
                  onChange={(event) =>
                    useArtistEditorStore
                      .getState()
                      .updateData({ theme: { primaryColor: event.target.value } })
                  }
                  className="h-10 w-14 cursor-pointer border bg-background"
                />
                <Input
                  aria-label="强调色 hex"
                  value={data.theme.primaryColor}
                  onChange={(event) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) {
                      useArtistEditorStore
                        .getState()
                        .updateData({ theme: { primaryColor: event.target.value } })
                    }
                  }}
                  className="w-32 font-mono"
                />
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                用于链接焦点等少量强调，不改变作品本身的颜色。
              </p>
            </div>
          )}
        </aside>
        <section
          className={cn(
            'min-w-0 overflow-hidden bg-[#e9e9e5] p-3 lg:p-6',
            !mobilePreview && 'hidden lg:block'
          )}
          aria-label="Gallery 实时预览"
        >
          <ArtistSiteFrame data={data} />
        </section>
      </div>
    </div>
  )
}

function ProfileForm() {
  const data = useArtistEditorStore((state) => state.data)
  const update = (
    patch: Parameters<ReturnType<typeof useArtistEditorStore.getState>['updateData']>[0]
  ) => useArtistEditorStore.getState().updateData(patch)
  return (
    <div className="space-y-4">
      <Field label="创作者称呼" htmlFor="artist-name">
        <Input
          id="artist-name"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </Field>
      <Field label="创作身份" htmlFor="artist-title">
        <Input
          id="artist-title"
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </Field>
      <Field label="创作自述" htmlFor="artist-bio">
        <Textarea
          id="artist-bio"
          rows={5}
          value={data.bio}
          onChange={(e) => update({ bio: e.target.value })}
        />
      </Field>
      <Field label="所在地" htmlFor="artist-location">
        <Input
          id="artist-location"
          value={data.location}
          onChange={(e) => update({ location: e.target.value })}
        />
      </Field>
      <Field label="联系邮箱" htmlFor="artist-email">
        <Input
          id="artist-email"
          type="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
        />
      </Field>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function ArtworkList() {
  const artworks = useArtistEditorStore((state) => state.data.artworks)
  const store = useArtistEditorStore.getState()
  return (
    <div className="space-y-3">
      <p className="text-xs leading-6 text-muted-foreground">
        重点作品会首先出现在展厅。图片使用 URL，封面未指定时使用第一张图片。
      </p>
      {artworks.map((artwork, index) => (
        <section key={artwork.id} className="rounded-lg border bg-background p-3">
          <div className="flex items-center justify-between gap-2 text-sm font-semibold">
            <span className="truncate">{artwork.title || `未命名作品 ${index + 1}`}</span>
            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label={`前移 ${artwork.title}`}
                disabled={index === 0}
                onClick={(e) => {
                  e.preventDefault()
                  store.moveArtwork(index, index - 1)
                }}
                className="grid h-6 w-6 place-items-center disabled:opacity-20"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`后移 ${artwork.title}`}
                disabled={index === artworks.length - 1}
                onClick={(e) => {
                  e.preventDefault()
                  store.moveArtwork(index, index + 1)
                }}
                className="grid h-6 w-6 place-items-center disabled:opacity-20"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`删除 ${artwork.title}`}
                onClick={(e) => {
                  e.preventDefault()
                  store.removeArtwork(artwork.id)
                }}
                className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
          <div className="mt-4 space-y-3 border-t pt-4">
            <Field label="作品标题 *" htmlFor={`title-${artwork.id}`}>
              <Input
                id={`title-${artwork.id}`}
                value={artwork.title}
                onChange={(e) => store.updateArtwork(artwork.id, { title: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="系列" htmlFor={`series-${artwork.id}`}>
                <Input
                  id={`series-${artwork.id}`}
                  value={artwork.series}
                  onChange={(e) => store.updateArtwork(artwork.id, { series: e.target.value })}
                />
              </Field>
              <Field label="年份" htmlFor={`year-${artwork.id}`}>
                <Input
                  id={`year-${artwork.id}`}
                  value={artwork.year}
                  onChange={(e) => store.updateArtwork(artwork.id, { year: e.target.value })}
                />
              </Field>
            </div>
            <Field label="媒介" htmlFor={`medium-${artwork.id}`}>
              <Input
                id={`medium-${artwork.id}`}
                value={artwork.medium}
                onChange={(e) => store.updateArtwork(artwork.id, { medium: e.target.value })}
              />
            </Field>
            <Field label="创作说明" htmlFor={`desc-${artwork.id}`}>
              <Textarea
                id={`desc-${artwork.id}`}
                rows={3}
                value={artwork.description}
                onChange={(e) => store.updateArtwork(artwork.id, { description: e.target.value })}
              />
            </Field>
            <Field label="封面 URL（可留空）" htmlFor={`cover-${artwork.id}`}>
              <Input
                id={`cover-${artwork.id}`}
                placeholder="https:// 或 /images/..."
                value={artwork.cover}
                onChange={(e) => store.updateArtwork(artwork.id, { cover: e.target.value })}
              />
            </Field>
            <Button
              type="button"
              size="sm"
              variant={artwork.featured ? 'default' : 'outline'}
              onClick={() => store.setFeatured(artwork.id)}
            >
              <Star className={artwork.featured ? 'fill-current' : ''} />{' '}
              {artwork.featured ? '重点作品' : '设为重点'}
            </Button>
            <div className="border-t pt-3">
              <p className="mb-2 text-xs font-semibold">
                图片（{artwork.media.length}/{MAX_MEDIA_PER_ARTWORK}）
              </p>
              {artwork.media.map((media, mediaIndex) => (
                <div key={media.id} className="mb-2 flex items-center gap-1.5">
                  <Input
                    aria-label={`图片 ${mediaIndex + 1} URL`}
                    placeholder="图片 URL"
                    value={media.url}
                    onChange={(e) =>
                      store.updateMedia(artwork.id, media.id, { url: e.target.value })
                    }
                    className="min-w-0 text-xs"
                  />
                  <button
                    type="button"
                    aria-label="上移图片"
                    disabled={mediaIndex === 0}
                    onClick={() => store.moveMedia(artwork.id, mediaIndex, mediaIndex - 1)}
                    className="grid h-6 w-6 place-items-center disabled:opacity-20"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="下移图片"
                    disabled={mediaIndex === artwork.media.length - 1}
                    onClick={() => store.moveMedia(artwork.id, mediaIndex, mediaIndex + 1)}
                    className="grid h-6 w-6 place-items-center disabled:opacity-20"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="删除图片"
                    onClick={() => store.removeMedia(artwork.id, media.id)}
                    className="grid h-6 w-6 place-items-center text-muted-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={artwork.media.length >= MAX_MEDIA_PER_ARTWORK}
                onClick={() => store.addMedia(artwork.id)}
                className="mt-1 w-full border-dashed"
              >
                <Plus /> 添加图片
              </Button>
            </div>
          </div>
        </section>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={artworks.length >= MAX_ARTWORK_COUNT}
        onClick={store.addArtwork}
        className="w-full border-dashed"
      >
        <Plus /> 添加作品（{artworks.length}/{MAX_ARTWORK_COUNT}）
      </Button>
    </div>
  )
}

export default function ArtistEditorPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <ArtistEditorInner />
    </Suspense>
  )
}
