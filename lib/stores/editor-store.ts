/**
 * 编辑器全局状态（Zustand，规范强制选型）。
 *
 * 为什么不用 React Hook Form 管全局：RHF 只负责「资料」Tab 的表单校验与输入体验，
 * 而技能/项目/经历/主题/设备切换等跨组件状态统一放这里，作为唯一状态源；
 * 右侧实时预览订阅同一份 data，任何修改立即反映（所见即所得）。
 *
 * persist 中间件把状态写入 localStorage：刷新/关掉浏览器后回来仍能继续编辑，
 * 「全屏预览」新标签页也靠它读取当前编辑内容。
 */
'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ArchetypeId,
  DeviceMode,
  Experience,
  Project,
  SiteData,
  SiteRecord,
  Skill,
  TemplateName,
} from '@/types'
import { migrateLegacySample } from '@/lib/sample-data'
import { createArchetypeSample } from '@/lib/archetypes'
import { getTemplate } from '@/lib/templates'
import { moveItem, uid } from '@/lib/utils'
import {
  MAX_EXPERIENCE_COUNT,
  MAX_PROJECT_COUNT,
  MAX_SKILL_COUNT,
} from '@/lib/validators/site-schema'

/** persist 快照形态：只含可序列化字段，迁移函数按它收窄类型 */
interface EditorSnapshot {
  siteId: string | null
  siteName: string
  template: TemplateName
  data: SiteData
  device: DeviceMode
  dirty: boolean
  lastSavedAt: number | null
}

interface EditorState {
  siteId: string | null
  siteName: string
  template: TemplateName
  data: SiteData
  device: DeviceMode
  saving: boolean
  dirty: boolean
  lastSavedAt: number | null
  /** 外部整体替换内容的版本号：驱动 RHF 表单重挂载，不持久化 */
  contentVersion: number
  setTemplate: (template: TemplateName) => void
  setDevice: (device: DeviceMode) => void
  setSiteName: (name: string) => void
  updateData: (patch: Partial<SiteData>) => void
  setPrimaryColor: (color: string) => void
  addSkill: () => void
  updateSkill: (id: string, patch: Partial<Omit<Skill, 'id'>>) => void
  removeSkill: (id: string) => void
  moveSkill: (from: number, to: number) => void
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (id: string, patch: Partial<Omit<Project, 'id'>>) => void
  removeProject: (id: string) => void
  moveProject: (from: number, to: number) => void
  addExperience: (experience: Omit<Experience, 'id'>) => void
  updateExperience: (id: string, patch: Partial<Omit<Experience, 'id'>>) => void
  removeExperience: (id: string) => void
  moveExperience: (from: number, to: number) => void
  newSite: (template?: TemplateName, archetype?: ArchetypeId) => void
  setArchetype: (archetype: ArchetypeId) => void
  applyAiDraft: (data: SiteData, template: TemplateName) => void
  loadSite: (record: SiteRecord) => void
  markSaved: (id: string) => void
  setSaving: (saving: boolean) => void
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      siteId: null,
      siteName: '我的个人官网',
      template: 'minimal',
      data: createArchetypeSample('developer'),
      device: 'desktop',
      saving: false,
      dirty: false,
      lastSavedAt: null,
      contentVersion: 0,

