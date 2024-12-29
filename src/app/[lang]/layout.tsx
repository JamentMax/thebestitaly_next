"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, use } from "react";
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n.config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const resolvedParams = use(params);
  const currentLang = resolvedParams?.lang || 'it';
  const isRTL = ['ar', 'fa', 'he', 'ur'].includes(currentLang);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <div className={`${geistSans.variable} ${geistMono.variable} ${isRTL ? 'rtl' : 'ltr'}`}>
          <Header lang={currentLang} />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </I18nextProvider>
    </QueryClientProvider>
  );
}