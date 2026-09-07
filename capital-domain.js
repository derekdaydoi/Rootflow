/* Rootflow — Personal Capital & Cashflow Operating System.
   Canonical decision layer. Accounting/ledger semantics stay underneath;
   this file exposes the questions a person actually needs to answer:
   what cash exists, what must be kept, what can be used, where capital sits,
   and which funding sources create pressure. No persisted schema bump. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  if (!D || !D.cashflowTreasurySummary || !D.cashflowProjectionPath) return;

  function live(rows) {
    return (rows || []).filter(function (row) { return row && !row.deletedAt && !row.skipped; });
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
  }

  function monthKey(value) {
    var raw = String(value || D.today());
    return /^\d{4}-\d{2}/.test(raw) ? raw.slice(0, 7) : D.monthOf(D.today());
  }

  function nextMonth(ym) {
    var p = String(ym).split('-');
    var y = Number(p[0]) || 1970;
    var m = Number(p[1]) || 1;
    m += 1;
    if (m > 12) { y += 1; m = 1; }
    return y + '-' + String(m).padStart(2, '0');
  }

  function daysInMonth(ym) {
    var p = String(ym).split('-');
    var y = Number(p[0]) || 1970;
    var m = Number(p[1]) || 1;
    var leap = y % 400 === 0 || y % 4 === 0 && y % 100 !== 0;
    return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][Math.max(0, Math.min(11, m - 1))];
  }

  function dateForMonthDay(ym, day) {
    var d = Math.max(1, Math.min(daysInMonth(ym), Number(day) || 1));
    return ym + '-' + String(d).padStart(2, '0');
  }

  function settingsOf(data) { return data && data.settings || {}; }

  function balances(data, upto) {
    return D.balances(data.accounts || [], data.flows || [], upto ? { upto: upto } : undefined);
  }

  function activeContracts(data, type) {
    return (data.contracts || []).filter(function (contract) {
      return contract && contract.status !== 'closed' && (!type || contract.type === type);
    });
  }

  function contractsByAccount(data, type) {
    var map = {};
    activeContracts(data, type).forEach(function (contract) {
      if (!map[contract.accountId]) map[contract.accountId] = [];
      map[contract.accountId].push(contract);
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

  function contractTerm(contract, baseDate) {
    if (!contract) return null;
    if (Number(contract.termMonths) > 0) return Number(contract.termMonths) <= 12 ? 'short' : 'long';
    if (validDate(contract.maturityDate)) return contract.maturityDate <= D.addDays(baseDate, 365) ? 'short' : 'long';
    return null;
  }

  function debtStructure(data) {
    data = data || {};
    var bal = balances(data);
    var byAccount = contractsByAccount(data, 'payable');
    var base = D.today();
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
        var revolving = Math.min(amount, Math.max(0, Number(account.revolvingBalance) || 0));
        var installment = Math.min(Math.max(0, amount - revolving), Math.max(0, Number(account.installmentBalance) || 0));
        var residual = Math.max(0, amount - revolving - installment);
        if (revolving > 0) add(account, revolving, 'short', 'revolving', null);
        if (installment > 0) add(account, installment, contractTerm(contract, base), 'installment', contract);
        if (residual > 0) add(account, residual, 'short', 'unallocated_card', null);
        return;
      }

      add(account, amount, normalizeTerm(account.termClass) || contractTerm(contract, base), 'total', contract);
    });

    return { shortDebt: shortDebt, longDebt: longDebt, unknownDebt: unknownDebt, rows: rows };
  }

  function debtCalendar(data, days) {
    /* Decision views are anchored to today. Do not let a stale manual forecastStartDate
       move the debt window away from the user's actual operating date. */
    var planningData = Object.assign({}, data || {}, {
      settings: Object.assign({}, data && data.settings || {}, { forecastStartDate: D.today() })
    });
    var flowById = {};
    live(planningData.flows).forEach(function (flow) { flowById[flow.id] = flow; });
    return (D.cashflowDebtCalendar(planningData, days) || []).filter(function (row) {
      if (!row) return false;
      if (row.type === 'control' || String(row.id || '').indexOf('undated-') === 0) return true;
      var flow = flowById[row.id];
      if (!flow) return false;
      if (flow.kind === 'repay') return true;
      return (flow.kind === 'interest_out' || flow.kind === 'fee') && Boolean(flow.contractId);
    });
  }

  function actualMethodUnknown(contract) {
    if (!contract) return false;
    if (contract.actualInterestMethod === null) return true;
    return Boolean(contract.fieldCertainty && contract.fieldCertainty.actualInterestMethod === 'UNKNOWN');
  }

  function monthlyRatePct(contract) {
    if (!contract) return 0;
    if (Number(contract.annualInterestRate) > 0) return Number(contract.annualInterestRate) / 12;
    var rate = Math.max(0, Number(contract.interestRate) || 0);
    var period = String(contract.interestRatePeriod || contract.ratePeriod || 'legacy_monthly').toLowerCase();
    return period === 'annual' || period === 'yearly' || period === 'apr' ? rate / 12 : rate;
  }

  function fundingCostRow(contract) {
    var result = { knownInterest: 0, estimatedInterest: 0, fee: 0, unknown: false };
    if (!contract || contract.type !== 'payable') return result;

    var rate = monthlyRatePct(contract);
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
    var rollover = debtCalendar(data, 30).filter(function (row) { return row.type === 'control'; })
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
    var book = D.cashflowLendingBook(data) || {};
    var funding = fundingCostSummary(data);
    var bridge = D.cashflowBridge(data, 30) || {};
    var debt = debtCalendar(data, 30);
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

  function budgetSummary(data, ym) {
    ym = ym || monthKey(D.today());
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
      plannedNext30: Math.max(0, Number(D.cashflowBridge(data, 30).plannedExpenses) || 0),
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

  function recurringIncomeRow(data) {
    var rows = (data.recurringIncomes || []).filter(function (row) {
      return row && !row.archived && row.frequency === 'monthly';
    });
    return rows.filter(function (row) { return row.type === 'employment_income'; })[0] || rows[0] || null;
  }

  function recurringAmountForMonth(income, ym) {
    if (!income) return 0;
    var overrides = income.monthlyOverrides && typeof income.monthlyOverrides === 'object' ? income.monthlyOverrides : {};
    if (overrides[ym] !== undefined && overrides[ym] !== null && overrides[ym] !== '') return Math.max(0, Number(overrides[ym]) || 0);
    return Math.max(0, Number(income.expectedAmount) || 0);
  }

  function incomePlanSummary(data, ym) {
    ym = ym || monthKey(D.today());
    var income = recurringIncomeRow(data);
    var amount = recurringAmountForMonth(income, ym);
    return {
      id: income && income.id || null,
      name: income && income.name || 'Lương',
      month: ym,
      defaultAmount: income ? Math.max(0, Number(income.expectedAmount) || 0) : 0,
      plannedAmount: amount,
      hasOverride: Boolean(income && income.monthlyOverrides && income.monthlyOverrides[ym] !== undefined),
      paymentDay: income && Number(income.paymentDay) > 0 ? Math.max(1, Math.min(31, Number(income.paymentDay))) : null,
      confidence: income && income.amountCertainty || 'EXPECTED'
    };
  }

  function recurringIncomeEvents(data, start, end, mode) {
    var rows = (data.recurringIncomes || []).filter(function (row) {
      return row && !row.archived && row.frequency === 'monthly' && Number(row.paymentDay) > 0;
    });
    var events = [];
    var ym = monthKey(start);
    var endMonth = monthKey(end);
    var guard = 0;
    while (ym <= endMonth && guard < 24) {
      rows.forEach(function (income) {
        var amount = recurringAmountForMonth(income, ym);
        if (!(amount > 0)) return;
        var confidence = String(income.amountCertainty || 'EXPECTED').toUpperCase();
        var allowed = mode === 'full' || mode === 'expected' && confidence !== 'UNKNOWN' && confidence !== 'UNCERTAIN' || mode === 'confirmed' && confidence === 'CERTAIN';
        if (!allowed) return;
        var date = dateForMonthDay(ym, income.paymentDay);
        if (date < start || date > end) return;
        events.push({
          id: 'recurring-' + income.id + '-' + ym,
          date: date,
          amount: amount,
          confidence: confidence,
          name: income.name || 'Thu nhập định kỳ',
          kind: 'income',
          synthetic: true
        });
      });
      ym = nextMonth(ym);
      guard += 1;
    }
    return events;
  }

  function projectionSummary(data, days, mode) {
    data = data || {};
    days = Math.max(1, Number(days) || 30);
    mode = mode || 'confirmed';
    var start = D.today();
    var end = D.addDays(start, days);
    var projectionSettings = Object.assign({}, data.settings || {}, { forecastStartDate: start });
    var base = D.cashflowProjectionPath(data.accounts || [], data.flows || [], projectionSettings, { baseDate: start, horizonDays: days }, mode) || [];
    var recurring = recurringIncomeEvents(data, start, end, mode);
    var points = base.map(function (point) {
      var extra = recurring.reduce(function (sum, event) { return event.date <= point.date ? sum + event.amount : sum; }, 0);
      return { date: point.date, value: Number(point.value) + extra };
    });
    var currentBal = balances(data, start);
    var currentCash = Math.max(0, Number(D.totals(data.accounts || [], currentBal).liquid) || 0);
    var low = points.length ? points[0] : { date: start, value: currentCash };
    points.forEach(function (point) { if (point.value < low.value) low = point; });
    return {
      horizonDays: days,
      startDate: start,
      endDate: end,
      currentCash: currentCash,
      points: points,
      recurringEvents: recurring,
      projectedLow: Number(low.value) || 0,
      pressureDate: low.date
    };
  }

  function capitalOSCashRequirement(data, days, mode) {
    var projection = projectionSummary(data, days, mode || 'confirmed');
    var minDelta = 0;
    var pressureDate = projection.startDate;
    projection.points.forEach(function (point) {
      var delta = Number(point.value) - projection.currentCash;
      if (delta < minDelta) { minDelta = delta; pressureDate = point.date; }
    });
    var treasury = D.cashflowTreasurySummary(data, { days: days });
    var explain = treasury.explanation || {};
    var undated = Math.max(0, Number(explain.undatedNeed) || 0);
    var rollover = Math.max(0, Number(explain.rolloverNeed) || 0);
    var datedNeed = Math.max(0, -minDelta);
    return {
      datedNeed: datedNeed,
      undatedNeed: undated,
      rolloverNeed: rollover,
      minimumRequiredCash: datedNeed + undated + rollover,
      pressureDate: pressureDate,
      projection: projection
    };
  }

  function livingPlanSummary(data, ym, operating) {
    ym = ym || monthKey(D.today());
    var settings = settingsOf(data);
    var targets = settings.monthlyLivingTargets && typeof settings.monthlyLivingTargets === 'object' ? settings.monthlyLivingTargets : {};
    var budget = budgetSummary(data, ym);
    var fallback = Math.max(0, Number(settings.defaultLivingTarget) || 0);
    if (!(fallback > 0) && budget.hasPlan) fallback = budget.planned;
    var target = targets[ym] !== undefined && targets[ym] !== null ? Math.max(0, Number(targets[ym]) || 0) : fallback;
    var spent = Math.max(0, Number(budget.personalSpent) || 0);
    var remaining = Math.max(0, target - spent);
    var scheduled = operating && operating.treasury && operating.treasury.bridge ? Math.max(0, Number(operating.treasury.bridge.plannedExpenses) || 0) : 0;
    return {
      month: ym,
      defaultTarget: Math.max(0, Number(settings.defaultLivingTarget) || 0),
      target: target,
      hasOverride: targets[ym] !== undefined,
      spent: spent,
      remaining: remaining,
      scheduledFutureExpenses: scheduled,
      unscheduledReserve: Math.max(0, remaining - scheduled)
    };
  }

  function operatingSummary(data, days) {
    data = data || {};
    days = Math.max(1, Number(days) || 30);
    var requirement = capitalOSCashRequirement(data, days, 'confirmed');
    var expectedRequirement = capitalOSCashRequirement(data, days, 'expected');
    var treasury = D.cashflowTreasurySummary(data, { days: days });
    var current = requirement.projection.currentCash;
    var reserve = Math.max(0, Number(settingsOf(data).operatingBuffer) || 0);
    var required = requirement.minimumRequiredCash;
    var recommended = required + reserve;
    var available = Math.max(0, current - recommended);
    var shell = { treasury: treasury };
    var living = livingPlanSummary(data, monthKey(D.today()), shell);
    var deployable = Math.max(0, available - living.unscheduledReserve);
    var status = current < required ? 'SHORTFALL' : current < recommended ? 'THIN_BUFFER' : 'SAFE';
    return {
      horizonDays: days,
      currentCash: current,
      requiredCash: required,
      expectedRequiredCash: expectedRequirement.minimumRequiredCash,
      safetyReserve: reserve,
      recommendedCash: recommended,
      availableCash: available,
      living: living,
      deployableCapital: deployable,
      projectedLow: requirement.projection.projectedLow,
      pressureDate: requirement.pressureDate,
      status: status,
      requirement: requirement,
      expectedRequirement: expectedRequirement,
      treasury: treasury
    };
  }

  function debtHealth(data) {
    var operating = operatingSummary(data, 30);
    var structure = debtStructure(data);
    var calendar = debtCalendar(data, 30);
    var due30 = calendar.reduce(function (sum, row) { return sum + Math.max(0, Number(row.total) || 0); }, 0);
    var exact = calendar.filter(function (row) { return validDate(row.date); });
    var nextDue = exact.length ? exact[0].date : null;
    var reliable = Math.max(0, Number(operating.treasury.bridge && operating.treasury.bridge.reliableInflows) || 0);
    var availableBeforeDebt = operating.currentCash + reliable;
    var afterDebt = availableBeforeDebt - due30;
    return {
      shortDebt: structure.shortDebt,
      longDebt: structure.longDebt,
      unknownDebt: structure.unknownDebt,
      totalDebt: structure.shortDebt + structure.longDebt + structure.unknownDebt,
      due30: due30,
      nextDueDate: nextDue,
      currentCash: operating.currentCash,
      reliableInflows30: reliable,
      availableBeforeDebt: availableBeforeDebt,
      cashAfterDebt30: afterDebt,
      minimumRequiredCash: operating.requiredCash,
      recommendedCashToKeep: operating.recommendedCash,
      paymentShortfall: Math.max(0, operating.requiredCash - operating.currentCash),
      bufferGap: Math.max(0, operating.recommendedCash - operating.currentCash),
      canCoverDebt30: afterDebt >= 0,
      hasOperatingBuffer: operating.currentCash >= operating.recommendedCash,
      pressureDate: operating.pressureDate,
      projectedLow: operating.projectedLow,
      calendar: calendar,
      status: operating.status === 'SHORTFALL' || afterDebt < 0 ? 'SHORTFALL' : operating.status === 'THIN_BUFFER' ? 'THIN_BUFFER' : 'COVERED'
    };
  }

  function latestStatementByAccount(data) {
    var map = {};
    (data.statements || []).forEach(function (row) {
      if (!row || !row.creditCardAccountId) return;
      var current = map[row.creditCardAccountId];
      var key = String(row.statementDate || row.statementMonth || '');
      var old = current ? String(current.statementDate || current.statementMonth || '') : '';
      if (!current || key > old) map[row.creditCardAccountId] = row;
    });
    return map;
  }

  function capitalSummary(data) {
    data = data || {};
    var today = D.today();
    var bal = balances(data, today);
    var bs = balanceSheetSummary(data);
    var business = businessSummary(data);
    var budget = budgetSummary(data);
    var payableByAccount = contractsByAccount(data, 'payable');
    var statementByAccount = latestStatementByAccount(data);
    var positions = [];

    activeContracts(data, 'receivable').forEach(function (contract) {
      var value = Math.max(0, Number(contract.currentOutstanding != null ? contract.currentOutstanding : contract.originalPrincipal) || 0);
      positions.push({
        id: contract.id,
        kind: 'lending',
        name: contract.counterpartyName || 'Khoản cho vay',
        value: value,
        recurringIncome: contract.interestFrequency === 'monthly' && contract.interestMode === 'fixed' ? Math.max(0, Number(contract.fixedInterest) || 0) : 0,
        nextDate: contract.firstPaymentDate || contract.maturityDate || null,
        status: contract.status || 'active'
      });
    });

    (data.accounts || []).forEach(function (account) {
      if (!account || account.archived) return;
      var value = Math.max(0, Number(bal[account.id]) || 0);
      if (D.isInvestment(account)) positions.push({ id: account.id, kind: 'investment', name: account.name || 'Đầu tư', value: value, recurringIncome: 0, nextDate: null, status: 'active' });
      else if (D.isFixedAsset(account)) positions.push({ id: account.id, kind: 'asset', name: account.name || 'Tài sản', value: value, recurringIncome: 0, nextDate: null, status: 'active' });
    });
    positions.sort(function (a, b) { return b.value - a.value; });

    var fundingSources = [];
    (data.accounts || []).forEach(function (account) {
      if (!account || account.archived || !D.isLiability(account)) return;
      var amount = Math.max(0, Number(bal[account.id]) || 0);
      if (!(amount > 0)) return;
      var contracts = payableByAccount[account.id] || [];
      var contract = contracts[0] || null;
      var statement = statementByAccount[account.id] || null;
      var kind = account.type === 'credit_card' ? 'credit_card' : String(account.fundingKind || contract && contract.fundingKind || '').toLowerCase() === 'agent' ? 'agent' : 'loan';
      var rate = contract ? Math.max(0, Number(contract.annualInterestRate) || Number(contract.interestRate) || 0) : 0;
      var ratePeriod = contract && Number(contract.annualInterestRate) > 0 ? 'annual' : contract && String(contract.interestRatePeriod || contract.ratePeriod || 'legacy_monthly');
      fundingSources.push({
        id: account.id,
        kind: kind,
        name: account.name || contract && contract.counterpartyName || 'Nguồn vốn',
        balance: amount,
        creditLimit: Math.max(0, Number(account.creditLimit) || 0),
        revolvingBalance: Math.max(0, Number(account.revolvingBalance) || 0),
        installmentBalance: Math.max(0, Number(account.installmentBalance) || 0),
        statementDate: statement && statement.statementDate || null,
        dueDate: statement && statement.dueDate || null,
        statementDay: Number(account.statementDay) || (statement && validDate(statement.statementDate) ? Number(String(statement.statementDate).slice(8, 10)) || null : null),
        dueDay: Number(account.dueDay) || (statement && validDate(statement.dueDate) ? Number(String(statement.dueDate).slice(8, 10)) || null : null),
        maxInterestFreeDays: Math.max(0, Number(account.maxInterestFreeDays || account.interestFreeDays) || 0),
        rolloverFeeRate: Math.max(0, Number(account.rolloverPlanningRate) || Number(data.controlAssumptions && data.controlAssumptions.creditCardRolloverCostRateMonthly) || 0),
        originalPrincipal: contract ? Math.max(0, Number(contract.originalPrincipal) || 0) : amount,
        currentOutstanding: contract ? Math.max(0, Number(contract.currentOutstanding != null ? contract.currentOutstanding : amount) || 0) : amount,
        startDate: contract && contract.startDate || null,
        maturityDate: contract && contract.maturityDate || null,
        paymentDay: contract && contract.firstPaymentDate && validDate(contract.firstPaymentDate) ? Number(String(contract.firstPaymentDate).slice(8, 10)) : null,
        interestRate: rate,
        interestRatePeriod: ratePeriod,
        actualInterestMethod: contract && contract.actualInterestMethod || null,
        monthlyPrincipal: contract ? Math.max(0, Number(contract.monthlyPrincipal) || 0) : 0,
        monthlyPayment: contract ? Math.max(0, Number(contract.monthlyPayment) || 0) : 0
      });
    });
    fundingSources.sort(function (a, b) { return b.balance - a.balance; });

    return {
      totalManagedCapital: bs.totalAssets,
      earningCapital: bs.receivables + bs.investments,
      cash: bs.liquid,
      personalSpendThisMonth: budget.personalSpent,
      positions: positions,
      fundingSources: fundingSources,
      capitalIncomeMonthly: business.recurringLendingIncome,
      fundingCostMonthly: business.planningFundingCostMonthly,
      netCapitalIncomeMonthly: business.netMonthlyProfitEstimate
    };
  }

  function futureEvents(data, days) {
    data = data || {};
    days = Math.max(1, Number(days) || 30);
    var start = D.today();
    var end = D.addDays(start, days);
    var accMap = D.byId(data.accounts || []);
    var events = [];

    live(data.flows).forEach(function (flow) {
      if (flow.confirmed || !validDate(flow.date) || flow.date < start || flow.date > end) return;
      if (flow.affectsProjectedCash === false || flow.cashflowPhase === 'history' || flow.alreadyReflectedInSnapshot === true) return;
      var delta = D.liquidDelta(flow, accMap);
      if (!delta) return;
      events.push({
        id: flow.id,
        date: flow.date,
        amount: delta,
        kind: flow.kind,
        name: flow.counterpartyName || flow.note || flow.category || (delta > 0 ? 'Tiền vào' : 'Tiền ra'),
        confidence: D.confidenceOf(flow),
        synthetic: false
      });
    });

    recurringIncomeEvents(data, start, end, 'full').forEach(function (event) {
      var duplicate = events.some(function (row) { return row.date === event.date && row.amount > 0 && String(row.name).toLowerCase() === String(event.name).toLowerCase(); });
      if (!duplicate) events.push(event);
    });

    events.sort(function (a, b) {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return b.amount - a.amount;
    });
    return events;
  }

  function finalSummary(data) {
    data = data || {};
    var balanceSheet = balanceSheetSummary(data);
    var debt = debtHealth(data);
    var business = businessSummary(data);
    var budget = budgetSummary(data);
    var investments = investmentSummary(data);
    var operating = operatingSummary(data, 30);
    var capital = capitalSummary(data);
    var incomePlan = incomePlanSummary(data);
    var overall = operating.status;
    if (business.status === 'LOSS') overall = operating.status === 'SAFE' ? 'LOSS' : operating.status;
    return {
      balanceSheet: balanceSheet,
      debt: debt,
      business: business,
      budget: budget,
      investments: investments,
      treasury: operating.treasury,
      operating: operating,
      capital: capital,
      incomePlan: incomePlan,
      upcoming: futureEvents(data, 30),
      deployableAfterBuffer: operating.deployableCapital,
      overallStatus: overall
    };
  }

  D.capitalBalanceSheetSummary = balanceSheetSummary;
  D.capitalDebtStructure = debtStructure;
  D.capitalDebtCalendar = debtCalendar;
  D.capitalDebtHealth = debtHealth;
  D.capitalFundingCostSummary = fundingCostSummary;
  D.capitalBusinessSummary = businessSummary;
  D.capitalBudgetSummary = budgetSummary;
  D.capitalInvestmentSummary = investmentSummary;
  D.incomePlanSummary = incomePlanSummary;
  D.capitalProjectionSummary = projectionSummary;
  D.capitalCashRequirement = capitalOSCashRequirement;
  D.livingPlanSummary = livingPlanSummary;
  D.operatingSummary = operatingSummary;
  D.capitalSummary = capitalSummary;
  D.futureEvents = futureEvents;
  D.finalSummary = finalSummary;
  D.capitalDomainReady = true;
})(window);
