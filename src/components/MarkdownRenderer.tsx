import { useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  useEffect(() => {
    // 配置 marked
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }, []);

  const renderer = new marked.Renderer();
  
  // 自定义代码渲染器
  renderer.code = function({ text, lang }: { text: string; lang?: string }) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(text, { language: lang }).value;
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch (err) {
        console.error('Highlight.js error:', err);
      }
    }
    const highlighted = hljs.highlightAuto(text).value;
    return `<pre><code class="hljs">${highlighted}</code></pre>`;
  };
  
  // 自定义图片渲染器，确保所有图片都有alt属性
  renderer.image = function({ href, title, text }: { href: string; title?: string; text: string }) {
    const altText = text || title || '图片';
    const titleAttr = title ? ` title="${title}"` : '';
    return `<img src="${href}" alt="${altText}"${titleAttr} loading="lazy" />`;
  };
  
  // 自定义链接渲染器，为外部链接添加rel属性
  renderer.link = function({ href, title, text }: { href: string; title?: string; text: string }) {
    const isExternal = href.startsWith('http') && !href.includes('nobugcode.com');
    const titleAttr = title ? ` title="${title}"` : '';
    const relAttr = isExternal ? ' rel="noopener noreferrer"' : '';
    const targetAttr = isExternal ? ' target="_blank"' : '';
    return `<a href="${href}"${titleAttr}${relAttr}${targetAttr}>${text}</a>`;
  };

  const htmlContent = marked(content, { renderer });

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        fontFamily: 'Noto Serif SC, serif',
        lineHeight: '1.8',
        color: '#374151'
      }}
    />
  );
}