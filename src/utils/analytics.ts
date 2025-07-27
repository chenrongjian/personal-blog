import { supabase, TABLES, type PageVisit } from '../lib/supabase'

// 生成唯一访客ID
function generateVisitorId(): string {
  let visitorId = localStorage.getItem('analytics_visitor_id')
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('analytics_visitor_id', visitorId)
  }
  return visitorId
}

// 生成会话ID
function generateSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// 获取设备类型
function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet'
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile'
  }
  return 'desktop'
}

// 获取浏览器信息
function getBrowserInfo(): { browser: string; os: string } {
  const userAgent = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'

  // 检测浏览器
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  else if (userAgent.includes('Opera')) browser = 'Opera'

  // 检测操作系统
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'

  return { browser, os }
}

// 获取屏幕分辨率
function getScreenResolution(): string {
  return `${screen.width}x${screen.height}`
}

// 检查是否应该排除当前访问
function shouldExcludeVisit(): boolean {
  // 检查是否是开发环境
  if (import.meta.env.DEV) {
    return false // 开发环境也记录，便于测试
  }

  // 检查是否是管理员（可以通过特定的localStorage标记）
  const isAdmin = localStorage.getItem('is_admin') === 'true'
  if (isAdmin) {
    return true
  }

  // 检查是否是爬虫
  const userAgent = navigator.userAgent.toLowerCase()
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'googlebot', 'bingbot',
    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp'
  ]
  
  return botPatterns.some(pattern => userAgent.includes(pattern))
}

// 页面访问追踪类
class AnalyticsTracker {
  private startTime: number = Date.now()
  private isTracking: boolean = false
  private currentPageUrl: string = ''
  private currentPageTitle: string = ''
  private visitorId: string = ''
  private sessionId: string = ''

  constructor() {
    this.visitorId = generateVisitorId()
    this.sessionId = generateSessionId()
  }

  // 初始化追踪
  async init(): Promise<void> {
    if (shouldExcludeVisit()) {

      return
    }

    // 检查统计功能是否启用
    const { data: config } = await supabase
      .from('site_config')
      .select('config_value')
      .eq('config_key', 'site_settings')
      .single()

    const analyticsEnabled = config?.config_value?.analytics?.enabled
    if (!analyticsEnabled) {

      return
    }

    this.isTracking = true
    this.trackPageView()

    // 监听页面卸载事件
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave()
    })

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageLeave()
      } else {
        this.startTime = Date.now()
      }
    })
  }

  // 追踪页面访问
  async trackPageView(url?: string, title?: string): Promise<void> {
    if (!this.isTracking) return

    this.currentPageUrl = url || window.location.pathname + window.location.search
    this.currentPageTitle = title || document.title
    this.startTime = Date.now()

    const { browser, os } = getBrowserInfo()

    const visitData: PageVisit = {
      page_url: this.currentPageUrl,
      page_title: this.currentPageTitle,
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
      device_type: getDeviceType(),
      browser,
      os,
      screen_resolution: getScreenResolution(),
      visit_time: new Date().toISOString(),
      duration: 0,
      is_bounce: false
    }

    try {
      const { error } = await supabase
        .from(TABLES.PAGE_VISITS)
        .insert([visitData])

      if (error) {
        console.error('Analytics: 记录页面访问失败', error)
      } else {
  
      }
    } catch (err) {
      console.error('Analytics: 统计服务异常', err)
    }
  }

  // 追踪页面离开
  async trackPageLeave(): Promise<void> {
    if (!this.isTracking || !this.currentPageUrl) return

    const duration = Math.round((Date.now() - this.startTime) / 1000)
    const isBounce = duration < 10 // 停留时间少于10秒视为跳出

    try {
      // 更新最近的访问记录
      const { error } = await supabase
        .from(TABLES.PAGE_VISITS)
        .update({
          duration,
          is_bounce: isBounce
        })
        .eq('visitor_id', this.visitorId)
        .eq('session_id', this.sessionId)
        .eq('page_url', this.currentPageUrl)
        .order('visit_time', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Analytics: 更新页面停留时间失败', error)
      }
    } catch (err) {
      console.error('Analytics: 统计服务异常', err)
    }
  }

  // 追踪自定义事件
  async trackEvent(eventName: string, eventData?: Record<string, any>): Promise<void> {
    if (!this.isTracking) return

    
    // 这里可以扩展自定义事件的记录逻辑
  }

  // 获取访客ID
  getVisitorId(): string {
    return this.visitorId
  }

  // 获取会话ID
  getSessionId(): string {
    return this.sessionId
  }
}

// 创建全局实例
export const analytics = new AnalyticsTracker()

// 自动初始化（在页面加载完成后）
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      analytics.init()
    })
  } else {
    analytics.init()
  }
}