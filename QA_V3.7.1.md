# QA — Rootflow V3.7.1

## Visual lock
- [x] Balance Sheet subtitle is exactly `Tài sản = Nợ phải trả + Vốn chủ`.
- [x] No date appended to Balance Sheet subtitle.
- [x] Logo assets unchanged from V3.7.0.
- [x] `index.html` unchanged from V3.7.0, preserving typography/color/layout tokens.
- [x] Navigation structure unchanged.

## Account nomenclature
- [x] `receivable` remains the same internal account type and is displayed as `Phải thu`.
- [x] No schema migration is required; schema remains v5.

## Regression
- [x] JS syntax check.
- [x] Finance self-tests.
- [x] PWA cache bumped.
