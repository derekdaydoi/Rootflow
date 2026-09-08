from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, got {count}')
    return text.replace(old, new, 1)


def replace_segment(text, start, end, replacement, label, keep_end=True):
    i = text.find(start)
    if i < 0:
        raise RuntimeError(f'{label}: start anchor not found')
    j = text.find(end, i + len(start))
    if j < 0:
        raise RuntimeError(f'{label}: end anchor not found')
    return text[:i] + replacement + (text[j:] if keep_end else text[j + len(end):])


def remove_file(path):
    p = ROOT / path
    if p.exists():
        p.unlink()


# -----------------------------------------------------------------------------
# 1. app.js: keep one canonical presentation path and make debt/receivable edits
#    true current-balance snapshots instead of replaying old payments twice.
# -----------------------------------------------------------------------------
app = read('app.js')

app = replace_segment(
    app,
    '  function BottomNav(props) {',
    '  function Sheet(props) {',
    '',
    'remove legacy bottom navigation'
)

app = replace_segment(
    app,
    '  function LiquidityChart(props) {',
    '  function ContractSchedulePreview(props) {',
    '',
    'remove legacy screen generation'
)

old_snapshot = """      currentOutstanding: contract && contract.currentOutstanding !== undefined && contract.currentOutstanding !== null ? D.groupDigits(contract.currentOutstanding) : contractType && props.currentBalance ? D.groupDigits(props.currentBalance) : '',
      outstandingAsOf: contract && contract.outstandingAsOf ? contract.outstandingAsOf : account && account.balanceAsOf ? account.balanceAsOf : D.today(),"""
new_snapshot = """      currentOutstanding: account && (account.type === 'loan' || account.type === 'receivable') ? D.groupDigits(Number(props.currentBalance) || 0) : contract && contract.currentOutstanding !== undefined && contract.currentOutstanding !== null ? D.groupDigits(contract.currentOutstanding) : contractType && props.currentBalance !== undefined ? D.groupDigits(props.currentBalance) : '',
      outstandingAsOf: account && (account.type === 'loan' || account.type === 'receivable') ? D.today() : contract && contract.outstandingAsOf ? contract.outstandingAsOf : account && account.balanceAsOf ? account.balanceAsOf : D.today(),"""
app = replace_once(app, old_snapshot, new_snapshot, 'current debt snapshot defaults')

old_outstanding_field = """        h(Field, { label: 'Dư gốc tại ngày' }, h(TextInput, { type: 'date', value: form.outstandingAsOf, onChange: function (e) { set('outstandingAsOf', e.target.value); } })),"""
new_outstanding_field = """        h(Field, { label: 'Dư gốc tại ngày' }, h(TextInput, { type: 'date', value: form.outstandingAsOf, onChange: function (e) { set('outstandingAsOf', e.target.value); } })),
        form.type === 'loan' || form.type === 'receivable' ? h('p', { className: 'form-help' }, 'Dư gốc hiện tại được lưu như snapshot cuối ngày. Các khoản trả/thu nợ trước ngày này sẽ không bị tính lại lần hai.') : null,"""
app = replace_once(app, old_outstanding_field, new_outstanding_field, 'snapshot explanation')

old_contract_flow_check = """        hasContractFlows: editingAccount ? data.flows.some(function (flow) { return flow.contractId && flow.counterAccountId === editingAccount.id && (flow.kind === 'borrow' || flow.kind === 'lend'); }) : false,"""
new_contract_flow_check = """        hasContractFlows: editingAccount ? data.flows.some(function (flow) {
          if (!flow || flow.deletedAt) return false;
          var linkedByAccount = flow.counterAccountId === editingAccount.id;
          var linkedByContract = flow.contractId && data.contracts.some(function (contract) { return contract.id === flow.contractId && contract.accountId === editingAccount.id; });
          return (linkedByAccount || linkedByContract) && (flow.kind === 'borrow' || flow.kind === 'lend' || flow.kind === 'repay' || flow.kind === 'collect');
        }) : false,"""
app = replace_once(app, old_contract_flow_check, new_contract_flow_check, 'robust contract-flow detection')

