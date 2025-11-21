Got you — I’ll treat this like a **full project brief + implementation spec** you can drop straight into an AI dev agent.

I’ll define:

* What the game is
* Exact behaviour (queue, loot, XP)
* Tech stack & architecture
* Data models
* Message formats between bot & overlay
* File structure & implementation steps
* OBS integration notes

You can literally copy-paste this whole thing into your dev bot.

---

````markdown
# Project: “Dig Queue” – Twitch Chat Loot Game with Liquid Glass Overlay

## 1. High-Level Overview

**Goal:**  
Build a Twitch chat–driven mini-game called **“Dig Queue”** where:

- Viewers type `!dig` in chat to join a **queue**.
- Only **one player at a time** “digs” and receives **GTA-themed loot**.
- Loot has **rarity** and **value** (points).
- Players accumulate **all-time points** and **XP**, with **levels**.
- An **OBS overlay** shows animated **Liquid Glass–style loot cards** synced with chat messages.
- The system runs continuously during stream and persists progress across sessions.

**Key requirements from the streamer:**

- Aesthetic: **Liquid Glass** (colors: primary `#00A388`, secondary `#EDDFBF`, dark background).
- Game command: `!dig` (not `!forage`).
- Only one player digs at a time → **queue system**.
- Items: **GTA-style trash/loot** (joints, weed strains, gun parts, meth, electronics, materials, bread, dead rats, etc.).
- All-time points: **no resets**.
- **Hybrid system**:
  - Chat commands & game logic via a bot.
  - Visual overlay in OBS via **Browser Source**, with:
    - Animations for loot reveals.
    - Sound effects based on rarity.
- Commands:
  - `!dig` – join dig queue / trigger dig.
  - `!stats` or `!points` – show player points/XP/level in chat.

---

## 2. Functional Requirements

### 2.1 Commands

#### `!dig`
- If **no current active digger**:
  - User becomes **active digger**.
  - Game triggers a **dig cycle**:
    - Short delay (animation).
    - Roll loot.
    - Update player stats.
    - Send synced overlay animation event.
    - Send chat message describing loot and updated totals.
- If **someone is already digging**:
  - User is added to the **queue** (if not already in it).
  - Bot replies with:
    - Position in queue, e.g.  
      `@user You joined the dig queue. Position: #3.`

Notes:
- No spamming: per-user cooldown (configurable, e.g. 5–10 sec).
- Optional: global cooldown (e.g. min 2 sec between digs).

#### `!stats` / `!points`
- Bot responds with the user’s current totals:
  - `@user You have [points] points, [xp] XP (Level [level]).`
- Pulls data from persistent storage.

*(Optional)* `!top` (if you want later):
- Returns top N players by points.

---

### 2.2 Queue System

- Internal **FIFO queue** (array or similar) keeping usernames in order.
- At any given moment:
  - There is **either**:
    - No active player → idle.
    - Or exactly **one active digger** and a queue behind them.
- Flow:

1. `!dig` called & no active player → set `activePlayer = user`.
2. Start dig sequence for `activePlayer`.
3. When loot is resolved:
   - Clear `activePlayer`.
   - If queue has users:
     - Pop the next username.
     - Set as `activePlayer`.
     - Automatically start new dig sequence (no extra `!dig` needed from them).
4. If queue empty → go idle.

- Important: A user should not be added to the queue **multiple times**.  
  - If user is active or already in queue, ignore extra `!dig` or respond with a helpful message.

---

### 2.3 Loot System

Loot is **GTA-flavoured trash/illegal/street items**.

Define loot as entries with:

- `name`
- `rarity` (Common, Uncommon, Rare, Ultra-Rare)
- `minValue`, `maxValue`
- `weight` (for weighted random selection)

#### Rarity & approximate probabilities:

- **Common** (~70%)
- **Uncommon** (~25%)
- **Rare** (~4%)
- **Ultra-Rare** (~1%)

### Example Loot Table

