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
import { MAX_SKILL_COUNT } from '@/lib/validators/site-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export function SkillInput() {
  const skills = useEditorStore((s) => s.data.skills)
  const addSkill = useEditorStore((s) => s.addSkill)
  const updateSkill = useEditorStore((s) => s.updateSkill)
  const removeSkill = useEditorStore((s) => s.removeSkill)
  const moveSkill = useEditorStore((s) => s.moveSkill)

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
        拖动左侧手柄或使用箭头调整顺序，熟练度实时反映在预览的技能条上。
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
              'flex items-center gap-2 rounded-lg border bg-ink-850 p-2 transition-colors',
              dragOver === index && 'border-primary bg-primary/10'
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
            <Input
              value={skill.name}
              aria-label={`技能 ${index + 1} 名称`}
              onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
              className="h-8 min-w-0 flex-1"
            />
            <Slider
              value={[skill.level]}
              min={0}
              max={100}
              step={1}
              aria-label={`技能 ${skill.name} 熟练度`}
              onValueChange={([value]) => updateSkill(skill.id, { level: value })}
              className="w-24 shrink-0"
            />
            <span className="w-9 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {skill.level}%
            </span>
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                aria-label="上移"
                disabled={index === 0}
                onClick={() => moveSkill(index, index - 1)}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="下移"
                disabled={index === skills.length - 1}
                onClick={() => moveSkill(index, index + 1)}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
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
          还没有技能，点击下方按钮添加第一项
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        disabled={skills.length >= MAX_SKILL_COUNT}
        onClick={addSkill}
      >
        <Plus /> 添加技能（{skills.length}/{MAX_SKILL_COUNT}）
      </Button>
    </div>
  )
}