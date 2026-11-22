/**
 * 登记后的「工作台已登记」提示条：解决注册成功页承诺工作台、落点却是营销首页的断点。
 * 放在首页首屏文案上方：点名 + 三步下一步 + 明确 CTA，可关闭（本次会话内记住）。
 * 双主题：开发者用纸面令牌，艺术首页用白盒画廊的黑白灰，避免"借来的部件"。
 * 游客（name = 访客）不显示，避免把游客当已登记用户。
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'sitecraft-workbench-dismissed'

export function WorkbenchStrip({ name, mode }: { name: string; mode: 'developer' | 'artist' }) {
  const [closed, setClosed] = useState(false)

  // 关闭状态记在 sessionStorage：同一会话（含刷新）内不再出现，新会话重新提示
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') setClosed(true)
    } catch {
      // 隐私模式禁用存储时按默认显示处理
    }
  }, [])

  function dismiss() {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // 存不下就只关当前渲染
    }
    setClosed(true)
  }

  if (closed || !name.trim() || name === '访客') return null

  const artist = mode === 'artist'
  const steps =
    mode === 'developer' ? '① 挑版式 ② 粘资料 ③ 导出或发布' : '① 整理作品 ② 选版式 ③ 发布作品集'

  return (
    <div
      data-workbench-strip
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 border-y px-4 py-3 text-xs',
        artist ? 'border-black/10 bg-white/60 text-black/70' : 'border-border bg-card/60'
      )}
    >
      <span
        className={cn(
          'font-mono text-[11px] uppercase tracking-[0.2em]',
          artist ? 'text-black/45' : 'text-muted-foreground'
        )}
      >
        Workbench
      </span>
      <span className="font-medium">「{name}」的工作台已登记</span>
      <span className={artist ? 'text-black/55' : 'text-muted-foreground'}>{steps}</span>
      <div className="ml-auto flex items-center gap-2">
        <Button asChild size="sm" className="gap-1.5">
          <Link href={mode === 'developer' ? '/editor' : '/artist-editor?new=1'}>
            {mode === 'developer' ? '开始做我的官网' : '开始整理作品集'} <ArrowRight />
          </Link>
        </Button>
        <button
          type="button"
          aria-label="关闭工作台提示"
          onClick={dismiss}
          className={cn(
            'grid h-8 w-8 place-items-center transition-colors',
            artist
              ? 'text-black/45 hover:text-[#171917]'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
