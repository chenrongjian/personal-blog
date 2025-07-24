// Google Analytics 配置管理
import { GAConfig } from '@/lib/googleAnalyticsAPI';

// Analytics 配置接口
export interface AnalyticsSettings {
  // 基础配置
  gaTrackingId: string;
  enablePublicStats: boolean;
  showViewsOnArticles: boolean;
  enableTrendCharts: boolean;
  
  // GA API 配置（可选）
  gaPropertyId?: string;
  enableGAAPI?: boolean;
  
  // 服务账号配置（仅服务端使用）
  gaServiceAccount?: {
    clientEmail: string;
    privateKey: string;
    projectId: string;
  };
  
  // 本地统计配置
  enableLocalStats: boolean;
  localStatsRetentionDays: number;
}

// 默认配置
export const defaultAnalyticsSettings: AnalyticsSettings = {
  gaTrackingId: '',
  enablePublicStats: true,
  showViewsOnArticles: true,
  enableTrendCharts: false,
  gaPropertyId: '',
  enableGAAPI: false,
  enableLocalStats: true,
  localStatsRetentionDays: 30
};

// 配置验证
export const validateAnalyticsConfig = (config: Partial<AnalyticsSettings>): string[] => {
  const errors: string[] = [];
  
  // 验证 GA Tracking ID 格式
  if (config.gaTrackingId && !/^G-[A-Z0-9]{10}$/.test(config.gaTrackingId)) {
    errors.push('GA跟踪ID格式不正确，应为 G-XXXXXXXXXX 格式');
  }
  
  // 验证 GA Property ID 格式
  if (config.gaPropertyId && !/^\d+$/.test(config.gaPropertyId)) {
    errors.push('GA媒体资源ID应为纯数字');
  }
  
  // 如果启用了 GA API，必须提供 Property ID
  if (config.enableGAAPI && !config.gaPropertyId) {
    errors.push('启用GA API时必须提供媒体资源ID');
  }
  
  // 验证本地统计保留天数
  if (config.localStatsRetentionDays && (config.localStatsRetentionDays < 1 || config.localStatsRetentionDays > 365)) {
    errors.push('本地统计保留天数应在1-365天之间');
  }
  
  return errors;
};

// 从配置生成 GA API 配置
export const createGAConfig = (settings: AnalyticsSettings): GAConfig | null => {
  if (!settings.enableGAAPI || !settings.gaPropertyId) {
    return null;
  }
  
  const gaConfig: GAConfig = {
    propertyId: settings.gaPropertyId
  };
  
  // 如果有服务账号配置，添加凭据
  if (settings.gaServiceAccount) {
    gaConfig.credentials = {
      client_email: settings.gaServiceAccount.clientEmail,
      private_key: settings.gaServiceAccount.privateKey,
      project_id: settings.gaServiceAccount.projectId
    };
  }
  
  return gaConfig;
};

// 清理过期的本地统计数据
export const cleanupLocalStats = (retentionDays: number = 30): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // 清理过期的每日访问量数据
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('page_views_')) {
        const dateStr = key.replace('page_views_', '');
        const date = new Date(dateStr);
        if (date < cutoffDate) {
          keysToRemove.push(key);
        }
      }
    }
    
    // 删除过期数据
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleaned up ${keysToRemove.length} expired analytics entries`);
  } catch (error) {
    console.error('Failed to cleanup local stats:', error);
  }
};

// 导出本地统计数据
export const exportLocalStats = (): any => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stats: any = {};
    
    // 收集所有分析相关的本地存储数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('page_views_') || key.includes('analytics'))) {
        stats[key] = localStorage.getItem(key);
      }
    }
    
    return {
      exportDate: new Date().toISOString(),
      data: stats
    };
  } catch (error) {
    console.error('Failed to export local stats:', error);
    return null;
  }
};

// 导入本地统计数据
export const importLocalStats = (data: any): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (data && data.data) {
      Object.entries(data.data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to import local stats:', error);
    return false;
  }
};

// 获取统计概览
export const getStatsOverview = (): {
  totalLocalEntries: number;
  oldestEntry: string | null;
  newestEntry: string | null;
  totalStorageSize: number;
} => {
  if (typeof window === 'undefined') {
    return {
      totalLocalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
      totalStorageSize: 0
    };
  }
  
  try {
    const entries: string[] = [];
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('page_views_') || key.includes('analytics'))) {
        entries.push(key);
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
    
    // 提取日期并排序
    const dates = entries
      .filter(key => key.startsWith('page_views_'))
      .map(key => key.replace('page_views_', ''))
      .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .sort();
    
    return {
      totalLocalEntries: entries.length,
      oldestEntry: dates.length > 0 ? dates[0] : null,
      newestEntry: dates.length > 0 ? dates[dates.length - 1] : null,
      totalStorageSize: totalSize
    };
  } catch (error) {
    console.error('Failed to get stats overview:', error);
    return {
      totalLocalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
      totalStorageSize: 0
    };
  }
};