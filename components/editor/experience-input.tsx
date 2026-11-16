/**
 * 「经历」Tab：教育/实习/项目经历的时间线列表编辑。
 * 对话框表单直接复用 experienceSchema.omit({id})，与后端校验同一份规则；
 * 排序与删除撤销交互同技能/项目区。
 */
'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, ChevronDown, ChevronUp, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Experience } from '@/types'
import { useEditorStore } from '@/lib/stores/editor-store'
import { MAX_EXPERIENCE_COUNT, experienceSchema } from '@/lib/validators/site-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldError } from '@/components/editor/form-section'
import { cn } from '@/lib/utils'

const experienceFormSchema = experienceSchema.omit({ id: true })
type ExperienceFormValues = z.infer<typeof experienceFormSchema>

function ExperienceDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Experience | null
}) {
  const addExperience = useEditorStore((s) => s.addExperience)
  const updateExperience = useEditorStore((s) => s.updateExperience)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      role: editing?.role ?? '',
      organization: editing?.organization ?? '',
      period: editing?.period ?? '',
      description: editing?.description ?? '',
    },
  })

  function onSubmit(values: ExperienceFormValues) {
    if (editing) {
      updateExperience(editing.id, values)
      toast.success('经历已更新')
    } else {
      addExperience(values)
      toast.success('经历已添加')
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑经历' : '添加经历'}</DialogTitle>
          <DialogDescription>教育背景、实习或项目经历，按时间线展示。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="exp-role">角色 / 职位 *</Label>
            <Input id="exp-role" className="mt-1.5" placeholder="例如：前端开发实习生" {...register('role')} />
            <FieldError message={errors.role?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exp-org">组织 / 学校 *</Label>
              <Input id="exp-org" className="mt-1.5" placeholder="例如：某科技公司" {...register('organization')} />
              <FieldError message={errors.organization?.message} />
            </div>
            <div>
              <Label htmlFor="exp-period">时间段 *</Label>
              <Input id="exp-period" className="mt-1.5" placeholder="2025.06 - 2025.09" {...register('period')} />
              <FieldError message={errors.period?.message} />
            </div>
          </div>
          <div>
            <Label htmlFor="exp-desc">描述</Label>
            <Textarea
              id="exp-desc"
              className="mt-1.5"
              rows={3}
              placeholder="做了什么、取得了什么成果"
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{editing ? '保存修改' : '添加经历'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ExperienceInput() {
  const experience = useEditorStore((s) => s.data.experience)
  const removeExperience = useEditorStore((s) => s.removeExperience)
  const moveExperience = useEditorStore((s) => s.moveExperience)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Experience | null>(null)
  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  function handleDelete(index: number) {
    const item = experience[index]
    removeExperience(item.id)
    toast(`已删除经历「${item.role}」`, {
      action: {
        label: '撤销',
        onClick: () => {
          const state = useEditorStore.getState()
          state.addExperience(item)
          const latest = useEditorStore.getState()
          latest.moveExperience(latest.data.experience.length - 1, index)
        },
      },
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">按时间线展示在官网「经历」区块，可拖动排序。</p>
      <ul className="space-y-2">
        {experience.map((item, index) => (
          <li
            key={item.id}
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
              if (dragFrom.current !== null) moveExperience(dragFrom.current, index)
              dragFrom.current = null
              setDragOver(null)
            }}
            onDragEnd={() => {
              dragFrom.current = null
              setDragOver(null)
            }}
            className={cn(
              'rounded-lg border bg-background p-3 transition-colors',
              dragOver === index && 'border-primary bg-primary/10'
            )}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
              <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.role}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.organization} · {item.period}
                </p>
              </div>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label="上移"
                  disabled={index === 0}
                  onClick={() => moveExperience(index, index - 1)}
                  className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="下移"
                  disabled={index === experience.length - 1}
                  onClick={() => moveExperience(index, index + 1)}
                  className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`编辑经历 ${item.role}`}
                className="h-7 w-7 shrink-0"
                onClick={() => {
                  setEditing(item)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`删除经历 ${item.role}`}
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-danger"
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {experience.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          还没有经历，添加教育背景或实习经历
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        disabled={experience.length >= MAX_EXPERIENCE_COUNT}
        onClick={() => {
          setEditing(null)
          setDialogOpen(true)
        }}
      >
        <Plus /> 添加经历（{experience.length}/{MAX_EXPERIENCE_COUNT}）
      </Button>
      {dialogOpen && (
        <ExperienceDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      )}
    </div>
  )
}