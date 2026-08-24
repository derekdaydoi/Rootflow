/* Rootflow V3 — lightweight bilingual copy layer (no build step). */
(function (global) {
  'use strict';

  var KEY = 'rootflow.locale';
  var DEFAULT_LOCALE = 'vi';
  var DICT = {
    vi: {
      overview: 'Tổng quan', cashCalendar: 'Lịch tiền', funding: 'Nợ & Cho vay', plan: 'Kế hoạch',
      availableCash: 'Tiền hiện có', asOf: 'Cập nhật đến', next30Days: '30 ngày tới',
      cashNeeded: 'Tiền tối thiểu cần có', recommendedCash: 'Buffer nên giữ', additionalNeeded: 'Cần bổ sung',
      surplus: 'Dư so với buffer', pressureDate: 'Ngày áp lực', why: 'Vì sao Rootflow tính như vậy?',
      reliableInflows: 'Tiền vào đã chốt', expectedInflows: 'Tiền vào dự kiến', recurringIncome: 'Thu nhập tháng chưa có ngày',
      mandatoryOutflows: 'Tiền ra bắt buộc', undatedDebt: 'Nghĩa vụ tháng chưa có ngày', rolloverCost: 'Chi phí đáo thẻ ước tính',
      projectedLow: 'Tiền thấp nhất dự kiến', conservative: 'Bảo thủ', expected: 'Kỳ vọng',
      debtCalendar: 'Lịch trả nợ', next7: '7 ngày tới', next30: '30 ngày tới', largestPayment: 'Khoản lớn nhất',
      date: 'Ngày', creditor: 'Khoản', principal: 'Gốc', interest: 'Lãi', fee: 'Phí', total: 'Tổng',
      monthlyUndated: 'Trong tháng · chưa rõ ngày', controlAssumption: 'Giả định kiểm soát',
      cashBridge: 'Cầu dòng tiền', openingCash: 'Tiền đầu kỳ', closingCash: 'Tiền sau nghĩa vụ',
      lendingBook: 'Sổ cho vay', lendingPrincipal: 'Vốn đang cho vay', longTermLending: 'Vốn cho vay dài hạn',
      lendingInterest: 'Lãi cho vay mỗi tháng', totalDebt: 'Tổng nợ', fundingLinks: 'Liên kết nguồn vốn',
      funds: 'tài trợ', noFundingLinks: 'Chưa có khoản cho vay nào liên kết trực tiếp với một nguồn vốn vay.',
      actual: 'Đã xảy ra', committed: 'Đã chốt lịch', expectedState: 'Dự kiến', uncertain: 'Chưa chắc', inferred: 'Suy ra từ dữ liệu',
      locale: 'Ngôn ngữ', vietnamese: 'Tiếng Việt', english: 'English', advancedModel: 'Chi tiết mô hình thanh khoản',
      noOperatingReserve: 'Chưa đặt mức dự phòng vận hành. Buffer hiện chỉ phản ánh nhu cầu thanh khoản từ lịch tiền.',
      conservativeNote: 'Rootflow không dùng tiền vào Dự kiến để chứng minh trạng thái an toàn.',
      bufferFormula: 'Buffer = thiếu hụt tích lũy lớn nhất + nghĩa vụ tháng chưa có ngày + chi phí đáo thẻ kiểm soát.',
      currentCashExplanation: 'Số dư hiện tại lấy từ snapshot gần nhất; giao dịch đã nằm trong snapshot sẽ không bị cộng lại.',
      monthlyObligations: 'Nghĩa vụ tháng', expectedIncomeNotDated: 'Thu nhập kỳ vọng chưa có ngày nhận sẽ không được đặt giả vào lịch.'
    },
    en: {
      overview: 'Overview', cashCalendar: 'Cash Calendar', funding: 'Debt & Lending', plan: 'Plan',
      availableCash: 'Available cash', asOf: 'As of', next30Days: 'Next 30 days',
      cashNeeded: 'Minimum cash required', recommendedCash: 'Cash to keep', additionalNeeded: 'Additional cash needed',
      surplus: 'Surplus above buffer', pressureDate: 'Pressure date', why: 'Why did Rootflow calculate this?',
      reliableInflows: 'Committed inflows', expectedInflows: 'Expected inflows', recurringIncome: 'Monthly income without a date',
      mandatoryOutflows: 'Mandatory outflows', undatedDebt: 'Monthly obligations without a date', rolloverCost: 'Estimated card rollover cost',
      projectedLow: 'Projected low', conservative: 'Conservative', expected: 'Expected',
      debtCalendar: 'Debt calendar', next7: 'Next 7 days', next30: 'Next 30 days', largestPayment: 'Largest payment',
      date: 'Date', creditor: 'Obligation', principal: 'Principal', interest: 'Interest', fee: 'Fee', total: 'Total',
      monthlyUndated: 'This month · date unknown', controlAssumption: 'Control assumption',
      cashBridge: 'Cash bridge', openingCash: 'Opening cash', closingCash: 'Cash after obligations',
      lendingBook: 'Lending book', lendingPrincipal: 'Lending principal', longTermLending: 'Long-term lending principal',
      lendingInterest: 'Monthly lending interest', totalDebt: 'Total debt', fundingLinks: 'Funding links',
      funds: 'funds', noFundingLinks: 'No receivable is directly linked to a borrowing source yet.',
      actual: 'Actual', committed: 'Committed', expectedState: 'Expected', uncertain: 'Uncertain', inferred: 'Inferred',
      locale: 'Language', vietnamese: 'Tiếng Việt', english: 'English', advancedModel: 'Liquidity model details',
      noOperatingReserve: 'No operating reserve is set. The current buffer only reflects cash requirements from the cash schedule.',
      conservativeNote: 'Rootflow does not use Expected inflows to prove that liquidity is safe.',
      bufferFormula: 'Buffer = maximum cumulative funding gap + undated monthly obligations + control rollover cost.',
      currentCashExplanation: 'Current cash comes from the latest snapshot; transactions already embedded in that snapshot are not replayed.',
      monthlyObligations: 'Monthly obligations', expectedIncomeNotDated: 'Expected income without a known payday is not assigned a fake calendar date.'
    }
  };

  function normalize(locale) { return locale === 'en' ? 'en' : 'vi'; }
  function getLocale() {
    try { return normalize(global.localStorage.getItem(KEY) || DEFAULT_LOCALE); }
    catch (e) { return DEFAULT_LOCALE; }
  }
  function setLocale(locale) {
    var next = normalize(locale);
    try { global.localStorage.setItem(KEY, next); } catch (e) {}
    document.documentElement.lang = next;
    global.dispatchEvent(new CustomEvent('rootflow:locale', { detail: { locale: next } }));
    return next;
  }
  function t(key, vars) {
    var locale = getLocale();
    var text = (DICT[locale] && DICT[locale][key]) || (DICT.vi && DICT.vi[key]) || key;
    Object.keys(vars || {}).forEach(function (name) {
      text = text.replace(new RegExp('\\{' + name + '\\}', 'g'), String(vars[name]));
    });
    return text;
  }

  global.RootflowI18n = { getLocale: getLocale, setLocale: setLocale, t: t, dictionary: DICT };
  document.documentElement.lang = getLocale();
})(window);
