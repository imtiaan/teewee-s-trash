import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { levelFromXp } from "./lootTable.js";

const playersPath = fileURLToPath(config.paths.players);
const playersDir = dirname(playersPath);
const backupDir = join(playersDir, "backups");
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

const ensureBackupDir = async () => {
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch {}
};

const readFileIfExists = async path => {
  try {
    return await fs.readFile(path, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
};

const timestamp = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}${M}${D}-${h}${m}${s}`;
};

const enforceRetention = async () => {
  const maxFiles = Number(process.env.PLAYERS_BACKUP_MAX_FILES || 30);
  const maxDays = Number(process.env.PLAYERS_BACKUP_MAX_DAYS || 14);
  let entries;
  try {
    entries = await fs.readdir(backupDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  const files = entries
    .filter(e => e.isFile() && e.name.startsWith("players-") && e.name.endsWith(".json"))
    .map(e => join(backupDir, e.name));
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const stats = await Promise.all(files.map(async f => ({
    path: f,
    stat: await fs.stat(f)
  })));
  const expired = stats.filter(({ stat }) => now - stat.mtimeMs > maxDays * dayMs).map(({ path }) => path);
  for (const p of expired) {
    try { await fs.unlink(p); } catch {}
  }
  const remainingEntries = (await fs.readdir(backupDir))
    .filter(name => name.startsWith("players-") && name.endsWith(".json"))
    .map(name => join(backupDir, name));
  if (remainingEntries.length > maxFiles) {
    const withStats = await Promise.all(remainingEntries.map(async p => ({ path: p, stat: await fs.stat(p) })));
    withStats.sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs);
    const toDelete = withStats.slice(0, withStats.length - maxFiles);
    for (const e of toDelete) {
      try { await fs.unlink(e.path); } catch {}
    }
  }
};

const persist = async players => {
  const newJson = JSON.stringify(players, null, 2);
  const currentJson = await readFileIfExists(playersPath);
  if (currentJson !== null && currentJson !== newJson) {
    await ensureBackupDir();
    const backupPath = join(backupDir, `players-${timestamp()}.json`);
    try {
      await fs.writeFile(backupPath, currentJson, "utf8");
    } catch {}
    await enforceRetention();
  }
  const tmpPath = join(playersDir, "players.json.tmp");
  await fs.writeFile(tmpPath, newJson, "utf8");
  await fs.rename(tmpPath, playersPath);
};

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
