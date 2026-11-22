/**
 * 页脚双主题：开发者（纸面卡底）/ 艺术（白盒画廊底）。
 * 两个世界各自成立，但共享同一套信息层级：品牌 + 分组导航 + 版权行；
 * 区别只在表面材质与导航内容，不复制两套结构。
 */
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'

type FooterLink = { href: string; label: string; internal?: boolean }

export function SiteFooter({ mode = 'developer' }: { mode?: 'developer' | 'artist' }) {
  const artist = mode === 'artist'
  const hover = artist
    ? 'transition-colors hover:text-[#171917]'
    : 'transition-colors hover:text-foreground'
  const groups: { title: string; links: FooterLink[] }[] = artist
    ? [
        {
          title: '产品',
          links: [
            { href: '#playground', label: '试玩' },
            { href: '#gallery', label: '展厅' },
            { href: '#templates', label: '版式样册' },
          ],
        },
        {
          title: '开始',
          links: [
            { href: '/artist-editor?new=1', label: '开始策展', internal: true },
            { href: '#sites', label: '我的作品集站点' },
          ],
        },
      ]
    : [
        {
          title: '产品',
          links: [
            { href: '#templates', label: '模板画廊' },
            { href: '#workflow', label: '工作流程' },
            { href: '#sites', label: '我的站点' },
          ],
        },
        {
          title: '开始',
          links: [
            { href: '/editor', label: '开始做我的官网', internal: true },
            { href: '/preview', label: '全屏预览', internal: true },
          ],
        },
      ]

  return (
    <footer
      className={
        artist
          ? 'relative border-t border-black/10 bg-[#f3f3f0] text-[#171917]'
          : 'relative border-t bg-card'
      }
    >
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-xs">
            <BrandLogo />
            <p
              className={
                artist
                  ? 'mt-3 text-sm leading-relaxed text-black/60'
                  : 'mt-3 text-sm leading-relaxed text-muted-foreground'
              }
            >
              {artist
                ? '艺术作品集生成器：整理作品、选择版式、发布你的数字展厅。'
                : '个人官网生成器：填写资料、挑选版式、实时预览，一键导出与部署。'}
            </p>
          </div>
          <nav className="flex gap-12 text-sm" aria-label="页脚导航">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-3 font-semibold">{group.title}</p>
                <ul
                  className={artist ? 'space-y-2 text-black/60' : 'space-y-2 text-muted-foreground'}
                >
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {link.internal ? (
                        <Link href={link.href} className={hover}>
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className={hover}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div
          className={
            artist
              ? 'mt-10 border-t border-black/10 pt-6 text-xs text-black/50'
              : 'mt-10 border-t pt-6 text-xs text-muted-foreground'
          }
        >
          © {new Date().getFullYear()} SiteCraft · 本地运行，数据属于你
        </div>
      </div>
    </footer>
  )
}
