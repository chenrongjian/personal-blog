import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Users, Eye, Clock, TrendingUp, Globe, Smartphone, Monitor } from 'lucide-react'
import AnalyticsAPI from '../utils/analyticsApi'
import type { AnalyticsOverview, RealtimeStats } from '../lib/supabase'
import Footer from '../components/Footer'

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  // 加载统计数据
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [overviewData, realtimeData] = await Promise.all([
        AnalyticsAPI.getOverview(selectedPeriod),
        AnalyticsAPI.getRealtimeStats()
      ])
      
      setOverview(overviewData)
      setRealtimeStats(realtimeData)
    } catch (err) {
      console.error('加载统计数据失败:', err)
      setError('加载统计数据失败，请检查网络连接或稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  // 定时刷新实时数据
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const realtimeData = await AnalyticsAPI.getRealtimeStats()
        setRealtimeStats(realtimeData)
      } catch (err) {
        console.error('刷新实时数据失败:', err)
      }
    }, 30000) // 每30秒刷新一次

    return () => clearInterval(interval)
  }, [])

  // 格式化时间
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`
  }

  // 格式化日期
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 饼图颜色
  const pieColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载统计数据中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">网站统计</h1>
              <p className="text-gray-600">实时监控网站访问数据和用户行为</p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link
                to="/admin/articles"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-file-alt mr-2"></i>
                文章管理
              </Link>
              
              <Link
                to="/admin/categories"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-folder mr-2"></i>
                分类管理
              </Link>
              
              <Link
                to="/admin/config"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-cog mr-2"></i>
                配置管理
              </Link>
            </div>
          </div>
        </div>

        {/* 时间段选择 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                最近{days}天
              </button>
            ))}
          </div>
        </div>

        {/* 实时统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">在线访客</p>
                <p className="text-2xl font-bold text-green-600">{realtimeStats?.activeVisitors || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日访问</p>
                <p className="text-2xl font-bold text-blue-600">{realtimeStats?.todayVisits || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日访客</p>
                <p className="text-2xl font-bold text-purple-600">{realtimeStats?.todayVisitors || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">本小时访问</p>
                <p className="text-2xl font-bold text-orange-600">{realtimeStats?.currentHourVisits || 0}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 概览统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总访问量</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.totalVisits || 0}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">独立访客</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.uniqueVisitors || 0}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均停留</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(overview?.averageDuration || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">跳出率</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.bounceRate || 0}%</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 访问趋势图 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">访问趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overview?.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip labelFormatter={(value) => `日期: ${value}`} />
                <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} name="访问量" />
                <Line type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2} name="访客数" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 热门页面饼图 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">热门页面</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overview?.topPages?.slice(0, 8) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="visits"
                >
                  {overview?.topPages?.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [value, props.payload.title || props.payload.url]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 热门页面列表 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">热门页面详情</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    页面
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    访问量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    占比
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overview?.topPages?.map((page, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {page.title || page.url}
                        </div>
                        <div className="text-sm text-gray-500">{page.url}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.visits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${page.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{page.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 最近访问 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近访问</h3>
          <div className="space-y-3">
            {realtimeStats?.recentPages?.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {page.title || page.url}
                  </div>
                  <div className="text-xs text-gray-500">{page.url}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(page.visitTime).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    访客: {page.visitorId.slice(-8)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Analytics