# Dig Queue Gameplay Reference

This document captures all loot items, value ranges, XP → level rules, and available chat commands for your Twitch mini-game.

## Items & Values

Rarity weights determine selection probability. With the expanded GTA-themed table, approximate chances are:
- Common: ~62–64%
- Uncommon: ~30–32%
- Rare: ~4–5%
- Ultra-Rare: ~1–2%

Counts per rarity (approximate):
- Common: 50+ items
- Uncommon: 50+ items
- Rare: 40+ items
- Ultra-Rare: 40+ items

Representative examples:
- Common: Burger Shot Napkin (1–12), Empty Pisswasser Can (1–10), Redwood Cigarette Pack (2–14), E-Cola Can (1–10), Los Santos Transit Ticket Stub (2–14)
- Uncommon: Scrap Copper Wire (20–45), Intact Burner Phone (20–45), Walkie-Talkie (Dead) (20–45), Car Key Blank (20–45), Spray Paint Can (Half) (20–45)
- Rare: Exotic Car ECU (120–200), Tactical Scope Housing (100–180), Casino VIP Card (90–160), Kevlar Plate (120–200), Prototype iFruit Phone (120–200)
- Ultra-Rare: Pacific Standard Vault Blueprints (500–1000), FIB Access Badge (500–1000), Prototype Railgun Coil (600–1000), Diamond Necklace (500–1000), Duffel of Unmarked Cash (500–1000)

Notes
- One item is selected per dig via weighted random, then a random integer value is rolled within the item’s min–max range.
- See `src/lootTable.js` for the complete, up-to-date item list.

## XP & Levels

Formula
- `level = max(1, floor(xp / levelStep) + 1)`
- `levelStep` is configurable via `config.loot.levelStep` (default: `1000`).

Examples (default step = 1000)
- XP 0–999 → Level 1
- XP 1000–1999 → Level 2
- XP 2000–2999 → Level 3
- … continues in steps of 1000 XP

Accumulation
- Points increase by the rolled item value.
- XP increases by the same rolled item value.
- Level is recalculated after each dig based on total XP.

Persistence
- Player data is stored in `data/players.json` and persists across server restarts.

## Commands

!dig
- If no one is digging: starts a dig immediately (per-user cooldown applies).
- If someone is digging: enqueues the user and replies with their position.
- Duplicate protection: users already active or already in the queue are informed and not added twice.

!stats / !points
- Replies with the user’s current totals: points, XP, and level.

!board [n]
- Shows the top `n` players sorted by total points.
- Default `n = 5`, maximum `n = 10`.

Moderator Commands
- !pause — Pauses the queue. The current dig completes, but no new digs start.
- !resume — Resumes the queue and immediately starts the next queued dig if idle.

Admin/Future (not implemented yet)
- Examples: `!resetplayer`, `!addpoints` (can be added later).

## Queue & Cooldown Behavior
- Queue: FIFO; exactly one active digger at a time.
- Cooldown: per-user only (global cooldown removed); prevents immediate re-starts when idle.
- After a dig resolves, the next queued user is automatically started.

## Overlay Event (loot)
The backend emits a `loot` event to the overlay with:
```json
{
  "type": "loot",
  "data": {
    "username": "User",
    "itemName": "Solid Meth Chunk",
    "rarity": "Rare",
    "value": 134,
    "totalPoints": 2890,
    "xp": 3890,
    "level": 4
  }
}
```