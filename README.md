# 思维的碎片 - 个人博客系统

🌐 **在线访问**: [https://nobugcode.com/](https://nobugcode.com/)

一个基于 React + TypeScript + Vite 构建的现代化个人博客系统，采用 Supabase 作为后端服务，支持 Markdown 文章编写和管理。

## ✨ 特性

### 🎨 前端特性
- **现代化设计**: 采用 Tailwind CSS 构建的响应式界面
- **动画效果**: 集成 Anime.js 实现流畅的页面动画
- **打字机效果**: 首页标题的动态打字机展示
- **Markdown 支持**: 完整的 Markdown 渲染，支持代码高亮
- **分类系统**: 文章分类管理和展示
- **搜索功能**: 支持文章标题和内容搜索
- **响应式布局**: 完美适配桌面端和移动端

### 🔧 管理功能
- **文章管理**: 创建、编辑、删除文章
- **分类管理**: 管理文章分类和标签
- **配置管理**: 网站信息、作者信息等配置
- **实时预览**: 文章编辑时的实时 Markdown 预览
- **批量操作**: 支持批量管理文章和分类

### 🛡️ 技术特性
- **TypeScript**: 完整的类型安全
- **状态管理**: 使用 Zustand 进行状态管理
- **路由管理**: React Router 实现的单页应用
- **数据库**: Supabase PostgreSQL 数据库
- **认证系统**: 基于 Supabase Auth 的管理员认证
- **实时更新**: 支持数据的实时同步

## 🚀 技术栈

### 前端技术
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **React Router** - 客户端路由
- **Zustand** - 轻量级状态管理
- **Anime.js** - 动画库
- **Marked** - Markdown 解析器
- **Highlight.js** - 代码语法高亮
- **Sonner** - 优雅的通知组件
- **Lucide React** - 现代图标库

### 后端服务
- **Supabase** - 后端即服务 (BaaS)
- **PostgreSQL** - 关系型数据库
- **Supabase Auth** - 用户认证
- **Supabase Storage** - 文件存储
- **Row Level Security** - 数据安全

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript ESLint** - TypeScript 代码规范
- **PostCSS** - CSS 处理工具
- **Autoprefixer** - CSS 自动前缀

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── BackToTop.tsx   # 返回顶部组件
│   ├── Empty.tsx       # 空状态组件
│   ├── MarkdownRenderer.tsx  # Markdown 渲染器
│   ├── Navigation.tsx  # 导航组件
│   └── ProtectedRoute.tsx    # 路由保护组件
├── pages/              # 页面组件
│   ├── Home.tsx        # 首页
│   ├── ArticleDetail.tsx     # 文章详情页
│   ├── Categories.tsx  # 分类页面
│   ├── AdminLogin.tsx  # 管理员登录
│   ├── ArticleManagement.tsx # 文章管理
│   ├── CategoryManagement.tsx # 分类管理
│   └── ConfigManager.tsx     # 配置管理
├── contexts/           # React Context
│   └── ConfigContext.tsx    # 配置上下文
├── hooks/              # 自定义 Hooks
│   └── useTheme.ts     # 主题 Hook
├── lib/                # 工具库
│   ├── api.ts          # API 接口
│   ├── supabase.ts     # Supabase 配置
│   └── utils.ts        # 工具函数
├── store/              # 状态管理
│   └── useStore.ts     # Zustand Store
├── utils/              # 工具函数
│   └── animations.ts   # 动画工具
├── config/             # 配置文件
│   └── siteConfig.ts   # 网站配置
└── styles/             # 样式文件
    └── markdown.css    # Markdown 样式
```

## 🛠️ 本地开发

### 环境要求
- Node.js 18+
- npm 或 pnpm
- Supabase 账户

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 环境配置
1. 复制 `.env.example` 为 `.env`
2. 配置 Supabase 环境变量：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 数据库设置
1. 在 Supabase 中创建新项目
2. 运行 `setup-database.sql` 创建数据表
3. 运行 `quick-setup.sql` 插入示例数据

### 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本
```bash
npm run build
# 或
pnpm build
```

### 代码检查
```bash
npm run lint
# 或
pnpm lint
```

## 📝 使用说明

### 管理员功能
1. 访问 `/admin/login` 进行管理员登录
2. 登录后可以访问：
   - `/admin/articles` - 文章管理
   - `/admin/categories` - 分类管理
   - `/admin/config` - 网站配置

### 文章编写
- 支持完整的 Markdown 语法
- 支持代码块语法高亮
- 支持文章分类和标签
- 支持文章发布状态控制

### 网站配置
- 网站标题和描述
- 作者信息
- 社交链接
- 导航菜单
- 页脚信息

## 🚀 部署

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台
- 支持任何支持 Node.js 的托管平台
- 需要配置相应的环境变量

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [在线演示](https://nobugcode.com/)
- [Supabase 文档](https://supabase.com/docs)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vite 文档](https://vitejs.dev/)

---

**陈荣健的博客** - 拥抱AI,共同进化 ✨
