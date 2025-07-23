import { supabase, supabaseAdmin, supabaseAuth } from './supabase'

// 数据库类型定义
export interface User {
  id: string;
  email?: string;
  role?: 'admin' | 'user';
  display_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color?: string;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  article_count?: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id?: string;
  category_id: string;
  is_published: boolean;
  published_at?: string;
  read_time: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: string;
  categories?: {
    name: string;
    color: string;
  };
  users?: {
    display_name: string;
  };
}

// Insert 和 Update 类型
export type InsertArticle = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'categories' | 'users'>;
export type UpdateArticle = Partial<Omit<Article, 'id' | 'created_at' | 'categories' | 'users'>>;
export type InsertCategory = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCategory = Partial<Omit<Category, 'id' | 'created_at'>>;

// 认证相关
export const authApi = {
  // 管理员登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // 登出
  async signOut() {
    // 完全跳过Supabase的signOut API调用，避免网络错误
    // 仅在本地清除认证状态，由store的logout方法处理
    // 这样可以避免控制台出现net::ERR_ABORTED错误
    return Promise.resolve()
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await supabaseAuth.auth.getUser()
    if (error) throw error
    return user
  },

  // 检查用户是否为管理员
  async isAdmin() {
    const user = await this.getCurrentUser()
    if (!user) return false
    
    // 通过email查找用户，因为Supabase Auth的用户ID与数据库users表的ID可能不同
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()
    
    if (error) return false
    return data?.role === 'admin'
  }
}

