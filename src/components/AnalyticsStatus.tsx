import React, { useState, useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { analytics } from '@/lib/analytics';

interface AnalyticsStatusProps {
  className?: string;
}

const AnalyticsStatus: React.FC<AnalyticsStatusProps> = ({ className = '' }) => {
  const { config } = useConfig();
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error' | 'disabled'>('disabled');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkSupabaseStatus = async () => {
      if (!config.analytics?.enabled) {
        setSupabaseStatus('disabled');
        return;
      }

      setSupabaseStatus('checking');
      
      try {
        // 检查Supabase连接状态
        const data = await analytics.getAnalyticsData();
        setSupabaseStatus(data ? 'connected' : 'error');
        setErrorMessage(data ? '' : 'Supabase 连接失败');
      } catch (error) {
        setSupabaseStatus('error');
        if (error instanceof Error) {
          setErrorMessage(`Supabase 连接错误: ${error.message}`);
        } else {
          setErrorMessage('Supabase 连接未知错误');
        }
      }
    };

    checkSupabaseStatus();
    
    // 每分钟检查一次
    const interval = setInterval(() => {
      checkSupabaseStatus();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [config.analytics?.enabled]);

  if (!config.analytics?.enabled || supabaseStatus === 'disabled') {
    return null;
  }

  const getStatusIcon = () => {
    switch (supabaseStatus) {
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
    switch (supabaseStatus) {
      case 'checking':
        return '检查Supabase统计服务状态...';
      case 'connected':
        return 'Supabase统计服务正常';
      case 'error':
        return `Supabase统计服务异常: ${errorMessage}`;
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (supabaseStatus) {
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
    <div className={`space-y-2 ${className}`}>
      {/* Supabase统计服务状态 */}
      {(supabaseStatus === 'checking' || supabaseStatus === 'connected' || supabaseStatus === 'error') && (
        <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
          {supabaseStatus === 'error' && (
            <button
              onClick={() => window.location.reload()}
              className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              title="重新加载页面"
            >
              重试
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsStatus;