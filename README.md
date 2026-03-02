# 🎵 Spotify Jukebox

A QR-code-powered collaborative playlist app. Scan the QR code → search for a song → it gets added to a shared Spotify playlist.

## Project Structure

```
spotify-jukebox/
├── frontend/          # React app (Vite) — the submission page users see
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level pages
│       └── hooks/         # Custom React hooks (Spotify search, etc.)
├── backend/           # Node.js/Express — handles Spotify OAuth + API calls
│   └── src/
│       ├── routes/        # API route handlers
│       └── middleware/    # Auth middleware
├── docs/              # QR code output + setup notes
└── README.md
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- A [Spotify Developer App](https://developer.spotify.com/dashboard)
- A Spotify playlist you own

### 2. Environment Variables

**backend/.env**
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token   # obtained via OAuth setup (see docs/OAUTH_SETUP.md)
SPOTIFY_PLAYLIST_ID=your_playlist_id
PORT=3001
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3001
```

### 3. Run locally
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### 4. Generate QR Code
```bash
cd backend && npm run qr
# Outputs QR code image to docs/qr-code.png pointing to your hosted frontend URL
```

## Deployment

| Service | Use for |
|---|---|
| Vercel | Frontend (free) |
| Render / Railway | Backend (free tier) |

Once deployed, update `VITE_API_URL` to your backend URL, regenerate the QR code, and you're live.

## How it works

```
User scans QR → Frontend loads → User searches song
    → POST /api/add-song → Backend uses stored refresh token
    → Spotify API adds song to playlist ✅
```

See `docs/OAUTH_SETUP.md` for the one-time OAuth flow to get your refresh token.
