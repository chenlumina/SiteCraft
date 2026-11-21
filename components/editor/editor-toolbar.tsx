/**
 * 编辑器顶栏：站点名 inline 编辑、模板选择、保存/导出/全屏预览/部署入口，
 * 以及「未保存/已保存+时间」状态指示（dirty 与 lastSavedAt 来自 store）。
 * 窄屏下文字标签隐藏只留图标（aria-label 保留可读性），按钮换行不溢出。
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Eye, Loader2, Rocket, Save, Sparkles } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useSiteActions } from '@/lib/hooks/use-site-actions'
import { TEMPLATES } from '@/lib/templates'
import { ARCHETYPE_LIST, getArchetype } from '@/lib/archetypes'
import { formatDateTime } from '@/lib/utils'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DeployDialog } from '@/components/editor/deploy-dialog'
import { AiFillDialog } from '@/components/editor/ai-fill-dialog'
import { FEATURES } from '@/lib/features'
import type { ArchetypeId, TemplateName } from '@/types'

export function EditorToolbar() {
  const siteName = useEditorStore((s) => s.siteName)
  const template = useEditorStore((s) => s.template)
  const dirty = useEditorStore((s) => s.dirty)
  const saving = useEditorStore((s) => s.saving)
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt)
  const setSiteName = useEditorStore((s) => s.setSiteName)
  const setTemplate = useEditorStore((s) => s.setTemplate)
  const setArchetype = useEditorStore((s) => s.setArchetype)
  const archetype = useEditorStore((s) => getArchetype(s.data.archetype))
  // 白名单只收窄新选择；当前模板即使不在名单内也保留，避免旧站点选择器失效
  const availableTemplates = TEMPLATES.filter(
    (t) => archetype.templates.includes(t.name) || t.name === template
  )
  const { saveSite, exportHtml } = useSiteActions()
  const [deployOpen, setDeployOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  return (
    <header className="z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur">
      <Link href="/" aria-label="返回首页" className="shrink-0">
        <BrandLogo withText={false} />
      </Link>
      <Separator orientation="vertical" className="hidden h-6 sm:block" />
      <Input
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        aria-label="站点名称"
        className="h-8 w-40 border-transparent bg-transparent px-2 font-medium hover:border-input focus:bg-muted sm:w-52"
      />
      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <span
          className={
            dirty ? 'h-1.5 w-1.5 rounded-full bg-warning' : 'h-1.5 w-1.5 rounded-full bg-success'
          }
        />
        {dirty
          ? '有未保存修改'
          : lastSavedAt
            ? `已保存 · ${formatDateTime(lastSavedAt)}`
            : '尚未保存'}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Select value={archetype.id} onValueChange={(v) => setArchetype(v as ArchetypeId)}>
          <SelectTrigger className="h-8 w-32" aria-label="内容方向">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARCHETYPE_LIST.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={template} onValueChange={(v) => setTemplate(v as TemplateName)}>
          <SelectTrigger className="h-8 w-40" aria-label="选择模板">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableTemplates.map((t) => (
              <SelectItem key={t.name} value={t.name}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: t.defaultColor }}
                  />
                  {t.displayName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {FEATURES.AI_FILL && (
          <Button variant="outline" size="sm" className="h-8" onClick={() => setAiOpen(true)}>
            <Sparkles /> <span className="hidden sm:inline">AI 预填</span>
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8" onClick={exportHtml}>
          <Download /> <span className="hidden sm:inline">导出 HTML</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8" asChild>
          <Link href="/preview" target="_blank">
            <Eye /> <span className="hidden sm:inline">全屏预览</span>
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={() => setDeployOpen(true)}>
          <Rocket /> <span className="hidden sm:inline">部署</span>
        </Button>
        <Button size="sm" className="h-8" onClick={() => void saveSite()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          保存
        </Button>
      </div>
      <DeployDialog open={deployOpen} onOpenChange={setDeployOpen} />
      {FEATURES.AI_FILL && <AiFillDialog open={aiOpen} onOpenChange={setAiOpen} />}
    </header>
  )
}
