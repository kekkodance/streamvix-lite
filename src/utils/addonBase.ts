/**
 * Returns the URL the Stremio client used to reach this addon.
 * Providers that need to expose their own proxy endpoints (e.g. Abyss)
 * must generate absolute URLs that the client can reach, not localhost.
 */
export function getAddonBaseUrl(): string {
    const envBase = (process.env.ADDON_BASE_URL || process.env.STREAMVIX_ADDON_BASE || '').trim();
    if (envBase) return envBase.replace(/\/+$/, '');

    try {
        const lastReq: any = (global as any).lastExpressRequest;
        if (lastReq) {
            const forwarded = String(lastReq.headers?.['x-forwarded-proto'] || '').split(',')[0].trim();
            const protocol = forwarded || lastReq.protocol || 'http';
            const host = lastReq.get?.('host') || lastReq.headers?.host;
            if (host) return `${protocol}://${host}`;
        }
    } catch {
        // Fall through to the local fallback.
    }

    const port = process.env.PORT || '7860';
    return `http://localhost:${port}`;
}
