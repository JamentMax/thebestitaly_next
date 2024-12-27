"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  companyId: number;
}

const fetchCompanyImages = async (companyId: number) => {
  console.log("Fetching images for companyId:", companyId); // Log del companyId
  try {
    // Recupera le immagini dalla collezione `companies_files` filtrando per `company_id`
    const response = await directusClient.getItems("companies_files", {
      filter: {
        companies_id: { _eq: companyId },
      },
      fields: ["directus_files_id"],
    });

    console.log("API Response:", response); // Log della risposta API

    // Restituisci solo gli ID delle immagini
    const images = response?.data?.map((item: any) => item.directus_files_id) || [];
    console.log("Extracted Images IDs:", images); // Log degli ID estratti

    return images;
  } catch (error) {
    console.error("Error fetching company images:", error); // Log di eventuali errori
    throw error;
  }
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ companyId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Recupera le immagini della company
  const { data: images, isLoading, error } = useQuery({
    queryKey: ["companyImages", companyId],
    queryFn: () => fetchCompanyImages(companyId),
    enabled: !!companyId,
  });

  console.log("Images fetched from query:", images); // Log delle immagini recuperate

  if (isLoading) return <div>Loading gallery...</div>;
  if (error || !images || images.length === 0)
    return <div>No images available for this company.</div>;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative w-full h-80 bg-gray-100">
        <Image
          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${images[currentIndex]}`}
          alt={`Company Image ${currentIndex + 1}`}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={previousImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      <div className="mt-4 flex justify-center gap-2">
        {images.map((imageId, index) => (
          <button
            key={imageId}
            onClick={() => setCurrentIndex(index)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
              currentIndex === index ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${imageId}`}
              alt={`Thumbnail ${index + 1}`}
              width={64}
              height={64}
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;