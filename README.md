# Musikadventskalender Player

Eine moderne Web-App zum Anzeigen des aktuell laufenden Spotify-Songs mit einem eleganten Liquid Glass Design.

## Features

- Spotify OAuth Integration
- Echtzeit-Anzeige des aktuell laufenden Songs
- Liquid Glass UI Design
- Cloudflare Pages Deployment

## Setup

### 1. Spotify App erstellen

1. Gehe zu [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Erstelle eine neue App
3. Notiere Client ID und Client Secret
4. Füge Redirect URIs hinzu:
   - Lokal: `http://localhost:5174`
   - Production: `https://deine-app.pages.dev`

### 2. Lokale Entwicklung

1. Installiere Dependencies:
```bash
npm install
```

2. Erstelle `.env` Datei aus `.env.example`:
```bash
cp .env.example .env
```

3. Füge deine Spotify Credentials in `.env` ein:
```
VITE_SPOTIFY_CLIENT_ID=deine_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5174
```

4. Erstelle `.dev.vars` Datei für Wrangler (Cloudflare Functions):
```bash
cp .dev.vars.example .dev.vars
```

Füge deine Spotify Credentials in `.dev.vars` ein:
```
SPOTIFY_CLIENT_ID=deine_client_id
SPOTIFY_CLIENT_SECRET=dein_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5174
```

**Wichtig:** Wrangler lädt Umgebungsvariablen für Functions aus `.dev.vars`, nicht aus `.env`!

5. Starte den Development Server mit Wrangler:
```bash
npm run dev
```

**Wichtig:** Wir verwenden `wrangler pages dev`, um die Cloudflare Pages Functions lokal zu testen. Das startet:
- Vite auf Port 5175 (intern)
- Wrangler Proxy auf Port 5174 (öffentlich zugänglich)
- Die `/functions` APIs werden automatisch verfügbar

Die App ist dann unter `http://localhost:5174` erreichbar.

### 3. Cloudflare Pages Deployment

1. Build das Projekt:
```bash
npm run build
```

2. Deploye zu Cloudflare Pages:
   - Verbinde dein GitHub Repository mit Cloudflare Pages
   - Build Command: `npm run build`
   - Build Output Directory: `dist`

3. Setze Environment Variables in Cloudflare Pages:
   - `SPOTIFY_CLIENT_ID`: Deine Spotify Client ID
   - `SPOTIFY_CLIENT_SECRET`: Dein Spotify Client Secret
   - `SPOTIFY_REDIRECT_URI`: Deine Production URL (z.B. `https://deine-app.pages.dev`)

4. Setze auch die VITE_ Environment Variables:
   - `VITE_SPOTIFY_CLIENT_ID`: Deine Spotify Client ID
   - `VITE_SPOTIFY_REDIRECT_URI`: Deine Production URL

## Struktur

```
musikadventskalender-player/
├── functions/               # Cloudflare Pages Functions
│   └── api/
│       └── spotify/
│           ├── token.js    # Token Exchange
│           └── refresh.js  # Token Refresh
├── img/
│   └── background.png      # Hintergrundbild
├── src/
│   ├── components/
│   │   ├── NowPlaying.jsx  # Player Komponente
│   │   └── NowPlaying.css  # Liquid Glass Styling
│   ├── services/
│   │   └── spotify.js      # Spotify API Service
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Verwendung

1. Öffne die App
2. Klicke auf "Mit Spotify anmelden"
3. Autorisiere die App
4. Spiele einen Song auf Spotify ab
5. Der aktuelle Song wird unten in der Liquid Glass Pille angezeigt

## Technologien

- React 18
- Vite
- Spotify Web API
- Cloudflare Pages & Functions
- CSS3 (Backdrop Filter für Liquid Glass Effekt)
