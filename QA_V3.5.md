# Rootflow V3.5 QA

## Scope
Final visual-direction + cash-flow composition UI patch on top of V3.4.0.

## Checks
- [x] New Root Green square / white R-flow / root-dot vector is used by runtime header and PWA icons.
- [x] Balance hero is the primary green surface; normal cards remain neutral.
- [x] Display typography has Manrope + offline-safe fallbacks; financial numerals are tabular.
- [x] `Cơ cấu dòng tiền` toggles between Chi tiêu and Thu nhập.
- [x] Expense colors are fixed by category and use a high-contrast palette.
- [x] Income colors are fixed by source and use a separate high-contrast palette.
- [x] Income flows can optionally store source in the existing `category` field; schema remains v4.
- [x] Existing income rows without source map to `Thu nhập khác`; interest income maps to `Lãi / lợi tức`.
- [x] Kế hoạch / Kịch bản / Giao dịch retain consistent Back headers.
- [x] `app.js`, `domain.js`, `store.js`, `selftest.js` syntax checks pass.
- [x] `domain.js`, `store.js`, `selftest.js` are byte-identical to V3.4.0.
- [x] PWA cache bumped to V3.5.0.
