/**
 * 「三步上线」静态区块：填写资料 → 挑选模板 → 导出部署。
 * 桌面端用一条贯穿三色渐变连接线串联步骤卡，移动端自动堆叠。
 * .reveal 类配合 useReveal 做滚动渐进入场。
 */
import { LayoutTemplate, PenLine, Rocket } from 'lucide-react'

const STEPS = [
  {
    icon: PenLine,
    title: '填写资料',
    description: '姓名、简介、技能、项目与经历，表单即时校验，右侧实时呈现。',
    accent: 'text-brand-violet',
    ring: 'border-brand-violet/40 bg-brand-violet/10',
  },
  {
    icon: LayoutTemplate,
    title: '挑选模板',
    description: '八套完整视觉系统一键切换，主题色随模板联动，也可自定义。',
    accent: 'text-brand-cyan',
    ring: 'border-brand-cyan/40 bg-brand-cyan/10',
  },
  {
    icon: Rocket,
    title: '导出部署',
    description: '导出零依赖静态 HTML，或配置 Token 后一键发布到 GitHub Pages。',
    accent: 'text-brand-magenta',
    ring: 'border-brand-magenta/40 bg-brand-magenta/10',
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="reveal mb-12 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-magenta">Workflow</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          三步上线，全程可视
        </h2>
      </div>
      <ol className="relative grid gap-6 md:grid-cols-3">
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-brand-violet/50 via-brand-cyan/50 to-brand-magenta/50 md:block"
        />
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="reveal relative rounded-2xl border bg-card/60 p-6 backdrop-blur"
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className="flex items-center gap-4">
              <span
                className={`grid h-[72px] w-[72px] flex-none place-items-center rounded-2xl border ${step.ring}`}
              >
                <step.icon className={`h-7 w-7 ${step.accent}`} />
              </span>
              <span className="font-mono text-4xl font-bold text-ink-600">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}