import type { ArtistSiteData } from '@/types/artist'

async function inlineUrl(url: string): Promise<string> {
  if (!url.startsWith('/')) return url
  try {
    const response = await fetch(url)
    if (!response.ok) return url
    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('媒体读取失败'))
      reader.readAsDataURL(blob)
    })
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
      if (media.poster) media.poster = await inlineUrl(media.poster)
    }
  }
  return next
}
