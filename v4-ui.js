/* Rootflow V4 — final decision dashboard.
   Presentation only: the existing React app, forms, logo and motion remain.
   V4 makes the default screens answer the user's core questions first. */
(function (global) {
  'use strict';

  var D = global.RootflowDomain;
  var S = global.RootflowStore;
  var I = global.RootflowI18n;
  if (!D || !S || !I || !D.v4FinalSummary) return;

  var advancedShown = false;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function t(key) { return I.t(key); }
  function locale() { return I.getLocale(); }
  function trim1(value) { return String(Math.round(value * 10) / 10).replace(/\.0$/, ''); }
  function money(value, signed) {
    var n = Number(value) || 0, a = Math.abs(n), text;
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    if (locale() === 'en') text = a >= 1e9 ? trim1(a / 1e9) + 'B' : a >= 1e6 ? trim1(a / 1e6) + 'M' : a >= 1e3 ? trim1(a / 1e3) + 'K' : String(Math.round(a));
    else text = a >= 1e9 ? trim1(a / 1e9).replace('.', ',') + ' tỷ' : a >= 1e6 ? trim1(a / 1e6).replace('.', ',') + ' tr' : a >= 1e3 ? trim1(a / 1e3).replace('.', ',') + ' ng' : String(Math.round(a));
    return sign + text;
  }
  function pct(value) {
    if (value === null || value === undefined || !isFinite(Number(value))) return '—';
    return trim1(Number(value)) + '%';
  }
  function fmtDate(value) {
    if (!value) return t('dueUnknown');
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
  function ensureSlot(parent, id, before) {
    if (!parent) return null;
    var node = parent.querySelector('#' + id);
    if (!node) {
      node = document.createElement('section');
      node.id = id;
      node.className = 'v4-panel';
      if (before && before.parentNode === parent) parent.insertBefore(node, before);
      else parent.insertBefore(node, parent.firstChild);
    }
    return node;
  }
  function setHtml(node, signature, html) {
    if (!node || node.getAttribute('data-v4-signature') === signature) return;
    node.setAttribute('data-v4-signature', signature);
    node.innerHTML = html;
  }
  function kpi(label, value, cls, note) {
    return '<div class="v4-kpi ' + esc(cls || '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div>';
  }
  function status(text, cls) { return '<span class="v4-status ' + esc(cls || '') + '">' + esc(text) + '</span>'; }
  function row(label, value, cls, note) {
    return '<div class="v4-row ' + esc(cls || '') + '"><div><span>' + esc(label) + '</span>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div><strong>' + esc(value) + '</strong></div>';
  }
  function card(title, body, cls, action) {
    return '<section class="v4-card ' + esc(cls || '') + '"><div class="v4-card-head"><h2>' + esc(title) + '</h2>' + (action || '') + '</div>' + body + '</section>';
  }

  function debtStatusCopy(debt) {
    if (debt.status === 'SHORTFALL') return { text: t('cashShortfall'), cls: 'danger' };
    if (debt.status === 'THIN_BUFFER') return { text: t('thinBuffer'), cls: 'neutral' };
    return { text: t('debtCovered'), cls: 'good' };
  }
  function businessStatusCopy(summary) {
    var business = summary.business, debt = summary.debt;
    if (!business.hasBusiness) return { text: t('noData'), cls: 'neutral' };
    if (business.netMonthlyProfitEstimate < 0) return { text: t('lossBusiness'), cls: 'danger' };
    if (debt.status === 'SHORTFALL' || debt.status === 'THIN_BUFFER') return { text: t('profitableCashTight'), cls: 'neutral' };
    return { text: t('profitableHealthy'), cls: 'good' };
  }

  function assetsCard(summary, compact) {
    var bs = summary.balanceSheet;
    var body = '<div class="v4-hero-number"><span>' + esc(t('totalAssetsLabel')) + '</span><strong>' + esc(money(bs.totalAssets)) + '</strong></div>' +
      '<div class="v4-kpi-grid two">' +
        kpi(t('ownCapitalLabel'), money(bs.ownCapital), bs.ownCapital < 0 ? 'danger' : 'good') +
        kpi(t('debtCapitalLabel'), money(bs.totalDebt), '') +
      '</div>' +
      (compact ? '' : '<div class="v4-detail-grid">' +
        row(t('cashLabel'), money(bs.liquid), '') + row(t('receivablesLabel'), money(bs.receivables), '') +
        row(t('investmentsLabel'), money(bs.investments), '') + row(t('ownedAssetsLabel'), money(bs.ownedAssets), '') +
        row(t('debtToAssets'), pct(bs.debtToAssetsPct), bs.debtToAssetsPct > 100 ? 'danger' : '') + '</div>');
    return card(t('assetsAndCapital'), body, 'v4-assets-card');
  }

  function debtCard(summary, compact) {
    var d = summary.debt, s = debtStatusCopy(d);
    var note = d.status === 'SHORTFALL' ? t('needMore') + ' ' + money(Math.max(d.paymentShortfall, d.bufferGap)) : '';
    var body = '<div class="v4-status-line">' + status(s.text, s.cls) + (note ? '<strong>' + esc(note) + '</strong>' : '') + '</div>' +
      '<div class="v4-kpi-grid two">' + kpi(t('shortDebt'), money(d.shortDebt), '') + kpi(t('longDebt'), money(d.longDebt), '') + '</div>' +
      '<div class="v4-detail-grid">' +
        row(t('obligations30'), money(d.due30), '', d.nextDueDate ? t('nextDue') + ' ' + fmtDate(d.nextDueDate) : '') +
        row(t('currentCash'), money(d.currentCash), '') +
        row(t('reliableCash'), money(d.reliableInflows30), 'good') +
        row(t('afterDebt'), money(d.cashAfterDebt30), d.cashAfterDebt30 < 0 ? 'danger' : 'good') +
        row(t('requiredBuffer'), money(d.recommendedCashToKeep), '') +
        (d.unknownDebt > 0 ? row(t('unknownDebt'), money(d.unknownDebt), 'neutral') : '') +
      '</div>' + (compact ? '' : '<p class="v4-footnote">' + esc(t('liquidityCaveat')) + '</p>');
    return card(t('debtAndLiquidity'), body, 'v4-debt-card');
  }

  function businessCard(summary, compact) {
    var b = summary.business, s = businessStatusCopy(summary);
    var body = '<div class="v4-status-line">' + status(s.text, s.cls) + (!b.costDataComplete && b.hasBusiness ? '<span class="v4-inline-note">' + esc(t('estimateOnly')) + '</span>' : '') + '</div>' +
      '<div class="v4-kpi-grid three">' +
        kpi(t('lendingIncomeMonthly'), money(b.recurringLendingIncome), 'good') +
        kpi(t('fundingCostMonthly'), money(b.knownFundingCostMonthly), '') +
        kpi(t('businessProfitMonthly'), money(b.netMonthlyProfitEstimate), b.netMonthlyProfitEstimate < 0 ? 'danger' : 'good') +
      '</div>' +
      (compact ? '' : '<div class="v4-detail-grid">' + row(t('next30BusinessMargin'), money(b.next30BusinessCashMargin), b.next30BusinessCashMargin < 0 ? 'danger' : 'good') + '</div><p class="v4-footnote">' + esc(t('coreProfitCaveat')) + '</p>');
    return card(t('businessHealth'), body, 'v4-business-card');
  }

  function planningCard(summary, compact) {
    var b = summary.budget, inv = summary.investments;
    var budgetState = b.status === 'NO_PLAN' ? t('noBudget') : b.status === 'OVER' ? t('overBudget') : t('onTrack');
    var budgetClass = b.status === 'OVER' ? 'danger' : b.status === 'NO_PLAN' ? 'neutral' : 'good';
    var body = '<div class="v4-plan-split">' +
      '<div class="v4-plan-block"><div class="v4-block-title"><strong>' + esc(t('spendingPlan')) + '</strong>' + status(budgetState, budgetClass) + '</div>' +
        (b.hasPlan ? '<div class="v4-detail-grid">' + row(t('monthlyBudget'), money(b.planned), '') + row(t('spent'), money(b.spentAgainstPlan), '') + row(t('remaining'), money(b.remaining), b.remaining < 0 ? 'danger' : 'good') + '</div>' : '<p class="v4-empty">' + esc(t('noBudget')) + '</p>') + '</div>' +
      '<div class="v4-plan-block"><div class="v4-block-title"><strong>' + esc(t('investmentPosition')) + '</strong></div>' +
        (inv.totalInvestedAssets > 0 ? '<div class="v4-detail-grid">' + row(t('financialInvestments'), money(inv.financialInvestments), '') + row(t('ownedAssets'), money(inv.ownedAssets), '') + '</div>' : '<p class="v4-empty">' + esc(t('noInvestments')) + '</p>') + '</div>' +
      '</div>' + row(t('deployableAfterBuffer'), money(summary.deployableAfterBuffer), summary.deployableAfterBuffer > 0 ? 'good' : '') +
      (compact ? '' : '');
    return card(t('spendingAndInvesting'), body, 'v4-plan-card');
  }

  function homeHtml(summary) {
    var toggle = '<button type="button" class="v4-text-button" data-v4-toggle-advanced>' + esc(advancedShown ? t('hideAdvanced') : t('advancedDetails')) + '</button>';
    return '<div class="v4-home-grid">' + assetsCard(summary, true) + debtCard(summary, true) + businessCard(summary, true) + planningCard(summary, true) + '</div>' +
      '<div class="v4-home-actions">' + toggle + '</div>';
  }

  function debtRowHtml(item) {
    var meta = [];
    if (item.principal) meta.push(t('principal') + ' ' + money(item.principal));
    if (item.interest) meta.push(t('interest') + ' ' + money(item.interest));
    if (item.fee) meta.push(t('fee') + ' ' + money(item.fee));
    if (item.rollover) meta.push(t('rolloverCost') + ' ' + money(item.rollover));
    return '<div class="v4-debt-row"><time>' + esc(item.date ? fmtDate(item.date) : '—') + '</time><div><strong>' + esc(item.name) + '</strong><small>' + esc(meta.join(' · ') || (item.type === 'control' ? t('controlAssumption') : t('monthlyUndated'))) + '</small></div><b>' + esc(money(item.total)) + '</b></div>';
  }

  function cashflowHtml(summary) {
    var d = summary.debt;
    var body = '<div class="v4-kpi-grid four">' +
      kpi(t('currentCash'), money(d.currentCash), '') +
      kpi(t('reliableCash'), money(d.reliableInflows30), 'good') +
      kpi(t('obligations30'), money(d.due30), '') +
      kpi(t('afterDebt'), money(d.cashAfterDebt30), d.cashAfterDebt30 < 0 ? 'danger' : 'good') + '</div>' +
      '<div class="v4-debt-list">' + (d.calendar.length ? d.calendar.slice(0, 10).map(debtRowHtml).join('') : '<p class="v4-empty">' + esc(t('noData')) + '</p>') + '</div>';
    return card(t('cashflowAndDebt'), body, 'v4-cashflow-card');
  }

  function fundingLinks(summary) {
    var links = summary.treasury.fundingLinks || [];
    if (!links.length) return '<p class="v4-empty">' + esc(t('noFundingLinks')) + '</p>';
    return '<div class="v4-funding-list">' + links.slice(0, 8).map(function (link) {
      return '<div class="v4-funding-row"><div><strong>' + esc(link.fundingName) + '</strong><small>' + esc(money(link.fundingPrincipal)) + '</small></div><span>→</span><div><strong>' + esc(link.receivableName) + '</strong><small>' + esc(money(link.receivablePrincipal)) + '</small></div></div>';
    }).join('') + '</div>';
  }

  function positionHtml(summary) {
    var bs = summary.balanceSheet, d = summary.debt, inv = summary.investments;
    return assetsCard(summary, false) +
      card(t('debtStructure'), '<div class="v4-kpi-grid three">' + kpi(t('shortDebt'), money(d.shortDebt), '') + kpi(t('longDebt'), money(d.longDebt), '') + kpi(t('unknownDebt'), money(d.unknownDebt), d.unknownDebt ? 'neutral' : '') + '</div>', 'v4-structure-card') +
      card(t('fundingAndLending'), '<div class="v4-kpi-grid two">' + kpi(t('receivablesLabel'), money(bs.receivables), 'good') + kpi(t('debtCapitalLabel'), money(bs.totalDebt), '') + '</div>' + fundingLinks(summary), 'v4-funding-card') +
      card(t('investmentPosition'), '<div class="v4-kpi-grid two">' + kpi(t('financialInvestments'), money(inv.financialInvestments), '') + kpi(t('ownedAssets'), money(inv.ownedAssets), '') + '</div>' + (inv.rows.length ? '<div class="v4-mini-list">' + inv.rows.slice(0, 6).map(function (item) { return row(item.name, money(item.value), ''); }).join('') + '</div>' : '<p class="v4-empty">' + esc(t('noInvestments')) + '</p>'), 'v4-investment-card');
  }

  function planHtml(summary) {
    var b = summary.budget, inv = summary.investments;
    var budgetBody = b.hasPlan ? '<div class="v4-kpi-grid three">' + kpi(t('monthlyBudget'), money(b.planned), '') + kpi(t('spent'), money(b.spentAgainstPlan), '') + kpi(t('remaining'), money(b.remaining), b.remaining < 0 ? 'danger' : 'good') + '</div>' : '<p class="v4-empty">' + esc(t('noBudget')) + '</p>';
    var investmentBody = '<div class="v4-kpi-grid three">' + kpi(t('financialInvestments'), money(inv.financialInvestments), '') + kpi(t('ownedAssets'), money(inv.ownedAssets), '') + kpi(t('deployableAfterBuffer'), money(summary.deployableAfterBuffer), summary.deployableAfterBuffer > 0 ? 'good' : '') + '</div>';
    return card(t('spendingPlan'), budgetBody, 'v4-budget-card') + card(t('investmentPosition'), investmentBody, 'v4-investment-card') + '<div class="v4-section-divider"><span>' + esc(t('simulateDecision')) + '</span></div>';
  }

  function translateExisting() {
    var nav = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav .nav-button span'));
    var labels = locale() === 'en' ? [t('navOverview'), t('navCashflow'), t('navAssets'), t('navPlan')] : [t('navOverview'), t('navCashflow'), t('navAssets'), t('navPlan')];
    nav.forEach(function (node, index) { if (labels[index] && node.textContent !== labels[index]) node.textContent = labels[index]; });

    var title = document.querySelector('.appbar-title:not(.brand)');
    if (title) {
      var raw = String(title.textContent || '').trim();
      var map = { Flow:t('navCashflow'), Position:locale() === 'en' ? 'Assets & Debt' : 'Tài sản & Nợ', Decide:t('navPlan'), 'Dòng tiền':t('navCashflow'), 'Tài sản & Nợ':locale() === 'en' ? 'Assets & Debt' : 'Tài sản & Nợ', 'Kế hoạch':t('navPlan') };
      if (map[raw]) title.textContent = map[raw];
    }
  }

  function languageControl() {
    var actions = document.querySelector('.appbar-actions');
    if (actions) {
      var button = actions.querySelector('.v4-lang-toggle');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button'; button.className = 'v4-lang-toggle';
        button.addEventListener('click', function (event) { event.stopPropagation(); I.setLocale(locale() === 'vi' ? 'en' : 'vi'); });
        actions.insertBefore(button, actions.firstChild);
      }
      button.textContent = locale().toUpperCase();
      button.setAttribute('aria-label', I.t('locale'));
    }
  }

  function cleanupOldPanels(content) {
    ['v3-overview-panel','v3-calendar-panel','v3-funding-panel','v3-advanced-label'].forEach(function (id) {
      var node = document.getElementById(id); if (node) node.remove();
    });
    ['v4-overview-panel','v4-cashflow-panel','v4-position-panel','v4-plan-panel'].forEach(function (id) {
      var node = document.getElementById(id); if (node && node.parentNode !== content) node.remove();
    });
  }

  function render() {
    var content = document.querySelector('.page > .content');
    if (!content) return;
    cleanupOldPanels(content);
    translateExisting(); languageControl();
    var data = getData();
    var summary = D.v4FinalSummary(data);
    var view = activeViewIndex();
    content.classList.remove('v4-home-simple','v4-show-legacy');

    if (view === 0) {
      var hasLiquid = (data.accounts || []).some(function (account) { return account && !account.archived && D.isLiquid(account); });
      if (!hasLiquid) return;
      content.classList.add('v4-home-simple');
      if (advancedShown) content.classList.add('v4-show-legacy');
      var home = ensureSlot(content, 'v4-overview-panel', content.firstChild);
      home.className = 'v4-panel v4-overview-panel';
      setHtml(home, locale() + '|' + JSON.stringify(summary), homeHtml(summary));
    } else if (view === 1) {
      var month = content.querySelector('.month-control');
      var cash = ensureSlot(content, 'v4-cashflow-panel', month && month.nextSibling);
      cash.className = 'v4-panel v4-cashflow-panel';
      setHtml(cash, locale() + '|' + JSON.stringify([summary.debt,summary.business]), cashflowHtml(summary));
    } else if (view === 2) {
      var position = ensureSlot(content, 'v4-position-panel', content.firstChild);
      position.className = 'v4-panel v4-position-panel';
      setHtml(position, locale() + '|' + JSON.stringify([summary.balanceSheet,summary.debt,summary.investments,summary.treasury.fundingLinks]), positionHtml(summary));
    } else if (view === 3) {
      var plan = ensureSlot(content, 'v4-plan-panel', content.firstChild);
      plan.className = 'v4-panel v4-plan-panel';
      setHtml(plan, locale() + '|' + JSON.stringify([summary.budget,summary.investments,summary.deployableAfterBuffer]), planHtml(summary));
    }
  }

  function refreshSoon() { global.setTimeout(render, 0); global.setTimeout(render, 70); }

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest('[data-v4-toggle-advanced]');
    if (toggle) { advancedShown = !advancedShown; render(); return; }
    refreshSoon();
  }, true);
  document.addEventListener('change', refreshSoon, true);
  global.addEventListener('rootflow:locale', refreshSoon);
  global.addEventListener('storage', refreshSoon);
  global.addEventListener('load', refreshSoon);

  var save = S.save;
  S.save = function () { var result = save.apply(S, arguments); refreshSoon(); return result; };

  refreshSoon();
})(window);
