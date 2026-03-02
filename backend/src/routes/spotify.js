import { Router } from "express";
import { spotifyFetch } from "../middleware/spotifyToken.js";

const router = Router();

// GET /api/search?q=song+name
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query param: q" });

  try {
    const response = await spotifyFetch(
      `/search?q=${encodeURIComponent(q)}&type=track&limit=8`
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    const tracks = data.tracks.items.map((track) => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      albumArt: track.album.images[1]?.url || track.album.images[0]?.url,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
    }));

    res.json({ tracks });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/add-song
router.post("/add-song", async (req, res) => {
  const { uri } = req.body;
  if (!uri || !uri.startsWith("spotify:track:")) {
    return res.status(400).json({ error: "Invalid or missing track URI" });
  }

  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
  if (!playlistId) {
    return res.status(500).json({ error: "Playlist ID not configured" });
  }

  try {
    const addRes = await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({ uris: [uri] }),
    });

    if (!addRes.ok) {
  const err = await addRes.text();
  console.log("Spotify add error:", addRes.status, err);
  console.log("Playlist ID used:", playlistId);
  console.log("URI used:", uri);
  return res.status(addRes.status).json({ error: err });
}

    const data = await addRes.json();
    res.json({ success: true, snapshotId: data.snapshot_id });
  } catch (err) {
    console.error("Add song error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/playlist
router.get("/playlist", async (req, res) => {
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
  if (!playlistId) return res.status(500).json({ error: "Playlist ID not configured" });

  try {
    const response = await spotifyFetch(`/playlists/${playlistId}`);

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const items = data.tracks?.items || [];

    res.json({
      name: data.name,
      description: data.description,
      image: data.images?.[0]?.url,
      tracks: items
        .filter((i) => i.track)
        .map((i) => ({
          uri: i.track.uri,
          name: i.track.name,
          artist: i.track.artists.map((a) => a.name).join(", "),
          album: i.track.album.name,
          albumArt: i.track.album.images[1]?.url || i.track.album.images[0]?.url,
          durationMs: i.track.duration_ms,
        })),
    });
  } catch (err) {
    console.error("Playlist error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;