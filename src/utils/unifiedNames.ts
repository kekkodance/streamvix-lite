// Centralized unified naming utilities for all non-live TV streams
// Provides functions to build multi-line descriptive stream names.
// Live TV naming should NOT import or use these helpers (as per requirement).

export interface UnifiedNameOptions {
  baseTitle: string; // Raw title already including season/episode markers if needed
  isSub: boolean; // true => [SUB], false => [ITA]
  sizeBytes?: number; // Optional size indicator
  playerName?: string; // Optional player name (host or extractor)
  proxyOn: boolean; // Whether the delivered stream goes through proxy
  provider: string; // Provider key (vixsrc, animeunity, etc.)
  isFhdOrDual?: boolean; // Tag provider with HD marker (VixSrc dual/FHD etc.)
  hideProviderInTitle?: boolean; // If true, do not include provider label in the title/desc
  langFlag?: string; // Optional: override language display (e.g. '🇮🇹' or '🇬🇧'). If absent falls back to isSub logic.
}

export function formatBytesHuman(b?: number): string {
  if (!b || b <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0; let v = b;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  const num = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return `${num} ${units[i]}`;
}

export function providerLabel(provider: string, isFhd?: boolean): string {
  let label = provider;
  if (provider === 'vixsrc') label = 'StreamingCommunity';
  if (provider === 'animeunity') label = 'AnimeUnity';
  if (provider === 'animesaturn') label = 'AnimeSaturn';
  if (provider === 'animeworld') label = 'AnimeWorld';
  if (provider === 'guardoserie') label = 'GuardoSerie';
  if (provider === 'guardaflix') label = 'Guardaflix';
  
  return isFhd ? `${label} FHD` : label;
}

export function buildUnifiedStreamName(opts: UnifiedNameOptions): string {
  const lines: string[] = [];
  lines.push(opts.baseTitle);
  // Language line: use explicit langFlag if provided, otherwise legacy isSub logic
  if (opts.langFlag) {
    lines.push(opts.langFlag);
  } else {
    lines.push(opts.isSub ? 'SUB' : 'ITA');
  }
  if (opts.sizeBytes) {
    const sz = formatBytesHuman(opts.sizeBytes);
    if (sz) lines.push(sz);
  }
  if (opts.playerName) lines.push(opts.playerName);
  
  if (!opts.hideProviderInTitle) {
    lines.push(providerLabel(opts.provider, opts.isFhdOrDual));
  } else if (opts.isFhdOrDual) {
    lines.push('1080p');
  }
  return lines.join('\n');
}

/** Maps detected audio language codes to display flag string */
export function langToFlag(langs: string[]): string {
  const hasIt = langs.some(l => l === 'it' || l === 'ita' || l.startsWith('it'));
  const hasEn = langs.some(l => l === 'en' || l === 'eng' || l.startsWith('en'));
  if (hasIt && hasEn) return 'ITA ENG';
  if (hasIt) return 'ITA';
  if (hasEn) return 'ENG';
  if (langs.length > 0) return langs[0].toUpperCase();
  return 'ITA'; // fallback default
}

// Simple legacy name mapping helper for transitional phase
// Converts legacy addon.ts provider name strings (e.g. 'streamvix-lite AU') into new label.
export function mapLegacyProviderName(legacy: string): string {
  const lower = legacy.toLowerCase();
  if (lower.includes('streamvix vx')) return providerLabel('vixsrc');
  if (lower.includes('streamvix au')) return providerLabel('animeunity');
  if (lower.includes('streamvix as')) return providerLabel('animesaturn');
  if (lower.includes('streamvix aw')) return providerLabel('animeworld');
  if (lower.includes('streamvix gs')) return providerLabel('guardoserie');
  return legacy;
}
