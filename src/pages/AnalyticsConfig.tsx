import React, { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Trash2, Shield, Clock, Database, Eye } from 'lucide-react'
import AnalyticsAPI from '../utils/analyticsApi'
import { getSiteConfigAsync } from '../config/siteConfig'
import { configApi } from '../lib/api'

interface ConfigItem {
  key: string
  value: string
  description?: string
  updated_at?: string
  isEditing: boolean
  tempValue: string
}

const AnalyticsConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [summary, setSummary] = useState<{
    totalVisits: number
    totalVisitors: number
    totalPages: number
    averageSessionDuration: number
  } | null>(null)

  // 加载配置数据
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [siteConfig, summaryData] = await Promise.all([
        getSiteConfigAsync(),
        AnalyticsAPI.getSummary()
      ])
      
      // 从site_config中提取analytics配置
      const analyticsConfig: any = siteConfig.analytics || {}
      const configData = [
        {
          key: 'analytics_enabled',
          value: String(analyticsConfig.enabled || false),
          description: '启用统计分析',
          isEditing: false,
          tempValue: String(analyticsConfig.enabled || false)
        },
        {
          key: 'data_retention_days',
          value: String(analyticsConfig.dataRetentionDays || 365),
          description: '数据保留天数',
          isEditing: false,
          tempValue: String(analyticsConfig.dataRetentionDays || 365)
        },
        {
          key: 'enable_public_stats',
          value: String(analyticsConfig.enablePublicStats || false),
          description: '启用公开统计',
          isEditing: false,
          tempValue: String(analyticsConfig.enablePublicStats || false)
        },
        {
          key: 'enable_trend_charts',
          value: String(analyticsConfig.enableTrendCharts || true),
          description: '启用趋势图表',
          isEditing: false,
          tempValue: String(analyticsConfig.enableTrendCharts || true)
        },
        {
          key: 'enable_realtime_stats',
          value: String(analyticsConfig.enableRealTimeStats || false),
          description: '启用实时统计',
          isEditing: false,
          tempValue: String(analyticsConfig.enableRealTimeStats || false)
        },
        {
          key: 'show_views_on_articles',
          value: String(analyticsConfig.showViewsOnArticles || true),
          description: '在文章上显示浏览量',
          isEditing: false,
          tempValue: String(analyticsConfig.showViewsOnArticles || true)
        },
        {
          key: 'enable_detailed_tracking',
          value: String(analyticsConfig.enableDetailedTracking || true),
          description: '启用详细跟踪',
          isEditing: false,
          tempValue: String(analyticsConfig.enableDetailedTracking || true)
        }
      ]
      
      setConfigs(configData)
      setSummary(summaryData)
    } catch (err) {
      console.error('加载配置失败:', err)
      setError('加载配置失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 开始编辑
  const startEdit = (key: string) => {
    setConfigs(prev => prev.map(config => 
      config.key === key 
        ? { ...config, isEditing: true, tempValue: config.value }
        : { ...config, isEditing: false }
    ))
  }

  // 取消编辑
  const cancelEdit = (key: string) => {
    setConfigs(prev => prev.map(config => 
      config.key === key 
        ? { ...config, isEditing: false, tempValue: config.value }
        : config
    ))
  }

  // 保存配置
  const saveConfig = async (key: string) => {
    const config = configs.find(c => c.key === key)
    if (!config || !config.tempValue) return

    try {
      setSaving(key)
      setError(null)
      

      
      // 获取当前site_config
      const currentConfig = await getSiteConfigAsync()
      
      // 更新analytics配置
      const analyticsConfig: any = currentConfig.analytics || {}
      
      // 根据key更新对应的配置项
      switch (key) {
        case 'analytics_enabled':
          analyticsConfig.enabled = config.tempValue === 'true'
          break
        case 'data_retention_days':
          analyticsConfig.dataRetentionDays = parseInt(config.tempValue)
          break
        case 'enable_public_stats':
          analyticsConfig.enablePublicStats = config.tempValue === 'true'
          break
        case 'enable_trend_charts':
          analyticsConfig.enableTrendCharts = config.tempValue === 'true'
          break
        case 'enable_realtime_stats':
          analyticsConfig.enableRealTimeStats = config.tempValue === 'true'
          break
        case 'show_views_on_articles':
          analyticsConfig.showViewsOnArticles = config.tempValue === 'true'
          break
        case 'enable_detailed_tracking':
          analyticsConfig.enableDetailedTracking = config.tempValue === 'true'
          break
      }
      
      // 保存到site_config数据库
      await configApi.saveSiteConfig({
        ...currentConfig,
        analytics: analyticsConfig
      })
      

      
      // 更新本地状态
      setConfigs(prev => prev.map(c => 
        c.key === key 
          ? { ...c, value: config.tempValue!, isEditing: false, updated_at: new Date().toISOString() }
          : c
      ))
      setSuccess(`配置 "${config.description || key}" 已更新`)
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('保存配置失败:', err)
      setError(`保存配置失败: ${err instanceof Error ? err.message : '请稍后重试'}`)
    } finally {
      setSaving(null)
    }
  }

  // 更新临时值
  const updateTempValue = (key: string, value: string) => {
    setConfigs(prev => prev.map(config => 
      config.key === key 
        ? { ...config, tempValue: value }
        : config
    ))
  }

  // 清理数据
  const cleanupData = async () => {
    if (!confirm('确定要清理过期数据吗？此操作不可撤销。\n\n提示：清理过程中的详细日志会显示在浏览器控制台中，您可以按F12打开开发者工具查看。')) return

    try {
      setLoading(true)

      
      await AnalyticsAPI.cleanupOldData()
      

      setSuccess('数据清理完成！请查看浏览器控制台了解详细清理结果。')
      setTimeout(() => setSuccess(null), 5000)
      
      // 重新加载摘要数据

      const summaryData = await AnalyticsAPI.getSummary()
      setSummary(summaryData)

    } catch (err) {
      console.error('数据清理失败:', err)
      setError(`数据清理失败：${err instanceof Error ? err.message : '请稍后重试'}。请查看浏览器控制台了解详细错误信息。`)
    } finally {
      setLoading(false)
    }
  }

  // 格式化时间
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`
  }

  // 获取配置图标
  const getConfigIcon = (key: string) => {
    switch (key) {
      case 'analytics_enabled':
        return <Eye className="h-5 w-5 text-blue-500" />
      case 'data_retention_days':
        return <Clock className="h-5 w-5 text-green-500" />
      case 'enable_public_stats':
      case 'enable_detailed_tracking':
        return <Shield className="h-5 w-5 text-purple-500" />
      case 'enable_trend_charts':
      case 'enable_realtime_stats':
      case 'show_views_on_articles':
        return <Database className="h-5 w-5 text-orange-500" />
      default:
        return <Settings className="h-5 w-5 text-gray-500" />
    }
  }

  // 获取配置输入组件
  const getConfigInput = (config: ConfigItem) => {
    const { key, tempValue } = config
    
    if (key === 'analytics_enabled' || key === 'enable_public_stats' || key === 'enable_trend_charts' || key === 'enable_realtime_stats' || key === 'show_views_on_articles' || key === 'enable_detailed_tracking') {
      return (
        <select
          value={tempValue}
          onChange={(e) => updateTempValue(key, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="true">启用</option>
          <option value="false">禁用</option>
        </select>
      )
    }
    
    if (key === 'data_retention_days') {
      return (
        <select
          value={tempValue}
          onChange={(e) => updateTempValue(key, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="30">30天</option>
          <option value="90">90天</option>
          <option value="180">180天</option>
          <option value="365">1年</option>
          <option value="730">2年</option>
        </select>
      )
    }
    
    return (
      <input
        type="text"
        value={tempValue}
        onChange={(e) => updateTempValue(key, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载配置中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">统计配置</h1>
          <p className="text-gray-600">管理统计系统的设置和数据保留策略</p>
        </div>

        {/* 成功/错误提示 */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 统计摘要 */}
        {summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据概览</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalVisits.toLocaleString()}</div>
                <div className="text-sm text-gray-600">总访问量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.totalVisitors.toLocaleString()}</div>
                <div className="text-sm text-gray-600">总访客数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.totalPages.toLocaleString()}</div>
                <div className="text-sm text-gray-600">页面数量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatDuration(summary.averageSessionDuration)}</div>
                <div className="text-sm text-gray-600">平均会话时长</div>
              </div>
            </div>
          </div>
        )}

        {/* 配置列表 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">系统配置</h3>
            <button
              onClick={loadData}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>刷新</span>
            </button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {configs.map((config) => (
              <div key={config.key} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getConfigIcon(config.key)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {config.description || config.key}
                        </h4>
                        <div className="text-xs text-gray-500">
                          {config.key}
                        </div>
                      </div>
                      
                      {config.isEditing ? (
                        <div className="space-y-3">
                          {getConfigInput(config)}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveConfig(config.key)}
                              disabled={saving === config.key}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {saving === config.key ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                              <span>保存</span>
                            </button>
                            <button
                              onClick={() => cancelEdit(config.key)}
                              className="px-3 py-1 text-gray-600 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            当前值: <span className="font-medium">
                              {config.key === 'analytics_enabled' || config.key === 'enable_public_stats' || config.key === 'enable_trend_charts' || config.key === 'enable_realtime_stats' || config.key === 'show_views_on_articles' || config.key === 'enable_detailed_tracking'
                                ? (config.value === 'true' ? '启用' : '禁用')
                                : config.key === 'data_retention_days'
                                ? `${config.value}天`
                                : config.value
                              }
                            </span>
                          </div>
                          <button
                            onClick={() => startEdit(config.key)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            编辑
                          </button>
                        </div>
                      )}
                      
                      {config.updated_at && (
                        <div className="text-xs text-gray-400 mt-2">
                          最后更新: {new Date(config.updated_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">数据管理</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">清理过期数据</h4>
                <p className="text-sm text-gray-600 mt-1">
                  根据数据保留策略清理过期的访问记录和统计数据
                </p>
              </div>
              <button
                onClick={cleanupData}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>清理数据</span>
              </button>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="text-yellow-600 mt-0.5">⚠️</div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">注意事项</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• 数据清理操作不可撤销，请谨慎操作</li>
                    <li>• 清理过程可能需要一些时间，请耐心等待</li>
                    <li>• 建议在访问量较低的时间段进行清理操作</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsConfigPage