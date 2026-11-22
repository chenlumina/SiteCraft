/**
 * 「技能」Tab：列表编辑 + 熟练度滑杆 + 双通道排序（HTML5 拖拽 & 上下箭头）。
 * 箭头按钮是拖拽的无障碍/触屏兜底：移动端没有原生 drag 事件，仍可调序。
 * 删除走「先删后撤销」：toast 的撤销回调把技能插回原索引（add→update→move）。
 */
'use client'

import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore } from '@/lib/stores/editor-store'
import { getArchetype } from '@/lib/archetypes'
import { MAX_SKILL_COUNT } from '@/lib/validators/site-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

/**
 * 熟练度百分比输入框：滑杆负责粗调，输入框负责精确输入（"输入 85" 比拖准 85 快得多）。
 * 受控策略：聚焦期间显示本地草稿 draft，避免用户正在敲的字被 store 值改写；
 * 每次可解析就实时写回 store（预览立刻变），失焦/回车时统一取整并夹到 0–100。
 */
function LevelField({
  skillName,
  value,
  onChange,
}: {
  skillName: string
  value: number
  onChange: (next: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

  function commit(raw: string) {
    const digits = raw.replace(/[^\d]/g, '')
    setDraft(null)
    if (digits === '') return // 清空视为放弃修改，保留原值
    onChange(clamp(Number(digits)))
  }

  return (
    <div className="relative w-14 shrink-0">
      <Input
        value={draft ?? String(value)}
        inputMode="numeric"
        autoComplete="off"
        aria-label={`${skillName} 熟练度百分比，0 到 100`}
        onChange={(e) => {
          const next = e.target.value
          if (!/^\d{0,3}$/.test(next)) return // 只接受数字，长度上限 3 位
          setDraft(next)
          if (next !== '') onChange(clamp(Number(next)))
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit((e.target as HTMLInputElement).value)
            e.currentTarget.blur()
          } else if (e.key === 'Escape') {
            setDraft(null)
            e.currentTarget.blur()
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            setDraft(null)
            onChange(clamp(value + (e.key === 'ArrowUp' ? 1 : -1)))
          }
        }}
        className="h-8 pl-1.5 pr-4 text-right font-mono text-xs"
      />
      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
        %
      </span>
    </div>
  )
}

export function SkillInput() {
  const skills = useEditorStore((s) => s.data.skills)
  const addSkill = useEditorStore((s) => s.addSkill)
  const updateSkill = useEditorStore((s) => s.updateSkill)
  const removeSkill = useEditorStore((s) => s.removeSkill)
  const moveSkill = useEditorStore((s) => s.moveSkill)
  const archetype = useEditorStore((s) => getArchetype(s.data.archetype))
  const showLevel = archetype.fields.skillLevel === 'bar'
  const itemName = archetype.id === 'artist' ? '媒介' : '技能'

  // 拖拽源索引用 ref 而非 state：dragover 高频触发，用 state 会导致整列表反复重渲染
  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  function handleDelete(index: number) {
    const skill = skills[index]
    removeSkill(skill.id)
    toast(`已删除技能「${skill.name}」`, {
      action: {
        label: '撤销',
        onClick: () => {
          useEditorStore.getState().addSkill()
          const state = useEditorStore.getState()
          const added = state.data.skills[state.data.skills.length - 1]
          state.updateSkill(added.id, { name: skill.name, level: skill.level })
          state.moveSkill(state.data.skills.length - 1, index)
        },
      },
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {showLevel
          ? '拖动左侧手柄或使用箭头调整顺序，熟练度实时反映在预览的技能条上。'
          : `按创作习惯排列${itemName}，可拖动手柄或使用箭头调整顺序。`}
      </p>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li
            key={skill.id}
            draggable
            onDragStart={() => {
              dragFrom.current = index
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(index)
            }}
            onDragLeave={() => setDragOver((v) => (v === index ? null : v))}
            onDrop={() => {
              if (dragFrom.current !== null) moveSkill(dragFrom.current, index)
              dragFrom.current = null
              setDragOver(null)
            }}
            onDragEnd={() => {
              dragFrom.current = null
              setDragOver(null)
            }}
            className={cn(
              'flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2 transition-colors sm:flex-nowrap',
              dragOver === index && 'border-primary bg-primary/10'
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
            <Input
              value={skill.name}
              aria-label={`技能 ${index + 1} 名称`}
              onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
              className="h-8 min-w-0 flex-1 basis-full sm:basis-auto"
            />
            {showLevel && (
              <>
                <Slider
                  value={[skill.level]}
                  min={0}
                  max={100}
                  step={1}
                  aria-label={`技能 ${skill.name} 熟练度`}
                  onValueChange={([value]) => updateSkill(skill.id, { level: value })}
                  className="w-full shrink-0 sm:w-24"
                />
                <LevelField
                  skillName={skill.name || `第 ${index + 1} 项`}
                  value={skill.level}
                  onChange={(level) => updateSkill(skill.id, { level })}
                />
              </>
            )}
            <div className="order-last ml-auto flex shrink-0 gap-1 sm:order-none sm:ml-0 sm:flex-col sm:gap-0">
              <button
                type="button"
                aria-label="上移"
                disabled={index === 0}
                onClick={() => moveSkill(index, index - 1)}
                className="grid h-6 w-6 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="下移"
                disabled={index === skills.length - 1}
                onClick={() => moveSkill(index, index + 1)}
                className="grid h-6 w-6 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`删除技能 ${skill.name}`}
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-danger"
              onClick={() => handleDelete(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
      {skills.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          还没有{itemName}，点击下方按钮添加第一项
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        disabled={skills.length >= MAX_SKILL_COUNT}
        onClick={addSkill}
      >
        <Plus /> 添加{itemName}（{skills.length}/{MAX_SKILL_COUNT}）
      </Button>
    </div>
  )
}
