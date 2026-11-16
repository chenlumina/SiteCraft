/**
 * 「三步上线」区块：印刷品式编号步骤——发丝顶线 + 序号 + 衬线标题。
 * 无连接线、无彩色图标；内容与排版本身承担表达。
 */
const STEPS = [
  {
    title: '填写资料',
    description: '姓名、简介、技能、项目与经历，表单即时校验，右侧实时呈现。',
  },
  {
    title: '挑选版式',
    description: '十二套独立版式一键切换，主题色随版式联动，也可自定义。',
  },
  {
    title: '导出部署',
    description: '导出零依赖静态 HTML，或配置 Token 后一键发布到 GitHub Pages。',
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="reveal mb-12 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Workflow</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          三步上线，全程可视
        </h2>
      </div>
      <ol className="grid gap-10 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="reveal border-t border-foreground/60 pt-5" style={{ transitionDelay: `${index * 120}ms` }}>
            <p className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 font-display text-xl font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
