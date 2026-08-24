/* Rootflow V3 — stable progressive UX layer.
   Additive by design: preserves existing React hierarchy, styles, logo and splash.
   Refreshes only after user/navigation/data events; no DOM mutation polling. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  var S = global.RootflowStore;
  var I = global.RootflowI18n;
  if (!D || !S || !I || !D.v3TreasurySummary) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function t(key) { return I.t(key); }
  function locale() { return I.getLocale(); }
  function trim1(n) { return String(Math.round(n * 10) / 10).replace(/\.0$/, ''); }
  function money(value, signed) {
    var n = Number(value) || 0, a = Math.abs(n);
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    var text;
    if (locale() === 'en') {
      text = a >= 1e9 ? trim1(a / 1e9) + 'B' : a >= 1e6 ? trim1(a / 1e6) + 'M' : a >= 1e3 ? trim1(a / 1e3) + 'K' : String(Math.round(a));
    } else {
      text = a >= 1e9 ? trim1(a / 1e9).replace('.', ',') + ' tỷ' : a >= 1e6 ? trim1(a / 1e6).replace('.', ',') + ' tr' : a >= 1e3 ? trim1(a / 1e3).replace('.', ',') + ' ng' : String(Math.round(a));
    }
    return sign + text;
  }
  function fmtDate(value) {
    if (!value) return t('monthlyUndated');
    var p = String(value).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] : value;
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
  function slot(parent, id, before) {
    if (!parent) return null;
    var node = parent.querySelector('#' + id);
    if (!node) {
      node = document.createElement('section');
      node.id = id;
      node.className = 'v3-panel';
      if (before && before.parentNode === parent) parent.insertBefore(node, before);
      else parent.insertBefore(node, parent.firstChild);
    }
    return node;
  }
  function setHtml(node, signature, html) {
    if (!node || node.getAttribute('data-v3-signature') === signature) return;
    node.setAttribute('data-v3-signature', signature);
    node.innerHTML = html;
  }
  function metric(label, value, className, note) {
    return '<div class="v3-metric ' + esc(className || '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div>';
  }

  function overviewHtml(summary) {
    var b = summary.bridge;
    var conservativeEnd = summary.currentCash + b.reliableInflows - b.mandatoryOutflows - b.undatedDebt - b.rolloverCost;
    var expectedEnd = conservativeEnd + b.expectedInflows + b.recurringIncomeExpected;
    var bufferNote = summary.additionalCashNeeded > 0 ? t('additionalNeeded') + ' ' + money(summary.additionalCashNeeded) : t('surplus') + ' ' + money(summary.surplusAboveRecommended);
    return '<div class="v3-current-card">' +
      '<div class="v3-current-copy"><span class="v3-kicker">' + esc(t('availableCash')) + '</span><strong class="v3-current-amount">' + esc(money(summary.currentCash)) + '</strong><small>' + esc(t('asOf')) + ' ' + esc(summary.snapshotDate ? fmtDate(summary.snapshotDate) : '—') + '</small></div>' +
      '<div class="v3-current-note">' + esc(t('currentCashExplanation')) + '</div></div>' +
      '<div class="v3-primary-grid">' +
        metric(t('cashNeeded'), money(summary.minimumRequiredCash), 'important', t('conservative')) +
        metric(t('recommendedCash'), money(summary.recommendedCashToKeep), summary.additionalCashNeeded > 0 ? 'warning' : 'positive', bufferNote) +
        metric(t('pressureDate'), fmtDate(summary.pressureDate), '', t('projectedLow') + ' ' + money(summary.projectedLow)) +
      '</div>' +
      '<details class="v3-explain" open><summary>' + esc(t('why')) + '</summary><div class="v3-bridge">' +
        bridgeRow(t('availableCash'), summary.currentCash, '') +
        bridgeRow(t('reliableInflows'), b.reliableInflows, 'positive', true) +
        bridgeRow(t('expectedInflows'), b.expectedInflows, 'muted', true) +
        bridgeRow(t('recurringIncome'), b.recurringIncomeExpected, 'muted', true) +
        bridgeRow(t('mandatoryOutflows'), -b.mandatoryOutflows, 'negative', true) +
        bridgeRow(t('undatedDebt'), -b.undatedDebt, 'negative', true) +
        bridgeRow(t('rolloverCost'), -b.rolloverCost, 'negative', true) +
        '<div class="v3-bridge-divider"></div>' +
        bridgeRow(t('conservative') + ' · ' + t('closingCash'), conservativeEnd, '') +
        bridgeRow(t('expected') + ' · ' + t('closingCash'), expectedEnd, '') +
      '</div><p class="v3-note">' + esc(t('bufferFormula')) + '</p><p class="v3-note">' + esc(t('conservativeNote')) + '</p>' +
      (summary.operatingReserve > 0 ? '' : '<p class="v3-note">' + esc(t('noOperatingReserve')) + '</p>') + '</details>';
  }
  function bridgeRow(label, value, cls, signed) {
    return '<div class="v3-bridge-row ' + esc(cls || '') + '"><span>' + esc(label) + '</span><strong>' + esc(money(value, !!signed)) + '</strong></div>';
  }
  function cashBridgeHtml(summary) {
    var b = summary.bridge;
    return '<div class="v3-section-head"><div><span class="v3-kicker">' + esc(t('next30Days')) + '</span><h2>' + esc(t('cashBridge')) + '</h2></div></div>' +
      '<div class="v3-bridge compact">' +
        bridgeRow(t('openingCash'), summary.currentCash, '') +
        bridgeRow(t('reliableInflows'), b.reliableInflows, 'positive', true) +
        bridgeRow(t('expectedInflows'), b.expectedInflows + b.recurringIncomeExpected, 'muted', true) +
        bridgeRow(t('mandatoryOutflows'), -(b.mandatoryOutflows + b.undatedDebt + b.rolloverCost), 'negative', true) +
      '</div>';
  }
  function debtTotals(rows, start) {
    var limit7 = D.addDays(start, 7), result = { seven: 0, thirty: 0, largest: null };
    rows.forEach(function (row) {
      result.thirty += Number(row.total) || 0;
      if (row.date && row.date <= limit7) result.seven += Number(row.total) || 0;
      if (!result.largest || Number(row.total) > Number(result.largest.total)) result.largest = row;
    });
    return result;
  }
  function debtRow(row) {
    var badge = row.type === 'control' ? t('controlAssumption') : row.date ? (row.certainty === 'CERTAIN' ? t('committed') : t('expectedState')) : t('monthlyUndated');
    return '<div class="v3-obligation-row"><div class="v3-obligation-date">' + esc(row.date ? fmtDate(row.date) : '—') + '</div>' +
      '<div class="v3-obligation-copy"><strong>' + esc(row.name) + '</strong><span>' + esc(badge) + '</span></div>' +
      '<div class="v3-obligation-breakdown">' +
        (row.principal ? '<span>' + esc(t('principal')) + ' ' + esc(money(row.principal)) + '</span>' : '') +
        (row.interest ? '<span>' + esc(t('interest')) + ' ' + esc(money(row.interest)) + '</span>' : '') +
        (row.fee ? '<span>' + esc(t('fee')) + ' ' + esc(money(row.fee)) + '</span>' : '') +
        (row.rollover ? '<span>' + esc(t('rolloverCost')) + ' ' + esc(money(row.rollover)) + '</span>' : '') +
      '</div><strong class="v3-obligation-total">−' + esc(money(row.total)) + '</strong></div>';
  }
  function calendarHtml(summary) {
    var rows = summary.debtCalendar || [], totals = debtTotals(rows, summary.forecastStartDate || D.today()), largest = totals.largest;
    return '<div class="v3-section-head"><div><span class="v3-kicker">' + esc(t('next30Days')) + '</span><h2>' + esc(t('debtCalendar')) + '</h2></div></div>' +
      '<div class="v3-primary-grid compact">' +
        metric(t('next7'), money(totals.seven), totals.seven ? 'warning' : 'positive') +
        metric(t('next30'), money(totals.thirty), totals.thirty ? '' : 'positive') +
        metric(t('largestPayment'), largest ? money(largest.total) : '0', '', largest ? (largest.date ? fmtDate(largest.date) : t('monthlyUndated')) : '') + '</div>' +
      '<div class="v3-obligation-list">' + (rows.length ? rows.slice(0, 10).map(debtRow).join('') : '<p class="v3-note">—</p>') + '</div><p class="v3-note">' + esc(t('expectedIncomeNotDated')) + '</p>';
  }
  function fundingHtml(summary) {
    var book = summary.lendingBook || {}, links = summary.fundingLinks || [];
    var linkHtml = links.length ? links.map(function (link) {
      return '<div class="v3-funding-link"><div><strong>' + esc(link.fundingName) + '</strong><span>' + esc(money(link.fundingPrincipal)) + '</span></div>' +
        '<div class="v3-funding-arrow">↓ <small>' + esc(t('funds')) + '</small></div><div><strong>' + esc(link.receivableName) + '</strong><span>' + esc(money(link.receivablePrincipal)) + '</span></div></div>';
    }).join('') : '<p class="v3-note">' + esc(t('noFundingLinks')) + '</p>';
    return '<div class="v3-section-head"><div><span class="v3-kicker">' + esc(t('funding')) + '</span><h2>' + esc(t('lendingBook')) + '</h2></div></div>' +
      '<div class="v3-primary-grid">' +
        metric(t('lendingPrincipal'), money(book.totalPrincipal || 0), 'positive') +
        metric(t('longTermLending'), money(book.longTermPrincipal || 0), '') +
        metric(t('lendingInterest'), money(book.monthlyInterest || 0), 'positive') +
        metric(t('totalDebt'), money(summary.totalDebt), 'warning') + '</div>' +
      '<div class="v3-funding-links"><h3>' + esc(t('fundingLinks')) + '</h3>' + linkHtml + '</div>';
  }

  var VI = {
    Home:'Tổng quan', Flow:'Lịch tiền', Position:'Nợ & Cho vay', Decide:'Kế hoạch', Timeline:'Dòng thời gian', Calendar:'Lịch tháng',
    'Liquidity buffer':'Biên thanh khoản', 'Projected low':'Tiền thấp nhất dự kiến', 'Hard floor':'Sàn an toàn', 'Safe through':'An toàn đến',
    'Pressure date':'Ngày áp lực', 'Next pressure point':'Điểm áp lực kế tiếp', Confirmed:'Đã chốt lịch', Expected:'Dự kiến', Uncertain:'Chưa chắc', Actual:'Đã xảy ra'
  };
  var EN = {
    'Tổng quan':'Overview', 'Lịch tiền':'Cash Calendar', 'Nợ & Cho vay':'Debt & Lending', 'Kế hoạch':'Plan', 'Dòng thời gian':'Timeline', 'Lịch tháng':'Calendar',
    'Biên thanh khoản':'Liquidity buffer', 'Tiền thấp nhất dự kiến':'Projected low', 'Sàn an toàn':'Hard floor', 'An toàn đến':'Safe through',
    'Ngày áp lực':'Pressure date', 'Điểm áp lực kế tiếp':'Next pressure point', 'Đã chốt lịch':'Committed', 'Dự kiến':'Expected', 'Chưa chắc':'Uncertain', 'Đã xảy ra':'Actual'
  };
  function setTextIfDifferent(node, value) { if (node && node.textContent !== value) node.textContent = value; }
  function translateExisting() {
    var map = locale() === 'en' ? EN : VI;
    var selectors = '.nav-button span,.seg-button,.eyebrow,.hero-meta span,.timeline-meta,.flow-meta,.section-kicker';
    Array.prototype.forEach.call(document.querySelectorAll(selectors), function (node) {
      if (node.children && node.children.length) return;
      var raw = String(node.textContent || '').trim();
      if (map[raw]) setTextIfDifferent(node, map[raw]);
    });
    var nav = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .nav-button span'));
    var labels = locale() === 'en' ? ['Overview','Cash Calendar','Debt & Lending','Plan'] : ['Tổng quan','Lịch tiền','Nợ & Cho vay','Kế hoạch'];
    nav.forEach(function (node, index) { if (labels[index]) setTextIfDifferent(node, labels[index]); });
  }
  function languageControl() {
    var actions = document.querySelector('.appbar-actions');
    if (actions) {
      var button = actions.querySelector('.v3-lang-toggle');
      if (!button) {
        button = document.createElement('button'); button.type = 'button'; button.className = 'v3-lang-toggle';
        button.addEventListener('click', function (event) { event.stopPropagation(); I.setLocale(locale() === 'vi' ? 'en' : 'vi'); });
        actions.insertBefore(button, actions.firstChild);
      }
      setTextIfDifferent(button, locale().toUpperCase());
      button.setAttribute('aria-label', t('locale')); button.title = t('locale');
    }
    var title = document.querySelector('.sheet-head h2'), body = document.querySelector('.sheet-body');
    if (!title || !body || !/(cài đặt|settings)/i.test(title.textContent || '')) return;
    var section = body.querySelector('.v3-language-setting');
    if (!section) {
      section = document.createElement('div'); section.className = 'settings-group v3-language-setting'; body.insertBefore(section, body.firstChild);
      section.addEventListener('click', function (event) { var target = event.target.closest('[data-locale]'); if (target) I.setLocale(target.getAttribute('data-locale')); });
    }
    var html = '<h3>' + esc(t('locale')) + '</h3><div class="v3-locale-buttons"><button type="button" data-locale="vi" class="' + (locale() === 'vi' ? 'on' : '') + '">' + esc(t('vietnamese')) + '</button><button type="button" data-locale="en" class="' + (locale() === 'en' ? 'on' : '') + '">' + esc(t('english')) + '</button></div>';
    if (section.innerHTML !== html) section.innerHTML = html;
  }
  function renderPanels() {
    var content = document.querySelector('.page > .content');
    if (!content) return;
    var summary = D.v3TreasurySummary(getData(), { days: 30 });
    var view = activeViewIndex();
    if (view === 0) {
      var home = slot(content, 'v3-overview-panel', content.querySelector('.hero') || content.firstChild); home.className = 'v3-panel v3-overview-panel';
      setHtml(home, locale() + '|' + JSON.stringify([summary.currentCash,summary.minimumRequiredCash,summary.recommendedCashToKeep,summary.pressureDate,summary.projectedLow,summary.bridge]), overviewHtml(summary));
      var hero = content.querySelector('.hero'), advanced = document.getElementById('v3-advanced-label');
      if (hero && !advanced) { advanced = document.createElement('div'); advanced.id = 'v3-advanced-label'; advanced.className = 'v3-advanced-label'; hero.parentNode.insertBefore(advanced, hero); }
      if (advanced) setTextIfDifferent(advanced, t('advancedModel'));
    }
    if (view === 1) {
      var month = content.querySelector('.month-control');
      var cash = slot(content, 'v3-calendar-panel', month && month.nextSibling); cash.className = 'v3-panel v3-calendar-panel';
      setHtml(cash, locale() + '|' + JSON.stringify([summary.currentCash,summary.bridge,summary.debtCalendar]), cashBridgeHtml(summary) + calendarHtml(summary));
    }
    if (view === 2) {
      var funding = slot(content, 'v3-funding-panel', content.firstChild); funding.className = 'v3-panel v3-funding-panel';
      setHtml(funding, locale() + '|' + JSON.stringify([summary.lendingBook,summary.fundingLinks,summary.totalDebt]), fundingHtml(summary));
    }
  }
  function refresh() {
    try { translateExisting(); languageControl(); renderPanels(); }
    catch (error) { if (global.console && console.warn) console.warn('Rootflow V3 enhancement skipped:', error); }
  }
  function refreshSoon() { global.setTimeout(refresh, 0); global.setTimeout(refresh, 60); }

  /* Data writes are a reliable signal that React will re-render. */
  var saveV2 = S.save;
  S.save = function () { var result = saveV2.apply(S, arguments); refreshSoon(); return result; };

  global.addEventListener('rootflow:locale', refreshSoon);
  global.addEventListener('storage', refreshSoon);
  global.addEventListener('load', refreshSoon);
  document.addEventListener('click', refreshSoon, true);
  document.addEventListener('change', refreshSoon, true);
  refreshSoon();
})(window);
