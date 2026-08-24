/* Rootflow V3 — progressive UX layer.
   Intentionally additive: it does not replace the existing React tree, logo,
   splash animation, navigation mechanics or established visual system. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  var S = global.RootflowStore;
  var I = global.RootflowI18n;
  if (!D || !S || !I || !D.v3TreasurySummary) return;

  var scheduled = false;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function locale() { return I.getLocale(); }
  function t(key) { return I.t(key); }

  function trim1(value) {
    var n = Math.round(value * 10) / 10;
    return String(n).replace(/\.0$/, '');
  }

  function money(value, signed) {
    var n = Number(value) || 0;
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    var a = Math.abs(n);
    var text;
    if (locale() === 'en') {
      if (a >= 1e9) text = trim1(a / 1e9) + 'B';
      else if (a >= 1e6) text = trim1(a / 1e6) + 'M';
      else if (a >= 1e3) text = trim1(a / 1e3) + 'K';
      else text = String(Math.round(a));
    } else {
      if (a >= 1e9) text = trim1(a / 1e9).replace('.', ',') + ' tỷ';
      else if (a >= 1e6) text = trim1(a / 1e6).replace('.', ',') + ' tr';
      else if (a >= 1e3) text = trim1(a / 1e3).replace('.', ',') + ' ng';
      else text = String(Math.round(a));
    }
    return sign + text;
  }

  function fmtDate(value) {
    if (!value) return t('monthlyUndated');
    var p = String(value).split('-');
    if (p.length !== 3) return value;
    return p[2] + '/' + p[1];
  }

  function getData() {
    var loaded = S.load();
    return loaded && loaded.data ? loaded.data : S.empty();
  }

  function activeViewIndex() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .nav-button'));
    for (var i = 0; i < buttons.length; i++) if (buttons[i].classList.contains('on')) return i;
    return 0;
  }

  function ensureSlot(parent, id, before) {
    if (!parent) return null;
    var slot = parent.querySelector('#' + id);
    if (!slot) {
      slot = document.createElement('section');
      slot.id = id;
      slot.className = 'v3-panel';
      if (before && before.parentNode === parent) parent.insertBefore(slot, before);
      else parent.insertBefore(slot, parent.firstChild);
    }
    return slot;
  }

  function setHtml(slot, signature, html) {
    if (!slot) return;
    if (slot.getAttribute('data-v3-signature') === signature) return;
    slot.setAttribute('data-v3-signature', signature);
    slot.innerHTML = html;
  }

  function metric(label, value, className, sub) {
    return '<div class="v3-metric ' + esc(className || '') + '">' +
      '<span>' + esc(label) + '</span>' +
      '<strong>' + esc(value) + '</strong>' +
      (sub ? '<small>' + esc(sub) + '</small>' : '') +
      '</div>';
  }

  function overviewHtml(summary) {
    var b = summary.bridge;
    var conservativeEnd = summary.currentCash + b.reliableInflows - b.mandatoryOutflows - b.undatedDebt - b.rolloverCost;
    var expectedEnd = conservativeEnd + b.expectedInflows + b.recurringIncomeExpected;
    var asOf = summary.snapshotDate ? fmtDate(summary.snapshotDate) : '—';
    var pressure = fmtDate(summary.pressureDate);
    var bufferState = summary.additionalCashNeeded > 0
      ? t('additionalNeeded') + ' ' + money(summary.additionalCashNeeded)
      : t('surplus') + ' ' + money(summary.surplusAboveRecommended);

    return '' +
      '<div class="v3-current-card">' +
        '<div class="v3-current-copy"><span class="v3-kicker">' + esc(t('availableCash')) + '</span>' +
          '<strong class="v3-current-amount">' + esc(money(summary.currentCash)) + '</strong>' +
          '<small>' + esc(t('asOf')) + ' ' + esc(asOf) + '</small></div>' +
        '<div class="v3-current-note">' + esc(t('currentCashExplanation')) + '</div>' +
      '</div>' +
      '<div class="v3-primary-grid">' +
        metric(t('cashNeeded'), money(summary.minimumRequiredCash), 'important', t('conservative')) +
        metric(t('recommendedCash'), money(summary.recommendedCashToKeep), summary.additionalCashNeeded > 0 ? 'warning' : 'positive', bufferState) +
        metric(t('pressureDate'), pressure, '', t('projectedLow') + ' ' + money(summary.projectedLow)) +
      '</div>' +
      '<details class="v3-explain" open>' +
        '<summary>' + esc(t('why')) + '</summary>' +
        '<div class="v3-bridge">' +
          '<div class="v3-bridge-row"><span>' + esc(t('availableCash')) + '</span><strong>' + esc(money(summary.currentCash)) + '</strong></div>' +
          '<div class="v3-bridge-row positive"><span>' + esc(t('reliableInflows')) + '</span><strong>' + esc(money(b.reliableInflows, true)) + '</strong></div>' +
          '<div class="v3-bridge-row muted"><span>' + esc(t('expectedInflows')) + '</span><strong>' + esc(money(b.expectedInflows, true)) + '</strong></div>' +
          '<div class="v3-bridge-row muted"><span>' + esc(t('recurringIncome')) + '</span><strong>' + esc(money(b.recurringIncomeExpected, true)) + '</strong></div>' +
          '<div class="v3-bridge-row negative"><span>' + esc(t('mandatoryOutflows')) + '</span><strong>' + esc(money(-b.mandatoryOutflows, true)) + '</strong></div>' +
          '<div class="v3-bridge-row negative"><span>' + esc(t('undatedDebt')) + '</span><strong>' + esc(money(-b.undatedDebt, true)) + '</strong></div>' +
          '<div class="v3-bridge-row negative"><span>' + esc(t('rolloverCost')) + '</span><strong>' + esc(money(-b.rolloverCost, true)) + '</strong></div>' +
          '<div class="v3-bridge-divider"></div>' +
          '<div class="v3-bridge-row"><span>' + esc(t('conservative')) + ' · ' + esc(t('closingCash')) + '</span><strong>' + esc(money(conservativeEnd)) + '</strong></div>' +
          '<div class="v3-bridge-row"><span>' + esc(t('expected')) + ' · ' + esc(t('closingCash')) + '</span><strong>' + esc(money(expectedEnd)) + '</strong></div>' +
        '</div>' +
        '<p class="v3-note">' + esc(t('bufferFormula')) + '</p>' +
        '<p class="v3-note">' + esc(t('conservativeNote')) + '</p>' +
        (summary.operatingReserve > 0 ? '' : '<p class="v3-note">' + esc(t('noOperatingReserve')) + '</p>') +
      '</details>';
  }

  function debtTotals(rows, start) {
    var sevenEnd = D.addDays(start, 7);
    var total7 = 0, total30 = 0, largest = null;
    rows.forEach(function (row) {
      total30 += Number(row.total) || 0;
      if (row.date && row.date <= sevenEnd) total7 += Number(row.total) || 0;
      if (!largest || Number(row.total) > Number(largest.total)) largest = row;
    });
    return { seven: total7, thirty: total30, largest: largest };
  }

  function debtRowHtml(row) {
    var badge = row.type === 'control' ? t('controlAssumption') : row.date ? (row.certainty === 'CERTAIN' ? t('committed') : t('expectedState')) : t('monthlyUndated');
    return '<div class="v3-obligation-row">' +
      '<div class="v3-obligation-date">' + esc(row.date ? fmtDate(row.date) : '—') + '</div>' +
      '<div class="v3-obligation-copy"><strong>' + esc(row.name) + '</strong><span>' + esc(badge) + '</span></div>' +
      '<div class="v3-obligation-breakdown">' +
        (row.principal ? '<span>' + esc(t('principal')) + ' ' + esc(money(row.principal)) + '</span>' : '') +
        (row.interest ? '<span>' + esc(t('interest')) + ' ' + esc(money(row.interest)) + '</span>' : '') +
        (row.fee ? '<span>' + esc(t('fee')) + ' ' + esc(money(row.fee)) + '</span>' : '') +
        (row.rollover ? '<span>' + esc(t('rolloverCost')) + ' ' + esc(money(row.rollover)) + '</span>' : '') +
      '</div>' +
      '<strong class="v3-obligation-total">−' + esc(money(row.total)) + '</strong>' +
    '</div>';
  }

  function calendarHtml(summary) {
    var rows = summary.debtCalendar || [];
    var totals = debtTotals(rows, summary.forecastStartDate || D.today());
    var largest = totals.largest;
    return '' +
      '<div class="v3-section-head"><div><span class="v3-kicker">' + esc(t('next30Days')) + '</span><h2>' + esc(t('debtCalendar')) + '</h2></div></div>' +
      '<div class="v3-primary-grid compact">' +
        metric(t('next7'), money(totals.seven), totals.seven ? 'warning' : 'positive') +
        metric(t('next30'), money(totals.thirty), totals.thirty ? '' : 'positive') +
        metric(t('largestPayment'), largest ? money(largest.total) : '0', '', largest ? (largest.date ? fmtDate(largest.date) : t('monthlyUndated')) : '') +
      '</div>' +
      '<div class="v3-obligation-list">' + (rows.length ? rows.slice(0, 10).map(debtRowHtml).join('') : '<p class="v3-note">—</p>') + '</div>' +
      '<p class="v3-note">' + esc(t('expectedIncomeNotDated')) + '</p>';
  }

  function cashBridgeHtml(summary) {
    var b = summary.bridge;
    return '' +
      '<div class="v3-section-head"><div><span class="v3-kicker">' + esc(t('next30Days')) + '</span><h2>' + esc(t('cashBridge')) + '</h2></div></div>' +
      '<div class="v3-bridge compact">' +
        '<div class="v3-bridge-row"><span>' + esc(t('openingCash')) + '</span><strong>' + esc(money(summary.currentCash)) + '</strong></div>' +
        '<div class="v3-bridge-row positive"><span>' + esc(t('reliableInflows')) + '</span><strong>' + esc(money(b.reliableInflows, true)) + '</strong></div>' +
        '<div class="v3-bridge-row muted"><span>' + esc(t('expectedInflows')) + '</span><strong>' + esc(money(b.expectedInflows + b.recurringIncomeExpected, true)) + '</strong></div>' +
        '<div class="v3-bridge-row negative"><span>' + esc(t('mandatoryOutflows')) + '</span><strong>' + esc(money(-(b.mandatoryOutflows + b.undatedDebt + b.rolloverCost), true)) + '</strong></div>' +
      '</div>';
  }

  function fundingHtml(summary) {
    var book = summary.lendingBook || { totalPrincipal: 0, longTermPrincipal: 0, monthlyInterest: 0 };
    var links = summary.fundingLinks || [];
    var linksHtml = links.length ? links.map(function (link) {
      return '<div class="v3-funding-link">' +
        '<div><strong>' + esc(link.fundingName) + '</strong><span>' + esc(money(link.fundingPrincipal)) + '</span></div>' +
        '<div class="v3-funding-arrow">↓ <small>' + esc(t('funds')) + '</small></div>' +
        '<div><strong>' + esc(link.receivableName) + '</strong><span>' + esc(money(link.receivablePrincipal)) + '</span></div>' +
      '</div>';
    }).join('') : '<p class="v3-note">' + esc(t('noFundingLinks')) + '</p>';

    return '' +
      '<div class="v3-section-head"><div><span class="v3-kicker">' + esc(t('funding')) + '</span><h2>' + esc(t('lendingBook')) + '</h2></div></div>' +
      '<div class="v3-primary-grid">' +
        metric(t('lendingPrincipal'), money(book.totalPrincipal), 'positive') +
        metric(t('longTermLending'), money(book.longTermPrincipal), '') +
        metric(t('lendingInterest'), money(book.monthlyInterest), 'positive') +
        metric(t('totalDebt'), money(summary.totalDebt), 'warning') +
      '</div>' +
      '<div class="v3-funding-links"><h3>' + esc(t('fundingLinks')) + '</h3>' + linksHtml + '</div>';
  }

  function renderPanels() {
    var content = document.querySelector('.page > .content');
    if (!content) return;
    var data = getData();
    var summary = D.v3TreasurySummary(data, { days: 30 });
    var view = activeViewIndex();

    ['v3-overview-panel', 'v3-calendar-panel', 'v3-funding-panel'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node && node.parentNode !== content) node.remove();
    });

    if (view === 0) {
      var before = content.querySelector('.hero') || content.firstChild;
      var home = ensureSlot(content, 'v3-overview-panel', before);
      home.className = 'v3-panel v3-overview-panel';
      setHtml(home, locale() + '|' + JSON.stringify([summary.currentCash, summary.minimumRequiredCash, summary.recommendedCashToKeep, summary.pressureDate, summary.projectedLow, summary.bridge]), overviewHtml(summary));
      var hero = content.querySelector('.hero');
      if (hero && !document.getElementById('v3-advanced-label')) {
        var label = document.createElement('div');
        label.id = 'v3-advanced-label';
        label.className = 'v3-advanced-label';
        label.textContent = t('advancedModel');
        hero.parentNode.insertBefore(label, hero);
      } else if (document.getElementById('v3-advanced-label')) document.getElementById('v3-advanced-label').textContent = t('advancedModel');
    } else {
      var advanced = document.getElementById('v3-advanced-label');
      if (advanced) advanced.remove();
    }

    if (view === 1) {
      var monthControl = content.querySelector('.month-control');
      var insertion = monthControl ? monthControl.nextSibling : content.firstChild;
      var cash = ensureSlot(content, 'v3-calendar-panel', insertion);
      cash.className = 'v3-panel v3-calendar-panel';
      setHtml(cash, locale() + '|' + JSON.stringify([summary.currentCash, summary.bridge, summary.debtCalendar]), cashBridgeHtml(summary) + calendarHtml(summary));
    } else {
      var c = document.getElementById('v3-calendar-panel'); if (c) c.remove();
    }

    if (view === 2) {
      var funding = ensureSlot(content, 'v3-funding-panel', content.firstChild);
      funding.className = 'v3-panel v3-funding-panel';
      setHtml(funding, locale() + '|' + JSON.stringify([summary.lendingBook, summary.fundingLinks, summary.totalDebt]), fundingHtml(summary));
    } else {
      var f = document.getElementById('v3-funding-panel'); if (f) f.remove();
    }
  }

  var VI_MAP = {
    'Home': 'Tổng quan', 'Flow': 'Lịch tiền', 'Position': 'Nợ & Cho vay', 'Decide': 'Kế hoạch',
    'Timeline': 'Dòng thời gian', 'Calendar': 'Lịch tháng', 'Liquidity buffer': 'Biên thanh khoản',
    'Projected low': 'Tiền thấp nhất dự kiến', 'Hard floor': 'Sàn an toàn', 'Safe through': 'An toàn đến',
    'Pressure date': 'Ngày áp lực', 'Next pressure point': 'Điểm áp lực kế tiếp', 'Buffer & Risk': 'Buffer & Thanh khoản',
    'Liquidity runway': 'Thời gian thanh khoản', 'Operating headroom': 'Dư địa vận hành',
    'Confirmed path': 'Luồng đã chốt', 'Expected inflow': 'Tiền vào dự kiến', 'Confirmed': 'Đã chốt lịch',
    'Expected': 'Dự kiến', 'Uncertain': 'Chưa chắc', 'Actual': 'Đã xảy ra', 'Treasury control': 'Kiểm soát nguồn vốn',
    'SAFE TO DEPLOY NOW': 'CÓ THỂ DÙNG NGAY'
  };
  var EN_MAP = {
    'Tổng quan': 'Overview', 'Lịch tiền': 'Cash Calendar', 'Nợ & Cho vay': 'Debt & Lending', 'Kế hoạch': 'Plan',
    'Dòng thời gian': 'Timeline', 'Lịch tháng': 'Calendar', 'Biên thanh khoản': 'Liquidity buffer',
    'Tiền thấp nhất dự kiến': 'Projected low', 'Sàn an toàn': 'Hard floor', 'An toàn đến': 'Safe through',
    'Ngày áp lực': 'Pressure date', 'Điểm áp lực kế tiếp': 'Next pressure point', 'Buffer & Thanh khoản': 'Buffer & Liquidity',
    'Thời gian thanh khoản': 'Liquidity runway', 'Dư địa vận hành': 'Operating headroom',
    'Luồng đã chốt': 'Committed path', 'Tiền vào dự kiến': 'Expected inflow', 'Đã chốt lịch': 'Committed',
    'Dự kiến': 'Expected', 'Chưa chắc': 'Uncertain', 'Đã xảy ra': 'Actual', 'Kiểm soát nguồn vốn': 'Treasury control',
    'CÓ THỂ DÙNG NGAY': 'SAFE TO DEPLOY NOW'
  };

  function translateExisting() {
    var map = locale() === 'en' ? EN_MAP : VI_MAP;
    var selectors = '.nav-button span,.seg-button,.appbar-title,.appbar-subtitle,.eyebrow,.hero-meta span,.timeline-meta,.flow-meta,.section-kicker,.section-heading,.risk-label,.chart-title strong,.legend-item,.safe-deploy span,.result-row span';
    Array.prototype.forEach.call(document.querySelectorAll(selectors), function (node) {
      if (node.children && node.children.length) return;
      var raw = String(node.textContent || '').trim();
      if (map[raw]) node.textContent = map[raw];
    });

    var nav = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .nav-button span'));
    var labels = locale() === 'en' ? ['Overview', 'Cash Calendar', 'Debt & Lending', 'Plan'] : ['Tổng quan', 'Lịch tiền', 'Nợ & Cho vay', 'Kế hoạch'];
    nav.forEach(function (node, index) { if (labels[index]) node.textContent = labels[index]; });
  }

  function installLanguageControl() {
    var actions = document.querySelector('.appbar-actions');
    if (actions && !actions.querySelector('.v3-lang-toggle')) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'v3-lang-toggle';
      button.addEventListener('click', function () { I.setLocale(locale() === 'vi' ? 'en' : 'vi'); });
      actions.insertBefore(button, actions.firstChild);
    }
    var control = document.querySelector('.v3-lang-toggle');
    if (control) {
      control.textContent = locale().toUpperCase();
      control.setAttribute('aria-label', t('locale'));
      control.title = t('locale');
    }

    var sheetTitle = document.querySelector('.sheet-head h2');
    var sheetBody = document.querySelector('.sheet-body');
    if (!sheetTitle || !sheetBody) return;
    var title = String(sheetTitle.textContent || '').toLowerCase();
    if (title.indexOf('cài đặt') < 0 && title.indexOf('settings') < 0) return;
    var section = sheetBody.querySelector('.v3-language-setting');
    if (!section) {
      section = document.createElement('div');
      section.className = 'settings-group v3-language-setting';
      sheetBody.insertBefore(section, sheetBody.firstChild);
      section.addEventListener('click', function (event) {
        var target = event.target.closest('[data-locale]');
        if (target) I.setLocale(target.getAttribute('data-locale'));
      });
    }
    section.innerHTML = '<h3>' + esc(t('locale')) + '</h3><div class="v3-locale-buttons">' +
      '<button type="button" data-locale="vi" class="' + (locale() === 'vi' ? 'on' : '') + '">' + esc(t('vietnamese')) + '</button>' +
      '<button type="button" data-locale="en" class="' + (locale() === 'en' ? 'on' : '') + '">' + esc(t('english')) + '</button>' +
      '</div>';
  }

  function enhance() {
    scheduled = false;
    try {
      translateExisting();
      installLanguageControl();
      renderPanels();
    } catch (error) {
      if (global.console && console.warn) console.warn('Rootflow V3 enhancement skipped:', error);
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    global.requestAnimationFrame(enhance);
  }

  global.addEventListener('rootflow:locale', schedule);
  global.addEventListener('storage', schedule);
  document.addEventListener('click', function () { global.setTimeout(schedule, 0); }, true);
  new MutationObserver(schedule).observe(document.getElementById('root') || document.body, { childList: true, subtree: true, characterData: true });
  schedule();
})(window);
