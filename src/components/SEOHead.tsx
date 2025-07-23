import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  structuredData?: object;
}

export default function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogUrl,
  ogType = 'website',
  canonicalUrl,
  structuredData
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph tags
    if (ogTitle) {
      let ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement('meta');
        ogTitleMeta.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleMeta);
      }
      ogTitleMeta.setAttribute('content', ogTitle);
    }

    if (ogDescription) {
      let ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (!ogDescMeta) {
        ogDescMeta = document.createElement('meta');
        ogDescMeta.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescMeta);
      }
      ogDescMeta.setAttribute('content', ogDescription);
    }

    if (ogUrl) {
      let ogUrlMeta = document.querySelector('meta[property="og:url"]');
      if (!ogUrlMeta) {
        ogUrlMeta = document.createElement('meta');
        ogUrlMeta.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrlMeta);
      }
      ogUrlMeta.setAttribute('content', ogUrl);
    }

    // Update og:type
    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeMeta);
    }
    ogTypeMeta.setAttribute('content', ogType);

    // Update canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    // Update structured data
    if (structuredData) {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogUrl, ogType, canonicalUrl, structuredData]);

  return null;
}

// Helper function to generate article structured data
export const generateArticleStructuredData = (article: {
  title: string;
  content: string;
  author: string;
  published_at: string;
  category?: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.published_at,
    "dateModified": article.published_at,
    "publisher": {
      "@type": "Person",
      "name": article.author
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    "articleSection": article.category,
    "inLanguage": "zh-CN",
    "url": article.url
  };
};

// Helper function to generate category structured data
export const generateCategoryStructuredData = (category: {
  name: string;
  description?: string;
  url: string;
  articleCount?: number;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "url": category.url,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": category.articleCount || 0
    },
    "inLanguage": "zh-CN"
  };
};