# Hobo Hustle Loot Images Manifest

This document defines the naming format, source dimensions, and storage path for all loot item images. Add your images into the `docs/loot/` folder using the filenames below.

## Naming Format

- Lowercase kebab-case based on the item name.
- Remove punctuation/parentheses; replace spaces and special characters with `-`.
- Collapse multiple hyphens; avoid leading/trailing hyphens.
- Preferred extensions: `png` (transparent) or `webp` with alpha. `svg` is also supported.

Examples:
- `E-Cola Can (Empty)` → `e-cola-can-empty.png`
- `VHS Tape: Vinewood` → `vhs-tape-vinewood.png`
- `Ultra-Rare Casino Chip` → `ultra-rare-casino-chip.png`

## Dimensions

- Source: `256x256` or `512x512` for clean downscaling.
- Overlay displays: `88x88` desktop, `72x72` mobile (`object-fit: cover`).
- Keep subject centered and include a bit of padding to avoid tight cropping.

## Storage Location

- Place files in: `docs/loot/`
- Reference them from the overlay or preview using `/docs/loot/<filename>`.
- Example preview URL:
  - `http://localhost:3001/preview/rare?user=You&image=/docs/loot/gold-bar-shard.png`

---

## Filenames by Item

Below are filenames for every item currently in the loot table.

### Common
- crumpled-joint.png
- half-eaten-burger-shot.png
- dead-rat.png
- empty-pisswasser-can.png
- moldy-bread-slice.png
- burnt-cigarette-butt.png
- burger-shot-napkin.png
- pisswasser-bottle-cap.png
- meteorite-bar-wrapper.png
- e-cola-can-empty.png
- sprunk-bottle-empty.png
- bleeter-pamphlet.png
- los-santos-transit-ticket-stub.png
- del-perro-souvenir-bracelet-broken.png
- mount-chiliad-hiking-map-torn.png
- vinewood-star-flyer.png
- lucky-plucker-fry-box.png
- 24-7-receipt.png
- ltd-gas-receipt.png
- ifruit-charger-cable-frayed.png
- lifeinvader-sticker-peeling.png
- cluckin-bell-nugget-box.png
- maze-bank-promo-pen-dry.png
- ron-oil-rag.png
- redwood-cigarette-pack-empty.png
- pisswasser-coaster-stained.png
- taco-bomb-napkin.png
- ponsonbys-tag.png
- suburban-tag.png
- binco-price-tag.png
- ammu-nation-catalog-crumpled.png
- blaine-county-lottery-ticket-expired.png
- los-santos-parking-ticket.png
- weazel-news-flyer.png
- richards-majestic-ticket-stub.png
- vinewood-boulevard-brochure.png
- bus-pass-expired.png
- sandy-shores-postcard.png
- grapeseed-farm-coupon.png
- pacific-standard-atm-receipt.png
- epsilon-pamphlet.png
- tire-valve-cap-stolen.png
- rusty-nail.png
- plastic-spoon.png
- bottle-shard.png
- broken-sunglasses.png
- bent-spoon.png
- torn-hoodie-string.png
- used-bandage-gross.png
- chewed-gum.png
- plastic-baggie-empty.png
- coffee-cup-lid.png
- train-ticket-old.png
- movie-flyer-old.png
- arcade-token-worn.png
- single-work-glove-used.png

