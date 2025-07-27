import { supabase, TABLES, type AnalyticsOverview, type RealtimeStats, type PageStats, type DailyStats } from '../lib/supabase'

// 统计API服务类
export class AnalyticsAPI {
  // 获取基本统计数据
  static async getAnalyticsData(): Promise<{ totalViews: number; todayViews: number; totalArticles: number; totalCategories: number; popularArticles: Array<{id: string, title: string, views: number}>; viewsTrend: Array<{date: string, views: number}> }> {
    try {
      // 获取总访问量
      const { data: totalVisitsData, error: totalError } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('id', { count: 'exact' })
      
      if (totalError) {
        console.error('获取总访问量失败:', totalError);
        throw totalError;
      }
      
      const totalViews = totalVisitsData?.length || 0;
      
      // 获取今日访问量
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const { data: todayVisitsData, error: todayError } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('id', { count: 'exact' })
        .gte('visit_time', todayStart.toISOString())
      
      if (todayError) {
        console.error('获取今日访问量失败:', todayError);
        throw todayError;
      }
      
      const todayViews = todayVisitsData?.length || 0;
      
      // 获取文章总数（模拟数据，实际应从articles表获取）
      const totalArticles = 0;
      
      // 获取分类总数（模拟数据，实际应从categories表获取）
      const totalCategories = 0;
      
      // 获取热门文章（模拟数据）
      const popularArticles: Array<{id: string, title: string, views: number}> = [];
      
      // 获取访问趋势（最近7天）
      const viewsTrend: Array<{date: string, views: number}> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const { data: dayVisits } = await supabase
          .from(TABLES.PAGE_VISITS)
          .select('id', { count: 'exact' })
          .gte('visit_time', dayStart.toISOString())
          .lt('visit_time', dayEnd.toISOString())
        
        viewsTrend.push({
          date: dateStr,
          views: dayVisits?.length || 0
        });
      }
      
      const result = {
        totalViews,
        todayViews,
        totalArticles,
        totalCategories,
        popularArticles,
        viewsTrend
      };
      
      return result;
    } catch (error) {
      console.error('AnalyticsAPI.getAnalyticsData 查询失败:', error);
      // 返回0值而不是抛出错误
      return {
        totalViews: 0,
        todayViews: 0,
        totalArticles: 0,
        totalCategories: 0,
        popularArticles: [],
        viewsTrend: []
      };
    }
  }
  // 获取统计概览数据
  static async getOverview(days: number = 30): Promise<AnalyticsOverview> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // 获取总访问量和独立访客数
      const { data: totalStats } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('visitor_id, duration, is_bounce')
        .gte('visit_time', startDate.toISOString())
        .lte('visit_time', endDate.toISOString())

      const totalVisits = totalStats?.length || 0
      const uniqueVisitors = new Set(totalStats?.map(v => v.visitor_id)).size
      const totalDuration = totalStats?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0
      const bounceCount = totalStats?.filter(v => v.is_bounce).length || 0
      
      const averageDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0
      const bounceRate = totalVisits > 0 ? Math.round((bounceCount / totalVisits) * 100) : 0

      // 获取热门页面
      const { data: pageStats } = await supabase
        .from(TABLES.PAGE_STATS)
        .select('page_url, page_title, total_visits')
        .order('total_visits', { ascending: false })
        .limit(10)

      const topPages = pageStats?.map(page => ({
        url: page.page_url,
        title: page.page_title || page.page_url,
        visits: page.total_visits,
        percentage: totalVisits > 0 ? Math.round((page.total_visits / totalVisits) * 100) : 0
      })) || []

      // 获取每日趋势
      const { data: dailyStats } = await supabase
        .from(TABLES.DAILY_STATS)
        .select('date, total_visits, unique_visitors')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      const dailyTrend = dailyStats?.map(day => ({
        date: day.date,
        visits: day.total_visits,
        visitors: day.unique_visitors
      })) || []

      return {
        totalVisits,
        uniqueVisitors,
        averageDuration,
        bounceRate,
        topPages,
        dailyTrend
      }
    } catch (error) {
      console.error('获取统计概览失败:', error)
      throw error
    }
  }

  // 获取实时统计数据
  static async getRealtimeStats(): Promise<RealtimeStats> {
    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      // 获取活跃访客数（最近5分钟有访问的）
      const { data: activeVisits } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('visitor_id')
        .gte('visit_time', fiveMinutesAgo.toISOString())

      const activeVisitors = new Set(activeVisits?.map(v => v.visitor_id)).size

      // 获取今日访问数据
      const { data: todayVisits } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('visitor_id')
        .gte('visit_time', todayStart.toISOString())

      const todayVisitsCount = todayVisits?.length || 0
      const todayVisitors = new Set(todayVisits?.map(v => v.visitor_id)).size

      // 获取当前小时访问数
      const { data: currentHourVisits } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('id')
        .gte('visit_time', currentHourStart.toISOString())

      const currentHourVisitsCount = currentHourVisits?.length || 0

      // 获取最近访问页面
      const { data: recentVisits } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('page_url, page_title, visit_time, visitor_id')
        .order('visit_time', { ascending: false })
        .limit(10)

      const recentPages = recentVisits?.map(visit => ({
        url: visit.page_url,
        title: visit.page_title || visit.page_url,
        visitTime: visit.visit_time,
        visitorId: visit.visitor_id
      })) || []

      return {
        activeVisitors,
        todayVisits: todayVisitsCount,
        todayVisitors,
        currentHourVisits: currentHourVisitsCount,
        recentPages
      }
    } catch (error) {
      console.error('获取实时统计失败:', error)
      throw error
    }
  }

  // 获取页面统计详情
  static async getPageStats(limit: number = 50, offset: number = 0): Promise<PageStats[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAGE_STATS)
        .select('*')
        .order('total_visits', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取页面统计失败:', error)
      throw error
    }
  }

  // 获取每日统计数据
  static async getDailyStats(days: number = 30): Promise<DailyStats[]> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from(TABLES.DAILY_STATS)
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取每日统计失败:', error)
      throw error
    }
  }

  // 注意：配置管理已迁移到site_config表，不再使用analytics_config表

  // 清理过期数据
  static async cleanupOldData(): Promise<void> {
    try {
      // 从site_config表获取数据保留天数配置
      const { data: config } = await supabase
        .from('site_config')
        .select('config_value')
        .eq('config_key', 'site_settings')
        .single()

      const retentionDays = config?.config_value?.analytics?.dataRetentionDays || 365
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      
      // 当前时间，用于清理未来日期的异常数据
      const now = new Date()

      // 删除过期的访问记录（早于保留期限的数据）
      const { data: oldVisitsData, error: oldVisitsError } = await supabase
        .from(TABLES.PAGE_VISITS)
        .delete()
        .lt('visit_time', cutoffDate.toISOString())
        .select()

      if (oldVisitsError) {
        console.error('清理过期访问记录失败:', oldVisitsError)
      }
      
      // 删除未来日期的异常访问记录
      const { data: futureVisitsData, error: futureVisitsError } = await supabase
        .from(TABLES.PAGE_VISITS)
        .delete()
        .gt('visit_time', now.toISOString())
        .select()

      if (futureVisitsError) {
        console.error('清理未来日期访问记录失败:', futureVisitsError)
      }

      // 删除过期的每日统计
      const { error: oldDailyError } = await supabase
        .from(TABLES.DAILY_STATS)
        .delete()
        .lt('date', cutoffDate.toISOString().split('T')[0])

      if (oldDailyError) {
        console.error('清理过期每日统计失败:', oldDailyError)
      }
      
      // 删除未来日期的异常每日统计
      const { error: futureDailyError } = await supabase
        .from(TABLES.DAILY_STATS)
        .delete()
        .gt('date', now.toISOString().split('T')[0])

      if (futureDailyError) {
        console.error('清理未来日期每日统计失败:', futureDailyError)
      }
    } catch (error) {
      console.error('数据清理失败:', error)
      throw error
    }
  }

  // 获取统计摘要
  static async getSummary(): Promise<{
    totalVisits: number
    totalVisitors: number
    totalPages: number
    averageSessionDuration: number
  }> {
    try {
      // 获取总访问量
      const { count: totalVisits } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('*', { count: 'exact', head: true })

      // 获取独立访客数
      const { data: visitors } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('visitor_id')

      const totalVisitors = new Set(visitors?.map(v => v.visitor_id)).size

      // 获取页面数
      const { count: totalPages } = await supabase
        .from(TABLES.PAGE_STATS)
        .select('*', { count: 'exact', head: true })

      // 获取平均会话时长
      const { data: sessions } = await supabase
        .from(TABLES.PAGE_VISITS)
        .select('session_id, duration')

      const sessionDurations = new Map<string, number>()
      sessions?.forEach(visit => {
        const current = sessionDurations.get(visit.session_id) || 0
        sessionDurations.set(visit.session_id, current + (visit.duration || 0))
      })

      const totalSessionDuration = Array.from(sessionDurations.values()).reduce((sum, duration) => sum + duration, 0)
      const averageSessionDuration = sessionDurations.size > 0 ? Math.round(totalSessionDuration / sessionDurations.size) : 0

      return {
        totalVisits: totalVisits || 0,
        totalVisitors,
        totalPages: totalPages || 0,
        averageSessionDuration
      }
    } catch (error) {
      console.error('获取统计摘要失败:', error)
      throw error
    }
  }
}

export default AnalyticsAPI