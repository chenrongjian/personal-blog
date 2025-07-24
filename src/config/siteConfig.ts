// 网站配置文件
export interface SiteConfig {
  // 网站基本信息
  site: {
    title: string;
    titleEn: string;
    typewriterText: string; // 打字机效果显示的文字
    typewriterTextEn: string; // 打字机效果下面显示的英文文字
    subtitle: string;
    subtitleEn: string;
    description: string;
    exploreButtonText: string;
    continueReadingText: string;
    scrollIndicatorText: string;
    featuredArticlesTitle: string;
    featuredArticlesTitleEn: string;
    categoriesTitle: string;
    categoriesTitleEn: string;
    readMoreText: string;
    articlesCountText: string;
    loadingText: string;
  };
  
  // 作者信息
  author: {
    name: string;
    email?: string;
    bio?: string;
  };
  
  // 导航设置
  navigation: {
    home: string;
    categories: string;
    admin: string;
    login: string;
    logout: string;
  };
  
  // 社交链接
  social?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  
  // 网站设置
  settings: {
    showAuthor: boolean;
    showSocial: boolean;
    enableComments: boolean;
    postsPerPage: number;
  };
  
  // 页脚信息
  footer: {
    copyright: string;
  };
}

// 默认配置
export const defaultSiteConfig: SiteConfig = {
  site: {
    title: "陈荣健的博客",
    titleEn: "chenrongjian blog",
    typewriterText: "拥抱AI,共同进化", // 打字机效果显示的文字
    typewriterTextEn: "Hugging AI, Co-evolving", // 打字机效果下面显示的英文文字
    subtitle: "个人博客",
    subtitleEn: "chenrongjian blog",
    description: "拥抱AI,共同进化",
    exploreButtonText: "探索文章",
    continueReadingText: "继续阅读",
    scrollIndicatorText: "滚动探索",
    featuredArticlesTitle: "精选文章",
    featuredArticlesTitleEn: "Featured Articles",
    categoriesTitle: "文章分类",
    categoriesTitleEn: "Article Categories",
    readMoreText: "阅读更多",
    articlesCountText: "篇文章",
    loadingText: "加载中..."
  },
  
  author: {
    name: "陈荣健",
    bio: "拥抱AI,共同进化"
  },
  
  navigation: {
    home: "首页",
    categories: "分类",
    admin: "管理",
    login: "登录",
    logout: "退出"
  },
  
  social: {
    github: "",
    twitter: "",
    linkedin: "",
    email: ""
  },
  
  settings: {
    showAuthor: true,
    showSocial: false,
    enableComments: false,
    postsPerPage: 10
  },
  
  footer: {
    copyright: "© 2025 nobugcode.com. All rights reserved."
  }
};

// 获取网站配置（同步版本，用于初始化）
export const getSiteConfig = (): SiteConfig => {
  // 先尝试从 localStorage 读取（向后兼容）
  const savedConfig = localStorage.getItem('siteConfig');
  
  if (savedConfig) {
    try {
      const userConfig = JSON.parse(savedConfig);
      // 合并默认配置和用户配置
      return { ...defaultSiteConfig, ...userConfig };
    } catch {
      console.warn('Failed to parse saved site config, using default');
    }
  }
  
  return defaultSiteConfig;
};

// 异步获取网站配置（从数据库）
export const getSiteConfigAsync = async (): Promise<SiteConfig> => {
  try {
    // 动态导入 configApi 避免循环依赖
    const { configApi } = await import('../lib/api');
    const dbConfig = await configApi.getSiteConfig();
    
    if (dbConfig) {
      // 合并默认配置和数据库配置
      return { ...defaultSiteConfig, ...dbConfig };
    }
  } catch (error) {
    console.warn('Failed to fetch site config from database:', error);
  }
  
  // 如果数据库读取失败，回退到 localStorage 或默认配置
  return getSiteConfig();
};

// 保存网站配置
export const saveSiteConfig = (config: Partial<SiteConfig>): void => {
  try {
    const currentConfig = getSiteConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('siteConfig', JSON.stringify(newConfig));
  } catch (error) {
    console.error('Failed to save site config:', error);
  }
};

// 重置为默认配置
export const resetSiteConfig = (): SiteConfig => {
  localStorage.removeItem('siteConfig');
  return defaultSiteConfig;
};