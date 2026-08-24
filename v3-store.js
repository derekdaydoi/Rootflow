/* Rootflow V3 — persistence semantics patch.
   V2 historically auto-posted CERTAIN planned flows when their date arrived.
   V3 separates "committed" from "actual": confirmed=true only means the cash
   event actually happened. This wrapper normalizes legacy auto-posted rows
   without rewriting store.js or the backup format. */
(function (global) {
  'use strict';

  var S = global.RootflowStore;
  var D = global.RootflowDomain;
  if (!S || !D) return;

  var originalLoad = S.load;
  var originalImport = S.importFile;

  function normalize(data) {
    if (!data || typeof data !== 'object') return data;
    var changed = false;

    (data.accounts || []).forEach(function (account) {
      if (!account) return;
      /* Explicit values always win. Final v9 backups already carry this field.
         New liquid accounts created by the current UI still keep legacy opening
         behavior until the user explicitly imports/sets a closing snapshot. */
      if (account.balanceSemantics !== 'opening_balance' && account.balanceSemantics !== 'closing_snapshot') {
        if (!D.isLiquid(account) && Math.abs(Number(account.openingBalance) || 0) > 0) account.balanceSemantics = 'closing_snapshot';
      }
    });

    (data.flows || []).forEach(function (flow) {
      if (!flow) return;
      if (flow.autoPosted === true) {
        flow.confirmed = false;
        flow.autoPosted = false;
        flow.autoPostedLegacy = true;
        flow.confidence = flow.confidence || 'CERTAIN';
        flow.updatedAt = S.now();
        changed = true;
      }
    });

    /* Migration may have closed a contract after auto-posting. Re-open it when
       unconfirmed principal/interest remains after the normalization above. */
    (data.contracts || []).forEach(function (contract) {
      if (!contract) return;
      var principalLeft = D.contractOutstandingPrincipal(contract, data.flows || []);
      var paid = D.contractPaymentTotals(contract, data.flows || []);
      var interestLeft = Math.max(0, D.contractInterestTotal(contract) - paid.interest);
      var feeLeft = Math.max(0, D.contractFeeTotal(contract) - paid.fee);
      var status = principalLeft <= 0 && interestLeft <= 0 && feeLeft <= 0 ? 'closed' : 'active';
      if (contract.status !== status) {
        contract.status = status;
        contract.updatedAt = S.now();
        changed = true;
      }
    });

    if (changed) data.updatedAt = S.now();
    return data;
  }

  S.loadV2 = originalLoad;
  S.load = function () {
    var result = originalLoad.apply(S, arguments);
    if (result && result.data) result.data = normalize(result.data);
    return result;
  };

  S.importFileV2 = originalImport;
  S.importFile = function (file, cb) {
    return originalImport.call(S, file, function (error, data) {
      if (error) return cb(error);
      cb(null, normalize(data));
    });
  };

  S.normalizeCommittedVsActual = normalize;
})(window);
