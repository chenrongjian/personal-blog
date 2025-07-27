import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 公开访问的客户端（用于读取已发布内容和认证操作）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 管理员客户端（用于管理操作，绕过RLS）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 认证客户端使用同一个实例，避免多个 GoTrueClient
export const supabaseAuth = supabase;

// 数据库表名常量
export const TABLES = {
  PAGE_VISITS: 'page_visits',
  PAGE_STATS: 'page_stats',
  DAILY_STATS: 'daily_stats'
} as const

// 统计数据类型定义
export interface PageVisit {
  id?: string
  page_url: string
  page_title?: string
  visitor_id: string
  session_id: string
  user_agent?: string
  referrer?: string
  ip_address?: string
  country?: string
  city?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  screen_resolution?: string
  visit_time?: string
  duration?: number
  is_bounce?: boolean
  created_at?: string
}

export interface PageStats {
  id?: string
  page_url: string
  page_title?: string
  total_visits: number
  unique_visitors: number
  total_duration: number
  bounce_count: number
  last_visit?: string
  created_at?: string
  updated_at?: string
}

export interface DailyStats {
  id?: string
  date: string
  total_visits: number
  unique_visitors: number
  total_duration: number
  bounce_rate: number
  created_at?: string
  updated_at?: string
}

export interface AnalyticsConfig {
  id?: string
  key: string
  value: string
  description?: string
  created_at?: string
  updated_at?: string
}

// 统计概览数据类型
export interface AnalyticsOverview {
  totalVisits: number
  uniqueVisitors: number
  averageDuration: number
  bounceRate: number
  topPages: Array<{
    url: string
    title?: string
    visits: number
    percentage: number
  }>
  dailyTrend: Array<{
    date: string
    visits: number
    visitors: number
  }>
}

// 实时统计数据类型
export interface RealtimeStats {
  activeVisitors: number
  todayVisits: number
  todayVisitors: number
  currentHourVisits: number
  recentPages: Array<{
    url: string
    title?: string
    visitTime: string
    visitorId: string
  }>
}