// 文章相关API
export const articlesApi = {
  // 获取已发布的文章列表（公开）
  async getPublishedArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, color),
        users(display_name)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    
    if (error) throw error
    return data as Article[]
  },

  // 获取文章详情（公开）
  async getArticleById(id: string) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, color),
        users(display_name)
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single()
    
    if (error) throw error
    
    // 增加浏览量
    await this.incrementViewCount(id)
    
    return data as Article
  },

  // 增加文章浏览量
  async incrementViewCount(id: string) {
    const { error } = await supabase.rpc('increment_view_count', {
      article_id: id
    })
    
    if (error) console.error('Failed to increment view count:', error)
  },

  // 获取分类下的文章（公开）
  async getArticlesByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, color),
        users(display_name)
      `)
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    
    if (error) throw error
    return data as Article[]
  },

  // 管理员获取所有文章
  async getAllArticles() {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        categories(name, color)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Article[]
  },

  // 创建文章（管理员）
  async createArticle(article: InsertArticle) {
    const user = await authApi.getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    // 通过邮箱在 users 表中查找用户 ID
    const { data: dbUsers, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', user.email)
    
    if (userError) {
      throw new Error(`Failed to query users table: ${userError.message}`)
    }
    
    let userId: string
    
    if (!dbUsers || dbUsers.length === 0) {
      // 如果用户不存在，创建用户记录
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
          role: 'admin' // 假设创建文章的用户是管理员
        })
        .select('id')
        .single()
      
      if (createUserError || !newUser) {
        throw new Error(`Failed to create user record: ${createUserError?.message}`)
      }
      
      userId = newUser.id
    } else {
      userId = dbUsers[0].id
    }
    
    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert({
        ...article,
        author_id: userId,
        published_at: article.is_published ? new Date().toISOString() : null
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 更新文章（管理员）
  async updateArticle(id: string, updates: UpdateArticle) {
    // 如果文章被发布且之前未发布，设置发布时间
    if (updates.is_published && !updates.published_at) {
      const { data: currentArticle } = await supabaseAdmin
        .from('articles')
        .select('is_published')
        .eq('id', id)
        .single()
      
      if (currentArticle && !currentArticle.is_published) {
        updates.published_at = new Date().toISOString()
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 删除文章（管理员）
  async deleteArticle(id: string) {
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 分类相关API
export const categoriesApi = {
  // 获取所有分类（公开）
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    // 获取所有已发布文章的分类统计
    const { data: articleCounts } = await supabase
      .from('articles')
      .select('category_id')
      .eq('is_published', true)
    
    // 计算每个分类的文章数量
    const categoryCountMap = new Map()
    if (articleCounts) {
      articleCounts.forEach(article => {
        const categoryId = article.category_id
        categoryCountMap.set(categoryId, (categoryCountMap.get(categoryId) || 0) + 1)
      })
    }
    
    // 为每个分类添加文章数量
    const categoriesWithCount = (data || []).map(category => ({
      ...category,
      article_count: categoryCountMap.get(category.id) || 0
    }))
    
    return categoriesWithCount as Category[]
  },

  // 获取分类详情
  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Category
  },

  // 创建分类（管理员）
  async createCategory(category: InsertCategory) {
    const user = await authApi.getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 更新分类（管理员）
  async updateCategory(id: string, updates: UpdateCategory) {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 删除分类（管理员）
  async deleteCategory(id: string) {
    // 检查是否有文章使用此分类
    const { data: articles } = await supabaseAdmin
      .from('articles')
      .select('id')
      .eq('category_id', id)
      .limit(1)
    
    if (articles && articles.length > 0) {
      throw new Error('Cannot delete category with existing articles')
    }
    
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 网站配置相关API
export const configApi = {
  // 获取网站配置
  async getSiteConfig() {
    const { data, error } = await supabase
      .from('site_config')
      .select('config_value')
      .eq('config_key', 'site_settings')
      .single()
    
    if (error) {
      console.warn('Failed to fetch site config from database, using default')
      // 如果数据库中没有配置，返回默认配置
      return null
    }
    
    return data.config_value
  },

  // 保存网站配置（管理员）
  async saveSiteConfig(config: Record<string, unknown>) {
    // 检查用户是否为管理员
    const isAdmin = await authApi.isAdmin()
    if (!isAdmin) {
      throw new Error('Only administrators can modify site configuration')
    }

    const user = await authApi.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // 通过邮箱在 users 表中查找用户 ID
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()
    
    if (userError || !dbUser) {
      throw new Error('User not found in users table')
    }

    // 先尝试更新现有配置
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('site_config')
      .update({
        config_value: config,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', 'site_settings')
      .select()
      .single()
    
    // 如果更新成功，返回更新后的数据
    if (!updateError && updateData) {
      return updateData
    }
    
    // 如果记录不存在，则插入新记录
    if (updateError && updateError.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('site_config')
        .insert({
          config_key: 'site_settings',
          config_value: config,
          created_by: dbUser.id,
          description: '网站基本配置信息'
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      return insertData
    }
    
    // 其他错误直接抛出
    throw updateError
  },

  // 重置为默认配置（管理员）
  async resetSiteConfig() {
    // 检查用户是否为管理员
    const isAdmin = await authApi.isAdmin()
    if (!isAdmin) {
      throw new Error('Only administrators can reset site configuration')
    }

    // 删除现有配置，让系统使用默认配置
    const { error } = await supabaseAdmin
      .from('site_config')
      .delete()
      .eq('config_key', 'site_settings')
    
    if (error) throw error
    return null
  }
}

// 数据迁移工具
export const migrationApi = {
  // 从LocalStorage迁移数据到Supabase
  async migrateFromLocalStorage() {
    try {
      const existingData = localStorage.getItem('blog-store')
      if (!existingData) {
        console.log('No existing data to migrate')
        return
      }
      
      const { articles, categories } = JSON.parse(existingData)
      
      // 1. 迁移分类
      console.log('Migrating categories...')
      const categoryMap = new Map()
      
      for (const category of categories) {
        const { data } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            description: category.description || '',
            color: category.color || '#3498DB',
            sort_order: category.id
          })
          .select()
          .single()
        
        if (data) {
          categoryMap.set(category.id, data.id)
        }
      }
      
      // 2. 迁移文章
      console.log('Migrating articles...')
      for (const article of articles) {
        const categoryId = categoryMap.get(article.category)
        
        await supabase
          .from('articles')
          .insert({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            category_id: categoryId,
            is_published: true,
            read_time: article.readTime || 5,
            view_count: 0,
            published_at: article.date
          })
      }
      
      console.log('Migration completed successfully')
      
      // 清除LocalStorage数据（可选）
      // localStorage.removeItem('blog-store')
      
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }
}