# Rootflow brand specification

## Identity

Rootflow uses the approved cash-jar warning mark from the supplied master artwork.

- Deep green `#0F6B45` — primary action and text accent
- Launch green `#BAFF9C` — launch and homescreen background
- White / warm neutral — product surfaces

## Brand assets

Runtime and install assets are deliberately separated, following the stable Rootwork pattern:

- `brand/rootflow-mark.png` — transparent 512×512 runtime mark for the opening screen. No background, replacement SVG, WebP wrapper, CSS image hack, blur, glow, or drop-shadow.
- `brand/rootflow-icon.png` — 512×512 homescreen/PWA icon with the canonical launch-green background and enlarged artwork.

Do not use the homescreen icon as the runtime splash mark.

## Launch motion

The opening screen is present in the initial HTML first paint and React owns the same splash state after mount. Motion is restrained: mark fade/translate, tagline fade, and a short progress bar. No bounce, halo burst, morph, blur, or scale overshoot.

## Copyright

`Rootflow`, the approved brand mark and this product identity are © 2026 derekdaydoi. All rights reserved.
