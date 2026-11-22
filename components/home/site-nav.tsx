/**
 * 首页固定导航：滚动超过 24px 后加毛玻璃底（scrolled），
 * 并按各区块 getBoundingClientRect().top 判定当前区块高亮（active）。
 * 锚点跳转的落点偏移由 globals.css 的 scroll-padding-top 统一处理，
 * 保证跳转后标题不被固定导航遮住。
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEVELOPER_NAV_LINKS = [
  { href: '#templates', label: '模板' },
  { href: '#workflow', label: '流程' },
  { href: '#sites', label: '我的站点' },
]

const ARTIST_NAV_LINKS = [
  { href: '#playground', label: '试玩' },
  { href: '#gallery', label: '展厅' },
  { href: '#curation', label: '策展' },
  { href: '#templates', label: '版式' },
]

export function SiteNav({
  onEditProfile,
  mode = 'developer',
}: {
  onEditProfile?: () => void
  mode?: 'developer' | 'artist'
}) {
  const navLinks = mode === 'artist' ? ARTIST_NAV_LINKS : DEVELOPER_NAV_LINKS
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
      let current = ''
      for (const link of navLinks) {
        const el = document.querySelector(link.href)
        if (el && el.getBoundingClientRect().top <= 140) current = link.href
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [navLinks])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-border bg-background/95 backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="SiteCraft 首页">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                active === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        {onEditProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onEditProfile()
              window.location.href = '/?choose=1'
            }}
            className="hidden text-muted-foreground sm:inline-flex"
          >
            切换身份
          </Button>
        )}
        <Button asChild size="sm" className="gap-1.5">
          {mode === 'artist' ? (
            <Link href="/artist-editor?new=1">
              开始策展 <ArrowRight />
            </Link>
          ) : (
            <Link href="/editor">
              开始创建 <ArrowRight />
            </Link>
          )}
        </Button>
      </div>
    </header>
  )
}
