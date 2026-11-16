/**
 * 「主题」Tab：三通道改主题色（预设色板 / 原生取色器 / hex 输入），
 * 任一通道变更立即 setPrimaryColor → 预览实时换色。
 * hex 输入用本地草稿 hexDraft：非法中间态（如刚输入 "#f4"）只报错不写入 store，
 * 避免预览收到坏颜色；合法后才同步，保证 store 里永远是合法 hex。
 */
'use client'

import { useState } from 'react'
import { Palette, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore } from '@/lib/stores/editor-store'
import { TEMPLATES, getTemplate } from '@/lib/templates'
import { isValidHexColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormSection } from '@/components/editor/form-section'
import { cn } from '@/lib/utils'

export function ThemePanel() {
  const template = useEditorStore((s) => s.template)
  const primaryColor = useEditorStore((s) => s.data.theme.primaryColor)
  const setPrimaryColor = useEditorStore((s) => s.setPrimaryColor)
  const meta = getTemplate(template)

  const [hexDraft, setHexDraft] = useState(primaryColor)
  const [hexError, setHexError] = useState('')

  function applyHex(value: string) {
    setHexDraft(value)
    if (isValidHexColor(value)) {
      setHexError('')
      setPrimaryColor(value)
    } else {
      setHexError('格式应为 #RRGGBB，例如 #22d3ee')
    }
  }

  return (
    <div className="space-y-4">
      <FormSection
        title="主题色"
        description={`当前模板「${meta.displayName}」的强调色，应用于标题、按钮、技能条与光晕`}
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setPrimaryColor(meta.defaultColor)
              setHexDraft(meta.defaultColor)
              setHexError('')
              toast.success('已重置为模板默认色')
            }}
          >
            <RotateCcw /> 重置
          </Button>
        }
      >
        <div className="grid grid-cols-6 gap-2">
          {meta.swatches.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`选择主题色 ${color}`}
              onClick={() => {
                setPrimaryColor(color)
                setHexDraft(color)
                setHexError('')
              }}
              className={cn(
                'aspect-square rounded-lg border-2 transition-transform hover:scale-110',
                primaryColor.toLowerCase() === color.toLowerCase()
                  ? 'border-foreground scale-110'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="custom-color">自定义颜色</Label>
            <Input
              id="custom-color"
              className="mt-1.5 font-mono"
              value={hexDraft}
              onChange={(e) => applyHex(e.target.value)}
              placeholder="#7c6cff"
            />
          </div>
          <div>
            <Label htmlFor="color-picker" className="sr-only">
              取色器
            </Label>
            <input
              id="color-picker"
              type="color"
              value={isValidHexColor(primaryColor) ? primaryColor : meta.defaultColor}
              onChange={(e) => {
                setPrimaryColor(e.target.value)
                setHexDraft(e.target.value)
                setHexError('')
              }}
              className="h-9 w-14 cursor-pointer rounded-md border border-input bg-ink-850 p-1"
            />
          </div>
        </div>
        {hexError && <p className="mt-1 text-xs text-danger">{hexError}</p>}
      </FormSection>

      <FormSection title="模板风格" description="八套模板各自拥有独立的版式与气质">
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => {
            const active = template === t.name
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => useEditorStore.getState().setTemplate(t.name)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-all',
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-ink-850 hover:border-muted-foreground'
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: t.defaultColor }}
                  />
                  <span className="text-xs font-semibold">{t.displayName}</span>
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{t.tagline}</span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          切换模板会应用该模板的默认主题色，之后可再自定义。
        </p>
      </FormSection>
    </div>
  )
}