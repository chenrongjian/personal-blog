import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import SEOHead, { generateArticleStructuredData } from '@/components/SEOHead';
import ArticleViews from '@/components/ArticleViews';
import useStore from '@/store/useStore';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Article, Category } from '@/lib/api';
import '@/styles/markdown.css';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { fetchArticleById, incrementViewCount, articles, categories } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [articleLoading, setArticleLoading] = useState(true);
  
  const [article, setArticle] = useState<Article | null>(null);
  
  useEffect(() => {
    const loadArticle = async () => {
      if (id) {
        setArticleLoading(true);
        const fetchedArticle = await fetchArticleById(id);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
          await incrementViewCount(id);
        }
        setArticleLoading(false);
      }
      setIsLoaded(true);
    };
    
    loadArticle();
  }, [id, fetchArticleById, incrementViewCount]);
  
  // 显示加载状态
  if (articleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 文章不存在时重定向
  if (!articleLoading && !article) {
    return <Navigate to="/" replace />;
  }
  
  const category = article?.categories || categories.find(cat => cat.id === article?.category_id);
  
  // 获取相关文章（同分类的其他文章）
  const relatedArticles = articles
    .filter(a => a.category_id === article?.category_id && a.id !== article?.id && a.is_published)
    .slice(0, 3);
  
  // 获取上一篇和下一篇文章
  const currentIndex = articles.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  
  return (
    <main className="min-h-screen bg-gray-50">
      {article && (
        <SEOHead
          title={`${article.title} | 思维的碎片`}
          description={article.excerpt || `${article.content.substring(0, 160)}...`}
          keywords={`${article.title},${category?.name || ''},技术博客,编程,学习笔记`}
          ogTitle={article.title}
          ogDescription={article.excerpt || `${article.content.substring(0, 160)}...`}
          ogUrl={`https://nobugcode.com/article/${article.id}`}
          ogType="article"
          canonicalUrl={`https://nobugcode.com/article/${article.id}`}
          structuredData={generateArticleStructuredData({
            title: article.title,
            content: article.content,
            author: article.author,
            published_at: article.published_at,
            category: category?.name,
            url: `https://nobugcode.com/article/${article.id}`
          })}
        />
      )}
      <Navigation />
      
      <article className="pt-24 pb-16">
        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-6 mb-12" role="banner">
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
              <Link 
                to={`/categories/${(category as Category)?.id || ''}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {category?.name}
              </Link>
              <i className="fas fa-chevron-right mx-3"></i>
              <span className="text-gray-700">文章详情</span>
            </nav>
            
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-full">
                {category?.name}
              </span>
            </div>
            
            {/* Title */}
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {article.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <div className="flex items-center">
                <i className="fas fa-user mr-2"></i>
                <span>{article.author}</span>
              </div>
              
              <div className="flex items-center">
                <i className="fas fa-calendar mr-2"></i>
                <span>{new Date(article.published_at).toLocaleDateString('zh-CN')}</span>
              </div>
              
              <div className="flex items-center">
                <i className="fas fa-clock mr-2"></i>
                <span>{article.read_time} 分钟阅读</span>
              </div>
              
              <ArticleViews 
                articleId={article.id} 
                title={article.title}
                className="flex items-center"
              />
            </div>
          </div>
        </header>
        
        {/* Article Content */}
        <section className="max-w-4xl mx-auto px-6">
          <div className={`bg-white rounded-xl shadow-sm p-8 md:p-12 transform transition-all duration-1000 delay-300 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <MarkdownRenderer 
              content={article.content}
              className="max-w-none"
            />
          </div>
        </section>
        
        {/* Navigation */}
        <nav className="max-w-4xl mx-auto px-6 mt-12" aria-label="文章导航">
          <div className="flex flex-col md:flex-row gap-4">
            {prevArticle && (
              <Link
                to={`/article/${prevArticle.id}`}
                className="flex-1 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center">
                  <i className="fas fa-chevron-left text-blue-600 mr-3 group-hover:-translate-x-1 transition-transform"></i>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">上一篇</p>
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {prevArticle.title}
                    </h3>
                  </div>
                </div>
              </Link>
            )}
            
            {nextArticle && (
              <Link
                to={`/article/${nextArticle.id}`}
                className="flex-1 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group text-right"
              >
                <div className="flex items-center justify-end">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">下一篇</p>
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {nextArticle.title}
                    </h3>
                  </div>
                  <i className="fas fa-chevron-right text-blue-600 ml-3 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </Link>
            )}
          </div>
        </nav>
        
        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 mt-16" aria-labelledby="related-articles-title">
            <h2 
              id="related-articles-title"
              className="text-3xl font-bold text-gray-800 mb-8"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              相关文章
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle, index) => (
                <Link
                  key={relatedArticle.id}
                  to={`/article/${relatedArticle.id}`}
                  className={`block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: `${(index + 1) * 200}ms` 
                  }}
                >
                  <h3 
                    className="font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors"
                    style={{ fontFamily: 'Noto Serif SC, serif' }}
                  >
                    {relatedArticle.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {relatedArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      <i className="fas fa-calendar mr-1"></i>
                      {new Date(relatedArticle.published_at).toLocaleDateString('zh-CN')}
                    </span>
                    <span>
                      <i className="fas fa-clock mr-1"></i>
                      {relatedArticle.read_time} 分钟
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
      
      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="回到顶部"
      >
        <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
      </button>
    </main>
  );
}