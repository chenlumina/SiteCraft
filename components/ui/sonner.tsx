/**
 * 全局 Toast 容器（sonner）：深色主题 + 右下角定位，classNames 覆写为项目 ink 色板。
 * 根布局挂载一次；业务侧 import { toast } from 'sonner' 直接调用，
 * 保存/导出/删除撤销等所有操作反馈统一走这里。
 */
'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-ink-800 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }