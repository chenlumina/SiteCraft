# SiteCraft · 个人官网生成器

填写资料、挑选模板、实时预览，一键导出静态 HTML 或部署到 GitHub Pages。

基于《个人官网生成器技术规范文档 v1.0》构建：Next.js 14 App Router + TypeScript 严格模式 + TailwindCSS + shadcn/ui + Zustand + Prisma（SQLite 开发 / PostgreSQL 生产）+ pnpm。

## 快速开始

```bash
pnpm install        # 安装依赖（自动 prisma generate + husky）
pnpm db:push        # 同步数据库结构（SQLite: prisma/dev.db）
pnpm db:seed        # 写入 4 套模板 + 示例站点
pnpm dev            # http://localhost:3000
```

> 本机 Node 为 24.x（规范要求 ≥20，满足）。npm 镜像与 pnpm store 已在 `.npmrc` 中指向 npmmirror / E 盘。

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发服务器（3000 端口，避开本机 Tomcat 的 8080/8888/8081） |
| `pnpm build` | prisma generate + 生产构建 |
| `pnpm start` | 生产服务器 |
| `pnpm lint` | ESLint（no-explicit-any 等强制规则） |
| `pnpm typecheck` | tsc --noEmit 严格检查 |
| `pnpm format` | Prettier 格式化 |
| `pnpm db:push` / `db:seed` / `db:studio` | 数据库操作 |
| `pnpm test:unit` | 单元测试（Node 内置运行器 + tsx，自动建独立 test.db，不碰开发库） |
| `pnpm snapshot` | 重录四模板黄金快照（仅模板视觉有意变更时执行） |
| `pnpm test:e2e` | 无头 Edge 端到端验证（需先 `pnpm start`，截图存 screenshots/） |

提交前 Husky + lint-staged 自动执行 ESLint 与 Prettier。

## 功能一览

- **首页**：模板画廊（真实渲染缩略）、工作流程、我的站点管理（搜索 / 模板筛选 / 排序 / 批量选择 / 删除撤销 / 发布状态切换，视图状态本地持久化）
- **编辑器** `/editor`：资料 / 技能 / 项目 / 经历 / 主题五区表单（React Hook Form + Zod），技能熟练度滑杆、项目与经历拖拽排序、精选标记、删除撤销；右侧实时预览支持桌面 / 390px 移动端切换
- **十二套模板**：minimal（极简衬线）、tech（深色终端）、creative（撞色贴纸）、professional（商务简历）、ink（水墨宣纸）、brutal（粗野海报）、aurora（极光玻璃）、editorial（杂志铅字）、gold（鎏金暗夜）、vapor（蒸汽波）、swiss（瑞士国际主义）、kraft（手账牛皮纸），全部基于容器查询响应式，主题色实时联动
- **全屏预览** `/preview`：所见即所得，链接可点击
- **导出**：一键下载零依赖静态 HTML（与预览完全一致，用户输入全部转义，URL 协议白名单）
- **部署**：配置 `GITHUB_TOKEN` 后自动创建仓库、推送首页并开启 GitHub Pages；未配置时给出明确指引并可改为导出
- **API**：`GET /api/templates`、`GET/POST /api/sites`、`GET/PUT/DELETE /api/sites/:id`、`POST /api/save`（旧路径 `/api/generate` 保留为兼容别名）、`POST /api/deploy`，统一 `{ success, data?, error? }` 响应，Zod 校验，CSP 等安全头

## 部署功能配置（可选）

在项目根目录创建 `.env.local`（不提交）：

```bash
GITHUB_TOKEN=ghp_xxx   # GitHub Personal Access Token，需 repo 权限
```

重启 `pnpm dev` 后，编辑器「部署」按钮即可真实推送。

## 在 IntelliJ IDEA 中运行与部署

项目自带 `.run/` 共享运行配置（Shell Script 类型，任何 IDEA 版本可用，解释器指向本机 Git Bash）：

