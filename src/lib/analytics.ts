// Supabase 统计系统工具类
import React from 'react';
import { supabase, TABLES } from './supabase';
import { AnalyticsAPI } from '@/utils/analyticsApi';

// 统计数据接口
export interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  totalArticles: number;
  totalCategories: number;
  popularArticles: Array<{id: string, title: string, views: number}>;
  viewsTrend: Array<{date: string, views: number}>;
}

// 统计配置接口
export interface AnalyticsConfig {
  enabled: boolean;
  enablePublicStats: boolean;
  showViewsOnArticles: boolean;
  enableTrendCharts: boolean;
  dataRetentionDays: number;
  trackingPrecision: 'realtime' | 'hourly' | 'daily';
  anonymizeIp: boolean;
  ignoreAdminVisits: boolean;
  respectDoNotTrack: boolean;
}

class SupabaseAnalytics {
  private isInitialized = false;
  private config: AnalyticsConfig | null = null;
  private batchQueue: Array<{type: string, data: any}> = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly batchSize = 10;
  private readonly flushInterval = 30000; // 30秒

  // 初始化Supabase统计系统
  init(config: AnalyticsConfig): void {
    if (this.isInitialized) {
      return;
    }

    this.config = config;
    this.isInitialized = true;
    

    
    // 启动批处理定时器
    if (config.enabled) {
      this.startBatchTimer();
    }
  }

