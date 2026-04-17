export interface Config {
  tmdbApiKey: string;
  bothLink: boolean;
  animeUnityEnabled: boolean;
  port: number;
}

export const config: Config = {
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  bothLink: process.env.BOTHLINK === 'true',
  animeUnityEnabled: process.env.ANIMEUNITY_ENABLED === 'true',
  port: parseInt(process.env.PORT || '7860')
};

export const validateConfig = (): boolean => {
  if (!config.tmdbApiKey) {
    console.error('TMDB_API_KEY is required');
    return false;
  }
  
  return true;
};
