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
