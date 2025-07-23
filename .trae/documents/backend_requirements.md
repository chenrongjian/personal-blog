# 个人博客系统后端需求文档

## 1. 后端架构概述

本博客系统采用 Supabase 作为后端解决方案，提供数据库、认证、实时功能和 API 服务。

* **数据库**：PostgreSQL (Supabase 托管)

* **认证系统**：Supabase Auth

* **API 接口**：Supabase 自动生成的 RESTful API

* **实时功能**：Supabase Realtime (可选)

* **文件存储**：Supabase Storage (如需图片上传)

## 2. 数据库设计

### 2.1 数据表结构

#### users 表 (用户管理)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### categories 表 (文章分类)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3498DB',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

#### articles 表 (文章内容)

```sql
CREATE TABLE articles (
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
```

### 2.2 索引优化

```sql
-- 文章查询优化
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX idx_articles_category ON articles(category_id, is_published);
CREATE INDEX idx_articles_author ON articles(author_id);

-- 分类查询优化
CREATE INDEX idx_categories_sort ON categories(sort_order);
```

### 2.3 初始化数据

#### 默认管理员账户

```sql
INSERT INTO users (email, password_hash, role, display_name) VALUES 
('admin@blog.com', '$2b$10$...', 'admin', '系统管理员');
```

#### 默认分类

```sql
INSERT INTO categories (name, description, color, sort_order) VALUES 
('技术分享', '编程技术和开发经验分享', '#3498DB', 1),
('生活随笔', '日常生活感悟和随想', '#2ECC71', 2),
('学习笔记', '学习过程中的记录和总结', '#F39C12', 3),
('项目展示', '个人项目和作品展示', '#E74C3C', 4);
```

## 3. API 接口规范

### 3.1 认证接口

#### 管理员登录

```
POST /auth/v1/token
Content-Type: application/json

{
  "email": "admin@blog.com",
  "password": "password"
}

Response:
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "admin@blog.com",
    "role": "admin"
  }
}
```

#### 登出

```
POST /auth/v1/logout
Authorization: Bearer {token}
```

### 3.2 文章管理接口

#### 获取文章列表 (公开)

```
GET /rest/v1/articles?select=*,categories(name,color)&is_published=eq.true&order=published_at.desc

Response:
[
  {
    "id": "uuid",
    "title": "文章标题",
    "excerpt": "文章摘要",
    "published_at": "2024-01-01T00:00:00Z",
    "read_time": 5,
    "view_count": 100,
    "categories": {
      "name": "技术分享",
      "color": "#3498DB"
    }
  }
]
```

#### 获取文章详情 (公开)

```
GET /rest/v1/articles?select=*,categories(name,color),users(display_name)&id=eq.{article_id}&is_published=eq.true

Response:
{
  "id": "uuid",
  "title": "文章标题",
  "content": "文章内容 (Markdown)",
  "excerpt": "文章摘要",
  "published_at": "2024-01-01T00:00:00Z",
  "read_time": 5,
  "view_count": 100,
  "categories": {
    "name": "技术分享",
    "color": "#3498DB"
  },
  "users": {
    "display_name": "作者名称"
  }
}
```

#### 管理员获取所有文章

```
GET /rest/v1/articles?select=*,categories(name)&order=created_at.desc
Authorization: Bearer {admin_token}
```

#### 创建文章 (管理员)

```
POST /rest/v1/articles
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "新文章标题",
  "content": "文章内容 (Markdown)",
  "excerpt": "文章摘要",
  "category_id": "category_uuid",
  "is_published": false,
  "read_time": 5
}
```

#### 更新文章 (管理员)

```
PATCH /rest/v1/articles?id=eq.{article_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "更新的标题",
  "content": "更新的内容",
  "is_published": true,
  "published_at": "2024-01-01T00:00:00Z"
}
```

#### 删除文章 (管理员)

```
DELETE /rest/v1/articles?id=eq.{article_id}
Authorization: Bearer {admin_token}
```

### 3.3 分类管理接口

#### 获取分类列表 (公开)

```
GET /rest/v1/categories?select=*&order=sort_order.asc

Response:
[
  {
    "id": "uuid",
    "name": "技术分享",
    "description": "编程技术和开发经验分享",
    "color": "#3498DB",
    "sort_order": 1
  }
]
```

