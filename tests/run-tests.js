const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const memory = new Map();
const localStorage = {
  get length() { return memory.size; },
  key(index) { return Array.from(memory.keys())[index] ?? null; },
  getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  setItem(key, value) { memory.set(key, String(value)); },
  removeItem(key) { memory.delete(key); },
  clear() { memory.clear(); }
};

const context = {
  console,
  crypto: { randomUUID: () => 'test-' + Math.random().toString(36).slice(2) },
  localStorage,
  navigator: {},
  setTimeout,
  clearTimeout,
  Promise,
  Date,
  Math,
  JSON,
  Number,
  String,
  Object,
  Array,
  RegExp,
  Blob: global.Blob
};
context.window = context;
context.globalThis = context;
vm.createContext(context);

for (const file of ['domain.js', 'store.js', 'selftest.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

const finance = context.rootflowSelfTest();
assert.equal(finance.failed, 0, finance.results.filter((row) => !row.pass).map((row) => row.name).join('\n'));

memory.clear();
localStorage.setItem('rootflow.data', JSON.stringify({
  schemaVersion: 5,
  accounts: [],
  flows: [{ id: 'legacy-planned', kind: 'income', accountId: 'missing', amount: 1, date: '2099-01-01', confirmed: false }],
  budgets: [{ id: 'budget-1', name: 'Nhà ở', limit: 100 }],
  scenarios: [{ id: 'scenario-1', name: 'Mua xe', amount: 1000 }],
  settings: { reserveFloor: 20000000, horizonDays: 90 }
}));
const migrated = context.RootflowStore.load();
assert.equal(migrated.error, null);
assert.equal(migrated.data.schemaVersion, 6);
assert.equal(migrated.data.settings.hardFloor, 20000000);
assert.equal(migrated.data.settings.operatingBuffer, 20000000);
assert.equal(migrated.data.flows[0].confidence, 'EXPECTED');
assert.equal(migrated.data.budgets.length, 1);
assert.equal(migrated.data.scenarios.length, 1);
assert.deepEqual(Array.from(migrated.data.counterparties), []);
assert.deepEqual(Array.from(migrated.data.contracts), []);

memory.clear();
localStorage.setItem('rootflow.data', JSON.stringify({ schemaVersion: 99, sentinel: 'keep' }));
const newer = context.RootflowStore.load();
assert.match(newer.error, /mới hơn/);
assert.equal(JSON.parse(localStorage.getItem('rootflow.data')).sentinel, 'keep');

console.log(`Rootflow tests: ${finance.passed}/${finance.total} financial assertions + migration guards passed.`);
