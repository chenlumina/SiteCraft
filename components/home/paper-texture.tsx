/**
 * 首页「印刷工坊」艺术层（纯装饰：aria-hidden + pointer-events-none）。
 * 主题即艺术来源——这是一张活的印刷打样纸 / 寄往全世界的航空信封：
 *   底：点阵稿纸 + 纸浆颗粒（.paper-dots / .paper-grain）
 *   墨：半调网点墨晕（印泥红 / 进程青 / 进程品红，经典印刷渐变网点）
 *   色：CMYK+R 印刷校准条（进程四色是主题自带的高饱和色，而非外来渐变）
 *   规：套准十字标记、幽灵字样标本（& / § 描边大字）、证券纸团花水印
 *   邮：航空邮戳（盖章入场）+ 虚线航线与纸飞机（呼应「部署到全世界」）
 *   人：红笔边注（描线入场）、咖啡渍、漂浮墨尘
 * 所有元素落在页边留白与不同滚动深度，配合 data-depth 视差形成纵深；
 * 透明度压低保证正文对比度；reduced-motion 关闭全部动效；打印整层隐藏。
 * 叠放：本层 absolute inset-0 铺满整页，首页内容区块均 relative/fixed 且 DOM 在后，天然居上。
 * 水合安全：一切计算坐标用 toFixed 字符串；墨尘位置用固定常量表（不用 Math.random）。
 */
'use client'

import { useEffect, useRef } from 'react'

/* 印刷进程色 + 印泥红 + 咖啡渍：主题自带色板 */
const SEAL = '#9e2b25'
const CYAN = '#009fda'
const MAGENTA = '#e6007e'
const YELLOW = '#ffcc00'
const KEY = '#22201c'
const COFFEE = '#8a5a33'

/* 墨尘固定常量表：保证 SSR 与客户端逐字一致（随机数会触发 hydration mismatch） */
const DUST = [
  { top: '6%', left: '18%', size: 3, dur: '11s', delay: '0s' },
  { top: '12%', left: '72%', size: 2, dur: '14s', delay: '1.2s' },
  { top: '21%', left: '40%', size: 3, dur: '12s', delay: '2.1s' },
  { top: '29%', left: '86%', size: 2, dur: '16s', delay: '0.6s' },
  { top: '37%', left: '12%', size: 4, dur: '13s', delay: '3s' },
  { top: '46%', left: '64%', size: 2, dur: '15s', delay: '1.8s' },
  { top: '55%', left: '28%', size: 3, dur: '12s', delay: '4s' },
  { top: '63%', left: '80%', size: 2, dur: '17s', delay: '0.9s' },
  { top: '71%', left: '46%', size: 3, dur: '14s', delay: '2.6s' },
  { top: '80%', left: '16%', size: 2, dur: '13s', delay: '3.4s' },
  { top: '88%', left: '68%', size: 3, dur: '16s', delay: '1.5s' },
  { top: '94%', left: '36%', size: 2, dur: '12s', delay: '4.2s' },
]

