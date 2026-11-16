/**
 * 根布局：全站 metadata/viewport、中文 lang、默认 dark class（构建器 UI 为深色），
 * 并挂载全局 Provider：TooltipProvider（Radix  tooltip 必需祖先）与
 * Toaster（sonner 全局 toast 容器，所有操作反馈统一从这里弹出）。
 */
import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SiteCraft · 个人官网生成器',
    template: '%s | SiteCraft',
  },
  description:
    '填写资料、挑选模板、实时预览，一键导出并部署你的个人官网。Next.js 14 + Prisma 全栈驱动。',
  keywords: ['个人官网', '建站工具', '作品集', '简历网站', 'SiteCraft'],
}

export const viewport: Viewport = {
  themeColor: '#0b0f1e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}