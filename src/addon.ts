import { addonBuilder, getRouter, Manifest, Stream } from "stremio-addon-sdk";
import { getStreamContent, VixCloudStreamInfo, ExtractorConfig } from "./extractor";
import { mapLegacyProviderName, buildUnifiedStreamName, providerLabel } from './utils/unifiedNames';
import * as fs from 'fs';
import { landingTemplate } from './landingPage';
import * as path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { AnimeUnityProvider } from './providers/animeunity-provider';
import { AnimeWorldProvider } from './providers/animeworld-provider';

// --- Lightweight declarations to avoid TS complaints if @types/node non installati ---
declare const __dirname: string;
declare const process: any;
declare const Buffer: any;
declare function require(name: string): any;
declare const global: any;
import { AnimeUnityConfig } from './types/animeunity';
import { getGuardaflixStreams } from './providers/guardaflix';
import { getGuardoserieStreams } from './providers/guardoserie';

// ================= TYPES & INTERFACES =================
interface AddonConfig {
    tmdbApiKey?: string;
    animeunityEnabled?: boolean;
    animesaturnEnabled?: boolean;
    animeworldEnabled?: boolean;
    guardoserieEnabled?: boolean;
    guardaflixEnabled?: boolean;
    disableVixsrc?: boolean;
}

function debugLog(...args: any[]) { try { console.log('[DEBUG]', ...args); } catch { } }

// Global runtime configuration cache
const configCache: AddonConfig = {};

// ================= MANIFEST BASE =================
const baseManifest: Manifest = {
    id: "dance.kekko.streamvix-lite",
    version: "11.0.23",
    name: "streamvix-lite",
    description: "streamvix-lite addon con StreamingCommunity, Guardoserie, AnimeUnity, AnimeSaturn, AnimeWorld e Guardaflix",
    background: "https://raw.githubusercontent.com/qwertyuiop8899/streamvix/refs/heads/main/public/backround.png",
    types: ["movie", "series", "anime"],
    idPrefixes: ["tt", "kitsu", "mal", "tmdb"],
    catalogs: [],
    resources: ["stream"],
    behaviorHints: { configurable: true },
    config: [
        { key: "tmdbApiKey", title: "TMDB API Key", type: "text" },
        { key: "disableVixsrc", title: "Disable StreamingCommunity", type: "checkbox" },
        { key: "vixDirectFhd", title: "Enable StreamingCommunity FHD", type: "checkbox", default: false },
        { key: "animeunityEnabled", title: "Enable AnimeUnity", type: "checkbox" },
        { key: "animesaturnEnabled", title: "Enable AnimeSaturn", type: "checkbox" },
        { key: "animeworldEnabled", title: "Enable AnimeWorld", type: "checkbox" },
        { key: "guardoserieEnabled", title: "Enable Guardoserie", type: "checkbox" },
        { key: "guardaflixEnabled", title: "Enable Guardaflix", type: "checkbox" },
    ],
};

// Load custom configuration if available
function loadCustomConfig(): Manifest {
    try {
        const configPath = path.join(__dirname, '..', 'addon-config.json');
        if (fs.existsSync(configPath)) {
            const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return {
                ...baseManifest,
                id: customConfig.addonId || baseManifest.id,
                name: customConfig.addonName || baseManifest.name,
                description: customConfig.addonDescription || baseManifest.description,
                version: customConfig.addonVersion || baseManifest.version,
                logo: customConfig.addonLogo || baseManifest.logo,
                icon: customConfig.addonLogo || baseManifest.icon,
                favicon: customConfig.addonFavicon || customConfig.addonLogo || baseManifest.logo,
                background: baseManifest.background
            } as any;
        }
    } catch (error) {
        console.error('Error loading custom configuration:', error);
    }
    return baseManifest;
}

// Funzione per parsare la configurazione dall'URL
function parseConfigFromArgs(args: any): AddonConfig {
    const config: AddonConfig = {};
    if (!args || args === '' || args === 'undefined' || args === 'null') return config;
    if (typeof args === 'object' && args !== null) return args;
    if (typeof args === 'string') {
        try { return JSON.parse(args); } catch (error) { }
        try {
            const decoded = Buffer.from(decodeURIComponent(args), 'base64').toString('utf-8');
            return JSON.parse(decoded);
        } catch (error) { }
    }
    return config;
}

