#!/usr/bin/env python3
import os, json, sys, re, urllib.request
from pathlib import Path

PASTEBIN_RAW = 'https://pastebin.com/raw/KgQ4jTy6'
GUARDASERIE_IT_URL = 'https://guardaserie.foo/'  # Source for guardoserie + guardaflix domains
DOMAINS_FILE = Path('config/domains.json')
BACKUP_FILE = Path('config/domains.jsonbk')
ATTENTION_FILE = Path('attenzione.check')

# Keys we care about for streamvix-lite
KEY_ORDER = [
    'animesaturn', 'animeunity', 'animeworld', 'vixsrc', 'guardoserie', 'guardaflix'
]

# Regex map for extracting canonical host from paste/site lines
HOST_RE = re.compile(r'https?://(www\.)?([^/\s]+)', re.I)

# Specific map overrides: key -> regex to pick best candidate from sources
KEY_HINTS = {
    'animesaturn': re.compile(r'animesaturn\.[a-z]{2,}'),
    'animeunity': re.compile(r'animeunity\.[a-z]{2,}'),
    'animeworld': re.compile(r'animeworld\.[a-z]{2,}'),
    'vixsrc': re.compile(r'vixsrc\.[a-z]{2,}|streamingcommunity\.[a-z]{2,}'),
}

def fetch(url: str) -> str:
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode('utf-8', 'replace')
    except Exception as e:
        print(f'[update_domains] fetch fail {url}: {e}', file=sys.stderr)
        return ''

def extract_hosts(text: str):
    hosts = set()
    for m in HOST_RE.finditer(text):
        hosts.add(m.group(2).lower())
    return hosts

def pick_host(hosts, hint_re):
    if not hint_re:
        return None
    cand = [h for h in hosts if hint_re.search(h)]
    if not cand:
        return None
    # Pick the shortest (usually base domain) deterministically
    cand.sort(key=lambda x: (len(x), x))
    return cand[0]

def load_json(path: Path):
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text('utf-8'))
    except Exception:
        return {}

def scrape_guardaserie_it(html: str):
    """
    Scrape guardoserie and guardaflix domains from guardaserie.foo HTML.
    """
    result = {}
    # guardoserie: Look for btn-outline-success link
    m = re.search(r'<a\s+href="https?://([^"/]+)/?"\s+class="btn btn-outline-success[^"]*"', html, re.I)
    if m:
        result['guardoserie'] = m.group(1).lower()
        print(f'[update_domains] Found guardoserie domain: {result["guardoserie"]}')

    # guardaflix: Look for btn-success link with GuardaPlay text
    m = re.search(r'<a\s+href="https?://([^"/]+)/?"\s+class="btn btn-success[^"]*"[^>]*>GuardaPlay', html, re.I)
    if m:
        result['guardaflix'] = m.group(1).lower()
        print(f'[update_domains] Found guardaflix domain: {result["guardaflix"]}')
    return result

def main():
    paste_txt = fetch(PASTEBIN_RAW)
    guardaserie_it_html = fetch(GUARDASERIE_IT_URL)

    reachable = True
    if not paste_txt and not guardaserie_it_html:
        reachable = False

    current = load_json(DOMAINS_FILE)
    if not current:
        current = {
            'animesaturn': 'animesaturn.cx',
            'vixsrc': 'vixsrc.to',
            'animeunity': 'animeunity.so',
            'animeworld': 'animeworld.ac',
            'guardoserie': 'guardoserie.bar',
            'guardaflix': 'guardaplay.bar'
        }

    if not reachable:
        ATTENTION_FILE.write_text('ATTENZIONE: pastebin o sito non raggiungibili. Nessun aggiornamento eseguito.\n', 'utf-8')
        print('pastebin/site unreachable -> written attenzione.check')
        return 2
    else:
        try:
            if ATTENTION_FILE.exists():
                ATTENTION_FILE.unlink()
        except Exception:
            pass

    paste_hosts = extract_hosts(paste_txt) if paste_txt else set()
    all_hosts = paste_hosts

    updated = {}
    # Initialize updated with only the keys we care about from current
    for key in KEY_ORDER:
        if key in current:
            updated[key] = current[key]

    changed = {}

    for key in KEY_ORDER:
        hint_re = KEY_HINTS.get(key)
        if not hint_re:
            continue
        new_host = pick_host(all_hosts, hint_re)
        if not new_host:
            continue
        old_host = updated.get(key)
        if old_host != new_host:
            updated[key] = new_host
            changed[key] = {'old': old_host, 'new': new_host}

    # guardoserie + guardaflix: scrape from guardaserie.foo
    if guardaserie_it_html:
        scraped = scrape_guardaserie_it(guardaserie_it_html)
        for key in ['guardoserie', 'guardaflix']:
            if key in scraped:
                new_host = scraped[key]
                old_host = updated.get(key)
                if old_host != new_host:
                    updated[key] = new_host
                    changed[key] = {'old': old_host, 'new': new_host}

    if not changed and len(updated) == len(current):
        print('No domain changes detected.')
        return 0

    # write backup with previous state
    BACKUP_FILE.write_text(json.dumps(current, indent=2, ensure_ascii=False) + '\n', 'utf-8')
    # write updated domains
    DOMAINS_FILE.write_text(json.dumps(updated, indent=2, ensure_ascii=False) + '\n', 'utf-8')

    print('Updated domains:', json.dumps(changed, indent=2))
    return 1

if __name__ == '__main__':
    rc = main()
    sys.exit(0)