```js
const lootTable = [
  // Common
  { rarity: "Common", name: "Crumpled Joint",         min: 1,  max: 10,  weight: 40 },
  { rarity: "Common", name: "Half-Eaten Burger Shot", min: 1,  max: 12,  weight: 40 },
  { rarity: "Common", name: "Dead Rat",               min: 2,  max: 15,  weight: 40 },
  { rarity: "Common", name: "Empty Pißwasser Can",    min: 1,  max: 10,  weight: 40 },
  { rarity: "Common", name: "Moldy Bread Slice",      min: 1,  max: 8,   weight: 40 },
  { rarity: "Common", name: "Burnt Cigarette Butt",   min: 1,  max: 6,   weight: 40 },

  // Uncommon
  { rarity: "Uncommon", name: "Half-Smoked Joint",    min: 15, max: 35,  weight: 20 },
  { rarity: "Uncommon", name: "Bag of Weed Crumbs",   min: 20, max: 40,  weight: 20 },
  { rarity: "Uncommon", name: "Damaged Pistol Slide", min: 18, max: 40,  weight: 20 },
  { rarity: "Uncommon", name: "Intact Burner Phone",  min: 20, max: 45,  weight: 20 },
  { rarity: "Uncommon", name: "Loose Cash Roll",      min: 15, max: 50,  weight: 20 },

  // Rare
  { rarity: "Rare", name: "Full Weed Baggy – Vinewood OG",   min: 80,  max: 150, weight: 4 },
  { rarity: "Rare", name: "Solid Meth Chunk",                min: 100, max: 180, weight: 4 },
  { rarity: "Rare", name: "Clean Pistol Barrel",             min: 90,  max: 160, weight: 4 },
  { rarity: "Rare", name: "High-End Car Key Fob",            min: 120, max: 200, weight: 4 },

  // Ultra-Rare
  { rarity: "Ultra-Rare", name: "Vac-Sealed Brick (??? Powder)", min: 300, max: 600,  weight: 1 },
  { rarity: "Ultra-Rare", name: "Legendary Strain – San Andreas Supernova", min: 350, max: 800, weight: 1 },
  { rarity: "Ultra-Rare", name: "Mythic Meth Crystal",       min: 400, max: 1000, weight: 1 },
  { rarity: "Ultra-Rare", name: "Briefcase of Marked Bills", min: 500, max: 1000, weight: 1 },
];
````

The bot picks one item with weighted random, then rolls a random integer between `min` and `max` for **value (points)**.

---

### 2.4 Points, XP, Levels

* **Points:**

  * Increase by `value` of each item found.
  * Lifetime total (no resets).

* **XP:**

  * Simplest approach: `xp += value` each time.
  * Level formula: e.g. `level = max(1, floor(xp / 1000) + 1)` (configurable).

* **Stats returned in `!stats`:**

  * Points (all-time)
  * XP (all-time)
  * Level

---

### 2.5 Messages & Sync with Overlay

When a dig completes, two things must happen in sync:

1. **Chat message** (from the bot), e.g.:

   ```text
   @User found: Solid Meth Chunk (Rare) worth 134 points! Total: 2890 pts | Level 4.
   ```

2. **Overlay event** (via WebSocket or similar) with JSON payload:

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

The overlay uses this event to:

* Display a **Liquid Glass loot card**.
* Animate it in/out.
* Choose a **sound effect** based on rarity.

---

## 3. Non-Functional Requirements

* **Tech stack (suggested):**

  * Backend bot: **Node.js** + `tmi.js` (Twitch IRC client).
  * Overlay: HTML/CSS/JS served locally and loaded as **Browser Source** in OBS.
  * Bot ↔ Overlay communication: **WebSocket** (`ws` lib in Node).

* **Performance:**

  * Lightweight; no heavy computation.
  * Works on a typical streaming setup (OBS + game + browser source).

* **Persistence:**

  * Store all-time player data in a local file (e.g. `players.json`) or simple DB.
  * Auto-save after each dig.

* **Configurability:**

  * Channel name.
  * Cooldowns.
  * Loot table.
  * Level progression formula.
  * Overlay styling tweaks.

---

## 4. System Architecture

### Components

1. **Twitch Bot Service**

   * Connects to Twitch chat.
   * Listens for `!dig`, `!stats`, etc.
   * Manages:

     * Queue.
     * Active player.
     * Loot generation.
     * Player stats update.
   * Sends messages to:

     * Twitch chat.
     * Overlay (via WebSocket).

2. **Overlay Frontend**

   * HTML/CSS/JS app.
   * Connects to WebSocket server at `ws://localhost:PORT`.
   * Renders:

     * Animated loot card.
   * Plays:

     * Sound effects based on rarity.

