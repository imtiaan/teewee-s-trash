# Hobo Hustle Desktop App — Release Spec & Checklist (Windows/macOS)

Status: Draft v0.1

## Goals
- Ship a standalone desktop app with a GUI to manage the server, items, and configuration.
- Keep the current web-only version pristine; all desktop work happens on a dedicated copy.
- Support per-stream (per-tenant) leaderboards. Global rank is deferred from v0.1.
- Delay public release until the GUI app meets acceptance criteria and passes QA.

## Non-Goals
- No changes to overlay visuals or core chat/gameplay behavior in the existing web repo.
- No public global leaderboard UI embedded in stream chat; only per-stream boards.
- No cross-provider account linking UI at launch (can be added later on the website).

## Copy Strategy (Protect the Current Web Version)
- Create a dedicated desktop project copy: e.g., `HoboHustle-Desktop` as a separate folder/repo.
- Vendor in core modules (`public/`, `src/`, `.env.example`) from the web repo at a known snapshot.
- Do not edit the original web repo during desktop development.
- Any improvements to core logic are first made in the desktop copy and mirrored back to the web repo only after stability is proven.

## Architecture Overview
- Desktop app launches a local web server (e.g., `http://localhost:3000`) and provides a GUI for configuration and control.
- Electron-first approach (fits current Node backend); Tauri is a fallback if Electron becomes problematic.
- Local gameplay and overlay remain unchanged: loot images in `public/img/loot/` with `default.png` fallback.
- Central API aggregates per-stream stats for v0.1; the app posts events on loot awards and reads per-stream boards for `!board`. `!stats` shows local totals (stream rank optional).

## Identity & Multi-Tenancy
- Player identity is provider-scoped: `provider:user_id` (e.g., `twitch:123`, `youtube:abc`).
- Streamer tenant is uniquely identified by `provider + channel_id`.
- Per-stream totals power `!board` and (optionally) stream rank in `!stats`. Global rank is out of scope for v0.1.

## GUI Spec (MVP)
- Server Control: Start/Stop server, status indicator, port display.
- Settings: Edit `TWITCH_USERNAME`, `TWITCH_OAUTH_TOKEN`, `TWITCH_CHANNEL`, `PER_USER_COOLDOWN_MS`, `API_BASE_URL`, `API_KEY`, optional `PORT`. Validate and save safely.
  - Writes to `config.env` in the app data directory; manual editing is optional.
- Items: Read-only list initially; later add enable/disable, rarity filters, and image presence checks.
- Import/Export: Manage item configs (planned: `data/loot.json`).
- Logs: Show recent events, errors, chat commands; filtering by type.
- Preview Helpers: Buttons to open `/preview/common`, `/preview/rare`, `/preview/epic`, `/preview/legendary`.
- Test Buttons (GUI): Trigger overlay test events without chat.
  - `Test Common`, `Test Rare`, `Test Epic`, `Test Legendary` render overlays inline in the app.
  - `Test Chat Reply` simulates a bot reply in the logs; no external post.
- Admin Shortcuts: Buttons for `!pause`, `!resume`, `!skip`, `!clearqueue`, `!cooldown`.
- Overlay Style: Controls to tweak colors and position of overlay boxes.
  - Colors: primary/accent, glow intensity, border/outline, background tint, optional gradient.
  - Per-rarity accents: keep default rarity colors but allow overrides (rare/epic/legendary).
  - Position: anchor (top-left/top-right/bottom-left/bottom-right), X/Y offset, margins, optional scale.
  - Safe area presets: common OBS canvas sizes (720p/1080p) with snap guides.
 - Apply & preview: live preview in the GUI; persist changes.
 - Command Configuration: Customize chat command triggers to avoid conflicts.
   - Player commands: `dig`, `stats` (optional stream rank), `board`.
   - Moderator commands: `pause`, `resume`, `skip`, `clearqueue`, `cooldown`.
   - Prefix: default `!`; optionally configurable.
   - Validation: unique triggers; allowed chars `[a-z0-9_-]`; max length 20; reserved words warning.
   - Behavior: changes apply immediately; GUI shows effective commands and persists safely.
   - Presets: one-click "Set to Default" restores baseline command triggers and prefix.

