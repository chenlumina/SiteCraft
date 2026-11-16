/**
 * 部署对话框：用可辨识联合类型 DeployState 管理 idle/loading/success/error 四态，
 * TS 穷尽检查保证每个状态都有对应 UI，不会出现「转圈后无反馈」的死状态。
 * 服务端未配置 GITHUB_TOKEN 时返回 400 + 指引文案，这里原样展示并提供
 * 「改为导出 HTML」的降级出口——部署不可用时主流程（导出）仍然完整。
 */
'use client'

import { useState } from 'react'
import { Download, ExternalLink, Loader2, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import type { ApiResponse, DeployResult } from '@/types'
import { repoNameSchema } from '@/lib/validators/site-schema'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useSiteActions } from '@/lib/hooks/use-site-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DeployState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'success'; result: DeployResult }
  | { phase: 'error'; message: string }

/** 中文站点名无法做 GitHub 仓库名：转小写、非法字符转连字符、去首尾连字符，空则兜底 */
function defaultRepoName(siteName: string): string {
  const ascii = siteName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return ascii || 'my-portfolio'
}

export function DeployDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { siteId, siteName, template, data } = useEditorStore()
  const { exportHtml } = useSiteActions()
  const [repoName, setRepoName] = useState(defaultRepoName(siteName))
  const [description, setDescription] = useState(`${data.name} 的个人官网 · 由 SiteCraft 生成`)
  const [state, setState] = useState<DeployState>({ phase: 'idle' })

  async function handleDeploy() {
    const repoCheck = repoNameSchema.safeParse(repoName)
    if (!repoCheck.success) {
      toast.error(repoCheck.error.issues[0]?.message ?? '仓库名格式不正确')
      return
    }
    setState({ phase: 'loading' })
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId ?? undefined,
          name: siteName,
          repoName,
          description,
          template,
          content: data,
        }),
      })
      const json = (await res.json()) as ApiResponse<DeployResult>
      if (!json.success || !json.data) {
        setState({ phase: 'error', message: json.error ?? '部署失败' })
        return
      }
      setState({ phase: 'success', result: json.data })
      toast.success('已推送到 GitHub')
    } catch {
      setState({ phase: 'error', message: '网络错误，无法连接部署服务' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-muted-foreground" /> 部署到 GitHub Pages
          </DialogTitle>
          <DialogDescription>
            自动创建公开仓库、推送生成的静态首页并开启 Pages。需要服务端配置 GITHUB_TOKEN。
          </DialogDescription>
        </DialogHeader>

        {state.phase === 'success' ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
              <p className="font-semibold text-success">部署成功</p>
              <p className="mt-1 text-muted-foreground">
                仓库已创建并推送 index.html，Pages 构建通常需要 1-2 分钟生效。
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <a
                className="flex items-center gap-2 font-medium text-foreground underline underline-offset-2 hover:no-underline"
                href={state.result.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" /> {state.result.repoUrl}
              </a>
              {state.result.pagesUrl && (
                <a
                  className="flex items-center gap-2 font-medium text-foreground underline underline-offset-2 hover:no-underline"
                  href={state.result.pagesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" /> {state.result.pagesUrl}
                </a>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>完成</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="repo-name">仓库名 *</Label>
              <Input
                id="repo-name"
                className="mt-1.5 font-mono"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-portfolio"
                disabled={state.phase === 'loading'}
              />
            </div>
            <div>
              <Label htmlFor="repo-desc">仓库描述</Label>
              <Textarea
                id="repo-desc"
                className="mt-1.5"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={state.phase === 'loading'}
              />
            </div>
            {state.phase === 'error' && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                {state.message}
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={exportHtml}
                disabled={state.phase === 'loading'}
              >
                <Download /> 改为导出 HTML
              </Button>
              <Button type="button" onClick={handleDeploy} disabled={state.phase === 'loading'}>
                {state.phase === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin" /> 部署中…
                  </>
                ) : (
                  <>
                    <Rocket /> 开始部署
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}