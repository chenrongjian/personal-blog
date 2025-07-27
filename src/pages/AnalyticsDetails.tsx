import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { Calendar, Filter, Download, RefreshCw, Search, ArrowUpDown } from 'lucide-react'
import AnalyticsAPI from '../utils/analyticsApi'
import type { PageStats, DailyStats } from '../lib/supabase'

interface FilterOptions {
  dateRange: number
  sortBy: 'visits' | 'visitors' | 'duration' | 'bounce_rate'
  sortOrder: 'asc' | 'desc'
  searchTerm: string
}

const AnalyticsDetails: React.FC = () => {
  const [pageStats, setPageStats] = useState<PageStats[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 30,
    sortBy: 'visits',
    sortOrder: 'desc',
    searchTerm: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [pageData, dailyData] = await Promise.all([
        AnalyticsAPI.getPageStats(100, 0), // 获取更多页面数据用于筛选
        AnalyticsAPI.getDailyStats(filters.dateRange)
      ])
      
      setPageStats(pageData)
      setDailyStats(dailyData)
    } catch (err) {
      console.error('加载详细统计失败:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters.dateRange])

  // 筛选和排序页面数据
  const filteredPageStats = React.useMemo(() => {
    let filtered = pageStats.filter(page => 
      page.page_url.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (page.page_title && page.page_title.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    )

    // 排序
    filtered.sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (filters.sortBy) {
        case 'visits':
          aValue = a.total_visits
          bValue = b.total_visits
          break
        case 'visitors':
          aValue = a.unique_visitors
          bValue = b.unique_visitors
          break
        case 'duration':
          aValue = a.total_duration / Math.max(a.total_visits, 1)
          bValue = b.total_duration / Math.max(b.total_visits, 1)
          break
        case 'bounce_rate':
          aValue = (a.bounce_count / Math.max(a.total_visits, 1)) * 100
          bValue = (b.bounce_count / Math.max(b.total_visits, 1)) * 100
          break
        default:
          aValue = a.total_visits
          bValue = b.total_visits
      }
      
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [pageStats, filters.searchTerm, filters.sortBy, filters.sortOrder])

  // 分页数据
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredPageStats.slice(startIndex, startIndex + pageSize)
  }, [filteredPageStats, currentPage, pageSize])

  const totalPages = Math.ceil(filteredPageStats.length / pageSize)

  // 格式化时间
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${Math.round(seconds % 60)}秒`
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`
  }

  // 格式化日期
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 导出数据
  const exportData = () => {
    const csvContent = [
      ['页面URL', '页面标题', '访问量', '独立访客', '平均停留时间', '跳出率', '最后访问时间'],
      ...filteredPageStats.map(page => [
        page.page_url,
        page.page_title || '',
        page.total_visits.toString(),
        page.unique_visitors.toString(),
        formatDuration(page.total_duration / Math.max(page.total_visits, 1)),
        `${Math.round((page.bounce_count / Math.max(page.total_visits, 1)) * 100)}%`,
        page.last_visit ? new Date(page.last_visit).toLocaleString() : ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analytics-details-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载详细统计中...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">详细统计</h1>
          <p className="text-gray-600">深入分析网站访问数据和页面性能</p>
        </div>

        {/* 筛选控制栏 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 时间范围选择 */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: parseInt(e.target.value) }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>最近7天</option>
                <option value={30}>最近30天</option>
                <option value={90}>最近90天</option>
                <option value={365}>最近一年</option>
              </select>
            </div>

            {/* 搜索框 */}
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索页面..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 排序选择 */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-5 w-5 text-gray-400" />
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder]
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="visits-desc">访问量 (高到低)</option>
                <option value="visits-asc">访问量 (低到高)</option>
                <option value="visitors-desc">访客数 (高到低)</option>
                <option value="visitors-asc">访客数 (低到高)</option>
                <option value="duration-desc">停留时间 (长到短)</option>
                <option value="duration-asc">停留时间 (短到长)</option>
                <option value="bounce_rate-desc">跳出率 (高到低)</option>
                <option value="bounce_rate-asc">跳出率 (低到高)</option>
              </select>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={loadData}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>刷新</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>导出</span>
              </button>
            </div>
          </div>
        </div>

        {/* 每日趋势图表 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">每日访问趋势</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dailyStats.reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => `日期: ${value}`}
                formatter={(value, name) => {
                  if (name === 'bounce_rate') return [`${value}%`, '跳出率']
                  return [value, name === 'total_visits' ? '访问量' : name === 'unique_visitors' ? '访客数' : '停留时间']
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="total_visits" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="total_visits" />
              <Area yAxisId="left" type="monotone" dataKey="unique_visitors" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="unique_visitors" />
              <Line yAxisId="right" type="monotone" dataKey="bounce_rate" stroke="#ef4444" strokeWidth={2} name="bounce_rate" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 页面统计表格 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">页面统计详情</h3>
            <p className="text-sm text-gray-600 mt-1">
              共 {filteredPageStats.length} 个页面，显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredPageStats.length)} 项
            </p>
          </div>
          
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
                    独立访客
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均停留
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    跳出率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后访问
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((page, index) => {
                  const avgDuration = page.total_duration / Math.max(page.total_visits, 1)
                  const bounceRate = (page.bounce_count / Math.max(page.total_visits, 1)) * 100
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {page.page_title || page.page_url}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {page.page_url}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {page.total_visits.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {page.unique_visitors.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(avgDuration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bounceRate > 70 ? 'bg-red-100 text-red-800' :
                          bounceRate > 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {Math.round(bounceRate)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page.last_visit ? new Date(page.last_visit).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDetails