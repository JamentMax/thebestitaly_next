import DestinationLayout from "@/components/destinations/DestinationLayout";

// 1) Definisci il tipo per i parametri
interface RegionPageProps {
  params: {
    lang: string;
    region: string;
  };
}

// 2) Pagina
export default async function RegionPage({ params }: RegionPageProps) {
  // NON serve "await Promise.resolve(params)"
  // perché `params` è un semplice oggetto.
  const { lang, region } = params;

  if (!lang || !region) {
    throw new Error("Missing required parameters: lang or region");
  }

  return (
    <DestinationLayout
      slug={region}
      lang={lang}
      type="region"
    />
  );
}