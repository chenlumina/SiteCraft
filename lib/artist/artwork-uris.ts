/**
 * 示例作品图源：梵高六幅代表作（公有领域）的本地副本。
 * 图片放在 public/images/artworks/van-gogh/，导出时由 inlineArtistAssets 转成 data URI，
 * 因此产物仍是「零依赖单文件」；站点预览则直接走静态文件，不进 JS 包体。
 *
 * 来源见同目录 sources.json；替换真实高清扫描件时只换文件、不改任何代码。
 */
export const ARTWORK_URI = {
  starry: '/images/artworks/van-gogh/starry.jpg',
  sunflowers: '/images/artworks/van-gogh/sunflowers.jpg',
  irises: '/images/artworks/van-gogh/irises.jpg',
  bedroom: '/images/artworks/van-gogh/bedroom.jpg',
  wheatfield: '/images/artworks/van-gogh/wheatfield.jpg',
  portrait: '/images/artworks/van-gogh/portrait.jpg',
} as const

export type ArtworkKey = keyof typeof ARTWORK_URI
