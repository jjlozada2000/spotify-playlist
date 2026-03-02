import { useState, useEffect, useRef, useCallback } from "react";
import { searchTracks, addSong, getPlaylist, formatDuration } from "./hooks/useSpotify.js";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({ track, onAdd, added }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAdd() {
    setLoading(true);
    setError(null);
    try {
      await onAdd(track.uri);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="track-card" data-added={added}>
      {track.albumArt ? (
        <img src={track.albumArt} alt={track.album} className="album-art" />
      ) : (
        <div className="album-art album-art--placeholder"><MusicIcon /></div>
      )}
      <div className="track-info">
        <span className="track-name">{track.name}</span>
        <span className="track-meta">{track.artist} · {track.album}</span>
        {error && <span className="track-error">{error}</span>}
      </div>
      <span className="track-duration">{formatDuration(track.durationMs)}</span>
      <button
        className="add-btn"
        onClick={handleAdd}
        disabled={loading || added}
        title={added ? "Added!" : "Add to playlist"}
      >
        {loading ? <SpinnerIcon /> : added ? <CheckIcon /> : <PlusIcon />}
      </button>
    </div>
  );
}

// ─── Playlist View ─────────────────────────────────────────────────────────
function PlaylistView({ playlist }) {
  if (!playlist) return null;
  return (
    <div className="playlist-view">
      <div className="playlist-header">
        {playlist.image && <img src={playlist.image} alt={playlist.name} className="playlist-cover" />}
        <div>
          <div className="playlist-label">Current Playlist</div>
          <div className="playlist-name">{playlist.name}</div>
          <div className="playlist-count">{playlist.tracks.length} songs</div>
        </div>
      </div>
      <div className="playlist-tracks">
        {playlist.tracks.map((t) => (
          <div key={t.uri} className="playlist-track">
            {t.albumArt && <img src={t.albumArt} alt={t.album} className="playlist-art" />}
            <div>
              <div className="playlist-track-name">{t.name}</div>
              <div className="playlist-track-artist">{t.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [addedUris, setAddedUris] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState("search"); // "search" | "playlist"
  const [playlist, setPlaylist] = useState(null);
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchTracks(query);
        setResults(data.tracks);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Load playlist when that tab is opened
  useEffect(() => {
    if (view === "playlist" && !playlist) {
      getPlaylist().then(setPlaylist).catch(console.error);
    }
  }, [view]);

  const handleAdd = useCallback(async (uri) => {
    await addSong(uri);
    setAddedUris((prev) => new Set([...prev, uri]));
    setPlaylist(null); // invalidate cache
    showToast("✓ Added to playlist!");
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Circular+Std:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green: #1DB954;
          --green-dim: #1aa34a;
          --bg: #0d0d0d;
          --surface: #181818;
          --surface2: #222;
          --border: #2a2a2a;
          --text: #ffffff;
          --text-muted: #a0a0a0;
          --text-dim: #666;
          --error: #f15e6c;
          --radius: 10px;
        }

        html, body { height: 100%; background: var(--bg); }
        body { font-family: 'Outfit', sans-serif; color: var(--text); -webkit-font-smoothing: antialiased; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem 5rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeUp 0.5s ease;
        }
        .header-logo {
          width: 48px; height: 48px;
          background: var(--green);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 0 32px rgba(29,185,84,0.35);
        }
        .header-logo svg { color: #000; }
        .header h1 {
          font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }
        .header p { color: var(--text-muted); font-size: 0.9rem; font-weight: 300; }

        .card {
          width: 100%; max-width: 520px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          animation: fadeUp 0.5s ease 0.1s both;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
        }
        .tab {
          flex: 1; padding: 0.875rem;
          background: none; border: none; color: var(--text-muted);
          font-family: inherit; font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em;
        }
        .tab:hover { color: var(--text); }
        .tab[data-active="true"] {
          color: var(--green);
          border-bottom: 2px solid var(--green);
          margin-bottom: -1px;
        }

        .search-box {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .search-box svg { color: var(--text-dim); flex-shrink: 0; }
        .search-box input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--text); font-family: inherit; font-size: 0.95rem;
        }
        .search-box input::placeholder { color: var(--text-dim); }
        .searching-indicator {
          color: var(--text-dim); font-size: 0.75rem; flex-shrink: 0;
        }

        .results {
          max-height: 420px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center; color: var(--text-dim);
          font-size: 0.9rem;
        }
        .empty-state-icon {
          font-size: 2rem; margin-bottom: 0.75rem;
        }

        .track-card {
          display: flex; align-items: center; gap: 0.875rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          animation: fadeUp 0.3s ease both;
        }
        .track-card:last-child { border-bottom: none; }
        .track-card:hover { background: var(--surface2); }
        .track-card[data-added="true"] { opacity: 0.6; }

        .album-art {
          width: 44px; height: 44px;
          border-radius: 6px; object-fit: cover; flex-shrink: 0;
        }
        .album-art--placeholder {
          background: var(--surface2);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-dim);
        }

        .track-info { flex: 1; min-width: 0; }
        .track-name {
          display: block; font-size: 0.875rem; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .track-meta {
          display: block; font-size: 0.75rem; color: var(--text-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 2px;
        }
        .track-error {
          display: block; font-size: 0.7rem; color: var(--error);
          margin-top: 3px;
        }
        .track-duration {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem; color: var(--text-dim); flex-shrink: 0;
        }

        .add-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .add-btn:hover:not(:disabled) {
          background: var(--green); border-color: var(--green); color: #000;
          transform: scale(1.1);
        }
        .add-btn:disabled { opacity: 0.5; cursor: default; }
        [data-added="true"] .add-btn { background: var(--green); border-color: var(--green); color: #000; }

        /* Playlist view */
        .playlist-view { padding: 1.25rem; }
        .playlist-header {
          display: flex; gap: 1rem; align-items: center;
          margin-bottom: 1.25rem; padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .playlist-cover {
          width: 64px; height: 64px; border-radius: 8px; object-fit: cover;
        }
        .playlist-label { font-size: 0.7rem; color: var(--green); text-transform: uppercase; letter-spacing: 0.08em; }
        .playlist-name { font-size: 1.1rem; font-weight: 600; margin: 0.2rem 0; }
        .playlist-count { font-size: 0.8rem; color: var(--text-muted); }

        .playlist-tracks { display: flex; flex-direction: column; gap: 0.5rem; }
        .playlist-track {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.5rem 0.75rem; border-radius: 8px;
          transition: background 0.15s;
        }
        .playlist-track:hover { background: var(--surface2); }
        .playlist-art { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
        .playlist-track-name { font-size: 0.85rem; font-weight: 500; }
        .playlist-track-artist { font-size: 0.75rem; color: var(--text-muted); }

        /* Toast */
        .toast {
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
          background: var(--green); color: #000;
          padding: 0.6rem 1.25rem; border-radius: 99px;
          font-size: 0.85rem; font-weight: 600;
          animation: toastIn 0.3s ease;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          z-index: 100;
        }
      `}</style>

      <div className="app">
        <div className="header">
          <div className="header-logo">
            <MusicIcon />
          </div>
          <h1>Add to the Playlist</h1>
          <p>Search for a song and add it to the queue</p>
        </div>

        <div className="card">
          <div className="tabs">
            <button className="tab" data-active={view === "search"} onClick={() => setView("search")}>
              Search
            </button>
            <button className="tab" data-active={view === "playlist"} onClick={() => setView("playlist")}>
              Playlist
            </button>
          </div>

          {view === "search" && (
            <>
              <div className="search-box">
                <SearchIcon />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search songs, artists, albums..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {searching && <span className="searching-indicator"><SpinnerIcon /></span>}
              </div>

              <div className="results">
                {results.length > 0 ? (
                  results.map((track, i) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      onAdd={handleAdd}
                      added={addedUris.has(track.uri)}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    {query ? (
                      searching ? "Searching..." : "No results found"
                    ) : (
                      <>
                        <div className="empty-state-icon">🎵</div>
                        <div>Type a song or artist name to search</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {view === "playlist" && (
            playlist
              ? <PlaylistView playlist={playlist} />
              : <div className="empty-state"><SpinnerIcon /> <span style={{ marginLeft: "0.5rem" }}>Loading...</span></div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
