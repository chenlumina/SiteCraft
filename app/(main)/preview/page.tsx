/**
 * 全屏预览页：?id= 预览数据库站点（首页「预览」入口），
 * 无 id 则预览编辑器当前内容（读 localStorage 持久化的 store）。
 * 与编辑器预览的区别：不拦截链接，mailto/外链真实可用，即「访客视角」。
 * 外层背景色取模板底色，避免加载瞬间白闪。
 */
'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { ApiResponse, SiteData, SiteRecord, TemplateName } from '@/types'
import { useEditorHydrated, useEditorStore } from '@/lib/stores/editor-store'
import { getTemplate } from '@/lib/templates'
import { TEMPLATE_BG } from '@/lib/generators/html-generator'
import { SiteFrame } from '@/components/templates/site-frame'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type PreviewState =
  | { phase: 'loading' }
  | { phase: 'ready'; data: SiteData; template: TemplateName }
  | { phase: 'error'; message: string }

function PreviewInner() {
  const hydrated = useEditorHydrated()
  const searchParams = useSearchParams()
  const storeData = useEditorStore((s) => s.data)
  const storeTemplate = useEditorStore((s) => s.template)
  const [state, setState] = useState<PreviewState>({ phase: 'loading' })

  useEffect(() => {
    if (!hydrated) return
    const id = searchParams.get('id')
    if (!id) {
      setState({ phase: 'ready', data: storeData, template: storeTemplate })
      return
    }
    fetch(`/api/sites/${id}`)
      .then((res) => res.json() as Promise<ApiResponse<SiteRecord>>)
      .then((json) => {
        if (json.success && json.data) {
          setState({ phase: 'ready', data: json.data.content, template: json.data.template })
        } else {
          setState({ phase: 'error', message: json.error ?? '站点不存在' })
        }
      })
      .catch(() => setState({ phase: 'error', message: '加载站点失败，请检查网络' }))
  }, [hydrated, searchParams, storeData, storeTemplate])

  if (state.phase === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-900">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> 正在加载预览…
        </div>
      </div>
    )
  }

  if (state.phase === 'error') {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-900 px-6">
        <div className="text-center">
          <p className="text-lg font-semibold">无法打开预览</p>
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
          <Button asChild className="mt-6">
            <Link href="/editor">
              <ArrowLeft /> 返回编辑器
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const meta = getTemplate(state.template)

  return (
    <div className="min-h-screen" style={{ backgroundColor: TEMPLATE_BG[state.template] }}>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between p-4">
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="pointer-events-auto bg-ink-900/85 text-foreground backdrop-blur hover:bg-ink-800"
        >
          <Link href="/editor">
            <ArrowLeft /> 返回编辑器
          </Link>
        </Button>
        <Badge className="pointer-events-auto bg-ink-900/85 text-foreground backdrop-blur">
          {meta.displayName} · 全屏预览
        </Badge>
      </div>
      <SiteFrame data={state.data} template={state.template} />
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-ink-900">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PreviewInner />
    </Suspense>
  )
}