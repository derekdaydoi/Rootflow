from pathlib import Path
import base64
import json
import shutil
import struct
import subprocess
import sys

ROOT = Path('.')


def run(path):
    subprocess.run([sys.executable, str(path)], check=True)


def decode_png(text, size):
    data = base64.b64decode(text, validate=True)
    if not data.startswith(b'\x89PNG\r\n\x1a\n'):
        raise RuntimeError(f'Invalid PNG signature for {size}')
    width, height = struct.unpack('>II', data[16:24])
    if (width, height) != (size, size):
        raise RuntimeError(f'Unexpected PNG dimensions: {(width, height)} != {(size, size)}')
    return data


# Apply the deterministic React-ownership/runtime patch, then canonicalize API names.
run(ROOT / 'tools' / 'integrate-runtime.py')
run(ROOT / 'tools' / 'canonicalize-runtime.py')

# Materialize the user-approved Rootflow artwork and PWA derivatives.
brand_dir = ROOT / '.brand-final'
b512 = ''.join((brand_dir / f'512-0{i}.txt').read_text().strip() for i in (1, 2, 3))
assets = {
    512: decode_png(b512, 512),
    192: decode_png((brand_dir / '192.txt').read_text().strip(), 192),
    180: decode_png((brand_dir / '180.txt').read_text().strip(), 180),
}
(ROOT / 'brand').mkdir(exist_ok=True)
(ROOT / 'brand' / 'rootflow-mark.png').write_bytes(assets[512])
for size in (180, 192, 512):
    (ROOT / f'rootflow-home-{size}.png').write_bytes(assets[size])

# Canonical PWA references.
index = (ROOT / 'index.html').read_text()
index = index.replace('href="icon-192.png"', 'href="rootflow-home-192.png"')
index = index.replace('href="icon-180.png"', 'href="rootflow-home-180.png"')
index = index.replace('brand/rootflow-mark.svg', 'brand/rootflow-mark.png')
(ROOT / 'index.html').write_text(index)

manifest = json.loads((ROOT / 'manifest.json').read_text())
manifest['icons'] = [
    {'src': 'rootflow-home-180.png', 'sizes': '180x180', 'type': 'image/png', 'purpose': 'any'},
    {'src': 'rootflow-home-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
    {'src': 'rootflow-home-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
]
(ROOT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

sw = (ROOT / 'sw.js').read_text()
sw = sw.replace("rootflow-cache-2026-09-07-production-integration", "rootflow-cache-2026-09-07-production-final")
sw = sw.replace("'./icon-180.png'", "'./rootflow-home-180.png'")
sw = sw.replace("'./icon-192.png'", "'./rootflow-home-192.png'")
sw = sw.replace("'./icon-512.png'", "'./rootflow-home-512.png'")
(ROOT / 'sw.js').write_text(sw)

# Current-only documentation: no bridge-layer or historical architecture list.
readme = '''# Rootflow

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

Các khái niệm chính:

- account / cash position;
- flow / recurring income;
- contract / obligation;
- capital position;
- funding source;
- planning assumptions.

## Kiến trúc

Rootflow là static React PWA, không cần build step. React sở hữu toàn bộ vùng giao diện; presentation không tự sửa DOM do React quản lý và không tự ghi persistence.

```text
domain.js
cashflow-domain.js
capital-domain.js
compat.js
store.js
store-adapter.js
app.js
capital-ui.js
styles.css
capital.css
```

React/ReactDOM được vendored trong `vendor/`. Service worker quản lý offline cache; GitHub Pages phục vụ ứng dụng.

## Brand

Canonical artwork:

```text
brand/rootflow-mark.png
```

Splash, header và PWA icons dùng cùng artwork đã được duyệt. Các icon `rootflow-home-180.png`, `rootflow-home-192.png`, `rootflow-home-512.png` chỉ là bản resize từ artwork đó, không redraw.

## Kiểm thử

```bash
node tests/run-tests.js
node tests/run-cashflow-tests.js
node tests/run-store-tests.js
node tests/run-compat-tests.js
node tests/run-capital-tests.js
node --check app.js
node --check capital-ui.js
node --check capital-domain.js
node tests/run-ui-contract-tests.js
node tests/run-account-editor-tests.js
```

CI chạy trên mọi push vào `main` và pull request.

© 2026 @derekdaydoi. All rights reserved.
'''
(ROOT / 'README.md').write_text(readme)

# Final CI definition; no integration-only mutation step survives.
workflow = '''name: Rootflow regression tests

on:
  push:
    branches:
      - main
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Financial invariants
        run: node tests/run-tests.js
      - name: Cashflow regressions
        run: node tests/run-cashflow-tests.js
      - name: Store regressions
        run: node tests/run-store-tests.js
      - name: Compatibility regressions
        run: node tests/run-compat-tests.js
      - name: Capital decision regressions
        run: node tests/run-capital-tests.js
      - name: Application syntax
        run: node --check app.js
      - name: Capital UI syntax
        run: node --check capital-ui.js
      - name: Capital domain syntax
        run: node --check capital-domain.js
      - name: UI contract
        run: node tests/run-ui-contract-tests.js
      - name: React ownership contract
        run: node tests/run-account-editor-tests.js
'''
(ROOT / '.github' / 'workflows' / 'tests.yml').write_text(workflow)

# Remove staging, broken automation, old logo/icon family and bridge/runtime patch layers.
for rel in (
    '.brand-final',
    '.brand-parts',
    'rootflow-home-180.txt',
    'rootflow-home-180.b64.txt',
    'icon-180.png',
    'icon-192.png',
    'icon-512.png',
    '.github/workflows/finalize-production.yml',
    '.github/workflows/integration-build.yml',
    'account-editor.js',
    'account-editor.css',
    'tools/integrate-runtime.py',
    'tools/canonicalize-runtime.py',
    'tools/finalize-integration.py',
):
    p = ROOT / rel
    if p.is_dir():
        shutil.rmtree(p)
    elif p.exists():
        p.unlink()

print('Rootflow production integration finalized.')