canonical_render = """    var screen, bottom;
    if (subview === 'budgets') {
      screen = h(BudgetScreen, { data: data, derived: derived, onBack: function () { setSubview(null); }, onEdit: editBudget });
      bottom = null;
    } else {
      screen = h(global.RootflowCapitalUI.Screen, {
        data: data,
        view: view,
        onView: go,
        onAdd: function () { setOverlay('composer'); },
        onManageAccounts: openAccountManager,
        onEditAccount: openEditAccountById,
        onEditFlow: openEditFlow,
        onCommit: commit
      });
      bottom = h(global.RootflowCapitalUI.BottomNav, { view: view, onGo: go, onAdd: function () { setOverlay('composer'); } });
    }

"""
app = replace_segment(
    app,
    '    var screen, bottom;',
    "    return h('div', { className: 'app' }, screen,",
    canonical_render,
    'canonical App renderer'
)

# Remove a now-unused legacy scenario writer that only served the retired Decide screen.
app = re.sub(r"\n    function saveScenario\(scenario\) \{ commit\(function \(next\) \{ next\.scenarios\.push\(Object\.assign\(\{ id: S\.uid\(\), createdAt: S\.now\(\), updatedAt: S\.now\(\) \}, scenario\)\); \}, 'Đã lưu kịch bản\.'\); \}", '', app, count=1)
write('app.js', app)


# -----------------------------------------------------------------------------
# 2. cashflow-domain.js: absorb the two compatibility patches into the canonical
#    treasury implementation; compat.js is no longer part of runtime.
# -----------------------------------------------------------------------------
cash = read('cashflow-domain.js')

old_current = """    var confirmedLow = lowest(confirmedPoints);
    var expectedLow = lowest(expectedPoints);
    var state = D.liquidityStatus(confirmedLow.value, hard, operating);"""
new_current = """    var confirmedLow = lowest(confirmedPoints);
    var expectedLow = lowest(expectedPoints);
    var actualCurrent = D.totals(accounts || [], balancesSnapshotAware(accounts || [], flows || [])).liquid + (Number(opts.initialAdjustment) || 0);
    var state = D.liquidityStatus(confirmedLow.value, hard, operating);"""
cash = replace_once(cash, old_current, new_current, 'canonical liquidity current balance')
cash = replace_once(
    cash,
    "      current: confirmedPoints[0] ? confirmedPoints[0].value : 0,",
    "      current: actualCurrent,",
    'canonical liquidity current return'
)

new_requirement = """  function cashRequirement(data, days, mode) {
    data = data || {};
    var settings = data.settings || {};
    var horizon = Math.max(1, Number(days) || 30);
    var start = forecastStart(settings);
    var currentBal = balancesSnapshotAware(data.accounts || [], data.flows || []);
    var current = D.totals(data.accounts || [], currentBal).liquid;
    var points = projectionPath(data.accounts || [], data.flows || [], settings, { horizonDays: horizon }, mode || 'confirmed');
    var low = lowest(points);
    var dated = Math.max(0, current - Number(low.value || 0));
    var undated = undatedObligations(data, horizon).reduce(function (sum, row) { return sum + row.total; }, 0);
    var rollover = monthlyRolloverCost(data, currentBal);
    return {
      requiredForDatedTimeline: dated,
      undatedObligations: undated,
      rolloverCost: rollover,
      minimumRequiredCash: dated + undated + rollover,
      pressureDate: low.date || start
    };
  }

"""
cash = replace_segment(cash, '  function cashRequirement(data, days, mode) {', '  function fundingMap(data) {', new_requirement, 'end-of-day cash requirement')

export_anchor = """  D.cashflowUndatedObligations = undatedObligations;
  D.cashflowDomainReady = true;"""
export_replacement = """  D.cashflowUndatedObligations = undatedObligations;
  D.simulateDecisionBase = D.simulateDecision;
  D.simulateDecision = function (accounts, flows, settings, decision, opts) {
    opts = opts || {};
    var before = D.liquidityModel(accounts, flows, settings, opts);
    var afterOpts = Object.assign({}, opts, {
      initialAdjustment: (Number(opts.initialAdjustment) || 0) + D.decisionLiquidityImpact(decision && decision.kind, decision && decision.amount)
    });
    return { before: before, after: D.liquidityModel(accounts, flows, settings, afterOpts) };
  };
  D.cashflowDomainReady = true;"""
cash = replace_once(cash, export_anchor, export_replacement, 'canonical simulateDecision')
write('cashflow-domain.js', cash)


