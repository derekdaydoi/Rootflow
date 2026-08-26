# Rootflow

Rootflow là personal finance / treasury system chạy local-first trên trình duyệt/PWA. Ledger accounting-grade nằm bên dưới, nhưng trải nghiệm mặc định được thiết kế để trả lời trực tiếp các câu hỏi quản trị:

- Tôi có bao nhiêu tài sản, bao nhiêu là vốn ròng của mình và bao nhiêu đến từ vay nợ?
- Nợ nào ngắn hạn, nợ nào dài hạn, 30 ngày tới cần trả bao nhiêu và buffer có đủ không?
- Hoạt động vay để cho vay có tạo lợi nhuận không, và lợi nhuận đó có đi kèm vấn đề thanh khoản hay không?
- Kế hoạch chi tiêu tháng đang trong hạn mức hay vượt kế hoạch?
- Tôi đang có những khoản đầu tư/tài sản nào và còn bao nhiêu tiền có thể triển khai sau buffer?

Bộ nhận diện Rootflow dùng **ROOT family geometry**: một root/trunk base cố định và một Flow crown gồm ba lane bo tròn. Mark core dùng một màu `#087A4C` để giữ khả năng scale/monochrome; opening splash diễn giải đúng cấu trúc đó theo thứ tự seed → roots → trunk → three flows. Giao diện tiếp tục dùng xanh Rootflow làm accent chính, giảm decorative copy và giữ depth/shadow ở mức nhẹ thay vì flat dashboard.

## Final decision dashboard

Màn **Tổng quan** ưu tiên bốn khối, theo đúng thứ tự ra quyết định:

1. **Tài sản & nguồn vốn** — tổng tài sản, vốn ròng của user, vay nợ.
2. **Nợ & thanh khoản** — nợ ngắn/dài hạn, nghĩa vụ 30 ngày, cash hiện có, inflow đã chốt, buffer và shortfall nếu có.
3. **Hoạt động kinh doanh** — lãi cho vay, chi phí vốn đã biết, lợi nhuận lõi và trạng thái cashflow. Salary không được dùng để làm đẹp business profit.
4. **Chi tiêu & đầu tư** — ngân sách tháng, mức đã chi, phần còn lại, đầu tư tài chính, tài sản sở hữu và cash dư sau buffer.

Các treasury metrics cũ vẫn tồn tại cho power user nhưng được đưa xuống **Chi tiết nâng cao** thay vì chiếm Home mặc định.

Primary navigation được rút gọn để dễ đọc trên mobile và tránh overflow:

```text
Tổng quan · Dòng tiền · Tài sản · Kế hoạch
Overview · Cashflow · Assets · Plan
```

## Nguyên tắc tài chính

- `Vốn ròng = Tổng tài sản - Tổng nợ`.
- Nợ thẻ được xem là short-term; khoản vay có exact maturity được phân short/long theo horizon 12 tháng; kỳ hạn không đủ dữ liệu được giữ `unknown`, không đoán.
- Debt calendar chỉ chứa financing obligations thực: repayment, contract interest/fee, undated debt obligation và rollover control cost. Chi tiêu sinh hoạt hoặc một khoản cho vay mới không được gọi là “lịch trả nợ”.
- Business profitability được tách khỏi personal liquidity:
  - `core lending profit = recurring lending income - known funding cost`.
  - funding cost gồm interest/fee có thể xác định và revolving rollover control assumption.
  - salary là personal inflow, không phải lending profit.
  - nếu cost terms chưa đủ, UI phải ghi rõ đây là estimate thay vì giả định bằng 0.
- Profitability và liquidity là hai trạng thái độc lập: business có thể có lãi nhưng vẫn cash-tight do maturity mismatch.
- Spending plan đối chiếu budget theo category với actual expense trong tháng.
- Investment position tách `investment` khỏi `fixed_asset` để user thấy đầu tư tài chính và tài sản sở hữu riêng.

