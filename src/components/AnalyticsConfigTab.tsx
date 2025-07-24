import React, { useState, useEffect } from 'react';
import { SiteConfig } from '../config/siteConfig';
import AnalyticsStatus from './AnalyticsStatus';
import { 
  validateAnalyticsConfig, 
  cleanupLocalStats, 
  exportLocalStats, 
  importLocalStats, 
  getStatsOverview,
  type AnalyticsSettings 
} from '../config/analyticsConfig';

interface AnalyticsConfigTabProps {
  localConfig: SiteConfig;
  handleInputChange: (field: string, value: string | boolean | number) => void;
}

const AnalyticsConfigTab: React.FC<AnalyticsConfigTabProps> = ({
  localConfig,
  handleInputChange
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [statsOverview, setStatsOverview] = useState({
    totalLocalEntries: 0,
    oldestEntry: null as string | null,
    newestEntry: null as string | null,
    totalStorageSize: 0
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 验证配置
  useEffect(() => {
    const errors = validateAnalyticsConfig(localConfig.analytics || {});
    setValidationErrors(errors);
  }, [localConfig.analytics]);

  // 获取统计概览
  useEffect(() => {
    const overview = getStatsOverview();
    setStatsOverview(overview);
  }, []);

  // 清理本地统计数据
  const handleCleanupStats = () => {
    if (window.confirm('确定要清理过期的本地统计数据吗？这将删除30天前的数据。')) {
      cleanupLocalStats(30);
      const overview = getStatsOverview();
      setStatsOverview(overview);
      alert('本地统计数据清理完成');
    }
  };

  // 导出统计数据
  const handleExportStats = () => {
    setIsExporting(true);
    try {
      const data = exportLocalStats();
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('统计数据导出成功');
      } else {
        alert('没有可导出的数据');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 导入统计数据
  const handleImportStats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (importLocalStats(data)) {
          const overview = getStatsOverview();
          setStatsOverview(overview);
          alert('统计数据导入成功');
        } else {
          alert('导入失败，文件格式不正确');
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('导入失败，请检查文件格式');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    
    // 清空文件输入
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">统计分析设置</h3>
      
      {/* 基础配置 */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics 跟踪 ID
              <span className="text-xs text-gray-500 ml-1">（格式：G-XXXXXXXXXX）</span>
            </label>
            <input
              type="text"
              value={localConfig.analytics?.gaTrackingId || ''}
              onChange={(e) => handleInputChange('analytics.gaTrackingId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.some(err => err.includes('跟踪ID')) 
                  ? 'border-red-300' 
                  : 'border-gray-300'
              }`}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-gray-500 mt-1">
              在 Google Analytics 中创建媒体资源后获取跟踪 ID
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GA4 媒体资源 ID
              <span className="text-xs text-gray-500 ml-1">（可选，用于API访问）</span>
            </label>
            <input
              type="text"
              value={localConfig.analytics?.ga4PropertyId || ''}
              onChange={(e) => handleInputChange('analytics.ga4PropertyId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.some(err => err.includes('媒体资源ID')) 
                  ? 'border-red-300' 
                  : 'border-gray-300'
              }`}
              placeholder="123456789"
            />
            <p className="text-xs text-gray-500 mt-1">
              用于获取真实的GA数据，可在GA管理界面获取
            </p>
          </div>
        </div>
        
        {/* GA连接状态 */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Google Analytics 连接状态</h4>
          <AnalyticsStatus />
        </div>
        
        {/* 验证错误提示 */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <i className="fas fa-exclamation-circle text-red-600 mr-2 mt-0.5"></i>
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">配置错误：</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* 显示设置 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">显示设置</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.analytics?.enablePublicStats || false}
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
                checked={localConfig.analytics?.enableLocalStats || false}
                onChange={(e) => handleInputChange('analytics.enableLocalStats', e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">启用本地统计</span>
                <p className="text-xs text-gray-500">在浏览器本地记录访问统计，作为GA数据的补充</p>
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
              {/* GA API 设置 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-800 mb-3">Google Analytics API 设置</h5>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.analytics?.enableGAReportingAPI || false}
                      onChange={(e) => handleInputChange('analytics.enableGAReportingAPI', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">启用 GA Reporting API</span>
                      <p className="text-xs text-gray-500">获取真实的GA统计数据（需要服务端支持）</p>
                    </div>
                  </label>
                  
                  {localConfig.analytics?.enableGAReportingAPI && (
                    <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-start">
                        <i className="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-0.5"></i>
                        <div className="text-xs text-yellow-800">
                          <p className="font-medium mb-1">注意：</p>
                          <p>GA Reporting API 需要服务端配置和 Google Cloud 服务账号。当前版本仅支持浏览器端统计。</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 本地统计管理 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-800 mb-3">本地统计数据管理</h5>
                
                <div className="space-y-4">
                  {/* 统计概览 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{statsOverview.totalLocalEntries}</div>
                      <div className="text-xs text-gray-500">本地记录数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(statsOverview.totalStorageSize / 1024)}KB
                      </div>
                      <div className="text-xs text-gray-500">存储大小</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {statsOverview.oldestEntry || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">最早记录</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {statsOverview.newestEntry || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">最新记录</div>
                    </div>
                  </div>
                  
                  {/* 数据管理操作 */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleCleanupStats}
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                    >
                      <i className="fas fa-broom mr-1"></i>
                      清理过期数据
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleExportStats}
                      disabled={isExporting}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} mr-1`}></i>
                      导出数据
                    </button>
                    
                    <label className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer">
                      <i className={`fas ${isImporting ? 'fa-spinner fa-spin' : 'fa-upload'} mr-1`}></i>
                      导入数据
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportStats}
                        disabled={isImporting}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* 保留天数设置 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      本地数据保留天数
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={localConfig.analytics?.localStatsRetentionDays || 30}
                      onChange={(e) => handleInputChange('analytics.localStatsRetentionDays', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500 ml-2">天</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* GA 配置状态提示 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">配置说明：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>配置 GA 跟踪 ID 后，网站将自动开始收集访问数据</li>
                <li>统计数据通常需要 24-48 小时后才能在 Google Analytics 中显示</li>
                <li>本地统计功能可以立即显示访问数据，作为 GA 数据的补充</li>
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