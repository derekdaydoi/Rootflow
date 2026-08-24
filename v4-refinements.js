/* Rootflow V4 refinements — classification and certainty rules.
   This file intentionally sits after v4-domain.js so the final dashboard can
   improve two user-facing decisions without touching persisted data:
   1) split credit-card revolving vs installment debt by maturity;
   2) distinguish contractual funding cost from planning estimates when the
      actual interest method is still unknown. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  if (!D || !D.v4Version) return;

  function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')); }
  function startDate(data) {
    var s = data && data.settings || {};
    return validDate(s.forecastStartDate) ? s.forecastStartDate : D.today();
  }
  function balances(data) { return D.balances(data.accounts || [], data.flows || []); }
  function activeContracts(data, type) {
    return (data.contracts || []).filter(function (contract) {
      return contract && contract.status !== 'closed' && (!type || contract.type === type);
    });
  }
  function contractsByAccount(data) {
    var map = {};
    activeContracts(data, 'payable').forEach(function (contract) {
      if (!map[contract.accountId]) map[contract.accountId] = [];
      map[contract.accountId].push(contract);
    });
    return map;
  }
  function normalizeTerm(value) {
    var term = String(value || '').toLowerCase();
    if (term === 'current' || term === 'short' || term === 'short_term') return 'short';
    if (term === 'long' || term === 'long_term') return 'long';
    return null;
  }
  function contractTerm(contract, baseDate) {
    if (!contract) return null;
    if (Number(contract.termMonths) > 0) return Number(contract.termMonths) <= 12 ? 'short' : 'long';
    if (validDate(contract.maturityDate)) return contract.maturityDate <= D.addDays(baseDate, 365) ? 'short' : 'long';
    return null;
  }

  function debtStructure(data) {
    data = data || {};
    var bal = balances(data);
    var byAccount = contractsByAccount(data);
    var base = startDate(data);
    var shortDebt = 0, longDebt = 0, unknownDebt = 0, rows = [];

    function add(account, amount, term, component, contract) {
      amount = Math.max(0, Number(amount) || 0);
      if (!(amount > 0)) return;
      if (term === 'short') shortDebt += amount;
      else if (term === 'long') longDebt += amount;
      else unknownDebt += amount;
      rows.push({
        accountId: account.id,
        name: account.name,
        type: account.type,
        component: component || 'total',
        amount: amount,
        term: term || 'unknown',
        maturityDate: contract && contract.maturityDate || null,
        termMonths: contract && Number(contract.termMonths) > 0 ? Number(contract.termMonths) : null
      });
    }

    (data.accounts || []).forEach(function (account) {
      if (!account || account.archived || !D.isLiability(account)) return;
      var amount = Math.max(0, Number(bal[account.id]) || 0);
      if (!(amount > 0)) return;
      var contracts = byAccount[account.id] || [];
      var contract = contracts[0] || null;

      if (account.type === 'credit_card') {
        /* Revolving exposure is always a near-term funding obligation. The
           installment component follows its own term instead of making the
           whole card artificially short-term. */
        var revolving = Math.min(amount, Math.max(0, Number(account.revolvingBalance) || 0));
        var installment = Math.min(Math.max(0, amount - revolving), Math.max(0, Number(account.installmentBalance) || 0));
        var residual = Math.max(0, amount - revolving - installment);
        if (revolving > 0) add(account, revolving, 'short', 'revolving', null);
        if (installment > 0) add(account, installment, contractTerm(contract, base), 'installment', contract);
        /* Unallocated card balance behaves like statement/revolving debt. */
        if (residual > 0) add(account, residual, 'short', 'unallocated_card', null);
        return;
      }

      var term = normalizeTerm(account.termClass) || contractTerm(contract, base);
      add(account, amount, term, 'total', contract);
    });

    return { shortDebt: shortDebt, longDebt: longDebt, unknownDebt: unknownDebt, rows: rows };
  }

  function actualMethodUnknown(contract) {
    if (!contract) return false;
    if (contract.actualInterestMethod === null) return true;
    return Boolean(contract.fieldCertainty && contract.fieldCertainty.actualInterestMethod === 'UNKNOWN');
  }

  function fundingCostRow(contract) {
    var result = { knownInterest: 0, estimatedInterest: 0, fee: 0, unknown: false };
    if (!contract || contract.type !== 'payable') return result;

    var rate = Math.max(0, Number(contract.interestRate) || 0);
    var original = Math.max(0, Number(contract.originalPrincipal) || 0);
    var current = Math.max(0, Number(contract.currentOutstanding != null ? contract.currentOutstanding : original) || 0);
    var method = contract.actualInterestMethod;
    var planning = contract.planningInterestMethod;
    var unknownMethod = actualMethodUnknown(contract);

    if (Number(contract.monthlyInterestAmount) > 0) {
      result.knownInterest = Math.round(Math.max(0, Number(contract.monthlyInterestAmount) || 0));
    } else if (!unknownMethod && (method === 'flat' || method === 'reducing_balance') && rate > 0) {
      result.knownInterest = Math.round((method === 'flat' || contract.interestBasis === 'original_principal' ? original : current) * rate / 100);
    } else if (!unknownMethod && (contract.interestMode === 'fixed' || method === 'fixed_amount')) {
      var fixed = Math.max(0, Number(contract.fixedInterest) || 0);
      if (fixed > 0 && (contract.fixedInterestBasis === 'per_period' || contract.interestFrequency === 'monthly')) result.knownInterest = Math.round(fixed);
      else if (fixed > 0 && Number(contract.termMonths) > 0) result.knownInterest = Math.round(fixed / Number(contract.termMonths));
      else if (fixed > 0 && validDate(contract.startDate) && validDate(contract.maturityDate)) {
        result.knownInterest = Math.round(fixed / Math.max(1, Math.round(D.diffDays(contract.startDate, contract.maturityDate) / 30)));
      } else if (fixed > 0) result.unknown = true;
    } else if (unknownMethod && rate > 0 && (planning === 'flat' || planning === 'reducing_balance')) {
      /* A planning method is useful for control, but it must never be presented
         as contractual truth. */
      result.estimatedInterest = Math.round((planning === 'flat' || contract.interestBasis === 'original_principal' ? original : current) * rate / 100);
      result.unknown = true;
    } else if (unknownMethod) {
      result.unknown = true;
    }

    if (contract.feeFrequency === 'per_period') result.fee = Math.round(Math.max(0, Number(contract.feeAmount) || 0));
    return result;
  }

  function fundingCostSummary(data) {
    var knownInterest = 0, estimatedInterest = 0, fee = 0, unknown = 0;
    activeContracts(data, 'payable').forEach(function (contract) {
      var row = fundingCostRow(contract);
      knownInterest += row.knownInterest;
      estimatedInterest += row.estimatedInterest;
      fee += row.fee;
      if (row.unknown) unknown += 1;
    });
    var rollover = (D.v4DebtCalendar(data, 30) || []).filter(function (row) { return row.type === 'control'; })
      .reduce(function (sum, row) { return sum + Math.max(0, Number(row.rollover || row.total) || 0); }, 0);
    return {
      knownInterest: knownInterest,
      estimatedInterest: estimatedInterest,
      fee: fee,
      rollover: rollover,
      contractualKnownTotal: knownInterest + fee,
      planningTotal: knownInterest + estimatedInterest + fee + rollover,
      unknownContracts: unknown
    };
  }

  function businessSummary(data) {
    var book = D.v3LendingBook(data) || {};
    var funding = fundingCostSummary(data);
    var bridge = D.v3CashBridge(data, 30) || {};
    var debt = D.v4DebtCalendar(data, 30) || [];
    var next30FundingCost = debt.reduce(function (sum, row) {
      return sum + Math.max(0, Number(row.interest) || 0) + Math.max(0, Number(row.fee) || 0) + Math.max(0, Number(row.rollover) || 0);
    }, 0);
    var recurringIncome = Math.max(0, Number(book.monthlyInterest) || 0);
    var netMonthly = recurringIncome - funding.planningTotal;
    var next30Income = Math.max(0, Number(bridge.lendingInterest) || 0);
    var next30Margin = next30Income - next30FundingCost;
    var hasBusiness = Math.max(0, Number(book.totalPrincipal) || 0) > 0 || recurringIncome > 0;
    var complete = funding.unknownContracts === 0;
    return {
      hasBusiness: hasBusiness,
      lendingPrincipal: Math.max(0, Number(book.totalPrincipal) || 0),
      recurringLendingIncome: recurringIncome,
      /* This is the number shown beside the profit estimate, so it includes
         planning interest and rollover control assumptions and reconciles to
         netMonthlyProfitEstimate. Contractual-only cost is exposed separately. */
      knownFundingCostMonthly: funding.planningTotal,
      contractualKnownFundingCostMonthly: funding.contractualKnownTotal,
      planningFundingCostMonthly: funding.planningTotal,
      fundingInterestMonthly: funding.knownInterest,
      estimatedFundingInterestMonthly: funding.estimatedInterest,
      fundingFeesMonthly: funding.fee,
      rolloverMonthly: funding.rollover,
      netMonthlyProfitEstimate: netMonthly,
      next30LendingInterest: next30Income,
      next30FundingCashCost: next30FundingCost,
      next30BusinessCashMargin: next30Margin,
      costDataComplete: complete,
      unknownCostContracts: funding.unknownContracts,
      profitable: hasBusiness && netMonthly > 0,
      status: !hasBusiness ? 'NO_BUSINESS' : netMonthly < 0 ? 'LOSS' : complete ? 'PROFITABLE' : 'PROFITABLE_ESTIMATE'
    };
  }

  function debtHealth(data) {
    var treasury = D.v3TreasurySummary(data, { days: 30 });
    var structure = debtStructure(data);
    var calendar = D.v4DebtCalendar(data, 30) || [];
    var due30 = calendar.reduce(function (sum, row) { return sum + Math.max(0, Number(row.total) || 0); }, 0);
    var exact = calendar.filter(function (row) { return validDate(row.date); });
    var nextDue = exact.length ? exact[0].date : null;
    var reliable = Math.max(0, Number(treasury.bridge && treasury.bridge.reliableInflows) || 0);
    var available = treasury.currentCash + reliable;
    var afterDebt = available - due30;
    var minimum = Math.max(0, Number(treasury.minimumRequiredCash) || 0);
    var recommended = Math.max(0, Number(treasury.recommendedCashToKeep) || 0);
    var paymentShortfall = Math.max(0, minimum - treasury.currentCash);
    var bufferGap = Math.max(0, recommended - treasury.currentCash);
    var canCover = afterDebt >= 0;
    var hasBuffer = bufferGap <= 0;
    return {
      shortDebt: structure.shortDebt,
      longDebt: structure.longDebt,
      unknownDebt: structure.unknownDebt,
      totalDebt: structure.shortDebt + structure.longDebt + structure.unknownDebt,
      due30: due30,
      nextDueDate: nextDue,
      currentCash: treasury.currentCash,
      reliableInflows30: reliable,
      availableBeforeDebt: available,
      cashAfterDebt30: afterDebt,
      minimumRequiredCash: minimum,
      recommendedCashToKeep: recommended,
      paymentShortfall: paymentShortfall,
      bufferGap: bufferGap,
      canCoverDebt30: canCover,
      hasOperatingBuffer: hasBuffer,
      pressureDate: treasury.pressureDate,
      projectedLow: treasury.projectedLow,
      calendar: calendar,
      status: !canCover || paymentShortfall > 0 ? 'SHORTFALL' : !hasBuffer ? 'THIN_BUFFER' : 'COVERED'
    };
  }

  function finalSummary(data) {
    data = data || {};
    var balanceSheet = D.v4BalanceSheetSummary(data);
    var debt = debtHealth(data);
    var business = businessSummary(data);
    var budget = D.v4BudgetSummary(data);
    var investments = D.v4InvestmentSummary(data);
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

  D.v4DebtStructure = debtStructure;
  D.v4DebtHealth = debtHealth;
  D.v4FundingCostSummary = fundingCostSummary;
  D.v4BusinessSummary = businessSummary;
  D.v4FinalSummary = finalSummary;
  D.v4Refinements = '4.0.1-maturity-certainty';
})(window);
