// Run this ONCE to get your refresh token: npm run oauth
// It starts a local server, opens Spotify login, then prints your refresh token.
// Paste the token into backend/.env as SPOTIFY_REFRESH_TOKEN

import "dotenv/config";
import http from "http";
import { exec } from "child_process";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPE = "playlist-modify-public playlist-modify-private";
const PORT = 8888;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in backend/.env first");
  process.exit(1);
}

const authUrl =
  `https://accounts.spotify.com/authorize?` +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
  });

console.log("\n🎵 Spotify OAuth Setup");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log("Opening Spotify login in your browser...");
console.log("(If it doesn't open, visit this URL manually:)");
console.log(authUrl + "\n");

// Try to open browser
const openCmd =
  process.platform === "darwin" ? "open" :
  process.platform === "win32" ? "start" : "xdg-open";
exec(`${openCmd} "${authUrl}"`);

// Local callback server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") return;

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end(`<h1>❌ Authorization denied: ${error}</h1>`);
    server.close();
    return;
  }

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>❌ No code received</h1>");
    server.close();
    return;
  }

  // Exchange code for tokens
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokens = await tokenRes.json();

  if (tokens.error) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`<h1>❌ Token exchange failed: ${tokens.error}</h1>`);
    server.close();
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <html>
      <body style="font-family: monospace; padding: 2rem; background: #191414; color: #1DB954;">
        <h1>✅ Success! Check your terminal for the refresh token.</h1>
        <p style="color: #fff;">You can close this tab.</p>
      </body>
    </html>
  `);

  console.log("\n✅ Authorization successful!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Add this to your backend/.env:\n");
  console.log(`SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  server.close();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Waiting for Spotify callback on http://localhost:${PORT}/callback`);
});
