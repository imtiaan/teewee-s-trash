# Loot PNG Assets

Drop your item PNGs in this directory using lowercase kebab-case filenames that match item slugs (derived from the item name).

Examples:
- common-crumpled-joint.png
- uncommon-emerald.png
- rare-arcane-tome.png
- ultra-rare-gold-bars-stack.png

Overlay auto-mapping:
- The overlay tries `/img/loot/<slug>.png` based on the `itemName`.
- If the file is missing, it falls back to `default.png`.
- Place a visible fallback image at `public/img/loot/default.png`.
- If `default.png` is also missing, it falls back to an embedded transparent PNG.

Tip: Use 512x512 or 256x256 PNG with alpha; see `docs/loot-assets-png.md`.