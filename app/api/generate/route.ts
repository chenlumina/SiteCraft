/**
 * POST /api/generate：已更名为 /api/save（原名名不副实，实际只做保存）。
 * 本路由保留为薄别名，兼容仍调用旧路径的外部脚本/客户端；
 * 实现完全委托给 /api/save，行为与状态码保持一致。
 */
export { POST } from '../save/route'