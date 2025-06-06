import axios, { AxiosInstance } from 'axios';
import { error } from 'console';

// Interfaces
export interface Translation {
  languages_code: string;
  destination_name?: string;
  seo_title?: string;
  seo_summary?: string;
  description?: string;
  slug_permalink?: string;
}

export interface Destination {
  province_id: any;
  id: string;
  type: 'region' | 'province' | 'municipality';
  image?: string;
  translations: Translation[];
}

export const getTranslations = async (lang: string, section: string) => {
  try {
    // Fai la richiesta al Directus API
    const response = await directusClient.get('/items/translations', {
      params: {
        filter: {
          language: { _eq: lang },
          section: { _eq: section },
        },
        fields: ['content'],
      },
    });

    // Controllo contenuto della risposta
    const data = response?.data?.data;
    if (!data || !data.length || !data[0]?.content) {
      console.warn(
        `No content found for language "${lang}" and section "${section}"`
      );
      return null;
    }

    // Prova a parsare il contenuto JSON
    try {
      const parsedContent = JSON.parse(data[0].content);
      return parsedContent;
    } catch (parseError) {
      console.error(
        `Error parsing content for language "${lang}" and section "${section}":`,
        parseError
      );
      return null;
    }
  } catch (error: any) {
    // Controllo specifico per errori di rete
    if (error.response) {
      console.error(
        `Error fetching translations: ${error.response.status} - ${error.response.statusText}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('No response received from Directus API:', error.request);
    } else {
      console.error('Error during translation fetch:', error.message);
    }

    return null;
  }
};

export interface CategoryTranslation {
  id: number;
  languages_code: string;
  nome_categoria: string;
  seo_title: string;
  seo_summary: string;
  slug_permalink: string;
}

export interface Category {
  id: number;
  nome_categoria: string;
  image: string;
  visible: boolean;
  translations: CategoryTranslation[];
}

export interface ArticleTranslation {
  languages_code: string;
  titolo_articolo: string;
  seo_summary?: string;
  slug_permalink: string;
}

export interface Article {
  id: string;
  image?: string;
  date_created: string;
  featured_status: 'none' | 'homepage' | 'top' | 'editor' | 'trending';
  featured_order?: number;
  category?: {
    id: number;
    translations: {
      nome_categoria: string;
    }[];
  };
  translations: {
    languages_code: string;
    titolo_articolo: string;
    description?: string;
    seo_title?: string;
    seo_summary?: string;
    slug_permalink: string;
  }[];
}
interface SlugData {
  regionSlug: string;
  provinceSlug: string;
  municipalitySlug: string;
  breadcrumb: { label: string; path: string }[];
}
// Aggiungi queste interfacce
export interface Company {
  id: number;
  logo: string;
  website: string;
  email: string;
  phone: string;
  category_id: number;
  location_id: number;
  active: boolean;
  featured: boolean;
  socials: any;
  translations: CompanyTranslation[];
}

export interface CompanyTranslation {
  languages_code: string;
  name: string;
  slug_permalink: string;
  description: string;
  seo_title: string;
  seo_description: string;
  address: string;
}

/**
 * Recupera gli slug e il breadcrumb per una destinazione.
 *
 * @param destinationId - ID della destinazione corrente.
 * @param lang - Codice della lingua.
 * @returns Un oggetto contenente gli slug e il breadcrumb.
 */
export const getSlugsAndBreadcrumbs = async (destinationId: string, lang: string): Promise<SlugData | null> => {
  try {
    const response = await directusClient.get(`/items/destinations/`, {
      params: {
        filter: {
          id: { _eq: destinationId },
        },
        fields: [
          'id',
          'type',
          'translations.slug_permalink',
          'region_id',
          'province_id',
          'region_id.translations.slug_permalink',
          'province_id.translations.slug_permalink',
        ],
        lang,
      },
    });

    const destination = response.data.data[0]; // Aggiungi [0] qui per prendere il primo risultato

    if (!destination || !destination.translations || !destination.translations[0]) {
      console.error('Destination or translations not found');
      return null;
    }

    const type = destination.type;
    const currentSlug = destination.translations[0]?.slug_permalink || '';
    let regionSlug = '';
    let provinceSlug = '';
    let municipalitySlug = '';
    let breadcrumb: { label: string; path: string }[] = [];

    // Costruisci gli slug e il breadcrumb in base al tipo
    if (type === 'region') {
      regionSlug = currentSlug;
      breadcrumb = [{ label: regionSlug, path: `/${lang}/${regionSlug}` }];
    } else if (type === 'province') {
      regionSlug = destination.region_id?.translations?.[0]?.slug_permalink || '';
      provinceSlug = currentSlug;

      breadcrumb = [
        { label: regionSlug, path: `/${lang}/${regionSlug}` },
        { label: provinceSlug, path: `/${lang}/${regionSlug}/${provinceSlug}` },
      ];
    } else if (type === 'municipality') {
      regionSlug = destination.region_id?.translations?.[0]?.slug_permalink || '';
      provinceSlug = destination.province_id?.translations?.[0]?.slug_permalink || '';
      municipalitySlug = currentSlug;

      breadcrumb = [
        { label: regionSlug, path: `/${lang}/${regionSlug}` },
        { label: provinceSlug, path: `/${lang}/${regionSlug}/${provinceSlug}` },
        { label: municipalitySlug, path: `/${lang}/${regionSlug}/${provinceSlug}/${municipalitySlug}` },
      ];
    }

    return {
      regionSlug,
      provinceSlug,
      municipalitySlug,
      breadcrumb,
    };
  } catch (error) {
    console.error('Error fetching slugs and breadcrumbs:', error);
    return null;
  }
};
interface GetDestinationsParams {
  type: 'region' | 'province' | 'municipality';
  region_id?: string;
  province_id?: string;
  exclude_id?: string;
  lang: string;
}
class DirectusClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_DIRECTUS_URL is not defined');
    }
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
  
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(request => {
      // Assicuriamoci che l'URL sia IPv4
      if (request.url?.includes('::1')) {
        request.url = request.url.replace('::1', '127.0.0.1');
      }
      return request;
    });

    this.client.interceptors.response.use(
      response => response,
      error => Promise.reject(error)
    );
  }

  public async get(url: string, config?: object) {
    try {
      const response = await this.client.get(url, config);
      return response;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      throw error;
    }
  }

  public async testAuth(): Promise<boolean> {
    try {
      await this.client.get('/users/me');
      return true;
    } catch (error: any) {
      console.error('Auth test failed:', error);
      return false;
    }
  }

  async getCompanies(lang: string, filters: Record<string, any> = {}) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            active: { _eq: true },
            ...filters
          },
          fields: [
            'id',
            'website',
            'company_name',
            'featured_image',
            'images',
            'email',
            'phone',
            'category_id',
            'location_id',
            'featured',
            'socials',
            'translations.*'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          }
        }
      });

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  async getCompanyBySlug(slug: string, lang: string) {
    try {
      const response = await this.client.get('/items/companies', {
        params: {
          filter: {
            translations: {
              slug_permalink: { _eq: slug }
            }
          },
          fields: [
            'id',
            'featured_image',
            'images',
            'website',
            'company_name',
            'email',
            'phone',
            'category_id',
            'location_id',
            'featured',
            'socials',
            'translations.*'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          }
        }
      });

      return response.data?.data[0] || null;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }

  async getCompanyCategories(lang: string) {
    try {
      const response = await this.client.get('/items/company_categories', {
        params: {
          fields: [
            'id',
            'sort',
            'translations.*'
          ],
          deep: {
            translations: {
              _filter: {
                languages_code: {
                  _eq: lang
                }
              }
            }
          }
        }
      });

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching company categories:', error);
      return [];
    }
  }
  public async getArticleBySlug(slug: string, languageCode: string): Promise<Article | null> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          'filter': {
            'translations': {
              'slug_permalink': {
                '_eq': slug
              }
            }
          },
          'fields': [
            'id',
            'image',
            'date_created',
            'category.id',
            'category.translations.nome_categoria',
            'translations.titolo_articolo',
            'translations.description',
            'translations.seo_summary'
          ],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
            }
          }
        }
      });

      return response.data?.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  public async getCategories(languageCode: string): Promise<Category[]> {
    try {
      const response = await this.client.get('/items/categorias', {
        params: {
          'filter': {
            'visible': {
              '_eq': true
            }
          },
          'fields': [
            'id',
            'nome_categoria',
            'image',
            'visible',
            'translations.nome_categoria',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
            }
          }
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  
  public async getDestinationsByType(type: string, languageCode: string): Promise<Destination[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter': {
            'type': {
              '_eq': type
            }
          },
          'fields': [
            'id',
            'type',
            'image',
            'region_id',        // Aggiungi questo
            'province_id',      // E questo se serve
            'translations.destination_name',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep': {
            'translations': {
              '_filter': {
                'languages_code': {
                  '_eq': languageCode
                }
              }
            }
          }
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }
  
  public async getArticles(
    languageCode: string,
    offset: number = 0,
    limit: number = 10,
    filters: Record<string, any> = {},
    featuredStatus?: string
  ): Promise<{ articles: Article[]; total: number }> {
    try {
      // Controllo autenticazione
      const isAuth = await this.testAuth();
      if (!isAuth) {
        console.error("Authentication failed");
        return { articles: [], total: 0 };
      }
  
      // Lingua predefinita
      const defaultLanguage = "it";
  
      // Parametri base per la richiesta
      const params: Record<string, any> = {
        sort: "-date_created",
        fields: [
          "id",
          "image",
          "category_id",
          "date_created",
          "featured_status",
          "translations.titolo_articolo",
          "translations.seo_summary",
          "translations.slug_permalink",
        ],
        deep: {
          translations: {
            _filter: {
              languages_code: {
                _eq: languageCode, // Fallback dinamico
              },
            },
          },
        },
        offset: Math.max(offset, 0), // Garantisce che l'offset sia >= 0
        limit: Math.max(limit, 1),  // Garantisce che il limite sia >= 1
        meta: 'total_count', // Restituisce il conteggio totale
      };
  
      // Aggiungi filtri opzionali se presenti
      if (Object.keys(filters).length > 0) {
        params.filter = filters;
      }
  
      // Aggiungi filtro per featured_status
      if (featuredStatus) {
        params.deep.translations._filter.featured_status = { _eq: featuredStatus };
      }
  
      // Effettua la chiamata API
      const response = await this.client.get('/items/articles', { params });
  
      // Estrai articoli e totale dal meta
      const articles = response.data.data || [];
      const total = response.data.meta?.total_count || 0;
  
      return { articles, total };
    } catch (error: any) {
      // Gestione errori con messaggio dettagliato
      console.error("Error fetching articles:", error.message || error);
      return { articles: [], total: 0 };
    }
  }
  public async getDestinationBySlug(slug: string, languageCode: string): Promise<Destination | null> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[translations][slug_permalink][_eq]': slug,
          'fields[]': [
            'id',
            'type',
            'region_id',
            'region_id.translations.slug_permalink',
            'region_id.translations.destination_name',
            'province_id',
            'province_id.id', // Assicurati di recuperare l'ID della provincia
            'province_id.translations.slug_permalink',
            'province_id.translations.destination_name',
            'parent.translations.slug_permalink',
            'image',
            'translations.destination_name',
            'translations.seo_title',
            'translations.seo_summary',
            'translations.description',
            'translations.slug_permalink',
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'deep[province_id.translations][_filter][languages_code][_eq]': languageCode,
          'deep[region_id.translations][_filter][languages_code][_eq]': languageCode,
          'deep[parent.translations][_filter][languages_code][_eq]': languageCode,
        },
      });
  
      return response.data?.data[0] || null;
    } catch (error) {
      console.error('Error fetching destination:', error);
      return null;
    }
  }
  public async getDestinations({
    type,
    region_id,
    province_id,
    exclude_id,
    lang,
  }: {
    type: string;
    region_id?: string;
    province_id?: string;
    exclude_id?: string;
    lang: string;
  }): Promise<Destination[]> {
    try {
      const filterParams: Record<string, any> = {
        'filter[type][_eq]': type,
      };
  
      if (region_id) filterParams['filter[region_id][_eq]'] = region_id;
      if (province_id) filterParams['filter[province_id][_eq]'] = province_id;
      if (exclude_id) filterParams['filter[id][_neq]'] = exclude_id;
  
      const response = await this.client.get('/items/destinations', {
        params: {
          ...filterParams,
          'fields[]': [
            'id',
            'type',
            'image',
            'region_id',
            'province_id',
            'translations.destination_name',
            'translations.seo_summary',
            'translations.slug_permalink',
          ],
          'deep[translations][_filter][languages_code][_eq]': lang,
        },
      });
  
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }
  // Siblings: Destinations sharing the same `parent_Id` as the current destination
  public async getDestinationsBySiblingId(id: string, lang: string, province_id: string): Promise<Destination[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[province_id][_eq]': province_id,
          'filter[id][_neq]': id,
          'fields[]': [
            'id',
            'type',
            'image',
            'province_id',
            'parent.translations.slug_permalink',
            'parent.parent.translations.slug_permalink',
            'translations.*',
          ],
          'deep[translations][_filter][languages_code][_eq]': lang,
        },
      });

      if (!response.data.data) {
        console.error('No sibling destinations found');
        return [];
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching sibling destinations:', error);
      return [];
    }
  }
  // Children: Destinations where the `parent_Id` matches the current destination's `id`
  public async getDestinationsByParentId(province_id: string, languageCode: string): Promise<Destination[]> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[province_id][_eq]': province_id,
          'fields[]': [
            'id',
            'type',
            'image',
            'province_id',
            'region_id',
            'translations.destination_name',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
        }
      });
  
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching destinations by parent:', error);
      return [];
    }
  }
  public async getDestinationById(id: string, languageCode: string): Promise<Destination | null> {
    try {
      const response = await this.client.get('/items/destinations', {
        params: {
          'filter[id][_eq]': id,
          'fields[]': [
            'id',
            'parent.translations.slug_permalink',
            'translations.slug_permalink',
            'translations.destination_name',
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'deep[parent.translations][_filter][languages_code][_eq]': languageCode,
        },
      });

      return response.data?.data[0] || null;
    } catch (error) {
      console.error('Error fetching destination by ID:', error);
      return null;
    }
  }
  public async getArticlesByCategory(
    categorySlug: string, 
    languageCode: string, 
    limit: number = 10 // Limite di default
  ): Promise<Article[]> {
    try {
      const response = await this.client.get('/items/articles', {
        params: {
          'filter[category_id][translations][slug_permalink][_eq]': categorySlug,
          'fields[]': [
            'id',
            'image',
            'date_created',
            'translations.titolo_articolo',
            'translations.description',
            'translations.seo_summary',
            'translations.slug_permalink'
          ],
          'deep[translations][_filter][languages_code][_eq]': languageCode,
          'limit': limit // Aggiunta del limite
        }
      });
  
      return response.data?.data || [];
    } catch (error) {
      console.error('[getArticlesByCategory] Error fetching articles:', error);
      return [];
    }
  }
  
  private processDestinations(data: any[], searchLower: string, languageCode: string) {
    return data.map((d: any) => {
      let score = this.computeDestinationScore(d, searchLower);
  
      const regionName = d.region_id?.translations?.[0]?.destination_name?.toLowerCase();
      const provinceName = d.province_id?.translations?.[0]?.destination_name?.toLowerCase();
  
      if (regionName === searchLower) score += 10;
      if (provinceName === searchLower) score += 10;
      if (regionName?.includes(searchLower) || provinceName?.includes(searchLower)) score += 5; // Optional Chaining per evitare errori
  
      if (!d.translations?.[0]) return { ...d, score, link: '#' };
  
      let link = '#'; // Valore di default per semplificare la logica
      const slug = d.translations[0].slug_permalink;
      const regionSlug = d.region_id?.translations?.[0]?.slug_permalink;
      const provinceSlug = d.province_id?.translations?.[0]?.slug_permalink;
  
      switch (d.type) {
          case 'region': link = `/${languageCode}/${slug}/`; break;
          case 'province': if (regionSlug) link = `/${languageCode}/${regionSlug}/${slug}/`; break;
          case 'municipality': if (provinceSlug) link = `/${languageCode}/${provinceSlug}/${slug}/`; break;
      }
  
      return { ...d, score, link };
    })
    .filter((d: any) => d.score > 0 && d.link !== '#')
    .sort((a: any, b: any) => b.score - a.score);
  }
  
  private processArticles(data: any[], searchLower: string, languageCode: string) {
    return data.map((a: any) => ({
      ...a,
      score: this.computeArticleScore(a, searchLower),
      link: a.translations?.[0]?.slug_permalink ? `/${languageCode}/magazine/${a.translations[0].slug_permalink}/` : '#' // Condizione ternaria per evitare errori se slug_permalink non esiste
    }))
    .filter((a: any) => a.score > 0)
    .sort((a: any, b: any) => b.score - a.score);
  }
  
  private computeDestinationScore(item: any, searchLower: string): number {
    let score = 0;
    const translation = item.translations?.[0];
    if (!translation) return score;
  
    const titleLower = translation.destination_name?.toLowerCase() || '';
    const summaryLower = translation.seo_summary?.toLowerCase() || '';
    const descLower = translation.description?.toLowerCase() || '';
  
    if (titleLower.includes(searchLower)) score += 10;
    if (summaryLower.includes(searchLower)) score += 5;
    if (descLower.includes(searchLower)) score += 2;
  
    if (titleLower === searchLower) score += 15;
    if (titleLower.startsWith(searchLower)) score += 5;
  
    return score;
  }
  
  private computeArticleScore(item: any, searchLower: string): number {
      let score = 0;
      const translation = item.translations?.[0];
      if (!translation) return score;
    
      const titleLower = translation.titolo_articolo?.toLowerCase() || '';
      const summaryLower = translation.seo_summary?.toLowerCase() || '';
      const descLower = translation.description?.toLowerCase() || '';
    
      if (titleLower.includes(searchLower)) score += 10;
      if (summaryLower.includes(searchLower)) score += 5;
      if (descLower.includes(searchLower)) score += 2;
    
      if (titleLower === searchLower) score += 15;
      if (titleLower.startsWith(searchLower)) score += 5;
    
      return score;
  }

  async getDestinationsByRegionId(regionId: string, lang: string) {
    try {
      const response = await this.get('/items/destinations', {
        params: {
          filter: {
            region_id: { _eq: regionId }
          },
          fields: [
            'id',
            'type',
            'image',
            'province_id',
            'region_id',
            'translations.*'
          ],
          lang
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching destinations by region:', error);
      return [];
    }
  }

  async getDestinationsByProvinceId(provinceId: string, lang: string) {
    try {
      const response = await this.get('/items/destinations', {
        params: {
          filter: {
            province_id: { _eq: provinceId }
          },
          fields: [
            'id',
            'type',
            'image',
            'province_id',
            'region_id',
            'translations.*'
          ],
          lang
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching destinations by province:', error);
      return [];
    }
  }
}
// Assicurati che non sia dentro un blocco come una funzione o un'istruzione condizionale

export async function getDestinationsByType(type: string, languageCode: string) {
  try {
    const response = await directusClient.get('/items/destinations', {
      params: {
        filter: {
          type: {
            _eq: type,
          },
        },
        fields: [
          'id',
          'type',
          'image',
          'region_id',
          'province_id',
          'translations.destination_name',
          'translations.seo_title',
          'translations.seo_summary',
          'translations.slug_permalink',
        ],
        deep: {
          translations: {
            _filter: {
              languages_code: {
                _eq: languageCode,
              },
            },
          },
        },
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }
}

export const fetchArticleBySlug = async (slug: string, languageCode: string) => {
  if (!slug || !languageCode) {
    console.error('Error: Missing slug or language code');
    return null;
  }

  try {
    const response = await directusClient.get('/items/articles', {
      params: {
        'filter[translations][slug_permalink][_eq]': slug,
        'fields[]': [
          'id',
          'image',
          'date_created',
          'category.id',
          'category.translations.nome_categoria',
          'translations.titolo_articolo',
          'translations.description',
          'translations.seo_summary',
          'translations.slug_permalink',
        ],
        'deep[translations][_filter][languages_code][_eq]': languageCode,
        'deep[category.translations][_filter][languages_code][_eq]': languageCode,
      },
    });

    return response.data?.data[0] || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};


const directusClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
  },
});
export default directusClient;

function testAuth() {
  throw new Error('Function not implemented.');
}
