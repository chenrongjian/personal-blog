import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronUp, Clock, Calendar, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import SEOHead, { generateArticleStructuredData } from '@/components/SEOHead';
import ArticleViews from '@/components/ArticleViews';
import useStore from '@/store/useStore';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Article, Category } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import '@/styles/markdown.css';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { fetchArticleById, articles, categories } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [articleLoading, setArticleLoading] = useState(true);
  
  const [article, setArticle] = useState<Article | null>(null);
  
  useEffect(() => {
    analytics.trackPageView(window.location.pathname, document.title);
    
    const loadArticle = async () => {
      if (id) {
        setArticleLoading(true);
        const fetchedArticle = await fetchArticleById(id);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        }
        setArticleLoading(false);
      }
      setIsLoaded(true);
    };
    
    loadArticle();
  }, [id, fetchArticleById]);
  
  if (articleLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-500">加载中...</p>
        </div>
      </div>
    );
  }
  
  if (!articleLoading && !article) {
    return <Navigate to="/" replace />;
  }
  
  const category = article?.categories || categories.find(cat => cat.id === article?.category_id);
  
  const relatedArticles = articles
    .filter(a => a.category_id === article?.category_id && a.id !== article?.id && a.is_published)
    .slice(0, 3);
  
  const currentIndex = articles.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  
  return (
    <main className="min-h-screen bg-stone-50">
      {article && (
        <SEOHead
          title={`${article.title} | 思维的碎片`}
          description={article.excerpt || `${article.content.substring(0, 160)}...`}
          keywords={`${article.title},${category?.name || ''},技术博客,编程,学习笔记`}
          ogTitle={article.title}
          ogDescription={article.excerpt || `${article.content.substring(0, 160)}...`}
          ogUrl={`https://blog.nobugcode.com/article/${article.id}`}
          ogType="article"
          canonicalUrl={`https://blog.nobugcode.com/article/${article.id}`}
          structuredData={generateArticleStructuredData({
            title: article.title,
            content: article.content,
            author: article.author,
            published_at: article.published_at,
            category: category?.name,
            url: `https://blog.nobugcode.com/article/${article.id}`
          })}
        />
      )}
      <Navigation />
      
      <article className="pt-20 pb-16">
        <header className="max-w-3xl mx-auto px-6 mb-12">
          <div className={`transform transition-all duration-700 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <nav className="flex items-center text-sm text-stone-400 mb-6">
              <Link to="/" className="hover:text-stone-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                首页
              </Link>
              <span className="mx-2">/</span>
              <Link 
                to={`/categories/${(category as Category)?.id || ''}`} 
                className="hover:text-stone-600 transition-colors"
              >
                {category?.name}
              </Link>
            </nav>
            
            <div className="mb-6">
              <span 
                className="inline-block px-3 py-1 text-sm font-medium rounded-full"
                style={{ 
                  backgroundColor: `${category?.color || '#78716c'}15`,
                  color: category?.color || '#78716c'
                }}
              >
                {category?.name}
              </span>
            </div>
            
            <h1 
              className="text-3xl md:text-4xl font-bold text-stone-800 mb-6 leading-tight"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-stone-500 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium text-stone-600">
                  {article.author?.charAt(0) || 'A'}
                </div>
                <span>{article.author}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.published_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{article.read_time} 分钟阅读</span>
              </div>
              
              <ArticleViews 
                articleId={article.id} 
                title={article.title}
                initialViews={article.view_count || 0}
                className="flex items-center gap-1.5"
              />
            </div>
          </div>
        </header>
        
        <section className="max-w-3xl mx-auto px-6">
          <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 p-8 md:p-12 transform transition-all duration-700 delay-200 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <MarkdownRenderer 
              content={article.content}
              className="max-w-none"
            />
          </div>
        </section>
        
        <nav className="max-w-3xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prevArticle && (
              <Link
                to={`/article/${prevArticle.id}`}
                className="group p-5 bg-white rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:-translate-x-1 transition-transform" />
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">上一篇</p>
                    <h3 className="font-medium text-stone-700 group-hover:text-stone-900 transition-colors line-clamp-1">
                      {prevArticle.title}
                    </h3>
                  </div>
                </div>
              </Link>
            )}
            
            {nextArticle && (
              <Link
                to={`/article/${nextArticle.id}`}
                className="group p-5 bg-white rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all duration-300 md:col-start-2"
              >
                <div className="flex items-center justify-end gap-3">
                  <div className="text-right">
                    <p className="text-xs text-stone-400 mb-0.5">下一篇</p>
                    <h3 className="font-medium text-stone-700 group-hover:text-stone-900 transition-colors line-clamp-1">
                      {nextArticle.title}
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        </nav>
        
        {relatedArticles.length > 0 && (
          <section className="max-w-3xl mx-auto px-6 mt-16">
            <h2 
              className="text-xl font-bold text-stone-800 mb-6"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              相关文章
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((relatedArticle, index) => (
                <Link
                  key={relatedArticle.id}
                  to={`/article/${relatedArticle.id}`}
                  className={`block p-5 bg-white rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all duration-300 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <h3 
                    className="font-medium text-stone-700 mb-2 line-clamp-2"
                    style={{ fontFamily: 'Noto Serif SC, serif' }}
                  >
                    {relatedArticle.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(relatedArticle.published_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relatedArticle.read_time} 分钟
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
      
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-sm hover:bg-white border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-700 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="回到顶部"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </main>
  );
}
