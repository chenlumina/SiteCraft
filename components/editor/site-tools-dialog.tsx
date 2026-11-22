/**
 * 编辑器「体检与分享」对话框：
 * - 站点体检：对当前编辑内容实时跑 lib/checkup（检查对象与导出/部署是同一份 HTML），
 *   展示通过数、待改进项与修复建议，可随时重新检查；
 * - 分享卡片：Canvas 生成 1200×630 PNG，填部署地址自动附二维码，可本地下载。
 * 两个功能都纯本地：不上传内容、不依赖 AI。
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  RefreshCw,
  Stethoscope,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore } from '@/lib/stores/editor-store'
import { runSiteCheckup, type CheckStatus, type CheckupReport } from '@/lib/checkup'
import { downloadShareCard, renderShareCard } from '@/lib/share-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const STATUS_META: Record<
  CheckStatus,
  { icon: typeof CheckCircle2; className: string; label: string }
> = {
  pass: { icon: CheckCircle2, className: 'text-success', label: '通过' },
  warn: { icon: AlertTriangle, className: 'text-warning', label: '待改进' },
  fail: { icon: XCircle, className: 'text-[#9e2b25]', label: '需修复' },
  info: { icon: Info, className: 'text-muted-foreground', label: '提示' },
}

export function SiteToolsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [tab, setTab] = useState('checkup')
  const [report, setReport] = useState<CheckupReport | null>(null)
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const runCheck = useCallback(() => {
    const { data, template } = useEditorStore.getState()
    setReport(runSiteCheckup(data, template))
  }, [])

  // 打开即体检（读取的是当前编辑内容，未保存也可用）
  useEffect(() => {
    if (!open) return
    setTab('checkup')
    runCheck()
  }, [open, runCheck])

  // 切到分享卡或改地址时重绘预览；输入防抖 250ms，避免每敲一个字都重绘二维码
  useEffect(() => {
    if (!open || tab !== 'share') return
    let cancelled = false
    setRendering(true)
    const timer = setTimeout(() => {
      const { data } = useEditorStore.getState()
      renderShareCard({ data, url: url.trim() || undefined })
        .then((canvas) => {
          if (cancelled) return
          canvasRef.current = canvas
          setPreview(canvas.toDataURL('image/png'))
        })
        .catch(() => {
          if (cancelled) return
          // 失败时清掉旧卡，避免用过期内容下载
          canvasRef.current = null
          setPreview(null)
          toast.error('分享卡片生成失败，请重试')
        })
        .finally(() => {
          if (!cancelled) setRendering(false)
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, tab, url])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    downloadShareCard(canvas, useEditorStore.getState().siteName)
  }

  const percent = report ? Math.round((report.passed / report.total) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" /> 体检与分享
          </DialogTitle>
          <DialogDescription>
            发布前检查当前站点，或生成一张 1200×630 的分享卡片。全部在本地完成。
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checkup">站点体检</TabsTrigger>
            <TabsTrigger value="share">分享卡片</TabsTrigger>
          </TabsList>

          <TabsContent value="checkup" className="mt-4">
            {report && (
              <>
                <div className="flex items-center gap-4">
                  <div data-checkup-score className="font-mono text-sm">
                    通过 {report.passed} / {report.total} 项
                  </div>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={runCheck} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> 重新检查
                  </Button>
                </div>
                <ul className="mt-4 max-h-[46vh] space-y-0 overflow-y-auto border-t">
                  {report.items.map((item) => {
                    const meta = STATUS_META[item.status]
                    const Icon = meta.icon
                    return (
                      <li key={item.id} data-checkup-item className="flex gap-3 border-b py-2.5">
                        <Icon className={cn('mt-0.5 h-4 w-4 flex-none', meta.className)} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {item.label}
                            <span className={cn('ml-2 text-[11px] font-normal', meta.className)}>
                              {meta.label}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                          {item.hint && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              建议：{item.hint}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </TabsContent>

          <TabsContent value="share" className="mt-4">
            <div className="grid gap-5 md:grid-cols-[1fr_260px]">
              <div className="min-w-0">
                {preview ? (
                  // 预览是 Canvas 生成的 data URL，next/image 不适用于内联位图
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    data-share-preview
                    src={preview}
                    alt="分享卡片预览"
                    className="w-full rounded-md border"
                  />
                ) : (
                  <div className="grid aspect-[1200/630] place-items-center rounded-md border border-dashed text-xs text-muted-foreground">
                    {rendering ? '正在生成卡片…' : '尚未生成'}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="share-url">部署地址（可选）</Label>
                  <Input
                    id="share-url"
                    data-share-url
                    className="mt-1.5"
                    placeholder="https://your-name.github.io"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                  />
                  <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                    填入公网地址后，卡片右侧自动生成二维码；留空则显示一枚印记。
                  </p>
                </div>
                <Button onClick={download} disabled={!preview} className="gap-2">
                  <Download /> 下载分享卡
                </Button>
                <p className="text-[11px] leading-5 text-muted-foreground">
                  1200×630 PNG，可直接用作社交分享图或 README 配图。
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
