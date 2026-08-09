# Rootflow V3.4.0

Root → Flow identity refresh + cleaner navigation headers. Finance engine and stored data remain unchanged.

**Release:** 2026-08-10  
**Data schema:** v4 (unchanged)  
**PWA cache:** `rootflow-v3.4.0-2026-08-10`

### V3.4 changes

- Balance hero is now the deliberate brand anchor: deep Root Green tonal surface, white metric text, stronger elevation/shadow.
- Expense donut uses stable category colors, so a category keeps the same color across months.
- Donut is capped at six readable segments (top five + `Còn lại`) and the legend always matches the chart.
- Categorical colors are intentionally multi-hue for discrimination; brand UI remains Root Green + neutral.
- Finance engine, schema v4, migrations, persistence and existing user data are unchanged.

### V3.3 changes

- Chuẩn hoá Design Tokens V1 trên toàn app: Warm Ivory `#F3F0E7`, Graphite `#101110`, Root Green `#14614A`, neutral cards và semantic states.
- Loại bỏ sage/olive gradients khỏi balance card và bottom navigation; Root Green chỉ dùng cho action, active state, forecast/positive emphasis.
- Đồng bộ header của Kế hoạch, Kịch bản và Giao dịch: tất cả đều có nút Back về Tổng quan.
- New vector `R` symbol: graphite root/anchor → deep green (`#14614A`) flow trajectory.
- Dashboard keeps the full ROOTFLOW lockup; `ROOT` is graphite and `FLOW` uses the same deep green as the R flow stroke.
- `Kế hoạch` and `Kịch bản` headers no longer repeat the Rootflow mark; they show the page title only.
- Transaction screen is titled `Giao dịch` and its title area no longer shows a secondary row count.
- PWA/Home Screen icons regenerated at 180/192/256/512/1024 from the same mark geometry.
- Added editable vector assets: `brand/rootflow-symbol.svg`, `brand/rootflow-icon-master.svg`, `brand/rootflow-logo.svg`.
- No changes to `domain.js`, schema v4, migrations, persistence, calculations, or existing user data.

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
