import React, { useState, useEffect } from 'react';
import { SiteConfig } from '../config/siteConfig';
import AnalyticsAPI from '../utils/analyticsApi';

interface AnalyticsConfigTabProps {
  localConfig: SiteConfig;
  handleInputChange: (field: string, value: string | boolean | number) => void;
}

const AnalyticsConfigTab: React.FC<AnalyticsConfigTabProps> = ({
  localConfig,
  handleInputChange
}) => {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statsOverview, setStatsOverview] = useState({
    totalVisits: 0,
    totalVisitors: 0,
    dataRetentionDays: 365,
    lastCleanup: null as string | null
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // 检查Supabase连接状态
  const checkSupabaseConnection = async () => {
    try {
      setSupabaseStatus('checking');
      await AnalyticsAPI.getOverview(7); // 尝试获取7天数据
      setSupabaseStatus('connected');
    } catch (error) {
      console.error('Supabase连接检查失败:', error);
      setSupabaseStatus('error');
    }
  };

  // 检查连接状态和获取统计概览
  useEffect(() => {
    checkSupabaseConnection();
    loadStatsOverview();
  }, []);

  // 加载统计概览
  const loadStatsOverview = async () => {
    try {
      const overview = await AnalyticsAPI.getOverview(365);
      setStatsOverview({
        totalVisits: overview.totalVisits,
        totalVisitors: overview.uniqueVisitors,
        dataRetentionDays: localConfig.analytics?.dataRetentionDays || 365,
        lastCleanup: null // Supabase统计系统不需要本地清理时间记录
      });
    } catch (error) {
      console.error('加载统计概览失败:', error);
    }
  };

  // 清理过期统计数据
  const handleCleanupStats = async () => {
    const retentionDays = localConfig.analytics?.dataRetentionDays || 365;
    if (window.confirm(`确定要清理${retentionDays}天前的统计数据吗？此操作不可撤销。\n\n提示：按F12打开开发者工具查看详细清理日志。`)) {
      setIsCleaningUp(true);
      try {
        // 调用真正的数据清理方法
        await AnalyticsAPI.cleanupOldData();
        handleInputChange('analytics.lastCleanup', new Date().toISOString());
        await loadStatsOverview();
        alert('统计数据清理完成');
      } catch (error) {
        console.error('清理数据失败:', error);
        alert('清理失败，请重试');
      } finally {
        setIsCleaningUp(false);
      }
    }
  };



  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">统计分析设置</h3>
      
      {/* Supabase统计系统状态 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Supabase 统计系统状态</h4>
        <div className="flex items-center space-x-2">
          {supabaseStatus === 'checking' && (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">检查连接中...</span>
            </>
          )}
          {supabaseStatus === 'connected' && (
            <>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">✓ 已连接到 Supabase 统计系统</span>
            </>
          )}
          {supabaseStatus === 'error' && (
            <>
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600">✗ 连接失败，请检查 Supabase 配置</span>
            </>
          )}
        </div>
      </div>
      
      {/* 基础配置 */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数据保留天数
              <span className="text-xs text-gray-500 ml-1">（超过此天数的数据将被清理）</span>
            </label>
            <input
              type="number"
              min="30"
              max="3650"
              value={localConfig.analytics?.dataRetentionDays || 365}
              onChange={(e) => handleInputChange('analytics.dataRetentionDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="365"
            />
            <p className="text-xs text-gray-500 mt-1">
              建议设置为365天，过短可能影响长期数据分析
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              统计功能状态
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localConfig.analytics?.enabled !== false}
                  onChange={(e) => handleInputChange('analytics.enabled', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">启用统计功能</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              关闭后将停止收集访问统计数据
            </p>
          </div>
        </div>
        
        {/* 统计数据概览 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-gray-800 mb-3">统计数据概览</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{statsOverview.totalVisits.toLocaleString()}</div>
              <div className="text-xs text-gray-600">总访问量</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{statsOverview.totalVisitors.toLocaleString()}</div>
              <div className="text-xs text-gray-600">独立访客</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{statsOverview.dataRetentionDays}</div>
              <div className="text-xs text-gray-600">保留天数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {statsOverview.lastCleanup ? new Date(statsOverview.lastCleanup).toLocaleDateString() : '从未'}
              </div>
              <div className="text-xs text-gray-600">上次清理</div>
            </div>
          </div>
        </div>
        
        {/* 显示设置 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">显示设置</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.analytics?.enablePublicStats !== false}
                onChange={(e) => handleInputChange('analytics.enablePublicStats', e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">启用公共统计显示</span>
                <p className="text-xs text-gray-500">在网站上显示访问量等统计信息</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.analytics?.showViewsOnArticles || false}
                onChange={(e) => handleInputChange('analytics.showViewsOnArticles', e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">在文章页显示阅读量</span>
                <p className="text-xs text-gray-500">在文章详情页显示该文章的阅读次数</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.analytics?.enableTrendCharts || false}
                onChange={(e) => handleInputChange('analytics.enableTrendCharts', e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">启用趋势图表</span>
                <p className="text-xs text-gray-500">显示访问量趋势图表（需要足够的数据）</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.analytics?.enableDetailedTracking || false}
                onChange={(e) => handleInputChange('analytics.enableDetailedTracking', e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">启用详细跟踪</span>
                <p className="text-xs text-gray-500">记录更详细的访问信息，如页面停留时间、来源等</p>
              </div>
            </label>
          </div>
        </div>
        
        {/* 高级设置 */}
        <div className="border-t pt-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <i className={`fas fa-chevron-${showAdvanced ? 'down' : 'right'} mr-2`}></i>
            高级设置
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-6">
              {/* 实时统计设置 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-800 mb-3">实时统计设置</h5>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.analytics?.enableRealTimeStats || false}
                      onChange={(e) => handleInputChange('analytics.enableRealTimeStats', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">启用实时统计</span>
                      <p className="text-xs text-gray-500">实时更新访问统计数据（可能影响性能）</p>
                    </div>
                  </label>
                  
                  {localConfig.analytics?.enableRealTimeStats && (
                    <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-start">
                        <i className="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-0.5"></i>
                        <div className="text-xs text-yellow-800">
                          <p className="font-medium mb-1">注意：</p>
                          <p>实时统计会增加数据库查询频率，建议仅在需要时启用。</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Supabase统计数据管理 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-800 mb-3">Supabase统计数据管理</h5>
                
                <div className="space-y-4">
                  {/* 统计概览 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{statsOverview.totalVisits}</div>
                      <div className="text-xs text-gray-500">总访问量</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{statsOverview.totalVisitors}</div>
                      <div className="text-xs text-gray-500">独立访客</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{statsOverview.dataRetentionDays}</div>
                      <div className="text-xs text-gray-500">保留天数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {statsOverview.lastCleanup ? new Date(statsOverview.lastCleanup).toLocaleDateString() : '从未'}
                      </div>
                      <div className="text-xs text-gray-500">上次清理</div>
                    </div>
                  </div>
                  
                  {/* 数据管理操作 */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleCleanupStats}
                      disabled={isCleaningUp}
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
                    >
                      <i className={`fas ${isCleaningUp ? 'fa-spinner fa-spin' : 'fa-broom'} mr-1`}></i>
                      清理过期数据
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => alert('导出功能开发中')}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      <i className="fas fa-download mr-1"></i>
                      导出数据
                    </button>
                    
                    <label className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer">
                      <i className="fas fa-upload mr-1"></i>
                      导入数据
                      <input
                        type="file"
                        accept=".json"
                        onChange={() => alert('导入功能开发中')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* 数据清理说明 */}
                  <div className="mt-3 text-xs text-gray-600">
                    <p>• 数据清理将删除超过保留期限的访问记录</p>
                    <p>• 建议定期清理以保持数据库性能</p>
                    <p>• 清理操作不可撤销，请谨慎操作</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Supabase 配置状态提示 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">配置说明：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>启用统计功能后，网站将通过Supabase自动收集访问数据</li>
                <li>统计数据实时更新，无需等待</li>
                <li>详细跟踪功能可以记录更多访问信息</li>
                <li>启用公共统计显示功能会在页脚显示网站总访问量</li>
                <li>所有统计功能都遵循用户隐私保护原则</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsConfigTab;