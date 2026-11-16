/**
 * 首页组装：背景层（极光光斑 + 颗粒 + 顶部渐隐）→ 固定导航 → 四大区块 → 页脚。
 * 背景层 pointer-events-none + overflow-hidden，纯装饰不拦截交互；
 * overflow-x-clip 兜底防止光斑/浮动徽章造成横向滚动条。
 */
'use client'

import { useReveal } from '@/lib/hooks/use-reveal'
import { SiteNav } from '@/components/home/site-nav'
import { Hero } from '@/components/home/hero'
import { TemplateGallery } from '@/components/home/template-gallery'
import { Workflow } from '@/components/home/workflow'
import { MySites } from '@/components/home/my-sites'
import { SiteFooter } from '@/components/home/site-footer'

export default function HomePage() {
  useReveal()

  return (
    <div className="bg-grain relative min-h-screen overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-orb left-[-12%] top-[-8%] h-[480px] w-[480px] animate-aurora bg-brand-violet/25" />
        <div className="aurora-orb right-[-10%] top-[16%] h-[420px] w-[420px] animate-aurora-alt bg-brand-cyan/16" />
        <div className="aurora-orb bottom-[8%] left-[22%] h-[380px] w-[380px] animate-aurora bg-brand-magenta/12" />
        <div className="absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-ink-850/80 to-transparent" />
      </div>

      <SiteNav />
      <main className="relative">
        <Hero />
        <TemplateGallery />
        <Workflow />
        <MySites />
      </main>
      <SiteFooter />
    </div>
  )
}