# -----------------------------------------------------------------------------
# 3. store.js: absorb committed-vs-actual normalization into the store itself.
# -----------------------------------------------------------------------------
store = read('store.js')
helper_anchor = """  function migrate(raw) {
"""
helper = """  function normalizeCommittedVsActual(data) {
    if (!data || typeof data !== 'object') return data;
    var changed = false;
    (data.accounts || []).forEach(function (account) {
      if (!account) return;
      if (account.balanceSemantics !== 'opening_balance' && account.balanceSemantics !== 'closing_snapshot' && !D.isLiquid(account) && Math.abs(Number(account.openingBalance) || 0) > 0) {
        account.balanceSemantics = 'closing_snapshot';
        changed = true;
      }
    });
    (data.flows || []).forEach(function (flow) {
      if (!flow || flow.autoPosted !== true) return;
      flow.confirmed = false;
      flow.autoPosted = false;
      flow.autoPostedLegacy = true;
      flow.confidence = flow.confidence || 'CERTAIN';
      flow.updatedAt = now();
      changed = true;
    });
    if (changed) data.updatedAt = now();
    return data;
  }

  function migrate(raw) {
"""
store = replace_once(store, helper_anchor, helper, 'integrated store normalization helper')

auto_start = """    /* Chỉ nghĩa vụ CERTAIN mới được auto-post khi tới hạn. EXPECTED/UNCERTAIN
       phải chờ người dùng xác nhận, nếu không một khoản thu trễ sẽ làm số dư
       hiện tại an toàn giả. */"""
auto_end = """    /* Khi lịch chắc chắn đã tự ghi đủ gốc và lãi, đóng hợp đồng ngay để không
       còn xuất hiện như một khoản đang mở trong form trả/thu nợ. */"""
store = replace_segment(
    store,
    auto_start,
    auto_end,
    """    /* Dữ liệu cũ từng auto-post nghĩa vụ CERTAIN. Runtime hiện tại tách
       committed khỏi actual; normalize ngay trong canonical store thay vì dùng adapter. */
    normalizeCommittedVsActual(data);

""",
    'remove legacy auto-post runtime'
)

store = replace_once(
    store,
    """    clearAll: clearAll, exportFile: exportFile, importFile: importFile
""",
    """    clearAll: clearAll, exportFile: exportFile, importFile: importFile,
    normalizeCommittedVsActual: normalizeCommittedVsActual
""",
    'export integrated normalization'
)
write('store.js', store)


# -----------------------------------------------------------------------------
# 4. index + CSS: no 4-second animated splash, no motion-template layer, native
#    system typography and a calmer finance-app hierarchy.
# -----------------------------------------------------------------------------
index = read('index.html')
index = index.replace('  <link rel="stylesheet" href="effects.css">\n', '')
index = index.replace('  <link rel="stylesheet" href="brand/rootflow-splash.css">\n', '')
index = index.replace('<body class="splash-active">', '<body>')
index = re.sub(r'  <div id="opening-splash" class="opening-splash" aria-hidden="true">.*?  </div>\n  <div id="root">', '  <div id="root">', index, count=1, flags=re.S)
for src in ['compat.js', 'i18n-base.js', 'i18n-capital.js', 'store-adapter.js']:
    index = index.replace(f'  <script src="{src}"></script>\n', '')
index = re.sub(r'  <script>\n    \(function \(\) \{\n      var splash = document\.getElementById\(\'opening-splash\'\);.*?  </script>\n', '', index, count=1, flags=re.S)
write('index.html', index)

styles = read('styles.css')
styles = replace_once(
    styles,
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;',
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
    'native font stack'
)
styles = replace_once(styles, '  font-size: 15px;\n  line-height: 1.5;', '  font-size: 16px;\n  line-height: 1.45;', 'body typography')
styles = replace_segment(styles, 'body.splash-active { overflow: hidden; }', 'button, input, select, textarea { font: inherit; }', '', 'remove splash styles')
if '.form-help {' not in styles:
    styles += """

.form-help {
  margin: -2px 0 4px;
  color: var(--secondary);
  font-size: 12px;
  line-height: 1.45;
}
"""
write('styles.css', styles)

