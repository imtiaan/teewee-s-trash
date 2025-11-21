const card = document.getElementById("card");
const userEl = card.querySelector(".user");
const rarityEl = card.querySelector(".rarity");
const itemEl = card.querySelector(".item");
const valueEl = card.querySelector(".value");
const metaEls = card.querySelectorAll(".meta");

const WS_URL = new URLSearchParams(window.location.search).get("ws") || "ws://localhost:8080";
const RARITY_CLASS = {
  Common: "rarity-common",
  Uncommon: "rarity-uncommon",
  Rare: "rarity-rare",
  "Ultra-Rare": "rarity-ultra-rare"
};

let hideTimer = null;

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