1. **打开项目**：File → Open → 选择 `E:\Thinks\person webstation`（Trust Project）。
2. **终端设为 Git Bash**：Settings → Tools → Terminal → Shell path = `E:\git\Git\bin\bash.exe`。
3. **（Ultimate / WebStorm 可选）Node 集成**：Settings → Languages & Frameworks → Node.js：
   Interpreter = `E:\node-24.25.0\node.exe`（目录名与实测 v24.15.0 不一致，以实测为准），
   Package manager = `C:\Users\ZHANGLIANG\AppData\Roaming\npm\pnpm.cmd`。
4. **一键运行**：右上角运行配置下拉框依次执行
   `1-DB 初始化` → `2-Dev 开发服务器`，终端出现 ready 后 Ctrl+点击 http://localhost:3000。
   停止服务在该终端标签按 Ctrl+C。
5. **本地生产部署**：`3-Build 生产构建` → `4-Start 生产服务`。
6. **质量与回归**：`5-Check 质量检查`、`6-E2E 验证`（需服务已启动）。

无 JS 插件的 IDEA 版本以上流程完全可用（配置走终端）；需要 npm 工具窗 / 断点调试等完整前端体验时，
用本机 WebStorm 2026.1.3 打开同一目录，步骤相同。

### 排错：「浏览器 / Live Edit 中未指定 URL」

该错误来自 URL 为空的 JavaScript Debug 配置（含在编辑器沟槽点 Debug 生成的临时配置）。
本项目已预置修复：`.run/7-Debug 客户端调试` 带完整 URL；workspace.xml 中 JavaScript Debug
默认模板也已写入 `http://localhost:3000/`，默认运行项为 `2-Dev 开发服务器`。
若 IDEA 正在运行，先 **File → Reload All from Disk**（或重启 IDEA）使 workspace 修改生效。
仍报错时：Run → Edit Configurations → 选中报错配置 → 填入 URL `http://localhost:3000/`；
若是 Node.js/npm 配置，则在其 Browser / Live Edit 页取消勾选启动后打开浏览器，或补填 URL。
调试顺序：先运行 `2-Dev`（或 `4-Start`）等服务就绪，再运行 `7-Debug` 附加断点调试。

对外发布（规范指定 Vercel）：IDEA 终端执行 `npx vercel`（无需推送 GitHub），
按提示登录并设置环境变量；生产数据库切换 PostgreSQL 见下文。
应用内「部署」按钮走 GitHub Pages，需先在 `.env.local` 配置 `GITHUB_TOKEN` 并自行授权推送。

## 生产环境（Vercel）

1. `prisma/schema.prisma` 的 datasource 切换为 `postgresql`
2. Vercel 环境变量设置 `DATABASE_URL`（Neon / Vercel Postgres）
3. `pnpm build` 后部署；安全头已在 `next.config.js` 内置

## 里程碑对照

- Phase 1-3（脚手架 / 编辑器 / 4 模板 / 实时预览 / 导出 / GitHub 部署）：已完成
- Phase 4（NextAuth 用户系统、速率限制、Vitest/Playwright 测试）：规范标注为二期可选，当前使用本地默认用户（`lib/default-user.ts`），`(auth)` 路由组留待二期

## 目录结构

```
app/
  (main)/            首页 / editor / preview
  api/               templates / sites / save / deploy（generate 为 save 的兼容别名）
components/
  ui/                shadcn 基础组件
  editor/            编辑器表单区
  preview/           实时预览
  templates/         SiteFrame 渲染容器（四套模板样式在生成器 styles.ts 内）
  home/              首页区块
lib/
  generators/        HTML 生成器（escape / color / icons / styles / render-body，单一事实来源）
  site-service.ts    站点落库服务（saveSite / patchSite，所有权校验内置）
  validators/        Zod 校验器（前后端共用单一来源）
  stores/            Zustand 编辑器状态（localStorage 持久化）
prisma/              schema + seed
tests/               单元测试 + 四模板黄金快照
types/               全局类型
```