// app/[lang]/magazine/[slug]/MagazineArticlePage.tsx
"use client";

import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import directusClient from '@/lib/directus';
import Breadcrumb from '@/components/layout/Breadcrumb';
import GetYourGuideWidget from '@/components/widgets/GetYourGuideWidget';
import ArticlesSidebar from '@/components/widgets/ArticlesSidebar';
import Seo from '@/components/widgets/Seo';

interface MagazineArticlePageProps {
  lang: string;
  slug: string;
}

export default function MagazineArticlePage({ lang, slug }: MagazineArticlePageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = React.useState(false);

  // React Query
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug, lang],
    queryFn: () => directusClient.getArticleBySlug(slug, lang),
    enabled: isClient && !!slug,
  });

  React.useEffect(() => {
    // Così attivi la fetch in client
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Article not found</h1>
        </div>
      </div>
    );
  }

  const translation = article.translations[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": translation?.titolo_articolo || '',
    "description": translation?.seo_summary || '',
    "datePublished": article.date_created,
    "dateModified": article.date_updated || article.date_created,
    "author": {
      "@type": "Person",
      "name": article.author?.name || 'Unknown'
    },
    "image": article.image
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`
      : undefined,
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/magazine/${slug}`
  };

  return (
    <>
      <Seo
        title={translation?.titolo_articolo || 'Article'}
        description={translation?.seo_summary || 'Read our latest article'}
        image={
          article.image
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`
            : undefined
        }
        type="article"
        article={{
          publishedTime: article.date_created,
          modifiedTime: article.date_updated,
          author: article.author?.name || 'Unknown',
          category: article.category?.name || 'General',
        }}
        schema={schema} 
      />

      <div className="relative h-[60vh] min-h-[400px]">
        {article.image && (
          <div className="relative w-full h-full">
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
              alt={translation?.titolo_articolo || ''}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {translation?.titolo_articolo}
            </h1>
          </div>
        </div>
      </div>

      <Breadcrumb lang={lang} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <GetYourGuideWidget
                lang={lang}
                destinationName="Italy"
              />
            </div>

            <article className="prose prose-lg max-w-none mt-8" ref={contentRef}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => {
                    const id = props.children
                      ?.toString()
                      .toLowerCase()
                      .replace(/\W+/g, '-');
                    return <h2 id={id} {...props} />;
                  },
                  h3: ({ node, ...props }) => {
                    const id = props.children
                      ?.toString()
                      .toLowerCase()
                      .replace(/\W+/g, '-');
                    return <h3 id={id} {...props} />;
                  },
                  img: ({ node, ...props }) => (
                    <div className="relative w-full h-64 md:h-96">
                      <Image
                        src={props.src || ''}
                        alt={props.alt || ''}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </div>
                  ),
                }}
              >
                {translation?.description || ''}
              </ReactMarkdown>
            </article>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <ArticlesSidebar lang={lang} />
          </div>
        </div>
      </div>
    </>
  );
}