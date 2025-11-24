const card = document.getElementById("card");
const userEl = card.querySelector(".user");
const rarityEl = card.querySelector(".rarity");
const itemEl = card.querySelector(".item");
const valueEl = card.querySelector(".value");
const metaEls = card.querySelectorAll(".meta");
const mediaEl = card.querySelector(".media");
const thumbEl = card.querySelector(".thumb");

const WS_URL = new URLSearchParams(window.location.search).get("ws") || "ws://localhost:8080";
const RARITY_CLASS = {
  Common: "rarity-common",
  Uncommon: "rarity-uncommon",
  Rare: "rarity-rare",
  "Ultra-Rare": "rarity-ultra-rare"
};

let hideTimer = null;

// Fallback: 1x1 transparent PNG (base64 data URL)
const DEFAULT_IMAGE_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAoMBgObaZ6wAAAAASUVORK5CYII=";
// Preferred visible fallback file (place your asset at public/img/loot/default.png)
const DEFAULT_IMAGE_PATH = "/img/loot/default.png";

const slugify = (s) => {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
};

const setCardState = rarity => {
  card.classList.remove("rarity-common", "rarity-uncommon", "rarity-rare", "rarity-ultra-rare");
  card.classList.add(RARITY_CLASS[rarity] || "rarity-common");
};

const hideCard = () => {
  card.classList.remove("show");
  card.classList.add("hidden");
};

const showLoot = data => {
  userEl.textContent = `@${data.username}`;
  rarityEl.textContent = data.rarity;
  itemEl.textContent = data.itemName;
  valueEl.textContent = `+${data.value} pts`;
  metaEls[0].textContent = `Total: ${data.totalPoints} pts`;
  metaEls[1].textContent = `XP: ${data.xp} | Lv ${data.level}`;
  const explicitUrl = data.imageUrl || data.image || "";
  // Prefer explicit URL, else slug-based PNG path; if neither, start at default.png
  let candidate = explicitUrl || (data.itemName ? `/img/loot/${slugify(data.itemName)}.png` : DEFAULT_IMAGE_PATH);
  mediaEl.classList.remove("hidden");
  let fallbackStage = 0; // 0 -> try candidate, 1 -> default.png, 2 -> transparent data URL
  thumbEl.onerror = () => {
    fallbackStage += 1;
    if (fallbackStage === 1) {
      thumbEl.src = DEFAULT_IMAGE_PATH;
    } else if (fallbackStage === 2) {
      thumbEl.src = DEFAULT_IMAGE_DATA_URL;
    }
  };
  thumbEl.src = candidate || DEFAULT_IMAGE_PATH;
  setCardState(data.rarity);
  card.classList.remove("hidden");
  requestAnimationFrame(() => card.classList.add("show"));
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(hideCard, 5200);
};

const handleMessage = payload => {
  try {
    const msg = JSON.parse(payload);
    if (msg.type === "loot") {
      showLoot(msg.data);
    }
  } catch (err) {
    console.error("Invalid overlay payload", err);
  }
};

const connect = () => {
  let ws;
  try {
    ws = new WebSocket(WS_URL);
  } catch (err) {
    console.error("WebSocket init failed", err);
    setTimeout(connect, 2000);
    return;
  }

  ws.onopen = () => console.log("Overlay connected");
  ws.onmessage = evt => handleMessage(evt.data);
  ws.onclose = () => {
    console.warn("Overlay disconnected. Retrying...");
    setTimeout(connect, 1500);
  };
  ws.onerror = err => {
    console.error("Overlay socket error", err);
    ws.close();
  };
};

connect();
