import type { ArtistSiteData } from '@/types/artist'

async function inlineUrl(url: string): Promise<string> {
  if (!url.startsWith('/')) return url
  try {
    const response = await fetch(url)
    if (!response.ok) return url
    // 不用 FileReader：Node（测试、SSR）里没有这个 API，arrayBuffer + btoa 两处都能跑
    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
    }
    const type = response.headers.get('content-type')?.split(';')[0] || 'application/octet-stream'
    return `data:${type};base64,${btoa(binary)}`
  } catch {
    return url
  }
}

/** 导出前把站内 SVG 等媒体转为 data URI，保证单文件离线打开不出现 404 */
export async function inlineArtistAssets(data: ArtistSiteData): Promise<ArtistSiteData> {
  const next = JSON.parse(JSON.stringify(data)) as ArtistSiteData
  next.avatar = await inlineUrl(next.avatar)
  for (const artwork of next.artworks) {
    artwork.cover = await inlineUrl(artwork.cover)
    for (const media of artwork.media) {
      media.url = await inlineUrl(media.url)
    }
  }
  return next
}
