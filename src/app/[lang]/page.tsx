import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/lib/directus';
import HeroSection from '../../components/home/HeroSection';
import GetYourGuideWidget from '../../components/widgets/GetYourGuideWidget';
import LatestArticles from '../../components/magazine/LatestArticles';
import CategoriesList from '../../components/magazine/CategoriesList';
import DestinationsCarousel from '../../components/destinations/DestinationsCarousel';
import ProjectIntro from '../../components/home/ProjectIntro';
import BookExperience from '../../components/home/BookExperience';
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';

// 1) Definisci un tipo "locale" per le props
interface PageProps {
  params: {
    lang: string;
  };
}

// 2) Usa il tuo tipo nel metodo generateMetadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Non serve fare `await params`, è un semplice oggetto
  const { lang } = params;

  const homeTranslations = await getTranslations(lang, 'homepage');

  return generateSEO({
    title: `${homeTranslations?.seo_title || 'TheBestItaly'} | TheBestItaly`,
    description: homeTranslations?.seo_summary || '',
    type: 'website',
  });
}

// 3) Pagina
export default async function Home({ params }: PageProps) {
  // params NON è una Promise
  const { lang } = params;

  const homeTranslations = await getTranslations(lang, 'homepage');

  return (
    <div className="space-y-12">
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSection translations={homeTranslations} lang={lang} />
        <div className="container mx-auto px-4">
          <DestinationsCarousel lang={lang} type="region" />
        </div>
        <GetYourGuideWidget lang={lang} destinationName="Italy" />
        <div className="container mx-auto px-4">
          <LatestArticles lang={lang} />
        </div>
        <div className="container mx-auto px-4">
          <ProjectIntro lang={lang} />
        </div>
        <BookExperience lang={lang} />
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <CategoriesList lang={lang} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}