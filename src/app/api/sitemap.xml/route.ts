import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import directusClient from '@/lib/directus';

const SUPPORTED_LANGUAGES = [
 'it', 'en', 'fr', 'es', 'pt', 'de', 'tk', 'hu', 'ro', 'nl', 'sv',
 'pl', 'vi', 'id', 'el', 'uk', 'ru', 'bn', 'zh', 'hi', 'ar', 'fa',
 'ur', 'ja', 'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg', 'sk',
 'sl', 'sr', 'th', 'ms', 'tl', 'he', 'ca', 'et', 'lv', 'lt', 'mk',
 'az', 'ka', 'hy', 'is', 'sw', 'zh-tw'
];

export default async function sitemap() {
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
 const URLs: { loc: string; lastmod: string; changefreq: string; priority: number }[] = [];

 // Aggiungi URL statici per ogni lingua
 SUPPORTED_LANGUAGES.forEach(lang => {
   URLs.push(
     { loc: `${baseUrl}/${lang}`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
     { loc: `${baseUrl}/${lang}/magazine`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.9 },
     { loc: `${baseUrl}/${lang}/companies`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
     { loc: `${baseUrl}/${lang}/experience`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 }
   );
 });

 try {
   // Aggiungi articoli del magazine
   const articles = await directusClient.get('/items/articles', {
     fields: ['translations.slug_permalink', 'translations.languages_code', 'date_created']
   });

   articles.data?.forEach((article: { translations: { languages_code: any; slug_permalink: any; }[], date_created: any }) => {
     article.translations.forEach((trans: { languages_code: any; slug_permalink: any; }) => {
       URLs.push({
         loc: `${baseUrl}/${trans.languages_code}/magazine/${trans.slug_permalink}`,
         lastmod: new Date(article.date_created).toISOString(),
         changefreq: 'monthly',
         priority: 0.7
       });
     });
   });

   // Aggiungi companies
   const companies = await directusClient.get('/items/companies', {
     fields: ['translations.slug_permalink', 'translations.languages_code', 'date_created']
   });

   companies.data?.forEach((company: { translations: { languages_code: any; slug_permalink: any; }[], date_created: any }) => {
     company.translations.forEach((trans: { languages_code: any; slug_permalink: any; }) => {
       URLs.push({
         loc: `${baseUrl}/${trans.languages_code}/companies/${trans.slug_permalink}`,
         lastmod: new Date(company.date_created).toISOString(),
         changefreq: 'weekly',
         priority: 0.8
       });
     });
   });

   // Aggiungi destinazioni
   const destinations = await directusClient.get('/items/destinations', {
     fields: ['translations.slug_permalink', 'translations.languages_code', 'type', 'region_id', 'province_id']
   });

   destinations.data?.forEach((destination: { translations: any[], type: string, region_id: any, province_id: any }) => {
     destination.translations.forEach((trans: { languages_code: string; slug_permalink: string }) => {
       let path;
       switch(destination.type) {
         case 'region':
           path = `${trans.languages_code}/${trans.slug_permalink}`;
           break;
         case 'province':
           path = `${trans.languages_code}/${destination.region_id.translations[0].slug_permalink}/${trans.slug_permalink}`;
           break;
         case 'municipality':
           path = `${trans.languages_code}/${destination.region_id.translations[0].slug_permalink}/${destination.province_id.translations[0].slug_permalink}/${trans.slug_permalink}`;
           break;
       }
       
       if (path) {
         URLs.push({
           loc: `${baseUrl}/${path}`,
           lastmod: new Date().toISOString(),
           changefreq: 'weekly',
           priority: 0.8
         });
       }
     });
   });

 } catch (error) {
   console.error('Error generating sitemap:', error);
 }

 return getServerSideSitemap(URLs as ISitemapField[]);
}

export const config = {
 api: {
   externalResolver: true,
 },
};