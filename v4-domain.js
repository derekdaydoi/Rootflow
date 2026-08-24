/* Rootflow V4 — decision-oriented finance layer.
   Keeps the V3 ledger/snapshot engine intact and translates it into the
   questions a user actually needs to answer: assets/capital/debt, debt
   urgency and buffer, business profitability/cashflow, spending plan and
   investments. No persisted schema changes. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  if (!D || !D.v3TreasurySummary) return;

  function live(rows) {
    return (rows || []).filter(function (row) { return row && !row.deletedAt && !row.skipped; });
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
  }

  function settingsOf(data) { return data && data.settings || {}; }

  function forecastStart(data) {
    var settings = settingsOf(data);
    return validDate(settings.forecastStartDate) ? settings.forecastStartDate : D.today();
  }

  function futureFlow(flow, data, days) {
    if (!flow || flow.confirmed || flow.skipped || flow.deletedAt) return false;
    if (flow.affectsProjectedCash === false || flow.cashflowPhase === 'history' || flow.alreadyReflectedInSnapshot === true) return false;
    if (!validDate(flow.date)) return false;
    var settings = settingsOf(data);
    if (validDate(settings.snapshotDate) && settings.ignoreHistoricalFlowsForProjection && flow.date <= settings.snapshotDate) return false;
    var start = forecastStart(data);
    var end = D.addDays(start, Math.max(1, Number(days) || 30));
    return flow.date >= start && flow.date <= end;
  }

  function balances(data) {
    return D.balances(data.accounts || [], data.flows || []);
  }

  function activeContracts(data, type) {
    return (data.contracts || []).filter(function (contract) {
      return contract && contract.status !== 'closed' && (!type || contract.type === type);
    });
  }

  function contractByAccount(data) {
    var map = {};
    activeContracts(data, 'payable').forEach(function (contract) {
      if (!map[contract.accountId]) map[contract.accountId] = contract;
    });
    return map;
  }

  function balanceSheetSummary(data) {
    var bal = balances(data);
    var totals = D.totals(data.accounts || [], bal);
    var debt = Math.max(0, Number(totals.liability) || 0);
    var assets = Math.max(0, Number(totals.assets) || 0);
    var equity = Number(totals.netWorth) || 0;
    return {
      totalAssets: assets,
      ownCapital: equity,
      totalDebt: debt,
      liquid: Math.max(0, Number(totals.liquid) || 0),
      receivables: Math.max(0, Number(totals.receivable) || 0),
      investments: Math.max(0, Number(totals.investment) || 0),
      ownedAssets: Math.max(0, Number(totals.fixedAsset) || 0),
      debtToAssetsPct: assets > 0 ? debt / assets * 100 : null,
      equityToAssetsPct: assets > 0 ? equity / assets * 100 : null
    };
  }

  function normalizeTerm(value) {
    var term = String(value || '').toLowerCase();
    if (term === 'current' || term === 'short' || term === 'short_term') return 'short';
    if (term === 'long' || term === 'long_term') return 'long';
    return null;
  }

  function debtStructure(data) {
    var bal = balances(data);
    var linked = contractByAccount(data);
    var start = forecastStart(data);
    var oneYear = D.addDays(start, 365);
    var shortDebt = 0, longDebt = 0, unknownDebt = 0;
    var rows = [];

    (data.accounts || []).forEach(function (account) {
      if (!account || account.archived || !D.isLiability(account)) return;
      var amount = Math.max(0, Number(bal[account.id]) || 0);
      if (!(amount > 0)) return;
      var contract = linked[account.id] || null;
      var term = account.type === 'credit_card' ? 'short' : normalizeTerm(account.termClass);
      if (!term && contract && validDate(contract.maturityDate)) term = contract.maturityDate <= oneYear ? 'short' : 'long';
      if (term === 'short') shortDebt += amount;
      else if (term === 'long') longDebt += amount;
      else unknownDebt += amount;
      rows.push({
        accountId: account.id,
        name: account.name,
        type: account.type,
        amount: amount,
        term: term || 'unknown',
        maturityDate: contract && contract.maturityDate || null
      });
    });

    return { shortDebt: shortDebt, longDebt: longDebt, unknownDebt: unknownDebt, rows: rows };
  }

  /* V3 debt calendar intentionally started from every negative cashflow. For a
     debt calendar we must keep only true financing obligations, not living
     expenses or new lending deployment. */
  function debtCalendar(data, days) {
    var flowById = {};
    live(data.flows).forEach(function (flow) { flowById[flow.id] = flow; });
    return (D.v3DebtCalendar(data, days) || []).filter(function (row) {
      if (!row) return false;
      if (row.type === 'control' || String(row.id || '').indexOf('undated-') === 0) return true;
      var flow = flowById[row.id];
      if (!flow) return false;
      if (flow.kind === 'repay') return true;
      if ((flow.kind === 'interest_out' || flow.kind === 'fee') && flow.contractId) return true;
      return false;
    });
  }

  function debtHealth(data) {
    var treasury = D.v3TreasurySummary(data, { days: 30 });
    var structure = debtStructure(data);
    var calendar = debtCalendar(data, 30);
    var due30 = calendar.reduce(function (sum, row) { return sum + Math.max(0, Number(row.total) || 0); }, 0);
    var exactRows = calendar.filter(function (row) { return validDate(row.date); });
    var nextDue = exactRows.length ? exactRows[0].date : null;
    var availableBeforeDebt = treasury.currentCash + Math.max(0, Number(treasury.bridge && treasury.bridge.reliableInflows) || 0);
    var cashAfterDebt30 = availableBeforeDebt - due30;
    var minimumNeed = Math.max(0, Number(treasury.minimumRequiredCash) || 0);
    var recommended = Math.max(0, Number(treasury.recommendedCashToKeep) || 0);
    var paymentShortfall = Math.max(0, minimumNeed - treasury.currentCash);
    var bufferGap = Math.max(0, recommended - treasury.currentCash);
    var canCoverDebt30 = cashAfterDebt30 >= 0;
    var hasOperatingBuffer = bufferGap <= 0;
    return {
      shortDebt: structure.shortDebt,
      longDebt: structure.longDebt,
      unknownDebt: structure.unknownDebt,
      totalDebt: structure.shortDebt + structure.longDebt + structure.unknownDebt,
      due30: due30,
      nextDueDate: nextDue,
      currentCash: treasury.currentCash,
      reliableInflows30: Math.max(0, Number(treasury.bridge && treasury.bridge.reliableInflows) || 0),
      availableBeforeDebt: availableBeforeDebt,
      cashAfterDebt30: cashAfterDebt30,
      minimumRequiredCash: minimumNeed,
      recommendedCashToKeep: recommended,
      paymentShortfall: paymentShortfall,
      bufferGap: bufferGap,
      canCoverDebt30: canCoverDebt30,
      hasOperatingBuffer: hasOperatingBuffer,
      pressureDate: treasury.pressureDate,
      projectedLow: treasury.projectedLow,
      calendar: calendar,
      status: !canCoverDebt30 || paymentShortfall > 0 ? 'SHORTFALL' : !hasOperatingBuffer ? 'THIN_BUFFER' : 'COVERED'
    };
  }

  function contractMonthlyFundingCost(contract) {
    var result = { interest: 0, fee: 0, known: true };
    if (!contract || contract.type !== 'payable') return result;

    var rate = Math.max(0, Number(contract.interestRate) || 0);
    var original = Math.max(0, Number(contract.originalPrincipal) || 0);
    var current = Math.max(0, Number(contract.currentOutstanding != null ? contract.currentOutstanding : original) || 0);
    var method = contract.actualInterestMethod;

    if (Number(contract.monthlyInterestAmount) > 0) {
      result.interest = Math.max(0, Number(contract.monthlyInterestAmount) || 0);
    } else if ((method === 'flat' || method === 'reducing_balance' || contract.interestMode === 'rate') && rate > 0) {
      result.interest = Math.round((method === 'flat' || contract.interestBasis === 'original_principal' ? original : current) * rate / 100);
    } else if (contract.interestMode === 'fixed' || method === 'fixed_amount') {
      var fixed = Math.max(0, Number(contract.fixedInterest) || 0);
      if (fixed > 0 && (contract.fixedInterestBasis === 'per_period' || contract.interestFrequency === 'monthly')) result.interest = fixed;
      else if (fixed > 0 && Number(contract.termMonths) > 0) result.interest = Math.round(fixed / Number(contract.termMonths));
      else if (fixed > 0 && validDate(contract.startDate) && validDate(contract.maturityDate)) {
        var months = Math.max(1, Math.round(D.diffDays(contract.startDate, contract.maturityDate) / 30));
        result.interest = Math.round(fixed / months);
      } else if (fixed > 0) result.known = false;
    } else if (method === null || contract.fieldCertainty && contract.fieldCertainty.actualInterestMethod === 'UNKNOWN') {
      result.known = false;
    }

    if (contract.feeFrequency === 'per_period') result.fee = Math.max(0, Number(contract.feeAmount) || 0);
    return result;
  }

  function fundingCostSummary(data) {
    var interest = 0, fee = 0, unknown = 0;
    activeContracts(data, 'payable').forEach(function (contract) {
      var row = contractMonthlyFundingCost(contract);
      interest += row.interest;
      fee += row.fee;
      if (!row.known) unknown += 1;
    });
    var control = debtCalendar(data, 30).filter(function (row) { return row.type === 'control'; })
      .reduce(function (sum, row) { return sum + Math.max(0, Number(row.rollover || row.total) || 0); }, 0);
    return { interest: interest, fee: fee, rollover: control, total: interest + fee + control, unknownContracts: unknown };
  }

  function businessSummary(data) {
    var book = D.v3LendingBook(data) || {};
    var funding = fundingCostSummary(data);
    var bridge = D.v3CashBridge(data, 30) || {};
    var debt = debtCalendar(data, 30);
    var next30FundingCost = debt.reduce(function (sum, row) {
      return sum + Math.max(0, Number(row.interest) || 0) + Math.max(0, Number(row.fee) || 0) + Math.max(0, Number(row.rollover) || 0);
    }, 0);
    var recurringIncome = Math.max(0, Number(book.monthlyInterest) || 0);
    var netMonthly = recurringIncome - funding.total;
    var next30Income = Math.max(0, Number(bridge.lendingInterest) || 0);
    var next30Margin = next30Income - next30FundingCost;
    var hasBusiness = Math.max(0, Number(book.totalPrincipal) || 0) > 0 || recurringIncome > 0;
    var known = funding.unknownContracts === 0;
    return {
      hasBusiness: hasBusiness,
      lendingPrincipal: Math.max(0, Number(book.totalPrincipal) || 0),
      recurringLendingIncome: recurringIncome,
      knownFundingCostMonthly: funding.total,
      fundingInterestMonthly: funding.interest,
      fundingFeesMonthly: funding.fee,
      rolloverMonthly: funding.rollover,
      netMonthlyProfitEstimate: netMonthly,
      next30LendingInterest: next30Income,
      next30FundingCashCost: next30FundingCost,
      next30BusinessCashMargin: next30Margin,
      costDataComplete: known,
      unknownCostContracts: funding.unknownContracts,
      profitable: hasBusiness && netMonthly > 0,
      status: !hasBusiness ? 'NO_BUSINESS' : netMonthly < 0 ? 'LOSS' : known ? 'PROFITABLE' : 'PROFITABLE_ESTIMATE'
    };
  }

  function budgetSummary(data, ym) {
    ym = ym || D.monthOf(D.today());
    var budgetRows = (data.budgets || []).filter(function (row) { return row && row.month === ym; });
    var limits = {};
    var plan = 0;
    budgetRows.forEach(function (row) {
      var key = String(row.category || '').toLowerCase();
      var limit = Math.max(0, Number(row.limit) || 0);
      if (key) limits[key] = (limits[key] || 0) + limit;
      plan += limit;
    });
    var bounds = D.monthBounds(ym);
    var budgetedSpent = 0, personalSpent = 0;
    live(data.flows).forEach(function (flow) {
      if (!flow.confirmed || !validDate(flow.date) || flow.date < bounds.from || flow.date > bounds.to) return;
      if (flow.kind === 'expense') personalSpent += Math.abs(Number(flow.amount) || 0);
      var key = String(flow.category || '').toLowerCase();
      if (flow.kind === 'expense' && limits[key] !== undefined) budgetedSpent += Math.abs(Number(flow.amount) || 0);
    });
    var remaining = plan - budgetedSpent;
    return {
      month: ym,
      hasPlan: plan > 0,
      planned: plan,
      spentAgainstPlan: budgetedSpent,
      personalSpent: personalSpent,
      remaining: remaining,
      usagePct: plan > 0 ? budgetedSpent / plan * 100 : null,
      overBy: Math.max(0, -remaining),
      plannedNext30: Math.max(0, Number(D.v3CashBridge(data, 30).plannedExpenses) || 0),
      status: plan <= 0 ? 'NO_PLAN' : remaining < 0 ? 'OVER' : budgetedSpent >= plan * 0.8 ? 'WATCH' : 'ON_TRACK'
    };
  }

  function investmentSummary(data) {
    var bal = balances(data);
    var financial = 0, owned = 0, rows = [];
    (data.accounts || []).forEach(function (account) {
      if (!account || account.archived) return;
      var value = Math.max(0, Number(bal[account.id]) || 0);
      if (D.isInvestment(account)) {
        financial += value;
        rows.push({ id: account.id, name: account.name, value: value, type: 'investment' });
      } else if (D.isFixedAsset(account)) {
        owned += value;
        rows.push({ id: account.id, name: account.name, value: value, type: 'fixed_asset' });
      }
    });
    rows.sort(function (a, b) { return b.value - a.value; });
    var assets = balanceSheetSummary(data).totalAssets;
    return {
      financialInvestments: financial,
      ownedAssets: owned,
      totalInvestedAssets: financial + owned,
      shareOfAssetsPct: assets > 0 ? (financial + owned) / assets * 100 : null,
      rows: rows
    };
  }

  function finalSummary(data) {
    data = data || {};
    var balanceSheet = balanceSheetSummary(data);
    var debt = debtHealth(data);
    var business = businessSummary(data);
    var budget = budgetSummary(data);
    var investments = investmentSummary(data);
    var treasury = D.v3TreasurySummary(data, { days: 30 });
    var overall;
    if (business.status === 'LOSS') overall = 'LOSS';
    else if (debt.status === 'SHORTFALL') overall = business.hasBusiness && business.netMonthlyProfitEstimate > 0 ? 'PROFITABLE_CASH_TIGHT' : 'CASH_TIGHT';
    else if (debt.status === 'THIN_BUFFER') overall = business.hasBusiness && business.netMonthlyProfitEstimate > 0 ? 'PROFITABLE_THIN_BUFFER' : 'THIN_BUFFER';
    else overall = business.hasBusiness && business.netMonthlyProfitEstimate > 0 ? 'PROFITABLE_HEALTHY' : 'STABLE';
    return {
      balanceSheet: balanceSheet,
      debt: debt,
      business: business,
      budget: budget,
      investments: investments,
      treasury: treasury,
      deployableAfterBuffer: Math.max(0, Number(treasury.surplusAboveRecommended) || 0),
      overallStatus: overall
    };
  }

  D.v4BalanceSheetSummary = balanceSheetSummary;
  D.v4DebtStructure = debtStructure;
  D.v4DebtCalendar = debtCalendar;
  D.v4DebtHealth = debtHealth;
  D.v4FundingCostSummary = fundingCostSummary;
  D.v4BusinessSummary = businessSummary;
  D.v4BudgetSummary = budgetSummary;
  D.v4InvestmentSummary = investmentSummary;
  D.v4FinalSummary = finalSummary;
  D.v4Version = '4.0-decision-dashboard';
})(window);
