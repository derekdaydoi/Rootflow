/* Rootflow capital decision regressions. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { filename: file });
}
load('domain.js');
load('cashflow-domain.js');
load('capital-domain.js');
const D = global.RootflowDomain;
D.today = () => '2026-09-07';

function baseData() {
  return {
    accounts: [
      { id:'cash', name:'Cash', type:'bank', openingBalance:20000000, balanceAsOf:'2026-09-07', balanceSemantics:'closing_snapshot', archived:false },
      { id:'recv', name:'A', type:'receivable', openingBalance:40000000, balanceAsOf:'2026-09-07', balanceSemantics:'closing_snapshot', archived:false },
      { id:'inv', name:'Fund', type:'investment', openingBalance:10000000, balanceAsOf:'2026-09-07', balanceSemantics:'closing_snapshot', archived:false },
      { id:'cc', name:'Card', type:'credit_card', openingBalance:5000000, revolvingBalance:5000000, installmentBalance:0, creditLimit:30000000, balanceAsOf:'2026-09-07', balanceSemantics:'closing_snapshot', archived:false }
    ],
    flows: [
      { id:'expense', kind:'expense', accountId:'cash', amount:2000000, date:'2026-09-10', confirmed:false, confidence:'CERTAIN', skipped:false, category:'food' },
      { id:'collect', kind:'collect', accountId:'cash', counterAccountId:'recv', amount:5000000, principalAmount:5000000, interestAmount:0, feeAmount:0, date:'2026-09-15', confirmed:false, confidence:'CERTAIN', skipped:false, contractId:'r1', counterpartyName:'A' },
      { id:'repay', kind:'repay', accountId:'cash', counterAccountId:'cc', amount:8000000, principalAmount:8000000, interestAmount:0, feeAmount:0, date:'2026-09-20', confirmed:false, confidence:'CERTAIN', skipped:false, contractId:'p1', counterpartyName:'Card' }
    ],
    contracts: [
      { id:'r1', type:'receivable', accountId:'recv', status:'active', counterpartyName:'A', originalPrincipal:40000000, currentOutstanding:40000000, interestFrequency:'monthly', interestMode:'fixed', fixedInterest:900000, fixedInterestBasis:'per_period', repaymentMode:'interest_only' },
      { id:'p1', type:'payable', accountId:'cc', status:'active', originalPrincipal:5000000, currentOutstanding:5000000, interestMode:'none', actualInterestMethod:'none', feeFrequency:'none' }
    ],
    recurringIncomes: [
      { id:'salary', type:'employment_income', name:'Lương', frequency:'monthly', expectedAmount:17000000, paymentDay:28, amountCertainty:'CERTAIN', monthlyOverrides:{'2026-09':15000000}, archived:false }
    ],
    controlAssumptions: { creditCardRolloverCostRateMonthly:1.6 },
    budgets: [],
    settings: { snapshotDate:'2026-09-07', forecastStartDate:'2026-09-07', ignoreHistoricalFlowsForProjection:true, hardFloor:0, operatingBuffer:2000000, comfortBuffer:2000000, defaultLivingTarget:7000000, horizonDays:90 },
    counterparties: [], statements: [], nonCashEvents: [], scenarios: []
  };
}

const data = baseData();
const bs = D.capitalBalanceSheetSummary(data);
assert.strictEqual(bs.totalAssets, 70000000);
assert.strictEqual(bs.totalDebt, 5000000);

const income = D.incomePlanSummary(data, '2026-09');
assert.strictEqual(income.defaultAmount, 17000000);
assert.strictEqual(income.plannedAmount, 15000000);
assert.strictEqual(income.paymentDay, 28);

const projection = D.capitalProjectionSummary(data, 30, 'confirmed');
assert(projection.recurringEvents.some(row => row.name === 'Lương' && row.amount === 15000000));

const operating = D.operatingSummary(data, 30);
assert.strictEqual(operating.currentCash, 20000000);
assert.strictEqual(operating.requirement.datedNeed, 5000000);
assert.strictEqual(operating.requirement.rolloverNeed, 80000);
assert.strictEqual(operating.requiredCash, 5080000);
assert.strictEqual(operating.recommendedCash, 7080000);
assert.strictEqual(operating.availableCash, 12920000);
assert.strictEqual(operating.living.target, 7000000);
assert.strictEqual(operating.living.unscheduledReserve, 5000000);
assert.strictEqual(operating.deployableCapital, 7920000);

const capital = D.capitalSummary(data);
assert.strictEqual(capital.earningCapital, 50000000);
assert(capital.positions.some(row => row.kind === 'lending' && row.value === 40000000 && row.accountId === 'recv'));
assert(capital.positions.some(row => row.kind === 'investment' && row.accountId === 'inv'));
assert(capital.fundingSources.some(row => row.kind === 'credit_card' && row.balance === 5000000 && row.accountId === 'cc'));

const certainCase = baseData();
certainCase.accounts = [{ id:'cash2', name:'Cash', type:'bank', openingBalance:10000000, balanceAsOf:'2026-09-07', balanceSemantics:'closing_snapshot', archived:false }];
certainCase.contracts = [];
certainCase.controlAssumptions = {};
certainCase.flows = [{ id:'big-due', kind:'expense', accountId:'cash2', amount:20000000, date:'2026-09-30', confirmed:false, confidence:'CERTAIN', skipped:false }];
certainCase.recurringIncomes = [{ id:'salary2', type:'employment_income', name:'Lương', frequency:'monthly', expectedAmount:17000000, paymentDay:28, amountCertainty:'CERTAIN', archived:false }];
certainCase.settings = { snapshotDate:'2026-09-07', forecastStartDate:'2026-09-07', hardFloor:0, operatingBuffer:0 };
assert.strictEqual(D.capitalCashRequirement(certainCase, 30, 'confirmed').minimumRequiredCash, 3000000);
certainCase.recurringIncomes[0].amountCertainty = 'EXPECTED';
assert.strictEqual(D.capitalCashRequirement(certainCase, 30, 'confirmed').minimumRequiredCash, 20000000);
assert.strictEqual(D.capitalCashRequirement(certainCase, 30, 'expected').minimumRequiredCash, 3000000);

const annualLoan = {
  accounts:[{ id:'loan', name:'Bank loan', type:'loan', openingBalance:120000000, balanceAsOf:'2026-09-07', archived:false }],
  flows:[],
  contracts:[{ id:'loan-c', type:'payable', accountId:'loan', status:'active', originalPrincipal:120000000, currentOutstanding:120000000, interestMode:'rate', actualInterestMethod:'reducing_balance', interestBasis:'outstanding_principal', interestRate:12, interestRatePeriod:'annual', feeFrequency:'none' }],
  settings:{ snapshotDate:'2026-09-07', forecastStartDate:'2026-09-07' }, controlAssumptions:{}, recurringIncomes:[], budgets:[], counterparties:[], statements:[], nonCashEvents:[], scenarios:[]
};
assert.strictEqual(D.capitalFundingCostSummary(annualLoan).knownInterest, 1200000);

const receivableInterestOnly = D.contractSchedule({
  id:'recv-interest-only', type:'receivable', originalPrincipal:30000000, currentOutstanding:30000000,
  startDate:'2026-08-25', firstPaymentDate:'2026-09-25', maturityDate:'2027-01-25',
  interestFrequency:'monthly', repaymentMode:'interest_only', interestMode:'fixed', actualInterestMethod:'fixed_amount',
  fixedInterest:3000000, fixedInterestBasis:'per_period', feeFrequency:'none'
});
assert.strictEqual(receivableInterestOnly.length, 5);
receivableInterestOnly.slice(0, -1).forEach(row => {
  assert.strictEqual(row.principalAmount, 0);
  assert.strictEqual(row.interestAmount, 3000000);
  assert.strictEqual(row.amount, 3000000);
});
assert.strictEqual(receivableInterestOnly[4].principalAmount, 30000000);
assert.strictEqual(receivableInterestOnly[4].interestAmount, 3000000);
assert.strictEqual(receivableInterestOnly[4].amount, 33000000);
assert.strictEqual(receivableInterestOnly.reduce((sum, row) => sum + row.interestAmount, 0), 15000000);

const annualDaily = D.contractSchedule({
  id:'daily-annual', type:'payable', originalPrincipal:22000000, currentOutstanding:22000000,
  startDate:'2026-06-25', firstPaymentDate:'2026-07-14', maturityDate:'2026-08-14',
  interestFrequency:'monthly', repaymentMode:'principal_interest', actualInterestMethod:'reducing_balance',
  interestBasis:'outstanding_principal', annualInterestRate:12, interestRate:12, interestRatePeriod:'annual',
  dayCountConvention:'actual_365', feeFrequency:'none'
});
assert.strictEqual(annualDaily[0].interestAmount, Math.round(22000000 * 0.12 * 19 / 365));
assert.strictEqual(annualDaily[1].interestAmount, Math.round(11000000 * 0.12 * 31 / 365));

const final = D.finalSummary(data);
assert(final.operating && final.capital && final.incomePlan && Array.isArray(final.upcoming));

console.log('Rootflow capital decision regressions passed.');