### Hotkeys
- Purpose: speed up on-stream operations without searching for buttons.
- Defaults (Electron `CmdOrCtrl` semantics):
  - `Cmd/Ctrl + R` — Restart server (graceful stop/start).
  - `Cmd/Ctrl + P` — Toggle pause/resume gameplay.
  - `Cmd/Ctrl + K` — Skip current dig.
  - `Cmd/Ctrl + Q` — Clear queue.
  - `Cmd/Ctrl + ,` — Open Settings.
  - `Cmd/Ctrl + 1` — Test Common overlay.
  - `Cmd/Ctrl + 2` — Test Rare overlay.
  - `Cmd/Ctrl + 3` — Test Epic overlay.
  - `Cmd/Ctrl + 4` — Test Legendary overlay.
- Behavior:
  - Hotkeys are enabled only when the app window is focused.
  - Conflicting OS-reserved keys are avoided; hotkeys are configurable in a future update.
  - Respect reduced motion and do not trigger animations if disabled.

## UI Visual Style — Liquid Glass
- Objective: the desktop app’s GUI visually matches the overlay’s "liquid glass" look.
- Principles:
  - Glass panels with frosted blur (backdrop blur 12–18px) and subtle gradient.
  - Soft corner radii (8–16px) and inner/outer glow highlights consistent with overlay.
  - Translucent layers with balanced contrast for dark backgrounds.
  - Respect reduced motion settings; minimize aggressive animations.
- Design Tokens (CSS variables):
  - `--glass-bg`: translucent panel base (e.g., `rgba(255,255,255,0.06)`).
  - `--glass-gradient`: subtle linear gradient for depth.
  - `--glass-blur`: blur radius (e.g., `14px`).
  - `--radius`: corner radius (e.g., `12px`).
  - `--shadow-sm`: soft drop shadow for elevation.
  - `--glow-intensity`: sync with `style.glow.intensity` for highlight accents.
  - `--accent`: match `style.theme.accent` for borders/highlights.
  - `--text-primary`: match `style.theme.primary`.
- Implementation Notes:
  - Use CSS variables across GUI to ensure consistency with overlay color/style settings.
  - Provide a "Set to Default" in the Style panel that restores baseline tokens.
  - Ensure readability (WCAG AA) for text and controls on glass surfaces.
  - Apply the same glass tokens to the Settings, Logs, and Test panels for consistency.

## Configuration & Secrets
- Config file location:
  - Windows: `C:\\Users\\<user>\\AppData\\Roaming\\HoboHustle\\config.env`
  - macOS: `~/Library/Application Support/HoboHustle/config.env`
- Required keys:
  - `TWITCH_USERNAME`, `TWITCH_OAUTH_TOKEN`, `TWITCH_CHANNEL`
  - `API_BASE_URL` (central service URL), `API_KEY` (per-channel write key)
  - Optional: `PER_USER_COOLDOWN_MS`, `PORT`
- Secret storage roadmap:
  - Phase 1: File-based `.env` in app data.
  - Phase 2: Migrate sensitive `API_KEY` to OS keystore (Windows Credential Manager, macOS Keychain).

### Overlay Style Configuration
- Storage: `data/config.json` (desktop copy) holds `style.*` keys; the GUI reads/writes these.
- Keys (indicative):
  - `style.theme.primary`, `style.theme.accent`, `style.theme.backgroundTint`
  - `style.glow.intensity`, `style.glow.enabled`
  - `style.rarityOverrides.{common,rare,epic,legendary}` (optional)
  - `style.position.anchor` (`tl`, `tr`, `bl`, `br`), `style.position.offsetX`, `style.position.offsetY`, `style.position.scale`
- Behavior:
  - Defaults match the current web overlay; changes only affect the desktop copy.
  - GUI provides reset-to-defaults; validate color inputs and numeric ranges.

