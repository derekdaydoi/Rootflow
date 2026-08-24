/* Rootflow V3 compatibility regression tests. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
function load(file) { vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { filename: file }); }
load('domain.js');
load('v3-domain.js');
load('v3-compat.js');
const D = global.RootflowDomain;

const accounts = [{ id: 'cash', name: 'Cash', type: 'bank', openingBalance: 100, balanceAsOf: '2026-08-24', balanceSemantics: 'closing_snapshot', archived: false }];
const flows = [{ id: 'committed', date: '2026-08-25', kind: 'income', amount: 30, confirmed: false, confidence: 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: null }];
const settings = { snapshotDate: '2026-08-24', forecastStartDate: '2026-08-25', ignoreHistoricalFlowsForProjection: true, horizonDays: 30 };

const model = D.liquidityModel(accounts, flows, settings);
assert.strictEqual(model.current, 100, 'current must remain actual cash before an unconfirmed same-day committed flow posts');
assert.strictEqual(model.points[0].value, 130, 'conservative projected path may include a committed inflow due on forecast start');

const sim = D.simulateDecision(accounts, flows, settings, { kind: 'expense', amount: 20 });
assert.strictEqual(sim.before.current, 100);
assert.strictEqual(sim.after.current, 80);
assert.strictEqual(sim.after.projectedLow, sim.before.projectedLow - 20);

// Same-day matched funding must be deterministic regardless of row order.
function matchedSummary(rows) {
  return D.v3TreasurySummary({
    accounts: [{ id: 'cash', name: 'Cash', type: 'bank', openingBalance: 0, balanceAsOf: '2026-08-24', balanceSemantics: 'closing_snapshot', archived: false }],
    flows: rows,
    contracts: [], recurringIncomes: [], controlAssumptions: {},
    settings: { snapshotDate: '2026-08-24', forecastStartDate: '2026-08-25', ignoreHistoricalFlowsForProjection: true, horizonDays: 30 }
  }, { days: 30 });
}
const incoming = { id: 'in', date: '2026-09-15', kind: 'income', amount: 33, confirmed: false, confidence: 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: null };
const outgoing = { id: 'out', date: '2026-09-15', kind: 'expense', amount: 30, confirmed: false, confidence: 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: null };
const firstIn = matchedSummary([incoming, outgoing]);
const firstOut = matchedSummary([outgoing, incoming]);
assert.strictEqual(firstIn.minimumRequiredCash, 0);
assert.strictEqual(firstOut.minimumRequiredCash, 0);
assert.strictEqual(firstIn.minimumRequiredCash, firstOut.minimumRequiredCash);

console.log('Rootflow V3 compatibility regression tests passed.');
