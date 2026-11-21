'use client'

import { toast } from 'sonner'
import type { ApiResponse } from '@/types'
import type { ArtistSiteRecord } from '@/types/artist'
import { useArtistEditorStore } from '@/lib/stores/artist-editor-store'
import { generateArtistSiteHTML } from '@/lib/generators/artist/html-generator'
import { inlineArtistAssets } from '@/lib/artist/inline-assets'
import { downloadTextFile, safeFileName } from '@/lib/utils'

export function useArtistSiteActions() {
  const template = useArtistEditorStore((state) => state.template)
  async function saveSite(): Promise<ArtistSiteRecord | null> {
    const { siteId, siteName, data, markSaved, setSaving } = useArtistEditorStore.getState()
    if (!siteName.trim()) {
      toast.error('请先填写站点名称')
      return null
    }
    setSaving(true)
    try {
      const response = await fetch('/api/artist/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: siteId ?? undefined,
          name: siteName,
          template,
          content: data,
        }),
      })
      const json = (await response.json()) as ApiResponse<ArtistSiteRecord>
      if (!json.success || !json.data) {
        toast.error(json.error ?? '保存失败')
        return null
      }
      markSaved(json.data.id)
      toast.success('作品集已保存')
      return json.data
    } catch {
      toast.error('网络错误，保存失败')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function exportHtml() {
    const { data, siteName } = useArtistEditorStore.getState()
    const resolved = await inlineArtistAssets(data)
    downloadTextFile(`${safeFileName(siteName)}.html`, generateArtistSiteHTML(resolved, template))
    toast.success('已导出 Gallery 单文件')
  }

  return { saveSite, exportHtml }
}
