/**
 * 首次访问欢迎页原型：称呼 + 二选一身份，形成一张「工作台登记卡」。
 * 延续首页的纸面底纹、墨团跟随、阶梯入场与印章动效；选择仅保存在本地。
 * 两个正式板块尚未接入前，独立完成页用于评审视觉与交互，不改变现有首页流程。
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Code2, Image as ImageIcon, Palette } from 'lucide-react'
import type { ArchetypeId } from '@/types'
import { BrandLogo } from '@/components/brand-logo'
import { InkBlob } from '@/components/home/ink-blob'
import { PaperTexture } from '@/components/home/paper-texture'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const PROFILE_KEY = 'sitecraft-profile'

const DIRECTIONS = [
  {
    id: 'developer' as const,
    code: 'DEV / 13',
    title: '开发人员',
    description: '用项目、技术栈和经历，讲清楚你如何做东西。',
    detail: '13 套独立版式 · 项目与履历',
    icon: Code2,
  },
  {
    id: 'artist' as const,
    code: 'ART / MEDIA',
    title: '艺术创作人员',
    description: '让图片、音频和视频成为主角，文字退到作品旁边。',
    detail: '画廊 · 展览 · 影音作品集',
    icon: Palette,
  },
]

export interface VisitorProfile {
  name: string
  archetype: ArchetypeId
}

export function WelcomeScreen({ onComplete }: { onComplete?: (profile: VisitorProfile) => void }) {
  const [name, setName] = useState('')
  const [archetype, setArchetype] = useState<ArchetypeId | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // 曾经填写过时只预填，不直接跳过：本页当前用于评审，是否免进入由正式路由决定
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY)
      if (!raw) return
      const profile = JSON.parse(raw) as Partial<VisitorProfile>
      if (typeof profile.name === 'string') setName(profile.name.slice(0, 30))
      if (profile.archetype === 'developer' || profile.archetype === 'artist') {
        setArchetype(profile.archetype)
      }
    } catch {
      // 隐私模式或旧数据异常时保持空白，不阻塞欢迎页
    }
  }, [])

  const direction = DIRECTIONS.find((item) => item.id === archetype)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('先告诉我们怎么称呼你')
      return
    }
    if (!archetype) {
      setError('请选择一个创作方向')
      return
    }
    const profile: VisitorProfile = { name: name.trim(), archetype }
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    } catch {
      // 本地存储不可用时仍允许完成本次选择
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <PaperTexture />
      <header className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="返回 SiteCraft 首页">
          <BrandLogo />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 返回当前首页
        </Link>
      </header>

      <main className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-12 px-5 pb-16 pt-6 lg:grid-cols-[1fr_460px] lg:gap-20 lg:pb-24">
        <section className="relative" aria-labelledby="welcome-title">
          <InkBlob />
          <p
            className="animate-fade-up font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
            style={{ animationDelay: '0.05s' }}
          >
            Welcome · Registration 001
          </p>
          <h1
            id="welcome-title"
            className="relative mt-6 animate-fade-up font-display text-4xl font-bold leading-[1.16] tracking-tight sm:text-5xl xl:text-[3.6rem]"
            style={{ animationDelay: '0.14s' }}
          >
            先认识一下，
            <br />
            再为你布置<span className="accent-mark">工作台</span>。
            <span
              aria-hidden="true"
              data-ink-ghost
              className="absolute inset-0 text-white"
              style={{ clipPath: 'circle(0px at 0 0)' }}
            >
              先认识一下，
              <br />
              再为你布置工作台。
            </span>
          </h1>
          <p
            className="mt-6 max-w-md animate-fade-up text-base leading-8 text-muted-foreground"
            style={{ animationDelay: '0.24s' }}
          >
            不用注册，也不用先懂模板。留下一个称呼，选择你的创作方向，接下来的预览、内容和编辑器都会从这个起点展开。
          </p>

          {/* 实时通行证：名字与方向变化像更换纸卡上的登记内容 */}
          <div
            className="relative mt-10 max-w-md animate-fade-up border-y border-border py-5"
            style={{ animationDelay: '0.34s' }}
            aria-live="polite"
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <span>Workspace Pass</span>
              <span>No. 001</span>
            </div>
            <div
              key={`${name}-${archetype}`}
              className="hero-swap-in mt-5 flex items-end justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-2xl font-bold">
                  {name.trim() || '你的名字'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {direction?.title ?? '等待选择创作方向'}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {direction?.code ?? '— / —'}
              </span>
            </div>
            <div className="mt-5 flex gap-1" aria-hidden="true">
              {[36, 18, 28, 10, 42, 22, 14, 32, 18, 44, 12, 26].map((width, index) => (
                <span key={index} className="h-5 bg-foreground/70" style={{ width }} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="animate-fade-up rounded-sm border border-foreground/20 bg-card/90 p-6 shadow-[10px_10px_0_rgba(40,35,25,0.06)] backdrop-blur-sm sm:p-8"
          style={{ animationDelay: '0.22s' }}
          aria-label="访客登记卡"
        >
          {submitted && direction ? (
            <div className="py-4 text-center" aria-live="polite">
              <div className="postmark-stamp mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-[#9e2b25] text-[#9e2b25]">
                <div>
                  <Check className="mx-auto h-7 w-7" />
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest">
                    Registered
                  </span>
                </div>
              </div>
              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Registration complete
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold">登记完成，{name.trim()}。</h2>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
                你的「{direction.title}」方向已保存在这个浏览器中。下一步将进入
                {direction.title === '开发人员' ? '项目与履历' : '媒体作品集'}工作台。
              </p>
              <div className="mt-8 grid gap-3">
                {onComplete ? (
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => onComplete({ name: name.trim(), archetype: direction.id })}
                  >
                    进入{direction.id === 'developer' ? '开发工作台' : '数字展厅'} <ArrowRight />
                  </Button>
                ) : (
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/">
                      查看当前首页 <ArrowRight />
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSubmitted(false)}>
                  返回修改登记
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="flex items-start justify-between border-b border-border pb-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    Personal registration
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold">工作台登记卡</h2>
                </div>
                <span className="font-display text-4xl font-bold text-foreground/15">01</span>
              </div>

              <div className="mt-6">
                <Label htmlFor="welcome-name">怎么称呼你？</Label>
                <Input
                  id="welcome-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value.slice(0, 30))
                    setError('')
                  }}
                  maxLength={30}
                  autoComplete="nickname"
                  placeholder="名字、昵称或创作者署名"
                  className="mt-2 h-11 border-foreground/20 bg-background px-3 text-base focus-visible:ring-foreground/20"
                  aria-describedby={error ? 'welcome-error' : undefined}
                />
              </div>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium">你的创作方向</legend>
                <div className="mt-3 grid gap-3" role="radiogroup" aria-label="创作方向">
                  {DIRECTIONS.map((item) => {
                    const Icon = item.icon
                    const active = archetype === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setArchetype(item.id)
                          setError('')
                        }}
                        className={cn(
                          'group relative border p-4 text-left transition-all duration-200 active:translate-y-px',
                          active
                            ? 'border-foreground bg-secondary/60 shadow-[4px_4px_0_rgba(40,35,25,0.08)]'
                            : 'border-border bg-background hover:-translate-y-0.5 hover:border-foreground/40'
                        )}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={cn(
                              'grid h-10 w-10 flex-none place-items-center rounded-full border transition-colors',
                              active
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border'
                            )}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.7} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-3">
                              <span className="font-display text-lg font-bold">{item.title}</span>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                                {item.code}
                              </span>
                            </span>
                            <span className="mt-1.5 block text-xs leading-6 text-muted-foreground">
                              {item.description}
                            </span>
                            <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium">
                              <ImageIcon className="h-3 w-3" /> {item.detail}
                            </span>
                          </span>
                        </span>
                        {active && (
                          <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#9e2b25] text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="min-h-7 pt-3">
                {error && (
                  <p id="welcome-error" role="alert" className="text-xs text-[#9e2b25]">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="group w-full gap-2">
                登记并继续
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
                仅保存在此浏览器，不会上传。当前为欢迎页交互原型。
              </p>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
