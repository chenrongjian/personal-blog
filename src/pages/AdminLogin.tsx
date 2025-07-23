import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import useStore from '@/store/useStore';

export default function AdminLogin() {
  const { login, isAuthenticated, loading, error: storeError, clearError, checkAuth } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
    // 检查当前认证状态
    checkAuth();
  }, [checkAuth]);
  
  useEffect(() => {
    // 清除错误信息当组件挂载时
    clearError();
  }, [clearError]);
  
  if (isAuthenticated) {
    return <Navigate to="/admin/articles" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      // 登录成功会通过Navigate组件自动跳转
    } catch {
      // 错误已经在store中处理
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="absolute top-6 left-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          返回首页
        </Link>
      </div>
      
      <div className={`w-full max-w-md transform transition-all duration-1000 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user-shield text-2xl text-blue-600"></i>
            </div>
            
            <h1 
              className="text-3xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              管理员登录
            </h1>
            
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
            >
              Admin Login
            </p>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {storeError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                  <span className="text-red-700 text-sm">{storeError}</span>
                </div>
              </div>
            )}
            
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading.auth}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading.auth ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  登录中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  登录
                </div>
              )}
            </button>
          </form>
          

        </div>
      </div>
    </div>
  );
}