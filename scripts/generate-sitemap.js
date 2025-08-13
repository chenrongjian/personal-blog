import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 网站基础URL
const SITE_URL = 'https://blog.nobugcode.com';

// 静态页面配置
const staticPages = [
  {
    url: '/',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: new Date().toISOString()
  },
  {
    url: '/categories',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString()
  },
  {
    url: '/admin/login',
    changefreq: 'monthly',
    priority: '0.3',
    lastmod: new Date().toISOString()
  }
];

// 生成sitemap XML
function generateSitemap(pages) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

// 主函数
function main() {
  try {
    console.log('🚀 开始生成sitemap...');
    
    // 这里可以添加从数据库获取文章和分类的逻辑
    // 目前使用静态页面作为示例
    const allPages = [...staticPages];
    
    // 示例：添加一些动态页面
    const exampleArticles = [
      { id: 'example-1', lastmod: new Date().toISOString() },
      { id: 'example-2', lastmod: new Date().toISOString() }
    ];
    
    const exampleCategories = [
      { id: 'tech', lastmod: new Date().toISOString() },
      { id: 'life', lastmod: new Date().toISOString() }
    ];
    
    // 添加文章页面
    exampleArticles.forEach(article => {
      allPages.push({
        url: `/article/${article.id}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: article.lastmod
      });
    });
    
    // 添加分类页面
    exampleCategories.forEach(category => {
      allPages.push({
        url: `/categories/${category.id}`,
        changefreq: 'weekly',
        priority: '0.6',
        lastmod: category.lastmod
      });
    });
    
    // 生成sitemap
    const sitemapContent = generateSitemap(allPages);
    
    // 写入文件
    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemapContent, 'utf8');
    
    console.log(`✅ Sitemap生成成功！包含 ${allPages.length} 个页面`);
    console.log(`📁 文件位置: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ 生成sitemap时出错:', error);
    process.exit(1);
  }
}

// 直接运行脚本
main();

export { generateSitemap, staticPages };