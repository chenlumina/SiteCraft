/**
 * Prisma 客户端单例（规范目录 lib/prisma.ts）。
 * Next.js 开发模式热重载会反复重新执行模块，若每次 new PrismaClient()
 * 会累积数据库连接并触发 SQLite 文件锁；挂到 globalThis 上保证全进程只有一个实例。
 */
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// 生产环境模块只执行一次，无需缓存；开发环境缓存以复用连接
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma