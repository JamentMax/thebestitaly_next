import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/lib/directus';
import HeroSection from '@/components/home/HeroSection';
import GetYourGuideWidget from '@/components/widgets/GetYourGuideWidget';
import LatestArticles from '@/components/magazine/LatestArticles';
import CategoriesList from '@/components/magazine/CategoriesList';
import DestinationsCarousel from '@/components/destinations/DestinationsCarousel';
import ProjectIntro from '@/components/home/ProjectIntro';
import BookExperience from '@/components/home/BookExperience';
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';
console.log('Directus URL:', process.env.NEXT_PUBLIC_DIRECTUS_URL);
console.log('Authorization Token:', process.env.NEXT_PUBLIC_DIRECTUS_TOKEN);
// Define the translation type
interface HomeTranslations {
  seo_title?: string;
  seo_summary?: string;
  // Add other translation fields as needed
}

interface PageProps {
  params: {
    lang: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await Promise.resolve(params);
  
  try {
    const homeTranslations = await getTranslations(lang, 'homepage');
    
    return generateSEO({
      title: `${homeTranslations?.seo_title || 'TheBestItaly'} | TheBestItaly`,
      description: homeTranslations?.seo_summary || '',
      type: 'website',
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'TheBestItaly',
      description: '',
    };
  }
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await Promise.resolve(params);
  const translations = await getTranslations(lang, 'homepage');

  return (
    <>
      <HeroSection translations={translations} lang={lang} />
      <ProjectIntro translations={translations} lang={lang} />
      <DestinationsCarousel lang={lang} type={''} />
      <GetYourGuideWidget lang={lang} destinationName={''} />
      <LatestArticles lang={lang} />
      <BookExperience translations={translations} lang={lang} />
    </>
  );
}