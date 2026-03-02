const API_URL = import.meta.env.VITE_API_URL || "";

export async function searchTracks(query) {
  const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function addSong(uri) {
  const res = await fetch(`${API_URL}/api/add-song`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add song");
  return data;
}

export async function getPlaylist() {
  const res = await fetch(`${API_URL}/api/playlist`);
  if (!res.ok) throw new Error("Failed to load playlist");
  return res.json();
}

export function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  return `${mins}:${secs}`; 
}