      // 切模板同时套用该模板默认主题色（用户随后可在主题 Tab 再自定义）
      setTemplate: (template) =>
        set((state) => ({
          template,
          dirty: true,
          data: {
            ...state.data,
            theme: { primaryColor: getTemplate(template).defaultColor },
          },
        })),
      setDevice: (device) => set({ device }),
      setSiteName: (siteName) => set({ siteName, dirty: true }),
      updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch }, dirty: true })),
      setPrimaryColor: (color) =>
        set((state) => ({
          data: { ...state.data, theme: { primaryColor: color } },
          dirty: true,
        })),

      // 达到上限时原样返回 state（不产生新引用），UI 侧按钮同时 disabled 双保险
      addSkill: () =>
        set((state) => {
          if (state.data.skills.length >= MAX_SKILL_COUNT) return state
          return {
            dirty: true,
            data: {
              ...state.data,
              skills: [...state.data.skills, { id: uid(), name: '新技能', level: 60 }],
            },
          }
        }),
      updateSkill: (id, patch) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            skills: state.data.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          },
        })),
      removeSkill: (id) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, skills: state.data.skills.filter((s) => s.id !== id) },
        })),
      moveSkill: (from, to) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, skills: moveItem(state.data.skills, from, to) },
        })),
      addProject: (project) =>
        set((state) => {
          if (state.data.projects.length >= MAX_PROJECT_COUNT) return state
          return {
            dirty: true,
            data: { ...state.data, projects: [...state.data.projects, { ...project, id: uid() }] },
          }
        }),
      updateProject: (id, patch) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            projects: state.data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),
      removeProject: (id) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, projects: state.data.projects.filter((p) => p.id !== id) },
        })),
      moveProject: (from, to) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, projects: moveItem(state.data.projects, from, to) },
        })),

      addExperience: (experience) =>
        set((state) => {
          if (state.data.experience.length >= MAX_EXPERIENCE_COUNT) return state
          return {
            dirty: true,
            data: {
              ...state.data,
              experience: [...state.data.experience, { ...experience, id: uid() }],
            },
          }
        }),
      updateExperience: (id, patch) =>
        set((state) => ({
          dirty: true,
          data: {
            ...state.data,
            experience: state.data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, experience: state.data.experience.filter((e) => e.id !== id) },
        })),
      moveExperience: (from, to) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, experience: moveItem(state.data.experience, from, to) },
        })),

      /** 新建：重置为示例内容但保留当前模板选择；dirty=false 因为尚未相对数据库产生差异 */
      newSite: (template, archetype = 'developer') => {
        const chosen = template ?? get().template
        set({
          siteId: null,
          siteName: '我的个人官网',
          template: chosen,
          data: {
            ...createArchetypeSample(archetype),
            theme: { primaryColor: getTemplate(chosen).defaultColor },
          },
          dirty: false,
          lastSavedAt: null,
          contentVersion: get().contentVersion + 1,
        })
      },
      /** 切换内容方向只改变编辑语义，不重写用户已填写的内容 */
      setArchetype: (archetype) =>
        set((state) => ({
          dirty: true,
          data: { ...state.data, archetype },
        })),
      /** AI 草稿经用户确认后整体替换；递增版本号让 RHF 从 store 重新初始化 */
      applyAiDraft: (data, template) =>
        set((state) => ({
          template,
          data,
          dirty: true,
          contentVersion: state.contentVersion + 1,
        })),
      /** 从数据库记录恢复编辑现场（首页「编辑」入口 /editor?id=xxx 调用） */
      loadSite: (record) =>
        set({
          siteId: record.id,
          siteName: record.name,
          template: record.template,
          data: record.content,
          dirty: false,
          lastSavedAt: new Date(record.updatedAt).getTime(),
          contentVersion: get().contentVersion + 1,
        }),
      markSaved: (id) => set({ siteId: id, dirty: false, saving: false, lastSavedAt: Date.now() }),
      setSaving: (saving) => set({ saving }),
    }),
    {
      name: 'sitecraft-editor',
      // v2：示例身份由「张亮」换成「Lead」。浏览器里存着旧快照的话，
      // 改源码是没用的——预览读的是 localStorage，必须靠迁移把它换掉。
      version: 2,
      migrate: (persisted, version) => {
        const next = (persisted ?? {}) as Partial<EditorSnapshot>
        if (version >= 2 || !next.data) return next as EditorSnapshot
        // 判定逻辑在 lib/sample-data.migrateLegacySample，纯函数、可单测
        const data = migrateLegacySample(next.data)
        const patched: Partial<EditorSnapshot> = { ...next, data }
        if (next.siteName && next.siteName.includes('张亮')) {
          patched.siteName = next.siteName.replace('张亮', data.name)
        }
        return patched as EditorSnapshot
      },
      // 只持久化数据字段：函数不可序列化，saving 这类瞬时 UI 状态也不应跨会话保留
      partialize: (state) => ({
        siteId: state.siteId,
        siteName: state.siteName,
        template: state.template,
        data: state.data,
        device: state.device,
        dirty: state.dirty,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

/**
 * 水合门控 hook。persist 从 localStorage 恢复是客户端行为，而 SSR/预渲染用的是默认值；
 * 若直接渲染 store 内容会产生水合不一致（React #425）。页面先渲染骨架屏，
 * 等本 hook 返回 true 后再渲染真实编辑器，彻底规避该问题。
 */
export function useEditorHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const unsubscribe = useEditorStore.persist.onFinishHydration(() => setHydrated(true))
    if (useEditorStore.persist.hasHydrated()) setHydrated(true)
    return unsubscribe
  }, [])
  return hydrated
}
