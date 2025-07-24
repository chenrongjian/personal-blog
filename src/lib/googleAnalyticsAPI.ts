// Google Analytics API 接口定义（浏览器环境）

// GA4 数据接口
export interface GA4ReportData {
  totalViews: number;
  totalUsers: number;
  todayViews: number;
  avgSessionDuration: number;
  popularPages: Array<{
    path: string;
    title: string;
    views: number;
  }>;
  viewsTrend: Array<{
    date: string;
    views: number;
    users: number;
  }>;
}

// Google Analytics API 配置
export interface GAConfig {
  propertyId: string;
  credentials?: {
    client_email: string;
    private_key: string;
    project_id: string;
  };
}

class GoogleAnalyticsAPI {
  private propertyId: string = '';
  private isConfigured: boolean = false;

  // 初始化 GA API 客户端（浏览器环境占位）
  init(config: GAConfig): void {
    this.propertyId = config.propertyId;
    // 在浏览器环境中，GA Reporting API 需要通过后端 API 调用
    console.warn('GA Reporting API is not available in browser environment. Use backend API instead.');
    this.isConfigured = false;
  }

  // 获取基础统计数据（占位实现）
  async getBasicStats(startDate: string = '30daysAgo', endDate: string = 'today'): Promise<GA4ReportData> {
    throw new Error('GA Reporting API not available in browser environment');
  }

  // 获取实时数据（占位实现）
  async getRealTimeStats(): Promise<{ activeUsers: number }> {
    throw new Error('GA Reporting API not available in browser environment');
  }

  // 检查是否已配置
  isReady(): boolean {
    return false; // 浏览器环境中始终返回 false
  }
}

// 创建单例实例
export const gaAPI = new GoogleAnalyticsAPI();

// 便捷函数
export const initGAAPI = (config: GAConfig) => gaAPI.init(config);
export const getGAStats = (startDate?: string, endDate?: string) => gaAPI.getBasicStats(startDate, endDate);
export const getRealTimeStats = () => gaAPI.getRealTimeStats();

// 浏览器环境的替代方案 - 使用 gtag 获取基础信息
export class BrowserAnalytics {
  private trackingId: string = '';
  
  init(trackingId: string): void {
    this.trackingId = trackingId;
  }

  // 在浏览器环境中，我们无法直接获取历史数据
  // 但可以实现本地统计和缓存机制
  async getLocalStats(): Promise<Partial<GA4ReportData>> {
    // 从 localStorage 获取本地统计数据
    const localStats = localStorage.getItem('local_analytics_stats');
    if (localStats) {
      try {
        return JSON.parse(localStats);
      } catch (error) {
        console.error('Failed to parse local stats:', error);
      }
    }

    // 返回默认值
    return {
      totalViews: 0,
      totalUsers: 0,
      todayViews: 0,
      avgSessionDuration: 0,
      popularPages: [],
      viewsTrend: []
    };
  }

  // 更新本地统计
  updateLocalStats(stats: Partial<GA4ReportData>): void {
    try {
      localStorage.setItem('local_analytics_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save local stats:', error);
    }
  }

  // 增加页面访问计数
  incrementPageView(): void {
    const today = new Date().toISOString().split('T')[0];
    const viewsKey = `page_views_${today}`;
    const totalViewsKey = 'total_page_views';
    
    // 更新今日访问量
    const todayViews = parseInt(localStorage.getItem(viewsKey) || '0') + 1;
    localStorage.setItem(viewsKey, todayViews.toString());
    
    // 更新总访问量
    const totalViews = parseInt(localStorage.getItem(totalViewsKey) || '0') + 1;
    localStorage.setItem(totalViewsKey, totalViews.toString());
  }

  // 获取本地页面访问统计
  getLocalPageViews(): { todayViews: number; totalViews: number } {
    const today = new Date().toISOString().split('T')[0];
    const viewsKey = `page_views_${today}`;
    const totalViewsKey = 'total_page_views';
    
    return {
      todayViews: parseInt(localStorage.getItem(viewsKey) || '0'),
      totalViews: parseInt(localStorage.getItem(totalViewsKey) || '0')
    };
  }
}

// 浏览器分析实例
export const browserAnalytics = new BrowserAnalytics();