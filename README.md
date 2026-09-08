# Rootflow

**Rootflow là hệ thống điều hành vốn và dòng tiền cá nhân.**

Rootflow tập trung vào một câu hỏi vận hành:

> Hôm nay tôi thực sự có thể sử dụng bao nhiêu tiền mà vẫn an toàn cho các nghĩa vụ sắp tới?

## Mental model

**Tiền hiện có → Tiền cần giữ → Tiền nên giữ → Tiền có thể dùng → Tiền sinh hoạt → Vốn có thể triển khai**

Thời gian là một phần của tiền. Dòng tiền đáng tin cậy đến trước ngày nghĩa vụ đáo hạn có thể giảm số tiền cần bảo vệ ngay hôm nay; dòng tiền Expected/Uncertain chỉ dùng cho dự phóng và không được biến một trạng thái thiếu an toàn thành an toàn.

## Bốn màn hình chính

- **Hôm nay** — tiền hiện có, tiền cần giữ, tiền có thể dùng và các việc sắp tới.
- **Dòng tiền** — dự phóng 7/30/90 ngày, Conservative/Expected và điểm thanh khoản thấp nhất.
- **Vốn** — capital positions và funding sources, bao gồm chi phí vốn và lịch nghĩa vụ.
- **Kế hoạch** — thu nhập, mức sinh hoạt và Safety Margin có thể điều chỉnh theo tháng.

## Dữ liệu

Rootflow là local-first PWA. Dữ liệu được lưu cục bộ trên trình duyệt, dùng schema `9` và giữ compatibility/migration để không làm mất dữ liệu đã có.

## Kiến trúc

Rootflow là static React PWA, không cần build step. React sở hữu toàn bộ vùng giao diện; presentation không tự sửa DOM do React quản lý và không tự ghi persistence.

```text
domain.js             # ledger + financial invariants
cashflow-domain.js    # cashflow / treasury semantics
capital-domain.js     # decision layer
store.js              # local persistence + schema migration
app.js                # controller, forms, overlays
capital-ui.js         # 4 màn hình sản phẩm duy nhất
styles.css            # app chrome + forms
capital.css           # canonical operating UI
```

React/ReactDOM được vendored trong `vendor/`. Service worker quản lý offline cache; GitHub Pages phục vụ ứng dụng. Không còn compatibility bridge hoặc presentation generation cũ chạy song song.

## Brand

Canonical artwork: `brand/rootflow-mark.png`.

Header và PWA icons dùng cùng artwork đã được duyệt. `rootflow-touch-180.png`, `rootflow-icon-192.png`, `rootflow-icon-512.png` là các kích thước PWA từ cùng canonical artwork. Ứng dụng mở thẳng vào giao diện, không giữ splash animation dài.

## Kiểm thử

```bash
node tests/run-tests.js
node tests/run-cashflow-tests.js
node tests/run-store-tests.js
node tests/run-canonical-tests.js
node tests/run-capital-tests.js
node --check app.js
node --check capital-ui.js
node --check capital-domain.js
node tests/run-ui-contract-tests.js
node tests/run-account-editor-tests.js
```

CI chạy trên mọi push vào `main` và pull request.

© 2026 @derekdaydoi. All rights reserved.


## Canonical runtime

Rootflow chỉ giữ một presentation: `capital-ui.js` sở hữu bốn màn hình vận hành, còn `app.js` sở hữu controller, form và overlay. Các screen generation cũ, compatibility bridge, lớp song ngữ V3 cũ và splash animation dài đã được bỏ. Migration dữ liệu vẫn nằm trong `store.js` vì xóa migration sẽ làm hỏng hoặc bỏ rơi backup/localStorage của người dùng hiện tại.
