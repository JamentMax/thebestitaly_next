import DestinationLayout from "@/components/destinations/DestinationLayout";
import { getDestinationsByType } from "@/lib/directus";
import { Metadata } from "next";

// 1) Definisci il tipo
type Props = {
  params: {
    lang: string;
    region: string;
    province: string;
    municipality: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
};

// 2) (opzionale) Indica pagina dinamica 
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, region, province, municipality } = await Promise.resolve(params);
  
  try {
    const destinations = await getDestinationsByType("municipality", lang);
    const destination = destinations.find(
      (d: { translations: { slug_permalink: string } }) =>
        d.translations.slug_permalink === municipality
    );

    if (!destination) {
      return {
        title: 'Destination Not Found',
        description: 'The requested destination could not be found'
      };
    }

    return {
      title: `${destination.translations.title || municipality} | TheBestItaly`,
      description: destination.translations.description || '',
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'TheBestItaly',
      description: '',
    };
  }
}

// 3) Pagina
export default async function MunicipalityPage({ params }: Props) {
  const { lang, region, province, municipality } = await Promise.resolve(params);

  const destinations = await getDestinationsByType("municipality", lang);

  const destination = destinations.find(
    (d: { translations: { slug_permalink: string } }) =>
      d.translations.slug_permalink === municipality
  );

  if (!destination) {
    throw new Error("Destination not found");
  }

  return (
    <DestinationLayout
      slug={municipality}
      lang={lang}
      type="municipality"
    />
  );
}