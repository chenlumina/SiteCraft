/**
 * 模板渲染容器：把生成器产出的 CSS + body 挂载进 React 树。
 * 首页橱窗、画廊缩略、编辑器实时预览、全屏预览都复用它，
 * 因此缩略图与真实站点像素级一致（同一份 HTML/CSS，仅外层缩放不同）。
 */
'use client'

import { useMemo } from 'react'
import type { SiteData, TemplateName } from '@/types'
import { renderSiteFragment } from '@/lib/generators/html-generator'
import { cn } from '@/lib/utils'

interface SiteFrameProps {
  data: SiteData
  template: TemplateName
  className?: string
}

export function SiteFrame({ data, template, className }: SiteFrameProps) {
  const fragment = useMemo(() => renderSiteFragment(data, template), [data, template])
  // 安全不变量：fragment 完全由 html-generator 生成，用户文本经 esc() 转义、
  // URL 经协议白名单、颜色经 hex 校验，不存在用户原始 HTML 注入路径。
  // style 必须用 innerHTML 注入：React SSR 会转义文本子节点中的引号（&#x27;），
  // 而 <style> 是原始文本元素不解码实体，会破坏 CSS 并导致水合失败。
  return (
    <div className={cn('site-frame', className)}>
      <style dangerouslySetInnerHTML={{ __html: fragment.css }} />
      <div dangerouslySetInnerHTML={{ __html: fragment.body }} />
    </div>
  )
}