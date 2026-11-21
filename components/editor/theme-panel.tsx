/**
 * 「主题」Tab：三通道改主题色（预设色板 / 原生取色器 / hex 输入），
 * 任一通道变更立即 setPrimaryColor → 预览实时换色。
 * hex 输入用本地草稿 hexDraft：非法中间态（如刚输入 "#f4"）只报错不写入 store，
 * 避免预览收到坏颜色；合法后才同步，保证 store 里永远是合法 hex。
 */
'use client'

import { useState } from 'react'
import { ArrowRight, Palette, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore } from '@/lib/stores/editor-store'
import { TEMPLATES, getTemplate } from '@/lib/templates'
import { getArchetype } from '@/lib/archetypes'
import { isValidHexColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { contrastInk } from '@/lib/generators/color'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormSection } from '@/components/editor/form-section'
import { cn } from '@/lib/utils'

export function ThemePanel() {
  const template = useEditorStore((s) => s.template)
  const primaryColor = useEditorStore((s) => s.data.theme.primaryColor)
  const setPrimaryColor = useEditorStore((s) => s.setPrimaryColor)
  const archetype = useEditorStore((s) => getArchetype(s.data.archetype))
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

  // 与生成器同源的派生：文字用色 = 强调色按模板底色压到 ≥4.8:1
  const isHex = isValidHexColor(primaryColor)
  const baseColor = isHex ? primaryColor : meta.defaultColor
  const inkColor = contrastInk(baseColor, '#ffffff')
  const contrastRatio = (() => {
    const rel = (hex: string) => {
      const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      return c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    }
    const [a, b] = [rel(inkColor), rel('#ffffff')].map(
      (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    )
    const [hi, lo] = [a, b].sort((x, y) => y - x)
    return (Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10).toFixed(1)
  })()

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
                  ? 'scale-110 border-foreground'
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
              className="h-9 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
            />
          </div>
        </div>
        {hexError && <p className="mt-1 text-xs text-danger">{hexError}</p>}
      </FormSection>

      <FormSection
        title="文字用色"
        description="强调色用于底色、刻度与线条；当它被用作正文文字时，会自动压暗到可读"
      >
        <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span
              className="h-5 w-5 rounded-full border border-border"
              style={{ backgroundColor: isHex ? primaryColor : meta.defaultColor }}
            />
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span
              className="h-5 w-5 rounded-full border border-border"
              style={{ backgroundColor: inkColor }}
            />
          </div>
          <div className="min-w-0 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-mono text-foreground">
              {(isHex ? primaryColor : meta.defaultColor).toLowerCase()}
            </span>
            {' → '}
            <span className="font-mono text-foreground">{inkColor}</span>
            <br />
            正文对比度 {contrastRatio}:1（低于 4.8 会自动压暗，避免看不清）
          </div>
        </div>
      </FormSection>

      <FormSection title="模板风格" description="十三套模板各自拥有独立的版式与气质">
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.filter((t) => archetype.templates.includes(t.name) || t.name === template).map(
            (t) => {
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
                      : 'border-border bg-background hover:border-muted-foreground'
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
            }
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          切换模板会应用该模板的默认主题色，之后可再自定义。
        </p>
      </FormSection>
    </div>
  )
}