### Commands Configuration
- Storage: `data/config.json` (desktop copy) under `commands.*` keys; the GUI edits these.
- Keys (defaults shown):
  - `commands.prefix`: string — default `"!"`.
  - `commands.triggers.dig`: string — default `"dig"`.
  - `commands.triggers.stats`: string — default `"stats"`.
  - `commands.triggers.board`: string — default `"board"`.
  - `commands.triggers.pause`: string — default `"pause"`.
  - `commands.triggers.resume`: string — default `"resume"`.
  - `commands.triggers.skip`: string — default `"skip"`.
  - `commands.triggers.clearqueue`: string — default `"clearqueue"`.
  - `commands.triggers.cooldown`: string — default `"cooldown"`.
- Validation:
  - Allowed chars: `[a-z0-9_-]`; case-insensitive match;
  - Length: `1–20` characters; must be unique across all triggers.
  - Warnings for common conflicts (e.g., `help`, `song`, `uptime`), save allowed.
- Behavior:
  - Runtime command bindings update immediately.
  - Persist to `data/config.json`; reset-to-defaults supported.
  - Changes affect desktop copy only; web repo remains unchanged.
 - Presets:
   - GUI exposes "Set to Default" to restore `commands.prefix` and all `commands.triggers.*` to defaults.

#### Example: `data/config.json` defaults (v0.1)
```
{
  "style": {
    "theme": {
      "primary": "#FFFFFF",
      "accent": "#FFFFFF",
      "backgroundTint": "rgba(255, 255, 255, 0.06)"
    },
    "glow": {
      "enabled": true,
      "intensity": 1.0
    },
    "rarityOverrides": {
      "common": "rgba(255, 255, 255, 0.28)",
      "rare": "rgba(0, 163, 136, 0.45)",
      "epic": "rgba(129, 90, 247, 0.55)",
      "legendary": "rgba(237, 223, 191, 0.70)"
    },
    "position": {
      "anchor": "tr",
      "offsetX": 0,
      "offsetY": 0,
      "scale": 1.0,
      "margin": 24
    }
  },
  "commands": {
    "prefix": "!",
    "triggers": {
      "dig": "dig",
      "stats": "stats",
      "board": "board",
      "pause": "pause",
      "resume": "resume",
      "skip": "skip",
      "clearqueue": "clearqueue",
      "cooldown": "cooldown"
    }
  }
}
```

## Central API (Specs, No Code)
- Write: `POST /v1/event/dig`
  - Body: `{ provider, channel_id, user_id, points_delta, xp_delta, item_slug, rarity, ts }`
  - Auth: `API_KEY` (maps to a specific `channel_id`)
  - Result: `{ ok: true }` or error; server upserts aggregates and stores event.
- Read: `GET /v1/leaderboard/channel?provider=...&channel_id=...&limit=N`
  - Response: `[{ user_id, display_name, points, xp, rank }]`
- Read (optional for v0.1): `GET /v1/player/rank?provider=...&user_id=...&channel_id=...`
  - Response: `{ stream: { points, xp, rank } }`
- Caching & Resilience: Client caches reads 5–10s; write failures buffer locally and retry with backoff.

## Data Model (High-Level)
- `players`: `provider`, `user_id`, `latest_display_name`, `created_at`
- `channels`: `provider`, `channel_id`, `channel_name`, `api_key_hash`, `created_at`
- `channel_players`: `(provider, channel_id, user_id) → points, xp, last_seen`
- `global_players`: `(provider, user_id) → points, xp, last_seen`
- `dig_events`: append-only ledger for audit/history

## Packaging & Distribution
- Windows:
  - Output: `HoboHustle.exe` (unsigned) + bundled assets or assets alongside.
  - Distribution: zip; SmartScreen warning expected for unsigned.
  - Optional later: Electron Builder installer (NSIS) and code signing.
- macOS:
  - Output: `HoboHustle.app` (unsigned) or zipped CLI binary + assets.
  - Distribution: zip; Gatekeeper flow via right-click → Open.
  - Optional later: signing + notarization with Apple Developer account.

