/**
 * 站点 body 结构渲染入口（不含 <html>/<head>）。
 * 「渲染单一事实来源」：实时预览、全屏预览、HTML 导出、GitHub 部署全部走这里。
 *
 * v2 架构：12 套模板 = 12 个独立版式（各自完整的 HTML 骨架 + 版式专属 CSS），
 * 不是同一结构的换皮——极客是终端窗口、商务是简历纸、杂志是报刊版面、
 * 手账是牛皮纸日记。区块的动态出现规则（空区块不渲染、锚点随之收缩）
 * 由 layouts/shared.ts 的 getSections 统一保证，各版式据此拼装自己的骨架。
 *
 * 安全边界在 escape.ts / icons.ts：用户文本一律 esc()，URL 一律 safeUrl()。
 */
import type { SiteData, TemplateName } from '@/types'
import { renderMinimal } from './layouts/minimal'
import { renderTech } from './layouts/tech'
import { renderCreative } from './layouts/creative'
import { renderProfessional } from './layouts/professional'
import { renderInk } from './layouts/ink'
import { renderBrutal } from './layouts/brutal'
import { renderAurora } from './layouts/aurora'
import { renderEditorial } from './layouts/editorial'
import { renderGold } from './layouts/gold'
import { renderVapor } from './layouts/vapor'
import { renderSwiss } from './layouts/swiss'
import { renderKraft } from './layouts/kraft'

type LayoutRenderer = (data: SiteData) => string

const RENDERERS: Record<TemplateName, LayoutRenderer> = {
  minimal: renderMinimal,
  tech: renderTech,
  creative: renderCreative,
  professional: renderProfessional,
  ink: renderInk,
  brutal: renderBrutal,
  aurora: renderAurora,
  editorial: renderEditorial,
  gold: renderGold,
  vapor: renderVapor,
  swiss: renderSwiss,
  kraft: renderKraft,
}

export function renderSiteBody(data: SiteData, template: TemplateName): string {
  return RENDERERS[template](data)
}
