# Rootflow V3.6 QA

## Scope
Personal-accounting layer on top of V3.5.0. Brand assets, typography and main navigation structure are intentionally preserved.

## Checks
- [x] Runtime header and all PWA logo/icon assets are byte-identical to V3.5.0.
- [x] Existing V3.5 Manrope/system typography rules remain unchanged.
- [x] Repay entry exposes only `Vốn / gốc` and `Chi phí vay`; total cash out is computed automatically.
- [x] Legacy repay rows without split fields are treated as 100% principal.
- [x] Split repay: cash decreases by total; liability decreases by principal; borrowing cost enters expense.
- [x] Forecast uses the full repayment cash out.
- [x] Dashboard expense analytics include borrowing cost but exclude principal.
- [x] Personal balance sheet reports Assets = Liabilities + Equity / Net Worth.
- [x] Current/non-current classification feeds NWC and Current ratio.
- [x] Debt ratio uses total liabilities / total assets.
- [x] OPEX uses monthly economic expense.
- [x] CAPEX uses confirmed transfers into `Tài sản sở hữu`.
- [x] `app.js`, `domain.js`, `store.js`, `selftest.js`, `sw.js` syntax checks pass.
- [x] Rootflow self-test: 48/48 pass.
- [x] PWA cache bumped to V3.6.0.
