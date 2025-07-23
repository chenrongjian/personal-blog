import { create } from 'zustand';
import { authApi, articlesApi, categoriesApi } from '../lib/api';
import type { Article, Category, User } from '../lib/api';

interface BlogState {
  // 数据状态
  articles: Article[];
  categories: Category[];
  
  // 认证相关
  isAuthenticated: boolean;
  user: User | null;
  
  // 加载状态
  loading: {
    articles: boolean;
    categories: boolean;
    auth: boolean;
  };
  
  // 错误状态
  error: string | null;
  
  // 文章操作
  fetchArticles: () => Promise<void>;
  fetchArticleById: (id: string) => Promise<Article | null>;
  addArticle: (article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count'>) => Promise<void>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  incrementViewCount: (id: string) => Promise<void>;
  getArticlesByCategory: (categoryId: string) => Article[];
  
  // 分类操作
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'article_count'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // 认证操作
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // 数据迁移
  migrateFromLocalStorage: () => Promise<void>;
  
  // 工具方法
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useStore = create<BlogState>()((set, get) => ({
  // 初始状态
  articles: [],
  categories: [],
  isAuthenticated: false,
  user: null,
  loading: {
    articles: false,
    categories: false,
    auth: false,
  },
  error: null,

  // 工具方法
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // 文章操作
  fetchArticles: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, articles: true }, error: null }));
      const { isAuthenticated } = get();
      const articles = isAuthenticated 
        ? await articlesApi.getAllArticles()
        : await articlesApi.getPublishedArticles();
      set({ articles, loading: { ...get().loading, articles: false } });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取文章失败',
        loading: { ...get().loading, articles: false }
      });
    }
  },

  fetchArticleById: async (id) => {
    try {
      const article = await articlesApi.getArticleById(id);
      if (article) {
        // 更新本地状态中的文章
        set((state) => ({
          articles: state.articles.map(a => a.id === id ? article : a)
        }));
      }
      return article;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取文章详情失败' });
      return null;
    }
  },

  addArticle: async (articleData) => {
    try {
      const newArticle = await articlesApi.createArticle(articleData);
      set((state) => ({ articles: [...state.articles, newArticle] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '创建文章失败' });
      throw error;
    }
  },

  updateArticle: async (id, articleData) => {
    try {
      const updatedArticle = await articlesApi.updateArticle(id, articleData);
      set((state) => ({
        articles: state.articles.map(article =>
          article.id === id ? updatedArticle : article
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新文章失败' });
      throw error;
    }
  },

  deleteArticle: async (id) => {
    try {
      await articlesApi.deleteArticle(id);
      set((state) => ({
        articles: state.articles.filter(article => article.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除文章失败' });
      throw error;
    }
  },

  incrementViewCount: async (id) => {
    try {
      await articlesApi.incrementViewCount(id);
      // 更新本地状态中的浏览量
      set((state) => ({
        articles: state.articles.map(article =>
          article.id === id 
            ? { ...article, view_count: article.view_count + 1 }
            : article
        )
      }));
    } catch (error) {
      // 浏览量更新失败不显示错误，静默处理
      console.error('更新浏览量失败:', error);
    }
  },

  getArticlesByCategory: (categoryId) => {
    return get().articles.filter(article => 
      article.category_id === categoryId && article.is_published
    );
  },

  // 分类操作
  fetchCategories: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, categories: true }, error: null }));
      const categories = await categoriesApi.getCategories();
      set({ categories, loading: { ...get().loading, categories: false } });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取分类失败',
        loading: { ...get().loading, categories: false }
      });
    }
  },

  addCategory: async (categoryData) => {
    try {
      const newCategory = await categoriesApi.createCategory(categoryData);
      set((state) => ({ categories: [...state.categories, newCategory] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '创建分类失败' });
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const updatedCategory = await categoriesApi.updateCategory(id, categoryData);
      set((state) => ({
        categories: state.categories.map(category =>
          category.id === id ? updatedCategory : category
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新分类失败' });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoriesApi.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter(category => category.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除分类失败' });
      throw error;
    }
  },

  // 认证操作
  login: async (email, password) => {
    try {
      set((state) => ({ loading: { ...state.loading, auth: true }, error: null }));
      const result = await authApi.signIn(email, password);
      
      if (result.user) {
        const isAdmin = await authApi.isAdmin();
        if (isAdmin) {
          set({ 
            isAuthenticated: true, 
            user: result.user as User,
            loading: { ...get().loading, auth: false }
          });
          return true;
        } else {
          await authApi.signOut();
          set({ 
            error: '只有管理员可以登录',
            loading: { ...get().loading, auth: false }
          });
          return false;
        }
      }
      
      set({ 
        error: '登录失败',
        loading: { ...get().loading, auth: false }
      });
      return false;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '登录失败',
        loading: { ...get().loading, auth: false }
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.signOut();
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '登出失败' });
    }
  },

  checkAuth: async () => {
    try {
      const user = await authApi.getCurrentUser();
      if (user) {
        const isAdmin = await authApi.isAdmin();
        if (isAdmin) {
          set({ isAuthenticated: true, user: user as User });
        } else {
          set({ isAuthenticated: false, user: null });
        }
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      set({ isAuthenticated: false, user: null });
    }
  },

  // 数据迁移
  migrateFromLocalStorage: async () => {
    try {
      const existingData = localStorage.getItem('blog-storage');
      if (existingData) {
        const { articles, categories } = JSON.parse(existingData);
        
        // 迁移分类
        if (categories && categories.length > 0) {
          for (const category of categories) {
            try {
              await categoriesApi.createCategory({
                name: category.name,
                description: category.description || '',
                color: category.color || '#3498DB',
                sort_order: 0
              });
            } catch (error) {
              console.error('迁移分类失败:', category.name, error);
            }
          }
        }
        
        // 重新获取分类以获得正确的ID映射
        await get().fetchCategories();
        const newCategories = get().categories;
        
        // 迁移文章
        if (articles && articles.length > 0) {
          for (const article of articles) {
            try {
              // 找到对应的新分类ID
              const category = newCategories.find(c => c.name === categories.find(cat => cat.id === article.categoryId)?.name);
              
              await articlesApi.createArticle({
                title: article.title,
                content: article.content,
                excerpt: article.excerpt,
                category_id: category?.id || newCategories[0]?.id,
                is_published: article.isPublished,
                read_time: article.readTime,
                published_at: article.publishedAt
              });
            } catch (error) {
              console.error('迁移文章失败:', article.title, error);
            }
          }
        }
        
        // 清除本地存储
        localStorage.removeItem('blog-storage');
        
        // 重新获取数据
        await get().fetchArticles();
        await get().fetchCategories();
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '数据迁移失败' });
    }
  }
}));

export default useStore;