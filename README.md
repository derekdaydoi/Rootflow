# Rootflow V3.5.0

Rootflow is a local-first personal cash-flow operating system: **understand now → plan the rhythm → see what comes next**. V3.5 locks the final visual direction while keeping finance logic and schema v4 intact.

**Release:** 2026-08-10  
**Data schema:** v4 (unchanged)  
**PWA cache:** `rootflow-v3.5.0-2026-08-10`

## V3.5 changes

- Final app mark: Root Green `#14614A` rounded square + white R-flow + root dot.
- UI foundation: Warm Ivory `#F3F0E7`, Graphite `#101110`, Surface `#FFFDF9`, Root Green `#14614A`, Deep Green `#0E4A38`.
- Dashboard balance remains the single strong green hero surface; the rest of the app stays neutral and data-first.
- Brand/display typography uses Manrope when available online, then falls back to Avenir Next/system; operational UI remains system-first.
- All financial numbers use tabular numerals for stable alignment.
- `Cơ cấu dòng tiền` now toggles between **Chi tiêu** and **Thu nhập** instead of showing expense composition only.
- Expense categories and income sources use separate fixed high-contrast color mappings so the same category/source keeps the same color across months.
- Income flow entry now supports an optional `Nguồn thu` using the existing `category` field; no migration is required. Existing income without a source is grouped as `Thu nhập khác`; `Lãi nhận` defaults to `Lãi / lợi tức`.
- Kế hoạch, Kịch bản and Giao dịch retain the same Back/header/navigation pattern introduced in V3.3.
- Finance engine, persistence and schema remain unchanged.

## Brand assets

- `brand/rootflow-symbol.svg` — runtime/app mark vector.
- `brand/rootflow-icon-master.svg` — editable square vector master.
- `brand/rootflow-logo.svg` — horizontal lockup.
- `brand/rootflow-mark-1024.png` — square raster master used by `make_icons.py`.
- `icon-180/192/256/512/1024.png` — PWA / iOS icons.

# Rootflow V2.6

Rootflow là personal cash-flow operating system theo hướng **hiểu hiện tại → kiểm soát nhịp chi → nhìn trước dòng tiền tương lai**. Bản này chạy trực tiếp như PWA trên GitHub Pages, local-first, không server và không tài khoản.

**Release:** 2026-08-07  
**Data schema:** v4  
**PWA cache:** `rootflow-v2.6-2026-08-07`

## Điểm mới V2.6

### Dòng tiền: nhập là ghi nhận
- Giao dịch manual có ngày hôm nay/quá khứ được ghi nhận `actual` ngay; không còn checkbox/tick xác nhận.
- Dòng tương lai vẫn là `planned` để forecast đúng và tự chuyển thành actual khi tới hạn.
- Dòng lặp giữ tần suất và vẫn sửa được `Chỉ kỳ này` / `Các kỳ sau`.
- Có thể đổi tuần/tháng, số kỳ còn lại hoặc dừng lịch lặp.

### Expense analytics
- **Nhịp chi tiêu / Burn rate:** chi tiêu tích luỹ actual so với pace ngân sách theo ngày.
- **Safe / ngày:** số ngân sách còn có thể dùng trung bình mỗi ngày tới cuối tháng.
- **Chi tiêu vs. ngân sách:** so từng block với số đã dùng và phần còn lại.
- **Xu hướng chi tiêu:** theo dõi spending theo tháng.
- **Cơ cấu chi tiêu:** donut overview theo category.

### Budget block icon
Có sẵn icon cho: Ăn uống, Cafe, Di chuyển, Thể thao, Giải trí, **Yêu đương, Đầu tư, Trading, Học tập, Business**, Nhà ở và Khác.

### Brand mới
- Bỏ monogram `RF` khỏi app icon.
- Rootflow dùng **Root dot + Flow curve**: graphite root point, green rising flow, ivory background.
- Bộ asset gồm SVG master và PNG 180/192/256/512/1024 px.

