from pathlib import Path
import re

ROOT = Path('.')
FILES = [
    Path('domain.js'), Path('cashflow-domain.js'), Path('capital-domain.js'), Path('compat.js'),
    Path('store.js'), Path('store-adapter.js'), Path('selftest.js'), Path('app.js'), Path('capital-ui.js')
]
FILES += sorted(Path('tests').glob('*.js'))

RENAMES = {
    'v3ProjectionPath': 'cashflowProjectionPath',
    'v3DebtCalendar': 'cashflowDebtCalendar',
    'v3FundingMap': 'cashflowFundingMap',
    'v3LendingBook': 'cashflowLendingBook',
    'v3TreasurySummary': 'cashflowTreasurySummary',
    'v3CashBridge': 'cashflowBridge',
    'v3CashRequirement': 'cashflowRequirement',
    'v3UndatedObligations': 'cashflowUndatedObligations',
    'v3Version': 'cashflowDomainReady',
    'effectAfterBaselineV3': 'effectAfterBaseline',
    'balancesV3': 'balancesSnapshotAware',
    'liquidityModelV3': 'liquidityModelSnapshotAware',
    'controlMetricsV3': 'controlMetricsSnapshotAware',
    'balancesV2': 'balancesBase',
    'liquidityModelV2': 'liquidityModelBase',
    'controlMetricsV2': 'controlMetricsBase',
    'simulateDecisionV2': 'simulateDecisionBase',
    'loadV2': 'loadBase',
    'importFileV2': 'importFileBase',
    'treasurySummaryV3': 'treasurySummaryBase',
    'liquidityV3': 'liquidityCurrent',
    'v4BalanceSheetSummary': 'capitalBalanceSheetSummary',
    'v4DebtStructure': 'capitalDebtStructure',
    'v4DebtCalendar': 'capitalDebtCalendar',
    'v4DebtHealth': 'capitalDebtHealth',
    'v4FundingCostSummary': 'capitalFundingCostSummary',
    'v4BusinessSummary': 'capitalBusinessSummary',
    'v4BudgetSummary': 'capitalBudgetSummary',
    'v4InvestmentSummary': 'capitalInvestmentSummary',
    'v4IncomePlanSummary': 'incomePlanSummary',
    'v4ProjectionSummary': 'capitalProjectionSummary',
    'v4CashRequirement': 'capitalCashRequirement',
    'v4LivingPlanSummary': 'livingPlanSummary',
    'v4OperatingSummary': 'operatingSummary',
    'v4CapitalSummary': 'capitalSummary',
    'v4FutureEvents': 'futureEvents',
    'v4FinalSummary': 'finalSummary',
    'v4Version': 'capitalDomainReady',
}

for path in FILES:
    if not path.exists():
        continue
    text = path.read_text()
    for old, new in RENAMES.items():
        text = text.replace(old, new)
    text = text.replace('Rootflow V2', 'Rootflow').replace('Rootflow V3', 'Rootflow').replace('Rootflow V4', 'Rootflow')
    text = text.replace('initial V3', 'initial cashflow')
    text = text.replace('V2 historically', 'Earlier builds historically')
    text = text.replace('V3 separates', 'The canonical model separates')
    text = text.replace('snapshot-aware V3 semantics', 'snapshot-aware cashflow semantics')
    text = text.replace('V2 UI functions', 'earlier UI functions')
    text = text.replace('D.finalSummary || D.finalSummary', 'D.finalSummary')
    text = text.replace('D.operatingSummary || D.operatingSummary', 'D.operatingSummary')
    text = text.replace('D.capitalProjectionSummary || D.capitalProjectionSummary', 'D.capitalProjectionSummary')
    text = text.replace('D.futureEvents || D.futureEvents', 'D.futureEvents')
    text = re.sub(r"D\.(cashflowDomainReady|capitalDomainReady)\s*=\s*['\"][^'\"]+['\"];", r'D.\1 = true;', text)
    path.write_text(text)

# Canonical persistence comments: compatibility behavior remains, historical product naming does not.
p = Path('store-adapter.js')
if p.exists():
    text = p.read_text()
    text = text.replace('legacy opening\n         behavior', 'compatibility opening\n         behavior')
    text = text.replace('autoPostedLegacy', 'autoPostedCompatibility')
    p.write_text(text)

# Keep the regression workflow aligned with the canonical React-owned runtime.
p = Path('.github/workflows/tests.yml')
if p.exists():
    text = p.read_text()
    text = text.replace("      - name: Account editor syntax\n        run: node --check account-editor.js\n", '')
    p.write_text(text)

# Ensure deleted bridge assets cannot return through runtime/cache references.
for name in ('account-editor.js', 'account-editor.css'):
    p = Path(name)
    if p.exists():
        p.unlink()

# Report historical implementation markers that still require explicit classification.
markers = []
for path in [*FILES, Path('README.md')]:
    if not path.exists():
        continue
    for line_no, line in enumerate(path.read_text().splitlines(), 1):
        if re.search(r'\b[Vv][234]\b|v[234][A-Z_]|\blegacy\b', line):
            markers.append(f'{path}:{line_no}:{line.strip()}')
if markers:
    print('Remaining historical markers (review as compatibility-only):')
    print('\n'.join(markers))
else:
    print('No V2/V3/V4/legacy architecture markers remain in canonical runtime/test files.')
