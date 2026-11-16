/**
 * 本地默认用户：规范把 NextAuth 用户系统列为二期（Phase 4），
 * 一期所有站点归属这个固定用户，保证 Site.userId 外键始终有效。
 * 二期接入 NextAuth 后，把各路由里的 ensureDefaultUser() 换成会话用户即可。
 */
import { prisma } from '@/lib/prisma'

export const DEFAULT_USER_ID = 'local-user'

/** upsert 幂等：无论是否跑过 seed，API 首次调用时都能自愈出默认用户 */
export async function ensureDefaultUser() {
  return prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      email: 'demo@sitecraft.local',
      name: '本地用户',
    },
  })
}