/** Gallery React 预览容器：与最终导出共用同一份 CSS + body */
'use client'

import { useMemo } from 'react'
import type { ArtistSiteData, ArtistTemplateName } from '@/types/artist'
import { renderArtistFragment } from '@/lib/generators/artist/html-generator'
import { useArtistEditorStore } from '@/lib/stores/artist-editor-store'

export function ArtistSiteFrame({
  data,
  template: templateProp,
  className,
}: {
  data: ArtistSiteData
  /** 显式指定版式（首页橱窗用）；不传则跟随编辑器当前版式 */
  template?: ArtistTemplateName
  className?: string
}) {
  const storeTemplate = useArtistEditorStore((state) => state.template)
  const template = templateProp ?? storeTemplate
  const fragment = useMemo(() => renderArtistFragment(data, template), [data, template])
  return (
    <div className={className ?? 'artist-frame h-full overflow-auto'}>
      <style dangerouslySetInnerHTML={{ __html: fragment.css }} />
      <div dangerouslySetInnerHTML={{ __html: fragment.body }} />
    </div>
  )
}
