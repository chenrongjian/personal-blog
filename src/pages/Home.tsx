import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import SEOHead from '@/components/SEOHead';
import SkeletonLoader from '@/components/SkeletonLoader';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import { 
  pageLoadAnimation, 
  staggerAnimation, 
  countUpAnimation,
  loopingTypewriterAnimation,
  parallaxAnimation,
  scrollTriggerAnimation,
  magneticHoverAnimation,
  particleFloatAnimation
} from '@/utils/animations';
import { useConfig } from '@/contexts/ConfigContext';
import { analytics } from '@/lib/analytics';

export default function Home() {
  const { articles, categories, fetchArticles, fetchCategories, loading } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { config: siteConfig, isLoading: configLoading } = useConfig();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const typewriterCleanupRef = useRef<(() => void) | null>(null);

  // 页面访问跟踪
  useEffect(() => {
    // 跟踪页面访问
    analytics.trackPageView(window.location.pathname, document.title);
  }, []);

  // 优化数据获取 - 并行加载
  useEffect(() => {
    if (!configLoading) {
      // 并行加载数据以提升性能
      Promise.all([
        fetchArticles(),
        fetchCategories()
      ]).finally(() => {
        setIsLoaded(true);
      });
    }
  }, [configLoading, fetchArticles, fetchCategories]);

  // 优化动画初始化 - 延迟非关键动画
  useEffect(() => {
    if (configLoading || !siteConfig.site.typewriterText) {
      return;
    }

    // 滚动进度监听
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // 立即执行关键动画
    let retryTimeoutId: NodeJS.Timeout | null = null;
    
    const initCriticalAnimations = setTimeout(() => {
      if (heroRef.current) {
        pageLoadAnimation(heroRef.current, 0);
      }
      
      // 标题循环打字机效果 - 使用更可靠的元素查找方式
      let retryCount = 0;
      const maxRetries = 5;
      
      const tryInitTypewriter = () => {
        const titleElement = document.querySelector('.typewriter-text') as HTMLElement;
        
        if (titleElement) {
          // 清理之前的动画
          if (typewriterCleanupRef.current) {
            typewriterCleanupRef.current();
          }
          // 启动循环打字机效果，每4秒重复一次
          typewriterCleanupRef.current = loopingTypewriterAnimation(titleElement, siteConfig.site.typewriterText, 80, 4000);
        } else if (retryCount < maxRetries) {
          // 如果元素还没有渲染，1秒后重试，但限制重试次数
          retryCount++;
          retryTimeoutId = setTimeout(tryInitTypewriter, 1000);
        }
      };
      
      // 立即尝试初始化，如果失败会自动重试
      tryInitTypewriter();
    }, 300); // 减少初始延迟
    
    // 延迟初始化非关键动画，减少初始加载压力
    const initNonCriticalAnimations = setTimeout(() => {
      // 视差效果
      if (particlesRef.current) {
        parallaxAnimation(particlesRef.current, 0.3);
        // 粒子浮动动画
        setTimeout(() => {
          particleFloatAnimation('.particle');
        }, 1000);
      }
      
      // 滚动触发动画
      scrollTriggerAnimation('.scroll-trigger');
      
      // 磁性悬停效果
      const magneticElements = document.querySelectorAll('.magnetic');
      magneticElements.forEach(el => {
        magneticHoverAnimation(el as HTMLElement, 0.2);
      });
    }, 1200); // 延迟1.2秒执行非关键动画
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(initCriticalAnimations);
      clearTimeout(initNonCriticalAnimations);
      // 清理重试定时器
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      // 清理打字机动画
      if (typewriterCleanupRef.current) {
        typewriterCleanupRef.current();
        typewriterCleanupRef.current = null;
      }
    };
  }, [configLoading, siteConfig.site.typewriterText]);

  // 处理文章和分类数据变化时的动画更新
  useEffect(() => {
    if (loading.articles || loading.categories || !isLoaded) {
      return;
    }

    // 延迟执行以确保DOM已更新
    const updateAnimations = setTimeout(() => {
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
    }, 100);

    return () => {
      clearTimeout(updateAnimations);
    };
  }, [articles.length, categories.length, loading.articles, loading.categories, isLoaded]);

  const featuredArticles = articles
    .filter(article => article.is_published)
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 6);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '未分类';
  };

  // 显示加载状态
  if (loading.articles || loading.categories) {
    return (
      <main className="min-h-screen bg-gray-50 relative overflow-hidden">
        <Navigation />
        <SkeletonLoader type="page" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 relative overflow-hidden">
      <SEOHead
        title={`${siteConfig.site.title} - ${siteConfig.site.subtitle} | ${siteConfig.site.description}`}
        description={siteConfig.site.description}
        keywords="个人博客,技术博客,编程,前端开发,React,TypeScript,JavaScript,技术分享,学习笔记"
        ogTitle={`${siteConfig.site.title} - ${siteConfig.site.subtitle}`}
        ogDescription={siteConfig.site.description}
        ogUrl="https://nobugcode.com/"
        ogType="website"
        canonicalUrl="https://nobugcode.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": siteConfig.site.title,
          "description": siteConfig.site.description,
          "url": "https://nobugcode.com/",
          "author": {
            "@type": "Person",
            "name": siteConfig.author.name
          },
          "publisher": {
            "@type": "Person",
            "name": siteConfig.author.name
          },
          "inLanguage": "zh-CN",
          "blogPost": featuredArticles.map(article => ({
            "@type": "BlogPosting",
            "headline": article.title,
            "url": `https://nobugcode.com/article/${article.id}`,
            "datePublished": article.published_at,
            "author": {
              "@type": "Person",
              "name": article.author
            }
          }))
        }}
      />
      {/* 滚动进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* 优化后的背景粒子动画 - 减少数量提升性能 */}
      <div 
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-0"
      >
        {[...Array(8)].map((_, i) => (
           <div
             key={i}
             className="particle absolute w-2 h-2 bg-blue-200 rounded-full opacity-15"
             style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               background: `radial-gradient(circle, ${i % 2 === 0 ? '#3B82F6' : '#8B5CF6'}, transparent)`,
               boxShadow: `0 0 ${3 + Math.random() * 4}px ${i % 2 === 0 ? '#3B82F6' : '#8B5CF6'}`
             }}
           />
         ))}
      </div>
      
      <Navigation />
      
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden" role="banner">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        
        <div 
          ref={heroRef}
          className="relative z-10 text-center px-6"
        >
          {!isLoaded ? (
            <SkeletonLoader type="hero" />
          ) : (
            <>
              <h1 
                ref={titleRef}
                className="text-4xl md:text-6xl font-bold text-gray-800 mb-8 leading-tight"
                style={{ fontFamily: 'Noto Serif SC, serif', minHeight: '80px' }}
              >
                <div className="h-12 flex items-center justify-center">
                  <span className="typewriter-text"></span>
                </div>
              </h1>
          
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const categoriesSection = document.querySelector('section[aria-labelledby="categories-title"]');
                    if (categoriesSection) {
                      categoriesSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  className="magnetic inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                  <i className="fas fa-compass mr-2 relative z-10"></i>
                  <span className="relative z-10">{siteConfig.site.exploreButtonText}</span>
                </button>
                
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
                  className="magnetic inline-flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <i className="fas fa-arrow-down mr-2 animate-bounce relative z-10"></i>
                  <span className="relative z-10">{siteConfig.site.continueReadingText}</span>
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
            </div>
            <span className="text-xs text-gray-400 animate-pulse">{siteConfig.site.scrollIndicatorText}</span>
          </div>
        </div>
      </header>

      {/* Featured Articles Section */}
      <section id="featured" className="py-20 px-6" aria-labelledby="featured-title">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-trigger">
            <h2 
              id="featured-title"
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {siteConfig.site.featuredArticlesTitle}
            </h2>
            <p 
              className="text-lg text-gray-600"
              style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
            >
              {siteConfig.site.featuredArticlesTitleEn}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!isLoaded ? (
              <SkeletonLoader type="article" count={6} />
            ) : featuredArticles.length > 0 ? (
              featuredArticles.map((article, index) => (
                <article 
                  key={article.id}
                  className="article-card bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1 group cursor-pointer"
                  style={{ 
                    transitionDelay: `${index * 100}ms` 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px) rotate(1deg) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) rotate(0deg) scale(1)';
                  }}
                >
                  <div className="p-6 relative overflow-hidden">
                    {/* 悬停时的背景光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
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
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <i className="fas fa-calendar mr-2"></i>
                            {new Date(article.published_at).toLocaleDateString('zh-CN')}
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-eye mr-1"></i>
                            {article.view_count || 0}
                          </div>
                        </div>
                        
                        <Link
                          to={`/article/${article.id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 group-hover:translate-x-1"
                        >
                          {siteConfig.site.readMoreText}
                          <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
              </article>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">暂无文章</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6 bg-white relative overflow-hidden" aria-labelledby="categories-title">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 scroll-trigger">
            <h2 
              id="categories-title"
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {siteConfig.site.categoriesTitle}
            </h2>
            <p 
              className="text-lg text-gray-600"
              style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
            >
              {siteConfig.site.categoriesTitleEn}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {!isLoaded ? (
              <SkeletonLoader type="category" count={6} />
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="category-item magnetic group block p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 hover:shadow-lg scroll-trigger relative overflow-hidden"
                  style={{ 
                    transitionDelay: `${(index + 6) * 100}ms` 
                  }}
                >
                  {/* 悬停光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
                      <i className="fas fa-folder text-2xl text-blue-600 transition-transform duration-300 group-hover:scale-110"></i>
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
                      {category.article_count || 0} {siteConfig.site.articlesCountText}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">暂无分类</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}