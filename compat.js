/* Rootflow V3 — compatibility bridge for V2 UI functions that close over the
   old domain implementation. Keeps the original UI while routing exported
   decision/liquidity calls through snapshot-aware V3 semantics. */
(function (global) {
  'use strict';
  var D = global.RootflowDomain;
  if (!D || !D.v3Version) return;

  var liquidityV3 = D.liquidityModel;
  D.liquidityModel = function (accounts, flows, settings, opts) {
    var model = liquidityV3(accounts, flows, settings, opts || {});
    var actual = D.totals(accounts || [], D.balances(accounts || [], flows || [])).liquid + (Number(opts && opts.initialAdjustment) || 0);
    model.current = actual;
    return model;
  };

  D.simulateDecisionV2 = D.simulateDecision;
  D.simulateDecision = function (accounts, flows, settings, decision, opts) {
    opts = opts || {};
    var before = D.liquidityModel(accounts, flows, settings, opts);
    var afterOpts = Object.assign({}, opts, {
      initialAdjustment: (Number(opts.initialAdjustment) || 0) + D.decisionLiquidityImpact(decision && decision.kind, decision && decision.amount)
    });
    return { before: before, after: D.liquidityModel(accounts, flows, settings, afterOpts) };
  };

  /* The initial V3 requirement engine iterated individual same-day rows. That
     made the required buffer depend on JSON row ordering when +cash and -cash
     happen on the same date. Use end-of-day projection points instead: the
     result is deterministic and matches the Cash Calendar mental model. */
  var treasurySummaryV3 = D.v3TreasurySummary;
  D.v3TreasurySummary = function (data, opts) {
    data = data || {};
    opts = opts || {};
    var summary = treasurySummaryV3(data, opts);
    var days = Math.max(1, Number(opts.days) || 30);
    var settings = data.settings || {};
    var conservative = D.v3ProjectionPath(data.accounts || [], data.flows || [], settings, { horizonDays: days }, 'confirmed');
    var expected = D.v3ProjectionPath(data.accounts || [], data.flows || [], settings, { horizonDays: days }, 'expected');

    function lowest(points, fallback) {
      var low = { value: fallback, date: summary.forecastStartDate || D.today() };
      (points || []).forEach(function (point) { if (Number(point.value) < Number(low.value)) low = point; });
      return low;
    }

    var conservativeLow = lowest(conservative, summary.currentCash);
    var expectedLow = lowest(expected, summary.currentCash);
    var datedNeed = Math.max(0, summary.currentCash - conservativeLow.value);
    var expectedDatedNeed = Math.max(0, summary.currentCash - expectedLow.value);
    var undated = Math.max(0, Number(summary.bridge && summary.bridge.undatedDebt) || 0);
    var rollover = Math.max(0, Number(summary.bridge && summary.bridge.rolloverCost) || 0);

    summary.minimumRequiredCash = datedNeed + undated + rollover;
    summary.expectedMinimumRequiredCash = expectedDatedNeed + undated + rollover;
    summary.recommendedCashToKeep = summary.minimumRequiredCash + Math.max(0, Number(summary.operatingReserve) || 0);
    summary.additionalCashNeeded = Math.max(0, summary.recommendedCashToKeep - summary.currentCash);
    summary.surplusAboveRecommended = Math.max(0, summary.currentCash - summary.recommendedCashToKeep);
    summary.pressureDate = conservativeLow.date || summary.pressureDate;
    summary.explanation = Object.assign({}, summary.explanation || {}, {
      datedNeed: datedNeed,
      undatedNeed: undated,
      rolloverNeed: rollover,
      sameDayNetting: 'end_of_day'
    });
    return summary;
  };
})(window);
