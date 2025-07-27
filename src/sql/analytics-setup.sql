-- 简单统计系统数据库表结构
-- 创建访问记录表
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_title TEXT,
  visitor_id TEXT NOT NULL, -- 访客唯一标识
  session_id TEXT NOT NULL, -- 会话标识
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  visit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER DEFAULT 0, -- 停留时间（秒）
  is_bounce BOOLEAN DEFAULT false, -- 是否跳出
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建页面统计汇总表
CREATE TABLE IF NOT EXISTS page_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL UNIQUE,
  page_title TEXT,
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- 总停留时间
  bounce_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建每日统计表
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建统计配置表
CREATE TABLE IF NOT EXISTS analytics_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认配置
INSERT INTO analytics_config (key, value, description) VALUES
('analytics_enabled', 'true', '是否启用统计功能'),
('data_retention_days', '365', '数据保留天数'),
('track_ip', 'false', '是否记录IP地址'),
('track_user_agent', 'true', '是否记录用户代理'),
('exclude_admin', 'true', '是否排除管理员访问')
ON CONFLICT (key) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_page_visits_url ON page_visits(page_url);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor ON page_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_time ON page_visits(visit_time);
CREATE INDEX IF NOT EXISTS idx_page_stats_url ON page_stats(page_url);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- 创建更新触发器函数
CREATE OR REPLACE FUNCTION update_page_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新页面统计
  INSERT INTO page_stats (page_url, page_title, total_visits, unique_visitors, total_duration, bounce_count, last_visit)
  VALUES (NEW.page_url, NEW.page_title, 1, 1, NEW.duration, CASE WHEN NEW.is_bounce THEN 1 ELSE 0 END, NEW.visit_time)
  ON CONFLICT (page_url) DO UPDATE SET
    total_visits = page_stats.total_visits + 1,
    unique_visitors = (
      SELECT COUNT(DISTINCT visitor_id) 
      FROM page_visits 
      WHERE page_url = NEW.page_url
    ),
    total_duration = page_stats.total_duration + NEW.duration,
    bounce_count = page_stats.bounce_count + CASE WHEN NEW.is_bounce THEN 1 ELSE 0 END,
    last_visit = NEW.visit_time,
    updated_at = NOW();
  
  -- 更新每日统计
  INSERT INTO daily_stats (date, total_visits, unique_visitors, total_duration)
  VALUES (DATE(NEW.visit_time), 1, 1, NEW.duration)
  ON CONFLICT (date) DO UPDATE SET
    total_visits = daily_stats.total_visits + 1,
    unique_visitors = (
      SELECT COUNT(DISTINCT visitor_id) 
      FROM page_visits 
      WHERE DATE(visit_time) = DATE(NEW.visit_time)
    ),
    total_duration = daily_stats.total_duration + NEW.duration,
    bounce_rate = (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE is_bounce = true) * 100.0) / COUNT(*), 2
      )
      FROM page_visits 
      WHERE DATE(visit_time) = DATE(NEW.visit_time)
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_page_stats ON page_visits;
CREATE TRIGGER trigger_update_page_stats
  AFTER INSERT ON page_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_page_stats();

-- 启用 RLS 并创建策略
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_config ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取统计数据（用于公共统计显示）
CREATE POLICY "Allow anonymous read access to page_visits" ON page_visits
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous read access to page_stats" ON page_stats
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous read access to daily_stats" ON daily_stats
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous read access to analytics_config" ON analytics_config
  FOR SELECT TO anon USING (true);

-- 允许匿名用户插入访问记录（用于统计跟踪）
CREATE POLICY "Allow anonymous insert to page_visits" ON page_visits
  FOR INSERT TO anon WITH CHECK (true);

-- 允许认证用户完全访问（用于管理功能）
CREATE POLICY "Allow authenticated full access to page_visits" ON page_visits
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to page_stats" ON page_stats
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to daily_stats" ON daily_stats
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to analytics_config" ON analytics_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 插入一些测试数据
INSERT INTO page_visits (page_url, page_title, visitor_id, session_id, visit_time, duration) VALUES
('/', '首页', 'visitor_1', 'session_1', NOW() - INTERVAL '1 day', 120),
('/', '首页', 'visitor_2', 'session_2', NOW() - INTERVAL '1 day', 90),
('/about', '关于我们', 'visitor_1', 'session_1', NOW() - INTERVAL '1 day', 60),
('/', '首页', 'visitor_3', 'session_3', NOW(), 150),
('/categories', '分类', 'visitor_2', 'session_4', NOW(), 80)
ON CONFLICT DO NOTHING;