capital = read('capital.css')
capital = capital.replace('--rf-shadow:0 4px 18px rgba(15,79,53,.045);', '--rf-shadow:0 1px 2px rgba(22,27,24,.035);')
capital = capital.replace('--rf-radius:16px;', '--rf-radius:12px;')
capital = capital.replace('border-radius:20px;background:var(--rf-green-deep);color:#fff;box-shadow:0 10px 26px rgba(15,79,53,.16)', 'border-radius:16px;background:var(--rf-green-deep);color:#fff;box-shadow:0 2px 8px rgba(15,79,53,.10)')
capital = capital.replace('letter-spacing:-.035em', 'letter-spacing:-.018em')
capital = capital.replace('letter-spacing:-.03em', 'letter-spacing:-.015em')
capital = capital.replace('background:rgba(245,246,242,.97);backdrop-filter:blur(10px)', 'background:var(--rf-bg)')
capital = capital.replace('border-radius:18px 18px 0 0;background:rgba(255,255,255,.98);box-shadow:0 -5px 20px rgba(22,27,24,.06)', 'border-radius:0;background:#fff;box-shadow:0 -1px 0 rgba(22,27,24,.05)')
capital = capital.replace('box-shadow:0 6px 16px rgba(15,79,53,.16)', 'box-shadow:0 2px 8px rgba(15,79,53,.12)')
write('capital.css', capital)


# -----------------------------------------------------------------------------
# 5. service worker + docs + tests: point only at the canonical runtime.
# -----------------------------------------------------------------------------
sw = read('sw.js')
sw = re.sub(r"var CACHE = '[^']+';", "var CACHE = 'rootflow-cache-2026-09-08-canonical';", sw, count=1)
for asset in ["  './effects.css',\n", "  './brand/rootflow-splash.css',\n", "  './compat.js',\n", "  './i18n-base.js',\n", "  './i18n-capital.js',\n", "  './store-adapter.js',\n"]:
    sw = sw.replace(asset, '')
sw = sw.replace('|effects\\.css|rootflow-splash\\.css', '')
sw = sw.replace('|compat\\.js|i18n-base\\.js|i18n-capital\\.js', '')
sw = sw.replace('|store-adapter\\.js', '')
write('sw.js', sw)

readme = read('README.md')
readme = readme.replace('`compat.js` — compatibility bridge for earlier UI/domain paths.\n', '')
readme = readme.replace('`store-adapter.js` — compatibility normalization for committed-vs-actual semantics.\n', '')
readme = readme.replace('`effects.css` — restrained motion layer.\n', '')
readme = readme.replace('`i18n-base.js` / `i18n-capital.js` — bilingual copy layer.\n', '')
readme = readme.replace('`brand/rootflow-splash.css` — branded opening animation.\n', '')
readme = readme.replace('The production UI keeps compatibility fallbacks for earlier screens.', 'The production UI has one canonical React presentation path. Historical schema migration remains only to protect existing local backups; it is not a second product runtime.')
readme = readme.replace('node tests/run-compat-tests.js', 'node tests/run-canonical-tests.js')
if '## Canonical runtime' not in readme:
    readme += """

## Canonical runtime

Rootflow intentionally keeps one product presentation: `capital-ui.js` owns the four operating screens and `app.js` owns controller/forms/overlays. Legacy screen generations, compatibility bridge files, the old bilingual V3 layer and the long animated splash have been removed. Data migrations in `store.js` remain because deleting them would corrupt or strand existing user backups.
"""
write('README.md', readme)

store_test = read('tests/run-store-tests.js')
store_test = store_test.replace("load('store-adapter.js');\n", '')
write('tests/run-store-tests.js', store_test)

compat_test_path = ROOT / 'tests/run-compat-tests.js'
canonical_test_path = ROOT / 'tests/run-canonical-tests.js'
if compat_test_path.exists():
    compat_test = compat_test_path.read_text(encoding='utf-8')
    compat_test = compat_test.replace('/* Rootflow compatibility regression tests. */', '/* Rootflow canonical cashflow regression tests. */')
    compat_test = compat_test.replace("load('compat.js');\n", '')
    compat_test = compat_test.replace("console.log('Rootflow compatibility regression tests passed.');", "console.log('Rootflow canonical cashflow regression tests passed.');")
    canonical_test_path.write_text(compat_test, encoding='utf-8')
    compat_test_path.unlink()

