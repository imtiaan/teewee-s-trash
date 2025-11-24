# Hobo Hustle Desktop App — Streamer Guide (Windows/macOS)

Status: Draft
Audience: Streamers using the desktop app with GUI

## v0.1 Client Notes
- Per-stream leaderboards only; global ranking is not included in v0.1.
- Endpoints used: `POST /v1/event/dig`, `GET /v1/leaderboard/channel`.
- Optional: `GET /v1/player/rank` (stream rank only; ignore `global`).
- See `docs/api-contract.md` for the full API contract.

## What You Get
- Local overlay at `http://localhost:3000` for OBS.
- Chat bot that handles queueing and awards loot.
- Optional connection to a central API for per-stream boards.

## Requirements
- Windows 10/11 or macOS 12+ (Intel/Apple Silicon).
- OBS 28+ with a Browser Source.
- Internet connection (for Twitch and optional central API).

## Download & Install
- Windows: download the zip, extract, run `HoboHustle.exe`.
  - Unsigned builds show a SmartScreen warning → click “More info” → “Run anyway”.
- macOS: download the zip, extract, open `HoboHustle.app`.
  - Unsigned apps: right-click the app → Open (or System Settings → Privacy & Security → Open Anyway).

## First Run & Config
- On first launch, the app creates a config file:
  - Windows: `C:\Users\<you>\AppData\Roaming\HoboHustle\config.env`
  - macOS: `~/Library/Application Support/HoboHustle/config.env`
- Configure via the GUI:
  - Open the app’s Settings panel and enter the fields below.
  - The app writes updates to `config.env` automatically; manual edits are optional.
- Fields in Settings:
  - `TWITCH_USERNAME` — your bot/stream account username
  - `TWITCH_OAUTH_TOKEN` — Twitch chat OAuth token (generate via trusted token generator or official tooling)
  - `TWITCH_CHANNEL` — your Twitch channel (lowercase)
  - Optional: `PER_USER_COOLDOWN_MS` — per-user dig cooldown (e.g., `8000`)
  - Optional: `PORT` — local server port (default `3000`)
-  - If using per-stream boards via the central API:
    - `API_BASE_URL` — your central API URL
    - `API_KEY` — per-channel write key provided by you/admin
  - Local-only mode: leave `API_BASE_URL` and `API_KEY` blank to use the built-in per-stream leaderboard stored locally.
- Click Save in the GUI. If the connection or port changes, restart the app (or stop/start the server in the GUI).

## OBS Setup
- Add a Browser Source:
  - URL: `http://localhost:3000/`
  - Width/Height: match your canvas (e.g., `1920x1080` or `1280x720`).
  - Position: place where you want the overlay (top-right is the default style).
- Tip: lock the source once placed to avoid accidental moves.

## Quick Preview (No Chat Needed)
- Open in your browser:
  - `http://localhost:3000/preview/common?user=Preview`
  - Also try `rare`, `epic`, `legendary` for different glow colors.
- Use this to validate visuals, animation, and image fallback (`default.png`).
 - GUI Test Buttons: In the app, use `Test Common/Rare/Epic/Legendary` to preview overlays inline (no chat required). Use `Test Chat Reply` to see a simulated bot message in Logs.

## Commands (Chat)
- Player (defaults; configurable): `!dig` — join queue/start digging; `!stats` — show totals (stream rank optional); `!board [n]` — top n in stream.
  - Moderator: `!pause`, `!resume`, `!skip`, `!clearqueue`, `!cooldown <ms|Xs>`.
  - Notes:
  - Per-stream leaderboard is shown in chat; no global rank in v0.1.
  - Cooldown applies per-user; joining the queue while someone is digging still works.

### Command Customization
- You can change command words (and the prefix) in the app’s GUI to avoid conflicts with other bots.
- Changes apply immediately and persist across restarts.
- Example: change `!stats` → `!hobo` to avoid overlap; then use `!hobo` in chat.
 - Preset: click "Set to Default" to restore the default commands and prefix.

## Hotkeys
- Control the app quickly while streaming:
  - `Cmd/Ctrl + R`: Restart server (graceful stop/start)
  - `Cmd/Ctrl + P`: Pause/resume gameplay
  - `Cmd/Ctrl + K`: Skip current dig
  - `Cmd/Ctrl + Q`: Clear queue
  - `Cmd/Ctrl + ,`: Open Settings
  - `Cmd/Ctrl + 1`: Test Common overlay
  - `Cmd/Ctrl + 2`: Test Rare overlay
  - `Cmd/Ctrl + 3`: Test Epic overlay
  - `Cmd/Ctrl + 4`: Test Legendary overlay
- Notes:
  - Hotkeys work when the app window is focused.
  - Reduced motion respected: overlay tests won’t animate when animations are disabled.

## Appearance
- The desktop app GUI uses the same "liquid glass" visual style as the overlay.
- Panels feature frosted blur, subtle gradients, soft corner radii, and matched accent colors.
- The app respects OS reduced-motion settings and maintains readable contrast.

## Per-Stream Leaderboard (Optional)
- Local-only (no configuration): `!board` uses per-stream totals stored locally. No external URL or key required.
- Optional central service: when `API_BASE_URL` and `API_KEY` are set, `!board` reads per-stream totals from the service (with local fallback). `!stats` may include stream rank.
- If the API becomes unavailable, gameplay continues; `!stats` shows local totals.

## Updates
- Manual: download the new zip and replace app files.
- Your `config.env` stays in the app data folder and is reused.

## Troubleshooting
- Overlay not visible in OBS:
  - Check the Browser Source URL is `http://localhost:3000/` and the app is running.
  - Confirm firewall/AV isn’t blocking localhost.
- Chat not responding:
  - Verify `TWITCH_USERNAME`, `TWITCH_OAUTH_TOKEN`, and `TWITCH_CHANNEL` in `config.env`.
  - Token scopes should permit chat (TMI/webchat tokens typically suffice).
- Leaderboard API unavailable:
  - Check `API_BASE_URL` and `API_KEY` values; the app logs when the API is unreachable.
- Missing images:
  - Ensure PNGs in `public/img/loot/`; overlay falls back to `default.png` if not found.
- Reduced motion:
  - The overlay respects OS reduced-motion settings; animations disable when enabled.

## Privacy & Security
- The app sends only dig award events to the central API when configured.
- `API_KEY` is stored locally; never printed in logs.
- Read endpoints for leaderboards are public; write endpoints require the key.

## Uninstall
- Delete the app folder.
- Remove `config.env` if you want to clear settings:
  - Windows: `C:\Users\<you>\AppData\Roaming\HoboHustle\config.env`
  - macOS: `~/Library/Application Support/HoboHustle/config.env`

## FAQ
- Multiple PCs/instances?
  - Run one instance per channel; concurrent instances may conflict.
- Can I tweak colors/position?
  - Yes, via the app’s GUI (desktop version). Changes persist and reflect in overlay/OBS.
- Cross-provider support?
  - Player identity is provider-scoped; future website may offer account linking.

## Support
- Check the app logs for errors.
- Consult the API/Release spec in `docs/` for deeper integration details.
- Contact the maintainer for provisioning `API_KEY` and onboarding.
