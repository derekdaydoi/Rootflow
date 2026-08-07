# Rootflow V3.0 — QA

## Scope
- Visual/UI family refresh only: Rootflow header, botanical palette, Home Screen icon, app menu.
- Finance data model and persistence are intentionally unchanged.

## Verified
- `domain.js` byte-identical to V2.9: **PASS**
- `store.js` byte-identical to V2.9: **PASS**
- `selftest.js` byte-identical to V2.9: **PASS**
- `app.js`, `domain.js`, `store.js`, `sw.js`: Node syntax check **PASS**.
- Finance/domain self-test: **36/36 PASS**.
- `manifest.json`: valid JSON; background/theme moved to warm ivory.
- Home Screen icon assets generated at 180/192/256/512/1024 px.
- Service-worker cache version: `rootflow-v3.0-2026-08-07`.
- Natural document scroll architecture from V2.7 retained.

## Visual target implemented
- Single elevated header card.
- Sprout + flowing path logo tile.
- `ROOT` graphite + `FLOW` botanical green.
- Tagline `SEE WHAT COMES NEXT.`.
- One hamburger action; it opens Tài khoản / Cài đặt so functionality is not removed.
- Dashboard surfaces shifted to warm ivory + soft botanical green to sit in the same family as Rootwork.

## Device caveat
- iOS Home Screen/Safari visual behavior must still be checked on the real iPhone after GitHub Pages deploy; the local headless Chromium environment did not complete a reliable screenshot run.
