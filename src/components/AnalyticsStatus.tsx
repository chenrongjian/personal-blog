import React, { useState, useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';

interface AnalyticsStatusProps {
  className?: string;
}

const AnalyticsStatus: React.FC<AnalyticsStatusProps> = ({ className = '' }) => {
  const { config } = useConfig();
  const [gaStatus, setGaStatus] = useState<'checking' | 'connected' | 'error' | 'disabled'>('disabled');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkGAStatus = async () => {
      if (!config.analytics?.gaTrackingId) {
        setGaStatus('disabled');
        return;
      }

      setGaStatus('checking');
      
      try {
        // 检查网络连接
        if (!navigator.onLine) {
          setGaStatus('error');
          setErrorMessage('网络连接不可用');
          return;
        }

        // 检查GA脚本是否加载
        if (typeof window.gtag === 'undefined') {
          setGaStatus('error');
          setErrorMessage('Google Analytics 脚本未加载');
          return;
        }

        // 尝试ping GA服务
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        await fetch('https://www.google-analytics.com/g/collect', {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors'
        });
        
        clearTimeout(timeoutId);
        setGaStatus('connected');
        setErrorMessage('');
      } catch (error) {
        setGaStatus('error');
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            setErrorMessage('Google Analytics 服务连接超时');
          } else {
            setErrorMessage('Google Analytics 服务不可用');
          }
        } else {
          setErrorMessage('未知错误');
        }
      }
    };

    checkGAStatus();
    
    // 每分钟检查一次
    const interval = setInterval(checkGAStatus, 60000);
    
    return () => clearInterval(interval);
  }, [config.analytics?.gaTrackingId]);

  if (gaStatus === 'disabled') {
    return null;
  }

  const getStatusIcon = () => {
    switch (gaStatus) {
      case 'checking':
        return <i className="fas fa-spinner fa-spin text-yellow-500"></i>;
      case 'connected':
        return <i className="fas fa-check-circle text-green-500"></i>;
      case 'error':
        return <i className="fas fa-exclamation-triangle text-red-500"></i>;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (gaStatus) {
      case 'checking':
        return '检查统计服务状态...';
      case 'connected':
        return '统计服务正常';
      case 'error':
        return `统计服务异常: ${errorMessage}`;
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (gaStatus) {
      case 'checking':
        return 'text-yellow-600';
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {gaStatus === 'error' && (
        <button
          onClick={() => window.location.reload()}
          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          title="重新加载页面"
        >
          重试
        </button>
      )}
    </div>
  );
};

export default AnalyticsStatus;