# Rootflow

Rootflow là personal treasury system chạy local-first trên trình duyệt/PWA. Ledger accounting-grade nằm bên dưới; giao diện ưu tiên trả lời những câu hỏi đời thường: **đang có bao nhiêu tiền, sắp phải trả gì, ngày nào căng nhất, cần giữ bao nhiêu cash và vì sao**.

**Money in motion. Clarity in control.** Bộ nhận diện, logo, source dot, ba flow bo tròn và opening splash được giữ nguyên. Opening animation vẫn tôn trọng `prefers-reduced-motion`.
Ở chế độ standalone/Home Screen, viewport khóa pinch-zoom và chỉ giữ thao tác pan dọc; khi mở bằng trình duyệt thường, khả năng zoom vẫn được giữ nguyên.

## Rootflow V3 — explainable treasury

V3 là lớp bổ sung trên kiến trúc V2 hiện hữu, không rewrite framework hoặc phá visual system. Nó thêm:

- **Tổng quan / Overview**: tiền hiện có, snapshot date, minimum cash required, recommended buffer, pressure date và phần giải thích phép tính.
- **Lịch tiền / Cash Calendar**: cash bridge, nghĩa vụ 7/30 ngày, gốc/lãi/phí và nghĩa vụ tháng chưa có exact date.
- **Nợ & Cho vay / Debt & Lending**: lending book và funding links giữa khoản vay với khoản phải thu.
- **Kế hoạch / Plan**: giữ lại công cụ mô phỏng hiện hữu.
- **Song ngữ VI/EN** cho trải nghiệm chính; Vietnamese là mặc định.
- **Control obligation** cho rollover cost thẻ: hiển thị trong planning nhưng không giả thành ledger transaction.

## Nguyên tắc dữ liệu

- Tài sản = Nợ phải trả + Vốn chủ.
- Tài sản ròng = Tổng tài sản - Nợ phải trả.
- Account hỗ trợ hai semantics rõ ràng:
  - `opening_balance`: flow cùng ngày baseline được replay.
  - `closing_snapshot`: mọi flow `date <= balanceAsOf` đã nằm trong snapshot và không được replay lần nữa.
- Khoản vay, phải thu, đầu tư và tài sản hiện hữu có thể được nhập theo snapshot để tránh double count lịch sử.
- `confirmed=true` nghĩa là **Actual / Đã xảy ra**. Một future flow `CERTAIN` chỉ là **Committed / Đã chốt lịch**, không tự biến thành actual chỉ vì đến ngày.
- Trả khoản vay tách principal, interest và fee. Cash out = principal + interest + fee.
- Cho vay và thu hồi gốc là luân chuyển giữa tiền khả dụng và phải thu; principal collection không phải income.
- Interest-only receivable không giảm principal khi thu lãi.
- Dòng tiền tương lai được phân `CERTAIN`, `EXPECTED`, `INFERRED`, `UNCERTAIN/UNKNOWN`; Expected inflow không được dùng để chứng minh conservative safety.
- Statement thẻ là statement; debt conversion từ revolving sang installment là non-cash reclassification.
- Rollover rate là control assumption và chỉ áp lên revolving principal.
- Nghĩa vụ monthly nhưng chưa biết exact due date vẫn được tính vào planning mà không bị gán ngày giả.

## Buffer và thanh khoản

Rootflow V3 không yêu cầu user tự hiểu `hard floor` trước khi dùng app.

Minimum cash requirement được giải thích theo cấu trúc:

```text
Minimum required cash
= maximum cumulative funding gap on dated cashflows
+ undated monthly obligations
+ estimated rollover control cost
```

Nếu user có `operatingBuffer`, Rootflow cộng phần reserve này riêng để tạo `recommendedCashToKeep`.

Rootflow hiển thị hai góc nhìn:

- **Conservative**: chỉ dùng committed/CERTAIN inflow để chứng minh khả năng cover.
- **Expected**: bổ sung expected inflow để user nhìn planning case, nhưng không dùng để nâng trạng thái an toàn bảo thủ.

## Cấu trúc

Core V2 được giữ nguyên:

- `index.html` — app shell + opening splash
- `styles.css` — visual system hiện hữu
- `app.js` — React UI hiện hữu
- `domain.js` — finance engine gốc
- `store.js` — local storage, migration, backup/restore
- `selftest.js` — in-app business-rule tests
- `tests/run-tests.js` — regression suite hiện hữu
- `sw.js` — PWA/offline cache
- `brand/`, `icon-*` — logo và PWA assets

V3 bổ sung theo kiểu additive:

- `v3-domain.js` — snapshot-aware projection, explainable buffer, debt calendar, funding map
- `v3-store.js` — tách Committed khỏi Actual, normalize legacy auto-posted flows
- `v3-i18n.js` — bilingual copy layer
- `v3-ui.js` — progressive UX panels trên UI hiện hữu
- `v3.css` — chỉ style các component V3; không overwrite visual system cũ
- `tests/run-v3-tests.js` — snapshot/buffer/funding regression tests
- `tests/run-v3-store-tests.js` — committed-vs-actual persistence tests

Rootflow vẫn không cần build step; GitHub Pages phục vụ trực tiếp các file tĩnh trong repository.

## Schema và migration

Store hiện tại dùng **schema v9**. V3 không bắt buộc bump schema vì các field bổ sung đều backward-tolerant và backup v9 hiện hữu vẫn import được.

Các field quan trọng V3 có thể đọc khi tồn tại:

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

Backup từ schema mới hơn app vẫn bị từ chối trước khi ghi đè, giữ migration guard hiện hữu.

## Kiểm tra

```sh
node tests/run-tests.js
node tests/run-v3-tests.js
node tests/run-v3-store-tests.js
```

CI trên branch/PR chạy cả ba suite.

## Dữ liệu

Dữ liệu được lưu local trên thiết bị/browser. Không commit backup tài chính thật vào repository public. Nên xuất backup trước khi xoá Website Data, gỡ PWA hoặc đổi browser profile.
