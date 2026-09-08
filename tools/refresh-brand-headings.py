from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'expected block not found in {path}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'capital-ui.js',
    """  function BrandHeader(props) {\n    var title = props.title || 'Rootflow';\n    return h('header', { className: 'rf-appbar' },\n      h('div', { className: 'rf-brand-lockup' },\n        h('img', { src: 'brand/rootflow-mark.png', alt: '', draggable: false, className: 'rf-brand-mark' }),\n        h('div', null, h('strong', null, 'root', h('b', null, 'flow')), title !== 'Rootflow' ? h('span', null, title) : null)),\n      props.onManageAccounts ? h('button', {\n""",
    """  function BrandHeader(props) {\n    return h('header', { className: 'rf-appbar' },\n      h('div', { className: 'rf-brand-lockup' }, h('strong', null, 'Rootflow')),\n      props.onManageAccounts ? h('button', {\n"""
)
replace_once(
    'capital-ui.js',
    "    var title = view === 'flow' ? 'Dòng tiền' : view === 'position' ? 'Vốn' : view === 'plan' ? 'Kế hoạch' : 'Rootflow';\n",
    ''
)
replace_once(
    'capital-ui.js',
    "      h(BrandHeader, { title: title, onManageAccounts: props.onManageAccounts }),",
    "      h(BrandHeader, { onManageAccounts: props.onManageAccounts }),"
)

replace_once(
    'capital.css',
    ".rf-section-head h2{min-width:0;margin:0;color:var(--rf-ink);font-size:17px;font-weight:600;line-height:1.3;letter-spacing:-.01em;text-wrap:balance}",
    ".rf-section-head h2{min-width:0;margin:0;color:var(--rf-ink);font-size:clamp(20px,5.4cqi,22px);font-weight:700;line-height:1.22;letter-spacing:-.015em;text-wrap:balance}"
)
replace_once(
    'capital.css',
    ".rf-plan-intro h1{margin:0;color:var(--rf-ink);font-size:24px;font-weight:700;line-height:1.2;letter-spacing:-.025em}",
    ".rf-plan-intro h1{margin:0;color:var(--rf-ink);font-size:clamp(28px,7.5cqi,32px);font-weight:700;line-height:1.12;letter-spacing:-.025em}"
)
replace_once(
    'capital.css',
    ".rf-overlay-head>strong{min-width:0;color:var(--rf-ink);font-size:17px;font-weight:600;line-height:1.25;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".rf-overlay-head>strong{min-width:0;color:var(--rf-ink);font-size:19px;font-weight:700;line-height:1.2;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
)
replace_once(
    'capital.css',
    ".rf-explain-stack .rf-card h2{margin:0 0 6px;color:var(--rf-ink);font-size:17px;font-weight:600}",
    ".rf-explain-stack .rf-card h2{margin:0 0 8px;color:var(--rf-ink);font-size:20px;font-weight:700;line-height:1.22;letter-spacing:-.015em}"
)
replace_once(
    'capital.css',
    """.rf-brand-lockup{min-width:0;display:flex;align-items:center;gap:10px}\n.rf-brand-mark{width:38px;height:38px;display:block;object-fit:contain;flex:0 0 auto}\n.rf-brand-lockup>div{min-width:0;display:grid;gap:3px}\n.rf-brand-lockup strong{color:var(--rf-green-deep);font-size:19px;font-weight:700;line-height:1;letter-spacing:-.025em}\n.rf-brand-lockup strong b{color:var(--rf-green-accent);font-weight:700}\n.rf-brand-lockup span{color:var(--rf-muted);font-size:11px;font-weight:500;line-height:1.2}\n""",
    """.rf-brand-lockup{min-width:0;display:flex;align-items:center}\n.rf-brand-lockup strong{color:var(--rf-green-deep);font-size:22px;font-weight:700;line-height:1;letter-spacing:-.025em}\n"""
)
replace_once('capital.css', "  .rf-brand-mark{width:36px;height:36px}\n", '')

replace_once(
    'tests/run-ui-contract-tests.js',
    """assert(app.includes('brand/rootflow-mark.png'), 'application artwork must use the canonical raster source');\nassert(!app.includes('brand/rootflow-mark.svg'), 'application must not reference the retired SVG redraw');\n""",
    """assert(!ui.includes('brand/rootflow-mark.png') && !ui.includes('rf-brand-mark'), 'canonical app header must be text-only without an in-app logo');\nassert(ui.includes(\"h('strong', null, 'Rootflow')\"), 'canonical app header must render the exact Rootflow wordmark');\nassert(!ui.includes(\"'root', h('b', null, 'flow')\"), 'canonical app header must not split the brand into root + flow styling');\n"""
)

Path(__file__).unlink()
