/**
 * 首次访问欢迎页：称呼 + 二选一身份，形成一张「工作台登记卡」。
 * 延续首页的纸面底纹、墨团跟随、阶梯入场与印章动效；选择默认只保存在本地。
 * 可用性要点（2026-11 修复）：
 * - 移动端首屏必须出现任务：装饰性通行证在 <lg 隐藏，登记卡紧随标题；
 * - 分字段行内错误 + aria-invalid + 聚焦到出错控件；
 * - 方向单选支持方向键（roving tabindex）；
 * - 「先随便看看」游客直达首页，不再提供回到原地的死链；
 * - 提交成功埋点 registration_complete（见 lib/analytics）。
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Code2, Image as ImageIcon, Palette } from 'lucide-react'
import type { ArchetypeId } from '@/types'
import { track } from '@/lib/analytics'
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
    description: '让作品图成为主角，文字退到作品旁边，尺寸与展览履历替你说可信度。',
    detail: '画廊 · 展览 · 合作约稿',
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
  const [nameError, setNameError] = useState('')
  const [directionError, setDirectionError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const directionRef = useRef<HTMLDivElement>(null)

  // 曾经填写过时只预填，不直接跳过：是否免进入由正式路由决定
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
      setNameError('先告诉我们怎么称呼你')
      nameRef.current?.focus()
      return
    }
    if (!archetype) {
      setDirectionError('请选择一个创作方向')
      directionRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus()
      return
    }
    const profile: VisitorProfile = { name: name.trim(), archetype }
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    } catch {
      // 本地存储不可用时仍允许完成本次选择
    }
    setNameError('')
    setDirectionError('')
    setSubmitted(true)
    track('registration_complete', { archetype })
  }

  /** 游客直达首页：只存在于本次会话，不写 localStorage，下次访问仍会回到登记页 */
  function enterAsGuest() {
    track('guest_enter', { archetype: 'developer' })
    onComplete?.({ name: '访客', archetype: 'developer' })
  }

  /** 方向单选的方向键导航（WAI-ARIA radiogroup 模式：roving tabindex + 方向键选择） */
  function onDirectionKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const ids = DIRECTIONS.map((item) => item.id)
    const current = archetype ?? ids[0]
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1
    const next = ids[(ids.indexOf(current) + delta + ids.length) % ids.length]
    setArchetype(next)
    setDirectionError('')
    directionRef.current
      ?.querySelectorAll<HTMLElement>('[role="radio"]')
      [ids.indexOf(next)]?.focus()
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <PaperTexture />
      <header className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="返回 SiteCraft 首页">
          <BrandLogo />
        </Link>
        <button
          type="button"
          onClick={enterAsGuest}
          className="flex min-h-11 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
        >
          先随便看看 <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      <main className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-8 px-5 pb-16 pt-2 sm:gap-12 lg:grid-cols-[1fr_460px] lg:gap-20 lg:pb-24 lg:pt-6">
        <section className="relative" aria-labelledby="welcome-title">
          <InkBlob />
          <h1
            id="welcome-title"
            className="relative animate-fade-up font-display text-3xl font-bold leading-[1.16] tracking-tight sm:mt-6 sm:text-4xl lg:text-5xl xl:text-[3.6rem]"
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
            className="mt-5 hidden max-w-md animate-fade-up text-base leading-8 text-muted-foreground sm:block"
            style={{ animationDelay: '0.24s' }}
          >
            不用注册，也不用先懂版式。留下一个称呼，选择你的创作方向，接下来的预览、内容和编辑器都会从这个起点展开。
          </p>

          {/* 实时通行证：桌面端的仪式感装饰；移动端隐藏，把首屏留给登记任务 */}
          <div
            className="relative mt-10 hidden max-w-md animate-fade-up border-y border-border py-5 lg:block"
            style={{ animationDelay: '0.34s' }}
            aria-live="polite"
          >
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
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
          className="animate-fade-up rounded-sm border border-foreground/20 bg-card/90 p-5 shadow-[10px_10px_0_rgba(40,35,25,0.06)] backdrop-blur-sm sm:p-8"
          style={{ animationDelay: '0.22s' }}
          aria-label="访客登记卡"
        >
          {submitted && direction ? (
            <div className="py-4 text-center" aria-live="polite">
              <div className="postmark-stamp mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-[#9e2b25] text-[#9e2b25]">
                <div>
                  <Check className="mx-auto h-7 w-7" />
                  <span className="mt-1 block font-mono text-[11px] uppercase tracking-widest">
                    Registered
                  </span>
                </div>
              </div>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Registration complete
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold">登记完成，{name.trim()}。</h2>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
                你的「{direction.title}
                」方向已保存在这个浏览器中。下一步进入为你布置好的首页，从那里开始整理你的内容。
              </p>
              <div className="mt-8 grid gap-3">
                {onComplete ? (
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => onComplete({ name: name.trim(), archetype: direction.id })}
                  >
                    进入{direction.id === 'developer' ? '我的首页' : '我的展厅'} <ArrowRight />
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
                <h2 className="font-display text-2xl font-bold">工作台登记卡</h2>
                <span className="font-display text-4xl font-bold text-foreground/15">01</span>
              </div>

              <div className="mt-6">
                <Label htmlFor="welcome-name">
                  怎么称呼你？
                  <span aria-hidden="true" className="ml-1 text-[#9e2b25]">
                    *
                  </span>
                </Label>
                <Input
                  id="welcome-name"
                  ref={nameRef}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value.slice(0, 30))
                    setNameError('')
                  }}
                  maxLength={30}
                  autoComplete="nickname"
                  placeholder="名字、昵称或创作者署名"
                  className="mt-2 h-11 border-foreground/20 bg-background px-3 text-base focus-visible:ring-foreground/20"
                  aria-required="true"
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? 'welcome-name-error' : undefined}
                />
                {nameError && (
                  <p id="welcome-name-error" role="alert" className="mt-1.5 text-xs text-[#9e2b25]">
                    {nameError}
                  </p>
                )}
              </div>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium">
                  你的创作方向
                  <span aria-hidden="true" className="ml-1 text-[#9e2b25]">
                    *
                  </span>
                </legend>
                <div
                  ref={directionRef}
                  className="mt-3 grid gap-3"
                  role="radiogroup"
                  aria-label="创作方向"
                  aria-required="true"
                  onKeyDown={onDirectionKeyDown}
                >
                  {DIRECTIONS.map((item, index) => {
                    const Icon = item.icon
                    const active = archetype === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active || (archetype === null && index === 0) ? 0 : -1}
                        onClick={() => {
                          setArchetype(item.id)
                          setDirectionError('')
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
                              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
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
                {directionError && (
                  <p
                    id="welcome-direction-error"
                    role="alert"
                    className="mt-2 text-xs text-[#9e2b25]"
                  >
                    {directionError}
                  </p>
                )}
              </fieldset>

              <Button type="submit" size="lg" className="group mt-5 w-full gap-2">
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