ui_test = read('tests/run-ui-contract-tests.js')
ui_test = ui_test.replace("const effects = read('effects.css');\n", '')
ui_test = ui_test.replace("assert(index.includes('effects.css'), 'production motion stylesheet must load');\n", "assert(!index.includes('effects.css'), 'retired motion-template stylesheet must not load');\n")
ui_test = ui_test.replace("assert(index.includes('brand/rootflow-mark.png'), 'splash must use the canonical raster artwork');\n", '')
ui_test = ui_test.replace("assert(index.includes('4150'), 'splash timing must preserve the approved final cadence');\n", "assert(!index.includes('opening-splash') && !index.includes('splash-active'), 'runtime must open directly without the legacy animated splash');\n")
ui_test = ui_test.replace("assert(baseCss.includes('-apple-system, BlinkMacSystemFont, \"Segoe UI\", system-ui, sans-serif'), 'UI must use a native system font stack');", "assert(baseCss.includes('-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif'), 'UI must use a conventional native app font stack');")
ui_test = re.sub(r"\nassert\(effects\.includes\('@keyframes rf-surface-enter'\).*?assert\(!effects\.includes\('linear-gradient'\).*?\);", '', ui_test, flags=re.S)
ui_test = ui_test.replace("assert(sw.includes(\"'./effects.css'\"), 'service worker must cache the motion stylesheet');\n", "assert(!sw.includes('effects.css') && !sw.includes('compat.js') && !sw.includes('store-adapter.js'), 'service worker must cache only the canonical runtime');\n")
if "legacy screen functions must be removed" not in ui_test:
    ui_test = ui_test.replace("assert(app.includes('RootflowCapitalUI.BottomNav'), 'application controller must mount the canonical React-owned bottom navigation');", "assert(app.includes('RootflowCapitalUI.BottomNav'), 'application controller must mount the canonical React-owned bottom navigation');\nassert(!app.includes('function Home(props)') && !app.includes('function FlowScreen(props)') && !app.includes('function PositionScreen(props)') && !app.includes('function DecideScreen(props)'), 'legacy screen functions must be removed, not hidden behind a runtime branch');")
if "retired compatibility scripts" not in ui_test:
    ui_test = ui_test.replace("assert(!index.includes('account-editor.js') && !index.includes('account-editor.css'), 'runtime must not load imperative account-editor bridges');", "assert(!index.includes('account-editor.js') && !index.includes('account-editor.css'), 'runtime must not load imperative account-editor bridges');\nassert(!index.includes('compat.js') && !index.includes('store-adapter.js') && !index.includes('i18n-base.js') && !index.includes('i18n-capital.js'), 'retired compatibility scripts must not load');")
write('tests/run-ui-contract-tests.js', ui_test)

account_test = read('tests/run-account-editor-tests.js')
extra = """
assert(app.includes("account && (account.type === 'loan' || account.type === 'receivable') ? D.groupDigits(Number(props.currentBalance) || 0)"), 'loan/receivable editor must open on the derived current balance, not a stale contract snapshot');
assert(app.includes("account && (account.type === 'loan' || account.type === 'receivable') ? D.today()"), 'editing current debt/receivable balance must default the snapshot date to today');
assert(app.includes('Các khoản trả/thu nợ trước ngày này sẽ không bị tính lại lần hai.'), 'editor must explain snapshot semantics before saving a correction');
assert(!app.includes('function Home(props)') && !app.includes('function FlowScreen(props)'), 'account editor must live inside the single canonical runtime, not a legacy fallback screen');
"""
if 'stale contract snapshot' not in account_test:
    account_test = account_test.replace("console.log('Rootflow account editor contract tests passed.');", extra + "\nconsole.log('Rootflow account editor contract tests passed.');")
write('tests/run-account-editor-tests.js', account_test)

# Final workflow: remove compatibility test naming and remove this one-shot bootstrap step.
workflow = read('.github/workflows/tests.yml')
workflow = workflow.replace("      - name: Compatibility regressions\n        run: node tests/run-compat-tests.js\n", "      - name: Canonical cashflow regressions\n        run: node tests/run-canonical-tests.js\n")
workflow = re.sub(r"      - name: Apply one-shot Rootflow canonical rebuild\n        if: hashFiles\('tools/rootflow-canonicalize\.py'\) != ''\n        run: \|\n(?:          .*\n)+?(?=      - name: Financial invariants)", '', workflow)
write('.github/workflows/tests.yml', workflow)

# Retire source files that represented previous product generations or adapters.
for obsolete in [
    'compat.js',
    'store-adapter.js',
    'i18n-base.js',
    'i18n-capital.js',
    'effects.css',
    'brand/rootflow-splash.css',
]:
    remove_file(obsolete)

# This script is deliberately one-shot. The workflow commits the resulting tree,
# and the next CI run tests the clean repository without any bootstrap machinery.
Path(__file__).unlink()
