import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import useStore from '@/store/useStore';
import { pageLoadAnimation, staggerAnimation, countUpAnimation } from '@/utils/animations';

export default function Home() {
  const { articles, categories, fetchArticles, fetchCategories, loading } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 获取数据
    fetchArticles();
    fetchCategories();
    setIsLoaded(true);
    
    // 页面加载动画
    setTimeout(() => {
      if (heroRef.current) {
        pageLoadAnimation(heroRef.current, 0);
      }
      
      // 交错动画 - 检查元素是否存在
      const articleCards = document.querySelectorAll('.article-card');
      const categoryItems = document.querySelectorAll('.category-item');
      
      if (articleCards.length > 0) {
        staggerAnimation('.article-card', 100);
      }
      
      if (categoryItems.length > 0) {
        staggerAnimation('.category-item', 50);
      }
      
      // 统计数字动画
      const articleCountEl = document.querySelector('.article-count');
      const categoryCountEl = document.querySelector('.category-count');
      
      if (articleCountEl) {
        countUpAnimation(articleCountEl as HTMLElement, articles.length, 1500);
      }
      
      if (categoryCountEl) {
        countUpAnimation(categoryCountEl as HTMLElement, categories.length, 1200);
      }
    }, 500); // 增加延迟确保DOM渲染完成
  }, [fetchArticles, fetchCategories, articles.length, categories.length]);

  const featuredArticles = articles
    .filter(article => article.is_published)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 6);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '未分类';
  };

  // 显示加载状态
  if (loading.articles || loading.categories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        
        <div 
          ref={heroRef}
          className="relative z-10 text-center px-6"
        >
          <h1 
            className="text-6xl md:text-8xl font-bold text-gray-800 mb-6 leading-tight"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            思维的
            <span className="block text-blue-600">碎片</span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
          >
            Fragments of Thoughts
            <span className="block text-base mt-2 text-gray-500">
              记录技术成长路径，分享生活感悟点滴
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/categories"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-compass mr-2"></i>
              探索文章
            </Link>
            
            <button
              onClick={() => {
                const featuredSection = document.getElementById('featured');
                if (featuredSection) {
                  featuredSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="inline-flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
            >
              <i className="fas fa-arrow-down mr-2"></i>
              继续阅读
            </button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <i className="fas fa-chevron-down text-gray-400 text-xl"></i>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section id="featured" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              精选文章
            </h2>
            <p 
              className="text-lg text-gray-600"
              style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
            >
              Featured Articles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <article 
                key={article.id}
                className="article-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                style={{ 
                  transitionDelay: `${index * 100}ms` 
                }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                      {article.categories?.name || getCategoryName(article.category_id)}
                    </span>
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-clock mr-1"></i>
                      {article.read_time} 分钟
                    </span>
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors"
                    style={{ fontFamily: 'Noto Serif SC, serif' }}
                  >
                    <Link to={`/article/${article.id}`}>
                      {article.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-calendar mr-2"></i>
                      {new Date(article.published_at).toLocaleDateString('zh-CN')}
                    </div>
                    
                    <Link
                      to={`/article/${article.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      阅读更多
                      <i className="fas fa-arrow-right ml-2"></i>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              文章分类
            </h2>
            <p 
              className="text-lg text-gray-600"
              style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
            >
              Article Categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="category-item group block p-8 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
                style={{ 
                  transitionDelay: `${(index + 6) * 100}ms` 
                }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <i className="fas fa-folder text-2xl text-blue-600"></i>
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors"
                    style={{ fontFamily: 'Noto Serif SC, serif' }}
                  >
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <i className="fas fa-file-alt mr-2"></i>
                    {category.article_count || 0} 篇文章
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p 
            className="text-lg mb-2"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            个人博客
          </p>
          <p 
            className="text-gray-400"
            style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
          >
            © 2024 Personal Blog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}