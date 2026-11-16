/**
 * 编辑器右栏实时预览：订阅 store.data/template/device，任何编辑立即重渲染。
 * 设备切换本质是改容器宽度（桌面=max1100 / 手机=390 框），模板 CSS 的
 * 容器查询据此自动切换版式——不需要两套模板代码。
 * 编辑态拦截所有链接点击：外链/mailto 不允许跳走（防止误操作丢失编辑现场），
 * 页内锚点改为在预览容器内平滑滚动；全屏预览页不拦截，链接真实可用。
 */
'use client'

import { useRef } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { getTemplate } from '@/lib/templates'
import { SiteFrame } from '@/components/templates/site-frame'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function LivePreview() {
  const data = useEditorStore((s) => s.data)
  const template = useEditorStore((s) => s.template)
  const device = useEditorStore((s) => s.device)
  const setDevice = useEditorStore((s) => s.setDevice)
  const paneRef = useRef<HTMLDivElement>(null)
  const meta = getTemplate(template)

  // 捕获阶段拦截：生成器 HTML 里的 <a> 不是 React 元素，无法挂 onClick，
  // 只能在外层容器用 onClickCapture 统一处理。CSS.escape 防止 id 特殊字符破坏选择器。
  function handleClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest('a')
    if (!anchor) return
    e.preventDefault()
    const href = anchor.getAttribute('href') ?? ''
    if (href.startsWith('#') && paneRef.current) {
      const id = href.slice(1)
      const target = paneRef.current.querySelector(`[id="${CSS.escape(id)}"]`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b bg-ink-900/80 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">实时预览</span>
          <Badge variant="secondary" className="gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.defaultColor }} />
            {meta.displayName}
          </Badge>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-ink-850 p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="桌面预览"
                aria-pressed={device === 'desktop'}
                className={cn('h-7 w-8', device === 'desktop' && 'bg-primary/20 text-primary')}
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>桌面宽度</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="移动端预览"
                aria-pressed={device === 'mobile'}
                className={cn('h-7 w-8', device === 'mobile' && 'bg-primary/20 text-primary')}
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>移动端宽度（390px）</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        className="grid min-h-0 flex-1 place-items-center overflow-hidden p-4 lg:p-6"
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.09) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        onClickCapture={handleClickCapture}
      >
        {device === 'desktop' ? (
          <div
            ref={paneRef}
            className="panel-scroll h-full w-full max-w-[1100px] overflow-y-auto rounded-lg border shadow-2xl shadow-ink-950/60"
          >
            <SiteFrame data={data} template={template} />
          </div>
        ) : (
          <div className="flex h-full max-h-[780px] w-[390px] max-w-full flex-col rounded-[2.2rem] border-4 border-ink-600 bg-ink-950 p-1.5 shadow-2xl shadow-ink-950/60">
            <div className="mx-auto mb-1 h-1 w-16 rounded-full bg-ink-600" />
            <div ref={paneRef} className="panel-scroll min-h-0 flex-1 overflow-y-auto rounded-[1.7rem]">
              <SiteFrame data={data} template={template} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}