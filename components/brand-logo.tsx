/**
 * 品牌标识：内联 SVG（渐变圆角方块 + 代码括号），与 app/icon.svg、
 * 导出 HTML 的 data URI favicon 同一图形，保证品牌在各处一致。
 * withText=false 供编辑器顶栏等窄空间只放图形。
 */
import { cn } from '@/lib/utils'

export function BrandLogo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 40 40" className="h-8 w-8 flex-none" aria-hidden="true">
        <defs>
          <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c6cff" />
            <stop offset="55%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#brand-g)" />
        <path
          d="M15 14l-6 6 6 6M25 14l6 6-6 6"
          stroke="#0b0f1e"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="20" cy="20" r="2.2" fill="#0b0f1e" />
      </svg>
      {withText && (
        <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
          Site<span className="text-brand-cyan">Craft</span>
        </span>
      )}
    </span>
  )
}