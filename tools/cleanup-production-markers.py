from pathlib import Path
import re

ROOT = Path('.')


def replace(path, old, new):
    p = ROOT / path
    text = p.read_text()
    if old not in text:
        raise SystemExit(f'missing expected marker in {path}: {old!r}')
    p.write_text(text.replace(old, new))

replace('cashflow-domain.js',
        'Additive layer: keeps the V2 ledger intact while fixing snapshot semantics',
        'Compatibility layer: preserves the stable ledger while fixing snapshot semantics')
replace('cashflow-domain.js',
        '/* Preserve legacy behavior for old backups. */',
        '/* Preserve backup compatibility behavior. */')
replace('cashflow-domain.js',
        '/* Export the corrected functions without rewriting the stable V2 code. */',
        '/* Export the corrected functions without rewriting stable ledger behavior. */')
replace('cashflow-domain.js', 'projectionPathV3', 'projectionPath')
replace('store.js',
        '/* V2 chỉ lưu seriesId. V3 suy ra lại tần suất và vị trí trong chuỗi để\n       màn sửa có thể hiển thị và chỉnh lịch lặp. */',
        '/* Dữ liệu lịch sử chỉ lưu seriesId. Dữ liệu hiện tại suy ra lại tần suất\n       và vị trí trong chuỗi để màn sửa có thể hiển thị và chỉnh lịch lặp. */')

# Public/runtime version-family names must not survive. Persisted compatibility field
# autoPostedLegacy is intentionally retained because changing it would alter schema-9 semantics.
runtime = [
    'domain.js', 'cashflow-domain.js', 'capital-domain.js', 'compat.js',
    'store.js', 'store-adapter.js', 'app.js', 'capital-ui.js'
]
for name in runtime:
    text = (ROOT / name).read_text()
    checks = [
        r'\bRootflow\s+V[234]\b',
        r'\bV[234]\s+(?:ledger|code|UI|domain|architecture)\b',
        r'\bv[234](?:Version|Final|Projection|Treasury|Liquidity|Balance|Control|Cash|Debt|Funding|Lending|Operating|Capital)',
        r'(?:Projection|Treasury|Liquidity|Balance|Control|Cash|Debt|Funding|Lending|Operating|Capital)V[234]\b',
    ]
    for pattern in checks:
        hit = re.search(pattern, text)
        if hit:
            raise SystemExit(f'public version marker remains in {name}: {hit.group(0)}')

# Presentation ownership invariants.
ui = (ROOT / 'capital-ui.js').read_text()
for forbidden in ('querySelector(', 'innerHTML', 'MutationObserver', 'setTimeout(', 'RootflowStore.save', 'S.save('):
    if forbidden in ui:
        raise SystemExit(f'forbidden presentation behavior remains: {forbidden}')

# Old public asset and bridge references must be absent.
for name in ['index.html', 'app.js', 'capital-ui.js', 'sw.js', 'manifest.json']:
    text = (ROOT / name).read_text()
    for forbidden in ('rootflow-mark.svg', 'account-editor.js', 'account-editor.css'):
        if forbidden in text:
            raise SystemExit(f'obsolete runtime reference remains in {name}: {forbidden}')

Path('tools/cleanup-production-markers.py').unlink()
print('Production markers and ownership invariants cleaned.')
