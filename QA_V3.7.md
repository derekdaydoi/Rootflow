# Rootflow V3.7 QA

## Scope
Correct snapshot/ledger semantics without redesigning the V3.6 interface.

## Locked
- [x] Root Green background + white R/root-dot logo assets unchanged.
- [x] Manrope display / system operational typography unchanged.
- [x] Dashboard and bottom-navigation visual structure unchanged.
- [x] Loan repayment entry remains exactly two values: `Vốn / gốc` + `Chi phí vay`.

## Accounting checks
- [x] `openingBalance` can carry a `balanceAsOf` snapshot date.
- [x] A flow on/before an account snapshot does not replay onto that account.
- [x] The same historical flow can still affect another older account whose snapshot predates the flow.
- [x] Historical repayment reclassification cannot reduce a current liability snapshot twice.
- [x] `legacyDebtPayment` reduces liquid cash by the full amount.
- [x] `legacyDebtPayment` is excluded from OPEX until split is known.
- [x] `legacyDebtPayment` remains included in debt-service cash obligation.
- [x] Schema v4 imports migrate to v5 while preserving legacy balance replay.
- [x] Personal balance-sheet equations and ratios remain unchanged.

## Validation
- [x] `app.js`, `domain.js`, `store.js`, `selftest.js`, `sw.js` pass `node --check`.
- [x] Rootflow self-test: 54/54 pass.
- [x] PWA cache bumped to V3.7.0.
