import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { SiteConfig } from '../config/siteConfig';
import AnalyticsConfigTab from '../components/AnalyticsConfigTab';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function ConfigManager() {
  const { config, updateConfig, resetConfig, isLoading } = useConfig();
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState('site');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    try {
      await updateConfig(localConfig);
      setHasChanges(false);
    } catch {
      // updateConfig 中已经处理了错误提示，这里不需要重复显示
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要重置为默认配置吗？这将清除所有自定义设置。')) {
      resetConfig();
      setLocalConfig(config);
      setHasChanges(false);
      // resetConfig 中已经处理了成功提示，这里不需要重复显示
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setLocalConfig(prev => {
      const fieldParts = field.split('.');
      let newConfig;
      if (fieldParts.length === 2) {
        const [parent, child] = fieldParts;
        newConfig = {
          ...prev,
          [parent]: {
            ...prev[parent as keyof SiteConfig],
            [child]: value
          }
        };
      } else {
        newConfig = {
          ...prev,
          [field]: value
        };
      }
      
      // 检查是否有变化
      setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(config));
      return newConfig;
    });
  };

  // 同步外部配置变化到本地状态
  React.useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  const tabs = [
    { id: 'site', label: '网站信息', icon: 'fas fa-globe' },
    { id: 'author', label: '作者信息', icon: 'fas fa-user' },
    { id: 'social', label: '社交媒体', icon: 'fas fa-share-alt' },
    { id: 'navigation', label: '导航设置', icon: 'fas fa-bars' },
    { id: 'analytics', label: '统计分析', icon: 'fas fa-chart-bar' },
    { id: 'footer', label: '页脚设置', icon: 'fas fa-copyright' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-16">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-6 mb-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 
                  className="text-4xl font-bold text-gray-800 mb-2"
                  style={{ fontFamily: 'Noto Serif SC, serif' }}
                >
                  配置管理
                </h1>
                <p className="text-gray-600">管理网站的各项配置设置</p>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Link
                  to="/admin/articles"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  文章管理
                </Link>
                
                <Link
                  to="/admin/categories"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-folder mr-2"></i>
                  分类管理
                </Link>
                
                <Link
                  to="/admin/analytics"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-chart-bar mr-2"></i>
                  统计分析
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">博客配置管理</h2>
                  <p className="text-gray-600 mt-1">自定义您的博客个性化信息</p>
                </div>
                

              </div>
            </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Site Info Tab */}
            {activeTab === 'site' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">网站基本信息</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网站标题（中文）
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.title}
                      onChange={(e) => handleInputChange('site.title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="个人博客"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网站标题（英文）
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.titleEn}
                      onChange={(e) => handleInputChange('site.titleEn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Personal Blog"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      打字机效果文字
                      <span className="text-xs text-gray-500 ml-1">（首页动画显示的文字）</span>
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.typewriterText}
                      onChange={(e) => handleInputChange('site.typewriterText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="陈荣健的博客"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      打字机效果英文文字
                      <span className="text-xs text-gray-500 ml-1">（打字机下方显示的英文）</span>
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.typewriterTextEn}
                      onChange={(e) => handleInputChange('site.typewriterTextEn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Fragments of Thoughts"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      副标题（英文）
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.subtitleEn}
                      onChange={(e) => handleInputChange('site.subtitleEn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Fragments of Thoughts"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网站描述
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.description}
                      onChange={(e) => handleInputChange('site.description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="拥抱AI,共同进化"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      探索按钮文字
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.exploreButtonText}
                      onChange={(e) => handleInputChange('site.exploreButtonText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="探索文章"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      继续阅读按钮文字
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.continueReadingText}
                      onChange={(e) => handleInputChange('site.continueReadingText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="继续阅读"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      精选文章标题
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.featuredArticlesTitle}
                      onChange={(e) => handleInputChange('site.featuredArticlesTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="精选文章"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      精选文章标题（英文）
                    </label>
                    <input
                      type="text"
                      value={localConfig.site.featuredArticlesTitleEn}
                      onChange={(e) => handleInputChange('site.featuredArticlesTitleEn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Featured Articles"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Author Info Tab */}
            {activeTab === 'author' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">作者信息</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      作者姓名
                    </label>
                    <input
                      type="text"
                      value={localConfig.author.name}
                      onChange={(e) => handleInputChange('author.name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="您的姓名"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <input
                      type="email"
                      value={localConfig.author.email || ''}
                      onChange={(e) => handleInputChange('author.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      个人简介
                    </label>
                    <textarea
                      value={localConfig.author.bio || ''}
                      onChange={(e) => handleInputChange('author.bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="简单介绍一下自己..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tab */}
            {activeTab === 'navigation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">导航设置</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      首页
                    </label>
                    <input
                      type="text"
                      value={localConfig.navigation.home}
                      onChange={(e) => handleInputChange('navigation.home', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="首页"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分类
                    </label>
                    <input
                      type="text"
                      value={localConfig.navigation.categories}
                      onChange={(e) => handleInputChange('navigation.categories', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="分类"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      管理
                    </label>
                    <input
                      type="text"
                      value={localConfig.navigation.admin}
                      onChange={(e) => handleInputChange('navigation.admin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="管理"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      登录
                    </label>
                    <input
                      type="text"
                      value={localConfig.navigation.login}
                      onChange={(e) => handleInputChange('navigation.login', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="登录"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      退出
                    </label>
                    <input
                      type="text"
                      value={localConfig.navigation.logout}
                      onChange={(e) => handleInputChange('navigation.logout', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="退出"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">社交媒体设置</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <input
                      type="email"
                      value={localConfig.social?.email || ''}
                      onChange={(e) => handleInputChange('social.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={localConfig.social?.github || ''}
                      onChange={(e) => handleInputChange('social.github', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={localConfig.social?.twitter || ''}
                      onChange={(e) => handleInputChange('social.twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={localConfig.social?.linkedin || ''}
                      onChange={(e) => handleInputChange('social.linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                
                {/* WeChat QR Code Section */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-800 mb-4">公众号二维码设置</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        二维码标题
                      </label>
                      <input
                        type="text"
                        value={localConfig.social?.wechatTitle || ''}
                        onChange={(e) => handleInputChange('social.wechatTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="关注我的公众号"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        二维码图片链接
                      </label>
                      <input
                        type="url"
                        value={localConfig.social?.wechatQrCode || ''}
                        onChange={(e) => handleInputChange('social.wechatQrCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/qrcode.jpg"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localConfig.settings?.showWechatQr || false}
                        onChange={(e) => handleInputChange('settings.showWechatQr', e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">在页脚显示公众号二维码</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.settings?.showSocial || false}
                      onChange={(e) => handleInputChange('settings.showSocial', e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">在页脚显示社交媒体链接</span>
                  </label>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsConfigTab 
                localConfig={localConfig} 
                handleInputChange={handleInputChange} 
              />
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">页脚设置</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    版权信息
                  </label>
                  <input
                    type="text"
                    value={localConfig.footer.copyright}
                    onChange={(e) => handleInputChange('footer.copyright', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="© 2024 Personal Blog. All rights reserved."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-4">
            {/* 变更提示 */}
            {hasChanges && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                  <span className="text-yellow-800 text-sm">
                    您有未保存的更改，请记得保存配置以使更改生效。
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <i className="fas fa-undo mr-2"></i>
                重置为默认
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isLoading || !hasChanges}
                  className={`px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasChanges 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      保存中...
                    </>
                  ) : hasChanges ? (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      保存配置 (热更新)
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      已保存
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}