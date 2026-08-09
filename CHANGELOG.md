# V3.6.0 — 2026-08-10

- Preserved the V3.5 Root Green / white R-flow logo assets, display typography and navigation structure.
- Loan repayment entry now uses a two-part split: `Vốn / gốc` + `Chi phí vay`; the total cash out is computed automatically.
- Repayment accounting now reduces liability only by principal while recognizing borrowing cost as expense; legacy repay rows remain backward compatible.
- Added personal balance-sheet account classes for investments and owned assets, plus current/long-term classification for NWC.
- Dashboard now includes `Bảng cân đối cá nhân` with Assets, Liabilities, Equity / Net Worth, NWC, Debt ratio, Current ratio, Debt-service ratio, OPEX and CAPEX.
- CAPEX is measured from confirmed transfers into owned-asset accounts; investment transfers remain capital allocation, not OPEX.
- Historical/forward liquidity labels clarified to distinguish the last 30 days from the next 30 days.
- Self-test suite expanded to 48 checks.
- PWA cache bumped to `rootflow-v3.6.0-2026-08-10`.
- Data schema remains v4; new fields are optional and backward compatible.

# V3.5.0 — 2026-08-10

- Final Rootflow visual direction applied to production UI: Warm Ivory neutral canvas + deep Root Green hero/action surfaces.
- New app mark: full Root Green rounded square, white R-flow stroke and a white root dot at the first foot of the path.
- Regenerated SVG/PNG logo assets and all PWA/Home Screen icons from the same geometry.
- Typography hierarchy updated: Manrope for brand/display when online, with Avenir Next/system fallback; operational UI stays system-first and all financial figures use tabular numerals.
- Dashboard `Cơ cấu chi tiêu` becomes `Cơ cấu dòng tiền` with an interactive `Chi tiêu / Thu nhập` segmented switch.
- Added stable, high-contrast categorical colors for expense composition and a separate stable income-source palette.
- Income transactions can now optionally select a `Nguồn thu` (Lương, Lãi / lợi tức, Business, Đầu tư, Hoàn tiền, Thu nhập khác) using the existing `category` field; schema v4 is unchanged.
- Cash-flow chart line/area/risk markers and card elevation refined for stronger readability.
- PWA cache bumped to `rootflow-v3.5.0-2026-08-10`.
- `domain.js`, `store.js` and `selftest.js` remain unchanged.

# V3.4.0 — 2026-08-10

- Dashboard balance hero restored as the primary brand-color surface: deep Root Green, white metric text, and deliberate elevation/shadow.
- Expense donut now uses stable category-to-color mapping instead of order-dependent muted greens.
- Donut keeps at most six visible segments (top five + Còn lại), matching the legend and improving mobile readability.
- Added small segment gaps and stronger legend markers for category discrimination.
- Finance engine, schema v4 and persistence unchanged.

# V3.3.0 — 2026-08-10

- Rootflow Design Tokens V1 applied across all screens.
- Primary/active green standardized to `#14614A`; removed olive/sage primary treatments.
- Dashboard balance hero changed to a neutral financial surface; decorative green gradients removed.
- Bottom navigation standardized to neutral surface + Root Green active/action states.
- Kế hoạch and Kịch bản now include the same Back control as Giao dịch.
- Updated multi-category chart palette to a restrained, brand-compatible set.
- PWA cache bumped to `rootflow-v3.3.0-2026-08-10`.
- Finance engine, schema v4, and persistence logic unchanged.

# V3.2.0 — 2026-08-09

- Replaced the botanical mark with the Root → Flow `R` identity.
- Graphite anchor/root transitions into a deep green (`#14614A`) flow stroke.
- Added vector masters for symbol, app icon and horizontal logo lockup.
- Regenerated PWA/Home Screen icons at 180/192/256/512/1024.
- Removed repeated compact logo from `Kế hoạch` and `Kịch bản` title bars.
- Simplified the transaction page title to `Giao dịch`.
- Preserved finance engine, schema v4, migrations and user data.
- PWA cache bumped to `rootflow-v3.2.0-2026-08-09`.

# V3.1.0 — 2026-08-07

- Rebuilt Rootflow logo from a dedicated 1254×1254 high-resolution master; no mockup crop.
- Regenerated Home Screen/PWA icons at 180/192/256/512/1024 using Lanczos resampling.
- Header uses the same exact master-derived mark as the Home Screen icon.
- Fine-tuned header proportions, wordmark and tagline for mobile.
- Finance engine, store schema and existing user data remain unchanged.
- PWA cache bumped to `rootflow-v3.1.0-2026-08-07`.

# Rootflow V3.0 — Root family UI

- Giữ nguyên finance engine, schema v4, store/persistence và dữ liệu người dùng từ V2.9.
- Dashboard header chuyển thành một family card hoàn chỉnh: sprout + flowing path tile, ROOT graphite, FLOW botanical green, tagline `SEE WHAT COMES NEXT.`.
- Header chỉ còn một nút menu theo đúng visual target; menu mở lối vào Tài khoản và Cài đặt để không mất chức năng.
- Home Screen icon dùng cùng sprout + flowing path mark, nền ivory/green đồng bộ Rootwork.
- Dashboard palette chuyển sang warm ivory + botanical green; balance hero và card surfaces mềm hơn, cùng family với Rootwork.
- Giữ Rootwork-style natural document scrolling từ V2.7.
- Cache: `rootflow-v3.0-2026-08-07`.

# Rootflow V2.8 — Root family brand refresh

