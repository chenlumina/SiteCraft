/** 页脚：品牌 + 锚点导航 + 技术栈 chips（向访客/评审展示规范选型）+ 版权 */
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'

const TECH_CHIPS = ['Next.js 14', 'TypeScript', 'TailwindCSS', 'shadcn/ui', 'Zustand', 'Prisma', 'Zod']

export function SiteFooter() {
  return (
    <footer className="relative border-t bg-card">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-xs">
            <BrandLogo />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              个人官网生成器：填写资料、挑选模板、实时预览，一键导出与部署。
            </p>
          </div>
          <nav className="flex gap-12 text-sm" aria-label="页脚导航">
            <div>
              <p className="mb-3 font-semibold">产品</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a className="transition-colors hover:text-foreground" href="#templates">模板画廊</a></li>
                <li><a className="transition-colors hover:text-foreground" href="#workflow">工作流程</a></li>
                <li><a className="transition-colors hover:text-foreground" href="#sites">我的站点</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold">开始</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link className="transition-colors hover:text-foreground" href="/editor">创建官网</Link></li>
                <li><Link className="transition-colors hover:text-foreground" href="/preview">全屏预览</Link></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-6">
          {TECH_CHIPS.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-border bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
            >
              {chip}
            </span>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            © {new Date().getFullYear()} SiteCraft · 本地运行，数据属于你
          </span>
        </div>
      </div>
    </footer>
  )
}