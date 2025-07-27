import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead, { generateCategoryStructuredData } from '@/components/SEOHead';
import useStore from '@/store/useStore';
import { useConfig } from '@/contexts/ConfigContext';
import { analytics } from '@/lib/analytics';

export default function Categories() {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const { articles, categories, getArticlesByCategory, fetchArticles, fetchCategories } = useStore();
  const { config: siteConfig } = useConfig();
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    // 跟踪页面访问
    analytics.trackPageView(window.location.pathname, document.title);
    
    const loadData = async () => {
      await fetchArticles();
      await fetchCategories();
      setIsLoaded(true);
    };
    loadData();
  }, [fetchArticles, fetchCategories]);
  
  const selectedCategory = categoryId ? categories.find(cat => cat.id === categoryId) : null;
  
  const displayArticles = categoryId 
    ? getArticlesByCategory(categoryId)
    : articles.filter(article => article.is_published);
  
  const sortedArticles = [...displayArticles].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
    } else {
      comparison = a.title.localeCompare(b.title, 'zh-CN');
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  const getCategoryName = (catId: string) => {
    return categories.find(cat => cat.id === catId)?.name || '未分类';
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      <SEOHead
        title={selectedCategory 
          ? `${selectedCategory.name} - 分类文章 | 思维的碎片`
          : '文章分类 | 思维的碎片'
        }
        description={selectedCategory 
          ? `${selectedCategory.description} - 共有 ${sortedArticles.length} 篇文章`
          : '浏览所有文章分类，发现感兴趣的技术内容和学习资源'
        }
        keywords={selectedCategory 
          ? `${selectedCategory.name},技术分类,编程文章,学习资源`
          : '文章分类,技术博客,编程分类,学习资源'
        }
        ogTitle={selectedCategory 
          ? `${selectedCategory.name} - 分类文章`
          : '文章分类'
        }
        ogDescription={selectedCategory 
          ? `${selectedCategory.description} - 共有 ${sortedArticles.length} 篇文章`
          : '浏览所有文章分类，发现感兴趣的技术内容和学习资源'
        }
        ogUrl={selectedCategory 
          ? `https://nobugcode.com/categories/${selectedCategory.id}`
          : 'https://nobugcode.com/categories'
        }
        canonicalUrl={selectedCategory 
          ? `https://nobugcode.com/categories/${selectedCategory.id}`
          : 'https://nobugcode.com/categories'
        }
        structuredData={selectedCategory 
          ? generateCategoryStructuredData({
              name: selectedCategory.name,
              description: selectedCategory.description,
              url: `https://nobugcode.com/categories/${selectedCategory.id}`,
              articleCount: sortedArticles.length
            })
          : {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "文章分类",
              "description": "浏览所有文章分类，发现感兴趣的技术内容和学习资源",
              "url": "https://nobugcode.com/categories",
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": categories.length,
                "itemListElement": categories.map((cat, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Thing",
                    "name": cat.name,
                    "description": cat.description,
                    "url": `https://nobugcode.com/categories/${cat.id}`
                  }
                }))
              },
              "inLanguage": "zh-CN"
            }
        }
      />
      <Navigation />
      
      <div className="pt-24 pb-16" role="main">
        {/* Header */}
        <header className="max-w-6xl mx-auto px-6 mb-12" role="banner">
          <div className={`transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-8">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                <i className="fas fa-home mr-2"></i>
                首页
              </Link>
              <i className="fas fa-chevron-right mx-3"></i>
              <span className="text-gray-700">
                {selectedCategory ? selectedCategory.name : '所有分类'}
              </span>
            </nav>
            
            <div className="text-center">
              <h1 
                className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'Noto Serif SC, serif' }}
              >
                {selectedCategory ? selectedCategory.name : '文章分类'}
              </h1>
              
              <p 
                className="text-lg text-gray-600 mb-8"
                style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
              >
                {selectedCategory 
                  ? selectedCategory.description 
                  : 'Article Categories'
                }
              </p>
              
              {selectedCategory && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full">
                  <i className="fas fa-file-alt mr-2"></i>
                  {sortedArticles.length} 篇文章
                </div>
              )}
            </div>
          </div>
        </header>
        
        {!selectedCategory ? (
          /* Categories Grid */
          <section className="max-w-6xl mx-auto px-6" aria-labelledby="categories-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className={`group block p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms` 
                  }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                      <i className="fas fa-folder text-3xl text-blue-600"></i>
                    </div>
                    
                    <h2 
                      className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors"
                      style={{ fontFamily: 'Noto Serif SC, serif' }}
                    >
                      {category.name}
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-file-alt mr-2"></i>
                      {category.article_count} 篇文章
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          /* Articles List */
          <section className="max-w-6xl mx-auto px-6" aria-labelledby="articles-content">
            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <span className="text-sm font-medium text-gray-700">排序方式：</span>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">发布时间</option>
                  <option value="title">标题</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} mr-1`}></i>
                  {sortOrder === 'asc' ? '升序' : '降序'}
                </button>
              </div>
              
              <Link
                to="/categories"
                className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                返回分类列表
              </Link>
            </div>
            
            {sortedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sortedArticles.map((article, index) => (
                  <article 
                    key={article.id}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
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
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-file-alt text-3xl text-gray-400"></i>
                </div>
                
                <h3 
                  className="text-xl font-semibold text-gray-600 mb-2"
                  style={{ fontFamily: 'Noto Serif SC, serif' }}
                >
                  暂无文章
                </h3>
                
                <p className="text-gray-500">
                  该分类下还没有发布的文章
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}