/**
 * 单元测试入口（pnpm test:unit）：
 * 1. 用独立 SQLite 测试库（prisma/test.db）跑服务层测试，绝不触碰开发库 dev.db；
 *    结构不存在时自动 prisma db push 建库（--accept-data-loss 只作用于这个专用测试库）。
 * 2. 通过 DATABASE_URL 注入子进程，Prisma 运行时优先读环境变量，覆盖 .env 的开发库配置。
 * 3. Node 内置测试运行器 + tsx（项目已有依赖，零新增）。
 *    --import 用裸模块名 'tsx'（Node 自行从 node_modules 解析），
 *    避免项目路径含空格时绝对路径被 NODE_OPTIONS/参数拆分截断。
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = process.cwd()
const TEST_DB_URL = 'file:./test.db'
const testEnv = { ...process.env, DATABASE_URL: TEST_DB_URL }

if (!existsSync(path.join(root, 'prisma', 'test.db'))) {
  const prismaCli = require.resolve('prisma/build/index.js')
  const push = spawnSync(process.execPath, [prismaCli, 'db', 'push', '--skip-generate', '--accept-data-loss'], {
    stdio: 'inherit',
    cwd: root,
    env: testEnv,
  })
  if (push.status !== 0) process.exit(push.status ?? 1)
}

const result = spawnSync(
  process.execPath,
  [
    '--import', 'tsx',
    '--test',
    'tests/generator.test.ts',
    'tests/site-service.test.ts',
    'tests/archetypes.test.ts',
    'tests/ai-pipeline.test.ts',
  ],
  { stdio: 'inherit', cwd: root, env: testEnv }
)
process.exit(result.status ?? 1)