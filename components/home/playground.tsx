/**
 * 「模板试衣间」——首页的核心交互区：
 * 改名字、换主题色、切十二套版式、切桌面/手机视口，大图实时所见即所得；
 * 「用这套开始编辑」直接带 ?template= 跳进编辑器，试完即建站。
 * 预览复用 SiteFrame（与导出/编辑器同一渲染源），缩放策略与画廊卡片一致：
 * 固定内层宽度 + ResizeObserver 实测容器 + transform scale，绝对定位防撑爆。
 */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Monitor, Smartphone } from 'lucide-react'
import type { SiteData, TemplateName } from '@/types'
import { SAMPLE_SITE_DATA } from '@/lib/sample-data'
import { TEMPLATES, getTemplate } from '@/lib/templates'
import { SiteFrame } from '@/components/templates/site-frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const DESKTOP_W = 1280
const DESKTOP_H = 820
const MOBILE_W = 390
const MOBILE_H = 800

type Device = 'desktop' | 'mobile'

function useFitScale(innerW: number, innerH: number) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  const [boxH, setBoxH] = useState(360)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? innerW
      const s = Math.min(width / innerW, 0.9)
      setScale(s)
      setBoxH(Math.round(innerH * s))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [innerW, innerH])

  return { boxRef, scale, boxH }
}

export function Playground() {
  const [template, setTemplate] = useState<TemplateName>('ink')
  const [name, setName] = useState('')
  const [color, setColor] = useState(() => getTemplate('ink').defaultColor)
  const [device, setDevice] = useState<Device>('desktop')

  const meta = getTemplate(template)
  const innerW = device === 'desktop' ? DESKTOP_W : MOBILE_W
  const innerH = device === 'desktop' ? DESKTOP_H : MOBILE_H
  // 手机外框留边：内容四周 8px 边框空间，外框完整落在预览盒内不被裁切
  const bezel = device === 'mobile' ? 8 : 0
  const { boxRef, scale, boxH } = useFitScale(innerW, innerH)

  function switchTemplate(next: TemplateName) {
    setTemplate(next)
    setColor(getTemplate(next).defaultColor)
  }

  const data = useMemo<SiteData>(
    () => ({
      ...SAMPLE_SITE_DATA,
      name: name.trim() || 'Lead',
      theme: { primaryColor: color },
    }),
    [name, color]
  )

  return (
    <section id="playground" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="reveal mb-10 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Playground
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          先试后建 · 模板试衣间
        </h2>
        <p className="mt-3 text-muted-foreground">
          改个名字、换个主题色、点一套版式——右边立刻就是「你的官网」。满意就带着这套配置进编辑器。
        </p>
      </div>

      <div className="reveal grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* 控制台 */}
        <div className="space-y-5 rounded-xl border bg-card p-5">
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              ① 版式（{TEMPLATES.length} 套）
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => switchTemplate(t.name)}
                  aria-pressed={template === t.name}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2 py-2 text-left text-[11px] font-semibold transition-all',
                    template === t.name
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{ backgroundColor: t.defaultColor }}
                  />
                  <span className="truncate">{t.displayName.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">② 你的名字</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 12))}
              placeholder="输入名字，实时生效"
              maxLength={12}
              className="bg-background"
              aria-label="试穿姓名"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              ③ 主题色 <span className="font-mono text-[10px] normal-case">{color}</span>
            </p>
            <div className="grid grid-cols-6 gap-2">
              {meta.swatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`选择主题色 ${c}`}
                  onClick={() => setColor(c)}
                  className={cn(
                    'aspect-square rounded-md border-2 transition-transform hover:scale-110',
                    color.toLowerCase() === c.toLowerCase()
                      ? 'scale-110 border-foreground'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">④ 视口</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                aria-pressed={device === 'desktop'}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all',
                  device === 'desktop'
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <Monitor className="h-3.5 w-3.5" /> 桌面
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                aria-pressed={device === 'mobile'}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all',
                  device === 'mobile'
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <Smartphone className="h-3.5 w-3.5" /> 手机
              </button>
            </div>
          </div>

          <Button asChild className="w-full gap-2">
            <Link href={`/editor?template=${template}`}>
              用「{meta.displayName.split(' ')[0]}」开始编辑 <ArrowRight />
            </Link>
          </Button>
        </div>

        {/* 实时预览 */}
        <div>
          <div
            ref={boxRef}
            className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5"
            style={{ height: boxH + bezel * 2 }}
          >
            {/* 居中用显式像素偏移：translateX(-50%) 按未缩放宽度计算，
                与 scale 叠加会让内容中心偏左 195*(1-s)px，与手机外框错位 */}
            <div
              className="absolute origin-top-left"
              style={{
                top: bezel,
                left: device === 'mobile' ? `calc(50% - ${(innerW * scale) / 2}px)` : 0,
                width: innerW,
                height: innerH,
                transform: `scale(${scale})`,
              }}
            >
              <SiteFrame data={data} template={template} />
            </div>
            {device === 'mobile' && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 rounded-[30px] border-2 border-foreground/50"
                style={{
                  left: '50%',
                  width: innerW * scale + bezel * 2,
                  height: innerH * scale + bezel * 2,
                  transform: 'translateX(-50%)',
                }}
              />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <SparkleHint /> 与编辑器/导出同一渲染源——试衣间里看到什么，建站后就是什么
          </p>
        </div>
      </div>
    </section>
  )
}

function SparkleHint() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
}
