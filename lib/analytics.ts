/**
 * 最小可用埋点：把关键转化事件记到内存队列（window.__sitecraftEvents），
 * 开发时同时打印到控制台，供 E2E 断言与后续接入正式分析时替换上报实现。
 * 刻意不引入第三方脚本、不发网络请求：不采集姓名等个人信息，只记事件与枚举属性。
 */
export type AnalyticsEvent = 'registration_complete' | 'guest_enter' | 'site_created'

interface TrackRecord {
  event: AnalyticsEvent
  props: Record<string, string | number>
  ts: number
}

declare global {
  interface Window {
    __sitecraftEvents?: TrackRecord[]
  }
}

export function track(event: AnalyticsEvent, props: Record<string, string | number> = {}) {
  if (typeof window === 'undefined') return
  const record: TrackRecord = { event, props, ts: Date.now() }
  window.__sitecraftEvents = window.__sitecraftEvents ?? []
  window.__sitecraftEvents.push(record)
  if (process.env.NODE_ENV !== 'production') {
    // 开发期在控制台回放事件，便于调试；生产环境不打印
    // eslint-disable-next-line no-console
    console.info('[analytics]', event, props)
  }
}
