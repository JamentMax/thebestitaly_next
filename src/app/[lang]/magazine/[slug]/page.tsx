import DestinationLayout from "@/components/destinations/DestinationLayout";
import { getDestinationsByType } from "@/lib/directus";

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

// 3) Pagina
export default async function MunicipalityPage({ params }: Props) {
  const { lang, municipality } = params;

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