## Platform Targets
- Windows: `x64` build.
- macOS: `arm64` and `x64` builds.
- OBS Overlay: Browser Source pointing to `http://localhost:3000/`.

## Security & Privacy
- Outbound HTTPS only to `API_BASE_URL`.
- API key stored securely; never logged.
- Rate limits and tenancy enforcement on the central API.
- Privacy: public website shows display names only; opt-out flag supported later.

## Offline & Failure Modes
- API unreachable: gameplay continues locally with `data/players.json`.
- Backups & Retention: before saving new player data, previous file content is copied to `data/backups/players-YYYYMMDD-HHMMSS.json` if it changed. Keep up to `PLAYERS_BACKUP_MAX_FILES` (default 30) and `PLAYERS_BACKUP_MAX_DAYS` (default 14 days); older backups are pruned automatically. Writes use a temp file then rename for atomicity.
- `!stats`: show local totals; stream rank shown only if the API is enabled and reachable. No global rank in v0.1.
- `!board`: fall back to local top N.
- Buffered event writes retry with exponential backoff.

## QA Matrix
- Local-only: server start/stop; overlay preview; images resolve with `default.png`; commands (`!dig`, `!stats`, `!board`, `!pause`, `!resume`, `!skip`, `!clearqueue`, `!cooldown`).
- Connected: event posts succeed; per-stream board reads; `!stats` stream rank returns (if enabled); API outages handled.
- Performance: CPU/GPU usage during digs; memory footprint at idle; startup time; log responsiveness.
- Platform: Windows 10/11 and macOS Sonoma (arm64/x64) install/run; OBS compatibility.
- Security: API key never printed; config path correct; permissions reasonable.
 - Overlay Style: color/position changes apply instantly in preview, persist to config, and render identically in OBS.
 - Commands: overriding command triggers works immediately; persists across restarts; duplicates rejected with clear messaging.
  - Test Buttons: each rarity test renders correctly; chat reply test writes to logs only; no external calls.
  - UI Style: GUI matches liquid glass tokens; text contrast meets AA; reduced motion respected.
 - Hotkeys: default bindings function as specified when the window is focused; no OS conflicts.

## Acceptance Criteria
- Desktop app reliably manages server, settings, overlay preview.
- Per-stream leaderboard reads work when the API is available; `!stats` shows local totals (stream rank optional). No global rank in v0.1.
- On API failures, gameplay and chat remain smooth; graceful fallbacks are used.
- Visuals and image fallbacks match the web version; no regressions.
- Install experience acceptable for unsigned builds on both platforms.
 - Web repo remains unmodified throughout; all work occurs in the desktop copy.
 - Overlay customization: users can change box colors and position in GUI; changes persist and reflect in overlay preview and OBS.
 - Command customization: streamers can change command triggers and prefix to avoid conflicts; changes apply instantly and persist.
 - Test Buttons: streamers can trigger overlay previews from GUI; behavior consistent with URL previews; no network dependency.
 - Visuals: GUI adopts the liquid glass design consistently across panels and controls.
 - Hotkeys: specified default shortcuts perform correctly and do not conflict with OS-reserved shortcuts.

## Appendix: Overlay Style Keys & Validation (Spec Only)

This appendix defines configuration keys for overlay style, expected types, validation ranges, and defaults aligned with the current web overlay. These live in `data/config.json` in the desktop copy and are edited via the GUI.

### Keys (shape)
- `style.theme.primary`: color — base text/foreground accent.
- `style.theme.accent`: color — UI accent (borders, small highlights).
- `style.theme.backgroundTint`: color — translucent panel tint.
- `style.glow.enabled`: boolean — enable/disable glow pulse effects.
- `style.glow.intensity`: number — glow strength multiplier.
- `style.rarityOverrides.common`: color — optional override for common glow/accent.
- `style.rarityOverrides.rare`: color — optional override for rare glow/accent.
- `style.rarityOverrides.epic`: color — optional override for epic glow/accent.
- `style.rarityOverrides.legendary`: color — optional override for legendary glow/accent.
- `style.position.anchor`: enum — `tl`, `tr`, `bl`, `br`.
- `style.position.offsetX`: number — horizontal offset in pixels.
- `style.position.offsetY`: number — vertical offset in pixels.
- `style.position.scale`: number — scale factor.
- `style.position.margin`: number — additional margin from screen edges in pixels.

