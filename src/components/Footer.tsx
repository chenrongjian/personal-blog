import { Link } from 'react-router-dom';
import { useConfig } from '@/contexts/ConfigContext';

export default function Footer() {
  const { config: siteConfig } = useConfig();

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-800 overflow-hidden" role="contentinfo">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-200 to-pink-300 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-8">
          
          {/* 左侧：品牌区域 */}
          <div className="text-center lg:text-left space-y-4">
            <h3 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {siteConfig?.site?.title || '思维的碎片'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto lg:mx-0">
              {siteConfig?.site?.description || '分享技术，记录成长，探索无限可能'}
            </p>
            
            {/* 社交媒体链接 - 紧凑布局 */}
            {siteConfig?.settings?.showSocial && siteConfig?.social && (
              <div className="flex justify-center lg:justify-start space-x-3 pt-2">
                {siteConfig?.social?.email && (
                  <a
                    href={`mailto:${siteConfig?.social?.email}`}
                    className="group relative w-10 h-10 bg-gray-200/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-100 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                    aria-label="邮箱"
                  >
                    <i className="fas fa-envelope text-sm text-gray-600 group-hover:text-blue-600 transition-colors"></i>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      邮箱
                    </div>
                  </a>
                )}
                {siteConfig?.social?.github && (
                  <a
                    href={siteConfig?.social?.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 bg-gray-200/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-300 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                    aria-label="GitHub"
                  >
                    <i className="fab fa-github text-sm text-gray-600 group-hover:text-gray-800 transition-colors"></i>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      GitHub
                    </div>
                  </a>
                )}
                {siteConfig?.social?.twitter && (
                  <a
                    href={siteConfig?.social?.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 bg-gray-200/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-100 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                    aria-label="Twitter"
                  >
                    <i className="fab fa-twitter text-sm text-gray-600 group-hover:text-blue-500 transition-colors"></i>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      Twitter
                    </div>
                  </a>
                )}
                {siteConfig?.social?.linkedin && (
                  <a
                    href={siteConfig?.social?.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 bg-gray-200/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-100 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                    aria-label="LinkedIn"
                  >
                    <i className="fab fa-linkedin text-sm text-gray-600 group-hover:text-blue-600 transition-colors"></i>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      LinkedIn
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* 中间：快速链接 */}
          <div className="text-center space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">快速导航</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm hover:translate-x-1 transform">
                首页
              </Link>
              <Link 
                to="/categories" 
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm hover:translate-x-1 transform cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/categories';
                }}
              >
                文章分类
              </Link>
              <Link 
                to="/" 
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm hover:translate-x-1 transform cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/#featured';
                  setTimeout(() => {
                    const element = document.getElementById('featured');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                精选文章
              </Link>
              <Link 
                to="/about" 
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm hover:translate-x-1 transform cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/about';
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
              >
                关于我
              </Link>
            </div>
          </div>
          
          {/* 右侧：公众号二维码卡片 */}
          {siteConfig?.settings?.showWechatQr && siteConfig?.social?.wechatQrCode && (
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200 hover:bg-white/90 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-md">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {siteConfig?.social?.wechatTitle || '关注公众号'}
                </h4>
                <div className="relative group">
                  <div className="w-20 h-20 bg-white rounded-xl p-2 mx-auto shadow-md group-hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <img
                      src={siteConfig?.social?.wechatQrCode}
                      alt="WeChat QR Code"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    扫码关注
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">获取最新文章推送</p>
              </div>
            </div>
          )}
        </div>
        
        {/* 分割线 */}
        <div className="border-t border-gray-300 my-8"></div>
        
        {/* 底部版权信息 */}
        <div className="text-center space-y-2">
          <p 
            className="text-gray-600 text-sm"
            style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
          >
            {siteConfig?.footer?.copyright || '© 2025 nobugcode.com. All rights reserved.'}
          </p>
          <p className="text-gray-500 text-xs">
            Made with ❤️ by {siteConfig?.author?.name || 'Developer'} | Powered by React & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}