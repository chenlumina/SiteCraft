/**
 * 编辑器左栏的分区容器（标题+说明+可选操作位）与字段错误提示。
 * 统一卡片外观，让五个 Tab 的表单区块视觉一致。
 */
'use client'

import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function FormSection({ title, description, children, className, action }: FormSectionProps) {
  return (
    <section className={cn('rounded-xl border bg-card/60 p-4', className)}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-danger">{message}</p>
}