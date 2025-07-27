import { useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

import { User, Mail, MapPin, Calendar } from 'lucide-react';
import { analytics } from '@/lib/analytics';

export default function About() {
  const { config: siteConfig } = useConfig();

  useEffect(() => {
    // 跟踪页面访问
    analytics.trackPageView(window.location.pathname, document.title);
  }, []);

  return (
    <>
      <SEOHead 
        title={`关于我 - ${siteConfig?.site?.title || '个人博客'}`}
        description={`了解更多关于${siteConfig?.site?.title || '我'}的信息`}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="max-w-4xl mx-auto">
            {/* 页面标题 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">关于我</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                欢迎来到{siteConfig?.site?.title || '我的博客'}，这里是分享知识、交流思想的地方
              </p>
            </div>

            {/* 博客介绍 */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="mr-3 text-blue-600" size={28} />
                博客简介
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  {siteConfig?.site?.description || '拥抱AI,共同进化'}
                </p>
                <p className="mb-4">
                  这是一个完全由TRAE SOLO AI IDE 打造的一个个人博客网站！可能会有很多的瑕疵，但是我会尽我所能去完善它，让他变得更好，代码已经开源，欢迎各位观众老爷们进行下载，进行改进！
                </p>
                <p>
                  所谓的Vibe Coding，我理解的就是自然语言编程！通过自然语言向AI表达我们的想法，一切代码由AI帮我们实现。如果你也喜欢AI编程，那么可以跟着我一起学习，一起进步！一起通过AI编程来实现有趣的想法。在这里我会分享我在AI编程中的经验，教程以及我遇到的问题和解决方案。还有其他的一切。
                </p>
              </div>
            </div>

            {/* 联系信息 */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="mr-3 text-blue-600" size={28} />
                联系我
              </h2>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="mr-3 text-blue-600" size={20} />
                    <span>邮箱：{siteConfig?.social?.email || 'contact@example.com'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="mr-3 text-blue-600" size={20} />
                    <span>地址：中国</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="mr-3 text-blue-600" size={20} />
                    <span>建站时间：2025年</span>
                  </div>
                </div>
                
                {/* 公众号二维码 */}
                {siteConfig?.settings?.showWechatQr && siteConfig?.social?.wechatQrCode && (
                  <div className="flex-1 flex justify-center items-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={siteConfig.social.wechatQrCode} 
                        alt="微信公众号二维码" 
                        className="w-32 h-32 block mx-auto"
                      />
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        {siteConfig.social.wechatTitle || '扫码关注公众号'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {/* 技术栈 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">技术栈</h2>
              
              {/* 前端技术 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  前端技术
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'React', 'TypeScript', 'Tailwind CSS', 'Vite'
                  ].map((tech) => (
                    <div key={tech} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-100 transition-colors">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 后端技术 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  后端技术
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Node.js', 'Java', 'SpringBoot', 'Supabase',
                    'PostgreSQL', 'MySQL'
                  ].map((tech) => (
                    <div key={tech} className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-green-100 transition-colors">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 部署技术 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  部署技术
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Docker', 'Vercel', 'GitHub Actions', 'Nginx'
                  ].map((tech) => (
                    <div key={tech} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-purple-100 transition-colors">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI技术 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  AI技术
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'AI智能体', 'MCP', '大模型', 'Vibe Coding', 'Prompt工程', 'LangChain'
                  ].map((tech) => (
                    <div key={tech} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-orange-100 transition-colors">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}