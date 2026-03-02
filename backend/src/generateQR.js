// Run after deploying: npm run qr
// Generates a QR code image pointing to your frontend URL

import "dotenv/config";
import QRCode from "qrcode";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  console.error("❌ Set FRONTEND_URL in backend/.env (e.g. https://your-app.vercel.app)");
  process.exit(1);
}

const outDir = join(__dirname, "../../docs");
await mkdir(outDir, { recursive: true });
const outPath = join(outDir, "qr-code.png");

await QRCode.toFile(outPath, FRONTEND_URL, {
  width: 400,
  margin: 2,
  color: {
    dark: "#191414",  // Spotify dark
    light: "#FFFFFF",
  },
});

console.log(`✅ QR code saved to docs/qr-code.png`);
console.log(`   Points to: ${FRONTEND_URL}`);