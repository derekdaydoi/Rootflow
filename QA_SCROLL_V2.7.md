# Rootflow V2.7 — Scroll QA

## Scope
- Replaced fixed app-frame / inner scroller with natural document scrolling.
- Removed safe-area overlay mask.
- Bottom navigation remains fixed.
- Added cold-launch scroll reset and per-navigation reset.
- Sheet body locking preserves and restores document scroll position.

## Checks
- `node --check`: app.js, domain.js, store.js, selftest.js, sw.js — PASS.
- Rootflow business self-test: 36/36 — PASS.
- Service worker cache version: `rootflow-v2.7-2026-08-07`.
- V2.5 and V2.6.2 fixed-shell CSS blocks removed from index.html.

## Device limitation
Safari/iPhone rubber-band and Home Screen standalone behavior cannot be fully emulated in this container. Final acceptance must be done on the target iPhone after deployment.
