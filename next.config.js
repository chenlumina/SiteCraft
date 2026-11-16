/**
 * Next.js 配置：安全头（规范 9 要求 CSP）+ 严格模式。
 * CSP 取舍：Next 启动需要内联 bootstrap 脚本、生成器需要内联 <style> 与动态
 * style 属性，故 script/style 放行 'unsafe-inline'；开发模式额外放行
 * 'unsafe-eval' 与 ws:（React Refresh / HMR 必需），生产自动收紧。
 * img-src 放行 https: 与 data: 以支持用户外链头像与内联 data URI 头像。
 */
/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig