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
})(window);
