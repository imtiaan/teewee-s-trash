# Changelog

All notable changes to this project are documented here.

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