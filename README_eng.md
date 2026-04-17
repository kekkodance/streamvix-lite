# 🎬 streamvix-lite

An addon for Stremio that scrapes streaming sources from popular Italian sites including StreamingCommunity, AnimeUnity, AnimeSaturn, AnimeWorld, Guardaserie, and Guardaflix to let you watch movies, TV series, and anime with maximum simplicity.

---

## ✨ Main Features

* **✅ Movie Support:** Find streaming streams for movies using their TMDB ID.
* **📺 TV Series Support:** Find streams for every episode of a TV series, based on TMDB ID in season/episode format.
* **⛩️ Anime Support:** Find streams for every episode of a specific Anime; now supports search from Cinemeta, TMDB, and Kitsu metadata.
* **🔗 Perfect Integration:** Integrates beautifully with the Stremio interface for a smooth user experience.
* **🔓 Direct Streaming:** High-performance direct streams that work without the need for external proxies in most environments.
* **🎦 Synthetic FHD:** Advanced manifest rewriting for VixSrc (StreamingCommunity) to provide high-quality multi-audio streams.

---

## 🔧 Configuration

### 📋 Required Configuration
- **TMDB_API_KEY**: TMDB API key for metadata (Recommended for best matching).
- **ANIMEUNITY_ENABLED**: Enable AnimeUnity (true/false).
- **ANIMESATURN_ENABLED**: Enable AnimeSaturn (true/false).
- **ANIMEWORLD_ENABLED**: Enable AnimeWorld (true/false).

### 🖥️ Environment Variable for Local / VPS (VixSrc FHD)

To reliably obtain Full HD VixSrc streams (forced `&h=1` + synthetic endpoint) on **local or VPS/self‑hosted** installations you must set an environment variable telling the extractor what the publicly reachable BASE URL of your addon is.

Set it (WITHOUT trailing slash):

```
ADDON_BASE_URL=https://your-domain-or-ip
```

---

### 🐳 Docker Compose (Advanced / Self-Hosting)

Ideal if you have a server or VPS and want to manage the addon via Docker.

```yaml
services:
  streamvix-lite:
    image: qwertyuiop8899/streamvix-lite:latest
    container_name: streamvix-lite
    ports:
      - "7860:7860"
    environment:
      - TMDB_API_KEY=your_tmdb_key          # https://www.themoviedb.org/settings/api
      - ANIMEUNITY_ENABLED=true
      - ANIMESATURN_ENABLED=true
      - ANIMEWORLD_ENABLED=true
      - ADDON_BASE_URL=https://streamvix-lite.yourdomain.com
    restart: always
```

---

### 💻 Local Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/qwertyuiop8899/streamvix-lite.git
    cd streamvix-lite
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Build and Start:**
    ```bash
    pnpm run build
    ```
    ```bash
    pnpm start
    ```
The addon will be available locally at `http://localhost:7860`.

---

#### ⚠️ Disclaimer

This project is intended exclusively for educational purposes. The user is solely responsible for how it is used. Make sure you respect copyright laws and the terms of service of the sources used.

## Credits

Original extraction logic based on various community open-source projects.
Thanks to https://github.com/ThEditor https://github.com/ThEditor/stremsrc for the inspiration.
Special thanks to @UrloMythus for the extractors and anime mapping logic.
