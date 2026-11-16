/**
 * 滚动显现：给 .reveal 元素挂 IntersectionObserver，进入视口时加 .reveal-visible
 * 触发 CSS 过渡（首页各区块的渐进入场）。
 * 1.5s 兜底定时器保证「内容永不永久隐藏」：整页截图不触发滚动、打印、IO 异常等
 * 场景下所有区块仍会显示——动效是增强，可读性是底线。
 */
'use client'

import { useEffect } from 'react'

export function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12 }
    )
    elements.forEach((el) => observer.observe(el))
    // 兜底：无论是否滚动（整页截图 / 打印 / IO 异常），内容都不会永久隐藏
    const fallback = window.setTimeout(() => {
      elements.forEach((el) => el.classList.add('reveal-visible'))
    }, 1500)
    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])
}