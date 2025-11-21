import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { levelFromXp } from "./lootTable.js";

const playersPath = fileURLToPath(config.paths.players);
let cache = null;

const loadPlayersFromDisk = async () => {
  try {
    const raw = await fs.readFile(playersPath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    return parsed;
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(playersPath, "{}", "utf8");
      return {};
    }
    throw err;
  }
};

const persist = players => fs.writeFile(playersPath, JSON.stringify(players, null, 2));

export const getPlayers = async () => {
  if (!cache) {
    cache = await loadPlayersFromDisk();
  }
  return cache;
};

export const getOrCreatePlayer = async (username, displayName) => {
  const players = await getPlayers();
  const key = username.toLowerCase();
  if (!players[key]) {
    players[key] = { username: displayName || username, points: 0, xp: 0, level: 1 };
  } else if (displayName && players[key].username !== displayName) {
    players[key].username = displayName;
  }
  return players[key];
};

export const updatePlayerWithLoot = async (username, value, levelStep, displayName) => {
  const player = await getOrCreatePlayer(username, displayName);
  player.points = (player.points || 0) + value;
  player.xp = (player.xp || 0) + value;
  player.level = levelFromXp(player.xp, levelStep);
  await persist(cache);
  return player;
};

export const savePlayers = async () => {
  if (cache) {
    await persist(cache);
  }
};
