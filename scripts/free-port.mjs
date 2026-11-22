/**
 * 释放 3000：Next 的 next-server 是 cmd 外壳的子进程，关终端常常杀不掉，
 * 于是下次 `pnpm dev` 悄悄挪到 3001，浏览器还开在 3000 看旧构建。
 * 这里按监听端口找 PID，连整棵进程树一起结束。
 */
import { execSync } from 'node:child_process'

const PORT = process.argv[2] ?? '3000'

function listeningPids(port) {
  try {
    const out = execSync(`netstat -ano | findstr ":${port}" | findstr LISTENING`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return [...new Set(out.match(/\s(\d+)\s*$/gm)?.map((s) => s.trim()) ?? [])]
  } catch {
    return []
  }
}

const pids = listeningPids(PORT)
if (pids.length === 0) {
  console.log(`端口 ${PORT} 已经空闲`)
  process.exit(0)
}

for (const pid of pids) {
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' })
    console.log(`已结束占用 ${PORT} 的进程树 PID ${pid}`)
  } catch {
    console.log(`无法结束 PID ${pid}（可能已退出或权限不足）`)
  }
}

// 复核
await new Promise((resolve) => setTimeout(resolve, 800))
console.log(listeningPids(PORT).length === 0 ? `端口 ${PORT} 已释放` : `端口 ${PORT} 仍被占用`)
