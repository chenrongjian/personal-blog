import React, { useEffect, useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { analytics } from '@/lib/analytics';

interface ArticleViewsProps {
  articleId: string;
  title?: string;
  className?: string;
  showIcon?: boolean;
}

const ArticleViews: React.FC<ArticleViewsProps> = ({
  articleId,
  title,
  className = '',
  showIcon = true
}) => {
  const { config } = useConfig();
  const [views, setViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // 如果未启用文章阅读量显示，则不渲染
  if (!config.analytics?.showViewsOnArticles) {
    return null;
  }

  // 如果没有配置 GA ID，则不显示
  if (!config.analytics?.gaTrackingId) {
    return null;
  }

  useEffect(() => {
    const trackAndGetViews = async () => {
      try {
        // 跟踪文章阅读事件
        analytics.trackArticleView(articleId, title || '');
        
        // 模拟获取阅读量（实际项目中需要从 GA API 获取）
        // 这里使用本地存储模拟数据
        const storageKey = `article_views_${articleId}`;
        const storedViews = localStorage.getItem(storageKey);
        
        if (storedViews) {
          const viewData = JSON.parse(storedViews);
          setViews(viewData.count || 0);
        } else {
          // 初始化阅读量（随机生成一个基础数值）
          const initialViews = Math.floor(Math.random() * 100) + 10;
          setViews(initialViews);
          localStorage.setItem(storageKey, JSON.stringify({
            count: initialViews,
            lastUpdated: Date.now()
          }));
        }
        
        // 增加阅读量
        const newViews = views + 1;
        setViews(newViews);
        localStorage.setItem(storageKey, JSON.stringify({
          count: newViews,
          lastUpdated: Date.now()
        }));
        
      } catch (error) {
        console.error('Error tracking article views:', error);
      } finally {
        setIsLoading(false);
      }
    };

    trackAndGetViews();
  }, [articleId, title]);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`}>
        {showIcon && <i className="fas fa-spinner fa-spin"></i>}
        <span>加载中...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}>
      {showIcon && <i className="fas fa-eye text-blue-500"></i>}
      <span>{views.toLocaleString()} 次阅读</span>
    </div>
  );
};

export default ArticleViews;