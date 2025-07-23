# 数据库设置指南

## 问题描述

当前页面出现以下错误：
- `404 Error`: `/rest/v1/articles` 和 `/rest/v1/categories` 接口返回404
- `400 Error`: 数据库查询失败

**原因**: Supabase 数据库中缺少必要的数据表（`articles`, `categories`, `users`）

## 解决方案

### 步骤 1: 登录 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 登录您的账户
3. 选择项目：`ddmunqnxwfdfptlejhow`

### 步骤 2: 执行数据库初始化脚本

1. 在 Supabase Dashboard 中，点击左侧菜单的 **"SQL Editor"**
2. 点击 **"New Query"** 创建新查询
3. 复制 `quick-setup.sql` 文件的全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **"Run"** 按钮执行脚本

### 步骤 3: 验证表创建

执行完脚本后，检查以下内容：

1. 在左侧菜单点击 **"Table Editor"**
2. 确认已创建以下表：
   - `categories` (4条记录)
   - `users` (1条记录)
   - `articles` (1条记录)

### 步骤 4: 检查 RLS 策略

1. 在 **"Authentication"** > **"Policies"** 中
2. 确认每个表都有相应的 RLS 策略
3. 确保公开读取策略已启用

### 步骤 5: 测试 API 接口

在浏览器中测试以下 URL：

```
# 测试分类接口
https://ddmunqnxwfdfptlejhow.supabase.co/rest/v1/categories?select=*&order=sort_order.asc

# 测试文章接口
https://ddmunqnxwfdfptlejhow.supabase.co/rest/v1/articles?select=*,categories(name,color),users(display_name)&is_published=eq.true&order=published_at.desc
```

**请求头设置**：
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbXVucW54d2ZkZnB0bGVqaG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTY0OTQsImV4cCI6MjA2ODc3MjQ5NH0.1R4GySP1wuWZB3lALunNpl_8R2Fr5lfEWe0OjFA51P4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbXVucW54d2ZkZnB0bGVqaG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTY0OTQsImV4cCI6MjA2ODc3MjQ5NH0.1R4GySP1wuWZB3lALunNpl_8R2Fr5lfEWe0OjFA51P4
```

## 预期结果

执行完成后，您应该看到：

1. **分类接口返回**：
```json
[
  {
    "id": "uuid",
    "name": "技术分享",
    "description": "编程技术和开发经验分享",
    "color": "#3498DB",
    "sort_order": 1
  },
  // ... 其他分类
]
```

2. **文章接口返回**：
```json
[
  {
    "id": "uuid",
    "title": "欢迎来到我的博客",
    "content": "# 欢迎来到我的博客...",
    "excerpt": "欢迎来到我的个人博客...",
    "is_published": true,
    "categories": {
      "name": "技术分享",
      "color": "#3498DB"
    },
    "users": {
      "display_name": "博客管理员"
    }
  }
]
```

## 故障排除

### 如果仍然出现 404 错误：

1. 检查 Supabase 项目 URL 是否正确
2. 确认 API 密钥是否有效
3. 验证表名是否正确（区分大小写）

### 如果出现权限错误：

1. 检查 RLS 策略是否正确设置
2. 确认公开读取策略已启用
3. 验证 API 密钥权限

### 如果数据为空：

1. 检查插入语句是否执行成功
2. 确认 `is_published = true` 的文章存在
3. 验证外键关联是否正确

## 完成后

数据库设置完成后，刷新您的博客页面，404 和 400 错误应该消失，页面应该能正常显示文章和分类数据。

如果遇到问题，请检查浏览器控制台的详细错误信息，并参考上述故障排除步骤。