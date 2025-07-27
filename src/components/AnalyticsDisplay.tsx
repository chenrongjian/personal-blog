import React from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { analytics } from '@/lib/analytics';
import { AnalyticsAPI } from '@/utils/analyticsApi';

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
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasRealData, setHasRealData] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<string>('检测中...');

  // 加载统计数据
  React.useEffect(() => {
    const loadStats = async () => {
      if (!config.analytics?.enabled) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // 获取基础统计数据
        const data = await analytics.getAnalyticsData();
        
        // 获取真实的独立访客数据
        const overview = await AnalyticsAPI.getOverview(365);
        
        if (data) {
          setStats({
            totalViews: data.totalViews,
            totalUsers: overview.uniqueVisitors, // 使用真实的独立访客数
            todayViews: data.todayViews,
            avgSessionDuration: overview.averageDuration || 0 // 使用真实的平均停留时间
          });
          setHasRealData(data.totalViews > 0 || data.todayViews > 0);
          setDataSource(data.totalViews > 0 || data.todayViews > 0 ? 'Supabase 真实数据' : '无访问数据');
        } else {
          // 如果获取数据失败，显示0
          setStats({
            totalViews: 0,
            totalUsers: 0,
            todayViews: 0,
            avgSessionDuration: 0
          });
          setHasRealData(false);
          setDataSource('数据获取失败');
        }
      } catch (error) {
        console.warn('Failed to load analytics data:', error);
        // 显示真实的0值作为后备
        setStats({
          totalViews: 0,
          totalUsers: 0,
          todayViews: 0,
          avgSessionDuration: 0
        });
        setHasRealData(false);
        setDataSource('数据加载失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [config.analytics]);

  // 检查配置是否已加载
  const configLoaded = config.analytics !== undefined;
  
  // 调试日志已移除
  
  // 如果配置还未加载，显示加载状态
  if (!configLoaded) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <i className="fas fa-spinner fa-spin text-gray-400"></i>
        <span className="text-sm text-gray-500">加载配置中...</span>
      </div>
    );
  }
  
  // 如果未启用统计功能或明确禁用公共统计显示，则不渲染
  if (!config.analytics?.enabled || config.analytics?.enablePublicStats === false) {
    return null;
  }
  
  // 调试日志已移除

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <i className="fas fa-spinner fa-spin text-gray-400"></i>
        <span className="text-sm text-gray-500">加载统计数据...</span>
      </div>
    );
  }

  // 如果没有统计数据，不显示组件
  if (!stats) {
    return null;
  }

  // 数据来源指示器
  const getDataSourceIndicator = () => {
    const getIndicatorStyle = () => {
      if (dataSource.includes('Supabase')) {
        return 'bg-green-100 text-green-800';
      } else if (dataSource.includes('无访问数据')) {
        return 'bg-yellow-100 text-yellow-800';
      } else if (dataSource.includes('失败')) {
        return 'bg-red-100 text-red-800';
      } else {
        return 'bg-gray-100 text-gray-800';
      }
    };

    const getIcon = () => {
      if (dataSource.includes('Supabase')) {
        return 'fas fa-database';
      } else if (dataSource.includes('无访问数据')) {
        return 'fas fa-info-circle';
      } else if (dataSource.includes('失败')) {
        return 'fas fa-exclamation-triangle';
      } else {
        return 'fas fa-question-circle';
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ml-2 ${getIndicatorStyle()}`}>
        <i className={`${getIcon()} mr-1`}></i>
        {dataSource}
      </span>
    );
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-4 text-sm text-gray-600 ${className}`}>
        {showTitle && (
          <div className="flex items-center">
            <span className="font-medium">网站统计:</span>
            {getDataSourceIndicator()}
          </div>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <i className="fas fa-chart-bar text-blue-500 mr-2"></i>
            网站统计
          </h3>
          {getDataSourceIndicator()}
        </div>
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