/**
 * 版式共享件：动态区块判定与各版式复用的构建块。
 * 12 套版式各有独立的 HTML 骨架（不是同一结构的换皮），
 * 这里只放真正通用的东西：区块顺序、头像/社交/邮件/标签的构造、评分点。
 * 安全边界不变：所有用户文本必须过 esc()，URL 必须过 safeUrl()。
 */
import type { SiteData } from '@/types'
import { esc, monogram, safeUrl } from '../escape'
import { icon } from '../icons'
import { DEFAULT_AVATAR_DATA_URI, DEFAULT_AVATAR_PATH } from '../theme-consts'

export interface SectionDef {
  id: 'skills' | 'projects' | 'experience' | 'contact'
  navLabel: string
  kicker: string
  heading: string
}

/** 按「是否有内容」动态生成区块顺序：空区块不出现、导航锚点随之收缩 */
export function getSections(data: SiteData): SectionDef[] {
  const sections: SectionDef[] = []
  if (data.skills.length > 0)
    sections.push({ id: 'skills', navLabel: '技能', kicker: 'SKILLS', heading: '技能栈' })
  if (data.projects.length > 0)
    sections.push({ id: 'projects', navLabel: '项目', kicker: 'PROJECTS', heading: '项目作品' })
  if (data.experience.length > 0)
    sections.push({ id: 'experience', navLabel: '经历', kicker: 'EXPERIENCE', heading: '经历' })
  sections.push({ id: 'contact', navLabel: '联系', kicker: 'CONTACT', heading: '一起聊聊？' })
  return sections
}

export function clampLevel(level: number): number {
  return Math.max(0, Math.min(100, Math.round(level)))
}

/** 头像：有 avatar 用 img，否则用首字徽标。两个 class 由各版式传入 */
export function avatarHTML(data: SiteData, imgCls: string, monoCls: string): string {
  const url =
    data.avatar.trim() === DEFAULT_AVATAR_PATH ? DEFAULT_AVATAR_DATA_URI : safeUrl(data.avatar)
  return url
    ? `<img class="${imgCls}" src="${url}" alt="${esc(data.name)}的头像">`
    : `<div class="${monoCls}">${monogram(data.name)}</div>`
}

/** 邮件主按钮：无邮箱返回空串（按钮链路里的 mailto 始终来自用户填写的邮箱） */
export function mailBtn(data: SiteData, label: string, cls: string): string {
  if (!data.email.trim()) return ''
  return `<a class="${cls}" href="mailto:${esc(data.email.trim())}">${icon('mail')}${esc(label)}</a>`
}

/** 地点 / 邮箱信息片，class 由版式决定 */
export function chipsHTML(data: SiteData, cls: string): string {
  return [
    data.location.trim()
      ? `<span class="${cls}">${icon('pin')}${esc(data.location.trim())}</span>`
      : '',
    data.email.trim() ? `<span class="${cls}">${icon('mail')}${esc(data.email.trim())}</span>` : '',
  ].join('')
}

/** 项目标签 <li> 列表（过滤空标签），class 由版式决定 */
export function tagItems(tags: string[], cls: string): string {
  return tags
    .filter((t) => t.trim())
    .map((t) => `<li class="${cls}">${esc(t.trim())}</li>`)
    .join('')
}

/** 项目在线演示 / 源码链接（协议白名单过滤），返回裸 <a> 串由版式包容器 */
export function projectLinks(link: string, repo: string): string {
  const l = safeUrl(link)
  const r = safeUrl(repo)
  return [
    l
      ? `<a href="${l}" target="_blank" rel="noopener noreferrer">在线演示${icon('external')}</a>`
      : '',
    r
      ? `<a href="${r}" target="_blank" rel="noopener noreferrer">源码${icon('code')}</a>`
      : '',
  ].join('')
}

/** 五格评分点（手账/贴纸风格用），on = round(level/20) */
export function levelDots(level: number): string {
  const filled = Math.round(clampLevel(level) / 20)
  return Array.from({ length: 5 }, (_, i) => `<i class="${i < filled ? 'on' : 'off'}"></i>`).join('')
}