3. **Data Store**

   * Simple JSON file:

     * `players.json`:

       ```json
       {
         "username1": { "username": "username1", "points": 1234, "xp": 2300, "level": 3 },
         "username2": { "username": "username2", "points": 900, "xp": 900, "level": 1 }
       }
       ```

---

## 5. Data Models

### Player

```ts
type Player = {
  username: string;   // Twitch display or login name
  points: number;     // all-time points
  xp: number;         // all-time xp
  level: number;      // derived from xp
};
```

### Loot Event (backend → overlay)

```ts
type LootEvent = {
  username: string;
  itemName: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra-Rare";
  value: number;
  totalPoints: number;
  xp: number;
  level: number;
};
```

---

## 6. Overlay Design (Liquid Glass)

Overlay visual: a **single loot card** appearing at bottom center.

### Required behaviours:

* Default state: nothing visible.
* On `loot` event:

  * Card becomes visible.
  * Slight upward slide + fade-in (CSS transition).
  * Rarity border & glow:

    * Common: subtle.
    * Uncommon: tealish glow (`#00A388`).
    * Rare: purple-ish glow.
    * Ultra-Rare: gold glow.
  * Display:

    * `@username`
    * `rarity`
    * `itemName`
    * `+<value> pts`
    * `Total: <totalPoints> pts`
    * `XP: <xp> | Lv <level>`
  * Play rarity-based sound effect.
  * After 4–6 seconds, fade card out.

### Styling constraints:

* Use `backdrop-filter: blur(...)` and layered gradients for Liquid Glass look.
* Base colors:

  * Accent: `#00A388`
  * Secondary highlight: `#EDDFBF`
  * Text: primarily white with subtle opacity.

---

## 7. Detailed Behaviour Flow

### When `!dig` is received

1. Normalize username (lowercase key, keep display name).
2. If user is **active player** or already in the queue:

   * Bot replies with something like:

     * `@user You're already digging or in the queue. Position: #N`
   * Don’t add again.
3. Else:

   * If **no active player**:

     * Set `activePlayer = user`.
     * Start `startDigSequence(activePlayer)`.
   * Else:

     * Push user to queue array.
     * Respond:
       `@user You joined the dig queue. Position: #N.`

### `startDigSequence(username)`

1. (Optional) Immediately send a message:
   `@user is digging through the trash...`
2. (Optional) Send a WebSocket event `{ type: "dig-start", data: { username } }` so overlay can show a "digging..." animation.
3. After delay (e.g. 1500–2500 ms), execute `resolveLoot(username)`.

### `resolveLoot(username)`

1. Select loot via weighted random.
2. Roll value (random int between `min` and `max`).
3. Get or create Player object.
4. Update:

   * `player.points += value`
   * `player.xp += value`
   * `player.level = calcLevel(player.xp)`
5. Save players.
6. Send chat message:

   * `@user found: [itemName] ([rarity]) worth [value] points! Total: [points] pts | Level [level].`
7. Send WebSocket event `type: "loot"` with `LootEvent`.

### After resolving loot

1. Clear `activePlayer`.
2. If `queue.length > 0`:

   * `activePlayer = queue.shift()`.
   * Call `startDigSequence(activePlayer)`.
3. Else:

   * Stay idle, wait for next `!dig`.

---

## 8. Implementation Plan (for the AI Dev)

### Step 1: Setup Project

