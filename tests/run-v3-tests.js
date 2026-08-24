/* Rootflow V3 regression tests. Run: node tests/run-v3-tests.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { filename: file });
}
load('domain.js');
load('v3-domain.js');
const D = global.RootflowDomain;

function bank(semantics) {
  return { id: 'cash', name: 'Cash', type: 'bank', openingBalance: 100, balanceAsOf: '2026-08-24', balanceSemantics: semantics, archived: false };
}
function flow(id, date, kind, amount, confirmed, confidence, extra) {
  return Object.assign({ id, date, kind, amount, confirmed, confidence: confidence || 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: null }, extra || {});
}

// 1) Closing snapshot must not replay same-day history.
{
  const accounts = [bank('closing_snapshot')];
  const flows = [flow('hist', '2026-08-24', 'income', 20, true, 'CERTAIN', { alreadyReflectedInSnapshot: true })];
  assert.strictEqual(D.balances(accounts, flows).cash, 100);
}

// 2) Explicit opening balance keeps legacy same-day replay behavior.
{
  const accounts = [bank('opening_balance')];
  const flows = [flow('same-day', '2026-08-24', 'income', 20, true)];
  assert.strictEqual(D.balances(accounts, flows).cash, 120);
}

// 3) Future flow starts after closing snapshot and affects projection only once.
{
  const accounts = [bank('closing_snapshot')];
  const flows = [flow('future', '2026-08-25', 'income', 30, false, 'CERTAIN', { affectsProjectedCash: true, forecastCashImpact: 30 })];
  const model = D.liquidityModel(accounts, flows, { snapshotDate: '2026-08-24', forecastStartDate: '2026-08-25', ignoreHistoricalFlowsForProjection: true, horizonDays: 2 }, {});
  assert.strictEqual(model.current, 130);
  assert.strictEqual(model.forecastStartDate, '2026-08-25');
}

// 4) Interest-only collection increases cash but never reduces receivable principal.
{
  const accounts = [
    bank('closing_snapshot'),
    { id: 'recv', name: 'Borrower A', type: 'receivable', openingBalance: 90, balanceAsOf: '2026-08-24', balanceSemantics: 'closing_snapshot', archived: false }
  ];
  const flows = [{ id: 'interest', date: '2026-08-25', kind: 'collect', amount: 4, principalAmount: 0, interestAmount: 4, feeAmount: 0, confirmed: true, confidence: 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: 'recv' }];
  const bal = D.balances(accounts, flows);
  assert.strictEqual(bal.cash, 104);
  assert.strictEqual(bal.recv, 90);
}

// 5) Matched funding stays gross: +33 and -30 are both visible.
{
  const data = {
    accounts: [bank('closing_snapshot'), { id: 'loan', type: 'loan', name: 'Lender A', openingBalance: 30, balanceAsOf: '2026-08-24', balanceSemantics: 'closing_snapshot', archived: false }, { id: 'recv', type: 'receivable', name: 'Borrower A', openingBalance: 30, balanceAsOf: '2026-08-24', balanceSemantics: 'closing_snapshot', archived: false }],
    flows: [
      { id: 'in', date: '2026-09-15', kind: 'collect', amount: 33, principalAmount: 30, interestAmount: 3, feeAmount: 0, confirmed: false, confidence: 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: 'recv' },
      { id: 'out', date: '2026-09-15', kind: 'repay', amount: 30, principalAmount: 30, interestAmount: 0, feeAmount: 0, confirmed: false, confidence: 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: 'loan' }
    ],
    contracts: [], recurringIncomes: [], controlAssumptions: {},
    settings: { snapshotDate: '2026-08-24', forecastStartDate: '2026-08-25', ignoreHistoricalFlowsForProjection: true }
  };
  const bridge = D.v3CashBridge(data, 30);
  assert.strictEqual(bridge.reliableInflows, 33);
  assert.strictEqual(bridge.mandatoryOutflows, 30);
  assert.strictEqual(bridge.principalCollected, 30);
  assert.strictEqual(bridge.lendingInterest, 3);
}

// 6) Buffer = maximum cumulative funding gap when no undated obligations exist.
{
  const data = {
    accounts: [bank('closing_snapshot')],
    flows: [flow('out', '2026-08-30', 'expense', 15, false, 'CERTAIN')],
    contracts: [], recurringIncomes: [], controlAssumptions: {},
    settings: { snapshotDate: '2026-08-24', forecastStartDate: '2026-08-25', ignoreHistoricalFlowsForProjection: true }
  };
  const summary = D.v3TreasurySummary(data, { days: 30 });
  assert.strictEqual(summary.minimumRequiredCash, 15);
  assert.strictEqual(summary.additionalCashNeeded, 0); // current cash is 100
}

// 7) Expected inflow must not improve the conservative minimum cash requirement.
{
  const data = {
    accounts: [{ id: 'cash', name: 'Cash', type: 'bank', openingBalance: 10, balanceAsOf: '2026-08-24', balanceSemantics: 'closing_snapshot', archived: false }],
    flows: [
      flow('expected-in', '2026-08-26', 'income', 10, false, 'EXPECTED'),
      flow('certain-out', '2026-08-27', 'expense', 15, false, 'CERTAIN')
    ],
    contracts: [], recurringIncomes: [], controlAssumptions: {},
    settings: { snapshotDate: '2026-08-24', forecastStartDate: '2026-08-25', ignoreHistoricalFlowsForProjection: true }
  };
  const conservative = D.v3CashRequirement(data, 30, 'confirmed');
  const expected = D.v3CashRequirement(data, 30, 'expected');
  assert.strictEqual(conservative.minimumRequiredCash, 15);
  assert.strictEqual(expected.minimumRequiredCash, 5);
}

console.log('Rootflow V3 regression tests passed.');
