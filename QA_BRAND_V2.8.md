# Rootflow V2.8 — Brand QA

## Scope

Visual-only brand refresh on top of V2.7. No finance model, persistence schema, or stored-data migration changes.

## Checks

- `app.js` syntax: checked with `node --check`.
- `sw.js`, `domain.js`, `store.js`, `selftest.js` syntax: checked with `node --check`.
- Rootflow domain self-test: run in Node with browser global shim.
- `domain.js`, `store.js`, `manifest.json`: byte-identical to V2.7 full source.
- Icon assets regenerated at 180, 192, 256, 512, 1024 px.
- Home Screen icon filenames unchanged, so existing manifest references remain valid.
- Service-worker cache bumped to `rootflow-v2.8-2026-08-07`.

## Brand lockup

- ROOT: graphite `#111111`.
- FLOW: Root Green `#3AA66B`.
- Tagline: `SEE WHAT COMES NEXT.`
- Mark: one continuous flow line growing into a three-leaf sprout.
