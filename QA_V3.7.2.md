# QA — Rootflow V3.7.2

## Scope
Patch Dashboard hierarchy only. No accounting schema or transaction behavior changes.

## Required checks
- Hero KPI is `Tài sản ròng`, not liquid cash.
- Hero footer shows `Tổng tài sản` and `Nợ phải trả`.
- `Tiền khả dụng` is shown in a dedicated `Thanh khoản` panel below the personal balance sheet.
- Liquidity panel shows current liquid balance and 30-day forecast position/delta.
- Historical chart label uses `Tiền khả dụng — 30 ngày qua`.
- Personal balance sheet subtitle remains exactly `Tài sản = Nợ phải trả + Vốn chủ`.
- Logo, brand images, icon assets, fonts, navigation, account logic, transaction logic, and schema remain unchanged.
- Domain self-test must remain 54/54.
