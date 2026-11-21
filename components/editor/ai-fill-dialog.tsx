/**
 * AI 预填对话框：粘贴材料 → 服务端生成 SiteData 草稿 → 用户确认后整体注入。
 * mock 模式会明确标注，避免把示例数据误认为真实识别结果。
 */
'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { ApiResponse, ArchetypeId } from '@/types'
import type { AiFillResult } from '@/lib/ai/pipeline'
import { ARCHETYPE_LIST, getArchetype } from '@/lib/archetypes'
import { useEditorStore } from '@/lib/stores/editor-store'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AiFillDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [text, setText] = useState('')
  const [archetype, setArchetype] = useState<'auto' | ArchetypeId>('auto')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiFillResult | null>(null)

  async function generate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, archetype: archetype === 'auto' ? undefined : archetype }),
      })
      const json = (await res.json()) as ApiResponse<AiFillResult>
      if (!json.success || !json.data) {
        toast.error(json.error ?? 'AI 预填失败，请稍后重试')
        return
      }
      setResult(json.data)
    } catch {
      toast.error('网络错误，无法连接 AI 预填服务')
    } finally {
      setLoading(false)
    }
  }

  function apply() {
    if (!result) return
    useEditorStore.getState().applyAiDraft(result.data, result.suggestedTemplate)
    toast.success('AI 草稿已应用', { description: '所有内容都可以继续手动修改，确认后再保存' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI 预填
          </DialogTitle>
          <DialogDescription>
            粘贴简历、作品介绍或创作自述。AI 只负责归类到现有内容模块，不生成网页。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ai-archetype">内容方向</Label>
            <Select
              value={archetype}
              onValueChange={(value) => setArchetype(value as 'auto' | ArchetypeId)}
            >
              <SelectTrigger id="ai-archetype" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动判断</SelectItem>
                {ARCHETYPE_LIST.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-material">原始材料</Label>
              <span className="text-xs text-muted-foreground">{text.length}/12000</span>
            </div>
            <Textarea
              id="ai-material"
              rows={8}
              className="mt-1.5"
              maxLength={12000}
              placeholder="粘贴至少 10 个字的材料；不要粘贴身份证号、密码等敏感信息"
              value={text}
              onChange={(event) => {
                setText(event.target.value)
                setResult(null)
              }}
            />
          </div>
          {result && (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
              <p>
                已生成「{getArchetype(result.archetype).label}」草稿：
                {result.data.skills.length} 项{getArchetype(result.archetype).copy.skills}、
                {result.data.projects.length} 项{getArchetype(result.archetype).copy.projects}、
                {result.data.experience.length} 段{getArchetype(result.archetype).copy.experience}。
              </p>
              {result.provider === 'mock' && (
                <p className="text-warning">
                  当前为 mock 演示模式，展示的是示例草稿，并非真实 AI 识别结果。
                </p>
              )}
              {result.unmapped.length > 0 && (
                <div>
                  <p className="font-medium">以下内容未找到合适模块，应用后可手动补充：</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {result.unmapped.map((item, index) => (
                      <li key={`${index}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-muted-foreground">应用会替换当前编辑内容；尚未保存到数据库。</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {result ? (
            <>
              <Button variant="ghost" onClick={() => setResult(null)}>
                返回修改
              </Button>
              <Button onClick={apply}>应用到编辑器</Button>
            </>
          ) : (
            <Button onClick={() => void generate()} disabled={loading || text.trim().length < 10}>
              {loading && <Loader2 className="animate-spin" />}
              生成草稿
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