### Uncommon
- half-smoked-joint.png
- bag-of-weed-crumbs.png
- damaged-pistol-slide.png
- intact-burner-phone.png
- loose-cash-roll.png
- redwood-half-pack.png
- skateboard-wheel.png
- scrap-copper-wire.png
- old-phone-battery.png
- drone-propeller-broken.png
- motor-oil-can-half.png
- used-spark-plug.png
- loose-9mm-rounds.png
- cheap-watch-broken.png
- transit-punch-card.png
- expired-id-card.png
- worn-hoodie.png
- knife-sheath-empty.png
- scuffed-sunglasses.png
- vhs-tape-vinewood.png
- transit-day-pass-stolen.png
- del-perro-poker-chip.png
- ls-car-meet-racing-flyer.png
- bent-tire-iron.png
- e-cola-crate-label.png
- lifeinvader-usb-fake.png
- ifruit-earbud-single.png
- disposable-camera.png
- small-cash-clip.png
- gas-mask-filter-used.png
- bat-grip-tape.png
- park-ranger-patch.png
- replica-blaine-county-badge.png
- small-bleach-bottle.png
- car-jack-handle.png
- toolkit-screwdriver.png
- spray-paint-can-half.png
- firework-stick.png
- motorcycle-gloves-pair.png
- drift-tire-chunk.png
- sns-pistol-spring-damaged.png
- hammer-head-loose.png
- door-lock-cylinder.png
- car-key-blank.png
- mini-bolt-cutters.png
- walkie-talkie-dead.png
- usb-drive-64mb.png
- gps-tracker-dead.png
- police-scanner-toy.png
- cheap-mask.png
- light-chains.png
- metal-pipe-section.png
- spark-plug-wires.png
- headlight-bulb.png
- fire-extinguisher-pin.png
- tattoo-ink-vial-used.png

### Rare
- full-weed-baggy-vinewood-og.png
- solid-meth-chunk.png
- clean-pistol-barrel.png
- high-end-car-key-fob.png
- exotic-car-ecu.png
- extended-mag-rifle.png
- tactical-scope-housing.png
- suppressed-barrel-section.png
- nos-canister-small.png
- kevlar-plate-used.png
- night-vision-monocular.png
- drone-battery-high-end.png
- casino-vip-card.png
- yacht-access-card.png
- gold-chain-thin.png
- diamond-earring-single.png
- rifle-bolt-polished.png
- shotgun-choke-clean.png
- car-meet-trophy-plate.png
- prototype-ifruit-phone.png
- lifeinvader-dev-usb.png
- counterfeit-plates-set.png
- smuggled-cigars-box.png
- military-radio-surplus.png
- pelican-case-tools.png
- tactical-flashlight-hl.png
- kevlar-weave-roll.png
- data-tape-secure.png
- bank-manager-lanyard.png
- high-value-chip-rack.png
- nightclub-vip-band.png
- limited-artwork-print.png
- signed-epsilon-tract.png
- rare-vinyl-wctr.png
- movie-prop-alien-egg.png
- collectible-figurine-mint.png
- prototype-micro-smg-grip.png
- silencer-kit-incomplete.png
- 50-cal-dummy-round.png
- rifle-upper-clean.png
- exotic-car-key-tracked.png
- high-end-drone-frame.png
- racing-ecu-tune.png
- gold-bar-shard.png
- jewelry-store-key.png
- thermal-scope-housing.png
- drone-frame-carbon.png
- high-lumen-headlamp.png

### Ultra-Rare
- vac-sealed-brick-powder.png
- legendary-strain-san-andreas-supernova.png
- mythic-meth-crystal.png
- briefcase-of-marked-bills.png
- duffel-of-unmarked-cash.png
- gold-bars-stack.png
- diamond-necklace.png
- pacific-standard-vault-blueprints.png
- yacht-safe-key.png
- casino-cash-cage-master-key.png
- fib-access-badge.png
- offshore-account-ledger.png
- illegal-weapon-cache-codebook.png
- hacked-lifeinvader-admin-token.png
- prototype-railgun-coil.png
- minigun-barrel-cluster.png
- rare-supercar-ecu.png
- art-heist-bundle.png
- epsilon-gold-idol.png
- exotic-animal-pelt.png
- collectors-diamond-watch.png
- ufo-component-classified.png
- stash-house-master-key.png
- yacht-master-access-card.png
- casino-vip-vault-pass.png
- prototype-lmg-upper.png
- black-card-unlimited.png
- gold-ingot-bundle.png
- high-roller-diamond-chip.png
- museum-artifact-stolen.png
- military-optics-array.png
- encrypted-fib-drive.png
- prototype-minigun-gear.png
- vip-nightclub-vault-key.png
- gold-bracelet-heavy.png
- diamond-ring-large.png
- prototype-railgun-housing.png
- vip-yacht-safe-code.png
- casino-cage-ledger.png
- collectors-gem-set.png
- prototype-thermal-scope.png
- stolen-gold-statue.png
- diamond-encrusted-watch.png
- epsilon-relic-blessed.png
- prototype-supercar-ecu.png
- ultra-rare-casino-chip.png