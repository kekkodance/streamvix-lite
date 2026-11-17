import { fetch } from 'undici';
import * as crypto from 'crypto';
import type { Request, Response } from 'express';

const SHARED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/** Abyss serves MP4 as fixed-size 2 MiB chunks via its /sora/ endpoint. */
const FRAGMENT_SIZE = 2 * 1024 * 1024;
const PROXY_SECRET = process.env.ABYSS_PROXY_SECRET || 'streamvix-lite-abyss-proxy-v1';
const PROXY_TTL_SECONDS = 7 * 24 * 60 * 60;
const SOURCE_CACHE_TTL_MS = 30 * 60 * 1000;
const SOURCE_CACHE_MAX = 300;
const sourceCache = new Map<string, { value: AbyssSource; expiresAt: number }>();

/**
 * Player hosts handled by the Abyss/HydraX platform.
 * Guardaflix currently embeds the player as https://mload.cam/?v=<slug>
 * (some titles use mloadm.cam).
 */
const ABYSS_HOSTS = [
    'mload.cam',
    'mloadm.cam',
    'abysscdn.com',
    'abyssplayer.com',
    'playhydrax.com',
    'hydraxcdn.biz',
    'short.icu',
    'embedplayabyss.top',
];

/** Everything needed to fetch a source's chunks from the /sora/ endpoint. */
export interface AbyssSegmentInfo {
    size: number;
    resId: number;
    md5Id: number;
    sub: string;
    domainSuffix: string;
}

export interface AbyssSource {
    /** `segmented` means the player never exposes a direct MP4; use the addon proxy. */
    kind: 'direct' | 'segmented';
    url?: string;
    info?: AbyssSegmentInfo;
    quality?: string;
    playerUrl: string;
    origin: string;
}

