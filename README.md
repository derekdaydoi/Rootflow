# Rootflow

Rootflow là **personal financial operating system** chạy local-first trên trình duyệt/PWA: theo dõi dòng tiền, kế hoạch, kịch bản và bảng cân đối cá nhân trong cùng một ledger.

## Nguyên tắc dữ liệu

- **Tài sản = Nợ phải trả + Vốn chủ**.
- `Tài sản ròng / Net Worth = Tổng tài sản - Nợ phải trả`.
- Tài khoản tiền mặt/ngân hàng/ví dùng **Số dư đầu kỳ** tại **Ngày bắt đầu theo dõi**. Mọi giao dịch từ ngày đó, kể cả cùng ngày, làm thay đổi số dư hiện tại.
- Khoản vay/phải thu/đầu tư/tài sản hiện hữu có số dư lớn hơn 0 được coi là **snapshot** tại ngày nhập để lịch sử trước đó không bị replay lần hai.
- Trả khoản vay tách **Vốn / gốc** và **Chi phí vay**: gốc giảm liability; chi phí vay đi vào expense; cash giảm bằng tổng hai phần.
- Cho vay/thu nợ là luân chuyển giữa tiền khả dụng và phải thu, không phải income/expense của principal.
- Giao dịch hôm nay/quá khứ được ghi nhận actual; giao dịch tương lai nằm trong forecast và tự post khi tới ngày.

## Cấu trúc repo

- `index.html` — HTML/CSS/app shell
- `app.js` — React UI
- `domain.js` — finance engine
- `store.js` — localStorage, migration, backup/restore
- `selftest.js` — business-rule tests
- `sw.js` — PWA/offline cache
- `manifest.json` — PWA manifest
- `vendor/` — React runtime local
- `brand/`, `icon-*.png` — logo và PWA assets

Không có build step. GitHub Pages phục vụ trực tiếp các file tĩnh.

## Deploy GitHub Pages

1. Upload toàn bộ nội dung gói này vào root repository.
2. GitHub → `Settings` → `Pages`.
3. Chọn `Deploy from a branch`, branch `main`, folder `/(root)`.
4. Sau khi deploy, reload trang một lần. Nếu dùng Home Screen PWA, đóng app rồi mở lại để service worker nhận cache mới.

## Dữ liệu và backup

Dữ liệu nằm local trên thiết bị/browser. Rootflow có `Xuất backup` và `Nạp backup`. Trước khi xoá Website Data, gỡ PWA hoặc đổi browser profile, hãy xuất backup trước.

## Phạm vi hiện tại

- VND only.
- Chưa bank sync/cloud sync.
- Persistence: localStorage.
- Một browser profile là một data store độc lập.