export function PaperTexture() {
  const layerRef = useRef<HTMLDivElement>(null)

  // 视差：带 data-depth 的外层随滚动轻微下移（系数越小越「远」），rAF 合帧、passive 监听。
  // 只写外层 translate，旋转/尺寸放在内层，避免覆盖 Tailwind 的 transform。
  useEffect(() => {
    const layer = layerRef.current
    if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = Array.from(layer.querySelectorAll<HTMLElement>('[data-depth]'))
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        for (const el of els) {
          const depth = parseFloat(el.dataset.depth || '0')
          el.style.transform = `translate3d(0, ${(y * depth).toFixed(1)}px, 0)`
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="paper-texture pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="paper-dots absolute inset-0" />
      <div className="paper-grain absolute inset-0" />

      {/* 半调墨晕：首屏左（印泥红）/ 试衣间右（进程青）/ 尾段左（进程品红） */}
      <div data-depth="0.05" className="absolute -left-28 top-[3%]">
        <HalftoneBloom
          size={440}
          step={18}
          color={SEAL}
          opacity={0.16}
          className="halftone-breathe"
        />
      </div>
      <div data-depth="0.04" className="absolute -right-24 top-[56%]">
        <HalftoneBloom
          size={480}
          step={19}
          color={CYAN}
          opacity={0.12}
          className="halftone-breathe"
          style={{ animationDelay: '-6s' }}
        />
      </div>
      <div data-depth="0.045" className="absolute -left-20 top-[88%]">
        <HalftoneBloom
          size={320}
          step={16}
          color={MAGENTA}
          opacity={0.1}
          className="halftone-breathe"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      {/* 证券纸团花水印：尾段右侧出血 */}
      <div data-depth="0.03" className="absolute -right-32 top-[78%]">
        <Guilloche petals={40} className="h-[560px] w-[560px] -rotate-12 text-foreground/[0.05]" />
      </div>

      {/* 幽灵字样标本：描边大字，印刷字样册的味道 */}
      <div data-depth="0.06" className="absolute -left-14 top-[27%]">
        <TypeSpecimen
          glyph="&"
          stroke="hsl(40 10% 12% / 0.1)"
          className="-rotate-[8deg] text-[240px]"
        />
      </div>
      <div data-depth="0.05" className="absolute right-4 top-[48%]">
        <TypeSpecimen
          glyph="§"
          stroke="hsl(350 60% 35% / 0.12)"
          className="rotate-6 text-[190px]"
        />
      </div>

      {/* CMYK+R 印刷校准条：首屏左边距 */}
      <CmykBar className="absolute left-5 top-[12%] hidden lg:flex" />

      {/* 套准十字：分布在页边四角与中段 */}
      <RegMark color={KEY} className="absolute left-7 top-[8%] h-[18px] w-[18px] opacity-50" />
      <RegMark color={KEY} className="absolute right-7 top-[8%] h-[18px] w-[18px] opacity-50" />
      <RegMark color={SEAL} className="absolute left-7 top-[66%] h-[18px] w-[18px] opacity-50" />
      <RegMark color={CYAN} className="absolute right-7 top-[86%] h-[18px] w-[18px] opacity-50" />

      {/* 航空邮戳 + 航线：呼应「把你自己部署到全世界」 */}
      <Postmark className="postmark-stamp absolute right-[5%] top-[15%] hidden w-[220px] md:block" />
      <FlightPath className="absolute left-[34%] top-[4%] hidden w-[280px] opacity-60 sm:block" />

      {/* 红笔边注：画廊右（箭头注）/ 试衣间左（圈注） */}
      <MarginaliaNote className="absolute right-3 top-[26%] hidden w-44 -rotate-6 xl:block" />
      <MarginaliaCircle className="absolute left-4 top-[50%] hidden w-40 rotate-3 xl:block" />

      {/* 咖啡渍：工作流左边距，设计师桌面的痕迹 */}
      <CoffeeRing className="absolute left-[6%] top-[68%] h-[120px] w-[120px] -rotate-12" />

      {/* 漂浮墨尘 */}
      {DUST.map((d, i) => (
        <span
          key={i}
          className="ink-dust absolute rounded-full bg-foreground"
          style={
            {
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              opacity: 0.12,
              '--dust-dur': d.dur,
              '--dust-delay': d.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** 半调网点墨晕：点阵半径随距中心距离二次衰减，形成印刷渐变的网点云 */
function HalftoneBloom({
  size,
  step,
  color,
  opacity,
  className,
  style,
}: {
  size: number
  step: number
  color: string
  opacity: number
  className?: string
  style?: React.CSSProperties
}) {
  const n = Math.floor(size / step)
  const c = size / 2
  const dots: React.ReactNode[] = []
  for (let y = 0; y <= n; y++) {
    for (let x = 0; x <= n; x++) {
      const px = x * step
      const py = y * step
      const t = Math.max(0, 1 - Math.hypot(px - c, py - c) / c)
      const r = step * 0.42 * t * t
      if (r < 0.4) continue
      dots.push(<circle key={`${x}-${y}`} cx={px} cy={py} r={r.toFixed(2)} />)
    }
  }
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      fill={color}
      className={className}
      style={{ opacity, ...style }}
    >
      {dots}
    </svg>
  )
}

/** CMYK+R 印刷校准条：进程四色 + 印泥红 + 纸白，带单字标签 */
function CmykBar({ className }: { className?: string }) {
  const swatches: [string, string][] = [
    ['C', CYAN],
    ['M', MAGENTA],
    ['Y', YELLOW],
    ['K', KEY],
    ['R', SEAL],
    ['P', '#f5efe0'],
  ]
  return (
    <div className={`flex-col gap-1.5 ${className ?? ''}`}>
      <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Process
      </span>
      {swatches.map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="h-6 w-3.5 border border-foreground/10" style={{ background: color }} />
          <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
        </span>
      ))}
    </div>
  )
}

/** 套准十字标记：印刷规线 */
function RegMark({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" className={className}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 0v24M0 12h24" />
    </svg>
  )
}

/** 幽灵字样标本：仅描边的衬线大字 */
function TypeSpecimen({
  glyph,
  stroke,
  className,
}: {
  glyph: string
  stroke: string
  className?: string
}) {
  return (
    <span
      className={`select-none font-display font-bold leading-none ${className ?? ''}`}
      style={{ color: 'transparent', WebkitTextStroke: `1.5px ${stroke}` }}
    >
      {glyph}
    </span>
  )
}

/** 航空邮戳：双圈 + 环形文字 + 中心日期 + 右侧注销波纹，盖章入场 */
function Postmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" fill="none" className={className}>
      <circle cx="80" cy="80" r="74" stroke={SEAL} strokeWidth="2" />
      <circle cx="80" cy="80" r="58" stroke={SEAL} strokeWidth="1" />
      <path id="pm-arc" d="M80,80 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" />
      <text fill={SEAL} fontSize="10.5" letterSpacing="2.5" className="font-mono">
        <textPath href="#pm-arc">SITECRAFT · 部署到全世界 · PAR AVION ·</textPath>
      </text>
      <text
        x="80"
        y="72"
        textAnchor="middle"
        fill={SEAL}
        fontSize="14"
        fontWeight="700"
        className="font-display"
      >
        航空邮件
      </text>
      <text
        x="80"
        y="88"
        textAnchor="middle"
        fill={SEAL}
        fontSize="9"
        letterSpacing="2"
        className="font-mono"
      >
        AIR MAIL
      </text>
      <text x="80" y="102" textAnchor="middle" fill={SEAL} fontSize="9" className="font-mono">
        2026.11.20
      </text>
      {[60, 80, 100].map((y) => (
        <path
          key={y}
          d={`M158,${y} q10,-6 20,0 t20,0 t20,0`}
          stroke={SEAL}
          strokeWidth="1.5"
          opacity="0.8"
        />
      ))}
    </svg>
  )
}

/** 虚线航线 + 纸飞机：从纸面起飞寄往全世界 */
function FlightPath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 150" fill="none" className={className}>
      <path
        d="M8,132 Q150,-16 292,58"
        stroke={KEY}
        strokeWidth="1.5"
        strokeDasharray="2 8"
        opacity="0.5"
      />
      <g transform="translate(292,58) rotate(20)">
        <g className="plane-bob">
          <path d="M0,0 L-16,6 L-10,0 L-16,-6 Z" fill={KEY} opacity="0.6" />
        </g>
      </g>
    </svg>
  )
}

/** 红笔边注·箭头：手绘感曲线箭头 + 衬线斜体注记，描线入场 */
function MarginaliaNote({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 90" fill="none" className={className}>
      <path
        d="M170,18 C120,10 70,26 30,58 M30,58 l14,-4 M30,58 l6,-13"
        stroke={SEAL}
        strokeWidth="1.6"
        strokeLinecap="round"
        pathLength={1}
        className="marginalia-draw"
      />
      <text x="6" y="80" fill={SEAL} fontSize="13" fontStyle="italic" className="font-display">
        十三套，全部真实渲染
      </text>
    </svg>
  )
}

/** 红笔边注·圈注：手绘椭圆圈住「所见即所得」，描线入场 */
function MarginaliaCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 70" fill="none" className={className}>
      <path
        d="M20,35 C20,12 140,10 142,34 C144,58 24,62 20,38"
        stroke={SEAL}
        strokeWidth="1.6"
        strokeLinecap="round"
        pathLength={1}
        className="marginalia-draw"
      />
      <text
        x="80"
        y="40"
        textAnchor="middle"
        fill={SEAL}
        fontSize="14"
        fontStyle="italic"
        className="font-display"
      >
        所见即所得 ✓
      </text>
    </svg>
  )
}

