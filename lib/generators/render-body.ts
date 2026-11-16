/**
 * 站点 body 结构渲染（不含 <html>/<head>）。
 * 安全边界在 escape.ts / icons.ts，样式在 styles.ts，本模块只负责语义化结构：
 * header/main/section/footer，区块按「是否有内容」动态出现，
 * 导航锚点与编号（01 / SKILLS…）随之动态生成，删光项目后不留空区块和死锚点。
 */
import type { SiteData, TemplateName } from '@/types'
import { esc, monogram, safeUrl } from './escape'
import { icon, socialLinks } from './icons'
import { DEFAULT_AVATAR_DATA_URI, DEFAULT_AVATAR_PATH } from './styles'

function clampLevel(level: number): number {
  return Math.max(0, Math.min(100, Math.round(level)))
}

interface SectionDef {
  id: string
  navLabel: string
  kicker: string
  heading: string
}

export function renderSiteBody(data: SiteData, template: TemplateName): string {
  const sections: SectionDef[] = []
  if (data.skills.length > 0)
    sections.push({ id: 'skills', navLabel: '技能', kicker: 'SKILLS', heading: '技能栈' })
  if (data.projects.length > 0)
    sections.push({ id: 'projects', navLabel: '项目', kicker: 'PROJECTS', heading: '项目作品' })
  if (data.experience.length > 0)
    sections.push({ id: 'experience', navLabel: '经历', kicker: 'EXPERIENCE', heading: '经历' })
  sections.push({ id: 'contact', navLabel: '联系', kicker: 'CONTACT', heading: '一起聊聊？' })

  const navLinks = sections
    .map(
      (s) =>
        `<a href="#${s.id}"${s.id === 'contact' ? ' class="s-cta-link"' : ''}>${s.navLabel}</a>`
    )
    .join('')

  const avatarUrl =
    data.avatar.trim() === DEFAULT_AVATAR_PATH ? DEFAULT_AVATAR_DATA_URI : safeUrl(data.avatar)
  const badgeText = data.status.trim() ? esc(Array.from(data.status.trim()).slice(0, 12).join('')) : ''
  const avatarBlock = `
    <div class="s-hero-avatar"${badgeText ? ` data-badge="${badgeText}"` : ''}>
      ${
        avatarUrl
          ? `<img class="s-avatar-img" src="${avatarUrl}" alt="${esc(data.name)}的头像">`
          : `<div class="s-monogram">${monogram(data.name)}</div>`
      }
    </div>`

  const metaChips = [
    data.location.trim()
      ? `<span class="s-chip">${icon('pin')}${esc(data.location.trim())}</span>`
      : '',
    data.email.trim()
      ? `<span class="s-chip">${icon('mail')}${esc(data.email.trim())}</span>`
      : '',
  ].join('')

  const heroActions = [
    data.projects.length > 0
      ? `<a class="s-btn s-btn-primary" href="#projects">查看项目${icon('arrowDown')}</a>`
      : '',
    data.email.trim()
      ? `<a class="s-btn s-btn-ghost" href="mailto:${esc(data.email.trim())}">联系我${icon('mail')}</a>`
      : '',
  ].join('')

  const hero = `
  <section class="s-hero" id="top">
    <div class="wrap s-hero-in">
      <div class="s-hero-text">
        ${data.status.trim() ? `<p class="s-status"><span class="s-dot"></span>${esc(data.status.trim())}</p>` : ''}
        <h1 class="s-name">${esc(data.name)}</h1>
        <p class="s-title">${esc(data.title)}</p>
        ${data.bio.trim() ? `<p class="s-bio">${esc(data.bio.trim())}</p>` : ''}
        ${metaChips ? `<div class="s-meta">${metaChips}</div>` : ''}
        ${heroActions ? `<div class="s-actions">${heroActions}</div>` : ''}
        ${socialLinks(data, 's-social')}
      </div>
      ${avatarBlock}
    </div>
  </section>`

  const skillsSection = data.skills.length
    ? `
  <section class="s-section" id="skills">
    <div class="wrap">
      <p class="s-kicker">${String(sections.findIndex((s) => s.id === 'skills') + 1).padStart(2, '0')} / SKILLS</p>
      <h2 class="s-h2">技能栈</h2>
      <ul class="skill-grid">
        ${data.skills
          .map((skill) => {
            const level = clampLevel(skill.level)
            const filled = Math.round(level / 20)
            const dots = Array.from({ length: 5 })
              .map((_, i) => `<span class="skill-dot${i < filled ? ' on' : ''}"></span>`)
              .join('')
            return `
        <li class="skill">
          <div class="skill-top">
            <span class="skill-name">${esc(skill.name)}</span>
            <span class="skill-pct">${level}%</span>
            <span class="skill-dots">${dots}</span>
          </div>
          <div class="skill-track"><span class="skill-fill" style="width:${level}%"></span></div>
        </li>`
          })
          .join('')}
      </ul>
    </div>
  </section>`
    : ''

  const projectsSection = data.projects.length
    ? `
  <section class="s-section" id="projects">
    <div class="wrap">
      <p class="s-kicker">${String(sections.findIndex((s) => s.id === 'projects') + 1).padStart(2, '0')} / PROJECTS</p>
      <h2 class="s-h2">项目作品</h2>
      <div class="project-grid">
        ${data.projects
          .map((project, index) => {
            const link = safeUrl(project.link)
            const repo = safeUrl(project.repo)
            const tags = project.tags
              .filter((t) => t.trim())
              .map((t) => `<li>${esc(t.trim())}</li>`)
              .join('')
            const links = [
              link
                ? `<a href="${link}" target="_blank" rel="noopener noreferrer">在线演示${icon('external')}</a>`
                : '',
              repo
                ? `<a href="${repo}" target="_blank" rel="noopener noreferrer">源码${icon('code')}</a>`
                : '',
            ].join('')
            return `
        <article class="project${project.highlight ? ' is-highlight' : ''}">
          <div class="project-head">
            <span class="project-index">${String(index + 1).padStart(2, '0')}</span>
            ${project.highlight ? '<span class="project-badge">精选</span>' : ''}
          </div>
          <h3 class="project-name">${esc(project.name)}</h3>
          ${project.description.trim() ? `<p class="project-desc">${esc(project.description.trim())}</p>` : ''}
          ${tags ? `<ul class="project-tags">${tags}</ul>` : ''}
          ${links ? `<div class="project-links">${links}</div>` : ''}
        </article>`
          })
          .join('')}
      </div>
    </div>
  </section>`
    : ''

  const experienceSection = data.experience.length
    ? `
  <section class="s-section" id="experience">
    <div class="wrap">
      <p class="s-kicker">${String(sections.findIndex((s) => s.id === 'experience') + 1).padStart(2, '0')} / EXPERIENCE</p>
      <h2 class="s-h2">经历</h2>
      <ul class="exp-list">
        ${data.experience
          .map(
            (exp) => `
        <li class="exp">
          <div class="exp-period">${esc(exp.period)}</div>
          <div class="exp-body">
            <h3 class="exp-role">${esc(exp.role)}</h3>
            <p class="exp-org">${esc(exp.organization)}</p>
            ${exp.description.trim() ? `<p class="exp-desc">${esc(exp.description.trim())}</p>` : ''}
          </div>
        </li>`
          )
          .join('')}
      </ul>
    </div>
  </section>`
    : ''

  const contactIndex = sections.findIndex((s) => s.id === 'contact') + 1
  const contactSection = `
  <section class="s-section s-contact" id="contact">
    <div class="wrap">
      <p class="s-kicker">${String(contactIndex).padStart(2, '0')} / CONTACT</p>
      <h2 class="s-h2">${esc('一起聊聊？')}</h2>
      <p class="contact-lead">无论是实习机会、项目合作，还是单纯想打个招呼，都欢迎来信。</p>
      ${
        data.email.trim()
          ? `<a class="s-btn s-btn-primary s-btn-lg" href="mailto:${esc(data.email.trim())}">${icon('mail')}${esc(data.email.trim())}</a>`
          : ''
      }
      ${socialLinks(data, 's-social')}
    </div>
  </section>`

  const year = new Date().getFullYear()

  return `<div class="site-root site-${template}">
  <header class="s-nav">
    <div class="wrap s-nav-in">
      <a class="s-brand" href="#top"><span class="s-mark">${monogram(data.name)}</span><span class="s-brand-name">${esc(data.name)}</span></a>
      <nav class="s-links" aria-label="站点导航">${navLinks}</nav>
    </div>
  </header>
  <main>
    ${hero}
    ${skillsSection}
    ${projectsSection}
    ${experienceSection}
    ${contactSection}
  </main>
  <footer class="s-footer">
    <div class="wrap">
      <span>© ${year} ${esc(data.name)}</span>
      <span>由 SiteCraft 个人官网生成器构建</span>
    </div>
  </footer>
</div>`
}