#### 获取分类下的文章 (公开)

```
GET /rest/v1/articles?select=*&category_id=eq.{category_id}&is_published=eq.true&order=published_at.desc
```

#### 创建分类 (管理员)

```
POST /rest/v1/categories
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "新分类",
  "description": "分类描述",
  "color": "#9B59B6",
  "sort_order": 5
}
```

#### 更新分类 (管理员)

```
PATCH /rest/v1/categories?id=eq.{category_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "更新的分类名",
  "description": "更新的描述"
}
```

#### 删除分类 (管理员)

```
DELETE /rest/v1/categories?id=eq.{category_id}
Authorization: Bearer {admin_token}
```

## 4. 权限控制 (RLS)

### 4.1 Row Level Security 策略

#### articles 表权限

```sql
-- 启用 RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布文章
CREATE POLICY "Public articles are viewable by everyone" ON articles
  FOR SELECT USING (is_published = true);

-- 管理员可以操作所有文章
CREATE POLICY "Admins can manage all articles" ON articles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

#### categories 表权限

```sql
-- 启用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 公开读取所有分类
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- 管理员可以管理分类
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

#### users 表权限

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的信息
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- 管理员可以查看所有用户
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

## 5. Supabase 配置

### 5.1 环境变量

```env
# Supabase 配置
VITE_SUPABASE_URL=https://ddmunqnxwfdfptlejhow.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbXVucW54d2ZkZnB0bGVqaG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTY0OTQsImV4cCI6MjA2ODc3MjQ5NH0.1R4GySP1wuWZB3lALunNpl_8R2Fr5lfEWe0OjFA51P4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbXVucW54d2ZkZnB0bGVqaG93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE5NjQ5NCwiZXhwIjoyMDY4NzcyNDk0fQ.PwPpWnV4iI4TKZemdTcQwOcp8j7Wb9Wu6x7wPKCT1YQ
```

### 5.2 客户端初始化

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 5.3 认证配置

```sql
-- 在 Supabase Dashboard 的 Authentication > Settings 中配置
-- Site URL: http://localhost:5173 (开发环境)
-- Redirect URLs: http://localhost:5173/admin (登录后重定向)
```

## 6. 数据迁移计划

### 6.1 从 LocalStorage 迁移到 Supabase

1. **数据导出**：从现有 Zustand store 导出文章和分类数据
2. **数据清理**：格式化数据以匹配数据库结构
3. **批量导入**：使用 Supabase 客户端批量插入数据
4. **验证测试**：确保数据完整性和功能正常

### 6.2 迁移脚本示例

```typescript
// 迁移脚本
const migrateData = async () => {
  // 1. 导出现有数据
  const existingData = localStorage.getItem('blog-store')
  const { articles, categories } = JSON.parse(existingData)
  
  // 2. 迁移分类
  const { data: categoriesData } = await supabase
    .from('categories')
    .insert(categories.map(cat => ({
      name: cat.name,
      description: cat.description,
      color: cat.color
    })))
    .select()
  
  // 3. 迁移文章
  const { data: articlesData } = await supabase
    .from('articles')
    .insert(articles.map(article => ({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category_id: findCategoryId(article.category),
      is_published: true,
      read_time: article.readTime,
      published_at: article.date
    })))
}
```

## 7. 性能优化

### 7.1 数据库优化

* 使用适当的索引提升查询性能

* 实现分页查询避免大量数据传输

* 使用 Supabase 的缓存机制

### 7.2 API 优化

* 使用 `select` 参数只获取需要的字段

* 实现客户端缓存减少重复请求

* 使用 Supabase Realtime 实现实时更新

### 7.3 安全优化

* 严格的 RLS 策略确保数据安全

* API 密钥的安全管理

* 输入验证和 SQL 注入防护

## 8. 部署和监控

### 8.1 生产环境配置

* 配置生产环境的 Supabase 项目

* 设置正确的域名和重定向 URL

* 配置备份策略

### 8.2 监控指标

* API 请求量和响应时间

* 数据库连接数和查询性能

* 用户认证成功率

* 错误日志和异常监控

