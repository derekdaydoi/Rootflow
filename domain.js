/* Rootflow — domain.js
   Toàn bộ nghiệp vụ tài chính. Hàm thuần: không đụng DOM, không đụng storage.
   Mọi số dư (tài sản, nợ, phải thu) đều lưu dưới dạng độ lớn dương. */
(function (global) {
  'use strict';

  var DAY = 86400000;

  /* ============================ NGÀY ============================ */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function ymd(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseYmd(s) {
    var p = String(s || '').split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function today() { return ymd(new Date()); }

  function addDays(s, n) {
    var d = parseYmd(s);
    d.setDate(d.getDate() + n);
    return ymd(d);
  }

  /* Cộng tháng, kẹp về ngày cuối tháng nếu tràn (31/1 + 1 tháng = 28/2). */
  function addMonths(s, n) {
    var d = parseYmd(s);
    var day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
    return ymd(d);
  }

  function diffDays(a, b) {
    return Math.round((parseYmd(b) - parseYmd(a)) / DAY);
  }

  function monthOf(s) { return String(s || '').slice(0, 7); }

  function monthBounds(ym) {
    var p = ym.split('-');
    var y = Number(p[0]), m = Number(p[1]);
    var last = new Date(y, m, 0).getDate();
    return { from: ym + '-01', to: ym + '-' + pad(last) };
  }

  function addMonthsToYm(ym, n) {
    var p = ym.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1 + n, 1);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }

  var DOW = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  function fmtDate(s) {
    var d = parseYmd(s);
    return d.getDate() + ' thg ' + (d.getMonth() + 1);
  }

  function fmtDateFull(s) {
    var d = parseYmd(s);
    return DOW[d.getDay()] + ', ' + d.getDate() + ' thg ' + (d.getMonth() + 1);
  }

  function fmtMonth(ym) {
    var p = ym.split('-');
    return 'Tháng ' + Number(p[1]) + ' · ' + p[0];
  }

  /* Nhãn tương đối cho danh sách: hôm nay / ngày mai / quá hạn n ngày. */
  function relLabel(s, base) {
    var n = diffDays(base || today(), s);
    if (n === 0) return 'Hôm nay';
    if (n === 1) return 'Ngày mai';
    if (n === -1) return 'Hôm qua';
    if (n < 0) return fmtDateFull(s) + ' · quá ' + (-n) + ' ngày';
    return fmtDateFull(s);
  }

  /* ============================ TIỀN ============================ */

  function fmtVND(n) {
    var v = Math.round(Number(n) || 0);
    var neg = v < 0;
    var s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '−' : '') + s;
  }

  /* Rút gọn cho chỗ hẹp: 12,4 tr — 850 ng. */
  function fmtShort(n) {
    var v = Math.round(Number(n) || 0);
    var neg = v < 0;
    var a = Math.abs(v);
    var s;
    if (a >= 1e9) s = trim1(a / 1e9) + ' tỷ';
    else if (a >= 1e6) s = trim1(a / 1e6) + ' tr';
    else if (a >= 1e3) s = trim1(a / 1e3) + ' ng';
    else s = String(a);
    return (neg ? '−' : '') + s;
  }

  function trim1(x) {
    var s = (Math.round(x * 10) / 10).toString();
    return s.replace('.', ',');
  }

  function parseMoney(str) {
    var raw = String(str == null ? '' : str).trim().toLowerCase();
    if (!raw) return 0;
    var suffix = raw.match(/(k|ng|m|tr|b|tỷ|ty)\s*(?:đ|vnd)?$/i);
    if (suffix) {
      var multiplier = /^(k|ng)$/i.test(suffix[1]) ? 1e3
        : /^(m|tr)$/i.test(suffix[1]) ? 1e6 : 1e9;
      var compact = raw.slice(0, suffix.index).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.]/g, '');
      var value = Number(compact);
      return Number.isFinite(value) ? Math.round(value * multiplier) : 0;
    }
    var digits = raw.replace(/[^0-9]/g, '');
    return digits ? Number(digits) : 0;
  }

  function groupDigits(str) {
    var digits = String(str == null ? '' : str).replace(/[^0-9]/g, '');
    if (!digits) return '';
    digits = digits.replace(/^0+(?=\d)/, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /* ========================== METADATA ========================== */

  var ACCOUNT_TYPES = {
    cash:        { label: 'Tiền mặt',        group: 'liquid' },
    bank:        { label: 'Ngân hàng',       group: 'liquid' },
    ewallet:     { label: 'Ví điện tử',      group: 'liquid' },
    receivable:  { label: 'Phải thu',        group: 'receivable' },
    investment:  { label: 'Tài sản đầu tư', group: 'investment' },
    fixed_asset: { label: 'Tài sản sở hữu', group: 'fixed_asset' },
    credit_card: { label: 'Thẻ tín dụng',   group: 'liability' },
    loan:        { label: 'Khoản vay',       group: 'liability' }
  };

  var ACCOUNT_ORDER = ['cash', 'bank', 'ewallet', 'receivable', 'investment', 'fixed_asset', 'credit_card', 'loan'];

  /* pl: ảnh hưởng tới thu/chi trong kỳ. null = luân chuyển vốn, không phải thu/chi.
     counter: nhóm tài khoản đối ứng bắt buộc, null = không cần. */
  var FLOW_KINDS = {
    income:       { label: 'Thu nhập',   dir: 1,  pl: 'income',  counter: null },
    expense:      { label: 'Chi tiêu',   dir: -1, pl: 'expense', counter: null },
    transfer:     { label: 'Chuyển tiền', dir: 0, pl: null,      counter: 'any' },
    borrow:       { label: 'Vay tiền',   dir: 1,  pl: null,      counter: 'liability' },
    repay:        { label: 'Trả khoản vay', dir: -1, pl: null,   counter: 'liability' },
    lend:         { label: 'Cho vay',    dir: -1, pl: null,      counter: 'receivable' },
    collect:      { label: 'Thu nợ',     dir: 1,  pl: null,      counter: 'receivable' },
    interest_in:  { label: 'Lãi nhận',   dir: 1,  pl: 'income',  counter: null },
    interest_out: { label: 'Lãi phải trả', dir: -1, pl: 'expense', counter: null },
    fee:          { label: 'Phí',        dir: -1, pl: 'expense', counter: null }
  };

  var KIND_ORDER = ['expense', 'income', 'transfer', 'repay', 'borrow', 'lend', 'collect', 'fee', 'interest_out', 'interest_in'];

  var CATEGORIES = [
    'Ăn uống', 'Cafe', 'Thể thao', 'Di chuyển', 'Đi lại', 'Nhà ở', 'Hoá đơn', 'Chi phí vay', 'Mua sắm',
    'Sức khoẻ', 'Học tập', 'Giải trí', 'Yêu đương', 'Gia đình', 'Đầu tư', 'Trading', 'Business', 'Khác'
  ];

  function groupOf(type) {
    var t = ACCOUNT_TYPES[type];
    return t ? t.group : 'liquid';
  }
  function isLiquid(a) { return a && groupOf(a.type) === 'liquid'; }
  function isLiability(a) { return a && groupOf(a.type) === 'liability'; }
  function isReceivable(a) { return a && groupOf(a.type) === 'receivable'; }
  function isInvestment(a) { return a && groupOf(a.type) === 'investment'; }
  function isFixedAsset(a) { return a && groupOf(a.type) === 'fixed_asset'; }

  /* Baseline của account có hai cách hiểu:
     - liquid (bank/cash/e-wallet): openingBalance là SỐ DƯ ĐẦU KỲ tại ngày bắt đầu
       theo dõi. Flow cùng ngày và sau ngày đó phải được replay vào số dư hiện tại.
     - account có vị thế hiện hữu (loan/receivable/investment/fixed asset):
       openingBalance > 0 được hiểu là SNAPSHOT cuối ngày; chỉ flow sau ngày snapshot
       mới replay để không double-count lịch sử. Nếu openingBalance = 0, account được
       xem là bắt đầu từ 0 nên flow cùng ngày vẫn được replay. */
  function accountBalanceAsOf(a) {
    if (!a) return null;
    var d = String(a.balanceAsOf || '').slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  }

  function baselineIsOpening(a) {
    return Boolean(a && (isLiquid(a) || Math.abs(Number(a.openingBalance) || 0) === 0));
  }

  function effectAfterBaseline(f, a) {
    var asOf = accountBalanceAsOf(a);
    if (!asOf) return true;
    var date = String(f && f.date || '');
    return baselineIsOpening(a) ? date >= asOf : date > asOf;
  }

  function isLegacyDebtPayment(f) {
    return Boolean(f && f.kind === 'fee' && f.legacyDebtPayment);
  }

  /* Backward compatible repayment split.
     Legacy repay rows only have amount => 100% principal, zero borrowing cost.
     New rows carry principalAmount + borrowingCost and keep amount = total cash out. */
  function repayPrincipal(f) {
    if (!f || f.kind !== 'repay') return Math.abs(Number(f && f.amount) || 0);
    if (f.principalAmount !== undefined && f.principalAmount !== null && f.principalAmount !== '') {
      return Math.abs(Number(f.principalAmount) || 0);
    }
    return Math.abs(Number(f.amount) || 0);
  }

  function repayCost(f) {
    if (!f || f.kind !== 'repay') return 0;
    return Math.abs(Number(f.borrowingCost) || 0);
  }

  function repayTotal(f) {
    if (!f || f.kind !== 'repay') return Math.abs(Number(f && f.amount) || 0);
    if (f.principalAmount !== undefined || f.borrowingCost !== undefined) {
      return repayPrincipal(f) + repayCost(f);
    }
    return Math.abs(Number(f.amount) || 0);
  }

  /* Thu nợ có thể gồm gốc và lãi. Dữ liệu cũ chỉ có amount được hiểu là
     100% gốc để không làm thay đổi báo cáo lịch sử. */
  function collectPrincipal(f) {
    if (!f || f.kind !== 'collect') return Math.abs(Number(f && f.amount) || 0);
    if (f.principalAmount !== undefined && f.principalAmount !== null && f.principalAmount !== '') {
      return Math.abs(Number(f.principalAmount) || 0);
    }
    return Math.abs(Number(f.amount) || 0);
  }

  function collectInterest(f) {
    if (!f || f.kind !== 'collect') return 0;
    return Math.abs(Number(f.interestAmount) || 0);
  }

  function collectTotal(f) {
    if (!f || f.kind !== 'collect') return Math.abs(Number(f && f.amount) || 0);
    if (f.principalAmount !== undefined || f.interestAmount !== undefined) {
      return collectPrincipal(f) + collectInterest(f);
    }
    return Math.abs(Number(f.amount) || 0);
  }

  /* Tổng phần gốc/lãi đã được ghi cho một hợp đồng. Mặc định chỉ tính giao
     dịch đã xảy ra; includePlanned dùng khi dựng lại lịch để tránh forecast
     một khoản gốc đã được người dùng lên kế hoạch trả ở giao dịch khác. */
  function contractPaymentTotals(contract, flows, opts) {
    opts = opts || {};
    var totals = { principal: 0, interest: 0 };
    if (!contract) return totals;
    var kind = contract.type === 'payable' ? 'repay' : 'collect';
    live(flows || []).forEach(function (f) {
      if (!f || f.skipped || f.kind !== kind || f.contractId !== contract.id) return;
      if (!opts.includePlanned && !f.confirmed) return;
      if (opts.excludeAuto && f.autoGenerated) return;
      totals.principal += kind === 'repay' ? repayPrincipal(f) : collectPrincipal(f);
      totals.interest += kind === 'repay' ? repayCost(f) : collectInterest(f);
    });
    return totals;
  }

  function contractOutstandingPrincipal(contract, flows, opts) {
    var paid = contractPaymentTotals(contract, flows, opts).principal;
    return Math.max(0, (Number(contract && contract.originalPrincipal) || 0) - paid);
  }

  /* Lịch hợp đồng là nguồn duy nhất cho cả UI và cashflow forecast.
     - principal_interest: gốc chia đều theo kỳ, lãi tính trên dư gốc đầu kỳ.
     - interest_only: mỗi kỳ chỉ trả lãi, toàn bộ gốc nằm ở kỳ cuối.
     Lãi suất là %/tháng; kỳ lẻ cuối cùng được quy đổi theo số ngày / 30. */
  function contractSchedule(contract) {
    if (!contract) return [];
    var principal = Math.max(0, Number(contract.originalPrincipal) || 0);
    if (!(principal > 0)) return [];
    var start = /^\d{4}-\d{2}-\d{2}$/.test(String(contract.startDate || '')) ? contract.startDate : today();
    var end = /^\d{4}-\d{2}-\d{2}$/.test(String(contract.maturityDate || '')) ? contract.maturityDate : addMonths(start, 1);
    var frequency = contract.interestFrequency === 'at_maturity' ? 'at_maturity' : 'monthly';
    var dates = [];
    if (frequency === 'at_maturity') dates.push(end);
    else {
      var first = /^\d{4}-\d{2}-\d{2}$/.test(String(contract.firstPaymentDate || '')) ? contract.firstPaymentDate : addMonths(start, 1);
      for (var i = 0; i < 600; i++) {
        var date = addMonths(first, i);
        if (date > end) break;
        dates.push(date);
      }
      if (!dates.length || dates[dates.length - 1] < end) dates.push(end);
    }
    var mode = contract.type === 'payable' && contract.repaymentMode === 'interest_only' ? 'interest_only' : 'principal_interest';
    var interestMode = /^(rate|fixed)$/.test(contract.interestMode) ? contract.interestMode : 'none';
    var rate = Math.max(0, Number(contract.interestRate) || 0);
    var fixed = Math.max(0, Number(contract.fixedInterest) || 0);
    var balance = principal;
    var basePrincipal = Math.floor(principal / dates.length);
    return dates.map(function (date, index) {
      var isLast = index === dates.length - 1;
      var interest = 0;
      if (interestMode === 'fixed') {
        if (contract.fixedInterestBasis === 'total' && dates.length > 1) {
          var fixedPerPeriod = Math.floor(fixed / dates.length);
          interest = isLast ? fixed - fixedPerPeriod * (dates.length - 1) : fixedPerPeriod;
        } else interest = fixed;
      }
      else if (interestMode === 'rate') {
        var factor = 1;
        var previous = index ? dates[index - 1] : start;
        if (frequency === 'at_maturity') factor = Math.max(0, diffDays(start, date) / 30);
        else if (date !== addMonths(previous, 1)) factor = Math.max(0, diffDays(previous, date) / 30);
        interest = Math.round((mode === 'interest_only' ? principal : balance) * rate / 100 * factor);
      }
      var principalAmount = mode === 'interest_only' ? (isLast ? balance : 0)
        : isLast ? balance : Math.min(balance, basePrincipal);
      balance = Math.max(0, balance - principalAmount);
      return {
        index: index, date: date, principalAmount: principalAmount, interestAmount: interest,
        amount: principalAmount + interest,
        role: frequency === 'at_maturity' ? 'maturity' : mode === 'interest_only' && isLast ? 'principal' : 'installment'
      };
    });
  }

  function contractInterestTotal(contract) {
    return contractSchedule(contract).reduce(function (sum, row) { return sum + row.interestAmount; }, 0);
  }

  function byId(accounts) {
    var m = {};
    for (var i = 0; i < accounts.length; i++) m[accounts[i].id] = accounts[i];
    return m;
  }

  /* ===================== TÁC ĐỘNG CỦA DÒNG TIỀN =====================
     Trả về danh sách {accountId, delta} theo độ lớn riêng của từng tài khoản:
     - tài sản: delta dương = có thêm tiền
     - nợ:      delta dương = nợ thêm
     - phải thu: delta dương = người ta nợ mình thêm  */

  function effects(f, accMap) {
    var a = accMap[f.accountId];
    if (!a) return [];
    var amt = f.kind === 'repay' ? repayTotal(f)
      : f.kind === 'collect' ? collectTotal(f)
      : Math.abs(Number(f.amount) || 0);
    var b = f.counterAccountId ? accMap[f.counterAccountId] : null;
    var onCard = a.type === 'credit_card';
    var out = [];

    switch (f.kind) {
      case 'income':
      case 'interest_in':
        out.push({ accountId: a.id, delta: amt });
        break;

      case 'expense':
      case 'fee':
      case 'interest_out':
        /* Quẹt thẻ: tiền mặt chưa giảm, dư nợ thẻ tăng. */
        out.push({ accountId: a.id, delta: onCard ? amt : -amt });
        break;

      case 'transfer':
        out.push({ accountId: a.id, delta: -amt });
        if (b) out.push({ accountId: b.id, delta: isLiability(b) ? -amt : amt });
        break;

      case 'borrow':
        out.push({ accountId: a.id, delta: amt });
        if (b) out.push({ accountId: b.id, delta: amt });
        break;

      case 'repay':
        out.push({ accountId: a.id, delta: -amt });
        if (b) out.push({ accountId: b.id, delta: -repayPrincipal(f) });
        break;

      case 'lend':
        out.push({ accountId: a.id, delta: -amt });
        if (b) out.push({ accountId: b.id, delta: amt });
        break;

      case 'collect':
        out.push({ accountId: a.id, delta: amt });
        if (b) out.push({ accountId: b.id, delta: -collectPrincipal(f) });
        break;
    }
    return out;
  }

  /* Thay đổi tiền mặt khả dụng — chỉ tính tài khoản nhóm liquid. */
  function liquidDelta(f, accMap) {
    var e = effects(f, accMap), s = 0;
    for (var i = 0; i < e.length; i++) {
      var a = accMap[e[i].accountId];
      if (isLiquid(a)) s += e[i].delta;
    }
    return s;
  }

  function live(flows) {
    return flows.filter(function (f) { return !f.deletedAt; });
  }

  /* Số dư từng tài khoản. opts.upto = chỉ tính dòng tiền tới ngày đó.
     opts.includeExpected = cộng cả dòng planned (chưa tới hạn). */
  function balances(accounts, flows, opts) {
    opts = opts || {};
    var accMap = byId(accounts);
    var out = {};
    for (var i = 0; i < accounts.length; i++) {
      var baseDate = accountBalanceAsOf(accounts[i]);
      /* Khi dựng lịch sử trước ngày account bắt đầu được theo dõi/snapshot, không
         được kéo openingBalance ngược về quá khứ. 0 ở đây nghĩa là chưa có dữ liệu
         cho account đó trong ledger Rootflow tại thời điểm đang dựng. */
      out[accounts[i].id] = opts.upto && baseDate && opts.upto < baseDate
        ? 0 : (Number(accounts[i].openingBalance) || 0);
    }

    var list = live(flows);
    for (var j = 0; j < list.length; j++) {
      var f = list[j];
      if (!f.confirmed && !opts.includeExpected) continue;
      if (f.skipped) continue;
      if (opts.upto && f.date > opts.upto) continue;
      var e = effects(f, accMap);
      for (var k = 0; k < e.length; k++) {
        if (out[e[k].accountId] === undefined) continue;
        var target = accMap[e[k].accountId];
        if (!effectAfterBaseline(f, target)) continue;
        out[e[k].accountId] += e[k].delta;
      }
    }
    return out;
  }

  function totals(accounts, bal) {
    var t = { liquid: 0, liability: 0, receivable: 0, investment: 0, fixedAsset: 0 };
    for (var i = 0; i < accounts.length; i++) {
      var a = accounts[i];
      if (a.archived) continue;
      var v = bal[a.id] || 0;
      if (isLiquid(a)) t.liquid += v;
      else if (isLiability(a)) t.liability += v;
      else if (isReceivable(a)) t.receivable += v;
      else if (isInvestment(a)) t.investment += v;
      else if (isFixedAsset(a)) t.fixedAsset += v;
    }
    t.assets = t.liquid + t.receivable + t.investment + t.fixedAsset;
    t.netWorth = t.assets - t.liability;
    return t;
  }

  function termClass(a) {
    if (!a) return 'long';
    if (isLiquid(a) || a.type === 'credit_card') return 'current';
    if (a.type === 'receivable') return a.termClass === 'long' ? 'long' : 'current';
    if (a.type === 'loan') return a.termClass === 'current' ? 'current' : 'long';
    if (a.type === 'investment') return a.termClass === 'current' ? 'current' : 'long';
    return 'long';
  }

  /* Personal balance sheet: accounting view on top of the same local-first ledger.
     CAPEX is recognized when cash is transferred into a fixed-asset account.
     OPEX is economic expense in monthSummary, including borrowing cost on split repayments. */
  function personalBalanceSheet(accounts, flows, bal, ym) {
    bal = bal || balances(accounts, flows);
    ym = ym || monthOf(today());
    var t = totals(accounts, bal);
    var bs = {
      liquid: t.liquid,
      receivable: t.receivable,
      investment: t.investment,
      fixedAsset: t.fixedAsset,
      totalAssets: t.assets,
      currentAssets: 0,
      nonCurrentAssets: 0,
      currentLiabilities: 0,
      nonCurrentLiabilities: 0,
      totalLiabilities: t.liability,
      equity: t.netWorth,
      nwc: 0,
      debtRatio: 0,
      currentRatio: null,
      debtToEquity: null,
      opex: 0,
      capex: 0,
      debtService: 0,
      unallocatedDebtPayment: 0,
      debtServiceRatio: null
    };

    for (var i = 0; i < accounts.length; i++) {
      var a = accounts[i];
      if (a.archived) continue;
      var v = Number(bal[a.id]) || 0;
      if (isLiability(a)) {
        if (termClass(a) === 'current') bs.currentLiabilities += v;
        else bs.nonCurrentLiabilities += v;
      } else {
        if (termClass(a) === 'current') bs.currentAssets += v;
        else bs.nonCurrentAssets += v;
      }
    }

    var m = monthSummary(accounts, flows, ym);
    bs.opex = m.expense;
    bs.debtService = m.debtService;
    bs.unallocatedDebtPayment = m.unallocatedDebtPayment || 0;

    var bounds = monthBounds(ym);
    var accMap = byId(accounts);
    live(flows).forEach(function (f) {
      if (!f.confirmed || f.skipped || f.date < bounds.from || f.date > bounds.to) return;
      if (f.kind !== 'transfer' || !f.counterAccountId) return;
      var target = accMap[f.counterAccountId];
      if (isFixedAsset(target)) bs.capex += Math.abs(Number(f.amount) || 0);
    });

    bs.nwc = bs.currentAssets - bs.currentLiabilities;
    bs.debtRatio = bs.totalAssets > 0 ? bs.totalLiabilities / bs.totalAssets * 100 : 0;
    bs.currentRatio = bs.currentLiabilities > 0 ? bs.currentAssets / bs.currentLiabilities : null;
    bs.debtToEquity = bs.equity > 0 ? bs.totalLiabilities / bs.equity : null;
    bs.debtServiceRatio = m.income > 0 ? bs.debtService / m.income * 100 : null;
    return bs;
  }

  /* ============================ DỰ PHÓNG ============================
     Số dư khả dụng dự phóng tại ngày d
       = số dư khả dụng hiện tại (chỉ dòng actual đã ghi nhận)
       + mọi dòng planned có ngày <= d
     Dòng planned quá hạn được cộng vào ngày đầu tiên — migration/runtime sẽ auto-post khi app hoạt động. */

  function forecast(accounts, flows, horizonDays, reserveFloor, baseDate) {
    var start = baseDate || today();
    var accMap = byId(accounts);
    var current = totals(accounts, balances(accounts, flows)).liquid;

    var pending = live(flows).filter(function (f) {
      return !f.confirmed && !f.skipped;
    });

    var points = [];
    var running = current;
    var idx = 0;
    var sorted = pending.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

    for (var i = 0; i <= horizonDays; i++) {
      var d = addDays(start, i);
      while (idx < sorted.length && sorted[idx].date <= d) {
        running += liquidDelta(sorted[idx], accMap);
        idx++;
      }
      points.push({ date: d, value: running });
    }

    var lowest = points[0], i2;
    for (i2 = 1; i2 < points.length; i2++) if (points[i2].value < lowest.value) lowest = points[i2];

    var floor = Number(reserveFloor) || 0;
    return {
      points: points,
      current: current,
      end: points[points.length - 1].value,
      lowest: lowest.value,
      lowestDate: lowest.date,
      reserveFloor: floor,
      safeToSpend: Math.max(0, lowest.value - floor),
      breaches: lowest.value < floor
    };
  }

  /* ====================== THANH KHOẢN & BUFFER ======================
     Kết quả chính luôn bảo thủ với inflow: CERTAIN mới được dùng để chứng minh
     an toàn. Mọi outflow đã lên lịch vẫn được tính, bất kể confidence, để một
     khoản thu EXPECTED/UNCERTAIN không che mất maturity mismatch. */

  var CONFIDENCE = {
    CERTAIN: { label: 'Đã xác nhận', short: 'Confirmed' },
    EXPECTED: { label: 'Dự kiến', short: 'Expected' },
    UNCERTAIN: { label: 'Chưa chắc chắn', short: 'Uncertain' }
  };

  function confidenceOf(f) {
    var value = String(f && f.confidence || '').toUpperCase();
    return CONFIDENCE[value] ? value : 'EXPECTED';
  }

  function liquidityStatus(low, hardFloor, operatingBuffer) {
    var liquidityBuffer = Number(low || 0) - Number(hardFloor || 0);
    var operatingHeadroom = Number(low || 0) - Number(operatingBuffer || 0);
    return {
      liquidityBuffer: liquidityBuffer,
      operatingHeadroom: operatingHeadroom,
      status: liquidityBuffer < 0 ? 'UNSAFE' : operatingHeadroom < 0 ? 'TIGHT' : 'SAFE'
    };
  }

  function projectionPath(accounts, flows, opts, mode) {
    var start = opts.baseDate || today();
    var days = Math.max(1, Number(opts.horizonDays) || 90);
    var accMap = byId(accounts);
    var current = totals(accounts, balances(accounts, flows)).liquid + (Number(opts.initialAdjustment) || 0);
    var planned = live(flows).filter(function (f) {
      return !f.confirmed && !f.skipped;
    }).map(function (f) {
      return { flow: f, delta: liquidDelta(f, accMap) };
    }).filter(function (row) {
      if (row.delta <= 0) return true;
      var confidence = confidenceOf(row.flow);
      if (mode === 'full') return true;
      if (mode === 'expected') return confidence !== 'UNCERTAIN';
      return confidence === 'CERTAIN';
    }).sort(function (a, b) {
      return String(a.flow.date || '').localeCompare(String(b.flow.date || ''));
    });

    var points = [], running = current, idx = 0;
    for (var i = 0; i <= days; i++) {
      var date = addDays(start, i);
      while (idx < planned.length && String(planned[idx].flow.date || '') <= date) {
        running += planned[idx].delta;
        idx++;
      }
      points.push({ date: date, value: running });
    }
    return points;
  }

  function lowestPoint(points) {
    var lowest = points[0] || { date: today(), value: 0 };
    for (var i = 1; i < points.length; i++) {
      if (points[i].value < lowest.value) lowest = points[i];
    }
    return lowest;
  }

  function liquidityModel(accounts, flows, settings, opts) {
    settings = settings || {};
    opts = opts || {};
    var config = {
      baseDate: opts.baseDate || today(),
      horizonDays: Number(opts.horizonDays || settings.horizonDays) || 90,
      initialAdjustment: Number(opts.initialAdjustment) || 0
    };
    var hardFloor = Math.max(0, Number(settings.hardFloor != null ? settings.hardFloor : settings.reserveFloor) || 0);
    var operating = Math.max(hardFloor, Number(settings.operatingBuffer) || hardFloor);
    var comfort = Math.max(operating, Number(settings.comfortBuffer) || operating);
    var confirmedPoints = projectionPath(accounts, flows, config, 'confirmed');
    var expectedPoints = projectionPath(accounts, flows, config, 'expected');
    var allPoints = projectionPath(accounts, flows, config, 'full');
    var confirmedLow = lowestPoint(confirmedPoints);
    var expectedLow = lowestPoint(expectedPoints);
    var state = liquidityStatus(confirmedLow.value, hardFloor, operating);
    var expectedState = liquidityStatus(expectedLow.value, hardFloor, operating);
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
      hardFloor: hardFloor,
      operatingBuffer: operating,
      comfortBuffer: comfort,
      liquidityBuffer: state.liquidityBuffer,
      operatingHeadroom: state.operatingHeadroom,
      status: state.status,
      expectedStatus: expectedState.status,
      dependsOnExpected: expectedLow.value > confirmedLow.value,
      safeDeployableNow: Math.max(0, confirmedLow.value - hardFloor),
      operatingDeployableNow: Math.max(0, confirmedLow.value - operating),
      runwayDays: zeroPoint ? Math.max(0, diffDays(config.baseDate, zeroPoint.date)) : config.horizonDays,
      runwayCapped: !zeroPoint,
      horizonDays: config.horizonDays
    };
  }

  function decisionLiquidityImpact(kind, amount) {
    var value = Math.abs(Number(amount) || 0);
    return kind === 'borrow' || kind === 'collect' || kind === 'income' || kind === 'sell_asset'
      ? value : -value;
  }

  function simulateDecision(accounts, flows, settings, decision, opts) {
    var before = liquidityModel(accounts, flows, settings, opts);
    var afterOpts = Object.assign({}, opts || {}, {
      initialAdjustment: decisionLiquidityImpact(decision && decision.kind, decision && decision.amount)
    });
    return { before: before, after: liquidityModel(accounts, flows, settings, afterOpts) };
  }

  /* ============================ THÁNG ============================ */

  function monthSummary(accounts, flows, ym) {
    var b = monthBounds(ym);
    var accMap = byId(accounts);
    var inMonth = live(flows).filter(function (f) {
      return f.date >= b.from && f.date <= b.to && !f.skipped;
    });

    var r = {
      ym: ym, income: 0, expense: 0, netCash: 0,
      debtService: 0, debtPrincipal: 0, borrowingCost: 0, unallocatedDebtPayment: 0,
      lent: 0, collected: 0, borrowed: 0,
      byCategory: {}, count: inMonth.length, pending: 0, confirmed: 0
    };

    for (var i = 0; i < inMonth.length; i++) {
      var f = inMonth[i];
      var meta = FLOW_KINDS[f.kind] || {};
      var amt = f.kind === 'repay' ? repayTotal(f)
        : f.kind === 'collect' ? collectTotal(f)
        : Math.abs(Number(f.amount) || 0);

      if (f.confirmed) r.confirmed++; else { r.pending++; continue; }

      if (meta.pl === 'income') r.income += amt;
      if (meta.pl === 'expense' && !isLegacyDebtPayment(f)) {
        r.expense += amt;
        var c = f.category || 'Khác';
        r.byCategory[c] = (r.byCategory[c] || 0) + amt;
      }

      if (isLegacyDebtPayment(f)) {
        r.debtService += amt;
        r.unallocatedDebtPayment += amt;
      } else if (f.kind === 'repay') {
        var principal = repayPrincipal(f);
        var cost = repayCost(f);
        r.debtService += principal + cost;
        r.debtPrincipal += principal;
        r.borrowingCost += cost;
        if (cost > 0) {
          r.expense += cost;
          r.byCategory['Chi phí vay'] = (r.byCategory['Chi phí vay'] || 0) + cost;
        }
      } else if (f.kind === 'interest_out') {
        r.debtService += amt;
        r.borrowingCost += amt;
      }

      if (f.kind === 'transfer' && f.counterAccountId && isLiability(accMap[f.counterAccountId])) {
        r.debtService += amt;
        r.debtPrincipal += amt;
      }
      if (f.kind === 'lend') r.lent += amt;
      if (f.kind === 'collect') {
        r.collected += collectPrincipal(f);
        if (collectInterest(f) > 0) {
          r.income += collectInterest(f);
        }
      }
      if (f.kind === 'borrow') r.borrowed += amt;

      r.netCash += liquidDelta(f, accMap);
    }

    r.categories = Object.keys(r.byCategory)
      .map(function (k) { return { name: k, amount: r.byCategory[k] }; })
      .sort(function (x, y) { return y.amount - x.amount; });

    r.savingRate = r.income > 0 ? Math.max(0, Math.round((r.income - r.expense) / r.income * 100)) : 0;
    return r;
  }

  /* Dòng planned đã tới hạn nhưng chưa được auto-post — chỉ còn như fallback vệ sinh dữ liệu. */
  function overdue(flows, baseDate) {
    var t = baseDate || today();
    return live(flows).filter(function (f) {
      return !f.confirmed && !f.skipped && f.date <= t;
    });
  }

  function upcoming(flows, days, baseDate) {
    var t = baseDate || today();
    var to = addDays(t, days);
    return live(flows).filter(function (f) {
      return !f.confirmed && !f.skipped && f.date >= t && f.date <= to;
    });
  }

  /* ========================== LẶP LẠI ==========================
     Mỗi chuỗi được sinh trước thành các dòng độc lập nhưng giữ metadata
     tần suất, vị trí và tổng số kỳ để màn sửa có thể khôi phục đúng lịch. */

  function expand(base, freq, count, newId, existingSeriesId) {
    var out = [];
    var normalized = freq === 'weekly' || freq === 'monthly' ? freq : 'none';
    var n = normalized === 'none' ? 1 : Math.max(1, Math.min(60, Number(count) || 1));
    var series = normalized === 'none' ? null : (existingSeriesId || newId());
    for (var i = 0; i < n; i++) {
      var date = normalized === 'weekly' ? addDays(base.date, i * 7)
        : normalized === 'monthly' ? addMonths(base.date, i)
        : base.date;
      var f = {};
      for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) f[k] = base[k];
      f.id = newId();
      f.date = date;
      f.seriesId = series;
      f.seriesFreq = normalized;
      f.seriesIndex = i;
      f.seriesCount = n;
      out.push(f);
    }
    return out;
  }

  /* ========================== KIỂM TRA ========================== */

  function validateFlow(f, accMap) {
    if (!f.accountId || !accMap[f.accountId]) return 'Chọn tài khoản.';
    var meta = FLOW_KINDS[f.kind];
    if (!meta) return 'Chọn loại dòng tiền.';
    if (!(Number(f.amount) > 0)) return 'Nhập số tiền lớn hơn 0.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date || '')) return 'Chọn ngày.';
    if (meta.counter) {
      var b = accMap[f.counterAccountId];
      if (!b) return 'Chọn tài khoản đối ứng.';
      if (b.id === f.accountId) return 'Hai tài khoản phải khác nhau.';
      if (meta.counter !== 'any' && groupOf(b.type) !== meta.counter) {
        var need = meta.counter === 'liability' ? 'thẻ tín dụng hoặc khoản vay' : 'khoản cho vay';
        return 'Tài khoản đối ứng phải là ' + need + '.';
      }
    }
    var a = accMap[f.accountId];
    if ((f.kind === 'income' || f.kind === 'interest_in' || f.kind === 'transfer' ||
         f.kind === 'borrow' || f.kind === 'repay' || f.kind === 'lend' || f.kind === 'collect')
        && !isLiquid(a)) {
      return 'Tài khoản nguồn phải là tiền mặt, ngân hàng hoặc ví.';
    }
    return null;
  }

  function validateAccount(a) {
    if (!String(a.name || '').trim()) return 'Đặt tên cho tài khoản.';
    if (!ACCOUNT_TYPES[a.type]) return 'Chọn loại tài khoản.';
    if (Number(a.openingBalance) < 0) return 'Số dư ban đầu không được âm — dùng loại tài khoản nợ thay vì số âm.';
    if (a.balanceAsOf && !/^\d{4}-\d{2}-\d{2}$/.test(String(a.balanceAsOf))) return 'Ngày snapshot không hợp lệ.';
    return null;
  }

  global.RootflowDomain = {
    DAY: DAY,
    ymd: ymd, parseYmd: parseYmd, today: today, addDays: addDays, addMonths: addMonths,
    diffDays: diffDays, monthOf: monthOf, monthBounds: monthBounds, addMonthsToYm: addMonthsToYm,
    fmtDate: fmtDate, fmtDateFull: fmtDateFull, fmtMonth: fmtMonth, relLabel: relLabel,
    fmtVND: fmtVND, fmtShort: fmtShort, parseMoney: parseMoney, groupDigits: groupDigits,
    ACCOUNT_TYPES: ACCOUNT_TYPES, ACCOUNT_ORDER: ACCOUNT_ORDER,
    FLOW_KINDS: FLOW_KINDS, KIND_ORDER: KIND_ORDER, CATEGORIES: CATEGORIES,
    groupOf: groupOf, isLiquid: isLiquid, isLiability: isLiability, isReceivable: isReceivable,
    isInvestment: isInvestment, isFixedAsset: isFixedAsset, termClass: termClass,
    repayPrincipal: repayPrincipal, repayCost: repayCost, repayTotal: repayTotal,
    collectPrincipal: collectPrincipal, collectInterest: collectInterest, collectTotal: collectTotal,
    contractPaymentTotals: contractPaymentTotals, contractOutstandingPrincipal: contractOutstandingPrincipal,
    contractSchedule: contractSchedule, contractInterestTotal: contractInterestTotal,
    accountBalanceAsOf: accountBalanceAsOf, baselineIsOpening: baselineIsOpening, effectAfterBaseline: effectAfterBaseline,
    isLegacyDebtPayment: isLegacyDebtPayment,
    byId: byId, effects: effects, liquidDelta: liquidDelta, balances: balances, totals: totals,
    personalBalanceSheet: personalBalanceSheet,
    CONFIDENCE: CONFIDENCE, confidenceOf: confidenceOf, liquidityStatus: liquidityStatus,
    liquidityModel: liquidityModel, decisionLiquidityImpact: decisionLiquidityImpact, simulateDecision: simulateDecision,
    forecast: forecast, monthSummary: monthSummary, overdue: overdue, upcoming: upcoming,
    expand: expand, validateFlow: validateFlow, validateAccount: validateAccount
  };
})(window);
