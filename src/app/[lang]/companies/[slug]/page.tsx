"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Globe, Mail, Phone, MapPin } from "lucide-react";
import directusClient from "@/lib/directus";
import Map from "@/components/companies/Map";
import SocialIcon from "@/components/companies/SocialIcon";
import Seo from "@/components/widgets/Seo";
import ImageGallery from "@/components/companies/ImageGallery";

interface Company {
  id: number;
  company_name: string;
  featured_image?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  };
  socials?: Record<string, string>;
  translations: Array<{
    languages_code: string;
    slug_permalink: string;
    description?: string;
    seo_summary?: string;
    address?: string;
  }>;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const lang = params?.lang as string;
  const slug = params?.slug as string;

  // Fetch company data
  const { data: company, isLoading } = useQuery<Company | null>({
    queryKey: ["company", lang, slug],
    queryFn: () => directusClient.getCompanyBySlug(slug, lang),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!company) return <div>Company not found</div>;

  const translation = company.translations.find(
    (t) => t.languages_code === lang
  );

  return (
    <>
      {/* SEO Metadata */}
      <Seo
        title={company.company_name}
        description={translation?.seo_summary}
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section with Featured Image */}
        <div className="relative h-[60vh] bg-gray-100">
          {company.featured_image && (
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
              alt={company.company_name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-8">
                {company.logo && (
                  <div className="relative w-32 h-32 bg-white rounded-lg p-2">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.logo}`}
                      alt={company.company_name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="text-white">
                  <h1 className="text-4xl font-bold">{company.company_name}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Description */}
              {translation?.description && (
                <div className="prose max-w-none mb-12">
                  <ReactMarkdown>{translation.description}</ReactMarkdown>
                </div>
              )}

              {/* Map Section */}
              {company.location && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Location</h2>
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <Map
                      location={company.location}
                      title={company.company_name}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline mb-3"
                  >
                    <Globe className="w-5 h-5" />
                    Visit Website
                  </a>
                )}
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline mb-3"
                  >
                    <Mail className="w-5 h-5" />
                    {company.email}
                  </a>
                )}
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline mb-3"
                  >
                    <Phone className="w-5 h-5" />
                    {company.phone}
                  </a>
                )}
                {translation?.address && (
                  <div className="flex gap-2">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                    <p>{translation.address}</p>
                  </div>
                )}
                {company.socials && (
                  <div className="mt-6">
                    <SocialIcon socials={company.socials} />
                  </div>
                )}
              </div>
              
            </div>
            <div className="mt-6">
                    <ImageGallery companyId={company.id} />
               </div>
          </div>
        </div>
      </div>
    </>
  );
}