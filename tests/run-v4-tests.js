/* Rootflow V4 decision-dashboard regression tests. */
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
load('v4-refinements.js');
const D = global.RootflowDomain;

const data = {
  accounts: [
    { id:'cash', name:'Cash', type:'bank', openingBalance:100, balanceAsOf:'2026-08-24', balanceSemantics:'closing_snapshot', archived:false },
    { id:'recv', name:'Receivable', type:'receivable', openingBalance:200, balanceAsOf:'2026-08-24', archived:false },
    { id:'inv', name:'Fund', type:'investment', openingBalance:50, balanceAsOf:'2026-08-24', archived:false },
    { id:'asset', name:'Asset', type:'fixed_asset', openingBalance:30, balanceAsOf:'2026-08-24', archived:false },
    { id:'cc', name:'Card', type:'credit_card', openingBalance:40, revolvingBalance:40, installmentBalance:0, balanceAsOf:'2026-08-24', archived:false },
    { id:'short', name:'Short loan', type:'loan', openingBalance:20, balanceAsOf:'2026-08-24', archived:false },
    { id:'long', name:'Long loan', type:'loan', openingBalance:30, balanceAsOf:'2026-08-24', archived:false }
  ],
  flows: [
    { id:'repay', kind:'repay', accountId:'cash', counterAccountId:'short', amount:6, principalAmount:5, interestAmount:1, feeAmount:0, date:'2026-09-01', confirmed:false, confidence:'CERTAIN', skipped:false, contractId:'p-short' },
    { id:'expense', kind:'expense', accountId:'cash', counterAccountId:null, amount:10, date:'2026-09-01', confirmed:false, confidence:'CERTAIN', skipped:false, category:'food' },
    { id:'lend', kind:'lend', accountId:'cash', counterAccountId:'recv', amount:20, date:'2026-09-02', confirmed:false, confidence:'CERTAIN', skipped:false, contractId:null },
    { id:'collect-interest', kind:'collect', accountId:'cash', counterAccountId:'recv', amount:3, principalAmount:0, interestAmount:3, feeAmount:0, date:'2026-09-03', confirmed:false, confidence:'CERTAIN', skipped:false, contractId:'r1' },
    { id:'spent', kind:'expense', accountId:'cash', counterAccountId:null, amount:8, date:'2026-08-20', confirmed:true, confidence:'CERTAIN', skipped:false, category:'food' }
  ],
  contracts: [
    { id:'r1', type:'receivable', accountId:'recv', status:'active', originalPrincipal:200, currentOutstanding:200, interestFrequency:'monthly', interestMode:'fixed', fixedInterest:12, repaymentMode:'interest_only', maturityType:'planning_placeholder' },
    { id:'p-short', type:'payable', accountId:'short', status:'active', originalPrincipal:20, currentOutstanding:20, maturityDate:'2026-12-01', interestMode:'rate', actualInterestMethod:'flat', interestBasis:'original_principal', interestRate:1, feeFrequency:'none' },
    { id:'p-long', type:'payable', accountId:'long', status:'active', originalPrincipal:30, currentOutstanding:30, maturityDate:'2028-02-01', interestMode:'rate', actualInterestMethod:'reducing_balance', interestBasis:'outstanding_principal', interestRate:2, feeFrequency:'none' }
  ],
  recurringIncomes: [{ id:'salary', name:'Salary', frequency:'monthly', expectedAmount:1000, archived:false }],
  controlAssumptions: { creditCardRolloverCostRateMonthly:1.6 },
  budgets: [{ id:'b1', month:'2026-08', category:'food', limit:20 }],
  settings: { snapshotDate:'2026-08-24', forecastStartDate:'2026-08-25', ignoreHistoricalFlowsForProjection:true, operatingBuffer:10, hardFloor:0, horizonDays:90 },
  counterparties: [], statements: [], nonCashEvents: [], scenarios: []
};

const bs = D.v4BalanceSheetSummary(data);
assert.strictEqual(bs.totalAssets, 380, 'assets = cash + receivable + investment + fixed asset');
assert.strictEqual(bs.totalDebt, 90, 'debt includes credit card and loans');
assert.strictEqual(bs.ownCapital, 290, 'own capital = assets - debt');

const structure = D.v4DebtStructure(data);
assert.strictEqual(structure.shortDebt, 60, 'revolving card + short maturity are short-term');
assert.strictEqual(structure.longDebt, 30, 'long maturity stays long-term');
assert.strictEqual(structure.unknownDebt, 0);

