/**
 * 十三套模板的元数据「单一来源」：首页画廊、编辑器模板选择器、主题色板、
 * 数据库种子（prisma/seed.ts）都读这里，新增模板只需改这一处 + 生成器 CSS + 类型联合。
 * defaultColor 同时是切模板时自动应用的主题色（见 editor-store.setTemplate）。
 */
import type { TemplateMeta, TemplateName } from '@/types'

export const TEMPLATES: TemplateMeta[] = [
  {
    name: 'minimal',
    displayName: '极简 Minimal',
    tagline: '留白与字体的克制美学',
    description: '编辑感衬线标题、大量留白与细分隔线，让内容本身成为主角。适合写作者与设计师。',
    mood: 'light',
    defaultColor: '#18181b',
    swatches: ['#18181b', '#0f766e', '#b45309', '#be123c', '#4338ca', '#334155'],
    features: ['衬线编辑风', '大留白', '列表式项目'],
  },
  {
    name: 'tech',
    displayName: '极客 Tech',
    tagline: '终端质感的深色工作站',
    description: '等宽字体、网格背景与霓虹光晕，像一台正在运行的开发终端。适合工程师与开源作者。',
    mood: 'dark',
    defaultColor: '#22d3ee',
    swatches: ['#22d3ee', '#34d399', '#a78bfa', '#f472b6', '#fbbf24', '#38bdf8'],
    features: ['深色终端风', '霓虹光晕', '技能能量条'],
  },
  {
    name: 'creative',
    displayName: '创意 Creative',
    tagline: '大胆撞色的趣味画布',
    description: '奶油底色、硬阴影贴纸与不规则色块，充满手作的温度。适合创作者与斜杠青年。',
    mood: 'light',
    defaultColor: '#ec4899',
    swatches: ['#ec4899', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48'],
    features: ['硬阴影贴纸', '撞色标签', '趣味徽章'],
  },
  {
    name: 'professional',
    displayName: '商务 Professional',
    tagline: '清晰可信的职业名片',
    description: '结构化版式、克制的蓝色系与简历式时间线，传递专业与可靠。适合求职与商务展示。',
    mood: 'light',
    defaultColor: '#2563eb',
    swatches: ['#2563eb', '#0f766e', '#7c3aed', '#b91c1c', '#0369a1', '#475569'],
    features: ['简历时间线', '卡片栅格', '深色联系区'],
  },
  {
    name: 'ink',
    displayName: '水墨 Ink',
    tagline: '宣纸上的东方留白',
    description:
      '宣纸底色、朱砂印章与墨韵笔触，安静克制的东方文人气质。适合喜欢内敛表达的开发者与写作者。',
    mood: 'light',
    defaultColor: '#9e1b32',
    swatches: ['#9e1b32', '#1c1a17', '#0f766e', '#b45309', '#1e3a5f', '#4d7c0f'],
    features: ['朱砂印章', '墨韵笔触', '宣纸质感'],
  },
  {
    name: 'brutal',
    displayName: '粗野 Brutal',
    tagline: '不加修饰的原始冲击力',
    description: '粗黑边框、硬投影与零圆角，像一张贴在墙上的海报。适合想让人一眼记住的个性主页。',
    mood: 'light',
    defaultColor: '#e11d48',
    swatches: ['#e11d48', '#000000', '#facc15', '#2563eb', '#16a34a', '#f97316'],
    features: ['粗黑边框', '硬投影', '零圆角'],
  },
  {
    name: 'aurora',
    displayName: '极光 Aurora',
    tagline: '深夜上空的流动光幕',
    description:
      '深空底色上的玻璃卡片与极光渐变，安静而高级。适合想突出作品氛围感的设计师与独立开发者。',
    mood: 'dark',
    defaultColor: '#2dd4bf',
    swatches: ['#2dd4bf', '#a78bfa', '#f472b6', '#38bdf8', '#34d399', '#818cf8'],
    features: ['玻璃拟态', '极光渐变', '光斑氛围'],
  },
  {
    name: 'editorial',
    displayName: '杂志 Editorial',
    tagline: '铅字排印的刊物质感',
    description:
      '衬线大标题、首字下沉与粗细双线，像一本被认真排版的独立杂志。适合作品集与长文写作者。',
    mood: 'light',
    defaultColor: '#c2410c',
    swatches: ['#c2410c', '#181511', '#1d4ed8', '#9f1239', '#166534', '#a16207'],
    features: ['首字下沉', '刊物双线', '衬线大标题'],
  },
  {
    name: 'gold',
    displayName: '鎏金 Gold',
    tagline: '黑金质感的沉静奢华',
    description: '炭黑底色上的鎏金线条与衬线标题，克制而贵气。适合作品集展示与个人品牌。',
    mood: 'dark',
    defaultColor: '#d4af37',
    swatches: ['#d4af37', '#e8c46a', '#c0a060', '#d97706', '#fbbf24', '#b45309'],
    features: ['鎏金线条', '衬线标题', '暗夜质感'],
  },
  {
    name: 'vapor',
    displayName: '蒸汽波 Vapor',
    tagline: '落日网格上的复古未来',
    description:
      '紫罗兰夜空、粉青霓虹与透视网格，把主页变成一张 80 年代合成器海报。适合追求强烈风格的创作者。',
    mood: 'dark',
    defaultColor: '#ff71ce',
    swatches: ['#ff71ce', '#01cdfe', '#b967ff', '#05ffa1', '#fffb96', '#ff6e27'],
    features: ['透视网格', '霓虹渐变', '合成器美学'],
  },
  {
    name: 'swiss',
    displayName: '瑞士 Swiss',
    tagline: '网格与留白的秩序之美',
    description:
      '国际主义排版风格：细黑规则线、大号无衬线与一点红色强调。适合设计师与工程师的冷静表达。',
    mood: 'light',
    defaultColor: '#dc2626',
    swatches: ['#dc2626', '#111111', '#0f766e', '#1d4ed8', '#ea580c', '#065f46'],
    features: ['规则线网格', '红色强调', '无衬线大标题'],
  },
  {
    name: 'kraft',
    displayName: '手账 Kraft',
    tagline: '牛皮纸上的拼贴日常',
    description:
      '牛皮纸底色、胶带贴纸与虚线手作边框，温暖亲切像一本手工手账。适合学生与生活记录者。',
    mood: 'light',
    defaultColor: '#0f766e',
    swatches: ['#0f766e', '#b45309', '#7c3aed', '#dc2626', '#0369a1', '#4d7c0f'],
    features: ['胶带拼贴', '虚线手作', '牛皮纸质感'],
  },
  {
    name: 'metro',
    displayName: '线路 Metro',
    tagline: '一站一站坐过去',
    description:
      '整站是一条地铁线：页头是线路牌，技能是图例，项目与经历是同一条轨道上的站点，联系是终点站。适合想把履历讲成「运行图」的人。',
    mood: 'light',
    defaultColor: '#2563eb',
    swatches: ['#2563eb', '#0f766e', '#b91c1c', '#7c3aed', '#0369a1', '#c2410c'],
    features: ['连续轨道', '站点编号', '时刻表式经历'],
  },
]

export const TEMPLATE_MAP: Record<TemplateName, TemplateMeta> = Object.fromEntries(
  TEMPLATES.map((t) => [t.name, t])
) as Record<TemplateName, TemplateMeta>

export const TEMPLATE_NAMES = TEMPLATES.map((t) => t.name) as TemplateName[]

/** 数据库里 template 是普通字符串，用此守卫收窄为联合类型，非法值回退 minimal（见 lib/api.ts） */
export function isTemplateName(value: string): value is TemplateName {
  return TEMPLATE_NAMES.includes(value as TemplateName)
}

export function getTemplate(name: TemplateName): TemplateMeta {
  return TEMPLATE_MAP[name]
}
/**
 * 版式能力表：哪些可选内容字段会被这套版式真正展示。
 * 内容形态跟着版式走是设计，但"写了却看不到"必须是可见的信息——
 * 编辑器的每个可选字段都要从这里取一句话告诉用户。
 */
export const FEATURE_SUPPORT: Record<
  TemplateName,
  {
    points: 'all' | 'first' | 'none'
    highlight: boolean
    expPoints: 'all' | 'first' | 'none'
  }
> = {
  minimal: { points: 'first', highlight: true, expPoints: 'first' },
  tech: { points: 'none', highlight: false, expPoints: 'none' },
  creative: { points: 'none', highlight: true, expPoints: 'none' },
  professional: { points: 'all', highlight: true, expPoints: 'all' },
  ink: { points: 'none', highlight: false, expPoints: 'none' },
  brutal: { points: 'none', highlight: true, expPoints: 'none' },
  aurora: { points: 'none', highlight: false, expPoints: 'none' },
  editorial: { points: 'all', highlight: true, expPoints: 'all' },
  gold: { points: 'all', highlight: true, expPoints: 'none' },
  vapor: { points: 'none', highlight: false, expPoints: 'none' },
  swiss: { points: 'all', highlight: true, expPoints: 'all' },
  kraft: { points: 'none', highlight: false, expPoints: 'none' },
  metro: { points: 'none', highlight: false, expPoints: 'none' },
}
