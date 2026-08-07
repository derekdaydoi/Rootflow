# Rootflow V2.9 — Logo-only brand patch

Scope: apply the approved Rootflow identity treatment (sprout + flowing path mark, ROOT black, FLOW green, tagline “SEE WHAT COMES NEXT.”) while preserving Rootflow finance UI, data model and business logic.

## Invariants
- `domain.js`: unchanged from V2.8
- `store.js`: unchanged from V2.8
- `manifest.json`: structure unchanged; icon files replaced in-place
- Existing account / flow / budget / scenario data are not migrated or reset
- Dashboard and all finance modules remain Rootflow finance modules; no task/productivity content was introduced

## Runtime changes
- `app.js`: visual Rootflow SVG mark only
- `index.html`: logo/header presentation CSS only
- `sw.js`: cache version bump to `rootflow-v2.9-2026-08-07`
- icon PNG/SVG assets regenerated to match the approved mark

## Validation
- JavaScript syntax: PASS (`app.js`, `domain.js`, `store.js`, `sw.js`)
- Rootflow finance self-test: **36/36 PASS**
- `domain.js`, `store.js`, `manifest.json`: SHA-256 identical to V2.8 baseline
