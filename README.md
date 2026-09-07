# Rootflow

**Rootflow là hệ thống điều hành vốn và dòng tiền cá nhân.**

Mục tiêu của Rootflow không phải biến người dùng thành kế toán. Ứng dụng tập trung vào một câu hỏi thực tế hơn:

> Hôm nay tôi thực sự có thể sử dụng bao nhiêu tiền mà vẫn an toàn cho các nghĩa vụ sắp tới?

## Nguyên lý sản phẩm

Rootflow vận hành theo chuỗi quyết định:

**Tiền hiện có → Tiền cần giữ → Tiền nên giữ → Tiền có thể dùng → Sinh hoạt → Vốn có thể triển khai**

Hệ thống coi thời gian là một phần của tiền. Một nghĩa vụ trong tương lai không đồng nghĩa với việc phải khóa toàn bộ số tiền đó ngay hôm nay nếu trước ngày đến hạn có dòng tiền đáng tin cậy đi vào.

Rootflow vì vậy ưu tiên:

- dòng tiền tương lai theo ngày;
- mức độ chắc chắn của tiền vào;
- nghĩa vụ phải trả;
- mức sinh hoạt có thể thay đổi;
- chi phí vốn;
- vốn đang được triển khai vào cho vay, đầu tư, kinh doanh hoặc tài sản khác;
- khả năng giải thích vì sao một phần tiền cần được giữ lại.

## Bốn màn hình chính

- **Hôm nay** — tiền hiện có, tiền cần giữ, tiền có thể dùng và các việc sắp tới.
- **Dòng tiền** — dự phóng 7 ngày, 30 ngày hoặc 3 tháng và điểm thanh khoản thấp nhất.
- **Vốn** — vốn đang chạy và nguồn vốn đang tạo áp lực.
- **Kế hoạch** — thu nhập, mức sinh hoạt và safety margin có thể điều chỉnh.

## Mô hình dữ liệu

Dữ liệu được lưu cục bộ trên trình duyệt. Rootflow hiện dùng schema `9` và duy trì migration để không làm mất dữ liệu đã có.

Các khái niệm chính:

- account / cash position;
- flow;
- contract;
- recurring income;
- capital position;
- funding source;
- planning assumptions.

Các nguyên lý kế toán hoặc đối soát chỉ tồn tại bên dưới khi cần để giữ dữ liệu nhất quán; chúng không phải mental model chính của giao diện.

## Kiến trúc hiện tại

Rootflow là PWA tĩnh, không cần build step.

```text
domain.js
cashflow-domain.js
capital-domain.js
compat.js
store.js
store-adapter.js
app.js
capital-ui.js
account-editor.js
styles.css
capital.css
account-editor.css
```

React/ReactDOM được vendored trong `vendor/`. Service worker quản lý offline cache và GitHub Pages phục vụ ứng dụng.

## Brand

Artwork canonical:

```text
brand/rootflow-mark.png
```

Bộ icon PWA được sinh trực tiếp từ artwork này, không redraw.

© 2026 @derekdaydoi. All rights reserved.

## Kiểm thử

Chạy toàn bộ regression suite:

```bash
node tests/run-tests.js
node tests/run-cashflow-tests.js
node tests/run-store-tests.js
node tests/run-compat-tests.js
node tests/run-capital-tests.js
node tests/run-ui-contract-tests.js
node tests/run-account-editor-tests.js
```

CI chạy trên mọi push vào `main` và pull request.
