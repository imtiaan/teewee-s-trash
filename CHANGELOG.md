# Changelog

All notable changes to this project are documented here.

## v0.2.0 – Backups, Hotkeys Docs, Porting Note

### Added
- Automatic `players.json` backups with atomic writes and retention. Defaults: keep 30 files, 14 days. Configurable via `PLAYERS_BACKUP_MAX_FILES` and `PLAYERS_BACKUP_MAX_DAYS`.
- Backup files stored under `data/backups/players-YYYYMMDD-HHMMSS.json` and only created when content changes.
- Release specification updated with hotkey support and data safety notes.
- README section on Desktop App Porting and repository separation strategy.

### Changed
- Storage writes now use atomic rename to avoid partial writes/corruption.
- Documentation aligned around image storage under `public/img/loot` and overlay slug behavior.

### Notes
- Player data remains git-ignored in `data/players.json`; backups are also git-ignored.
- See `docs/desktop-app-release-spec.md` for hotkeys, offline/failure modes, and QA.

## v0.1.1 – Board + Moderator Controls

### Added
- Moderator commands: `!pause` and `!resume` (mods/broadcaster only). Pauses queue, resumes processing.
- Documentation updates in README and `docs/GAMEPLAY.md` covering moderator commands and the `!board` leaderboard.

### Changed
- Leaderboard command renamed to `!board` (removed `!top` alias).

## v0.1.0 – First Tagged Release

### Added
- Comprehensive gameplay reference in `docs/GAMEPLAY.md` (items, values, XP, commands).
- Expanded GTA-themed loot table in `src/lootTable.js` with 50+ items per rarity.
- MIT `LICENSE` added to allow reuse and contributions.
- Node engines specified (`>=18`) in `package.json` for portability.
- README Quickstart plus Contributing and Releases guidance.

### Changed
- Removed all overlay sounds (beep and others) from `public/overlay.js`.
- Clarified per-user cooldown behavior and overlay connection parameter (`host`/`port`).

### Notes
- Player data persists in `data/players.json` (git-ignored).
- Environment variables loaded from `.env` (use `.env.example` as a template).
