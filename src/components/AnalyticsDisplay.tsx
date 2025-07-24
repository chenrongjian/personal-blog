import React from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { useAnalytics } from '@/lib/analytics';

interface AnalyticsDisplayProps {
  className?: string;
  showTitle?: boolean;
  variant?: 'compact' | 'detailed';
}

const AnalyticsDisplay: React.FC<AnalyticsDisplayProps> = ({
  className = '',
  showTitle = true,
  variant = 'compact'
}) => {
  const { config } = useConfig();
  const { stats, isLoading } = useAnalytics();

  // 如果未启用公共统计显示，则不渲染
  if (!config.analytics?.enablePublicStats) {
    return null;
  }

  // 如果没有配置 GA ID，则不显示
  if (!config.analytics?.gaTrackingId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <i className="fas fa-spinner fa-spin text-gray-400"></i>
        <span className="text-sm text-gray-500">加载统计数据...</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-4 text-sm text-gray-600 ${className}`}>
        {showTitle && (
          <span className="font-medium">网站统计:</span>
        )}
        <div className="flex items-center space-x-1">
          <i className="fas fa-eye text-blue-500"></i>
          <span>{stats.totalViews.toLocaleString()} 次访问</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="fas fa-users text-green-500"></i>
          <span>{stats.totalUsers.toLocaleString()} 位访客</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <i className="fas fa-chart-bar text-blue-500 mr-2"></i>
          网站统计
        </h3>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总访问量</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <i className="fas fa-eye text-blue-500 text-xl"></i>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">独立访客</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <i className="fas fa-users text-green-500 text-xl"></i>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日访问</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.todayViews.toLocaleString()}
              </p>
            </div>
            <i className="fas fa-calendar-day text-purple-500 text-xl"></i>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均停留</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(stats.avgSessionDuration / 60)}m
              </p>
            </div>
            <i className="fas fa-clock text-orange-500 text-xl"></i>
          </div>
        </div>
      </div>
      
      {config.analytics?.enableTrendCharts && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <i className="fas fa-chart-line mr-2"></i>
            趋势图表功能开发中...
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDisplay;