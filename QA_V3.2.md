# QA — Rootflow V3.2.0

Release: 2026-08-09

## Scope
- Presentation / brand only.
- New Root → Flow vector identity.
- Clean page title bars for Kế hoạch, Kịch bản and Giao dịch.
- No finance-domain, schema, migration or persistence changes.

## Automated checks performed
- `node --check app.js`
- `node --check domain.js`
- `node --check store.js`
- `node --check selftest.js`
- `node --check sw.js`
- `manifest.json` JSON parse validation
- Verified `BrandMark` is rendered only on Dashboard.
- Verified runtime SVG exists and is included in service-worker cache.
- Verified icon PNG exports exist at 180/192/256/512/1024.

## Visual intent
- ROOT / anchor: `#101110`
- FLOW / forward stroke: `#14614A`
- PWA icon background: `#F4F1E8`
