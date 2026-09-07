/* Rootflow Capital OS decision-layer regressions. */
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
load('v4-domain.js');
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
const bs = D.v4BalanceSheetSummary(data);
assert.strictEqual(bs.totalAssets, 70000000, 'managed assets exclude liabilities');
assert.strictEqual(bs.totalDebt, 5000000, 'credit card is funding/debt');

const income = D.v4IncomePlanSummary(data, '2026-09');
assert.strictEqual(income.defaultAmount, 17000000);
assert.strictEqual(income.plannedAmount, 15000000, 'monthly salary override must beat default');
assert.strictEqual(income.paymentDay, 28);

const projection = D.v4ProjectionSummary(data, 30, 'confirmed');
assert(projection.recurringEvents.some(row => row.name === 'Lương' && row.amount === 15000000), 'certain salary override must become a dated projection event');

const operating = D.v4OperatingSummary(data, 30);
assert.strictEqual(operating.currentCash, 20000000);
assert.strictEqual(operating.requirement.datedNeed, 5000000, 'required cash is the maximum cumulative funding gap, not sum of obligations');
assert.strictEqual(operating.requirement.rolloverNeed, 80000, 'rollover control cost is included separately');
assert.strictEqual(operating.requiredCash, 5080000);
assert.strictEqual(operating.recommendedCash, 7080000, 'operating reserve is added after minimum requirement');
assert.strictEqual(operating.availableCash, 12920000, 'available cash = current cash - recommended cash');
assert.strictEqual(operating.living.target, 7000000);
assert.strictEqual(operating.living.unscheduledReserve, 5000000, 'already scheduled living expense is not reserved twice');
assert.strictEqual(operating.deployableCapital, 7920000, 'deployable capital subtracts unscheduled living reserve from available cash');

const capital = D.v4CapitalSummary(data);
assert.strictEqual(capital.earningCapital, 50000000, 'receivables + investments are earning capital');
assert(capital.positions.some(row => row.kind === 'lending' && row.value === 40000000));
assert(capital.fundingSources.some(row => row.kind === 'credit_card' && row.balance === 5000000));

const certainCase = baseData();
certainCase.accounts = [{ id:'cash2', name:'Cash', type:'bank', openingBalance:10000000, balanceAsOf:'2026-09-07', balanceSemantics:'closing_snapshot', archived:false }];
certainCase.contracts = [];
certainCase.controlAssumptions = {};
certainCase.flows = [{ id:'big-due', kind:'expense', accountId:'cash2', amount:20000000, date:'2026-09-30', confirmed:false, confidence:'CERTAIN', skipped:false }];
certainCase.recurringIncomes = [{ id:'salary2', type:'employment_income', name:'Lương', frequency:'monthly', expectedAmount:17000000, paymentDay:28, amountCertainty:'CERTAIN', archived:false }];
certainCase.settings = { snapshotDate:'2026-09-07', forecastStartDate:'2026-09-07', hardFloor:0, operatingBuffer:0 };
assert.strictEqual(D.v4CashRequirement(certainCase, 30, 'confirmed').minimumRequiredCash, 3000000, 'certain dated income may bridge a later obligation');
certainCase.recurringIncomes[0].amountCertainty = 'EXPECTED';
assert.strictEqual(D.v4CashRequirement(certainCase, 30, 'confirmed').minimumRequiredCash, 20000000, 'expected income must not prove conservative safety');
assert.strictEqual(D.v4CashRequirement(certainCase, 30, 'expected').minimumRequiredCash, 3000000, 'expected scenario may show the bridge separately');

const annualLoan = {
  accounts:[{ id:'loan', name:'Bank loan', type:'loan', openingBalance:120000000, balanceAsOf:'2026-09-07', archived:false }],
  flows:[],
  contracts:[{ id:'loan-c', type:'payable', accountId:'loan', status:'active', originalPrincipal:120000000, currentOutstanding:120000000, interestMode:'rate', actualInterestMethod:'reducing_balance', interestBasis:'outstanding_principal', interestRate:12, interestRatePeriod:'annual', feeFrequency:'none' }],
  settings:{ snapshotDate:'2026-09-07', forecastStartDate:'2026-09-07' }, controlAssumptions:{}, recurringIncomes:[], budgets:[], counterparties:[], statements:[], nonCashEvents:[], scenarios:[]
};
assert.strictEqual(D.v4FundingCostSummary(annualLoan).knownInterest, 1200000, '12% annual rate must be normalized to 1% monthly for monthly cost estimate');

const final = D.v4FinalSummary(data);
assert(final.operating && final.capital && final.incomePlan && Array.isArray(final.upcoming), 'final summary must expose the Capital OS model');

console.log('Rootflow Capital OS domain regressions passed.');