interface AbyssDatas {
    slug?: string;
    md5_id?: number | string;
    user_id?: number | string;
    media?: string;
    config?: {
        isDownload?: boolean;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export function isAbyssPlayerUrl(rawUrl: string): boolean {
    try {
        const host = new URL(rawUrl).hostname.toLowerCase();
        if (host === 'abyss.to' || host.endsWith('.abyss.to')) return true;
        return ABYSS_HOSTS.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
    } catch {
        return false;
    }
}

function unescapeJsonString(value: string): string {
    return value.replace(/\\(u[0-9a-fA-F]{4}|["\\/bfnrt])/g, (_match, escape: string) => {
        if (escape.startsWith('u')) {
            return String.fromCharCode(parseInt(escape.slice(1), 16));
        }
        switch (escape) {
            case 'b': return '\b';
            case 'f': return '\f';
            case 'n': return '\n';
            case 'r': return '\r';
            case 't': return '\t';
            case '"': return '"';
            case '\\': return '\\';
            case '/': return '/';
            default: return escape;
        }
    });
}

/**
 * The page stores a base64 encoded JSON object in `const datas = "..."`.
 * Its `media` field is a byte string, so it must be decoded as latin1
 * (not utf-8) to keep the encrypted bytes intact.
 */
function extractDatas(html: string): AbyssDatas | null {
    const match = html.match(/(?:const|var)\s+datas\s*=\s*"([^"]+)"/);
    if (!match) return null;

    let raw: Buffer;
    try {
        raw = Buffer.from(match[1].trim(), 'base64');
    } catch {
        return null;
    }

    try {
        const parsed = JSON.parse(raw.toString('latin1'));
        if (parsed && typeof parsed === 'object') return parsed as AbyssDatas;
    } catch {
        // Fall through to the byte-level parser below.
    }

    const text = raw.toString('latin1');
    const datas: AbyssDatas = {};

    const slug = text.match(/"slug"\s*:\s*"([^"]+)"/);
    if (slug) datas.slug = slug[1];

    const md5Id = text.match(/"md5_id"\s*:\s*(\d+)/);
    if (md5Id) datas.md5_id = Number(md5Id[1]);

    const userId = text.match(/"user_id"\s*:\s*(\d+)/);
    if (userId) datas.user_id = Number(userId[1]);

    const mediaStart = raw.indexOf('"media":"');
    const configStart = raw.indexOf('","config"');
    if (mediaStart >= 0 && configStart > mediaStart) {
        datas.media = unescapeJsonString(raw.subarray(mediaStart + 9, configStart).toString('latin1'));
    }

    const download = text.match(/"isDownload"\s*:\s*(true|false)/);
    if (download) datas.config = { isDownload: download[1] === 'true' };

    return datas.media ? datas : null;
}

function decryptMedia(media: string, userId: number | string, slug: string, md5Id: number | string): any | null {
    try {
        const seed = `${userId}:${slug}:${md5Id}`;
        // The key is the ASCII representation of the MD5 hex digest (32 bytes).
        const key = Buffer.from(crypto.createHash('md5').update(seed, 'utf8').digest('hex'), 'utf8');
        const decipher = crypto.createDecipheriv('aes-256-ctr', key, key.subarray(0, 16));
        const encrypted = Buffer.from(media, 'latin1');
        const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
        return JSON.parse(plain);
    } catch {
        return null;
    }
}

function normalizeQuality(label: unknown): string | undefined {
    if (typeof label !== 'string') return undefined;
    const value = label.trim();
    return value.length > 0 && value.length <= 16 ? value : undefined;
}

function normalizeUrl(value: string): string {
    return value.replace(/\\\//g, '/');
}

function findDomainSuffix(domains: string[], sub: string): string | undefined {
    const match = domains.find((domain) => domain === sub || domain.startsWith(`${sub}.`));
    if (match) {
        const dot = match.indexOf('.');
        if (dot > 0 && dot < match.length - 1) return match.slice(dot + 1);
    }

    const fallback = domains.find((domain) => typeof domain === 'string' && domain.includes('.'));
    if (fallback) {
        const dot = fallback.indexOf('.');
        if (dot > 0 && dot < fallback.length - 1) return fallback.slice(dot + 1);
    }
    return undefined;
}

function pickSource(payload: any): { kind: 'direct' | 'segmented'; url?: string; info?: AbyssSegmentInfo; quality?: string } | null {
    const mp4 = payload?.mp4 ?? {};
    const sources: any[] = Array.isArray(mp4.sources) ? [...mp4.sources] : [];
    const domains: string[] = Array.isArray(mp4.domains)
        ? mp4.domains.filter((domain: unknown): domain is string => typeof domain === 'string' && domain.includes('.'))
        : [];

    sources.sort((a, b) => (Number(b?.size) || 0) - (Number(a?.size) || 0));

    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;

        // Preferred path: every source exposes 2 MiB chunks through /sora/.
        const size = Number(source.size);
        const resId = Number(source.res_id);
        const sub = typeof source.sub === 'string' ? source.sub.trim() : '';
        const md5Id = Number(source.md5_id);
        if (Number.isFinite(size) && size > 0 && Number.isFinite(resId) && resId > 0 && /^[a-z0-9-]{1,64}$/i.test(sub)) {
            const domainSuffix = findDomainSuffix(domains, sub);
            if (domainSuffix) {
                return {
                    kind: 'segmented',
                    quality: normalizeQuality(source.label),
                    info: {
                        size,
                        resId,
                        md5Id: Number.isFinite(md5Id) && md5Id > 0 ? md5Id : 0,
                        sub,
                        domainSuffix,
                    },
                };
            }
        }

        // Some titles expose a real direct file instead.
        if (typeof source.file === 'string' && source.file.trim()) {
            return { kind: 'direct', url: normalizeUrl(source.file.trim()), quality: normalizeQuality(source.label) };
        }
    }

    const hls = payload?.hls;
    if (hls && typeof hls === 'object') {
        for (const key of ['file', 'url', 'master', 'src', 'source']) {
            const value = hls[key];
            if (typeof value === 'string' && value.trim()) {
                return { kind: 'direct', url: normalizeUrl(value.trim()) };
            }
        }
        if (Array.isArray(hls.sources)) {
            for (const source of hls.sources) {
                const value = source?.file || source?.url || source?.src;
                if (typeof value === 'string' && value.trim()) {
                    return { kind: 'direct', url: normalizeUrl(value.trim()), quality: normalizeQuality(source?.label) };
                }
            }
        }
    }

    return null;
}

export async function extractAbyssSource(playerUrl: string, referer?: string): Promise<AbyssSource | null> {
    let origin: string;
    try {
        origin = new URL(playerUrl).origin;
    } catch {
        return null;
    }

    const cached = sourceCache.get(playerUrl);
    if (cached && cached.expiresAt > Date.now()) {
        console.log(`[Abyss] Cache hit for ${origin}`);
        return cached.value;
    }

    try {
        const response = await fetch(playerUrl, {
            redirect: 'follow',
            headers: {
                'User-Agent': SHARED_UA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.7,en;q=0.6',
                'Referer': referer || `${origin}/`,
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) return null;

        const html = await response.text();
        const datas = extractDatas(html);
        if (!datas?.media || datas.slug == null || datas.md5_id == null || datas.user_id == null) {
            return null;
        }

        const payload = decryptMedia(datas.media, datas.user_id, datas.slug, datas.md5_id);
        if (!payload) return null;

        const picked = pickSource(payload);
        if (!picked) return null;

        if (picked.kind === 'segmented' && picked.info && !picked.info.md5Id) {
            picked.info.md5Id = Number(datas.md5_id);
        }
        if (picked.kind === 'segmented' && picked.info && !picked.info.md5Id) {
            return null;
        }

        console.log(`[Abyss] Resolved ${picked.quality || 'stream'} (${picked.kind}) from ${origin}`);
        const source: AbyssSource = {
            kind: picked.kind,
            url: picked.url,
            info: picked.info,
            quality: picked.quality,
            playerUrl,
            origin,
        };

        // Only segment metadata is stable enough to cache: it is derived from
        // the file itself, not from per-session URLs.
        if (source.kind === 'segmented' && source.info) {
            if (sourceCache.size >= SOURCE_CACHE_MAX) {
                const oldest = sourceCache.keys().next().value;
                if (oldest) sourceCache.delete(oldest);
            }
            sourceCache.set(playerUrl, {
                value: source,
                expiresAt: Date.now() + SOURCE_CACHE_TTL_MS,
            });
        }

        return source;
    } catch (error: any) {
        console.error(`[Abyss] Extraction failed: ${error?.message || error}`);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Chunk URL construction / proxy token
// ---------------------------------------------------------------------------

/** Reproduces the player's numeric key derivation: digits become byte values. */
function keyFromSize(size: number): string {
    const value = String(size);
    const bytes = Buffer.alloc(value.length);
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        bytes[i] = code >= 48 && code <= 57 ? code - 48 : code;
    }
    return crypto.createHash('md5').update(bytes).digest('hex');
}

function buildSoraToken(info: AbyssSegmentInfo, index: number): string {
    const key = Buffer.from(keyFromSize(info.size), 'utf8');
    const path = `/mp4/${info.md5Id}/${info.resId}/${info.size}/${FRAGMENT_SIZE}/${index}`;
    const cipher = crypto.createCipheriv('aes-256-ctr', key, key.subarray(0, 16));
    const encrypted = Buffer.concat([cipher.update(Buffer.from(path, 'utf8')), cipher.final()]).toString('latin1');
    const first = Buffer.from(encrypted, 'latin1').toString('base64').replace(/=/g, '');
    return Buffer.from(first, 'utf8').toString('base64').replace(/=/g, '');
}

export function buildAbyssChunkUrl(info: AbyssSegmentInfo, index: number): string {
    return `https://${info.sub}.${info.domainSuffix}/sora/${info.size}/${buildSoraToken(info, index)}`;
}

interface ProxyPayload {
    v: 1;
    z: number;
    r: number;
    m: number;
    b: string;
    d: string;
    e: number;
}

export function createAbyssProxyToken(info: AbyssSegmentInfo): string {
    const payload: ProxyPayload = {
        v: 1,
        z: info.size,
        r: info.resId,
        m: info.md5Id,
        b: info.sub,
        d: info.domainSuffix,
        e: Math.floor(Date.now() / 1000) + PROXY_TTL_SECONDS,
    };
    const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const signature = crypto.createHmac('sha256', PROXY_SECRET).update(body).digest('base64url');
    return `${body}.${signature}`;
}

export function parseAbyssProxyToken(token: string): AbyssSegmentInfo | null {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [body, signature] = parts;
    if (!body || !signature) return null;

    const expected = crypto.createHmac('sha256', PROXY_SECRET).update(body).digest('base64url');
    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    let payload: ProxyPayload;
    try {
        payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch {
        return null;
    }

    if (!payload || payload.v !== 1) return null;
    if (!Number.isFinite(payload.z) || payload.z <= 0 || payload.z > 20 * 1024 * 1024 * 1024) return null;
    if (!Number.isInteger(payload.r) || payload.r <= 0) return null;
    if (!Number.isInteger(payload.m) || payload.m <= 0) return null;
    if (typeof payload.b !== 'string' || !/^[a-z0-9-]{1,64}$/i.test(payload.b)) return null;
    if (typeof payload.d !== 'string' || !/^[a-z0-9.-]{1,128}$/i.test(payload.d)) return null;
    if (!Number.isFinite(payload.e) || payload.e < Math.floor(Date.now() / 1000)) return null;

    return { size: payload.z, resId: payload.r, md5Id: payload.m, sub: payload.b, domainSuffix: payload.d };
}

export function buildAbyssProxyUrl(info: AbyssSegmentInfo, addonBase: string): string {
    const base = addonBase.replace(/\/+$/, '');
    return `${base}/abyss/${createAbyssProxyToken(info)}.mp4`;
}

async function fetchAbyssChunk(info: AbyssSegmentInfo, index: number): Promise<Buffer> {
    const url = buildAbyssChunkUrl(info, index);
    let lastError: any;

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': SHARED_UA,
                    'Accept': '*/*',
                    'Referer': 'https://abysscdn.com/',
                },
                signal: AbortSignal.timeout(30000),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return Buffer.from(await response.arrayBuffer());
        } catch (error: any) {
            lastError = error;
            if (attempt < 2) {
                await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
            }
        }
    }

    throw lastError || new Error('Chunk download failed');
}

// ---------------------------------------------------------------------------
// HTTP range proxy (mounted at /abyss/:file)
// ---------------------------------------------------------------------------

function parseRangeHeader(header: string | undefined, size: number): { start: number; end: number } | null | 'invalid' {
    if (!header) return null;

    const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
    if (!match) return 'invalid';

    const [, rawStart, rawEnd] = match;
    if (!rawStart && !rawEnd) return 'invalid';

    let start: number;
    let end: number;
    if (!rawStart) {
        const suffixLength = parseInt(rawEnd, 10);
        if (!Number.isFinite(suffixLength) || suffixLength <= 0) return 'invalid';
        start = Math.max(0, size - suffixLength);
        end = size - 1;
    } else {
        start = parseInt(rawStart, 10);
        end = rawEnd ? parseInt(rawEnd, 10) : size - 1;
        if (!Number.isFinite(start) || !Number.isFinite(end)) return 'invalid';
        if (start > end || start >= size) return 'invalid';
        end = Math.min(end, size - 1);
    }

    return { start, end };
}

export async function handleAbyssProxy(req: Request, res: Response): Promise<void> {
    const rawFile = String((req.params as any)?.file || '');
    const token = rawFile.replace(/\.mp4$/i, '');
    const info = parseAbyssProxyToken(token);
    if (!info) {
        res.status(404).type('text/plain').end('Not found');
        return;
    }

    const size = info.size;
    const range = parseRangeHeader(req.headers.range, size);
    if (range === 'invalid') {
        res.status(416);
        res.setHeader('Content-Range', `bytes */${size}`);
        res.end();
        return;
    }

    const start = range ? range.start : 0;
    const end = range ? range.end : size - 1;
    const status = range ? 206 : 200;

    res.status(status);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', String(end - start + 1));
    if (range) res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'HEAD') {
        res.end();
        return;
    }

    let aborted = false;
    // Only the response tells us the client went away. Listening on `req`
    // would fire as soon as the request body is fully read (immediately for
    // GET) and would abort the download before it starts.
    const onClose = () => {
        if (!res.writableEnded) aborted = true;
    };
    res.on('close', onClose);

    const firstChunk = Math.floor(start / FRAGMENT_SIZE);
    const lastChunk = Math.floor(end / FRAGMENT_SIZE);

    try {
        for (let index = firstChunk; index <= lastChunk; index++) {
            if (aborted || res.writableEnded) return;

            const chunk = await fetchAbyssChunk(info, index);
            if (aborted || res.writableEnded) return;

            const chunkStart = index * FRAGMENT_SIZE;
            const from = Math.max(0, start - chunkStart);
            const to = Math.min(chunk.length - 1, end - chunkStart);
            if (to < from) continue;

            if (!res.write(chunk.subarray(from, to + 1))) {
                await new Promise<void>((resolve) => {
                    const done = () => {
                        res.off('drain', done);
                        res.off('close', done);
                        resolve();
                    };
                    res.once('drain', done);
                    res.once('close', done);
                });
            }
        }

        if (!aborted && !res.writableEnded) res.end();
    } catch (error: any) {
        console.error(`[AbyssProxy] ${error?.message || error}`);
        if (!res.headersSent) {
            res.status(502).type('text/plain').end('Bad gateway');
        } else {
            res.destroy();
        }
    }
}
