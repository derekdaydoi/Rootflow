# Rootflow

Rootflow là personal treasury system chạy local-first trên trình duyệt/PWA. Ledger accounting-grade nằm bên dưới; giao diện tập trung vào tiền khả dụng, điểm áp lực, buffer và các quyết định tài chính đời thường.

## Nguyên tắc dữ liệu

- Tài sản = Nợ phải trả + Vốn chủ.
- Tài sản ròng = Tổng tài sản - Nợ phải trả.
- Tài khoản tiền mặt/ngân hàng/ví dùng số dư đầu kỳ tại ngày bắt đầu theo dõi; giao dịch từ ngày đó làm thay đổi số dư hiện tại.
- Khoản vay, phải thu, đầu tư và tài sản hiện hữu có thể được nhập theo số dư snapshot để tránh replay lịch sử trước thời điểm bắt đầu theo dõi.
- Trả khoản vay tách vốn/gốc và chi phí vay: gốc giảm liability, chi phí vay đi vào expense, cash giảm bằng tổng hai phần.
- Cho vay và thu hồi gốc là luân chuyển giữa tiền khả dụng và phải thu, không phải income/expense của principal.
- Giao dịch hôm nay/quá khứ được ghi nhận actual; giao dịch tương lai nằm trong forecast.
- Dòng tiền tương lai được phân `CERTAIN`, `EXPECTED`, `UNCERTAIN`; inflow chưa chắc chắn không được dùng để chứng minh trạng thái an toàn.
- `liquidityBuffer = projectedLowPoint - hardFloor`; `operatingHeadroom = projectedLowPoint - operatingBuffer`.
- `UNSAFE` khi thủng hard floor, `TIGHT` khi trên hard floor nhưng dưới operating buffer, còn lại là `SAFE`.
- Vay và cho vay tạo contract/counterparty; ngày đáo hạn và ngày dự kiến thu được đưa vào cùng một timeline để phát hiện maturity mismatch.
- Điều khoản vay/cho vay hỗ trợ không lãi, lãi suất đơn theo tháng hoặc một khoản lãi cố định; tài khoản và hợp đồng đã tạo có thể sửa lại.
- Nguồn vốn `Kết hợp` được lưu như nguồn tổng hợp và không buộc liên kết thêm một khoản vay cụ thể.
- Kế hoạch chi tiêu tháng đặt hạn mức theo nhóm, đối chiếu với chi phí actual và cảnh báo khi dùng từ 80% hoặc vượt kế hoạch.

## Cấu trúc

- `index.html` — app shell
- `styles.css` — hệ thống giao diện mobile-first, safe-area và responsive
- `app.js` — UI
- `domain.js` — finance engine
- `store.js` — local storage, migration, backup/restore
- `selftest.js` — business-rule tests chạy được trong app
- `tests/run-tests.js` — test tài chính và migration chạy bằng Node
- `sw.js` — PWA/offline cache
- `manifest.json` — PWA manifest
- `vendor/` — runtime local
- `brand/`, `icon-*` — logo và PWA assets

Rootflow không cần build step; GitHub Pages phục vụ trực tiếp các file tĩnh trong repository.

## Schema và migration

Schema hiện tại là v6. Migration giữ nguyên `accounts`, `flows`, `budgets`, `scenarios`, thêm `counterparties`, `contracts`, ba mức buffer và confidence cho forecast. Planned flow cũ được giữ ở mức `EXPECTED` thay vì tự nâng thành confirmed. Backup cũ vẫn import được; dữ liệu từ schema mới hơn bị từ chối trước khi ghi đè.

## Kiểm tra

```sh
node tests/run-tests.js
```

Suite bao phủ vay, cho vay, thu gốc/lãi, trả gốc/chi phí vay, maturity mismatch, buffer status, decision simulation, input tiền rút gọn và migration guard.

## Dữ liệu

Dữ liệu được lưu local trên thiết bị/browser. Nên xuất backup trước khi xoá Website Data, gỡ PWA hoặc đổi browser profile.