  // 启动批处理定时器
  private startBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    
    this.batchTimer = setInterval(() => {
      this.flushBatch();
    }, this.flushInterval);
  }

  // 检查是否应该跟踪
  private shouldTrack(): boolean {
    if (!this.config?.enabled || !this.isInitialized) {
      return false;
    }

    // 检查Do Not Track设置
    if (this.config.respectDoNotTrack && 
        typeof navigator !== 'undefined' && 
        navigator.doNotTrack === '1') {
      return false;
    }

    // 检查是否忽略管理员访问
    if (this.config.ignoreAdminVisits && this.isAdminUser()) {
      return false;
    }

    return true;
  }

  // 检查是否为管理员用户
  private isAdminUser(): boolean {
    // 这里可以根据实际情况判断是否为管理员
    // 例如检查localStorage中的用户信息或URL路径
    if (typeof window !== 'undefined') {
      return window.location.pathname.includes('/admin') || 
             window.location.pathname.includes('/manage');
    }
    return false;
  }

  // 跟踪页面访问
  trackPageView(path: string, title?: string): void {
    if (!this.shouldTrack()) {
      return;
    }

    const eventData = {
      type: 'page_view',
      path,
      title: title || document.title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ip: this.config?.anonymizeIp ? this.anonymizeIP() : undefined
    };

    // 立即发送或添加到批处理队列
    if (this.config?.trackingPrecision === 'realtime') {
      this.sendEvent(eventData);
    } else {
      this.addToBatch(eventData);
    }

    // 同时记录到本地存储用于离线统计
    this.recordLocalPageView(path);
  }

  // 匿名化IP地址
  private anonymizeIP(): string {
    // 这里返回一个匿名化的标识符
    return 'anonymized';
  }

  // 记录本地页面访问
  private recordLocalPageView(path: string): void {
    if (typeof window === 'undefined') return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `supabase_analytics_${today}_${path.replace(/\//g, '_')}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      localStorage.setItem(key, (current + 1).toString());
    } catch (error) {
      console.warn('Failed to record local page view:', error);
    }
  }

  // 添加到批处理队列
  private addToBatch(eventData: any): void {
    this.batchQueue.push(eventData);
    
    // 如果队列达到批处理大小，立即发送
    if (this.batchQueue.length >= this.batchSize) {
      this.flushBatch();
    }
  }

  // 发送批处理数据
  private flushBatch(): void {
    if (this.batchQueue.length === 0) {
      return;
    }

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    // 发送批处理数据到Supabase
    this.sendBatchEvents(batch).catch(error => {
      console.warn('Failed to send batch events:', error);
      // 如果发送失败，可以考虑重新加入队列或记录到本地
    });
  }

  // 获取访客ID
  private getVisitorId(): string {
    let visitorId = localStorage.getItem('supabase_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('supabase_visitor_id', visitorId);
    }
    return visitorId;
  }

  // 获取会话ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('supabase_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('supabase_session_id', sessionId);
    }
    return sessionId;
  }

  // 获取设备类型
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // 获取浏览器信息
  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  // 获取操作系统信息
  private getOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // 发送页面访问到Supabase
  private async trackPageViewToSupabase(path: string, title?: string): Promise<void> {
    try {
      const visitData = {
        page_url: path,
        page_title: title || document.title,
        visitor_id: this.getVisitorId(),
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        visit_time: new Date().toISOString(),
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS(),
        screen_resolution: `${screen.width}x${screen.height}`
      };

      await supabase.from(TABLES.PAGE_VISITS).insert([visitData]);
    } catch (error) {
      console.warn('Failed to track page view to Supabase:', error);
    }
  }

  // 发送单个事件
  private async sendEvent(eventData: any): Promise<void> {
    try {
      await this.trackPageViewToSupabase(eventData.path, eventData.title);
    } catch (error) {
      console.warn('Failed to send event:', error);
    }
  }

  // 发送批处理事件
  private async sendBatchEvents(events: any[]): Promise<void> {
    try {
      // 这里可以实现批量发送到Supabase的逻辑
      for (const event of events) {
        if (event.type === 'page_view') {
          await this.trackPageViewToSupabase(event.path, event.title);
        }
      }
    } catch (error) {
      console.warn('Failed to send batch events:', error);
    }
  }

  // 跟踪自定义事件
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.shouldTrack()) {
      return;
    }

    const eventData = {
      type: 'custom_event',
      name: eventName,
      parameters,
      timestamp: new Date().toISOString(),
      path: window.location.pathname
    };

    if (this.config?.trackingPrecision === 'realtime') {
      this.sendCustomEvent(eventData);
    } else {
      this.addToBatch(eventData);
    }
  }

  // 发送自定义事件
  private async sendCustomEvent(eventData: any): Promise<void> {
    try {
      // 这里可以实现发送自定义事件到Supabase的逻辑
  
    } catch (error) {
      console.warn('Failed to send custom event:', error);
    }
  }

  // 跟踪文章阅读
  trackArticleRead(articleId: string, title: string): void {
    this.trackEvent('article_read', {
      article_id: articleId,
      article_title: title
    });
  }

  // 跟踪搜索
  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search', {
      search_query: query,
      results_count: resultsCount
    });
  }

  // 跟踪下载
  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent('download', {
      file_name: fileName,
      file_type: fileType
    });
  }

  // 获取统计数据
  async getAnalyticsData(): Promise<AnalyticsData | null> {
    try {
      // 这里可以从Supabase获取统计数据
      const data = await AnalyticsAPI.getAnalyticsData();
      return data;
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return null;
    }
  }

  // 获取本地统计概览
  getLocalStatsOverview(): {
    totalEntries: number;
    totalViews: number;
    dateRange: { start: string | null; end: string | null };
  } {
    if (typeof window === 'undefined') {
      return { totalEntries: 0, totalViews: 0, dateRange: { start: null, end: null } };
    }

    try {
      const entries: string[] = [];
      let totalViews = 0;
      const dates: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase_analytics_')) {
          entries.push(key);
          const views = parseInt(localStorage.getItem(key) || '0');
          totalViews += views;
          
          const dateMatch = key.match(/supabase_analytics_(\d{4}-\d{2}-\d{2})_/);
          if (dateMatch) {
            dates.push(dateMatch[1]);
          }
        }
      }

      dates.sort();
      
      return {
        totalEntries: entries.length,
        totalViews,
        dateRange: {
          start: dates.length > 0 ? dates[0] : null,
          end: dates.length > 0 ? dates[dates.length - 1] : null
        }
      };
    } catch (error) {
      console.error('Failed to get local stats overview:', error);
      return { totalEntries: 0, totalViews: 0, dateRange: { start: null, end: null } };
    }
  }

  // 清理资源
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    
    // 发送剩余的批处理数据
    this.flushBatch();
    
    this.isInitialized = false;
    this.config = null;
  }
}

// 导出单例实例
export const analytics = new SupabaseAnalytics();

// 初始化函数
export const initAnalytics = (config: AnalyticsConfig) => {
  analytics.init(config);
};

// React Hook for analytics
export const useAnalytics = () => {
  const trackPageView = React.useCallback((path: string, title?: string) => {
    analytics.trackPageView(path, title);
  }, []);

  const trackEvent = React.useCallback((eventName: string, parameters?: Record<string, any>) => {
    analytics.trackEvent(eventName, parameters);
  }, []);

  const trackArticleRead = React.useCallback((articleId: string, title: string) => {
    analytics.trackArticleRead(articleId, title);
  }, []);

  return {
    trackPageView,
    trackEvent,
    trackArticleRead,
    trackSearch: analytics.trackSearch.bind(analytics),
    trackDownload: analytics.trackDownload.bind(analytics)
  };
};

// 页面访问跟踪Hook
export const usePageTracking = () => {
  React.useEffect(() => {
    // 跟踪当前页面
    analytics.trackPageView(window.location.pathname, document.title);
  }, []);
};