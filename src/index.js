import "dotenv/config";
import express from "express";
import tmi from "tmi.js";
import { WebSocketServer } from "ws";
import { config } from "./config.js";
import { pickLoot } from "./lootTable.js";
import { getOrCreatePlayer, updatePlayerWithLoot, savePlayers, getPlayers } from "./storage.js";

const queue = [];
const displayNames = new Map();
const userCooldowns = new Map();
let activePlayer = null;
let paused = false;

const DIG_DELAY_MS = 1800;
const NEXT_CHAIN_DELAY_MS = 300;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
app.use(express.static("public"));

const webServer = app.listen(config.web.port, config.web.host, () => {
  console.log(`Web server ready at http://${config.web.host}:${config.web.port}`);
});

const overlayServer = new WebSocketServer({ port: config.overlay.port, host: config.overlay.host });
const overlayClients = new Set();

overlayServer.on("connection", ws => {
  overlayClients.add(ws);
  ws.on("close", () => overlayClients.delete(ws));
});

const broadcastOverlay = (type, data) => {
  const payload = JSON.stringify({ type, data });
  overlayClients.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
    }
  });
};

const client = new tmi.Client({
  options: { debug: false },
  identity: {
    username: config.twitch.username,
    password: config.twitch.oauth
  },
  channels: [config.twitch.channel]
});

const say = message => client.say(config.twitch.channel, message);

const normalizeUser = (username, displayName) => {
  const key = username.toLowerCase();
  const display = displayName || username;
  displayNames.set(key, display);
  return { key, display };
};

const isOnCooldown = key => {
  const now = Date.now();
  const userReady = now - (userCooldowns.get(key) ?? 0) >= config.cooldowns.perUserMs;
  // Global cooldown removed; only per-user cooldown applies.
  return !userReady;
};

const recordCooldown = key => {
  userCooldowns.set(key, Date.now());
};

const getQueuePosition = key => queue.indexOf(key) + 1;

const startNextInQueue = () => {
  if (paused || activePlayer || queue.length === 0) return;
  const nextKey = queue.shift();
  const display = displayNames.get(nextKey) || nextKey;
  activePlayer = nextKey;
  void startDigSequence(nextKey, display);
};

const startDigSequence = async (userKey, displayName) => {
  say(`@${displayName} is digging through the trash...`);
  broadcastOverlay("dig-start", { username: displayName });
  await wait(DIG_DELAY_MS);
  const loot = pickLoot();
  const player = await updatePlayerWithLoot(userKey, loot.value, config.loot.levelStep, displayName);
  say(`@${displayName} found: ${loot.name} (${loot.rarity}) worth ${loot.value} points! Total: ${player.points} pts | Level ${player.level}.`);
  broadcastOverlay("loot", {
    username: player.username || displayName,
    itemName: loot.name,
    rarity: loot.rarity,
    value: loot.value,
    totalPoints: player.points,
    xp: player.xp,
    level: player.level
  });
  activePlayer = null;
  recordCooldown(userKey);
  await savePlayers();
  await wait(NEXT_CHAIN_DELAY_MS);
  startNextInQueue();
};

const handleDig = tags => {
  const username = tags.username;
  if (!username) return;
  const displayName = tags["display-name"] || username;
  const { key, display } = normalizeUser(username, displayName);

  if (activePlayer === key) {
    say(`@${display} you're already digging right now.`);
    return;
  }

  if (queue.includes(key)) {
    const position = getQueuePosition(key);
    say(`@${display} you're already in the dig queue. Position: #${position}.`);
    return;
  }

  // If no one is currently digging, respect cooldown before starting.
  if (!activePlayer) {
    if (paused) {
      queue.push(key);
      const position = getQueuePosition(key);
      say(`@${display} you joined the dig queue. Position: #${position}.`);
      return;
    }
    if (isOnCooldown(key)) {
      say(`@${display} cooldown active. Try again in a moment.`);
      return;
    }
    activePlayer = key;
    recordCooldown(key);
    void startDigSequence(key, display);
    return;
  }

  // Someone else is digging: always allow joining the queue regardless of cooldown.
  queue.push(key);
  const position = getQueuePosition(key);
  say(`@${display} you joined the dig queue. Position: #${position}.`);
};

const handleStats = async tags => {
  const username = tags.username;
  if (!username) return;
  const displayName = tags["display-name"] || username;
  const { key, display } = normalizeUser(username, displayName);
  const player = await getOrCreatePlayer(key, display);
  say(`@${display} You have ${player.points} points, ${player.xp} XP (Level ${player.level}).`);
};

const startBot = async () => {
  if (config.twitch.oauth.includes("your_token_here") || config.twitch.username === "your_bot_username") {
    console.error("Set TWITCH_USERNAME and TWITCH_OAUTH_TOKEN before running the bot.");
    process.exit(1);
  }
  await client.connect();
  console.log(`Connected to Twitch chat as ${config.twitch.username} on #${config.twitch.channel}`);

  client.on("message", async (channel, tags, message, self) => {
    if (self || !message.startsWith("!")) return;
    const command = message.trim().split(" ")[0].toLowerCase();
    const isAdmin = tags.mod || (tags.badges && tags.badges.broadcaster === "1");
    if (command === "!dig") {
      handleDig(tags);
    } else if (command === "!stats" || command === "!points") {
      await handleStats(tags);
    } else if (command === "!board") {
      const parts = message.trim().split(/\s+/);
      const n = Math.max(1, Math.min(10, parseInt(parts[1], 10) || 5));
      const players = await getPlayers();
      const sorted = Object.entries(players)
        .map(([key, p]) => ({ name: p.username || key, points: p.points || 0 }))
        .sort((a, b) => b.points - a.points)
        .slice(0, n);

      if (sorted.length === 0) {
        say("No players yet. Use !dig to start collecting points!");
      } else {
        const line = sorted
          .map((p, i) => `#${i + 1} ${p.name} (${p.points} pts)`)
          .join(" | ");
        say(`Top ${sorted.length}: ${line}`);
      }
    } else if (command === "!pause") {
      if (!isAdmin) return;
      if (paused) {
        say("Queue is already paused.");
      } else {
        paused = true;
        say("Queue paused by moderator. No new digs will start; queue will hold.");
      }
    } else if (command === "!resume") {
      if (!isAdmin) return;
      if (!paused) {
        say("Queue is already running.");
      } else {
        paused = false;
        say("Queue resumed by moderator. Processing will continue.");
        startNextInQueue();
      }
    }
  });
};

startBot().catch(err => {
  console.error("Bot failed to start", err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await savePlayers();
  client.disconnect();
  overlayServer.close();
  webServer.close(() => process.exit(0));
});
