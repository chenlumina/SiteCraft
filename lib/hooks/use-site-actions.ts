/**
 * 站点级动作：保存（写库）与导出（纯客户端生成单文件）。
 * 保存走 POST /api/save 的 upsert 语义：有 siteId 更新、无则新建，
 * 成功后 markSaved 记录 id 与时间戳，顶栏「未保存/已保存」指示随之变化。
 */
'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import type { ApiResponse, SiteData, SiteRecord } from '@/types'
import { useEditorStore } from '@/lib/stores/editor-store'
import { track } from '@/lib/analytics'
import { DEFAULT_AVATAR_PATH, generateSiteHTML } from '@/lib/generators/html-generator'
import { downloadTextFile, safeFileName } from '@/lib/utils'

/**
 * 导出前把站内相对路径头像（/images/xxx）fetch 成 data URI 内联。
 * 原因：导出的单文件常被双击以 file:// 打开，相对路径会指向磁盘根目录而 404；
 * 内联后头像随文件走。内置默认头像已由生成器内联，这里只处理用户自定义相对路径。
 * 失败时静默回退原路径，不阻塞导出主流程。
 */
async function inlineRelativeAvatar(data: SiteData): Promise<SiteData> {
  const avatar = data.avatar.trim()
  if (!avatar.startsWith('/') || avatar === DEFAULT_AVATAR_PATH) return data
  try {
    const res = await fetch(avatar)
    if (!res.ok) return data
    const blob = await res.blob()
    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('头像读取失败'))
      reader.readAsDataURL(blob)
    })
    return { ...data, avatar: dataUri }
  } catch {
    return data
  }
}

export function useSiteActions() {
  const saveSite = useCallback(async (): Promise<SiteRecord | null> => {
    const { siteId, siteName, template, data, setSaving, markSaved } = useEditorStore.getState()
    if (!siteName.trim()) {
      toast.error('请先填写站点名称')
      return null
    }
    setSaving(true)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: siteId ?? undefined, name: siteName, template, content: data }),
      })
      const json = (await res.json()) as ApiResponse<SiteRecord>
      if (!json.success || !json.data) {
        toast.error(json.error ?? '保存失败')
        return null
      }
      markSaved(json.data.id)
      // 只在首次创建时上报；之后每次保存都算 site_created 会把转化数据撑爆
      if (!siteId) track('site_created', { template })
      toast.success('站点已保存', { description: `「${json.data.name}」已写入数据库` })
      return json.data
    } catch {
      toast.error('网络错误，保存失败')
      return null
    } finally {
      useEditorStore.getState().setSaving(false)
    }
  }, [])

  const exportHtml = useCallback(async () => {
    const { siteName, template, data } = useEditorStore.getState()
    try {
      const resolved = await inlineRelativeAvatar(data)
      const html = generateSiteHTML(resolved, template)
      downloadTextFile(`${safeFileName(siteName)}.html`, html)
      toast.success('已导出静态 HTML', { description: '可直接托管到任意静态服务器或 GitHub Pages' })
    } catch {
      toast.error('导出失败，请重试')
    }
  }, [])

  return { saveSite, exportHtml }
}
