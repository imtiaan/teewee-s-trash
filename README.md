# Teewee's Trash (Dig Queue)

Twitch chat-driven mini-game where viewers type `!dig` to join a queue, roll GTA-flavored loot, and display animated Liquid Glass cards in OBS.

## Setup

1) Install dependencies:
```bash
npm install
```
2) Provide Twitch credentials (bot account recommended):
```bash
export TWITCH_USERNAME=your_bot_username
export TWITCH_OAUTH_TOKEN=oauth:your_token_here
export TWITCH_CHANNEL=yourchannel
```
Or create a `.env` file (see `.env.example`) and let `dotenv` load it.
3) Optional: change ports or cooldowns in `src/config.js`.

Requirements
- Node `>=18` recommended (`type: module` ESM project).
- `.env` and `data/players.json` are git-ignored; each streamer keeps their own secrets and saved data locally.

## Run
In one terminal:
```bash
npm start
```
- Serves overlay at `http://localhost:3000/`
- WebSocket for overlay at `ws://localhost:8080`
- Connects bot to `#TWITCH_CHANNEL`

Add a Browser Source in OBS pointing to `http://localhost:3000` (1920x1080, refresh cache if issues).

Overlay on a different host
- The overlay connects to `ws://localhost:8080` by default. If your backend runs elsewhere, add `?ws=ws://YOUR_HOST:8080` to the overlay URL in OBS.

## Commands (chat)
- `!dig` — join queue or start digging if idle.
- `!stats` / `!points` — reply with your totals (points, XP, level).
- `!board [n]` — show the top `n` players by points (default 5, max 10).

Moderator Commands (mods or broadcaster)
- `!pause` — pause the queue; active dig continues but no new digs start.
- `!resume` — resume processing; starts next queued dig if idle.

## How it works
- Single active digger at a time. Others join FIFO queue (duplicates blocked).
- Per-user cooldown only (global cooldown removed).
- Loot uses weighted table in `src/lootTable.js`. Value adds to points and XP.
- Levels: `level = floor(xp / 1000) + 1` (adjust `levelStep` in config).
- Persistence: `data/players.json`.
- Overlay: `public/` static files; listens for WebSocket `loot` events to animate a Liquid Glass card. No audio is played.

## Structure
- `src/index.js` — bot, queue logic, WebSocket broadcast, Express static server.
- `src/config.js` — ports, cooldowns, level step, Twitch creds (env-driven).
- `src/lootTable.js` — loot definitions + picker + level helper.
- `src/storage.js` — persistence helpers.
- `public/` — overlay HTML/CSS/JS.
- `data/players.json` — saved player stats.

## Notes
- The bot exits if credentials are not set.
- Add `!board` or admin commands by extending the message handler in `src/index.js`.

## Contributing
- Fork the repo and create a feature branch for your change.
- Use Node `>=18` (ESM project with `type: module`).
- Run locally with a personal `.env` (do not commit secrets).
- Keep PRs focused and update docs when altering gameplay (e.g., loot table).
- Do not commit `data/players.json` or `.env`; both are git-ignored.
- Style: plain ESM JavaScript, minimal dependencies, no bundler required.

## Releases
- Bump `package.json` version when making notable changes.
- Tag releases (e.g., `v0.1.0`) and publish GitHub Releases with notes.
- Streamers can pin to a tag for stability or fork and customize.
## For Streamers: Quickstart
- Create a Twitch bot account (optional) and generate an OAuth Chat token: `TWITCH_OAUTH_TOKEN` (e.g., via https://twitchapps.com/tmi/). Keep this private.
- Copy `.env.example` to `.env` and fill in `TWITCH_USERNAME`, `TWITCH_OAUTH_TOKEN`, and `TWITCH_CHANNEL`.
- Run `npm start` and add a Browser Source in OBS pointing to `http://localhost:3000`.
- If hosting the bot remotely, update the overlay URL in OBS with `?ws=ws://YOUR_HOST:8080`.

Customization
- Edit loot and weights in `src/lootTable.js` to fit your stream’s theme.
- Adjust per-user cooldown and ports in `src/config.js`.
- Commands available: `!dig`, `!stats` / `!points`, `!board`. Add more in `src/index.js`.

Security & Persistence
- `.env` is ignored by git; never commit your token.
- Player progress persists to `data/players.json` (also git-ignored).
