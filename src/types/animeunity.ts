export interface AnimeUnityConfig {
  enabled: boolean;
  tmdbApiKey?: string;
  addonBase?: string; // URL base addon per endpoint sintetici (vixsynthetic.m3u8)
  animeunityDirect?: boolean;    // Direct master playlist (solo locale, IP-bound)
  animeunityDirectFhd?: boolean; // Synthetic FHD (solo locale, IP-bound)
}

export interface AnimeUnityResult {
  id: number;
  slug: string;
  name: string;
  episodes_count: number;
  language_type: 'Original' | 'Italian Dub' | 'Italian Sub';
}

export interface AnimeUnityEpisode {
  id: number;
  number: number;
  name: string;
}

export interface StreamData {
  embed_url?: string;
  mp4_url?: string;
  episode_page?: string;
}

// ✅ AGGIUNTO: Export mancante
export interface StreamForStremio {
  title: string;
  url: string;
  behaviorHints: {
    notWebReady?: boolean;
    [key: string]: any;
  };
  isSyntheticFhd?: boolean; // align with VixSrc synthetic FHD flag for provider label badge
}

export interface AnimeSaturnConfig {
  enabled: boolean;
  tmdbApiKey?: string;
}

export interface AnimeSaturnResult {
  title: string;
  url: string;
}

export interface AnimeSaturnEpisode {
  title: string;
  url: string;
}

// === AnimeWorld ===
export interface AnimeWorldConfig {
  enabled: boolean;
  tmdbApiKey?: string;
}

export interface AnimeWorldResult {
  id: string; // could be slug or numeric id
  slug: string;
  name: string;
  episodes_count: number;
  language_type?: string; // inferred (ITA, SUB ITA, CR ITA, ORIGINAL)
}

export interface AnimeWorldEpisode {
  id: string; // episode identifier
  number: number;
  name?: string;
}
