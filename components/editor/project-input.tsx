/**
 * 「项目」Tab：卡片列表 + 对话框表单（新增/编辑共用一个 Dialog）。
 * 标签在输入框里是逗号分隔字符串（tagsText），提交时 parseTags 解析成数组，
 * 再用 projectSchema 二次校验（单个标签长度/数量上限），双层保证数据合法。
 * 精选星标、拖拽/箭头排序、删除撤销与技能区交互一致，降低学习成本。
 */
'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ChevronDown,
  ChevronUp,
  FolderGit2,
  GripVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Project } from '@/types'
import { useEditorStore } from '@/lib/stores/editor-store'
import { MAX_PROJECT_COUNT, MAX_TAG_COUNT, projectSchema } from '@/lib/validators/site-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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

const projectFormSchema = z.object({
  name: projectSchema.shape.name,
  description: projectSchema.shape.description,
  tagsText: z.string().max(120, '标签总长最多 120 字'),
  link: projectSchema.shape.link,
  repo: projectSchema.shape.repo,
  highlight: z.boolean(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

/** 中英文逗号都接受（用户习惯不同），去空去重前置、截断到上限 */
function parseTags(text: string): string[] {
  return text
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, MAX_TAG_COUNT)
}

function ProjectDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Project | null
}) {
  const addProject = useEditorStore((s) => s.addProject)
  const updateProject = useEditorStore((s) => s.updateProject)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: editing?.name ?? '',
      description: editing?.description ?? '',
      tagsText: editing?.tags.join(', ') ?? '',
      link: editing?.link ?? '',
      repo: editing?.repo ?? '',
      highlight: editing?.highlight ?? false,
    },
  })

  function onSubmit(values: ProjectFormValues) {
    const payload = {
      name: values.name,
      description: values.description,
      tags: parseTags(values.tagsText),
      link: values.link,
      repo: values.repo,
      highlight: values.highlight,
    }
    // 表单 schema 只管输入形态；落库前用完整 projectSchema 再校验一次（含 tags 数组规则）
    const parsed = projectSchema.omit({ id: true }).safeParse(payload)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? '表单校验失败')
      return
    }
    if (editing) {
      updateProject(editing.id, parsed.data)
      toast.success('项目已更新')
    } else {
      addProject(parsed.data)
      toast.success('项目已添加')
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
          <DialogTitle>{editing ? '编辑项目' : '添加项目'}</DialogTitle>
          <DialogDescription>展示在官网「项目作品」区块，精选项目会获得徽章标记。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="project-name">项目名称 *</Label>
            <Input id="project-name" className="mt-1.5" placeholder="例如：个人博客系统" {...register('name')} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="project-desc">项目描述</Label>
            <Textarea
              id="project-desc"
              className="mt-1.5"
              rows={3}
              placeholder="一句话说明项目做了什么、用了什么技术"
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </div>
          <div>
            <Label htmlFor="project-tags">技术标签（逗号分隔，最多 {MAX_TAG_COUNT} 个）</Label>
            <Input id="project-tags" className="mt-1.5" placeholder="Next.js, TypeScript, Prisma" {...register('tagsText')} />
            <FieldError message={errors.tagsText?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="project-link">演示链接</Label>
              <Input id="project-link" className="mt-1.5" placeholder="https://" {...register('link')} />
              <FieldError message={errors.link?.message} />
            </div>
            <div>
              <Label htmlFor="project-repo">源码链接</Label>
              <Input id="project-repo" className="mt-1.5" placeholder="https://" {...register('repo')} />
              <FieldError message={errors.repo?.message} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-ink-850 px-3 py-2.5">
            <Label htmlFor="project-highlight" className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-warning" /> 标记为精选项目
            </Label>
            <Switch
              id="project-highlight"
              checked={watch('highlight')}
              onCheckedChange={(checked) => setValue('highlight', checked)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{editing ? '保存修改' : '添加项目'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectInput() {
  const projects = useEditorStore((s) => s.data.projects)
  const updateProject = useEditorStore((s) => s.updateProject)
  const removeProject = useEditorStore((s) => s.removeProject)
  const moveProject = useEditorStore((s) => s.moveProject)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  function handleDelete(index: number) {
    const project = projects[index]
    removeProject(project.id)
    toast(`已删除项目「${project.name}」`, {
      action: {
        label: '撤销',
        onClick: () => {
          const state = useEditorStore.getState()
          state.addProject(project)
          const latest = useEditorStore.getState()
          latest.moveProject(latest.data.projects.length - 1, index)
        },
      },
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        拖动排序，星标切换精选。项目卡片在预览中实时可见。
      </p>
      <ul className="space-y-2">
        {projects.map((project, index) => (
          <li
            key={project.id}
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
              if (dragFrom.current !== null) moveProject(dragFrom.current, index)
              dragFrom.current = null
              setDragOver(null)
            }}
            onDragEnd={() => {
              dragFrom.current = null
              setDragOver(null)
            }}
            className={cn(
              'rounded-lg border bg-ink-850 p-3 transition-colors',
              dragOver === index && 'border-primary bg-primary/10'
            )}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
              <FolderGit2 className="h-4 w-4 shrink-0 text-brand-cyan" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{project.name}</span>
              <button
                type="button"
                aria-label={project.highlight ? '取消精选' : '标记精选'}
                onClick={() => updateProject(project.id, { highlight: !project.highlight })}
                className={cn(
                  'shrink-0 transition-colors',
                  project.highlight ? 'text-warning' : 'text-muted-foreground hover:text-warning'
                )}
              >
                <Star className={cn('h-4 w-4', project.highlight && 'fill-current')} />
              </button>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label="上移"
                  disabled={index === 0}
                  onClick={() => moveProject(index, index - 1)}
                  className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="下移"
                  disabled={index === projects.length - 1}
                  onClick={() => moveProject(index, index + 1)}
                  className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`编辑项目 ${project.name}`}
                className="h-7 w-7 shrink-0"
                onClick={() => {
                  setEditing(project)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`删除项目 ${project.name}`}
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-danger"
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {project.description && (
              <p className="mt-1.5 line-clamp-2 pl-6 text-xs text-muted-foreground">{project.description}</p>
            )}
            {project.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 pl-6">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      {projects.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          还没有项目，添加你的第一个作品吧
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        disabled={projects.length >= MAX_PROJECT_COUNT}
        onClick={() => {
          setEditing(null)
          setDialogOpen(true)
        }}
      >
        <Plus /> 添加项目（{projects.length}/{MAX_PROJECT_COUNT}）
      </Button>
      {dialogOpen && (
        <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      )}
    </div>
  )
}