/** 咖啡渍：双圈杯痕 + 飞溅点 */
function CoffeeRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} style={{ opacity: 0.14 }}>
      <ellipse cx="60" cy="60" rx="46" ry="42" stroke={COFFEE} strokeWidth="5" />
      <ellipse cx="62" cy="62" rx="40" ry="37" stroke={COFFEE} strokeWidth="2" opacity="0.7" />
      <circle cx="104" cy="30" r="3" fill={COFFEE} />
      <circle cx="16" cy="92" r="2" fill={COFFEE} />
      <circle cx="98" cy="98" r="2.5" fill={COFFEE} />
    </svg>
  )
}

/** 证券纸团花：N 个等半径圆圆心均布轨道圆周，交叠包络成螺旋团花 */
function Guilloche({ petals, className }: { petals: number; className?: string }) {
  const petalRadius = 130
  const orbitRadius = 58
  const circles = Array.from({ length: petals }, (_, i) => {
    const rad = (i / petals) * Math.PI * 2
    // 定长 3 位小数字符串：避免浮点序列化精度差导致 hydration mismatch
    return {
      x: (200 + orbitRadius * Math.cos(rad)).toFixed(3),
      y: (200 + orbitRadius * Math.sin(rad)).toFixed(3),
    }
  })
  return (
    <svg viewBox="0 0 400 400" fill="none" className={className}>
      {circles.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={petalRadius} stroke="currentColor" strokeWidth="0.6" />
      ))}
      <circle cx="200" cy="200" r="188" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="200" cy="200" r="72" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="200" cy="200" r="4" fill="currentColor" />
      <circle
        cx="200"
        cy="200"
        r="196"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="1 6"
      />
    </svg>
  )
}
