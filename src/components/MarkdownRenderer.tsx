import { useMemo } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => {
    if (!content) return '';

    const renderer = new marked.Renderer();
    
    renderer.code = function({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    };
    
    renderer.image = function({ href, title, text }: { href: string; title?: string | null; text: string }) {
      const altText = text || title || '图片';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<img src="${href}" alt="${altText}"${titleAttr} loading="lazy" class="markdown-img" />`;
    };
    
    renderer.link = function({ href, title, text }: { href: string; title?: string | null; text: string }) {
      const isExternal = href.startsWith('http') && !href.includes('blog.nobugcode.com');
      const titleAttr = title ? ` title="${title}"` : '';
      const relAttr = isExternal ? ' rel="noopener noreferrer"' : '';
      const targetAttr = isExternal ? ' target="_blank"' : '';
      return `<a href="${href}"${titleAttr}${relAttr}${targetAttr} class="markdown-link">${text}</a>`;
    };

    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    return marked.parse(content, { renderer }) as string;
  }, [content]);

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
