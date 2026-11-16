/**
 * 首页组装：纸面设计系统（globals :root 全局纸面令牌）→ 固定导航 → 五大区块 → 页脚。
 * 视觉语言：印刷品式的克制——暖纸底、墨色文字、发丝线分隔、衬线标题、单一强调色。
 * 无光斑/无聚光灯/无渐变字；动效只保留滚动显现、橱窗轮换与倾斜（尊重 reduced-motion）。
 */
'use client'

import { useReveal } from '@/lib/hooks/use-reveal'
import { ScrollProgress } from '@/components/home/page-chrome'
import { SiteNav } from '@/components/home/site-nav'
import { Hero } from '@/components/home/hero'
import { TemplateGallery } from '@/components/home/template-gallery'
import { Playground } from '@/components/home/playground'
import { Workflow } from '@/components/home/workflow'
import { MySites } from '@/components/home/my-sites'
import { SiteFooter } from '@/components/home/site-footer'

export default function HomePage() {
  useReveal()

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <ScrollProgress />
      <SiteNav />
      <main className="relative">
        <Hero />
        <TemplateGallery />
        <Playground />
        <Workflow />
        <MySites />
      </main>
      <SiteFooter />
    </div>
  )
}
