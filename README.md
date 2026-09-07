# Rootflow

Rootflow là **hệ thống điều hành vốn và dòng tiền cá nhân** chạy local-first trên trình duyệt/PWA.

Rootflow không được thiết kế như một ứng dụng kế toán hay một dashboard tài chính nhiều KPI. Ledger và các nguyên tắc đối soát có thể tồn tại bên dưới để giữ dữ liệu nhất quán, nhưng mental model của người dùng chỉ xoay quanh các câu hỏi vận hành:

- Hôm nay tôi thực sự có bao nhiêu tiền?
- Bao nhiêu trong số đó phải được giữ lại cho các nghĩa vụ tương lai?
- Tại sao Rootflow yêu cầu giữ số tiền đó?
- Sau buffer, tôi còn bao nhiêu tiền có thể sử dụng?
- Sinh hoạt tháng này chiếm bao nhiêu quyền sử dụng tiền?
- Còn bao nhiêu vốn có thể đưa vào cho vay, đầu tư hoặc hoạt động kinh doanh khác?
- Tiền sắp vào từ đâu, tiền sắp phải ra đâu, và ngày nào tạo áp lực lớn nhất?
- Vốn đang nằm ở đâu và nguồn vốn nào đang tạo chi phí/áp lực?

## Triết lý sản phẩm

Rootflow quản lý **quyền sử dụng tiền theo thời gian**, không chỉ quản lý số dư.

Mental model chính:

```text
CURRENT CASH
    ↓
REQUIRED CASH
    ↓
RECOMMENDED CASH
    ↓
AVAILABLE CASH
    ↓
LIVING ALLOCATION
    ↓
DEPLOYABLE CAPITAL
```

Trong đó:

- **Current Cash**: cash/liquid balance hiện có tại ngày hôm nay.
- **Required Cash**: số tiền tối thiểu cần giữ hôm nay để timeline dòng tiền chắc chắn không tạo funding gap, cộng nghĩa vụ tháng chưa có exact date và rollover control cost.
- **Recommended Cash**: Required Cash + phần dự phòng vận hành do user chọn.
- **Available Cash**: phần Current Cash còn lại sau Recommended Cash. Đây là hero metric của Home.
- **Living Allocation**: mức sinh hoạt user chủ động dành cho tháng; đây là biến số, không phải nghĩa vụ kế toán.
- **Deployable Capital**: phần Available Cash còn có thể đưa vào cho vay/đầu tư sau khi dành phần sinh hoạt chưa được phản ánh bằng dated cashflow.

Net worth vẫn có thể được tính dưới domain nhưng không phải hero của trải nghiệm mặc định.

## Thời gian quan trọng hơn tổng nghĩa vụ

Rootflow không tính buffer theo kiểu:

```text
30 ngày tới nợ 15M → hôm nay phải giữ 15M
```

Thay vào đó engine chạy timeline. Ví dụ:

```text
Hôm nay      20M
12/09       +5M
15/09       -8M
20/09       +3M
25/09       -7M
```

Required Cash dựa trên **maximum cumulative funding gap** của timeline, không phải tổng nghĩa vụ.

Dòng tiền tương lai có confidence:

- `CERTAIN`: được phép hỗ trợ conservative projection.
- `EXPECTED` / `INFERRED`: chỉ hỗ trợ expected scenario.
- `UNCERTAIN` / `UNKNOWN`: không được dùng để chứng minh trạng thái an toàn.

Thu nhập định kỳ có ngày nhận và confidence cũng được đưa vào projection theo nguyên tắc trên. Mỗi tháng có thể có `monthlyOverrides` để thay đổi mức lương/thu nhập mà không làm mất default.

## Vốn và nguồn vốn

Rootflow coi cho vay, đầu tư, kinh doanh và tài sản khác là cùng một họ bài toán: **đưa vốn vào một position để tạo giá trị hoặc dòng tiền tương lai**.

Không có giả định vay 50M thì phải map 50M sang một position duy nhất. Một khoản vốn có thể đồng thời được dùng cho lending, sinh hoạt và giữ cash.

Nguồn vốn hiện hỗ trợ semantics cho:

