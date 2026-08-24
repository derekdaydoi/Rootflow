/* Rootflow V3 — explainable treasury extensions.
   Additive layer: keeps the V2 ledger intact while fixing snapshot semantics
   and exposing human-readable cash requirements, obligations and funding links. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  if (!D) return;

  var originalBalances = D.balances;
  var originalLiquidityModel = D.liquidityModel;
  var originalControlMetrics = D.controlMetrics;

  function live(rows) {
    return (rows || []).filter(function (row) { return row && !row.deletedAt; });
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
  }

  function balanceSemantics(account) {
    var explicit = String(account && account.balanceSemantics || '');
    if (explicit === 'closing_snapshot' || explicit === 'opening_balance') return explicit;
    /* Preserve legacy behavior for old backups. */
    if (D.isLiquid(account)) return 'opening_balance';
    return Math.abs(Number(account && account.openingBalance) || 0) > 0 ? 'closing_snapshot' : 'opening_balance';
  }

  function accountAsOf(account) {
    var value = String(account && account.balanceAsOf || '').slice(0, 10);
    return validDate(value) ? value : null;
  }

  function effectAfterBaselineV3(flow, account) {
    var asOf = accountAsOf(account);
    if (!asOf) return true;
    var date = String(flow && flow.date || '');
    if (flow && flow.alreadyReflectedInSnapshot === true && date <= asOf) return false;
    return balanceSemantics(account) === 'closing_snapshot' ? date > asOf : date >= asOf;
  }

  function balancesV3(accounts, flows, opts) {
    opts = opts || {};
    var accMap = D.byId(accounts || []);
    var out = {};
    (accounts || []).forEach(function (account) {
      var asOf = accountAsOf(account);
      out[account.id] = opts.upto && asOf && opts.upto < asOf ? 0 : (Number(account.openingBalance) || 0);
    });

    live(flows).forEach(function (flow) {
      if (!flow.confirmed && !opts.includeExpected) return;
      if (flow.skipped) return;
      if (opts.upto && flow.date > opts.upto) return;
      D.effects(flow, accMap).forEach(function (effect) {
        if (out[effect.accountId] === undefined) return;
        var target = accMap[effect.accountId];
        if (!effectAfterBaselineV3(flow, target)) return;
        out[effect.accountId] += effect.delta;
      });
    });
    return out;
  }

  function forecastStart(settings, fallback) {
    settings = settings || {};
    var configured = settings.forecastStartDate;
    if (validDate(configured)) return configured;
    if (validDate(fallback)) return fallback;
    return D.today();
  }

  function snapshotDate(settings) {
    settings = settings || {};
    return validDate(settings.snapshotDate) ? settings.snapshotDate : null;
  }

  function projectedDelta(flow, accMap) {
    if (!flow || flow.affectsProjectedCash === false) return 0;
    if (Number.isFinite(Number(flow.forecastCashImpact))) return Number(flow.forecastCashImpact) || 0;
    return D.liquidDelta(flow, accMap);
  }

  function includeProjectedFlow(flow, settings) {
    if (!flow || flow.skipped || flow.confirmed) return false;
    if (flow.affectsProjectedCash === false || flow.cashflowPhase === 'history' || flow.alreadyReflectedInSnapshot === true) return false;
    var cut = snapshotDate(settings);
    if (cut && String(flow.date || '') <= cut && settings.ignoreHistoricalFlowsForProjection) return false;
    return true;
  }

  function allowedInflow(flow, mode) {
    var confidence = D.confidenceOf(flow);
    if (mode === 'full') return true;
    if (mode === 'expected') return confidence !== 'UNCERTAIN' && confidence !== 'UNKNOWN';
    return confidence === 'CERTAIN';
  }

  function projectionRows(accounts, flows, settings, opts, mode) {
    settings = settings || {};
    opts = opts || {};
    var start = forecastStart(settings, opts.baseDate);
    var days = Math.max(1, Number(opts.horizonDays || settings.horizonDays) || 90);
    var end = D.addDays(start, days);
    var accMap = D.byId(accounts || []);
    var currentBal = balancesV3(accounts || [], flows || [], { upto: start });
    var current = D.totals(accounts || [], currentBal).liquid + (Number(opts.initialAdjustment) || 0);
    var planned = live(flows).filter(function (flow) {
      if (!includeProjectedFlow(flow, settings)) return false;
      if (!validDate(flow.date) || flow.date > end) return false;
      var delta = projectedDelta(flow, accMap);
      if (delta <= 0) return true;
      return allowedInflow(flow, mode);
    }).map(function (flow) {
      return { flow: flow, delta: projectedDelta(flow, accMap) };
    }).sort(function (a, b) {
      return String(a.flow.date || '').localeCompare(String(b.flow.date || ''));
    });
    return { start: start, days: days, end: end, current: current, rows: planned };
  }

  function projectionPathV3(accounts, flows, settings, opts, mode) {
    var setup = projectionRows(accounts, flows, settings, opts, mode);
    var points = [];
    var running = setup.current;
    var idx = 0;
    for (var i = 0; i <= setup.days; i++) {
      var date = D.addDays(setup.start, i);
      while (idx < setup.rows.length && String(setup.rows[idx].flow.date || '') <= date) {
        running += setup.rows[idx].delta;
        idx++;
      }
      points.push({ date: date, value: running });
    }
    return points;
  }

  function lowest(points) {
    var low = points[0] || { date: D.today(), value: 0 };
    for (var i = 1; i < points.length; i++) if (points[i].value < low.value) low = points[i];
    return low;
  }

  function liquidityModelV3(accounts, flows, settings, opts) {
    settings = settings || {};
    opts = opts || {};
    var start = forecastStart(settings, opts.baseDate);
    var config = {
      baseDate: start,
      horizonDays: Number(opts.horizonDays || settings.horizonDays) || 90,
      initialAdjustment: Number(opts.initialAdjustment) || 0
    };
    var hard = Math.max(0, Number(settings.hardFloor != null ? settings.hardFloor : settings.reserveFloor) || 0);
    var operating = Math.max(hard, Number(settings.operatingBuffer) || hard);
    var comfort = Math.max(operating, Number(settings.comfortBuffer) || operating);
    var confirmedPoints = projectionPathV3(accounts, flows, settings, config, 'confirmed');
    var expectedPoints = projectionPathV3(accounts, flows, settings, config, 'expected');
    var allPoints = projectionPathV3(accounts, flows, settings, config, 'full');
    var confirmedLow = lowest(confirmedPoints);
    var expectedLow = lowest(expectedPoints);
    var state = D.liquidityStatus(confirmedLow.value, hard, operating);
    var expectedState = D.liquidityStatus(expectedLow.value, hard, operating);
    var zeroPoint = null;
    for (var i = 0; i < confirmedPoints.length; i++) {
      if (confirmedPoints[i].value <= 0) { zeroPoint = confirmedPoints[i]; break; }
    }
    return {
      points: confirmedPoints,
      expectedPoints: expectedPoints,
      allPoints: allPoints,
      current: confirmedPoints[0] ? confirmedPoints[0].value : 0,
      projectedLow: confirmedLow.value,
      pressurePointDate: confirmedLow.date,
      expectedLow: expectedLow.value,
      expectedPressureDate: expectedLow.date,
      hardFloor: hard,
      operatingBuffer: operating,
      comfortBuffer: comfort,
      liquidityBuffer: state.liquidityBuffer,
      operatingHeadroom: state.operatingHeadroom,
      status: state.status,
      expectedStatus: expectedState.status,
      dependsOnExpected: expectedLow.value > confirmedLow.value,
      safeDeployableNow: Math.max(0, confirmedLow.value - hard),
      operatingDeployableNow: Math.max(0, confirmedLow.value - operating),
      runwayDays: zeroPoint ? Math.max(0, D.diffDays(start, zeroPoint.date)) : config.horizonDays,
      runwayCapped: !zeroPoint,
      horizonDays: config.horizonDays,
      forecastStartDate: start,
      snapshotSemanticsApplied: true
    };
  }

  function activeContracts(data, type) {
    return (data.contracts || []).filter(function (contract) {
      return contract && contract.status !== 'closed' && (!type || contract.type === type);
    });
  }

  function contractMonthlyObligation(contract) {
    if (!contract || contract.type !== 'payable') return { principal: 0, interest: 0, fee: 0, total: 0 };
    var principal = Math.max(0, Number(contract.monthlyPrincipal) || 0);
    var interest = Math.max(0, Number(contract.monthlyInterestAmount) || 0);
    if (!interest && contract.actualInterestMethod === 'flat') {
      interest = Math.round(Math.max(0, Number(contract.originalPrincipal) || 0) * Math.max(0, Number(contract.interestRate) || 0) / 100);
    }
    var total = Math.max(0, Number(contract.monthlyPayment) || 0);
    if (!total) total = principal + interest;
    var fee = contract.feeFrequency === 'per_period' ? Math.max(0, Number(contract.feeAmount) || 0) : 0;
    return { principal: principal, interest: interest, fee: fee, total: total + fee };
  }

  function revolvingExposure(data, bal) {
    return (data.accounts || []).reduce(function (sum, account) {
      if (!account || account.archived || account.type !== 'credit_card') return sum;
      var current = Math.max(0, Number(bal && bal[account.id]) || Number(account.openingBalance) || 0);
      var installment = Math.max(0, Number(account.installmentBalance) || 0);
      var explicit = account.revolvingBalance;
      return sum + Math.min(current, explicit === undefined || explicit === null ? Math.max(0, current - installment) : Math.max(0, Number(explicit) || 0));
    }, 0);
  }

  function monthlyRolloverCost(data, bal) {
    var rate = Math.max(0, Number(data.controlAssumptions && data.controlAssumptions.creditCardRolloverCostRateMonthly) || 0);
    return Math.round(revolvingExposure(data, bal) * rate / 100);
  }

  function datedRows(data, days) {
    var settings = data.settings || {};
    var start = forecastStart(settings);
    var end = D.addDays(start, Math.max(1, Number(days) || 30));
    var accMap = D.byId(data.accounts || []);
    return live(data.flows).filter(function (flow) {
      return includeProjectedFlow(flow, settings) && validDate(flow.date) && flow.date >= start && flow.date <= end;
    }).map(function (flow) {
      return { flow: flow, delta: projectedDelta(flow, accMap) };
    }).filter(function (row) { return row.delta !== 0; });
  }

  function undatedObligations(data, days) {
    var start = forecastStart(data.settings || {});
    var end = D.addDays(start, Math.max(1, Number(days) || 30));
    var futureRepayContracts = {};
    live(data.flows).forEach(function (flow) {
      if (flow.kind === 'repay' && !flow.confirmed && !flow.skipped && validDate(flow.date) && flow.date >= start && flow.date <= end) futureRepayContracts[flow.contractId] = true;
    });
    var rows = [];
    activeContracts(data, 'payable').forEach(function (contract) {
      if (!contract.undatedMonthlyObligation || futureRepayContracts[contract.id]) return;
      var obligation = contractMonthlyObligation(contract);
      var oneTimeFee = contract.feeFrequency === 'one_time' && !contract.feePaid && !contract.feeDueDate ? Math.max(0, Number(contract.feeAmount) || 0) : 0;
      if (!(obligation.total > 0 || oneTimeFee > 0)) return;
      rows.push({
        id: 'undated-' + contract.id,
        date: null,
        datePrecision: 'month',
        type: 'debt',
        contractId: contract.id,
        name: contract.counterpartyName || 'Khoản trả góp',
        principal: obligation.principal,
        interest: obligation.interest,
        fee: obligation.fee + oneTimeFee,
        total: obligation.total + oneTimeFee,
        certainty: contract.confidence || 'EXPECTED',
        note: 'Nghĩa vụ tháng; chưa có ngày đến hạn chính xác.'
      });
    });
    return rows;
  }

  function debtCalendar(data, days) {
    var horizon = Math.max(1, Number(days) || 30);
    var rows = [];
    datedRows(data, horizon).forEach(function (row) {
      var flow = row.flow;
      if (row.delta >= 0) return;
      var principal = flow.kind === 'repay' ? D.repayPrincipal(flow) : 0;
      var interest = flow.kind === 'repay' ? D.repayInterest(flow) : flow.kind === 'interest_out' ? Math.abs(Number(flow.amount) || 0) : 0;
      var fee = flow.kind === 'repay' ? D.repayFee(flow) : flow.kind === 'fee' ? Math.abs(Number(flow.amount) || 0) : 0;
      rows.push({
        id: flow.id,
        date: flow.date,
        datePrecision: 'exact',
        type: 'debt',
        contractId: flow.contractId || null,
        name: flow.counterpartyName || flow.note || flow.category || 'Nghĩa vụ',
        principal: principal,
        interest: interest,
        fee: fee,
        total: Math.abs(row.delta),
        certainty: D.confidenceOf(flow),
        note: flow.note || ''
      });
    });
    rows = rows.concat(undatedObligations(data, horizon));

    var bal = balancesV3(data.accounts || [], data.flows || []);
    var rollover = monthlyRolloverCost(data, bal);
    if (rollover > 0) rows.push({
      id: 'control-rollover', date: null, datePrecision: 'month', type: 'control', contractId: null,
      name: 'Chi phí đáo thẻ ước tính', principal: 0, interest: 0, fee: 0, rollover: rollover,
      total: rollover, certainty: 'CONTROL', note: 'Giả định kiểm soát; chỉ áp trên dư nợ revolving.'
    });

    rows.sort(function (a, b) {
      if (!a.date && !b.date) return String(a.name).localeCompare(String(b.name));
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
    return rows;
  }

  function recurringIncomeMonthly(data) {
    return (data.recurringIncomes || []).reduce(function (sum, income) {
      if (!income || income.archived || income.frequency !== 'monthly') return sum;
      return sum + Math.max(0, Number(income.expectedAmount) || 0);
    }, 0);
  }

  function cashBridge(data, days) {
    var rows = datedRows(data, days);
    var bridge = {
      reliableInflows: 0, expectedInflows: 0, uncertainInflows: 0,
      principalCollected: 0, lendingInterest: 0, borrowingProceeds: 0,
      mandatoryOutflows: 0, debtPrincipal: 0, debtInterest: 0, debtFees: 0,
      newLending: 0, plannedExpenses: 0,
      undatedDebt: 0, rolloverCost: 0, recurringIncomeExpected: recurringIncomeMonthly(data)
    };
    rows.forEach(function (row) {
      var flow = row.flow;
      var delta = row.delta;
      if (delta > 0) {
        var confidence = D.confidenceOf(flow);
        if (confidence === 'CERTAIN') bridge.reliableInflows += delta;
        else if (confidence === 'EXPECTED' || confidence === 'INFERRED') bridge.expectedInflows += delta;
        else bridge.uncertainInflows += delta;
        if (flow.kind === 'collect') {
          bridge.principalCollected += D.collectPrincipal(flow);
          bridge.lendingInterest += D.collectInterest(flow);
        }
        if (flow.kind === 'borrow') bridge.borrowingProceeds += delta;
      } else if (delta < 0) {
        var out = Math.abs(delta);
        bridge.mandatoryOutflows += out;
        if (flow.kind === 'repay') {
          bridge.debtPrincipal += D.repayPrincipal(flow);
          bridge.debtInterest += D.repayInterest(flow);
          bridge.debtFees += D.repayFee(flow);
        } else if (flow.kind === 'lend') bridge.newLending += out;
        else if (flow.kind === 'expense') bridge.plannedExpenses += out;
        else if (flow.kind === 'interest_out') bridge.debtInterest += out;
        else if (flow.kind === 'fee') bridge.debtFees += out;
      }
    });
    var debtRows = undatedObligations(data, days);
    bridge.undatedDebt = debtRows.reduce(function (sum, row) { return sum + row.total; }, 0);
    var bal = balancesV3(data.accounts || [], data.flows || []);
    bridge.rolloverCost = monthlyRolloverCost(data, bal);
    return bridge;
  }

  function cashRequirement(data, days, mode) {
    var settings = data.settings || {};
    var horizon = Math.max(1, Number(days) || 30);
    var setup = projectionRows(data.accounts || [], data.flows || [], settings, { horizonDays: horizon }, mode || 'confirmed');
    var running = 0;
    var minimum = 0;
    var pressureDate = setup.start;
    setup.rows.forEach(function (row) {
      running += row.delta;
      if (running < minimum) {
        minimum = running;
        pressureDate = row.flow.date || pressureDate;
      }
    });
    var undated = undatedObligations(data, horizon).reduce(function (sum, row) { return sum + row.total; }, 0);
    var bal = balancesV3(data.accounts || [], data.flows || []);
    var rollover = monthlyRolloverCost(data, bal);
    return {
      requiredForDatedTimeline: Math.max(0, -minimum),
      undatedObligations: undated,
      rolloverCost: rollover,
      minimumRequiredCash: Math.max(0, -minimum) + undated + rollover,
      pressureDate: pressureDate
    };
  }

  function fundingMap(data) {
    var contracts = activeContracts(data);
    var byContract = {};
    contracts.forEach(function (contract) { byContract[contract.id] = contract; });
    var links = [];
    contracts.forEach(function (contract) {
      if (contract.type !== 'receivable') return;
      var allocations = Array.isArray(contract.fundingAllocations) ? contract.fundingAllocations : [];
      if (contract.fundingContractId && !allocations.length) allocations = [{ fundingContractId: contract.fundingContractId, amount: contract.currentOutstanding || contract.originalPrincipal }];
      allocations.forEach(function (allocation) {
        var funding = byContract[allocation.fundingContractId];
        links.push({
          receivableContractId: contract.id,
          receivableName: contract.counterpartyName || 'Khoản cho vay',
          receivablePrincipal: Math.max(0, Number(contract.currentOutstanding != null ? contract.currentOutstanding : contract.originalPrincipal) || 0),
          fundingContractId: allocation.fundingContractId || null,
          fundingName: funding ? funding.counterpartyName : 'Nguồn vốn vay',
          fundingPrincipal: Math.max(0, Number(allocation.amount) || 0),
          maturityDate: contract.maturityDate || null
        });
      });
    });
    return links;
  }

  function lendingBook(data) {
    var principal = 0, longTerm = 0, monthlyInterest = 0;
    activeContracts(data, 'receivable').forEach(function (contract) {
      var outstanding = Math.max(0, Number(contract.currentOutstanding != null ? contract.currentOutstanding : contract.originalPrincipal) || 0);
      principal += outstanding;
      if (contract.maturityType === 'planning_placeholder' || contract.repaymentMode === 'interest_only') longTerm += outstanding;
      if (contract.interestFrequency === 'monthly' && contract.interestMode === 'fixed') monthlyInterest += Math.max(0, Number(contract.fixedInterest) || 0);
    });
    return { totalPrincipal: principal, longTermPrincipal: longTerm, monthlyInterest: monthlyInterest };
  }

  function treasurySummary(data, opts) {
    data = data || {};
    opts = opts || {};
    var days = Math.max(1, Number(opts.days) || 30);
    var bal = balancesV3(data.accounts || [], data.flows || []);
    var totals = D.totals(data.accounts || [], bal);
    var conservative = cashRequirement(data, days, 'confirmed');
    var expected = cashRequirement(data, days, 'expected');
    var operatingReserve = Math.max(0, Number(data.settings && data.settings.operatingBuffer) || 0);
    var recommended = conservative.minimumRequiredCash + operatingReserve;
    var bridge = cashBridge(data, days);
    var liquidity = liquidityModelV3(data.accounts || [], data.flows || [], data.settings || {}, { horizonDays: days });
    return {
      horizonDays: days,
      currentCash: totals.liquid,
      snapshotDate: data.settings && data.settings.snapshotDate || null,
      forecastStartDate: forecastStart(data.settings || {}),
      minimumRequiredCash: conservative.minimumRequiredCash,
      expectedMinimumRequiredCash: expected.minimumRequiredCash,
      operatingReserve: operatingReserve,
      recommendedCashToKeep: recommended,
      additionalCashNeeded: Math.max(0, recommended - totals.liquid),
      surplusAboveRecommended: Math.max(0, totals.liquid - recommended),
      pressureDate: conservative.pressureDate || liquidity.pressurePointDate,
      projectedLow: liquidity.projectedLow,
      expectedLow: liquidity.expectedLow,
      bridge: bridge,
      debtCalendar: debtCalendar(data, days),
      lendingBook: lendingBook(data),
      fundingLinks: fundingMap(data),
      totalDebt: totals.liability,
      totalReceivables: totals.receivable,
      explanation: {
        datedNeed: conservative.requiredForDatedTimeline,
        undatedNeed: conservative.undatedObligations,
        rolloverNeed: conservative.rolloverCost,
        reliableInflows: bridge.reliableInflows,
        expectedInflows: bridge.expectedInflows + bridge.recurringIncomeExpected,
        mandatoryOutflows: bridge.mandatoryOutflows
      }
    };
  }

  function controlMetricsV3(data, opts) {
    data = data || {};
    opts = opts || {};
    var baseDate = opts.baseDate || forecastStart(data.settings || {});
    var bal = balancesV3(data.accounts || [], data.flows || []);
    var total = D.totals(data.accounts || [], bal);
    var revolving = revolvingExposure(data, bal);
    var installment = (data.accounts || []).reduce(function (sum, account) {
      if (!account || account.archived || account.type !== 'credit_card') return sum;
      return sum + Math.max(0, Number(account.installmentBalance) || 0);
    }, 0);
    var bridge = cashBridge(data, 30);
    var rollover = monthlyRolloverCost(data, bal);
    var debt = debtCalendar(data, 30);
    var monthlyDebtService = debt.reduce(function (sum, row) { return sum + Math.max(0, Number(row.total) || 0); }, 0);
    var monthlyInterest = debt.reduce(function (sum, row) { return sum + Math.max(0, Number(row.interest) || 0); }, 0);
    var monthlyFees = debt.reduce(function (sum, row) { return sum + Math.max(0, Number(row.fee) || 0); }, 0);
    var book = lendingBook(data);
    var expectedIncome = recurringIncomeMonthly(data);
    var plannedExpenses = bridge.plannedExpenses;
    return {
      cashBalance: total.liquid,
      totalAssets: total.assets,
      totalReceivables: total.receivable,
      totalDebt: total.liability,
      revolvingDebt: revolving,
      installmentDebt: installment,
      monthlyDebtService: monthlyDebtService,
      monthlyInterestExpense: monthlyInterest,
      monthlyFees: monthlyFees,
      unallocatedFees: undatedObligations(data, 30).reduce(function (sum, row) { return sum + row.fee; }, 0),
      expectedMonthlyIncome: expectedIncome,
      expectedLendingInterestIncome: book.monthlyInterest,
      rolloverCostExposure: rollover,
      netExpectedMonthlyCashflow: expectedIncome + book.monthlyInterest - monthlyDebtService - plannedExpenses,
      fundingLinkedReceivables: fundingMap(data).reduce(function (sum, link) { return sum + link.receivablePrincipal; }, 0),
      liquidityByDate: projectionPathV3(data.accounts || [], data.flows || [], data.settings || {}, { baseDate: baseDate, horizonDays: Number(data.settings && data.settings.horizonDays) || 90 }, 'expected')
    };
  }

  /* Export the corrected functions without rewriting the stable V2 code. */
  D.balanceSemantics = balanceSemantics;
  D.effectAfterBaselineV3 = effectAfterBaselineV3;
  D.balancesV2 = originalBalances;
  D.balances = balancesV3;
  D.liquidityModelV2 = originalLiquidityModel;
  D.liquidityModel = liquidityModelV3;
  D.controlMetricsV2 = originalControlMetrics;
  D.controlMetrics = controlMetricsV3;
  D.v3ProjectionPath = projectionPathV3;
  D.v3DebtCalendar = debtCalendar;
  D.v3FundingMap = fundingMap;
  D.v3LendingBook = lendingBook;
  D.v3TreasurySummary = treasurySummary;
  D.v3CashBridge = cashBridge;
  D.v3CashRequirement = cashRequirement;
  D.v3UndatedObligations = undatedObligations;
  D.v3Version = '3.0-explainable';
})(window);
