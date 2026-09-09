/* Rootflow — operating policy overlay.
   Separates base-case forecasting from stress liquidity and treats EXPECTED as
   forecast variance, not automatic disappearance of cashflow. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  if (!D || !D.cashflowProjectionPath || !D.balances || !D.totals) return;

  var originalFinalSummary = D.finalSummary;
  var originalIncomePlanSummary = D.incomePlanSummary;

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
  }

  function monthKey(value) {
    return String(value || D.today()).slice(0, 7);
  }

  function daysInMonth(ym) {
    var p = String(ym).split('-');
    var y = Number(p[0]) || 1970;
    var m = Number(p[1]) || 1;
    return new Date(y, m, 0).getDate();
  }

  function dateForMonthDay(ym, day) {
    var d = Math.max(1, Math.min(daysInMonth(ym), Number(day) || 1));
    return ym + '-' + String(d).padStart(2, '0');
  }

  function nextMonth(ym) {
    var p = String(ym).split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1 + 1, 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function recurringRows(data) {
    return (data.recurringIncomes || []).filter(function (row) {
      return row && !row.archived && row.frequency === 'monthly' && Number(row.paymentDay) > 0;
    });
  }

  function overrideAmount(row, ym) {
    var overrides = row.monthlyOverrides && typeof row.monthlyOverrides === 'object' ? row.monthlyOverrides : {};
    if (overrides[ym] !== undefined && overrides[ym] !== null && overrides[ym] !== '') {
      return Math.max(0, Number(overrides[ym]) || 0);
    }
    return Math.max(0, Number(row.expectedAmount) || 0);
  }

  function guaranteedAmount(row, ym) {
    var explicit = Math.max(0, Number(row.guaranteedAmount) || 0);
    if (explicit > 0) return Math.min(explicit, overrideAmount(row, ym) || explicit);
    var certainty = String(row.amountCertainty || '').toUpperCase();
    return certainty === 'CERTAIN' ? overrideAmount(row, ym) : 0;
  }

  function recurringEvents(data, start, end, mode) {
    var events = [];
    var ym = monthKey(start);
    var endMonth = monthKey(end);
    var guard = 0;
    while (ym <= endMonth && guard < 24) {
      recurringRows(data).forEach(function (row) {
        var date = dateForMonthDay(ym, row.paymentDay);
        if (date < start || date > end) return;
        var amount = mode === 'stress' ? guaranteedAmount(row, ym) : overrideAmount(row, ym);
        if (!(amount > 0)) return;
        events.push({
          id: 'policy-income-' + row.id + '-' + ym,
          date: date,
          amount: amount,
          confidence: mode === 'stress' ? 'CERTAIN_FLOOR' : String(row.amountCertainty || 'EXPECTED').toUpperCase(),
          name: row.name || 'Thu nhập định kỳ',
          kind: 'income',
          synthetic: true
        });
      });
      ym = nextMonth(ym);
      guard += 1;
    }
    return events;
  }

  function liveProjectedFlows(data, start, end) {
    var accounts = D.byId(data.accounts || []);
    return (data.flows || []).filter(function (flow) {
      if (!flow || flow.deletedAt || flow.skipped || flow.confirmed || flow.affectsProjectedCash === false) return false;
      if (flow.cashflowPhase === 'history' || flow.alreadyReflectedInSnapshot === true) return false;
      return validDate(flow.date) && flow.date >= start && flow.date <= end;
    }).map(function (flow) {
      return { flow: flow, delta: D.liquidDelta(flow, accounts) };
    }).filter(function (row) { return row.delta !== 0; });
  }

  function delayedExpectedAdjustments(data, start, end, delayDays) {
    return liveProjectedFlows(data, start, end).filter(function (row) {
      if (row.delta <= 0) return false;
      var confidence = String(D.confidenceOf(row.flow) || '').toUpperCase();
      return confidence === 'EXPECTED' || confidence === 'INFERRED';
    }).map(function (row) {
      return {
        start: row.flow.date,
        release: D.addDays(row.flow.date, delayDays),
        amount: row.delta
      };
    });
  }

  function addRecurringToPoints(points, events) {
    return (points || []).map(function (point) {
      var extra = events.reduce(function (sum, event) {
        return event.date <= point.date ? sum + event.amount : sum;
      }, 0);
      return { date: point.date, value: Number(point.value || 0) + extra };
    });
  }

  function applyCollectionDelay(points, adjustments) {
    return (points || []).map(function (point) {
      var heldBack = adjustments.reduce(function (sum, row) {
        return row.start <= point.date && point.date < row.release ? sum + row.amount : sum;
      }, 0);
      return { date: point.date, value: Number(point.value || 0) - heldBack };
    });
  }

  function lowest(points, fallbackDate, fallbackValue) {
    var low = points && points.length ? points[0] : { date: fallbackDate, value: fallbackValue };
    (points || []).forEach(function (point) {
      if (Number(point.value) < Number(low.value)) low = point;
    });
    return { date: low.date, value: Number(low.value) || 0 };
  }

  function currentCash(data, start) {
    var bal = D.balances(data.accounts || [], data.flows || [], { upto: start });
    return Math.max(0, Number(D.totals(data.accounts || [], bal).liquid) || 0);
  }

  function projectionSummary(data, days, mode) {
    data = data || {};
    days = Math.max(1, Number(days) || 30);
    mode = mode === 'confirmed' || mode === 'stress' ? 'stress' : 'base';
    var start = D.today();
    var end = D.addDays(start, days);
    var settings = Object.assign({}, data.settings || {}, { forecastStartDate: start });
    var base = D.cashflowProjectionPath(data.accounts || [], data.flows || [], settings, {
      baseDate: start,
      horizonDays: days
    }, 'expected') || [];
    var events = recurringEvents(data, start, end, mode);
    var points = addRecurringToPoints(base, events);
    var delayDays = Math.max(1, Number(settings.collectionStressDays) || 14);
    if (mode === 'stress') {
      points = applyCollectionDelay(points, delayedExpectedAdjustments(data, start, end, delayDays));
    }
    var cash = currentCash(data, start);
    var low = lowest(points, start, cash);
    return {
      horizonDays: days,
      startDate: start,
      endDate: end,
      currentCash: cash,
      points: points,
      recurringEvents: events,
      projectedLow: low.value,
      pressureDate: low.date,
      scenario: mode,
      collectionStressDays: mode === 'stress' ? delayDays : 0
    };
  }

  function openEndedMonthlyDebt(data) {
    return (data.contracts || []).reduce(function (sum, contract) {
      if (!contract || contract.status === 'closed' || contract.type !== 'payable') return sum;
      if (contract.undatedMonthlyObligation) return sum;
      var openEnded = contract.repaymentMode === 'interest_only' && !validDate(contract.maturityDate);
      if (!openEnded || contract.interestFrequency !== 'monthly') return sum;
      var monthly = Math.max(0, Number(contract.monthlyPayment) || Number(contract.monthlyInterestAmount) || Number(contract.fixedInterest) || 0);
      return sum + monthly;
    }, 0);
  }

  function requirementFromProjection(data, days, mode) {
    var projection = projectionSummary(data, days, mode);
    var minDelta = 0;
    var pressureDate = projection.startDate;
    projection.points.forEach(function (point) {
      var delta = Number(point.value) - projection.currentCash;
      if (delta < minDelta) { minDelta = delta; pressureDate = point.date; }
    });
    var legacy = D.cashflowTreasurySummary ? D.cashflowTreasurySummary(data, { days: days }) : {};
    var explain = legacy.explanation || {};
    var undated = Math.max(0, Number(explain.undatedNeed) || 0) + openEndedMonthlyDebt(data);
    var rollover = Math.max(0, Number(explain.rolloverNeed) || 0);
    var dated = Math.max(0, -minDelta);
    return {
      datedNeed: dated,
      undatedNeed: undated,
      rolloverNeed: rollover,
      minimumRequiredCash: dated + undated + rollover,
      pressureDate: pressureDate,
      projection: projection
    };
  }

  function livingSummary(data, ym) {
    if (D.livingPlanSummary) {
      try { return D.livingPlanSummary(data, ym, { treasury: D.cashflowTreasurySummary ? D.cashflowTreasurySummary(data, { days: 30 }) : {} }); }
      catch (e) {}
    }
    return { month: ym, target: 0, spent: 0, remaining: 0, scheduledFutureExpenses: 0, unscheduledReserve: 0 };
  }

  function operatingSummary(data, days) {
    data = data || {};
    days = Math.max(1, Number(days) || 30);
    var baseRequirement = requirementFromProjection(data, days, 'base');
    var stressRequirement = requirementFromProjection(data, days, 'stress');
    var current = baseRequirement.projection.currentCash;
    var reserve = Math.max(0, Number(data.settings && data.settings.operatingBuffer) || 0);
    var recommended = baseRequirement.minimumRequiredCash + reserve;
    var available = Math.max(0, current - recommended);
    var living = livingSummary(data, monthKey(D.today()));
    var deployable = Math.max(0, available - Math.max(0, Number(living.unscheduledReserve) || 0));
    var status = current < baseRequirement.minimumRequiredCash ? 'SHORTFALL' : current < recommended ? 'THIN_BUFFER' : 'SAFE';
    var stressGap = Math.max(0, stressRequirement.minimumRequiredCash - current);
    return {
      horizonDays: days,
      currentCash: current,
      requiredCash: baseRequirement.minimumRequiredCash,
      expectedRequiredCash: baseRequirement.minimumRequiredCash,
      stressRequiredCash: stressRequirement.minimumRequiredCash,
      stressGap: stressGap,
      collectionStressDays: stressRequirement.projection.collectionStressDays,
      safetyReserve: reserve,
      recommendedCash: recommended,
      availableCash: available,
      living: living,
      deployableCapital: deployable,
      projectedLow: baseRequirement.projection.projectedLow,
      stressProjectedLow: stressRequirement.projection.projectedLow,
      pressureDate: baseRequirement.pressureDate,
      stressPressureDate: stressRequirement.pressureDate,
      status: status,
      stressStatus: stressGap > 0 ? 'SHORTFALL' : 'COVERED',
      requirement: baseRequirement,
      expectedRequirement: baseRequirement,
      stressRequirement: stressRequirement,
      treasury: D.cashflowTreasurySummary ? D.cashflowTreasurySummary(data, { days: days }) : {}
    };
  }

  function incomePlanSummary(data, ym) {
    var result = originalIncomePlanSummary ? originalIncomePlanSummary(data, ym) : {};
    ym = ym || monthKey(D.today());
    var income = recurringRows(data)[0] || null;
    if (!income) return result;
    result.guaranteedAmount = guaranteedAmount(income, ym);
    result.plannedAmount = overrideAmount(income, ym);
    result.variableAmount = Math.max(0, result.plannedAmount - result.guaranteedAmount);
    result.baseIsGuaranteed = result.guaranteedAmount > 0;
    return result;
  }

  function finalSummary(data) {
    var summary = originalFinalSummary ? originalFinalSummary(data) : {};
    summary.operating = operatingSummary(data, 30);
    summary.incomePlan = incomePlanSummary(data, monthKey(D.today()));
    summary.deployableAfterBuffer = summary.operating.deployableCapital;
    summary.overallStatus = summary.operating.status;
    if (summary.debt) {
      summary.debt.minimumRequiredCash = summary.operating.requiredCash;
      summary.debt.recommendedCashToKeep = summary.operating.recommendedCash;
      summary.debt.paymentShortfall = Math.max(0, summary.operating.requiredCash - summary.operating.currentCash);
      summary.debt.bufferGap = Math.max(0, summary.operating.recommendedCash - summary.operating.currentCash);
      summary.debt.pressureDate = summary.operating.pressureDate;
      summary.debt.projectedLow = summary.operating.projectedLow;
      summary.debt.stressGap = summary.operating.stressGap;
    }
    return summary;
  }

  D.capitalProjectionSummary = projectionSummary;
  D.capitalCashRequirement = requirementFromProjection;
  D.operatingSummary = operatingSummary;
  D.incomePlanSummary = incomePlanSummary;
  D.finalSummary = finalSummary;
  D.operatingPolicyReady = true;
})(window);
