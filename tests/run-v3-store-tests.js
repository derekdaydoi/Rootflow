/* Rootflow V3 store regression tests. Run: node tests/run-v3-store-tests.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  key(i) { return Object.keys(this._data)[i] || null; },
  get length() { return Object.keys(this._data).length; }
};
global.navigator = {};

global.Blob = function () {};
global.URL = { createObjectURL() { return ''; }, revokeObjectURL() {} };
global.document = { body: { appendChild() {}, removeChild() {} }, createElement() { return { click() {} }; } };

function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { filename: file });
}
load('domain.js');
load('v3-domain.js');
load('store.js');
load('v3-store.js');

const D = global.RootflowDomain;
const S = global.RootflowStore;
const today = D.today();

const data = S.empty();
data.accounts.push({ id: 'cash', name: 'Cash', type: 'bank', openingBalance: 100, balanceAsOf: today, balanceSemantics: 'closing_snapshot', archived: false });
data.flows.push({ id: 'due', date: today, kind: 'expense', amount: 20, confirmed: false, confidence: 'CERTAIN', skipped: false, accountId: 'cash', counterAccountId: null });
localStorage.setItem(S.KEY, JSON.stringify(data));

const loaded = S.load().data;
const due = loaded.flows.find(f => f.id === 'due');
assert.strictEqual(due.confirmed, false, 'CERTAIN due flow must remain committed, not Actual');
assert.strictEqual(D.balances(loaded.accounts, loaded.flows).cash, 100, 'unconfirmed committed outflow must not alter actual cash');

// A legacy auto-post marker is reversed by the V3 wrapper.
const legacy = S.empty();
legacy.accounts.push({ id: 'cash2', name: 'Cash 2', type: 'bank', openingBalance: 50, balanceAsOf: today, balanceSemantics: 'closing_snapshot', archived: false });
legacy.flows.push({ id: 'legacy-auto', date: today, kind: 'expense', amount: 5, confirmed: true, autoPosted: true, confidence: 'CERTAIN', skipped: false, accountId: 'cash2', counterAccountId: null });
const normalized = S.normalizeCommittedVsActual(legacy);
assert.strictEqual(normalized.flows[0].confirmed, false);
assert.strictEqual(normalized.flows[0].autoPostedLegacy, true);

console.log('Rootflow V3 store regression tests passed.');
