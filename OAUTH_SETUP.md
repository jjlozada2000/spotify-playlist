# OAuth Setup Guide

This is a **one-time setup** to get the refresh token your backend needs to add songs to Spotify on your behalf.

---

## Step 1: Create a Spotify Developer App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Fill in:
   - **App name**: Jukebox (or anything)
   - **Redirect URIs**: Add `http://localhost:8888/callback`
   - **APIs used**: Check "Web API"
4. Hit **Save**
5. From the app's settings, copy your **Client ID** and **Client Secret**

---

## Step 2: Get Your Playlist ID

1. Open Spotify and find the playlist you want people to add to
2. Click the three dots → **Share** → **Copy link to playlist**
3. The URL looks like: `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`
4. The playlist ID is the part after `/playlist/` → `37i9dQZF1DXcBWIGoYBM5M`

---

## Step 3: Set Up Your .env

Copy `backend/.env.example` to `backend/.env` and fill in:

```
SPOTIFY_CLIENT_ID=<from step 1>
SPOTIFY_CLIENT_SECRET=<from step 1>
SPOTIFY_PLAYLIST_ID=<from step 2>
```

Leave `SPOTIFY_REFRESH_TOKEN` blank for now.

---

## Step 4: Run the OAuth Flow

```bash
cd backend
npm install
npm run oauth
```

This will:
1. Open your browser to Spotify's login/permission page
2. Ask you to approve access to modify playlists
3. Redirect back to a local server
4. Print your **refresh token** in the terminal

Copy the printed token into your `.env`:

```
SPOTIFY_REFRESH_TOKEN=AQD...your_token_here
```

---

## Step 5: Test It

```bash
# Start the backend
npm run dev

# In another terminal, test the API
curl "http://localhost:3001/api/search?q=bohemian+rhapsody"
```

You should get back a list of tracks. If you do, you're set!

---

## How the Token Flow Works

```
┌─────────────────────────────────────────────────────────┐
│  ONE-TIME SETUP (npm run oauth)                          │
│                                                          │
│  You → Spotify Login → Authorization Code               │
│  Code → Exchange → Access Token + Refresh Token         │
│  Refresh Token → Saved in .env (never expires*)         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  EVERY REQUEST (automatic, handled by backend)           │
│                                                          │
│  Refresh Token → /api/token → Fresh Access Token        │
│  Access Token → Spotify API → Add song / Search         │
│  (access token cached for 55 min, then auto-refreshed)  │
└─────────────────────────────────────────────────────────┘
```

*Refresh tokens don't expire unless you revoke the app's access in your Spotify account settings.

---

## Scopes Requested

| Scope | Why |
|-------|-----|
| `playlist-modify-public` | Add songs to public playlists |
| `playlist-modify-private` | Add songs to private playlists |

---

## Troubleshooting

**"INVALID_CLIENT: Invalid redirect URI"**
→ Make sure `http://localhost:8888/callback` is in your Spotify app's Redirect URIs (exact match, no trailing slash)

**"Insufficient client scope"**
→ Re-run `npm run oauth` — the scopes were updated

**Songs not being added**
→ Confirm `SPOTIFY_PLAYLIST_ID` is correct and that the account you authorized *owns* that playlist
