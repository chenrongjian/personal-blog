-- 个人博客系统数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 categories 表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3498DB',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. 创建 articles 表
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  read_time INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id, is_published);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- 5. 启用 Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略

-- articles 表权限策略
CREATE POLICY IF NOT EXISTS "Public articles are viewable by everyone" ON articles
  FOR SELECT USING (is_published = true);

CREATE POLICY IF NOT EXISTS "Admins can manage all articles" ON articles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- categories 表权限策略
CREATE POLICY IF NOT EXISTS "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage categories" ON categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- users 表权限策略
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Admins can view all users" ON users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 7. 插入默认管理员账户
-- 注意：密码需要在 Supabase Auth 中创建，这里只是占位
INSERT INTO users (email, password_hash, role, display_name) 
VALUES ('admin@blog.com', 'placeholder_hash', 'admin', '系统管理员')
ON CONFLICT (email) DO NOTHING;

-- 8. 插入默认分类数据
INSERT INTO categories (name, description, color, sort_order) VALUES 
('技术分享', '编程技术和开发经验分享', '#3498DB', 1),
('生活随笔', '日常生活感悟和随想', '#2ECC71', 2),
('学习笔记', '学习过程中的记录和总结', '#F39C12', 3),
('项目展示', '个人项目和作品展示', '#E74C3C', 4)
ON CONFLICT (name) DO NOTHING;

-- 9. 插入示例文章数据
WITH admin_user AS (
  SELECT id FROM users WHERE email = 'admin@blog.com' LIMIT 1
),
tech_category AS (
  SELECT id FROM categories WHERE name = '技术分享' LIMIT 1
),
life_category AS (
  SELECT id FROM categories WHERE name = '生活随笔' LIMIT 1
)
INSERT INTO articles (title, content, excerpt, category_id, author_id, is_published, read_time, published_at) 
SELECT 
  '欢迎来到我的博客',
  '# 欢迎来到我的博客\n\n这是我的第一篇博客文章。在这里，我将分享我的技术学习心得、生活感悟和项目经验。\n\n## 关于我\n\n我是一名热爱技术的开发者，喜欢探索新技术，分享学习经验。\n\n## 博客内容\n\n- 技术分享：编程技巧、框架使用心得\n- 生活随笔：日常思考和感悟\n- 学习笔记：学习过程中的记录\n- 项目展示：个人项目和作品\n\n感谢您的访问，希望我的分享对您有所帮助！',
  '欢迎来到我的个人博客！这里将分享技术心得、生活感悟和学习经验。',
  tech_category.id,
  admin_user.id,
  true,
  3,
  NOW()
FROM admin_user, tech_category
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE title = '欢迎来到我的博客');

-- 插入第二篇示例文章
WITH admin_user AS (
  SELECT id FROM users WHERE email = 'admin@blog.com' LIMIT 1
),
life_category AS (
  SELECT id FROM categories WHERE name = '生活随笔' LIMIT 1
)
INSERT INTO articles (title, content, excerpt, category_id, author_id, is_published, read_time, published_at) 
SELECT 
  '关于写博客这件事',
  '# 关于写博客这件事\n\n最近开始认真考虑写博客这件事。\n\n## 为什么要写博客\n\n1. **记录学习过程**：将学到的知识整理成文字，加深理解\n2. **分享经验**：帮助遇到类似问题的人\n3. **建立个人品牌**：展示技术能力和思考深度\n4. **强迫输出**：输出倒逼输入，促进持续学习\n\n## 写什么内容\n\n- 技术教程和心得\n- 项目开发经验\n- 读书笔记和思考\n- 生活感悟\n\n## 如何坚持\n\n- 设定合理的更新频率\n- 不追求完美，先发布再优化\n- 记录灵感和想法\n- 与读者互动，获得反馈\n\n希望能够坚持下去，与大家分享更多有价值的内容！',
  '分享我对写博客的思考：为什么要写、写什么内容、如何坚持等。',
  life_category.id,
  admin_user.id,
  true,
  5,
  NOW() - INTERVAL '1 day'
FROM admin_user, life_category
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE title = '关于写博客这件事');

-- 10. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. 为表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成数据库初始化
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本