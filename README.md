# Rootflow

Rootflow là personal financial operating system chạy local-first trên trình duyệt/PWA, dùng để theo dõi dòng tiền, tài khoản, tài sản, nợ phải trả, kế hoạch và kịch bản trong cùng một ledger.

## Nguyên tắc dữ liệu

- Tài sản = Nợ phải trả + Vốn chủ.
- Tài sản ròng = Tổng tài sản - Nợ phải trả.
- Tài khoản tiền mặt/ngân hàng/ví dùng số dư đầu kỳ tại ngày bắt đầu theo dõi; giao dịch từ ngày đó làm thay đổi số dư hiện tại.
- Khoản vay, phải thu, đầu tư và tài sản hiện hữu có thể được nhập theo số dư snapshot để tránh replay lịch sử trước thời điểm bắt đầu theo dõi.
- Trả khoản vay tách vốn/gốc và chi phí vay: gốc giảm liability, chi phí vay đi vào expense, cash giảm bằng tổng hai phần.
- Cho vay và thu hồi gốc là luân chuyển giữa tiền khả dụng và phải thu, không phải income/expense của principal.
- Giao dịch hôm nay/quá khứ được ghi nhận actual; giao dịch tương lai nằm trong forecast.

## Cấu trúc

- `index.html` — app shell và style
- `app.js` — UI
- `domain.js` — finance engine
- `store.js` — local storage, migration, backup/restore
- `selftest.js` — business-rule tests
- `sw.js` — PWA/offline cache
- `manifest.json` — PWA manifest
- `vendor/` — runtime local
- `brand/`, `icon-*` — logo và PWA assets

Rootflow không cần build step; GitHub Pages phục vụ trực tiếp các file tĩnh trong repository.

## Dữ liệu

Dữ liệu được lưu local trên thiết bị/browser. Nên xuất backup trước khi xoá Website Data, gỡ PWA hoặc đổi browser profile.
