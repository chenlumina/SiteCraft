/** Gallery React 预览容器：与最终导出共用同一份 CSS + body */
'use client'

import { useMemo } from 'react'
import type { ArtistSiteData } from '@/types/artist'
import { renderGalleryFragment } from '@/lib/generators/artist/html-generator'

export function ArtistSiteFrame({ data }: { data: ArtistSiteData }) {
  const fragment = useMemo(() => renderGalleryFragment(data), [data])
  return (
    <div className="artist-frame h-full overflow-auto">
      <style dangerouslySetInnerHTML={{ __html: fragment.css }} />
      <div dangerouslySetInnerHTML={{ __html: fragment.body }} />
    </div>
  )
}
