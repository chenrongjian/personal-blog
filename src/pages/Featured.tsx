import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import useStore from '@/store/useStore';
import { useConfig } from '@/contexts/ConfigContext';
import { analytics } from '@/lib/analytics';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function Featured() {
  const { articles, categories, fetchArticles, fetchCategories, loading } = useStore();
  const { config: siteConfig } = useConfig();

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    
    // 记录页面访问
    analytics.trackPageView('/featured', '精彩文章');
  }, [fetchArticles, fetchCategories]);

  // 获取精彩文章（按浏览量排序，与首页保持一致）
  const featuredArticles = articles
    .filter(article => article.is_published)
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 6);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '未分类';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <SEOHead
        title="精彩文章 | 思维的碎片"
        description="精选优质技术文章，涵盖前端开发、后端技术、编程思维等多个领域的深度内容"
        keywords="精彩文章,技术博客,编程文章,前端开发,后端技术,学习资源"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "精彩文章",
          "description": "精选优质技术文章，涵盖前端开发、后端技术、编程思维等多个领域的深度内容",
          "url": "https://nobugcode.com/featured",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": featuredArticles.length,
            "itemListElement": featuredArticles.map((article, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Article",
                "headline": article.title,
                "description": article.excerpt,
                "url": `https://nobugcode.com/article/${article.id}`,
                "datePublished": article.published_at,
                "author": {
                  "@type": "Person",
                  "name": "思维的碎片"
                }
              }
            }))
          }
        }}
      />
      
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              <i className="fas fa-home mr-2"></i>
              首页
            </Link>
            <i className="fas fa-chevron-right mx-3"></i>
            <span className="text-gray-700">精彩文章</span>
          </nav>
          
          <div className="text-center mb-16">
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              精彩文章
            </h1>
            <p 
              className="text-lg text-gray-600 mb-6"
              style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
            >
              Featured Articles
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading.articles ? (
              <SkeletonLoader type="article" count={6} />
            ) : featuredArticles.length > 0 ? (
              featuredArticles.map((article, index) => (
                <article 
                  key={article.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1 group cursor-pointer"
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
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-star text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">暂无精彩文章</h3>
                <p className="text-gray-500">还没有发布任何文章</p>
              </div>
            )}
          </div>


        </div>
      </div>
      
      <Footer />
    </main>
  );
}