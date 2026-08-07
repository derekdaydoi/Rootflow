# Rootflow V3.1.0 — QA

Release: 2026-08-07

## Scope
- Final Rootflow sprout + flowing-path identity.
- Dedicated high-resolution logo master; no UI-mockup crop is used at runtime.
- Home Screen/PWA icons regenerated directly from the master.
- Finance data model and business engine unchanged.
- Rootwork-style natural document scrolling retained.

## Checks
- JavaScript syntax: PASS (`app.js`, `domain.js`, `store.js`, `selftest.js`, `sw.js`).
- Rootflow finance self-test: 36/36 PASS.
- Manifest icon files: PASS for 180/192/256/512/1024.
- Icon dimensions: PASS.
- Service-worker pre-cache files: PASS.
- No stale `icon-master.svg` reference: PASS.
- Dedicated master exists: `brand/rootflow-logo-master.png` (1254×1254).
- Runtime header mark: `brand/rootflow-symbol.png` (512×512).
- Data schema: v4, unchanged.

## Device note
Safari/Home Screen visual behavior still requires final device inspection after GitHub Pages deploy because iOS PWA caching and browser chrome cannot be fully reproduced in the build container.
