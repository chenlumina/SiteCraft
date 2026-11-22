/** 艺术编辑器独立状态：只管理作品与媒体，不混入开发站点的技能/项目操作 */
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ArtistSiteData,
  ArtistSiteRecord,
  Artwork,
  MediaItem,
  Exhibition,
  ArtistTemplateName,
} from '@/types/artist'
import { createGallerySampleData } from '@/lib/artist/sample-gallery'
import { buildArtistPreviewData } from '@/lib/artist/preview-data'
import { moveItem, uid } from '@/lib/utils'
import {
  MAX_ARTWORK_COUNT,
  MAX_EXHIBITION_COUNT,
  MAX_MEDIA_PER_ARTWORK,
} from '@/lib/validators/artist-schema'

interface ArtistEditorState {
  siteId: string | null
  siteName: string
  template: ArtistTemplateName
  data: ArtistSiteData
  dirty: boolean
  saving: boolean
  newArtistSite: (name?: string) => void
  /** 以首页预览的同一份数据初始化（名字/方向/城市） */
  usePreviewData: (overrides: { name?: string; title?: string; location?: string }) => void
  loadArtistSite: (record: ArtistSiteRecord) => void
  setSiteName: (name: string) => void
  setTemplate: (template: ArtistTemplateName) => void
  updateData: (patch: Partial<ArtistSiteData>) => void
  addArtwork: () => void
  updateArtwork: (id: string, patch: Partial<Omit<Artwork, 'id'>>) => void
  removeArtwork: (id: string) => void
  moveArtwork: (from: number, to: number) => void
  setFeatured: (id: string) => void
  addExhibition: () => void
  updateExhibition: (id: string, patch: Partial<Omit<Exhibition, 'id'>>) => void
  removeExhibition: (id: string) => void
  addMedia: (artworkId: string, seed?: { url?: string; title?: string }) => void
  updateMedia: (artworkId: string, mediaId: string, patch: Partial<Omit<MediaItem, 'id'>>) => void
  removeMedia: (artworkId: string, mediaId: string) => void
  moveMedia: (artworkId: string, from: number, to: number) => void
  markSaved: (id: string) => void
  setSaving: (saving: boolean) => void
}

export const useArtistEditorStore = create<ArtistEditorState>()(
  persist(
    (set) => ({
      siteId: null,
      siteName: '我的作品集',
      template: 'gallery' as ArtistTemplateName,
      data: createGallerySampleData(),
      dirty: false,
      saving: false,

      usePreviewData: (overrides) =>
        set({
          data: buildArtistPreviewData(overrides),
          dirty: false,
        }),
      newArtistSite: (name) =>
        set({
          siteId: null,
          siteName: '我的作品集',
          template: 'gallery',
          data: { ...createGallerySampleData(), name: name?.trim() || '' },
          dirty: false,
          saving: false,
        }),
      loadArtistSite: (record) =>
        set({
          siteId: record.id,
          siteName: record.name,
          template: record.template,
          data: record.content,
          dirty: false,
          saving: false,
        }),
      setSiteName: (siteName) => set({ siteName, dirty: true }),
      setTemplate: (template) => set({ template, dirty: true }),
      updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch }, dirty: true })),

      addArtwork: () =>
        set((state) => {
          if (state.data.artworks.length >= MAX_ARTWORK_COUNT) return state
          const artwork: Artwork = {
            id: uid(),
            title: '',
            series: '',
            year: new Date().getFullYear().toString(),
            medium: '',
            dimensions: '',
            description: '',
            cover: '',
            media: [],
            featured: false,
          }
          return {
            dirty: true,
            data: { ...state.data, artworks: [...state.data.artworks, artwork] },
          }
        }),
      updateArtwork: (id, patch) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            artworks: state.data.artworks.map((artwork) =>
              artwork.id === id ? { ...artwork, ...patch } : artwork
            ),
          },
        })),
      removeArtwork: (id) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            artworks: state.data.artworks.filter((artwork) => artwork.id !== id),
          },
        })),
      moveArtwork: (from, to) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, artworks: moveItem(state.data.artworks, from, to) },
        })),
      setFeatured: (id) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            artworks: state.data.artworks.map((artwork) => ({
              ...artwork,
              featured: artwork.id === id ? !artwork.featured : false,
            })),
          },
        })),

      addExhibition: () =>
        set((state) => {
          const list = state.data.exhibitions ?? []
          if (list.length >= MAX_EXHIBITION_COUNT) return state
          return {
            dirty: true,
            data: {
              ...state.data,
              exhibitions: [
                ...list,
                {
                  id: uid(),
                  year: String(new Date().getFullYear()),
                  title: '',
                  venue: '',
                  role: 'group' as const,
                },
              ],
            },
          }
        }),
      updateExhibition: (id, patch) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            exhibitions: (state.data.exhibitions ?? []).map((x) =>
              x.id === id ? { ...x, ...patch } : x
            ),
          },
        })),
      removeExhibition: (id) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            exhibitions: (state.data.exhibitions ?? []).filter((x) => x.id !== id),
          },
        })),

      addMedia: (artworkId, seed) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            artworks: state.data.artworks.map((artwork) => {
              if (artwork.id !== artworkId || artwork.media.length >= MAX_MEDIA_PER_ARTWORK)
                return artwork
              const media: MediaItem = {
                id: uid(),
                url: seed?.url ?? '',
                title: seed?.title ?? '',
              }
              return { ...artwork, media: [...artwork.media, media] }
            }),
          },
        })),
      updateMedia: (artworkId, mediaId, patch) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            artworks: state.data.artworks.map((artwork) =>
              artwork.id === artworkId
                ? {
                    ...artwork,
                    media: artwork.media.map((media) =>
                      media.id === mediaId ? { ...media, ...patch } : media
                    ),
                  }
                : artwork
            ),
          },
        })),
      removeMedia: (artworkId, mediaId) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            artworks: state.data.artworks.map((artwork) =>
              artwork.id === artworkId
                ? { ...artwork, media: artwork.media.filter((media) => media.id !== mediaId) }
                : artwork
            ),
          },
        })),
      moveMedia: (artworkId, from, to) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            artworks: state.data.artworks.map((artwork) =>
              artwork.id === artworkId
                ? { ...artwork, media: moveItem(artwork.media, from, to) }
                : artwork
            ),
          },
        })),
      markSaved: (id) => set({ siteId: id, dirty: false, saving: false }),
      setSaving: (saving) => set({ saving }),
    }),
    {
      name: 'sitecraft-artist-editor',
      version: 1,
      partialize: (state) => ({
        siteId: state.siteId,
        siteName: state.siteName,
        data: state.data,
        dirty: state.dirty,
      }),
    }
  )
)
