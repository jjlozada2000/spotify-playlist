// Handles getting a fresh access token using the stored refresh token.
// The access token expires every 60 min — this module refreshes it automatically.

let cachedAccessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error("Missing Spotify credentials in environment variables.");
  }

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh token: ${err}`);
  }

  const data = await res.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  console.log("✅ Spotify access token refreshed");
  return cachedAccessToken;
}

export async function spotifyFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}
