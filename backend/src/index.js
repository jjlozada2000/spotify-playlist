import "dotenv/config";
import express from "express";
import cors from "cors";
import spotifyRoutes from "./routes/spotify.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Spotify routes
app.use("/api", spotifyRoutes);

app.listen(PORT, () => {
  console.log(`🎵 Jukebox backend running on http://localhost:${PORT}`);
});