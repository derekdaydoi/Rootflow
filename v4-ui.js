/* Rootflow V4 — canonical mockup UI.
   The approved mockup is the visual source of truth. Finance logic stays in
   domain/store layers; this file translates that truth into a simple,
   decision-first mobile interface with content-aware layout variants. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  var S = global.RootflowStore;
  var I = global.RootflowI18n;
  if (!D || !S || !D.v4FinalSummary) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function locale() { return I && I.getLocale ? I.getLocale() : 'vi'; }

  function money(value, signed) {
    var n = Number(value) || 0;
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    var formatted;
    try {
      formatted = new Intl.NumberFormat(locale() === 'en' ? 'en-US' : 'vi-VN', { maximumFractionDigits: 0 }).format(Math.abs(n));
    } catch (e) {
      formatted = String(Math.round(Math.abs(n)));
    }
    return sign + formatted + ' ₫';
  }

  function pct(value) {
    if (value === null || value === undefined || !isFinite(Number(value))) return '—';
    return (Math.round(Number(value) * 10) / 10).toString().replace('.', ',') + '%';
  }

  function fmtDate(value, withYear) {
    if (!value) return 'Chưa rõ ngày';
    var p = String(value).slice(0, 10).split('-');
    if (p.length !== 3) return String(value);
    return withYear ? p[2] + '/' + p[1] + '/' + p[0] : p[2] + '/' + p[1];
  }

  function updatedLabel(data) {
    var snapshot = data && data.settings && data.settings.snapshotDate;
    if (snapshot) return fmtDate(snapshot, true);
    var raw = String(data && data.updatedAt || '').slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? fmtDate(raw, true) : fmtDate(D.today(), true);
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

  function ensureSlot(content, id) {
    var node = document.getElementById(id);
    if (!node) {
      node = document.createElement('section');
      node.id = id;
      node.className = 'v4-panel';
      content.insertBefore(node, content.firstChild);
    } else if (node.parentNode !== content) {
      node.remove();
      node = document.createElement('section');
      node.id = id;
      node.className = 'v4-panel';
      content.insertBefore(node, content.firstChild);
    }
    return node;
  }

  function setHtml(node, signature, html) {
    if (!node || node.getAttribute('data-rf-signature') === signature) return;
    node.setAttribute('data-rf-signature', signature);
    node.innerHTML = html;
  }

  function icon(name) {
    var path = '';
    if (name === 'debt') path = '<path d="M5 4.5h14v15H5z"/><path d="M8 2.5v4M16 2.5v4M5 9h14"/>';
    else if (name === 'business') path = '<path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 4-6"/><path d="M17 7h3v3"/>';
    else if (name === 'plan') path = '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z"/><path d="M6 6V4h11v2"/>';
    else if (name === 'invest') path = '<path d="M12 3v9h9A9 9 0 1 1 12 3Z"/><path d="M15 3.6A9 9 0 0 1 20.4 9H15Z"/>';
    else if (name === 'cash') path = '<path d="M3 7h18v10H3z"/><path d="M7 12h.01M17 12h.01"/><circle cx="12" cy="12" r="2.5"/>';
    else path = '<circle cx="12" cy="12" r="8"/>';
    return '<svg class="rf-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  function statusForDebt(debt) {
    if (debt.status === 'SHORTFALL') return { cls: 'danger', text: 'Thiếu tiền cho nghĩa vụ đã biết' };
    if (debt.status === 'THIN_BUFFER') return { cls: 'warn', text: 'Đủ trả nợ nhưng buffer còn mỏng' };
    return { cls: 'good', text: 'Đủ thanh khoản cho 30 ngày tới' };
  }

  function statusForBusiness(summary) {
    var b = summary.business;
    if (!b.hasBusiness) return { cls: 'neutral', text: 'Chưa đủ dữ liệu hoạt động' };
    if (b.netMonthlyProfitEstimate < 0) return { cls: 'danger', text: 'Hoạt động đang lỗ theo dữ liệu hiện có' };
    if (summary.debt.status !== 'COVERED' || b.next30BusinessCashMargin < 0) return { cls: 'warn', text: 'Có lãi nhưng cần chú ý dòng tiền' };
    return { cls: 'good', text: 'Hoạt động có lãi và thanh khoản ổn' };
  }

  function miniKpi(label, value, note, cls) {
    return '<div class="rf-mini-kpi ' + esc(cls || '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div>';
  }

  function pair(label, value, cls) {
    return '<div class="rf-pair-item ' + esc(cls || '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function decisionCard(opts) {
    return '<button type="button" class="rf-decision-card" data-rf-detail="' + esc(opts.detail) + '">' +
      '<div class="rf-card-title-row"><span class="rf-card-icon ' + esc(opts.icon) + '">' + icon(opts.icon) + '</span><strong>' + esc(opts.title) + '</strong><span class="rf-chevron">›</span></div>' +
      '<div class="rf-pair">' + pair(opts.leftLabel, opts.leftValue, opts.leftClass) + pair(opts.rightLabel, opts.rightValue, opts.rightClass) + '</div>' +
      '<div class="rf-card-status ' + esc(opts.statusClass) + '"><span class="rf-dot"></span><span>' + esc(opts.statusText) + '</span></div>' +
      (opts.note ? '<div class="rf-card-note">' + esc(opts.note) + '</div>' : '') +
    '</button>';
  }

  function homeHtml(summary, data) {
    var bs = summary.balanceSheet;
    var d = summary.debt;
    var b = summary.business;
    var budget = summary.budget;
    var inv = summary.investments;
    var ds = statusForDebt(d);
    var bus = statusForBusiness(summary);
    var budgetStatus = !budget.hasPlan ? 'Chưa có kế hoạch chi tiêu' : budget.remaining < 0 ? 'Đã vượt ngân sách tháng' : 'Đang trong kế hoạch tháng';
    var budgetClass = !budget.hasPlan ? 'neutral' : budget.remaining < 0 ? 'danger' : 'good';

    return '<div class="rf-dashboard">' +
      '<header class="rf-greeting"><h1>Chào ngày mới Bro! <span aria-hidden="true">👋</span></h1><p>Cập nhật gần nhất: ' + esc(updatedLabel(data)) + '</p></header>' +
      '<button type="button" class="rf-networth-hero" data-rf-detail="assets"><span>TÀI SẢN RÒNG</span><strong>' + esc(money(bs.ownCapital)) + '</strong><small>= Tổng tài sản − Tổng nợ</small><b aria-hidden="true">›</b></button>' +
      '<div class="rf-kpi-strip">' +
        miniKpi('Tổng tài sản', money(bs.totalAssets), '', '') +
        miniKpi('Vốn của bạn', money(bs.ownCapital), pct(bs.equityToAssetsPct) + ' tài sản', bs.ownCapital < 0 ? 'danger' : '') +
        miniKpi('Tổng nợ', money(bs.totalDebt), pct(bs.debtToAssetsPct) + ' tài sản', bs.totalDebt > bs.totalAssets ? 'danger' : '') +
      '</div>' +
      '<div class="rf-section-label">TÌNH HÌNH HIỆN TẠI</div>' +
      decisionCard({ detail:'debt', icon:'debt', title:'Nợ & Thanh khoản', leftLabel:'Nợ 30 ngày', leftValue:money(d.due30), rightLabel:'Cash khả dụng', rightValue:money(d.availableBeforeDebt), statusClass:ds.cls, statusText:ds.text, note:d.pressureDate ? 'Áp lực lớn nhất: ' + fmtDate(d.pressureDate, true) : '' }) +
      decisionCard({ detail:'business', icon:'business', title:'Hoạt động kinh doanh', leftLabel:'Lợi nhuận tháng', leftValue:money(b.netMonthlyProfitEstimate, true), leftClass:b.netMonthlyProfitEstimate < 0 ? 'danger' : 'good', rightLabel:'Dòng tiền 30 ngày', rightValue:money(b.next30BusinessCashMargin, true), rightClass:b.next30BusinessCashMargin < 0 ? 'danger' : 'good', statusClass:bus.cls, statusText:bus.text }) +
      decisionCard({ detail:'plan', icon:'plan', title:'Chi tiêu & Kế hoạch', leftLabel:'Chi tiêu tháng', leftValue:money(budget.spentAgainstPlan), rightLabel:'Ngân sách còn lại', rightValue:budget.hasPlan ? money(budget.remaining) : 'Chưa thiết lập', rightClass:budget.remaining < 0 ? 'danger' : '', statusClass:budgetClass, statusText:budgetStatus }) +
      decisionCard({ detail:'assets', icon:'invest', title:'Đầu tư', leftLabel:'Giá trị đầu tư', leftValue:money(inv.totalInvestedAssets), rightLabel:'Có thể triển khai', rightValue:money(summary.deployableAfterBuffer), rightClass:summary.deployableAfterBuffer > 0 ? 'good' : '', statusClass:'neutral', statusText:inv.totalInvestedAssets > 0 ? 'Đầu tư được tính riêng khỏi cash vận hành' : 'Chưa ghi nhận khoản đầu tư' }) +
    '</div>';
  }

  function metricRow(label, value, cls, note) {
    return '<div class="rf-metric-row ' + esc(cls || '') + '"><div><span>' + esc(label) + '</span>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div><strong>' + esc(value) + '</strong></div>';
  }

  function debtItem(row) {
    var pieces = [];
    var dated = Boolean(row && row.date);
    if (row.principal) pieces.push('Gốc ' + money(row.principal));
    if (row.interest) pieces.push('Lãi ' + money(row.interest));
    if (row.fee) pieces.push('Phí ' + money(row.fee));
    if (row.rollover) pieces.push('Đáo ' + money(row.rollover));
    var period = dated ? fmtDate(row.date, false) : row.datePrecision === 'month' ? 'Trong tháng' : 'Chưa rõ ngày';
    var periodNode = dated
      ? '<time datetime="' + esc(String(row.date).slice(0, 10)) + '">' + esc(period) + '</time>'
      : '<span class="rf-period-badge">' + esc(period) + '</span>';
    return '<div class="rf-obligation ' + (dated ? 'is-dated' : 'is-undated') + '">' +
      '<div class="rf-obligation-copy">' + periodNode + '<div class="rf-obligation-main"><strong>' + esc(row.name || 'Nghĩa vụ') + '</strong><small>' + esc(pieces.join(' · ') || row.note || 'Nghĩa vụ tài chính') + '</small></div></div>' +
      '<b>' + esc(money(row.total)) + '</b>' +
    '</div>';
  }

  function debtDetailHtml(summary) {
    var d = summary.debt;
    var ds = statusForDebt(d);
    var list = (d.calendar || []).slice(0, 8).map(debtItem).join('');
    var afterDebt = d.cashAfterDebt30;
    var target = Math.max(0, d.recommendedCashToKeep || 0);
    var ratio = target > 0 ? Math.max(0, Math.min(100, afterDebt / target * 100)) : 100;
    return '<div class="rf-detail-stack">' +
      '<section class="rf-detail-card"><h2>Nợ cần trả</h2><p class="rf-detail-kicker">Trong 30 ngày tới</p><div class="rf-detail-amount danger">' + esc(money(d.due30)) + '</div><div class="rf-obligation-list">' + (list || '<p class="rf-empty">Không có nghĩa vụ đã biết trong 30 ngày.</p>') + '</div></section>' +
      '<section class="rf-detail-card"><h2>Cash khả dụng trước hạn</h2>' + metricRow('Tiền mặt & ngân hàng', money(d.currentCash)) + metricRow('Tiền chắc chắn về', money(d.reliableInflows30), 'good') + metricRow('Tổng', money(d.availableBeforeDebt), 'good') + '</section>' +
      '<section class="rf-detail-card"><h2>Buffer sau khi trả nợ</h2><div class="rf-detail-amount ' + (afterDebt < 0 ? 'danger' : 'good') + '">' + esc(money(afterDebt)) + '</div><p class="rf-detail-kicker">Buffer mục tiêu: ' + esc(money(target)) + '</p><div class="rf-progress"><span style="width:' + ratio.toFixed(1) + '%"></span></div></section>' +
      '<section class="rf-pressure-card"><span class="rf-card-icon debt">' + icon('debt') + '</span><div><small>Áp lực lớn nhất</small><strong>' + esc(fmtDate(d.pressureDate || d.nextDueDate, true)) + '</strong><span>' + esc(ds.text) + '</span></div></section>' +
    '</div>';
  }

  function businessDetailHtml(summary) {
    var b = summary.business;
    var bus = statusForBusiness(summary);
    var out = Math.max(0, b.next30FundingCashCost || 0);
    var input = Math.max(0, b.next30LendingInterest || 0);
    var margin = b.next30BusinessCashMargin || 0;
    var reason = margin < 0 ? 'Hoạt động có thể có lợi nhuận nhưng dòng tiền vẫn âm khi lịch thu tiền và lịch hoàn vốn không trùng nhau.' : 'Dòng tiền hoạt động hiện không tạo thiếu hụt trong 30 ngày theo dữ liệu đã biết.';
    return '<div class="rf-detail-stack">' +
      '<section class="rf-detail-card"><h2>Hiệu quả kinh doanh <small>(tháng)</small></h2>' + metricRow('Thu từ cho vay', money(b.recurringLendingIncome), 'good') + metricRow('Chi phí vốn', '−' + money(b.knownFundingCostMonthly)) + metricRow('Lợi nhuận hoạt động', money(b.netMonthlyProfitEstimate, true), b.netMonthlyProfitEstimate < 0 ? 'danger' : 'good') + (!b.costDataComplete ? '<p class="rf-caution">Một phần chi phí vốn đang là planning estimate vì điều khoản thực tế chưa đủ dữ liệu.</p>' : '') + '</section>' +
      '<section class="rf-detail-card"><h2>Dòng tiền 30 ngày</h2>' + metricRow('Tiền vào từ cho vay', money(input), 'good') + metricRow('Chi phí vốn phải trả', '−' + money(out)) + metricRow('Dòng tiền ròng', money(margin, true), margin < 0 ? 'danger' : 'good') + '</section>' +
      '<section class="rf-detail-card"><h2>Vì sao?</h2><p class="rf-explain">' + esc(reason) + '</p></section>' +
      '<section class="rf-evaluation ' + esc(bus.cls) + '"><strong>' + esc(bus.text) + '</strong><span>Rootflow đánh giá lợi nhuận và khả năng trả nợ độc lập với nhau.</span></section>' +
    '</div>';
  }

  function assetComposition(summary) {
    var bs = summary.balanceSheet;
    var total = Math.max(0, bs.totalAssets || 0);
    function share(v) { return total > 0 ? Math.max(0, Number(v) || 0) / total * 100 : 0; }
    var p1 = share(bs.liquid), p2 = share(bs.receivables), p3 = share(bs.investments), p4 = share(bs.ownedAssets);
    var c1 = p1, c2 = p1 + p2, c3 = p1 + p2 + p3;
    return { p1:p1, p2:p2, p3:p3, p4:p4, c1:c1, c2:c2, c3:c3 };
  }

  function assetsBody(summary) {
    var bs = summary.balanceSheet;
    var c = assetComposition(summary);
    return '<section class="rf-detail-card rf-assets-summary"><p class="rf-detail-kicker">Tổng tài sản</p><div class="rf-detail-amount">' + esc(money(bs.totalAssets)) + '</div><div class="rf-asset-layout"><div class="rf-donut" style="--c1:' + c.c1.toFixed(2) + '%;--c2:' + c.c2.toFixed(2) + '%;--c3:' + c.c3.toFixed(2) + '%"></div><div class="rf-legend">' +
      '<span><i class="cash"></i><em>Tiền & NH</em><b>' + esc(pct(c.p1)) + '</b></span>' +
      '<span><i class="recv"></i><em>Khoản phải thu</em><b>' + esc(pct(c.p2)) + '</b></span>' +
      '<span><i class="inv"></i><em>Đầu tư</em><b>' + esc(pct(c.p3)) + '</b></span>' +
      '<span><i class="other"></i><em>Tài sản khác</em><b>' + esc(pct(c.p4)) + '</b></span>' +
      '</div></div></section>' +
      '<section class="rf-detail-card"><h2>Chi tiết</h2>' + metricRow('Tiền mặt & ngân hàng', money(bs.liquid)) + metricRow('Khoản phải thu (cho vay)', money(bs.receivables)) + metricRow('Đầu tư', money(bs.investments)) + metricRow('Tài sản khác', money(bs.ownedAssets)) + '</section>';
  }

  function planDetailHtml(summary) {
    var b = summary.budget;
    var inv = summary.investments;
    return '<div class="rf-detail-stack">' +
      '<section class="rf-detail-card"><h2>Kế hoạch chi tiêu</h2>' + (b.hasPlan ? metricRow('Ngân sách tháng', money(b.planned)) + metricRow('Đã chi', money(b.spentAgainstPlan)) + metricRow('Còn lại', money(b.remaining), b.remaining < 0 ? 'danger' : 'good') : '<p class="rf-empty">Chưa thiết lập ngân sách tháng.</p>') + '</section>' +
      '<section class="rf-detail-card"><h2>Đầu tư</h2>' + metricRow('Đầu tư tài chính', money(inv.financialInvestments)) + metricRow('Tài sản sở hữu', money(inv.ownedAssets)) + metricRow('Có thể triển khai', money(summary.deployableAfterBuffer), summary.deployableAfterBuffer > 0 ? 'good' : '') + '</section>' +
    '</div>';
  }

  function detailShell(title, body) {
    return '<div class="rf-detail-page"><header class="rf-detail-topbar"><button type="button" data-rf-close-detail aria-label="Quay lại">‹</button><strong>' + esc(title) + '</strong><span></span></header><main>' + body + '</main></div>';
  }

  function openDetail(kind) {
    var old = document.getElementById('rf-detail-overlay');
    if (old) old.remove();
    var data = getData();
    var summary = D.v4FinalSummary(data);
    var title = 'Chi tiết', body = '';
    if (kind === 'debt') { title = 'Nợ & Thanh khoản'; body = debtDetailHtml(summary); }
    else if (kind === 'business') { title = 'Hoạt động kinh doanh'; body = businessDetailHtml(summary); }
    else if (kind === 'plan') { title = 'Chi tiêu & Kế hoạch'; body = planDetailHtml(summary); }
    else { title = 'Tài sản'; body = '<div class="rf-detail-stack">' + assetsBody(summary) + '</div>'; }
    var overlay = document.createElement('div');
    overlay.id = 'rf-detail-overlay';
    overlay.className = 'rf-detail-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = detailShell(title, body);
    document.body.appendChild(overlay);
    document.body.classList.add('rf-detail-open');
    overlay.scrollTop = 0;
  }

  function closeDetail() {
    var overlay = document.getElementById('rf-detail-overlay');
    if (overlay) overlay.remove();
    document.body.classList.remove('rf-detail-open');
  }

  function cashflowHtml(summary) {
    var d = summary.debt;
    var list = (d.calendar || []).slice(0, 12).map(debtItem).join('');
    return '<div class="rf-screen">' +
      '<div class="rf-screen-metrics">' + miniKpi('Cash hiện có', money(d.currentCash), '', '') + miniKpi('Tiền chắc chắn về', money(d.reliableInflows30), '', 'good') + miniKpi('Nợ 30 ngày', money(d.due30), '', d.cashAfterDebt30 < 0 ? 'danger' : '') + '</div>' +
      '<section class="rf-detail-card"><div class="rf-screen-title"><h2>Lịch nghĩa vụ 30 ngày</h2><span>' + esc(d.pressureDate ? 'Áp lực: ' + fmtDate(d.pressureDate, true) : '') + '</span></div><div class="rf-obligation-list">' + (list || '<p class="rf-empty">Không có nghĩa vụ đã biết.</p>') + '</div></section>' +
      '<section class="rf-evaluation ' + esc(statusForDebt(d).cls) + '"><strong>' + esc(statusForDebt(d).text) + '</strong><span>Sau nghĩa vụ 30 ngày còn ' + esc(money(d.cashAfterDebt30)) + '.</span></section>' +
    '</div>';
  }

  function positionHtml(summary) {
    var d = summary.debt;
    return '<div class="rf-screen">' + assetsBody(summary) +
      '<section class="rf-detail-card"><h2>Cấu trúc nợ</h2>' + metricRow('Nợ ngắn hạn', money(d.shortDebt)) + metricRow('Nợ dài hạn', money(d.longDebt)) + (d.unknownDebt > 0 ? metricRow('Chưa xác định kỳ hạn', money(d.unknownDebt)) : '') + '</section>' +
    '</div>';
  }

  function planHtml(summary) {
    return '<div class="rf-screen">' + planDetailHtml(summary) + '</div>';
  }

  function translateChrome(view) {
    var nav = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .nav-button span'));
    ['Tổng quan','Dòng tiền','Tài sản','Kế hoạch'].forEach(function (label, i) {
      if (nav[i]) nav[i].textContent = label;
    });
    var title = document.querySelector('.appbar-title:not(.brand)');
    if (title) title.textContent = view === 1 ? 'Dòng tiền' : view === 2 ? 'Tài sản' : view === 3 ? 'Kế hoạch' : title.textContent;
    var lang = document.querySelector('.v4-lang-toggle');
    if (lang) lang.remove();
  }

  function cleanupPanels(content) {
    ['v3-overview-panel','v3-calendar-panel','v3-funding-panel','v3-advanced-label','v4-overview-panel','v4-cashflow-panel','v4-position-panel','v4-plan-panel'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node && node.parentNode !== content) node.remove();
    });
  }

  function render() {
    var content = document.querySelector('.page > .content');
    if (!content) return;
    var data = getData();
    var hasAccounts = (data.accounts || []).some(function (account) { return account && !account.archived; });
    if (!hasAccounts) {
      content.classList.remove('rf-canonical');
      return;
    }
    cleanupPanels(content);
    var summary = D.v4FinalSummary(data);
    var view = activeViewIndex();
    translateChrome(view);
    content.classList.add('rf-canonical');
    content.setAttribute('data-rf-view', String(view));

    var id = view === 0 ? 'v4-overview-panel' : view === 1 ? 'v4-cashflow-panel' : view === 2 ? 'v4-position-panel' : 'v4-plan-panel';
    ['v4-overview-panel','v4-cashflow-panel','v4-position-panel','v4-plan-panel'].forEach(function (other) {
      if (other !== id) { var node = document.getElementById(other); if (node) node.remove(); }
    });
    var panel = ensureSlot(content, id);
    panel.className = 'v4-panel ' + id;
    var html = view === 0 ? homeHtml(summary, data) : view === 1 ? cashflowHtml(summary) : view === 2 ? positionHtml(summary) : planHtml(summary);
    setHtml(panel, String(view) + '|' + String(data.updatedAt || '') + '|' + JSON.stringify(summary), html);
  }

  function refreshSoon() {
    global.setTimeout(render, 0);
    global.setTimeout(render, 80);
  }

  document.addEventListener('click', function (event) {
    var close = event.target.closest('[data-rf-close-detail]');
    if (close) { event.preventDefault(); closeDetail(); return; }
    var detail = event.target.closest('[data-rf-detail]');
    if (detail) { event.preventDefault(); openDetail(detail.getAttribute('data-rf-detail')); return; }
    if (event.target.closest('.bottom-nav .nav-button')) closeDetail();
    refreshSoon();
  }, true);
  document.addEventListener('change', refreshSoon, true);
  global.addEventListener('storage', refreshSoon);
  global.addEventListener('load', refreshSoon);

  var originalSave = S.save;
  S.save = function () {
    var result = originalSave.apply(S, arguments);
    refreshSoon();
    return result;
  };

  refreshSoon();
})(window);
