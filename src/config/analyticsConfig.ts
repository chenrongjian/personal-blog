// Supabase 统计系统配置管理

// Supabase 统计配置接口
export interface AnalyticsSettings {
  // 基础配置
  enabled: boolean;
  enablePublicStats: boolean;
  showViewsOnArticles: boolean;
  enableTrendCharts: boolean;
  
  // 数据保留配置
  dataRetentionDays: number;
  
  // 统计精度配置
  trackingPrecision: 'realtime' | 'hourly' | 'daily';
  
  // 隐私配置
  anonymizeIp: boolean;
  ignoreAdminVisits: boolean;
  respectDoNotTrack: boolean;
  
  // 性能配置
  enableBatching: boolean;
  batchSize: number;
  flushInterval: number; // 秒
}

// 默认配置
export const defaultAnalyticsSettings: AnalyticsSettings = {
  enabled: true,
  enablePublicStats: true,
  showViewsOnArticles: true,
  enableTrendCharts: true,
  dataRetentionDays: 90,
  trackingPrecision: 'realtime',
  anonymizeIp: true,
  ignoreAdminVisits: true,
  respectDoNotTrack: true,
  enableBatching: true,
  batchSize: 10,
  flushInterval: 30
};

// 配置验证
export const validateAnalyticsConfig = (config: Partial<AnalyticsSettings>): string[] => {
  const errors: string[] = [];
  
  // 验证数据保留天数
  if (config.dataRetentionDays && (config.dataRetentionDays < 7 || config.dataRetentionDays > 365)) {
    errors.push('数据保留天数应在7-365天之间');
  }
  
  // 验证批处理大小
  if (config.batchSize && (config.batchSize < 1 || config.batchSize > 100)) {
    errors.push('批处理大小应在1-100之间');
  }
  
  // 验证刷新间隔
  if (config.flushInterval && (config.flushInterval < 5 || config.flushInterval > 300)) {
    errors.push('刷新间隔应在5-300秒之间');
  }
  
  return errors;
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
      if (key && key.startsWith('supabase_analytics_')) {
        const dateStr = key.replace('supabase_analytics_', '').split('_')[0];
        const date = new Date(dateStr);
        if (date < cutoffDate) {
          keysToRemove.push(key);
        }
      }
    }
    
    // 删除过期数据
    keysToRemove.forEach(key => localStorage.removeItem(key));
    

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
      if (key && (key.startsWith('supabase_analytics_') || key.includes('analytics'))) {
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
      if (key && (key.startsWith('supabase_analytics_') || key.includes('analytics'))) {
        entries.push(key);
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
    
    // 提取日期并排序
    const dates = entries
      .filter(key => key.startsWith('supabase_analytics_'))
      .map(key => key.replace('supabase_analytics_', '').split('_')[0])
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