-- 网站配置表创建脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 site_config 表
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(config_key);

-- 3. 启用 Row Level Security (RLS)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Site config is viewable by everyone" ON site_config;
DROP POLICY IF EXISTS "Only admins can manage site config" ON site_config;

-- 所有人都可以读取配置
CREATE POLICY "Site config is viewable by everyone" ON site_config
  FOR SELECT USING (true);

-- 只有管理员可以管理配置
CREATE POLICY "Only admins can manage site config" ON site_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 5. 添加更新时间触发器
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 插入默认配置数据
INSERT INTO site_config (config_key, config_value, description) VALUES 
(
  'site_settings',
  '{
    "site": {
      "title": "思维的碎片",
      "titleEn": "Fragments",
      "typewriterText": "思维的碎片",
      "typewriterTextEn": "Fragments of Thoughts",
      "subtitle": "个人博客",
      "subtitleEn": "Fragments of Thoughts",
      "description": "记录技术成长路径，分享生活感悟点滴",
      "exploreButtonText": "探索文章",
      "continueReadingText": "继续阅读",
      "scrollIndicatorText": "滚动探索",
      "featuredArticlesTitle": "精选文章",
      "featuredArticlesTitleEn": "Featured Articles",
      "categoriesTitle": "文章分类",
      "categoriesTitleEn": "Article Categories",
      "readMoreText": "阅读更多",
      "articlesCountText": "篇文章",
      "loadingText": "加载中..."
    },
    "author": {
      "name": "博主",
      "bio": "热爱技术，喜欢分享"
    },
    "navigation": {
      "home": "首页",
      "categories": "分类",
      "admin": "管理",
      "login": "登录",
      "logout": "退出"
    },
    "social": {
      "github": "",
      "twitter": "",
      "linkedin": "",
      "email": ""
    },
    "settings": {
      "showAuthor": true,
      "showSocial": false,
      "enableComments": false,
      "postsPerPage": 10
    },
    "footer": {
      "copyright": "© 2024 Personal Blog. All rights reserved."
    }
  }',
  '网站基本配置信息'
)
ON CONFLICT (config_key) DO NOTHING;

-- 完成配置表创建
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本