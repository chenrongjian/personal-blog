import React, { useEffect, useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { analytics } from '@/lib/analytics';
import { articlesApi } from '@/lib/api';

interface ArticleViewsProps {
  articleId: string;
  title?: string;
  initialViews?: number; // 从文章详情中传入的初始阅读量
  className?: string;
  showIcon?: boolean;
}

const ArticleViews: React.FC<ArticleViewsProps> = ({
  articleId,
  title,
  initialViews = 0,
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
        
        // 使用传入的初始阅读量
        setViews(initialViews);
        
        // 检查是否在短时间内重复访问（防止刷新页面导致的重复计数）
        const sessionKey = `article_viewed_${articleId}_time`;
        const lastViewTime = sessionStorage.getItem(sessionKey);
        const now = Date.now();
        const cooldownPeriod = 30 * 1000; // 30秒冷却期
        
        if (!lastViewTime || (now - parseInt(lastViewTime)) > cooldownPeriod) {
          // 增加阅读量（超过冷却期后才计数）
          await articlesApi.incrementViewCount(articleId);
          sessionStorage.setItem(sessionKey, now.toString());
          
          // 更新显示的阅读量（乐观更新）
          setViews(initialViews + 1);
        }
        
      } catch (error) {
        console.error('Error tracking article views:', error);
        // 发生错误时使用传入的初始值
        setViews(initialViews || 1);
      } finally {
        setIsLoading(false);
      }
    };

    trackAndGetViews();
  }, [articleId, title, initialViews]);

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