### Types & Formats
- Color: accepts `#RRGGBB`, `#RGB`, or `rgba(r, g, b, a)` where `r,g,b` ∈ `[0,255]`, `a` ∈ `[0,1]`.
- Boolean: `true`/`false`.
- Number: integer or float; see ranges below.
- Enum: one of the listed string values only.

### Validation & Ranges
- `style.glow.intensity`: clamp to `[0.0, 2.0]`.
- `style.position.offsetX`: clamp to `[-2000, 2000]`.
- `style.position.offsetY`: clamp to `[-2000, 2000]`.
- `style.position.scale`: clamp to `[0.80, 1.50]`.
- `style.position.margin`: clamp to `[0, 400]`.
- Colors: reject invalid strings; coerce `#RGB` → `#RRGGBB` when saving.

### Defaults (aligned with current overlay)
- `style.theme.primary`: `#FFFFFF`.
- `style.theme.accent`: `#FFFFFF` with low alpha in borders.
- `style.theme.backgroundTint`: `rgba(255, 255, 255, 0.06)`.
- `style.glow.enabled`: `true`.
- `style.glow.intensity`: `1.0`.
- `style.rarityOverrides.common`: `rgba(255, 255, 255, 0.28)`.
- `style.rarityOverrides.rare`: `rgba(0, 163, 136, 0.45)`.
- `style.rarityOverrides.epic`: `rgba(129, 90, 247, 0.55)`.
- `style.rarityOverrides.legendary`: `rgba(237, 223, 191, 0.70)`.
- `style.position.anchor`: `tr` (top-right) — matches current default layout.
- `style.position.offsetX`: `0`.
- `style.position.offsetY`: `0`.
- `style.position.scale`: `1.00`.
- `style.position.margin`: `24`.

### Behavior
- GUI edits apply live in the preview and persist to `data/config.json` in the desktop copy only.
- Reset to defaults restores the values above.
- If a rarity override is omitted, the overlay uses built-in defaults for that rarity.
- OBS safe area presets (720p/1080p) provide snap guides when moving the overlay.

### Error Handling (GUI)
- Invalid colors show inline validation and prevent saving until corrected.
- Out-of-range numbers are clamped when saving; GUI shows the clamped value.
- Missing `data/config.json` is auto-created with defaults on first run.

## Release Checklist
1) Confirm Electron-first; define criteria to switch to Tauri only if needed.
2) Establish the desktop project copy (`HoboHustle-Desktop`) and vendor core assets.
3) Implement GUI MVP (server control, settings, logs, preview, admin shortcuts).
4) Wire central API writes (event posts) with retry/backoff; add read endpoint for per-stream boards with TTL caching; stream rank optional.
5) Configure app data directories and `.env` persistence; validate settings.
6) Packaging: build Windows zip and macOS zip (unsigned); verify platform flows.
7) Documentation: Streamer Guide (install, configure, OBS setup), troubleshooting.
8) QA across the matrix; fix critical issues; re-run.
9) Acceptance review against criteria; prepare onboarding materials.
10) Optional: code signing/notarization; finalize public release package.

## Timeline (Indicative)
- Week 1: Finalize spec, API contracts, copy setup.
- Week 2: Settings management, server control, overlay preview; rank reads.
- Week 3: Event writes, resilience, caching; logs and admin shortcuts.
- Week 4: Packaging (Win/mac), docs, QA and polish.
- Week 5: Acceptance, optional signing/notarization, onboarding assets, release.

## Risk & Rollback
- If GUI/packaging stalls, the web version remains ready and unaffected.
- All desktop work occurs in the copy; no disruption to the current repo.
- Fallback: continue using and improving the web-only version while revisiting desktop packaging later.
