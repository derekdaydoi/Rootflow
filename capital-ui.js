/* Rootflow V4 — Capital OS UI.
   Visual layer for the Personal Capital & Cashflow Operating System.
   Financial semantics live in domain/store. This file only presents decisions
   and lightweight planning edits; it does not rewrite ledger data. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  var S = global.RootflowStore;
  if (!D || !S || !D.v4FinalSummary) return;

  var cashflowHorizon = 30;
  var capitalMode = 'positions';
  var refreshTimer = null;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(value, signed) {
    var n = Number(value) || 0;
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    var text;
    try { text = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.abs(n)); }
    catch (e) { text = String(Math.round(Math.abs(n))); }
    return sign + text + ' ₫';
  }

  function compactMoney(value, signed) {
    var n = Number(value) || 0;
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    var a = Math.abs(n);
    var text;
    if (a >= 1e9) text = (Math.round(a / 1e8) / 10).toString().replace('.0', '') + 'B';
    else if (a >= 1e6) text = (Math.round(a / 1e5) / 10).toString().replace('.0', '') + 'M';
    else if (a >= 1e3) text = (Math.round(a / 1e2) / 10).toString().replace('.0', '') + 'K';
    else text = String(Math.round(a));
    return sign + text;
  }

  function pct(value) {
    var n = Number(value);
    if (!isFinite(n)) return '—';
    return (Math.round(n * 10) / 10).toString().replace('.', ',') + '%';
  }

  function fmtDate(value, year) {
    if (!value) return 'Chưa rõ ngày';
    var p = String(value).slice(0, 10).split('-');
    if (p.length !== 3) return String(value);
    return year ? p[2] + '/' + p[1] + '/' + p[0] : p[2] + '/' + p[1];
  }

  function monthLabel(ym) {
    var p = String(ym || '').split('-');
    return p.length === 2 ? 'Tháng ' + Number(p[1]) + '/' + p[0] : ym;
  }

  function getData() {
    var loaded = S.load();
    return loaded && loaded.data ? loaded.data : S.empty();
  }

  function activeViewIndex() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .nav-button'));
    for (var i = 0; i < nodes.length; i++) if (nodes[i].classList.contains('on')) return i;
    return 0;
  }

  function statusMeta(status) {
    if (status === 'SHORTFALL') return { cls: 'danger', label: 'Thiếu thanh khoản', note: 'Dòng tiền đã biết tạo funding gap.' };
    if (status === 'THIN_BUFFER') return { cls: 'warn', label: 'Buffer còn mỏng', note: 'Đủ nghĩa vụ tối thiểu nhưng chưa đạt mức dự phòng.' };
    return { cls: 'good', label: 'Thanh khoản ổn', note: 'Dòng tiền chắc chắn đang nằm trong vùng an toàn.' };
  }

  function confidenceMeta(value) {
    var key = String(value || 'UNKNOWN').toUpperCase();
    if (key === 'CERTAIN') return { cls: 'certain', label: 'Chắc chắn' };
    if (key === 'EXPECTED' || key === 'INFERRED') return { cls: 'expected', label: 'Dự kiến' };
    return { cls: 'uncertain', label: 'Chưa chắc' };
  }

  function icon(name) {
    var paths = {
      cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 10h.01M17 14h.01"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>',
      flow: '<path d="M4 7h12m0 0-3-3m3 3-3 3M20 17H8m0 0 3-3m-3 3 3 3"/>',
      capital: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
      card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18M7 15h4"/>',
      bank: '<path d="m3 9 9-5 9 5M5 10v7m5-7v7m4-7v7m5-7v7M3 20h18"/>',
      person: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      salary: '<path d="M4 7h16v11H4zM8 7V4h8v3M8 12h8"/>',
      living: '<path d="M4 11 12 4l8 7v9H4Z"/><path d="M9 20v-6h6v6"/>',
      edit: '<path d="m4 20 4.5-1 9.8-9.8-3.5-3.5L5 15.5 4 20Z"/><path d="m13.8 6.7 3.5 3.5"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
    };
    return '<svg class="rf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.info) + '</svg>';
  }

  function ensureSlot(content, id) {
    var node = document.getElementById(id);
    if (!node || node.parentNode !== content) {
      if (node) node.remove();
      node = document.createElement('section');
      node.id = id;
      node.className = 'v4-panel';
      content.insertBefore(node, content.firstChild);
    }
    return node;
  }

  function cleanupPanels(content, keep) {
    Array.prototype.forEach.call(content.querySelectorAll('.v4-panel'), function (node) {
      if (node.id !== keep) node.remove();
    });
  }

  function translateChrome(view) {
    var labels = ['Hôm nay', 'Dòng tiền', 'Vốn', 'Kế hoạch'];
    var nav = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .nav-button span'));
    labels.forEach(function (label, i) { if (nav[i]) nav[i].textContent = label; });
    var title = document.querySelector('.appbar-title:not(.brand)');
    if (title) title.textContent = view === 1 ? 'Dòng tiền' : view === 2 ? 'Vốn' : view === 3 ? 'Kế hoạch' : title.textContent;
    var add = document.querySelector('.bottom-nav .nav-add');
    if (add) {
      add.setAttribute('aria-label', 'Thêm khoản mới');
      add.setAttribute('title', 'Thêm khoản mới');
    }
  }

  function metric(label, value, note, cls) {
    return '<div class="rf-metric ' + esc(cls || '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div>';
  }

  function sectionTitle(title, action, attr) {
    return '<div class="rf-section-head"><h2>' + esc(title) + '</h2>' + (action ? '<button type="button" class="rf-text-action" ' + attr + '>' + esc(action) + '</button>' : '') + '</div>';
  }

  function chartPath(points, min, max, width, height, padX, padY) {
    if (!points || !points.length) return '';
    var range = Math.max(1, max - min);
    return points.map(function (point, i) {
      var x = padX + (width - padX * 2) * (points.length === 1 ? 0 : i / (points.length - 1));
      var y = padY + (height - padY * 2) * (1 - (Number(point.value) - min) / range);
      return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
  }

  function chartHtml(confirmed, expected, reference) {
    var cp = confirmed && confirmed.points || [];
    var ep = expected && expected.points || [];
    var values = cp.concat(ep).map(function (p) { return Number(p.value) || 0; });
    values.push(0, Math.max(0, Number(reference) || 0));
    var min = Math.min.apply(Math, values.length ? values : [0]);
    var max = Math.max.apply(Math, values.length ? values : [1]);
    if (max === min) max = min + 1;
    var width = 340, height = 150, px = 8, py = 14;
    var confirmedPath = chartPath(cp, min, max, width, height, px, py);
    var expectedPath = chartPath(ep, min, max, width, height, px, py);
    var refY = py + (height - py * 2) * (1 - (Math.max(0, Number(reference) || 0) - min) / Math.max(1, max - min));
    var low = confirmed && confirmed.projectedLow;
    return '<div class="rf-chart-wrap">' +
      '<svg class="rf-chart" viewBox="0 0 340 150" role="img" aria-label="Dự phóng số dư tiền theo thời gian">' +
        '<line class="rf-chart-grid" x1="8" x2="332" y1="136" y2="136"/>' +
        '<line class="rf-chart-buffer" x1="8" x2="332" y1="' + refY.toFixed(1) + '" y2="' + refY.toFixed(1) + '"/>' +
        (expectedPath ? '<path class="rf-chart-expected" d="' + expectedPath + '"/>' : '') +
        (confirmedPath ? '<path class="rf-chart-confirmed" d="' + confirmedPath + '"/>' : '') +
      '</svg>' +
      '<div class="rf-chart-legend"><span><i class="confirmed"></i>Kịch bản chắc chắn</span><span><i class="expected"></i>Có dòng tiền dự kiến</span><span><i class="buffer"></i>Mức nên giữ</span></div>' +
      (low !== undefined ? '<div class="rf-chart-low">Điểm thấp nhất: <strong>' + esc(money(low)) + '</strong></div>' : '') +
    '</div>';
  }

  function eventLabel(event) {
    var kind = String(event.kind || '');
    if (kind === 'repay') return event.name || 'Trả khoản vay';
    if (kind === 'collect') return event.name || 'Thu khoản cho vay';
    if (kind === 'income') return event.name || 'Thu nhập';
    if (kind === 'expense') return event.name || 'Chi tiêu';
    if (kind === 'borrow') return event.name || 'Nhận vốn vay';
    if (kind === 'lend') return event.name || 'Đưa vốn ra';
    if (kind === 'interest_out' || kind === 'fee') return event.name || 'Chi phí vốn';
    return event.name || (Number(event.amount) >= 0 ? 'Tiền vào' : 'Tiền ra');
  }

  function eventRow(event) {
    var confidence = confidenceMeta(event.confidence);
    var amount = Number(event.amount) || 0;
    return '<div class="rf-event-row">' +
      '<time datetime="' + esc(event.date) + '">' + esc(fmtDate(event.date, false)) + '</time>' +
      '<div class="rf-event-copy"><strong>' + esc(eventLabel(event)) + '</strong><span class="rf-confidence ' + confidence.cls + '">' + esc(confidence.label) + '</span></div>' +
      '<b class="' + (amount < 0 ? 'negative' : 'positive') + '">' + esc(money(amount, true)) + '</b>' +
    '</div>';
  }

  function homeHtml(summary, data) {
    var op = summary.operating;
    var status = statusMeta(op.status);
    var events = (summary.upcoming || []).slice(0, 5);
    var confirmed = D.v4ProjectionSummary(data, 30, 'confirmed');
    var expected = D.v4ProjectionSummary(data, 30, 'expected');
    var today = D.today();
    return '<div class="rf-os-screen rf-home">' +
      '<header class="rf-home-intro"><span>' + esc(fmtDate(today, true)) + '</span><p>Quyền sử dụng tiền, không chỉ số dư.</p></header>' +
      '<section class="rf-available-hero">' +
        '<div class="rf-hero-label">TIỀN CÓ THỂ DÙNG</div>' +
        '<div class="rf-hero-value">' + esc(money(op.availableCash)) + '</div>' +
        '<div class="rf-hero-breakdown"><span>Tiền hiện có <strong>' + esc(money(op.currentCash)) + '</strong></span><span>Cần giữ <strong>' + esc(money(op.recommendedCash)) + '</strong></span></div>' +
        '<button type="button" class="rf-hero-explain" data-rf-detail="available">Xem cách tính ' + icon('chevron') + '</button>' +
      '</section>' +
      '<section class="rf-card rf-liquidity-card">' +
        '<div class="rf-status-line"><span class="rf-status-dot ' + status.cls + '"></span><div><strong>' + esc(status.label) + '</strong><small>' + esc(status.note) + '</small></div></div>' +
        '<div class="rf-liquidity-kpis">' + metric('Điểm thấp nhất 30 ngày', money(op.projectedLow), op.pressureDate ? 'Áp lực: ' + fmtDate(op.pressureDate, false) : '', op.projectedLow < 0 ? 'danger' : '') + metric('Vốn có thể triển khai', money(op.deployableCapital), 'Sau buffer & sinh hoạt', op.deployableCapital > 0 ? 'good' : '') + '</div>' +
        chartHtml(confirmed, expected, op.recommendedCash) +
      '</section>' +
      '<section class="rf-card">' + sectionTitle('Việc sắp tới', events.length > 5 ? 'Xem tất cả' : '', 'data-rf-go-cashflow="1"') +
        '<div class="rf-event-list">' + (events.length ? events.map(eventRow).join('') : '<p class="rf-empty">Chưa có dòng tiền tương lai có ngày cụ thể.</p>') + '</div>' +
      '</section>' +
      '<section class="rf-home-plan-grid">' +
        '<div class="rf-card rf-compact-card"><div class="rf-card-icon">' + icon('living') + '</div><span>Sinh hoạt còn lại</span><strong>' + esc(money(op.living.remaining)) + '</strong><small>' + esc(monthLabel(op.living.month)) + '</small></div>' +
        '<div class="rf-card rf-compact-card"><div class="rf-card-icon">' + icon('capital') + '</div><span>Vốn deploy an toàn</span><strong>' + esc(money(op.deployableCapital)) + '</strong><small>Không xuyên buffer</small></div>' +
      '</section>' +
    '</div>';
  }

  function cashflowHtml(data) {
    var op = D.v4OperatingSummary(data, cashflowHorizon);
    var events = D.v4FutureEvents(data, cashflowHorizon);
    var confirmed = D.v4ProjectionSummary(data, cashflowHorizon, 'confirmed');
    var expected = D.v4ProjectionSummary(data, cashflowHorizon, 'expected');
    var status = statusMeta(op.status);
    return '<div class="rf-os-screen rf-cashflow">' +
      '<div class="rf-segmented" role="group" aria-label="Khoảng dự phóng">' +
        [7, 30, 90].map(function (days) { return '<button type="button" data-rf-horizon="' + days + '" class="' + (cashflowHorizon === days ? 'on' : '') + '">' + (days === 90 ? '3 tháng' : days + ' ngày') + '</button>'; }).join('') +
      '</div>' +
      '<section class="rf-card">' +
        '<div class="rf-screen-title"><div><span>SỐ DƯ DỰ KIẾN</span><strong>' + esc(money(op.projectedLow)) + '</strong></div><span class="rf-state-pill ' + status.cls + '">' + esc(status.label) + '</span></div>' +
        chartHtml(confirmed, expected, op.recommendedCash) +
      '</section>' +
      '<section class="rf-stat-grid">' +
        metric('Hiện có', money(op.currentCash), '', '') +
        metric('Cần giữ', money(op.recommendedCash), 'Tối thiểu + dự phòng', '') +
        metric('Có thể dùng', money(op.availableCash), '', op.availableCash > 0 ? 'good' : '') +
      '</section>' +
      '<section class="rf-card">' + sectionTitle('Dòng tiền theo thời gian') +
        '<div class="rf-event-list">' + (events.length ? events.map(eventRow).join('') : '<p class="rf-empty">Chưa có dòng tiền tương lai trong khoảng này.</p>') + '</div>' +
      '</section>' +
    '</div>';
  }

  function positionKindLabel(kind) {
    if (kind === 'lending') return 'Cho vay';
    if (kind === 'investment') return 'Đầu tư';
    if (kind === 'asset') return 'Tài sản';
    return 'Vốn';
  }

  function positionRow(row) {
    return '<div class="rf-position-row"><div class="rf-position-mark ' + esc(row.kind) + '">' + esc((row.name || '?').slice(0, 1).toUpperCase()) + '</div><div class="rf-position-copy"><strong>' + esc(row.name) + '</strong><span>' + esc(positionKindLabel(row.kind)) + (row.nextDate ? ' · ' + esc(fmtDate(row.nextDate, false)) : '') + '</span></div><div class="rf-position-value"><strong>' + esc(money(row.value)) + '</strong>' + (row.recurringIncome ? '<span>+' + esc(compactMoney(row.recurringIncome)) + '/th</span>' : '') + '</div></div>';
  }

  function sourceKindLabel(kind) {
    if (kind === 'credit_card') return 'Thẻ tín dụng';
    if (kind === 'agent') return 'Vay Agent';
    return 'Vay trả góp';
  }

  function sourceIcon(kind) { return kind === 'credit_card' ? 'card' : kind === 'agent' ? 'person' : 'bank'; }

  function rateLabel(source) {
    var rate = Number(source.interestRate) || 0;
    if (!(rate > 0)) return 'Không ghi nhận lãi suất';
    var period = String(source.interestRatePeriod || '').toLowerCase();
    if (period === 'annual' || period === 'yearly' || period === 'apr') return 'APR ' + pct(rate);
    return 'Lãi suất kỳ ' + pct(rate);
  }

  function fundingRow(source) {
    var meta = [];
    if (source.kind === 'credit_card') {
      if (source.statementDay) meta.push('Sao kê ngày ' + source.statementDay);
      else if (source.statementDate) meta.push('Sao kê ' + fmtDate(source.statementDate, false));
      if (source.dueDate) meta.push('Đến hạn ' + fmtDate(source.dueDate, false));
      else if (source.dueDay) meta.push('Đến hạn ngày ' + source.dueDay);
      if (source.maxInterestFreeDays) meta.push('Tối đa ' + source.maxInterestFreeDays + ' ngày miễn lãi');
      if (source.rolloverFeeRate) meta.push('Phí đáo ' + pct(source.rolloverFeeRate));
    } else {
      meta.push(rateLabel(source));
      if (source.maturityDate) meta.push('Kết thúc ' + fmtDate(source.maturityDate, false));
    }
    return '<div class="rf-funding-row">' +
      '<div class="rf-funding-icon ' + esc(source.kind) + '">' + icon(sourceIcon(source.kind)) + '</div>' +
      '<div class="rf-funding-copy"><div><strong>' + esc(source.name) + '</strong><span>' + esc(sourceKindLabel(source.kind)) + '</span></div><small>' + esc(meta.join(' · ') || 'Chưa đủ dữ liệu kỳ hạn') + '</small></div>' +
      '<div class="rf-funding-value"><strong>' + esc(money(source.balance)) + '</strong><span>Dư nợ</span></div>' +
    '</div>';
  }

  function capitalHtml(summary) {
    var cap = summary.capital;
    if (capitalMode === 'funding') {
      return '<div class="rf-os-screen rf-capital">' +
        '<div class="rf-capital-tabs"><button type="button" data-rf-capital-mode="positions">Tổng quan</button><button type="button" data-rf-capital-mode="funding" class="on">Nguồn vốn</button></div>' +
        '<section class="rf-card">' + sectionTitle('Nguồn vốn đang sử dụng', 'Thêm', 'data-rf-trigger-add="1"') +
          '<div class="rf-funding-list">' + (cap.fundingSources.length ? cap.fundingSources.map(fundingRow).join('') : '<p class="rf-empty">Chưa có nguồn vốn vay đang hoạt động.</p>') + '</div>' +
        '</section>' +
        '<section class="rf-card rf-capital-economics">' + sectionTitle('Chi phí vốn') +
          '<div class="rf-two-col">' + metric('Chi phí vốn / tháng', money(cap.fundingCostMonthly), 'Gồm estimate/control nếu cần', cap.fundingCostMonthly > 0 ? '' : 'good') + metric('Thu nhập từ vốn / tháng', money(cap.capitalIncomeMonthly), '', cap.capitalIncomeMonthly > 0 ? 'good' : '') + '</div>' +
          '<div class="rf-net-result"><span>Chênh lệch ròng</span><strong class="' + (cap.netCapitalIncomeMonthly < 0 ? 'negative' : 'positive') + '">' + esc(money(cap.netCapitalIncomeMonthly, true)) + '</strong></div>' +
        '</section>' +
      '</div>';
    }

    return '<div class="rf-os-screen rf-capital">' +
      '<div class="rf-capital-tabs"><button type="button" data-rf-capital-mode="positions" class="on">Tổng quan</button><button type="button" data-rf-capital-mode="funding">Nguồn vốn</button></div>' +
      '<section class="rf-card rf-capital-hero">' +
        '<span>TỔNG VỐN ĐANG QUẢN LÝ</span><strong>' + esc(money(cap.totalManagedCapital)) + '</strong>' +
        '<div class="rf-capital-split"><span>Đang sinh lợi <b>' + esc(money(cap.earningCapital)) + '</b></span><span>Tiền mặt <b>' + esc(money(cap.cash)) + '</b></span><span>Chi tháng này <b>' + esc(money(cap.personalSpendThisMonth)) + '</b></span></div>' +
      '</section>' +
      '<section class="rf-card">' + sectionTitle('Vốn đang chạy', 'Thêm', 'data-rf-trigger-add="1"') +
        '<div class="rf-position-list">' + (cap.positions.length ? cap.positions.map(positionRow).join('') : '<p class="rf-empty">Chưa có khoản cho vay, đầu tư hoặc tài sản đang theo dõi.</p>') + '</div>' +
      '</section>' +
      '<section class="rf-card rf-capital-economics">' + sectionTitle('Hiệu quả vốn') +
        '<div class="rf-two-col">' + metric('Thu nhập từ vốn', money(cap.capitalIncomeMonthly), '/ tháng', cap.capitalIncomeMonthly > 0 ? 'good' : '') + metric('Chi phí vốn', money(cap.fundingCostMonthly), '/ tháng', '') + '</div>' +
        '<div class="rf-net-result"><span>Ròng theo dữ liệu hiện có</span><strong class="' + (cap.netCapitalIncomeMonthly < 0 ? 'negative' : 'positive') + '">' + esc(money(cap.netCapitalIncomeMonthly, true)) + '</strong></div>' +
      '</section>' +
    '</div>';
  }

  function editablePlanCard(iconName, title, value, rows, kind) {
    return '<section class="rf-card rf-plan-card">' +
      '<div class="rf-plan-head"><div class="rf-card-icon">' + icon(iconName) + '</div><div><span>' + esc(title) + '</span><strong>' + esc(value) + '</strong></div><button type="button" class="rf-icon-action" data-rf-edit-plan="' + esc(kind) + '" aria-label="Chỉnh ' + esc(title) + '">' + icon('edit') + '</button></div>' +
      '<div class="rf-plan-rows">' + rows + '</div>' +
    '</section>';
  }

  function planHtml(summary) {
    var income = summary.incomePlan;
    var op = summary.operating;
    var living = op.living;
    var incomeRows = '<span>Mặc định <b>' + esc(money(income.defaultAmount)) + '</b></span>' + '<span>Ngày nhận <b>' + esc(income.paymentDay ? String(income.paymentDay) : 'Chưa đặt') + '</b></span>' + '<span>' + esc(monthLabel(income.month)) + ' <b>' + esc(money(income.plannedAmount)) + (income.hasOverride ? ' · override' : '') + '</b></span>';
    var livingRows = '<span>Đã dùng <b>' + esc(money(living.spent)) + '</b></span><span>Còn lại <b>' + esc(money(living.remaining)) + '</b></span><span>Chưa lên lịch <b>' + esc(money(living.unscheduledReserve)) + '</b></span>';
    var bufferRows = '<span>Tối thiểu theo timeline <b>' + esc(money(op.requiredCash)) + '</b></span><span>Dự phòng thêm <b>' + esc(money(op.safetyReserve)) + '</b></span><span>Mức nên giữ <b>' + esc(money(op.recommendedCash)) + '</b></span>';
    return '<div class="rf-os-screen rf-plan">' +
      '<div class="rf-plan-intro"><h1>Kế hoạch</h1><p>Chỉnh assumption và xem tác động trực tiếp lên quyền sử dụng vốn.</p></div>' +
      editablePlanCard('salary', 'Thu nhập', money(income.plannedAmount), incomeRows, 'salary') +
      editablePlanCard('living', 'Sinh hoạt', money(living.target), livingRows, 'living') +
      editablePlanCard('shield', 'Buffer', money(op.recommendedCash), bufferRows, 'buffer') +
      '<section class="rf-card rf-consequence-card"><span>SAU CÁC GIẢ ĐỊNH HIỆN TẠI</span><div class="rf-consequence-grid">' + metric('Tiền có thể dùng', money(op.availableCash), '', op.availableCash > 0 ? 'good' : '') + metric('Vốn có thể deploy', money(op.deployableCapital), '', op.deployableCapital > 0 ? 'good' : '') + '</div><small>Mọi thay đổi ở trên được tính lại ngay; không biến Expected thành tiền chắc chắn.</small></section>' +
    '</div>';
  }

  function explainAvailableHtml(summary) {
    var op = summary.operating;
    var req = op.requirement;
    return '<div class="rf-explain-stack">' +
      '<section class="rf-explain-total"><span>Tiền hiện có</span><strong>' + esc(money(op.currentCash)) + '</strong></section>' +
      '<section class="rf-card"><h2>Cần giữ</h2>' +
        '<div class="rf-explain-row"><span>Nghĩa vụ có ngày</span><strong>' + esc(money(req.datedNeed)) + '</strong></div>' +
        '<div class="rf-explain-row"><span>Nghĩa vụ tháng chưa rõ ngày</span><strong>' + esc(money(req.undatedNeed)) + '</strong></div>' +
        '<div class="rf-explain-row"><span>Chi phí đáo thẻ dự kiến</span><strong>' + esc(money(req.rolloverNeed)) + '</strong></div>' +
        '<div class="rf-explain-row"><span>Dự phòng an toàn</span><strong>' + esc(money(op.safetyReserve)) + '</strong></div>' +
        '<div class="rf-explain-row total"><span>Tổng cần giữ</span><strong>' + esc(money(op.recommendedCash)) + '</strong></div>' +
      '</section>' +
      '<section class="rf-available-result"><span>Tiền có thể dùng</span><strong>' + esc(money(op.availableCash)) + '</strong><small>Đây là phần cash chưa bị khóa bởi nghĩa vụ và buffer. Sinh hoạt và deploy vốn cùng sử dụng phần này.</small></section>' +
    '</div>';
  }

  function overlay(title, html, extraClass) {
    closeOverlay();
    var node = document.createElement('div');
    node.id = 'rf-os-overlay';
    node.className = 'rf-os-overlay ' + (extraClass || '');
    node.innerHTML = '<div class="rf-overlay-page"><header class="rf-overlay-head"><button type="button" class="rf-overlay-close" aria-label="Quay lại">‹</button><strong>' + esc(title) + '</strong><span></span></header><main class="rf-overlay-body">' + html + '</main></div>';
    document.body.appendChild(node);
    document.body.classList.add('rf-os-overlay-open');
    node.querySelector('.rf-overlay-close').addEventListener('click', closeOverlay);
    return node;
  }

  function closeOverlay() {
    var node = document.getElementById('rf-os-overlay');
    if (node) node.remove();
    document.body.classList.remove('rf-os-overlay-open');
  }

  function openPlanEditor(kind) {
    var data = getData();
    var summary = D.v4FinalSummary(data);
    var ym = D.monthOf(D.today());
    var html = '';
    var title = '';
    if (kind === 'salary') {
      var income = summary.incomePlan;
      title = 'Chỉnh thu nhập';
      html = '<form class="rf-edit-form" data-rf-plan-form="salary">' +
        '<label><span>Lương / thu nhập mặc định</span><input name="defaultAmount" inputmode="numeric" value="' + esc(income.defaultAmount || 17000000) + '" placeholder="17.000.000"></label>' +
        '<label><span>Ngày nhận hàng tháng</span><input name="paymentDay" type="number" min="1" max="31" value="' + esc(income.paymentDay || 28) + '"></label>' +
        '<label><span>' + esc(monthLabel(ym)) + ' — chỉnh riêng</span><input name="overrideAmount" inputmode="numeric" value="' + esc(income.hasOverride ? income.plannedAmount : '') + '" placeholder="Để trống = dùng mặc định"></label>' +
        '<p>Override chỉ áp dụng cho tháng này; tháng khác tiếp tục dùng mức mặc định.</p>' +
        '<button type="submit" class="rf-save-button">Lưu thu nhập</button></form>';
    } else if (kind === 'living') {
      var living = summary.operating.living;
      title = 'Chỉnh sinh hoạt';
      html = '<form class="rf-edit-form" data-rf-plan-form="living">' +
        '<label><span>Mức sinh hoạt mặc định / tháng</span><input name="defaultTarget" inputmode="numeric" value="' + esc(living.defaultTarget || living.target || 7000000) + '"></label>' +
        '<label><span>' + esc(monthLabel(ym)) + ' — chỉnh riêng</span><input name="monthTarget" inputmode="numeric" value="' + esc(living.hasOverride ? living.target : '') + '" placeholder="Để trống = dùng mặc định"></label>' +
        '<p>Sinh hoạt là biến số. Phần chưa dùng sẽ làm giảm vốn có thể triển khai, không được tính như một khoản nợ.</p>' +
        '<button type="submit" class="rf-save-button">Lưu mức sinh hoạt</button></form>';
    } else {
      title = 'Chỉnh buffer';
      html = '<form class="rf-edit-form" data-rf-plan-form="buffer">' +
        '<label><span>Dự phòng an toàn thêm</span><input name="operatingBuffer" inputmode="numeric" value="' + esc(summary.operating.safetyReserve || 0) + '"></label>' +
        '<p>Required Cash vẫn được tính tự động từ timeline. Giá trị này chỉ là phần dự phòng cộng thêm.</p>' +
        '<button type="submit" class="rf-save-button">Lưu buffer</button></form>';
    }
    var node = overlay(title, html, 'rf-edit-overlay');
    var form = node.querySelector('[data-rf-plan-form]');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      savePlanForm(kind, form, ym);
    });
  }

  function numberFromInput(value) {
    var text = String(value || '').trim();
    if (!text) return null;
    if (D.parseMoney) return Math.max(0, Number(D.parseMoney(text)) || 0);
    return Math.max(0, Number(text.replace(/[^0-9.-]/g, '')) || 0);
  }

  function savePlanForm(kind, form, ym) {
    var data = getData();
    data.settings = data.settings || {};
    if (kind === 'salary') {
      var rows = data.recurringIncomes || (data.recurringIncomes = []);
      var income = rows.filter(function (row) { return row && !row.archived && row.type === 'employment_income'; })[0] || rows.filter(function (row) { return row && !row.archived && row.frequency === 'monthly'; })[0];
      if (!income) {
        income = { id:S.uid(), type:'employment_income', name:'Lương', frequency:'monthly', amountCertainty:'EXPECTED', fieldCertainty:{}, archived:false, note:'', createdAt:S.now() };
        rows.push(income);
      }
      income.expectedAmount = numberFromInput(form.elements.defaultAmount.value) || 0;
      income.paymentDay = Math.max(1, Math.min(31, Number(form.elements.paymentDay.value) || 28));
      income.monthlyOverrides = income.monthlyOverrides && typeof income.monthlyOverrides === 'object' ? income.monthlyOverrides : {};
      var override = numberFromInput(form.elements.overrideAmount.value);
      if (override === null) delete income.monthlyOverrides[ym];
      else income.monthlyOverrides[ym] = override;
      income.updatedAt = S.now();
    } else if (kind === 'living') {
      data.settings.defaultLivingTarget = numberFromInput(form.elements.defaultTarget.value) || 0;
      data.settings.monthlyLivingTargets = data.settings.monthlyLivingTargets && typeof data.settings.monthlyLivingTargets === 'object' ? data.settings.monthlyLivingTargets : {};
      var target = numberFromInput(form.elements.monthTarget.value);
      if (target === null) delete data.settings.monthlyLivingTargets[ym];
      else data.settings.monthlyLivingTargets[ym] = target;
    } else if (kind === 'buffer') {
      data.settings.operatingBuffer = numberFromInput(form.elements.operatingBuffer.value) || 0;
      data.settings.comfortBuffer = Math.max(Number(data.settings.comfortBuffer) || 0, data.settings.operatingBuffer);
    }
    S.save(data);
    closeOverlay();
    render();
  }

  function triggerLegacyAdd() {
    var add = document.querySelector('.bottom-nav .nav-add');
    if (add) add.click();
  }

  function goCashflow() {
    var nav = document.querySelectorAll('.bottom-nav .nav-button');
    if (nav && nav[1]) nav[1].click();
  }

  function render() {
    var content = document.querySelector('.page > .content');
    if (!content) return;
    var data = getData();
    var hasAccounts = (data.accounts || []).some(function (account) { return account && !account.archived; });
    if (!hasAccounts) {
      content.classList.remove('rf-capital-os');
      Array.prototype.forEach.call(content.querySelectorAll('.v4-panel'), function (node) { node.remove(); });
      return;
    }

    var view = activeViewIndex();
    translateChrome(view);
    var id = view === 0 ? 'v4-today-panel' : view === 1 ? 'v4-cashflow-panel' : view === 2 ? 'v4-capital-panel' : 'v4-plan-panel';
    cleanupPanels(content, id);
    content.classList.add('rf-capital-os');
    content.setAttribute('data-rf-view', String(view));
    var panel = ensureSlot(content, id);
    var summary = D.v4FinalSummary(data);
    var html = view === 0 ? homeHtml(summary, data) : view === 1 ? cashflowHtml(data) : view === 2 ? capitalHtml(summary) : planHtml(summary);
    panel.innerHTML = html;
  }

  function refreshSoon() {
    if (refreshTimer) global.clearTimeout(refreshTimer);
    refreshTimer = global.setTimeout(function () { refreshTimer = null; render(); }, 24);
  }

  document.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('[data-rf-detail],[data-rf-horizon],[data-rf-capital-mode],[data-rf-edit-plan],[data-rf-trigger-add],[data-rf-go-cashflow]');
    if (!target) { refreshSoon(); return; }
    if (target.hasAttribute('data-rf-detail')) {
      event.preventDefault();
      var data = getData();
      var summary = D.v4FinalSummary(data);
      overlay('Tiền có thể dùng', explainAvailableHtml(summary));
      return;
    }
    if (target.hasAttribute('data-rf-horizon')) {
      cashflowHorizon = Math.max(7, Number(target.getAttribute('data-rf-horizon')) || 30);
      render();
      return;
    }
    if (target.hasAttribute('data-rf-capital-mode')) {
      capitalMode = target.getAttribute('data-rf-capital-mode') === 'funding' ? 'funding' : 'positions';
      render();
      return;
    }
    if (target.hasAttribute('data-rf-edit-plan')) {
      openPlanEditor(target.getAttribute('data-rf-edit-plan'));
      return;
    }
    if (target.hasAttribute('data-rf-trigger-add')) { triggerLegacyAdd(); return; }
    if (target.hasAttribute('data-rf-go-cashflow')) { goCashflow(); return; }
  }, true);

  document.addEventListener('change', refreshSoon, true);
  global.addEventListener('storage', refreshSoon);
  global.addEventListener('load', refreshSoon);
  document.addEventListener('DOMContentLoaded', refreshSoon);
  global.setTimeout(render, 0);
  global.setTimeout(render, 80);
})(window);