- **Thẻ tín dụng**: revolving/installment exposure, statement/due date, rollover control cost; ngày sao kê, ngày đến hạn và số ngày miễn lãi là các concept độc lập.
- **Vay trả góp**: principal, outstanding, kỳ hạn, phương pháp lãi, lịch principal/interest.
- **Agent/cá nhân**: có thể miễn lãi, lãi cố định hoặc lãi theo tỷ lệ tùy dữ liệu contract.

Lãi suất mới có thể khai báo period rõ (`annual`/APR hoặc legacy monthly). Dữ liệu legacy không bị tự reinterpret để tránh phá tính đúng của backup cũ.

## Giao diện mặc định

Primary navigation:

```text
Hôm nay · Dòng tiền · Vốn · Kế hoạch
```

### Hôm nay

Ưu tiên:

1. Tiền có thể dùng.
2. Tiền hiện có và mức cần giữ.
3. Trạng thái thanh khoản + projected low.
4. Các dòng tiền sắp tới.
5. Sinh hoạt còn lại và vốn có thể triển khai.

`Xem cách tính` là explainability layer: giải thích Required/Recommended Cash bằng ngôn ngữ đời thường, không expose debit/credit/ledger.

### Dòng tiền

Future-first với 7 ngày / 30 ngày / 3 tháng, biểu đồ conservative vs expected và timeline event có confidence.

### Vốn

Hai góc nhìn:

- **Tổng quan**: capital positions và hiệu quả vốn.
- **Nguồn vốn**: thẻ, khoản vay, Agent và chi phí vốn.

### Kế hoạch

Cho phép chỉnh trực tiếp các assumption vận hành:

- thu nhập mặc định;
- ngày nhận;
- override riêng từng tháng;
- mức sinh hoạt mặc định/riêng từng tháng;
- dự phòng an toàn thêm.

Sau khi lưu, Available Cash và Deployable Capital được tính lại ngay.

## Snapshot, forecast và dữ liệu

Rootflow tiếp tục giữ semantics V3:

- `opening_balance`: replay flow từ baseline theo semantics hiện hữu.
- `closing_snapshot`: flow đã phản ánh vào snapshot không bị replay lần hai.
- `confirmed=true`: Actual/đã xảy ra; future certainty dùng field confidence, không biến thành Actual chỉ vì tới ngày.
- Nghĩa vụ tháng chưa có ngày chính xác không bị gán fake date.
- Rollover cost là control assumption, không phải fake ledger transaction.

Dữ liệu vẫn local-first trong `localStorage`, schema hiện tại là **v9**. Capital OS bổ sung derived semantics và các property optional trong `settings` / recurring income nên không cần schema bump.

Không commit backup tài chính thật vào repository public. Nên export backup trước khi xoá Website Data, gỡ PWA hoặc đổi browser profile.

## Kiến trúc

Core:

- `domain.js` — finance primitives và contract schedule.
- `v3-domain.js` — snapshot-aware balances, confidence projection, debt calendar, liquidity primitives.
- `v4-domain.js` — canonical Capital OS decision layer: Required/Available/Deployable, planning, capital và funding summaries.
- `store.js` / `v3-store.js` — local persistence và compatibility.
- `app.js` — React shell, forms và legacy data-entry workflows.
- `v4-ui.js` — decision-first presentation cho 4 primary views.
- `v4-polish.js` / `v4-polish.css` — compatibility polish chỉ cho account editor cũ trong giai đoạn consolidation.
- `sw.js` — PWA cache/offline strategy.

`v4-refinements.js` đã được consolidate vào `v4-domain.js`; không tiếp tục tạo thêm patch layer `v5-*`.

## Kiểm tra

```sh
node tests/run-tests.js
node tests/run-v3-tests.js
node tests/run-v3-store-tests.js
node tests/run-v3-compat-tests.js
node tests/run-v4-tests.js
node tests/run-ui-contract-tests.js
node tests/run-polish-tests.js
node --check v4-ui.js
node --check v4-polish.js
```

CI phải chạy cả trên `main` và pull request.

## Bản quyền

Rootflow và brand assets:

**© 2026 @derekdaydoi. All rights reserved.**
