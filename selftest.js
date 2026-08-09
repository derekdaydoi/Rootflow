/* Rootflow — selftest.js
   Không có TypeScript nên phần tính tiền được chốt bằng assertion.
   Chạy: mở app, Cài đặt → "Chạy kiểm tra nghiệp vụ", hoặc gõ rootflowSelfTest() trong console. */
(function (global) {
  'use strict';

  function run() {
    var D = global.RootflowDomain;
    var results = [];

    function check(name, actual, expected) {
      var pass = JSON.stringify(actual) === JSON.stringify(expected);
      results.push({ name: name, pass: pass, actual: actual, expected: expected });
    }

    var accounts = [
      { id: 'cash', name: 'Tiền mặt', type: 'cash', openingBalance: 1000000, archived: false },
      { id: 'bank', name: 'Ngân hàng', type: 'bank', openingBalance: 20000000, archived: false },
      { id: 'card', name: 'Thẻ', type: 'credit_card', openingBalance: 0, creditLimit: 50000000, archived: false },
      { id: 'loan', name: 'Vay mua xe', type: 'loan', openingBalance: 100000000, archived: false },
      { id: 'recv', name: 'Anh Nam nợ', type: 'receivable', openingBalance: 0, archived: false }
    ];

    function f(o) {
      return Object.assign({
        id: 'f' + results.length, date: '2026-08-01', confirmed: true,
        skipped: false, amount: 0, category: '', note: ''
      }, o);
    }

    function bal(flows) { return D.balances(accounts, flows); }
    function tot(flows) { return D.totals(accounts, bal(flows)); }

    /* --- 1. Thu nhập vào ngân hàng --- */
    var t1 = tot([f({ kind: 'income', accountId: 'bank', amount: 30000000 })]);
    check('Thu nhập tăng tiền khả dụng', t1.liquid, 51000000);

    /* --- 2. Chi tiền mặt --- */
    var t2 = tot([f({ kind: 'expense', accountId: 'cash', amount: 200000 })]);
    check('Chi tiêu giảm tiền khả dụng', t2.liquid, 20800000);

    /* --- 3. Quẹt thẻ: tiền chưa giảm, nợ thẻ tăng --- */
    var flows3 = [f({ kind: 'expense', accountId: 'card', amount: 5000000 })];
    var b3 = bal(flows3), t3 = D.totals(accounts, b3);
    check('Quẹt thẻ không giảm tiền khả dụng', t3.liquid, 21000000);
    check('Quẹt thẻ làm tăng dư nợ thẻ', b3.card, 5000000);
    check('Quẹt thẻ làm giảm tài sản ròng', t3.netWorth, 21000000 - 5000000 - 100000000);

    /* --- 4. Thanh toán thẻ: tiền giảm, nợ giảm, không tính chi lần hai --- */
    var flows4 = [
      f({ kind: 'expense', accountId: 'card', amount: 5000000 }),
      f({ kind: 'transfer', accountId: 'bank', counterAccountId: 'card', amount: 5000000, date: '2026-08-10' })
    ];
    var b4 = bal(flows4), t4 = D.totals(accounts, b4);
    check('Trả thẻ làm giảm tiền khả dụng', t4.liquid, 16000000);
    check('Trả thẻ làm sạch dư nợ thẻ', b4.card, 0);
    var m4 = D.monthSummary(accounts, flows4, '2026-08');
    check('Trả thẻ không bị tính là chi lần hai', m4.expense, 5000000);
    check('Trả thẻ được tính vào debt service', m4.debtService, 5000000);

    /* --- 5. Chuyển tiền giữa hai tài khoản khả dụng: tổng không đổi --- */
    var t5 = tot([f({ kind: 'transfer', accountId: 'bank', counterAccountId: 'cash', amount: 3000000 })]);
    check('Chuyển tiền không đổi tổng khả dụng', t5.liquid, 21000000);
    var m5 = D.monthSummary(accounts, [f({ kind: 'transfer', accountId: 'bank', counterAccountId: 'cash', amount: 3000000 })], '2026-08');
    check('Chuyển tiền không tạo thu hay chi', [m5.income, m5.expense], [0, 0]);

    /* --- 6. Nhận khoản vay: tiền tăng, nợ tăng, không phải thu nhập --- */
    var flows6 = [f({ kind: 'borrow', accountId: 'bank', counterAccountId: 'loan', amount: 50000000 })];
    var b6 = bal(flows6), t6 = D.totals(accounts, b6);
    check('Vay tiền làm tăng tiền khả dụng', t6.liquid, 71000000);
    check('Vay tiền làm tăng dư nợ vay', b6.loan, 150000000);
    check('Vay tiền không đổi tài sản ròng', t6.netWorth, 21000000 - 100000000);
    var m6 = D.monthSummary(accounts, flows6, '2026-08');
    check('Vay tiền không phải thu nhập', m6.income, 0);

    /* --- 7. Trả gốc: tiền giảm, nợ giảm, không phải chi tiêu --- */
    var flows7 = [f({ kind: 'repay', accountId: 'bank', counterAccountId: 'loan', amount: 10000000 })];
    var b7 = bal(flows7), m7 = D.monthSummary(accounts, flows7, '2026-08');
    check('Trả gốc làm giảm dư nợ vay', b7.loan, 90000000);
    check('Trả gốc không phải chi tiêu', m7.expense, 0);
    check('Trả gốc được tính vào nghĩa vụ nợ', m7.debtService, 10000000);

    /* --- 8. Lãi vay là chi tiêu thật --- */
    var m8 = D.monthSummary(accounts, [f({ kind: 'interest_out', accountId: 'bank', amount: 800000 })], '2026-08');
    check('Lãi vay tính là chi tiêu', m8.expense, 800000);

    /* --- 9. Cho vay rồi thu về: tài sản ròng không đổi --- */
    var flows9 = [
      f({ kind: 'lend', accountId: 'cash', counterAccountId: 'recv', amount: 500000 })
    ];
    var b9 = bal(flows9), t9 = D.totals(accounts, b9);
    check('Cho vay làm tăng khoản phải thu', b9.recv, 500000);
    check('Cho vay không đổi tài sản ròng', t9.netWorth, 21000000 - 100000000);
    var m9 = D.monthSummary(accounts, flows9, '2026-08');
    check('Cho vay không phải chi tiêu', m9.expense, 0);

    /* --- 10. Dự phóng: dòng planned không tính vào số dư hiện tại --- */
    var flows10 = [
      f({ kind: 'expense', accountId: 'bank', amount: 6000000, confirmed: false, date: '2026-08-05' })
    ];
    var t10 = D.totals(accounts, D.balances(accounts, flows10));
    check('Dòng planned chưa đụng vào số dư hiện tại', t10.liquid, 21000000);
    var fc = D.forecast(accounts, flows10, 30, 5000000, '2026-08-01');
    check('Dự phóng trừ dòng planned đúng hạn', fc.lowest, 15000000);
    check('An toàn chi tiêu trừ ngưỡng dự phòng', fc.safeToSpend, 10000000);
    check('Ngày chạm đáy đúng', fc.lowestDate, '2026-08-05');
    var m10 = D.monthSummary(accounts, flows10, '2026-08');
    check('Dòng planned chưa được tính vào chi tiêu actual', [m10.expense, m10.pending, m10.confirmed], [0, 1, 0]);

    /* --- 11. Dòng quá hạn được cộng ngay ngày đầu --- */
    var fc11 = D.forecast(accounts, [
      f({ kind: 'expense', accountId: 'bank', amount: 1000000, confirmed: false, date: '2026-07-20' })
    ], 10, 0, '2026-08-01');
    check('Dòng quá hạn dồn vào ngày đầu dự phóng', fc11.points[0].value, 20000000);

    /* --- 12. Bị xoá thì không tính --- */
    var t12 = tot([f({ kind: 'income', accountId: 'bank', amount: 9000000, deletedAt: '2026-08-02' })]);
    check('Dòng trong thùng rác không tính vào số dư', t12.liquid, 21000000);

    /* --- 13. Lặp theo tháng, kẹp ngày cuối tháng --- */
    var seq = D.expand({ date: '2026-01-31', kind: 'expense', accountId: 'bank', amount: 1 }, 'monthly', 3,
      (function () { var n = 0; return function () { return 'x' + (++n); }; })());
    check('Lặp tháng kẹp đúng ngày cuối tháng',
      seq.map(function (x) { return x.date; }), ['2026-01-31', '2026-02-28', '2026-03-31']);
    check('Chuỗi lưu đúng tần suất', seq.map(function (x) { return x.seriesFreq; }), ['monthly', 'monthly', 'monthly']);
    check('Chuỗi lưu đúng vị trí kỳ', seq.map(function (x) { return x.seriesIndex; }), [0, 1, 2]);
    check('Chuỗi lưu đúng tổng số kỳ', seq.map(function (x) { return x.seriesCount; }), [3, 3, 3]);

    /* --- 14. Định dạng tiền --- */
    check('Định dạng tiền có dấu chấm nghìn', D.fmtVND(1234567), '1.234.567');
    check('Đọc số tiền bỏ ký tự thừa', D.parseMoney('1.234.567 đ'), 1234567);

    /* --- 15. Kiểm tra đầu vào --- */
    var accMap = D.byId(accounts);
    check('Chặn chuyển tiền vào chính nó',
      D.validateFlow({ kind: 'transfer', accountId: 'bank', counterAccountId: 'bank', amount: 1, date: '2026-08-01' }, accMap),
      'Hai tài khoản phải khác nhau.');
    check('Chặn trả khoản vay vào tài khoản không phải nợ',
      D.validateFlow({ kind: 'repay', accountId: 'bank', counterAccountId: 'cash', amount: 1, date: '2026-08-01' }, accMap),
      'Tài khoản đối ứng phải là thẻ tín dụng hoặc khoản vay.');

    /* --- 16. Trả khoản vay tách gốc / chi phí vay --- */
    var splitRepay = f({
      kind: 'repay', accountId: 'bank', counterAccountId: 'loan',
      amount: 4000000, principalAmount: 3200000, borrowingCost: 800000
    });
    var b16 = bal([splitRepay]), t16 = D.totals(accounts, b16);
    var m16 = D.monthSummary(accounts, [splitRepay], '2026-08');
    check('Split repay trừ đủ tổng tiền khỏi bank', b16.bank, 16000000);
    check('Split repay chỉ giảm dư nợ bằng phần gốc', b16.loan, 96800000);
    check('Split repay chỉ tính borrowing cost vào chi tiêu', m16.expense, 800000);
    check('Split repay ghi đúng debt service', [m16.debtPrincipal, m16.borrowingCost, m16.debtService], [3200000, 800000, 4000000]);
    check('Split repay chỉ làm giảm net worth bằng borrowing cost', t16.netWorth, 21000000 - 100000000 - 800000);

    /* --- 17. Personal balance sheet + CAPEX --- */
    var bsAccounts = [
      { id: 'b', name: 'Bank', type: 'bank', openingBalance: 50000000, archived: false },
      { id: 'r', name: 'Phải thu', type: 'receivable', openingBalance: 10000000, termClass: 'current', archived: false },
      { id: 'inv', name: 'Đầu tư', type: 'investment', openingBalance: 20000000, termClass: 'long', archived: false },
      { id: 'fa', name: 'Laptop', type: 'fixed_asset', openingBalance: 30000000, archived: false },
      { id: 'cc', name: 'Thẻ', type: 'credit_card', openingBalance: 5000000, archived: false },
      { id: 'ln', name: 'Vay', type: 'loan', openingBalance: 25000000, termClass: 'long', archived: false }
    ];
    var bsFlows = [{
      id: 'capex', date: '2026-08-05', confirmed: true, skipped: false,
      kind: 'transfer', accountId: 'b', counterAccountId: 'fa', amount: 5000000, category: '', note: ''
    }];
    var bsBal = D.balances(bsAccounts, bsFlows);
    var bs = D.personalBalanceSheet(bsAccounts, bsFlows, bsBal, '2026-08');
    check('Balance sheet giữ tổng tài sản khi CAPEX chỉ đổi dạng tài sản', bs.totalAssets, 110000000);
    check('Balance sheet tính đúng tổng nợ', bs.totalLiabilities, 30000000);
    check('Balance sheet tính đúng vốn chủ', bs.equity, 80000000);
    check('NWC dùng tài sản và nợ ngắn hạn', bs.nwc, 50000000);
    check('CAPEX nhận transfer vào tài sản sở hữu', bs.capex, 5000000);
    check('Debt ratio đúng', Math.round(bs.debtRatio), 27);


    /* --- 18. Snapshot account không replay lịch sử trước balanceAsOf --- */
    var snapAccounts = [
      { id: 'sb', name: 'Bank', type: 'bank', openingBalance: 10000000, balanceAsOf: '2026-08-01', archived: false },
      { id: 'sl', name: 'Loan snapshot', type: 'loan', openingBalance: 20000000, balanceAsOf: '2026-08-10', archived: false }
    ];
    var snapFlows = [
      { id: 'sr1', date: '2026-08-08', confirmed: true, skipped: false, kind: 'repay',
        accountId: 'sb', counterAccountId: 'sl', amount: 4000000, principalAmount: 3200000, borrowingCost: 800000, category: '', note: '' }
    ];
    var snapBal = D.balances(snapAccounts, snapFlows);
    check('Repay lịch sử vẫn làm giảm cash của account cũ', snapBal.sb, 6000000);
    check('Repay trước snapshot không làm giảm dư nợ hiện tại lần hai', snapBal.sl, 20000000);

    /* --- 19. Legacy debt payment giữ cash nhưng không làm phình OPEX --- */
    var legacyAccounts = [
      { id: 'lb', name: 'Bank', type: 'bank', openingBalance: 7998000, balanceAsOf: '2026-08-06', archived: false }
    ];
    var legacyFlows = [
      { id: 'li', date: '2026-08-08', confirmed: true, skipped: false, kind: 'income',
        accountId: 'lb', amount: 16000000, category: '', note: '' },
      { id: 'lf', date: '2026-08-08', confirmed: true, skipped: false, kind: 'fee',
        accountId: 'lb', amount: 5340000, category: 'Business', note: 'Nợ vay 2', legacyDebtPayment: true }
    ];
    var legacyBal = D.balances(legacyAccounts, legacyFlows);
    var legacyMonth = D.monthSummary(legacyAccounts, legacyFlows, '2026-08');
    check('Legacy debt payment vẫn giảm tiền khả dụng', legacyBal.lb, 18658000);
    check('Legacy debt payment không tính toàn bộ vào OPEX', legacyMonth.expense, 0);
    check('Legacy debt payment vẫn tính vào debt service cash obligation', legacyMonth.debtService, 5340000);
    check('Legacy debt payment được flag là chưa phân bổ', legacyMonth.unallocatedDebtPayment, 5340000);

    var passed = results.filter(function (r) { return r.pass; }).length;
    return { total: results.length, passed: passed, failed: results.length - passed, results: results };
  }

  global.rootflowSelfTest = function () {
    var r = run();
    var tag = r.failed === 0 ? 'TẤT CẢ ĐẠT' : r.failed + ' PHÉP SAI';
    console.log('Rootflow selftest — ' + r.passed + '/' + r.total + ' — ' + tag);
    r.results.forEach(function (x) {
      if (!x.pass) console.error('SAI: ' + x.name, { nhận: x.actual, đúng: x.expected });
    });
    return r;
  };
})(window);
