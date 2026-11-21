/** Gallery 全屏预览：读取艺术编辑器本地草稿，不经过开发站点预览 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ArtistSiteData } from '@/types/artist'
import { ArtistSiteFrame } from '@/components/artist-editor/artist-site-frame'
import { useArtistEditorStore } from '@/lib/stores/artist-editor-store'

export default function ArtistPreviewPage() {
  const [data, setData] = useState<ArtistSiteData | null>(null)
  useEffect(() => {
    setData(useArtistEditorStore.getState().data)
  }, [])
  return (
    <main className="min-h-[100dvh] bg-[#f3f3f0]">
      <div className="fixed left-4 top-4 z-50">
        <Link
          href="/artist-editor"
          className="flex min-h-10 items-center gap-2 rounded-full bg-black px-4 text-xs text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 返回策展
        </Link>
      </div>
      {data && <ArtistSiteFrame data={data} />}
    </main>
  )
}