* Initialize Node.js project.
* Install dependencies:

  * `tmi.js` – Twitch chat.
  * `ws` – WebSocket server.
  * `express` or `http-server` for serving the overlay.

### Step 2: Implement Player Data Layer

* `players.json` file with read/write helper functions:

  * `loadPlayers()`
  * `savePlayers(players)`
* `getOrCreatePlayer(username)`.

### Step 3: Implement Loot Logic

* Hardcode `lootTable`.
* Implement `weightedRandomLoot()` + `randomInt(min, max)`.
* Implement `calcLevel(xp)` function (configurable thresholds).

### Step 4: Implement Queue & Dig Logic

* In memory:

  * `let activePlayer: string | null = null;`
  * `let queue: string[] = [];`
* Implement:

  * `handleDigCommand(username)`
  * `startDigSequence(username)`
  * `resolveLoot(username)`

### Step 5: Implement Twitch Bot

* Use `tmi.js`:

  * Connect to channel.
  * On `message`, parse:

    * `!dig` → `handleDigCommand(username)`
    * `!stats` / `!points` → respond with that user’s stats.
* Make sure to use `display-name` when present.

### Step 6: Implement WebSocket Server

* Start WS server (e.g. on port `8080`).
* Maintain a `Set` of connected overlay clients.
* Expose function `broadcast(message)` to send JSON events:

  * `{"type": "loot", "data": LootEvent}`

### Step 7: Build Overlay Frontend

* Simple single-page `overlay.html`.
* `style.css` for Liquid Glass card.
* `overlay.js`:

  * Connect to `ws://localhost:8080`.
  * Listen for messages.
  * On `type: "loot"`:

    * Update DOM.
    * Add rarity class.
    * Play appropriate sound.
    * Animate in/out with CSS transitions.

### Step 8: Connect Overlay to OBS

* Serve overlay locally (via Express or simple static server).
* In OBS:

  * Add **Browser Source**.
  * URL: `http://localhost:<port>/overlay.html`
  * Set: 1920×1080, transparent background.

### Step 9: Test Flow End-to-End

* Start bot.
* Connect overlay.
* In Twitch chat:

  * Type `!dig` from multiple accounts.
  * Confirm:

    * Queue behaviour.
    * Correct chat messages.
    * Overlay loot cards look correct.
    * Sounds play & rarity colors match.

---

## 9. Acceptance Criteria

The build is “Done” when:

1. **Queue Behaviour**

   * Only one player is digging at a time.
   * Additional `!dig` calls add users to queue with correct position.
   * Users are not added twice.

2. **Loot & Stats**

   * Each dig results in exactly one loot item.
   * Value is within defined min/max.
   * Points & XP persist across restarts.
   * Level updates according to formula.

3. **Chat Output**

   * `!dig` → either queue join message or dig result.
   * `!stats` / `!points` → correct player totals.

4. **Overlay Sync**

   * Every loot event has a matching overlay animation.
   * Card shows username, item, rarity, value, total, XP & level.
   * Sounds vary with rarity.

5. **Persistence**

   * Stopping and restarting the bot does not reset players’ stats.

6. **Style**

   * Overlay visually matches **Liquid Glass** aesthetic using:

     * Blur
     * Translucent gradients
     * Accent colors `#00A388` & `#EDDFBF`.

---

## 10. Optional Future Enhancements (Non-blocking)

* `!top` leaderboard command.
* Full-screen leaderboard overlay.
* Streak bonuses for consecutive rares.
* Special events (Treasure Storm, Mimic, etc.) with separate message types.
* Admin-only commands (`!resetplayer`, `!addpoints`, etc.).

```

You can give that entire markdown block to your AI dev agent and tell it:

> “Build this project as described. Use Node.js for the bot and WebSocket server, and HTML/CSS/JS for the overlay. Output the full codebase with instructions.”

If you want, I can next:

- Turn this into a **GitHub-style README** + folder structure.  
- Or write **concrete code stubs** for each file (`bot.js`, `overlay.html`, etc.) that the AI dev can then refine.
::contentReference[oaicite:0]{index=0}
```