const termData = {
  accounts: [
    { id:'cash2', name:'Cash', type:'bank', openingBalance:0, balanceAsOf:'2026-08-24', balanceSemantics:'closing_snapshot', archived:false },
    { id:'card2', name:'Installment card', type:'credit_card', openingBalance:100, revolvingBalance:20, installmentBalance:80, balanceAsOf:'2026-08-24', archived:false }
  ],
  flows: [],
  contracts: [{ id:'card-contract', type:'payable', accountId:'card2', status:'active', originalPrincipal:80, currentOutstanding:80, termMonths:24, interestMode:'none', actualInterestMethod:'none' }],
  settings: { snapshotDate:'2026-08-24', forecastStartDate:'2026-08-25', ignoreHistoricalFlowsForProjection:true },
  controlAssumptions: {}, recurringIncomes: [], budgets: [], counterparties: [], statements: [], nonCashEvents: [], scenarios: []
};
const cardStructure = D.v4DebtStructure(termData);
assert.strictEqual(cardStructure.shortDebt, 20, 'revolving portion stays short-term');
assert.strictEqual(cardStructure.longDebt, 80, '24-month installment portion is classified long-term');
assert.strictEqual(cardStructure.unknownDebt, 0);

const calendar = D.v4DebtCalendar(data, 30);
assert(calendar.some(r => r.id === 'repay'), 'repayment must appear in debt calendar');
assert(!calendar.some(r => r.id === 'expense'), 'living expense must not appear in debt calendar');
assert(!calendar.some(r => r.id === 'lend'), 'new lending deployment must not appear in debt calendar');
assert(calendar.some(r => r.type === 'control'), 'rollover control obligation should remain visible');

const business = D.v4BusinessSummary(data);
assert.strictEqual(business.recurringLendingIncome, 12);
/* Rootflow stores currency as integer units. The synthetic sub-unit monthly
   costs (0.2, 0.6, 0.64) therefore round to 0 + 1 + 1 = 2. */
assert.strictEqual(business.knownFundingCostMonthly, 2, 'displayed funding cost must reconcile to the profit estimate');
assert.strictEqual(business.netMonthlyProfitEstimate, 10);
assert.strictEqual(business.profitable, true);
assert(business.netMonthlyProfitEstimate < 100, 'salary must not be counted as business profit');

const estimateData = {
  accounts: [{ id:'loan-est', name:'Estimated loan', type:'loan', openingBalance:1000, balanceAsOf:'2026-08-24', archived:false }],
  flows: [],
  contracts: [{ id:'est', type:'payable', accountId:'loan-est', status:'active', originalPrincipal:1000, currentOutstanding:1000, interestMode:'rate', actualInterestMethod:null, planningInterestMethod:'flat', interestBasis:'original_principal', interestRate:1, fieldCertainty:{ actualInterestMethod:'UNKNOWN' } }],
  controlAssumptions: {}, settings:{ snapshotDate:'2026-08-24', forecastStartDate:'2026-08-25' }, recurringIncomes:[], budgets:[], counterparties:[], statements:[], nonCashEvents:[], scenarios:[]
};
const estimatedCost = D.v4FundingCostSummary(estimateData);
assert.strictEqual(estimatedCost.contractualKnownTotal, 0, 'planning method must not become contractual truth');
assert.strictEqual(estimatedCost.estimatedInterest, 10, 'planning method can still provide a control estimate');
assert.strictEqual(estimatedCost.unknownContracts, 1, 'unknown actual interest method must remain visibly incomplete');

const budget = D.v4BudgetSummary(data, '2026-08');
assert.strictEqual(budget.planned, 20);
assert.strictEqual(budget.spentAgainstPlan, 8);
assert.strictEqual(budget.remaining, 12);
assert.strictEqual(budget.status, 'ON_TRACK');

const investment = D.v4InvestmentSummary(data);
assert.strictEqual(investment.financialInvestments, 50);
assert.strictEqual(investment.ownedAssets, 30);
assert.strictEqual(investment.totalInvestedAssets, 80);

const final = D.v4FinalSummary(data);
assert(final.balanceSheet && final.debt && final.business && final.budget && final.investments, 'final summary must expose all five decision domains');

console.log('Rootflow V4 final dashboard regression tests passed.');