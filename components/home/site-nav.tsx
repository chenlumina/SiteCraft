/**
 * 首页固定导航：滚动超过 24px 后加毛玻璃底（scrolled），
 * 并按各区块 getBoundingClientRect().top 判定当前区块高亮（active）。
 * 移动端（<md）收纳为汉堡菜单：锚点、切换身份与主 CTA 都能在菜单内完成，
 * 修复此前 390px 下 nav 整体 display:none 导致无法跳转与换身份的问题。
 * 锚点跳转的落点偏移由 globals.css 的 scroll-padding-top 统一处理，
 * 保证跳转后标题不被固定导航遮住。
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
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
  const artist = mode === 'artist'
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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

  // 菜单打开时锁住背景滚动，关闭或卸载时恢复
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const ctaLabel = mode === 'artist' ? '开始策展' : '开始做我的官网'
  const ctaHref = mode === 'artist' ? '/artist-editor?new=1' : '/editor'

  function switchProfile() {
    setMenuOpen(false)
    onEditProfile?.()
    window.location.href = '/?choose=1'
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || menuOpen
          ? artist
            ? 'border-b border-black/10 bg-[#f3f3f0]/95 backdrop-blur-sm'
            : 'border-b border-border bg-background/95 backdrop-blur-sm'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-5">
        <Link href="/" aria-label="SiteCraft 首页" onClick={() => setMenuOpen(false)}>
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
                  ? artist
                    ? 'text-[#171917]'
                    : 'text-foreground'
                  : artist
                    ? 'text-black/55 hover:text-[#171917]'
                    : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          {onEditProfile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={switchProfile}
              className={cn(
                'hidden sm:inline-flex',
                artist ? 'text-black/55 hover:text-[#171917]' : 'text-muted-foreground'
              )}
            >
              切换身份
            </Button>
          )}
          <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Link href={ctaHref}>
              {ctaLabel} <ArrowRight />
            </Link>
          </Button>
          <button
            type="button"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            aria-controls="mobile-site-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div
          id="mobile-site-menu"
          className={cn(
            'max-h-[calc(100dvh-4rem)] overflow-y-auto border-t backdrop-blur md:hidden',
            artist ? 'bg-[#f3f3f0]/98 border-black/10' : 'bg-background/98 border-border'
          )}
        >
          <nav className="mx-auto grid max-w-6xl gap-1 px-5 py-3" aria-label="移动端导航">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex min-h-11 items-center rounded-md px-2 text-sm transition-colors',
                  artist
                    ? 'text-black/60 hover:bg-black/[0.05] hover:text-[#171917]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {link.label}
              </a>
            ))}
            {onEditProfile && (
              <button
                type="button"
                onClick={switchProfile}
                className={cn(
                  'flex min-h-11 items-center rounded-md px-2 text-left text-sm transition-colors',
                  artist
                    ? 'text-black/60 hover:bg-black/[0.05] hover:text-[#171917]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                切换身份
              </button>
            )}
            <Link
              href={ctaHref}
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              {ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
