# Rootflow V2.6 — QA report

Ngày kiểm tra: 2026-08-07

## Kết quả đạt

### JavaScript syntax
- `app.js` — PASS
- `domain.js` — PASS
- `store.js` — PASS
- `selftest.js` — PASS
- `sw.js` — PASS

### Finance/business rules
`rootflowSelfTest()` → **36/36 PASS**.

Bao gồm các invariant chính:
- income/expense ảnh hưởng đúng liquid balance;
- credit-card spend tăng liability nhưng chưa trừ cash;
- card repayment không double-count expense;
- internal transfer không tạo income/expense;
- borrowing/repayment/lending/collection đúng accounting semantics;
- planned flow không làm thay đổi current balance;
- forecast vẫn đưa planned flow vào đúng ngày;
- month actual không cộng planned transaction;
- recurring month-end clamp đúng;
- flow validation chặn account pairing sai.

### Schema migration v4
PASS:
- schema v3 → v4;
- planned row ngày hôm nay/quá khứ → `confirmed=true`, `autoPosted=true`;
- future row vẫn `confirmed=false` để forecast.

### PWA/static assets
PASS:
- toàn bộ 15 asset trong service-worker precache tồn tại;
- cache id = `rootflow-v2.6-2026-08-07`;
- manifest có icon 180/192/256/512/1024;
- app icon master SVG và brand vector tồn tại.

### Static regression scan
PASS:
- không còn `toggleFlow` / `onToggle`;
- không còn UI `Đánh dấu`;
- không còn `Nạp dữ liệu mẫu`;
- không còn wording `chưa xác nhận/đã xác nhận` trong runtime source;
- budget picker có Love / Invest / Trading / Study / Business icon.

## Performance changes reviewed
- fixed bottom nav: `backdrop-filter:none`;
- body locked, `.app-scroll` là scroll container;
- safe-area mask cố định phía trên;
- localStorage save debounce 250ms + pagehide flush;
- không còn JSON stringify/parse deep-clone trong mutation path;
- dashboard/scenario calculation dùng memoization;
- flow list batching 80 rows;
- offscreen cards có `content-visibility:auto`.

## Chưa thể chứng nhận trong môi trường build

Browser smoke test bằng headless Chromium bị environment chặn navigation với `ERR_BLOCKED_BY_ADMINISTRATOR`, kể cả localhost/file URL. Vì vậy báo cáo này **không** tuyên bố đã test trực tiếp:
- iOS Safari rubber-band/safe-area animation;
- keyboard animation trên iPhone thật;
- 60/120 Hz scroll feel trên thiết bị;
- Home Screen service-worker lifecycle thực tế sau GitHub Pages deploy.

Các phần trên cần kiểm tra trên iPhone sau deploy. Đây là giới hạn môi trường QA, không phải test pass giả định.