### Mobile shell & performance
- Scroll chỉ diễn ra trong `.app-scroll`; safe-area mask ngăn content va vào status bar iPhone.
- Bottom nav giữ cố định và bỏ `backdrop-filter` blur để giảm compositing khi scroll.
- Save localStorage được debounce 250 ms và flush khi app đi background.
- State mutation không còn JSON deep-clone toàn bộ data.
- Dashboard/scenario calculations được memoize.
- Dòng tiền render theo batch 80 rows với `Xem thêm`.
- Offscreen cards dùng `content-visibility` để giảm layout/paint.
- Keyboard-aware sheet dùng VisualViewport; bottom nav ẩn khi bàn phím mở.

## Cấu trúc repo

| File / thư mục | Vai trò |
|---|---|
| `index.html` | HTML + CSS + app shell |
| `app.js` | React UI, charts, forms, plan, scenario |
| `domain.js` | Finance engine — pure functions |
| `store.js` | localStorage, migration schema v4, backup |
| `selftest.js` | Business-rule assertions |
| `sw.js` | Service worker / offline cache / update strategy |
| `manifest.json` | PWA manifest |
| `vendor/` | React 18 UMD local |
| `brand/rootflow-icon-master.svg` | Vector master for the app/PWA icon |
| `brand/rootflow-symbol.svg` | Runtime vector mark used in the Dashboard header |
| `brand/rootflow-logo.svg` | Editable horizontal ROOTFLOW vector lockup |
| `brand/rootflow-logo-master.png` | 1024×1024 raster master for icon regeneration |
| `icon-*.png` | PWA / iOS icon sizes |
| `brand/` | High-resolution master + runtime logo exports |
| `make_icons.py` | Regenerate all PWA/iOS PNG icons from the high-resolution master |

Không có bước build. GitHub Pages phục vụ trực tiếp các file tĩnh.

## Deploy lên GitHub Pages

1. Đưa **toàn bộ nội dung** thư mục này vào root repo.
2. GitHub → `Settings` → `Pages`.
3. Source: `Deploy from a branch`.
4. Branch: `main`, folder: `/(root)`.
5. Mỗi release mới phải đổi `CACHE` trong `sw.js`.

Sau khi Pages deploy xong, mở URL Rootflow bằng Safari và reload một lần, force-close bản Home Screen rồi mở lại. Service worker V2.6 ưu tiên network cho navigation/app code nên update thường nhận nhanh hơn bản cache-first cũ.

## Data model v4

```text
Account
Flow {
  date, kind, amount,
  confirmed,              // internal: actual=true / planned=false
  seriesId, seriesFreq, seriesIndex, seriesCount
}
Budget { month, name, category, limit, icon }
Scenario { name, date, kind, amount, accountId, counterAccountId }
Settings { reserveFloor, horizonDays }
```

`confirmed` vẫn tồn tại **nội bộ** để finance engine phân biệt actual và planned, nhưng user không phải tick xác nhận thủ công.

Migration v4 tự post các dòng planned đã tới hạn thành actual khi load dữ liệu cũ.

## Backup & dữ liệu

- Dữ liệu chính nằm trên thiết bị.
- Cài đặt có `Xuất backup`, `Nạp backup`, `Thùng rác`, `Chạy kiểm tra nghiệp vụ`, `Xoá toàn bộ dữ liệu`.
- Xoá Website Data / gỡ dữ liệu Safari có thể xoá database local; nên export backup trước khi thao tác mạnh.

## Giới hạn có chủ đích

- Một thiết bị, một browser profile; chưa cloud sync.
- VND only.
- Chưa bank sync.
- localStorage vẫn là persistence layer hiện tại; nếu data lên hàng nghìn/hàng chục nghìn transaction, migration sang IndexedDB là bước scale tiếp theo.
- Scenario hiện đại diện chủ yếu cho một event; multi-event scenario thuộc roadmap sau.
