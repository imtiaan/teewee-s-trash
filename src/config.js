import { config as loadEnv } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env relative to project root to avoid CWD issues
loadEnv({ path: join(__dirname, "..", ".env") });

export const config = {
  twitch: {
    username: process.env.TWITCH_USERNAME || "your_bot_username",
    oauth: process.env.TWITCH_OAUTH_TOKEN || "oauth:your_token_here",
    channel: process.env.TWITCH_CHANNEL || "your_channel_name"
  },
  cooldowns: {
    perUserMs: 8000,
    globalMs: 2000
  },
  overlay: {
    host: process.env.OVERLAY_HOST || "0.0.0.0",
    port: Number(process.env.OVERLAY_PORT || 8080)
  },
  web: {
    host: process.env.WEB_HOST || "0.0.0.0",
    port: Number(process.env.WEB_PORT || 3000)
  },
  loot: {
    // Level calc: level 1 for 0-999 xp, level 2 for 1000-1999, etc.
    levelStep: 1000
  },
  paths: {
    players: new URL("../data/players.json", import.meta.url)
  }
};
