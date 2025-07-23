import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 公开访问的客户端（用于读取已发布内容）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 管理员客户端（用于管理操作，绕过RLS）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 认证专用客户端（用于登录、登出等认证操作）
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);