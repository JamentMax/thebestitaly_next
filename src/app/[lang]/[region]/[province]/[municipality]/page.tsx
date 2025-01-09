import DestinationLayout from "@/components/destinations/DestinationLayout";

interface MunicipalityPageProps {
  params: {
    lang: string;
    region: string;
    province: string;
    municipality: string;
  };
}

export default async function MunicipalityPage({
  params,
}: MunicipalityPageProps) {
  const { lang, municipality } = params;

  if (!lang || !municipality) {
    throw new Error("Missing required parameters");
  }

  return (
    <DestinationLayout
      slug={municipality}
      lang={lang}
      type="municipality"
    />
  );
}