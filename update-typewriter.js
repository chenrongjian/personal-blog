import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function updateTypewriterConfig() {
  try {
    console.log('开始更新配置...');
    
    // 直接执行更新语句
    const { data, error } = await supabase
      .from('site_config')
      .update({
        config_value: {
          site: {
            title: '陈荣健的博客',
            titleEn: 'chenrongjian blog',
            typewriterText: '陈荣健的博客',
            subtitle: '个人博客',
            subtitleEn: 'chenrongjian blog',
            description: '拥抱AI,共同进化',
            exploreButtonText: '探索文章',
            continueReadingText: '继续阅读',
            scrollIndicatorText: '滚动探索',
            featuredArticlesTitle: '精选文章',
            featuredArticlesTitleEn: 'Featured Articles',
            categoriesTitle: '文章分类',
            categoriesTitleEn: 'Article Categories',
            readMoreText: '阅读更多',
            articlesCountText: '篇文章',
            loadingText: '加载中...'
          },
          author: {
            name: '陈荣健',
            bio: '我是陈荣健，拥抱AI,共同进化'
          },
          navigation: {
            home: '首页',
            categories: '分类',
            admin: '管理',
            login: '登录',
            logout: '退出'
          },
          social: {
            github: '',
            twitter: '',
            linkedin: '',
            email: ''
          },
          settings: {
            showAuthor: true,
            showSocial: false,
            enableComments: false,
            postsPerPage: 10
          },
          footer: {
            copyright: '© 2025 nobugcode.com. All rights reserved.'
          }
        }
      })
      .eq('config_key', 'site_settings');

    if (error) {
      console.error('更新失败:', error);
    } else {
      console.log('配置更新成功!');
      
      // 验证更新结果
      const { data: verifyData, error: verifyError } = await supabase
        .from('site_config')
        .select('config_value')
        .eq('config_key', 'site_settings')
        .single();
        
      if (verifyError) {
        console.error('验证失败:', verifyError);
      } else {
        console.log('typewriterText 字段值:', verifyData.config_value.site.typewriterText);
      }
    }
  } catch (err) {
    console.error('执行错误:', err);
  }
}

updateTypewriterConfig();