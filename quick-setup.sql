-- 快速数据库初始化脚本
-- 解决 404/400 错误：创建必要的表和数据

-- 1. 创建 categories 表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3498DB',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建 articles 表
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT false,
  read_time INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 启用 RLS 并设置公开访问策略
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许公开读取
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for published articles" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Enable read access for users" ON users FOR SELECT USING (true);

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON articles;
DROP POLICY IF EXISTS "Enable update for article authors" ON articles;
DROP POLICY IF EXISTS "Enable delete for article authors" ON articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON users;

-- 允许认证用户对文章进行写操作
CREATE POLICY "Enable insert for authenticated users" ON articles FOR INSERT 
  WITH CHECK (auth.email() IS NOT NULL);

CREATE POLICY "Enable update for article authors" ON articles FOR UPDATE 
  USING (auth.email() IS NOT NULL) 
  WITH CHECK (auth.email() IS NOT NULL);

CREATE POLICY "Enable delete for article authors" ON articles FOR DELETE 
  USING (auth.email() IS NOT NULL);

-- 允许认证用户对分类进行写操作
CREATE POLICY "Enable insert for authenticated users" ON categories FOR INSERT 
  WITH CHECK (auth.email() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON categories FOR UPDATE 
  USING (auth.email() IS NOT NULL) 
  WITH CHECK (auth.email() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON categories FOR DELETE 
  USING (auth.email() IS NOT NULL);

-- 允许认证用户对用户表进行写操作
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT 
  WITH CHECK (auth.email() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON users FOR UPDATE 
  USING (auth.email() IS NOT NULL) 
  WITH CHECK (auth.email() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON users FOR DELETE 
  USING (auth.email() IS NOT NULL);

-- 5. 插入基础数据
INSERT INTO categories (name, description, color, sort_order) VALUES 
('技术分享', '编程技术和开发经验分享', '#3498DB', 1),
('生活随笔', '日常生活感悟和随想', '#2ECC71', 2),
('学习笔记', '学习过程中的记录和总结', '#F39C12', 3),
('项目展示', '个人项目和作品展示', '#E74C3C', 4)
ON CONFLICT (name) DO NOTHING;

-- 插入默认用户
INSERT INTO users (email, display_name, role) VALUES 
('admin@blog.com', '博客管理员', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 6. 创建增加浏览量的函数
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles 
  SET view_count = view_count + 1 
  WHERE id = article_id AND is_published = true;
END;
$$;

-- 插入示例文章
WITH admin_user AS (SELECT id FROM users WHERE email = 'admin@blog.com' LIMIT 1),
     tech_category AS (SELECT id FROM categories WHERE name = '技术分享' LIMIT 1),
     life_category AS (SELECT id FROM categories WHERE name = '生活随笔' LIMIT 1)
INSERT INTO articles (title, content, excerpt, category_id, author_id, is_published, published_at)
SELECT * FROM (
  SELECT 
    '欢迎来到我的博客',
    '# 欢迎来到我的博客\n\n这是第一篇文章，用于测试博客系统功能。',
    '欢迎来到我的个人博客，这里分享技术和生活。',
    tech_category.id,
    admin_user.id,
    true,
    NOW()
  FROM admin_user, tech_category
  WHERE NOT EXISTS (SELECT 1 FROM articles WHERE title = '欢迎来到我的博客')
  
  UNION ALL
  
  SELECT 
    'Markdown格式测试文章',
    '# Markdown格式测试\n\n## 二级标题\n\n### 三级标题\n\n这是一个**粗体文本**和*斜体文本*的示例。\n\n#### 代码示例\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```\n\n#### 列表示例\n\n- 无序列表项1\n- 无序列表项2\n  - 嵌套列表项\n\n1. 有序列表项1\n2. 有序列表项2\n\n#### 引用示例\n\n> 这是一个引用块\n> 可以包含多行内容\n\n#### 链接和图片\n\n[这是一个链接](https://example.com)\n\n#### 表格示例\n\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 数据1 | 数据2 | 数据3 |\n| 数据4 | 数据5 | 数据6 |\n\n#### 分割线\n\n---\n\n#### 内联代码\n\n使用 `console.log()` 来输出信息。\n\n#### 任务列表\n\n- [x] 已完成的任务\n- [ ] 未完成的任务',
    '这是一篇用于测试各种Markdown格式的文章，包含标题、代码、列表、引用等元素。',
    tech_category.id,
    admin_user.id,
    true,
    NOW() - INTERVAL '1 day'
  FROM admin_user, tech_category
  WHERE NOT EXISTS (SELECT 1 FROM articles WHERE title = 'Markdown格式测试文章')
) AS new_articles;