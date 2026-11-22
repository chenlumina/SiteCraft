/**
 * 首页入口：首次访问先完成轻量登记，再按身份进入技术或艺术板块。
 * 技术首页保留原有纸面设计系统；身份仅保存在 localStorage，数据库不被触碰。
 */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useReveal } from '@/lib/hooks/use-reveal'
import { ScrollProgress } from '@/components/home/page-chrome'
import { PaperTexture } from '@/components/home/paper-texture'
import { SiteNav } from '@/components/home/site-nav'
import { Hero } from '@/components/home/hero'
import { TemplateGallery } from '@/components/home/template-gallery'
import { Playground } from '@/components/home/playground'
import { Workflow } from '@/components/home/workflow'
import { MySites } from '@/components/home/my-sites'
import { SiteFooter } from '@/components/home/site-footer'
import { ArtistBoard } from '@/components/home/artist-board'
import { WorkbenchStrip } from '@/components/home/workbench-strip'
import { PROFILE_KEY, WelcomeScreen, type VisitorProfile } from '@/components/home/welcome-screen'

function DeveloperHome({ visitorName, onReset }: { visitorName: string; onReset: () => void }) {
  useReveal()

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <PaperTexture />
      <ScrollProgress />
      <SiteNav onEditProfile={onReset} />
      <main className="relative">
        <Hero notice={<WorkbenchStrip name={visitorName} mode="developer" />} />
        <TemplateGallery visitorName={visitorName} />
        <Playground visitorName={visitorName} />
        <Workflow />
        <MySites />
      </main>
      <SiteFooter />
    </div>
  )
}

export default function HomePage() {
  // undefined = 尚未读取本地身份；null = 确认为新访客
  const [profile, setProfile] = useState<VisitorProfile | null | undefined>(undefined)

  useEffect(() => {
    // /?choose=1 强制回到身份选择（已存身份也照做），给"我想换个方向"一个明确入口
    if (new URLSearchParams(window.location.search).get('choose') === '1') {
      setProfile(null)
      return
    }
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY)
      if (!raw) {
        setProfile(null)
        return
      }
      const saved = JSON.parse(raw) as Partial<VisitorProfile>
      if (
        typeof saved.name === 'string' &&
        saved.name.trim() &&
        (saved.archetype === 'developer' || saved.archetype === 'artist')
      ) {
        setProfile({ name: saved.name.trim(), archetype: saved.archetype })
      } else {
        setProfile(null)
      }
    } catch {
      setProfile(null)
    }
  }, [])

  const complete = useCallback((next: VisitorProfile) => {
    setProfile(next)
    // 交接修复：进入首页总是从顶部开始，避免把欢迎页的滚动位置带过去把标题裁在固定导航下
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [])
  const reset = useCallback(() => {
    window.localStorage.removeItem(PROFILE_KEY)
    setProfile(null)
    window.scrollTo({ top: 0 })
  }, [])

  // 读取前不渲染技术模板，避免新访客看到一闪而过的旧首页
  if (profile === undefined) return <div className="min-h-[100dvh] bg-background" />
  if (profile === null) return <WelcomeScreen onComplete={complete} />
  if (profile.archetype === 'artist') return <ArtistBoard name={profile.name} onReset={reset} />
  return <DeveloperHome visitorName={profile.name} onReset={reset} />
}