- Giữ nguyên schema, domain logic, store/persistence và dữ liệu V2.7.
- Header Dashboard chuyển sang family lockup: mark tile + ROOT đen + FLOW xanh.
- Tagline mới: `SEE WHAT COMES NEXT.`
- Mark mới kết hợp dòng chảy và mầm cây; dùng chung cho header và Home Screen icon.
- Thay toàn bộ icon 180/192/256/512/1024 và brand assets nhưng giữ nguyên tên file để manifest không phải đổi.
- Cache: `rootflow-v2.8-2026-08-07`.

# Rootflow V2.7 — Rootwork-style scroll

- Bỏ fixed app-frame / inner `.app-scroll` / safe-area overlay.
- Trở lại document scroll tự nhiên như Rootwork.
- Giữ bottom navigation fixed/floating.
- Cold launch từ Home Screen luôn reset về đầu trang; resume app vẫn giữ vị trí.
- Chuyển tab chính reset về đầu tab.
- Sheet khóa body tại đúng scroll position và restore khi đóng.
- Cache: `rootflow-v2.7-2026-08-07`.

# V2.6.2 — iOS scroll hotfix

- Replaced `100dvh` app-frame sizing with a fixed viewport frame (`position: fixed; inset: 0`).
- Removed the hard-coded 44px iOS safe-area fallback; Rootflow now trusts the native `env(safe-area-inset-top)`.
- Changed the inner scroller from `overscroll-behavior: contain` to `none` to stop rubber-band gaps.
- Anchored the top safe-area mask and bottom navigation to the app frame with `position: absolute`.
- Locked the document body itself to prevent Safari from scrolling/bouncing the page behind Rootflow.
- Bumped service-worker cache to `rootflow-v2.6.2-2026-08-07`.

# Rootflow changelog

## V2.6 — 2026-08-07

- Bỏ hoàn toàn thao tác tick/xác nhận khỏi UX dòng tiền.
- Manual flow hôm nay/quá khứ được ghi actual ngay; future flow giữ planned và auto-post khi tới hạn.
- Giữ và hoàn thiện sửa lịch lặp: một kỳ / các kỳ sau, đổi frequency, đổi số kỳ, dừng series.
- Dashboard thêm Spending Burn Rate, Safe/day và Category vs Budget.
- Giữ Monthly Spending Trend và spending composition để tracking hành vi chi tiêu.
- Thêm icon budget block: Yêu đương, Đầu tư, Trading, Học tập, Business.
- Đổi nhận diện Rootflow từ `RF` sang Root dot + Flow curve; bổ sung icon SVG + PNG 180/192/256/512/1024.
- Bỏ fixed-nav backdrop blur, giảm GPU compositing khi scroll.
- Debounce persistence 250 ms, flush khi page background; bỏ JSON deep-clone trong state mutation.
- Memoize dashboard/scenario calculation; flow list render theo batch 80 rows.
- Thêm `content-visibility` cho card/list ngoài viewport.
- Giữ V2.5 app-shell scroll + fixed safe-area mask cho iPhone.
- Nâng schema v3 → v4.
- Service worker chuyển navigation/app code sang network-first để Home Screen nhận release mới nhanh hơn.

## V2.5 — 2026-08-07

- Chuyển scroll khỏi `body` sang `.app-scroll` để layout hoạt động như app shell.
- Thêm fixed safe-area mask ở đầu viewport, ngăn nội dung va vào status bar iPhone khi cuộn/rubber-band.
- Dùng `100dvh`, `env(safe-area-inset-top)` và fallback cho WebKit mobile.
- Giữ bottom navigation cố định, tăng bottom content inset để card cuối không bị che.

## V2.4 — 2026-08-06

- Chặn màn thêm dòng tiền/kịch bản khi chưa có tài khoản và dẫn thẳng sang bước tạo tài khoản.
- Vô hiệu hoá loại dòng tiền không đủ tài khoản nguồn/đối ứng; không còn picker rỗng khó hiểu.
- Tự reset tài khoản nguồn/đối ứng khi đổi loại để select không rơi vào trạng thái giá trị không tồn tại.
- Sửa chuỗi lặp từ kỳ hiện tại bằng seriesId mới.
- Chặn hai block kế hoạch dùng cùng một nhóm trong cùng tháng để không cộng trùng chi tiêu.
- Khôi phục backup, import, thùng rác và self-test trong Cài đặt.

## V2.3 — 2026-08-06

- Keyboard-aware bottom sheet dùng VisualViewport.
- Hiển thị và cho phép sửa frequency của dòng tiền lặp.
- Thêm phạm vi sửa một kỳ / từ kỳ hiện tại trở đi.
- Nâng schema v2 → v3.

## V2.2 — 2026-08-06

- Thêm xoá toàn bộ dữ liệu trong Cài đặt với xác nhận hai bước.

## V2.1 — 2026-08-06

- Thay menu ba gạch bằng nút Settings.
- Xoá dữ liệu mẫu.
- Thêm copyright © derekdaydoi.
- Nâng cấp mobile bottom navigation và overflow guards.

## V2.0 — 2026-08-06

- Dashboard consumer-finance mới.
- Charts, block budget, Scenario Lab, bottom nav.
- Static React PWA deploy trực tiếp GitHub Pages.

## V2.6.1 — Brand lockup alignment
- Dashboard header now shows the complete ROOTFLOW lockup on mobile.
- ROOT is graphite/black; FLOW is Root Green.
- Rootflow mark viewBox is cropped so the mark no longer looks tiny or isolated.
- Removed the vertical divider in the lockup and aligned mark + wordmark as one unit.
- Mobile hides only the tagline, not the ROOTFLOW name.
- Service-worker cache bumped to v2.6.1.