## Snapshot, forecast và buffer

Rootflow giữ semantics V3:

- `opening_balance`: flow cùng ngày baseline được replay.
- `closing_snapshot`: mọi flow `date <= balanceAsOf` đã nằm trong snapshot và không replay lần nữa.
- `confirmed=true` = **Actual / Đã xảy ra**.
- Future `CERTAIN` = **Committed / Đã chốt lịch**, không tự biến thành Actual chỉ vì tới ngày.
- Expected inflow không được dùng để chứng minh conservative safety.
- Nghĩa vụ tháng chưa biết exact date vẫn được tính trong planning nhưng không bị gán ngày giả.
- Rollover cost là control assumption, chỉ áp lên revolving principal; nó không phải fake ledger transaction.

Minimum cash requirement giữ nguyên logic explainable:

```text
minimum required cash
= maximum cumulative funding gap on dated cashflows
+ undated monthly obligations
+ rollover control cost
```

Nếu có operating reserve, phần này được cộng riêng vào `recommendedCashToKeep`.

## Kiến trúc

Core hiện hữu vẫn được giữ:

- `index.html` — app shell + opening splash
- `styles.css` — visual system gốc
- `brand-v2.css` — ROOT-family opening motion layer
- `app.js` — React UI/forms/timeline/calendar/simulator hiện hữu
- `domain.js` — finance engine gốc
- `store.js` — local storage, migration, backup/restore
- `selftest.js` — in-app business-rule tests
- `sw.js` — PWA/offline cache
- `brand/root-master.svg` — invariant ROOT base geometry
- `brand/`, `icon-*` — Rootflow logo và PWA assets

Snapshot/compatibility layer:

- `v3-domain.js` — closing snapshot, forecast, explainable liquidity primitives
- `v3-compat.js` — route legacy simulation qua snapshot-aware model
- `v3-store.js` — Committed vs Actual normalization
- `v3-i18n.js` — bilingual base dictionary

Final decision layer:

- `v4-domain.js` — balance sheet, debt health, core lending profit, spending and investment summaries
- `v4-i18n.js` — VI/EN copy cho decision dashboard
- `v4-ui.js` — presentation layer ưu tiên 5 câu hỏi quản trị
- `v4.css` — responsive modern-minimal UI; green-first, subtle depth, overflow/wrapping guards

V4 không thay schema và không rewrite framework. Rootflow vẫn không cần build step; GitHub Pages phục vụ trực tiếp các file tĩnh.

## Schema và migration

Store hiện tại dùng **schema v9**. V4 là derived/presentation layer nên không cần bump schema. Existing v9 backups vẫn import theo migration guard hiện hữu.

Các field snapshot/control quan trọng vẫn được đọc khi có:

```text
account.balanceSemantics
flow.cashflowPhase
flow.alreadyReflectedInSnapshot
flow.affectsProjectedCash
flow.forecastCashImpact
settings.snapshotDate
settings.forecastStartDate
settings.ignoreHistoricalFlowsForProjection
```

## Kiểm tra

```sh
node tests/run-tests.js
node tests/run-v3-tests.js
node tests/run-v3-store-tests.js
node tests/run-v3-compat-tests.js
node tests/run-v4-tests.js
node tests/run-ui-contract-tests.js
node tests/run-polish-tests.js
node tests/run-brand-v2-tests.js
```

V4 regressions kiểm tra balance sheet/vốn ròng, short-vs-long debt, debt-calendar filtering, business profit không cộng salary, spending budget và investment summary. Brand v2 regressions kiểm tra ROOT master reuse, opening motion sequence, reduced-motion behavior và PWA cache contract.

## Dữ liệu

Dữ liệu được lưu local trên thiết bị/browser. Không commit backup tài chính thật vào repository public. Nên xuất backup trước khi xoá Website Data, gỡ PWA hoặc đổi browser profile.
