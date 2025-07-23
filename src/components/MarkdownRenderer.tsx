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