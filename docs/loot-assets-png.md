# Loot Item Images – PNG Guide

This addendum focuses on using PNG assets for the overlay’s left-side image.

## Format
- Preferred: `PNG` (24-bit with alpha transparency)
- Optional (not required): `WEBP` if you need smaller files. Avoid `SVG` for this use case since you’ve chosen PNG.

## Dimensions
- Source: `512x512` or `256x256` square with transparent background
- Display: the overlay renders ~`88x88` (desktop) and ~`72x72` (narrow screens)
- Keep a safe padding around the subject to avoid edge clipping when `object-fit: cover` is applied

## Naming Convention
- Lowercase kebab-case: `rare-arcane-tome.png`, `uncommon-emerald.png`
- No spaces or special characters; use hyphens to separate words

## Storage Location
- Place images in `docs/loot/` for quick iteration alongside docs (already served under `/docs`)
- If you prefer production assets, create `public/img/loot/` (served under `/`) and use those paths

## Examples
- Docs path: `docs/loot/rare-arcane-tome.png` → URL `http://localhost:3001/docs/loot/rare-arcane-tome.png`
- Public path: `public/img/loot/rare-arcane-tome.png` → URL `http://localhost:3001/img/loot/rare-arcane-tome.png`

## Preview URLs (PNG)
- HTTP preview: `http://localhost:3001/preview/rare?user=DocsTest&image=/docs/loot/rare-arcane-tome.png`
- Chat preview: `!preview rare /docs/loot/rare-arcane-tome.png`
- Swap `/docs/loot/…` for `/img/loot/…` if you store in `public/img/loot/`

## Export Tips
- Use transparent background; remove canvas/background layers before export
- Prefer crisp, centered compositions that read well at small size
- Keep under ~256KB where reasonable (optimize with `pngquant` or similar)
- Avoid thin outlines that may get lost in glow; consider slight contrast boost

## Fallback Behavior
- If no `image` is provided in the payload, the overlay hides the left media area automatically
- To set a default image globally, add one asset and we can wire it in `overlay.js`

## Quick Checklist
- [ ] PNG 24-bit with alpha
- [ ] 512x512 or 256x256 square
- [ ] Transparent background with safe padding
- [ ] Lowercase kebab-case filename
- [ ] Placed in `docs/loot/` or `public/img/loot/`

## Next Steps
1. Drop your `.png` files into `docs/loot/`
2. Use the preview URLs above to verify each rarity glow plus image alignment
3. If you want auto-mapping from item names to images, I can add a slug-based resolver or a `data/loot-images.json` map