// Funzione per creare il builder
function createBuilder() {
    const manifest = loadCustomConfig();
    const builder = new addonBuilder(manifest);

    // === HANDLER STREAM ===
    builder.defineStreamHandler(
        async ({
            id,
            type,
            config: requestConfig
        }: {
            id: string;
            type: string;
            config?: any;
        }): Promise<{
            streams: Stream[];
        }> => {
            try {
                let normalizedType = type;
                if (type === 'film') normalizedType = 'movie';
                if (type === 'serie') normalizedType = 'series';
                type = normalizedType;

                console.log(`🔍 Stream request: ${normalizedType}/${id}`);

                let config: any = {};
                if (requestConfig && typeof requestConfig === 'object') {
                    config = { ...requestConfig };
                } else if (typeof requestConfig === 'string') {
                    config = parseConfigFromArgs(requestConfig);
                }

                const allStreams: Stream[] = [];

                const envFlag = (name: string) => {
                    const v = process.env[name];
                    if (v == null) return undefined;
                    return v.toLowerCase() === 'true';
                };

                const isDirectAPICall = Object.keys(config).length === 0;
                const animeUnityEnabled = envFlag('ANIMEUNITY_ENABLED') ?? (isDirectAPICall || config.animeunityEnabled === true);
                const animeSaturnEnabled = envFlag('ANIMESATURN_ENABLED') ?? (isDirectAPICall || config.animesaturnEnabled === true);
                const animeWorldEnabled = envFlag('ANIMEWORLD_ENABLED') ?? (isDirectAPICall || config.animeworldEnabled === true);
                const guardoserieEnabled = isDirectAPICall || (config.guardoserieEnabled === true);
                const guardaflixEnabled = isDirectAPICall || (config.guardaflixEnabled === true);
                const vixsrcEnabled = !(config.disableVixsrc === true);

                const tmdbApiKey = config.tmdbApiKey || process.env.TMDB_API_KEY || '40a9faa1f6741afb2c0c40238d85f8d0';

                // Parsing stagione/episodio
                let seasonNumber: number | null = null;
                let episodeNumber: number | null = null;
                let isMovie = false;
                if (id.startsWith('tt') || id.startsWith('tmdb:')) {
                    const parts = id.split(':');
                    if (id.startsWith('tt')) {
                        if (parts.length === 1) isMovie = true;
                        else if (parts.length === 2) episodeNumber = parseInt(parts[1]);
                        else if (parts.length === 3) { seasonNumber = parseInt(parts[1]); episodeNumber = parseInt(parts[2]); }
                    } else if (id.startsWith('tmdb:')) {
                        if (parts.length === 2) isMovie = true;
                        else if (parts.length === 3) episodeNumber = parseInt(parts[2]);
                        else if (parts.length === 4) { seasonNumber = parseInt(parts[2]); episodeNumber = parseInt(parts[3]); }
                    }
                }

                const providerPromises: Promise<Stream[]>[] = [];

                const runProvider = async (name: string, enabled: boolean, handler: () => Promise<{ streams: Stream[] }>, label: string): Promise<Stream[]> => {
                    if (!enabled) return [];
                    try {
                        const result = await handler();
                        if (result && result.streams) {
                            return result.streams.map(s => ({ ...s, name: label }));
                        }
                    } catch (error) {
                        console.error(`🚨 ${name} error:`, error);
                    }
                    return [];
                };

                // VixSrc
                if (vixsrcEnabled && !id.startsWith('kitsu:') && !id.startsWith('mal:')) {
                    providerPromises.push(runProvider('VixSrc', true, async () => {
                        const finalConfig: ExtractorConfig = {
                            tmdbApiKey,
                            vixDual: !!config.vixDual,
                            vixDirect: isDirectAPICall ? true : (config.vixDirect === true),
                            vixDirectFhd: isDirectAPICall ? false : (config.vixDirectFhd === true),
                            addonBase: config.addonBase || ''
                        };
                        const res = await getStreamContent(id, type, finalConfig);
                        if (!res) return { streams: [] };
                        return {
                            streams: res.map(st => ({
                                title: st.name || 'VixSrc',
                                url: st.streamUrl,
                                behaviorHints: { proxyHeaders: { request: { Referer: 'https://vixsrc.to/', Origin: 'https://vixsrc.to' } } } as any
                            }))
                        };
                    }, providerLabel('vixsrc')));
                }

                // Guardoserie
                if (guardoserieEnabled && type === 'series') {
                    providerPromises.push(runProvider('Guardoserie', true, async () => {
                        const res = await getGuardoserieStreams(type, id, tmdbApiKey);
                        return { streams: res || [] };
                    }, providerLabel('guardoserie')));
                }

                // Guardaflix
                if (guardaflixEnabled && type === 'movie') {
                    providerPromises.push(runProvider('Guardaflix', true, async () => {
                        const res = await getGuardaflixStreams(type, id, tmdbApiKey);
                        return { streams: res || [] };
                    }, providerLabel('guardaflix')));
                }

                // AnimeUnity
                if (animeUnityEnabled) {
                    providerPromises.push(runProvider('AnimeUnity', true, async () => {
                        const animeUnityProvider = new AnimeUnityProvider({ enabled: true, tmdbApiKey });
                        if (id.startsWith('kitsu:')) return animeUnityProvider.handleKitsuRequest(id);
                        if (id.startsWith('mal:')) return animeUnityProvider.handleMalRequest(id);
                        return animeUnityProvider.handleImdbRequest(id, seasonNumber, episodeNumber, isMovie);
                    }, providerLabel('animeunity')));
                }

                // AnimeSaturn
                if (animeSaturnEnabled) {
                    providerPromises.push(runProvider('AnimeSaturn', true, async () => {
                        const { AnimeSaturnProvider } = await import('./providers/animesaturn-provider');
                        const animeSaturnProvider = new AnimeSaturnProvider({ enabled: true, tmdbApiKey });
                        if (id.startsWith('kitsu:')) return animeSaturnProvider.handleKitsuRequest(id);
                        if (id.startsWith('mal:')) return animeSaturnProvider.handleMalRequest(id);
                        return animeSaturnProvider.handleImdbRequest(id, seasonNumber, episodeNumber, isMovie);
                    }, providerLabel('animesaturn')));
                }

                // AnimeWorld
                if (animeWorldEnabled) {
                    providerPromises.push(runProvider('AnimeWorld', true, async () => {
                        const { AnimeWorldProvider } = await import('./providers/animeworld-provider');
                        const animeWorldProvider = new AnimeWorldProvider({ enabled: true, tmdbApiKey });
                        if (id.startsWith('kitsu:')) return animeWorldProvider.handleKitsuRequest(id);
                        if (id.startsWith('mal:')) return animeWorldProvider.handleMalRequest(id);
                        return animeWorldProvider.handleImdbRequest(id, seasonNumber, episodeNumber, isMovie);
                    }, providerLabel('animeworld')));
                }

                const results = await Promise.all(providerPromises);
                for (const group of results) {
                    for (const s of group) allStreams.push(s);
                }

                return { streams: allStreams };
            } catch (error) {
                console.error('Stream extraction failed:', error);
                return { streams: [] };
            }
        }
    );

    return builder;
}

const app = express();
const builder = createBuilder();
const addonInterface = builder.getInterface();
const router = getRouter(addonInterface);

app.use((req, res, next) => {
    (global as any).lastExpressRequest = req;
    next();
});

app.get('/', (_req, res) => {
    const manifest = loadCustomConfig();
    res.setHeader('Content-Type', 'text/html');
    res.send(landingTemplate(manifest));
});

app.use(router);

const port = parseInt(process.env.PORT || '7860', 10);
app.listen(port, () => {
    console.log(`Addon server running on http://localhost:${port}`);
});
