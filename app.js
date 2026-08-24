/* Rootflow V2 — Personal Treasury UI. React UMD, no build step. */
(function (global) {
  'use strict';

  var React = global.React;
  var ReactDOM = global.ReactDOM;
  var D = global.RootflowDomain;
  var S = global.RootflowStore;
  var h = React.createElement;

  var ICONS = {
    home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
    flow: 'M4 7h11m0 0-3-3m3 3-3 3M20 17H9m0 0 3-3m-3 3 3 3',
    plus: 'M12 5v14M5 12h14',
    position: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
    decide: 'M12 3a7 7 0 0 0-4 12.74V19h8v-3.26A7 7 0 0 0 12 3Zm-4 16h8m-7 3h6',
    settings: 'M4 7h10m4 0h2M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM4 17h2m4 0h10M6 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z',
    back: 'm15 18-6-6 6-6',
    close: 'M6 6l12 12M18 6 6 18',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01',
    chevron: 'm9 18 6-6-6-6',
    filter: 'M4 5h16l-6 7v5l-4 2v-7Z',
    calendar: 'M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z',
    wallet: 'M4 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6h16M16 12h4',
    arrowDown: 'M12 3v14m0 0 5-5m-5 5-5-5M5 21h14',
    arrowUp: 'M12 21V7m0 0 5 5m-5-5-5 5M5 3h14',
    transfer: 'M7 7h12l-3-3m3 3-3 3M17 17H5l3 3m-3-3 3-3',
    borrow: 'M5 8h14v12H5zM8 8V5h8v3m-8 5h8m-8 3h5',
    lend: 'M3 12h13m0 0-4-4m4 4-4 4M5 6h5M5 18h5',
    collect: 'M12 3v14m0 0 5-5m-5 5-5-5M4 21h16',
    repay: 'M12 21V7m0 0 5 5m-5-5-5 5M4 3h16',
    asset: 'M4 20h16M6 20V9l6-5 6 5v11M9 12h6m-6 4h6',
    other: 'M5 12h.01M12 12h.01M19 12h.01',
    warning: 'M12 3 2.7 20h18.6L12 3Zm0 6v5m0 3h.01',
    cash: 'M4 6h16v12H4zM8 10h.01M16 14h.01M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    work: 'M4 8h16v12H4zM8 8V5h8v3m-4 4v4m-2-2h4',
    people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v5l3 2',
    save: 'M5 3h12l2 2v16H5zM8 3v6h8V3M8 21v-7h8v7',
    upload: 'M12 16V4m0 0 5 5m-5-5L7 9M4 20h16',
    download: 'M12 4v12m0 0 5-5m-5 5-5-5M4 20h16',
    check: 'm5 12 4 4L19 6',
    shopping: 'M6 7h15l-2 8H8L6 3H3m6 16a1 1 0 1 0 0 .01M18 19a1 1 0 1 0 0 .01',
    coffee: 'M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Zm12 2h2a2 2 0 0 1 0 4h-2M8 3v2m4-2v2',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    house: 'M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7',
    fuel: 'M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M5 9h11M3 21h15m-2-13 3 3v6a2 2 0 0 0 2 2',
    sport: 'M7 4c2 2 3 5 3 8s-1 6-3 8M17 4c-2 2-3 5-3 8s1 6 3 8M4 8h16M4 16h16',
    food: 'M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18m0-18c-3 2-3 8 0 10h3',
    ai: 'M8 3h8M8 21h8M3 8v8M21 8v8M7 7h10v10H7zM10 13l2-4 2 4m-3-.5h2M16 9v4',
    phone: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h4',
    study: 'm3 10 9-5 9 5-9 5-9-5Zm4 3v4c3 2 7 2 10 0v-4M21 10v6',
    health: 'M12 21S4 16 4 9a4 4 0 0 1 7-2.6L12 8l1-1.6A4 4 0 0 1 20 9c0 7-8 12-8 12Zm-4-9h2l1-2 2 4 1-2h2',
    family: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 21v-3a5 5 0 0 1 10 0v3m1-6a4 4 0 0 1 7 3v3',
    entertainment: 'M4 6h16v12H4zM9 10l6 3-6 3Z',
    travel: 'M3 12h18M8 21l4-9 4 9M8 3l4 9 4-9',
    subscription: 'M4 7h16v12H4zM7 4h10M8 11h8m-8 4h5',
    gift: 'M3 9h18v12H3zM12 9v12M3 13h18M12 9H8.5a2.5 2.5 0 1 1 3.5-2.3Zm0 0h3.5A2.5 2.5 0 1 0 12 6.7Z'
  };

  var BUDGET_CATEGORIES = [
    { id: 'food', label: 'Ăn uống', icon: 'food' },
    { id: 'coffee', label: 'Cafe', icon: 'coffee' },
    { id: 'shopping', label: 'Mua sắm', icon: 'shopping' },
    { id: 'housing', label: 'Nhà cửa & dịch vụ', icon: 'house' },
    { id: 'transport', label: 'Xăng xe & đi lại', icon: 'fuel' },
    { id: 'love', label: 'Yêu đương', icon: 'heart' },
    { id: 'sport', label: 'Thể thao', icon: 'sport' },
    { id: 'ai', label: 'AI & phần mềm', icon: 'ai' },
    { id: 'telecom', label: 'Viễn thông', icon: 'phone' },
    { id: 'study', label: 'Học tập', icon: 'study' },
    { id: 'health', label: 'Sức khỏe', icon: 'health' },
    { id: 'family', label: 'Gia đình', icon: 'family' },
    { id: 'entertainment', label: 'Giải trí', icon: 'entertainment' },
    { id: 'travel', label: 'Du lịch', icon: 'travel' },
    { id: 'subscription', label: 'Đăng ký định kỳ', icon: 'subscription' },
    { id: 'gift', label: 'Quà tặng', icon: 'gift' },
    { id: 'other', label: 'Khác', icon: 'other' }
  ];

  function Icon(props) {
    var name = props.name || 'other';
    return h('svg', {
      className: 'icon ' + (props.className || ''), width: props.size || 22, height: props.size || 22,
      viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9,
      strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true'
    }, h('path', { d: ICONS[name] || ICONS.other }));
  }

  function BrandTitle() {
    return h('span', { className: 'brand-title-lockup' },
      h('img', { src: 'brand/rootflow-mark.svg', alt: '', 'aria-hidden': 'true' }),
      h('span', { className: 'brand-title-word' }, h('span', null, 'root'), h('strong', null, 'flow')));
  }

  function IconButton(props) {
    return h('button', {
      type: 'button', className: 'icon-button', onClick: props.onClick,
      'aria-label': props.label, title: props.label
    }, h(Icon, { name: props.icon }));
  }

  function compactMoney(value, signed) {
    var n = Number(value) || 0;
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    var a = Math.abs(n);
    var text;
    if (a >= 1e9) text = (Math.round(a / 1e8) / 10).toFixed(a % 1e9 ? 1 : 0) + 'B';
    else if (a >= 1e6) text = (Math.round(a / 1e5) / 10).toFixed(a % 1e6 ? 1 : 0) + 'M';
    else if (a >= 1e3) text = (Math.round(a / 1e2) / 10).toFixed(a % 1e3 ? 1 : 0) + 'K';
    else text = String(Math.round(a));
    return sign + text.replace('.0', '');
  }

  function statusClass(status) { return status === 'UNSAFE' ? 'unsafe' : status === 'TIGHT' ? 'tight' : 'safe'; }
  function statusVi(status) { return status === 'UNSAFE' ? 'Không an toàn' : status === 'TIGHT' ? 'Căng' : 'An toàn'; }
  function confidenceLabel(flow) {
    var key = D.confidenceOf(flow);
    return key === 'CERTAIN' ? 'Confirmed' : key === 'EXPECTED' ? 'Expected' : 'Uncertain';
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
  }

  function categoryId(value) {
    var text = normalizeText(value);
    var exact = BUDGET_CATEGORIES.filter(function (item) { return item.id === text || normalizeText(item.label) === text; })[0];
    if (exact) return exact.id;
    if (/(^| )(an|com|pho|bun|food|nha hang)( |$)/.test(text)) return 'food';
    if (/cafe|coffee|tra sua/.test(text)) return 'coffee';
    if (/mua sam|shopping|quan ao|sieu thi/.test(text)) return 'shopping';
    if (/nha|dien|nuoc|dich vu|thue/.test(text)) return 'housing';
    if (/xang|xe|grab|taxi|di lai/.test(text)) return 'transport';
    if (/yeu|hen ho/.test(text)) return 'love';
    if (/the thao|gym|sport/.test(text)) return 'sport';
    if (/ai|phan mem|software/.test(text)) return 'ai';
    if (/vien thong|dien thoai|internet|sim/.test(text)) return 'telecom';
    if (/hoc|sach|khoa/.test(text)) return 'study';
    if (/suc khoe|thuoc|benh|kham/.test(text)) return 'health';
    if (/gia dinh|con cai|bo me/.test(text)) return 'family';
    if (/giai tri|phim|game/.test(text)) return 'entertainment';
    if (/du lich|khach san|ve may bay/.test(text)) return 'travel';
    if (/dang ky|subscription|netflix/.test(text)) return 'subscription';
    if (/qua|gift/.test(text)) return 'gift';
    return 'other';
  }

  function categoryMeta(value) {
    var id = categoryId(value);
    return BUDGET_CATEGORIES.filter(function (item) { return item.id === id; })[0] || BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1];
  }

  function budgetRows(data, ym) {
    var bounds = D.monthBounds(ym);
    return BUDGET_CATEGORIES.map(function (category) {
      var budget = data.budgets.filter(function (row) { return row.month === ym && categoryId(row.category) === category.id; })[0];
      var spent = data.flows.filter(function (flow) {
        return flow && !flow.deletedAt && !flow.skipped && flow.confirmed && flow.date >= bounds.from && flow.date <= bounds.to
          && (flow.kind === 'expense' || flow.kind === 'fee' || flow.kind === 'interest_out')
          && categoryId(flow.category || flow.title || flow.note) === category.id;
      }).reduce(function (sum, flow) { return sum + Math.abs(Number(flow.amount) || 0); }, 0);
      return { category: category, budget: budget, limit: Math.max(0, Number(budget && budget.limit) || 0), spent: spent };
    });
  }

  function plannedContractInterest(contract) {
    return D.contractInterestTotal(contract);
  }

  function contractCommittedTotals(contract, flows) {
    var paid = D.contractPaymentTotals(contract, flows);
    var totals = { principal: paid.principal, interest: paid.interest };
    (flows || []).forEach(function (flow) {
      if (!flow || flow.deletedAt || flow.skipped || flow.confirmed || flow.autoGenerated || flow.contractId !== contract.id) return;
      if (contract.type === 'payable' && flow.kind === 'repay') {
        totals.principal += D.repayPrincipal(flow);
        totals.interest += D.repayCost(flow);
      }
      if (contract.type === 'receivable' && flow.kind === 'collect') {
        totals.principal += D.collectPrincipal(flow);
        totals.interest += D.collectInterest(flow);
      }
    });
    return totals;
  }

  function contractState(contract, flows) {
    var paid = D.contractPaymentTotals(contract, flows);
    return {
      principal: Math.max(0, (Number(contract.originalPrincipal) || 0) - paid.principal),
      interest: Math.max(0, plannedContractInterest(contract) - paid.interest)
    };
  }

  function rebuildContractSchedule(data, contract) {
    data.flows.forEach(function (flow) {
      if (flow.contractId === contract.id && flow.autoGenerated && !flow.confirmed) {
        flow.skipped = true;
        flow.updatedAt = S.now();
      }
    });
    if (!contract.maturityDate || !contract.settlementAccountId || contract.status === 'closed') return;
    var committed = contractCommittedTotals(contract, data.flows);
    var principalCredit = committed.principal;
    var interestCredit = committed.interest;
    var kind = contract.type === 'payable' ? 'repay' : 'collect';
    var confidence = contract.confidence || 'EXPECTED';
    function add(role, date, principalAmount, interestAmount, note) {
      var amount = principalAmount + interestAmount;
      if (!(amount > 0) || !date) return;
      data.flows.push({
        id: S.uid(), kind: kind, accountId: contract.settlementAccountId, counterAccountId: contract.accountId,
        amount: amount, principalAmount: principalAmount,
        borrowingCost: kind === 'repay' ? interestAmount : undefined,
        interestAmount: kind === 'collect' ? interestAmount : undefined,
        date: date, confirmed: false, confidence: confidence, skipped: false,
        contractId: contract.id, counterpartyId: contract.counterpartyId,
        counterpartyName: contract.counterpartyName, autoGenerated: true, scheduleRole: role,
        category: '', note: note, createdAt: S.now(), updatedAt: S.now()
      });
    }
    D.contractSchedule(contract).forEach(function (row) {
      var principalUsed = Math.min(principalCredit, row.principalAmount);
      var interestUsed = Math.min(interestCredit, row.interestAmount);
      principalCredit -= principalUsed;
      interestCredit -= interestUsed;
      var principalAmount = row.principalAmount - principalUsed;
      var interestAmount = row.interestAmount - interestUsed;
      var note = row.role === 'principal' ? 'Lãi tháng + trả gốc cuối kỳ'
        : row.role === 'installment' ? (kind === 'repay' ? 'Kỳ trả gốc và lãi' : 'Kỳ thu gốc và lãi')
        : kind === 'repay' ? 'Đáo hạn khoản vay' : 'Dự kiến thu gốc và lãi';
      add(row.role, row.date, principalAmount, interestAmount, note);
    });
  }

  function flowAmount(flow, accounts) {
    var delta = D.liquidDelta(flow, D.byId(accounts));
    if (delta === 0 && (flow.kind === 'expense' || flow.kind === 'fee' || flow.kind === 'interest_out')) return -Math.abs(Number(flow.amount) || 0);
    return delta;
  }

  function flowName(flow, accounts) {
    if (flow.title) return flow.title;
    if (flow.counterpartyName) {
      if (flow.kind === 'borrow') return 'Vay từ ' + flow.counterpartyName;
      if (flow.kind === 'lend') return 'Cho ' + flow.counterpartyName + ' vay';
      if (flow.kind === 'collect') return 'Thu từ ' + flow.counterpartyName;
      if (flow.kind === 'repay') return 'Trả ' + flow.counterpartyName;
    }
    var account = D.byId(accounts)[flow.accountId];
    var meta = D.FLOW_KINDS[flow.kind];
    return flow.note || flow.category || (meta && meta.label) || (account && account.name) || 'Dòng tiền';
  }

  function kindIcon(kind) {
    return kind === 'income' || kind === 'interest_in' ? 'arrowDown'
      : kind === 'expense' || kind === 'fee' || kind === 'interest_out' ? 'arrowUp'
      : kind === 'borrow' ? 'borrow' : kind === 'lend' ? 'lend'
      : kind === 'collect' ? 'collect' : kind === 'repay' ? 'repay'
      : kind === 'transfer' ? 'transfer' : 'wallet';
  }

  function AppBar(props) {
    return h('header', { className: 'appbar' },
      props.onBack ? h(IconButton, { icon: 'back', label: 'Quay lại', onClick: props.onBack }) : null,
      h('div', { className: 'appbar-copy' },
        h('h1', { className: 'appbar-title ' + (props.brand ? 'brand' : '') }, props.title),
        props.subtitle ? h('div', { className: 'appbar-subtitle' }, props.subtitle) : null),
      h('div', { className: 'appbar-actions' }, props.children));
  }

  function StatusPill(props) {
    return h('span', { className: 'status-pill ' + statusClass(props.status) }, props.label || statusVi(props.status));
  }

  function BottomNav(props) {
    var items = [
      ['home', 'home', 'Home'], ['flow', 'flow', 'Flow'], ['position', 'position', 'Position'], ['decide', 'decide', 'Decide']
    ];
    return h('div', { className: 'bottom-nav-wrap' }, h('nav', { className: 'bottom-nav', 'aria-label': 'Điều hướng chính' },
      items.slice(0, 2).map(function (item) {
        return h('button', { key: item[0], type: 'button', className: 'nav-button ' + (props.view === item[0] ? 'on' : ''), onClick: function () { props.onGo(item[0]); } },
          h(Icon, { name: item[1] }), h('span', null, item[2]));
      }),
      h('button', { type: 'button', className: 'nav-add', onClick: props.onAdd, 'aria-label': 'Thêm giao dịch' }, h(Icon, { name: 'plus' })),
      items.slice(2).map(function (item) {
        return h('button', { key: item[0], type: 'button', className: 'nav-button ' + (props.view === item[0] ? 'on' : ''), onClick: function () { props.onGo(item[0]); } },
          h(Icon, { name: item[1] }), h('span', null, item[2]));
      })));
  }

  function Sheet(props) {
    React.useEffect(function () {
      function key(event) { if (event.key === 'Escape') props.onClose(); }
      document.addEventListener('keydown', key);
      return function () { document.removeEventListener('keydown', key); };
    }, [props.onClose]);
    return h('div', { className: 'sheet-backdrop', onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h('section', { className: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': props.title },
        h('header', { className: 'sheet-head' },
          props.onBack ? h(IconButton, { icon: 'back', label: 'Quay lại', onClick: props.onBack }) : h('div', { style: { width: 40 } }),
          h('h2', null, props.title),
          h(IconButton, { icon: 'close', label: 'Đóng', onClick: props.onClose })),
        h('div', { className: 'sheet-body' }, props.children)));
  }

  function Field(props) {
    return h('label', { className: 'field' },
      h('span', { className: 'field-label' }, props.label),
      props.children,
      props.help ? h('span', { className: 'field-help' }, props.help) : null);
  }

  function TextInput(props) {
    if (props.type === 'date') {
      var parts = String(props.value || '').split('-');
      var display = parts.length === 3 && parts[0] && parts[1] && parts[2]
        ? parts[2] + '.' + parts[1] + '.' + parts[0] : 'dd.mm.yyyy';
      return h('span', { className: 'date-control' },
        h('span', { className: 'date-display', 'aria-hidden': 'true' }, display),
        h(Icon, { name: 'calendar', className: 'date-icon' }),
        h('input', Object.assign({}, props, { className: 'date-native' })));
    }
    return h('input', Object.assign({ className: 'input', type: 'text' }, props));
  }

  function MoneyInput(props) {
    return h('input', {
      className: 'input input-money', type: 'text', inputMode: 'decimal', placeholder: props.placeholder || '0',
      value: props.value, onChange: function (e) { props.onChange(e.target.value); }
    });
  }

  function Select(props) {
    var attrs = Object.assign({}, props, { className: 'select ' + (props.className || ''), onChange: function (e) { if (props.onChange) props.onChange(e.target.value); } });
    delete attrs.children;
    return h('select', attrs, props.children);
  }

  function LiquidityChart(props) {
    var model = props.model;
    var points = model.points || [];
    var expected = model.expectedPoints || [];
    var W = 340, H = 136, left = 4, right = 4, top = 12, bottom = 22;
    var values = points.map(function (p) { return p.value; }).concat([model.hardFloor, model.operatingBuffer]);
    var min = Math.min.apply(Math, values), max = Math.max.apply(Math, values);
    if (min === max) { min -= 1; max += 1; }
    var pad = Math.max(1, (max - min) * .12); min -= pad; max += pad;
    function x(i) { return left + (points.length < 2 ? 0 : i / (points.length - 1) * (W - left - right)); }
    function y(v) { return top + (max - v) / (max - min) * (H - top - bottom); }
    function path(rows) { return rows.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.value).toFixed(1); }).join(' '); }
    var lowIndex = 0;
    points.forEach(function (p, i) { if (p.value < points[lowIndex].value) lowIndex = i; });
    return h('div', { className: 'chart-card' },
      h('div', { className: 'chart-title' }, h('strong', null, 'Thanh khoản dự phóng'), h('span', null, model.horizonDays + ' ngày')),
      h('svg', { className: 'liquidity-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Đường tiền khả dụng dự phóng và các ngưỡng an toàn' },
        h('line', { x1: left, x2: W - right, y1: y(model.operatingBuffer), y2: y(model.operatingBuffer), stroke: '#a9b0ac', strokeWidth: 1, strokeDasharray: '4 4' }),
        h('line', { x1: left, x2: W - right, y1: y(model.hardFloor), y2: y(model.hardFloor), stroke: '#b34a43', strokeWidth: 1.2 }),
        model.dependsOnExpected ? h('path', { d: path(expected), fill: 'none', stroke: '#78ad90', strokeWidth: 1.6, strokeDasharray: '4 4' }) : null,
        h('path', { d: path(points), fill: 'none', stroke: '#176b45', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        points.length ? h('circle', { cx: x(0), cy: y(points[0].value), r: 3.5, fill: '#176b45' }) : null,
        points.length ? h('circle', { cx: x(lowIndex), cy: y(points[lowIndex].value), r: 4, fill: model.status === 'UNSAFE' ? '#b34a43' : '#176b45', stroke: '#fff', strokeWidth: 2 }) : null,
        h('text', { className: 'chart-label risk', x: W - right, y: y(model.hardFloor) - 5, textAnchor: 'end' }, 'Floor ' + compactMoney(model.hardFloor)),
        h('text', { className: 'chart-label', x: left, y: H - 4 }, D.fmtDate(points[0] && points[0].date)),
        h('text', { className: 'chart-label', x: W - right, y: H - 4, textAnchor: 'end' }, D.fmtDate(points[points.length - 1] && points[points.length - 1].date))),
      h('div', { className: 'chart-legend' },
        h('span', { className: 'legend-item' }, h('i', { className: 'legend-line' }), 'Confirmed path'),
        model.dependsOnExpected ? h('span', { className: 'legend-item' }, h('i', { className: 'legend-line', style: { background: '#78ad90' } }), 'Expected inflow') : null,
        h('span', { className: 'legend-item' }, h('i', { className: 'legend-line floor' }), 'Hard floor')));
  }

  function EmptyState(props) {
    return h('div', { className: 'empty-state' },
      h('div', { className: 'empty-icon' }, h(Icon, { name: props.icon || 'wallet' })),
      h('h2', null, props.title), h('p', null, props.copy),
      props.action ? h('button', { type: 'button', className: 'primary-button', onClick: props.onAction }, props.action) : null);
  }

  function FlowRow(props) {
    var flow = props.flow;
    var amount = flowAmount(flow, props.accounts);
    return h('div', { className: 'flow-row' },
      h('div', { className: 'flow-date' }, D.fmtDate(flow.date)),
      h('div', { className: 'flow-icon' }, h(Icon, { name: kindIcon(flow.kind) })),
      h('div', { className: 'flow-copy' },
        h('div', { className: 'flow-title', title: flowName(flow, props.accounts) }, flowName(flow, props.accounts)),
        h('div', { className: 'flow-meta' }, flow.confirmed ? 'Đã ghi nhận' : confidenceLabel(flow))),
      h('div', { className: 'flow-amount ' + (amount < 0 ? 'negative' : amount > 0 ? 'positive' : '') }, compactMoney(amount, true)));
  }

  function Home(props) {
    var d = props.derived;
    var model = d.liquidity;
    if (!d.liquidAccounts.length) {
      return h('main', { className: 'page' },
        h(AppBar, { title: h(BrandTitle), brand: true }, h(IconButton, { icon: 'settings', label: 'Cài đặt', onClick: props.onSettings })),
        h('div', { className: 'content' },
          h('div', { className: 'eyebrow' }, 'Personal Treasury'),
          h('h2', { style: { margin: '7px 0 4px', fontSize: 25, lineHeight: 1.2 } }, 'Biết tiền của bạn có an toàn hay không.'),
          h('p', { className: 'section-copy', style: { marginTop: 6 } }, 'Thêm số dư tiền đầu tiên. Rootflow sẽ dựng vị thế, timeline và buffer ngay trên thiết bị này.'),
          h(EmptyState, { title: 'Bắt đầu bằng số dư hiện tại', copy: 'Tiền mặt, ngân hàng hoặc ví điện tử. Bạn có thể thêm nợ và khoản phải thu sau.', action: 'Thiết lập số dư', onAction: props.onAddAccount })));
    }
    var status = model.status;
    var pressure = d.pressureFlows;
    var gap = Math.max(0, -model.liquidityBuffer);
    var monthlyBudgets = budgetRows(props.data, D.monthOf(D.today()));
    var activeBudgets = monthlyBudgets.filter(function (row) { return row.limit > 0; });
    return h('main', { className: 'page' },
      h(AppBar, { title: h(BrandTitle), brand: true }, h(IconButton, { icon: 'settings', label: 'Cài đặt', onClick: props.onSettings })),
      h('div', { className: 'content' },
        h('section', { className: 'hero' },
          h('div', { className: 'hero-top' },
            h('div', null, h('div', { className: 'eyebrow' }, 'Liquidity buffer'),
              h('div', { className: 'hero-amount ' + (model.liquidityBuffer < 0 ? 'negative' : '') }, compactMoney(model.liquidityBuffer, true)),
              h('div', { className: 'hero-summary' }, status === 'SAFE' ? 'Dòng tiền đã xác nhận vẫn trên mức vận hành.' : status === 'TIGHT' ? 'Không thủng sàn, nhưng đi dưới mức vận hành.' : 'Dòng tiền đã xác nhận sẽ thủng sàn an toàn.')),
            h(StatusPill, { status: status })),
          h('div', { className: 'hero-meta' },
            h('div', null, h('span', null, 'Projected low'), h('strong', null, compactMoney(model.projectedLow))),
            h('div', null, h('span', null, 'Hard floor'), h('strong', null, compactMoney(model.hardFloor))),
            h('div', null, h('span', null, status === 'SAFE' ? 'Safe through' : 'Pressure date'), h('strong', null, D.fmtDate(model.pressurePointDate))))),
        h(LiquidityChart, { model: model }),
        model.hardFloor === 0 ? h('div', { className: 'data-note' }, 'Bạn chưa đặt hard floor. Kết quả hiện dùng 0 làm sàn tuyệt đối. Mở Cài đặt để đặt ngưỡng thật.') : null,
        h('section', { className: 'section' },
          h('div', { className: 'section-kicker' }, 'Next pressure point'),
          h('h2', { className: 'section-heading', style: { marginTop: 4 } }, D.fmtDateFull(model.pressurePointDate)),
          h('div', { className: 'pressure-card' },
            h('div', { className: 'pressure-head' },
              h('div', null, h('div', { className: 'pressure-date' }, pressure.length ? flowName(pressure[0], props.data.accounts) : 'Mức tiền thấp nhất'),
                h('div', { className: 'pressure-note' }, statusVi(status) + ' theo dòng đã xác nhận')),
              h(StatusPill, { status: status })),
            pressure.slice(0, 3).map(function (flow) {
              var amount = flowAmount(flow, props.data.accounts);
              return h('div', { className: 'pressure-row', key: flow.id },
                h('div', { className: 'row-label' }, h('strong', null, flowName(flow, props.data.accounts)), h('span', null, confidenceLabel(flow))),
                h('div', { className: 'row-value ' + (amount < 0 ? 'negative' : 'positive') }, compactMoney(amount, true)));
            }),
            h('div', { className: 'pressure-row' },
              h('div', { className: 'row-label' }, h('strong', null, gap ? 'Thiếu hụt tạm tính' : 'Buffer còn lại'), h('span', null, 'So với hard floor')),
              h('div', { className: 'row-value ' + (gap ? 'negative' : 'positive') }, compactMoney(gap || model.liquidityBuffer, !gap))))),
        h('section', { className: 'section' },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
            h('h2', { className: 'section-heading', style: { margin: 0 } }, 'Dòng tiền sắp tới'),
            h('button', { type: 'button', className: 'text-button', onClick: props.onFlow }, 'Xem tất cả')),
          d.upcoming.length ? h('div', { className: 'flow-list' }, d.upcoming.slice(0, 5).map(function (flow) { return h(FlowRow, { key: flow.id, flow: flow, accounts: props.data.accounts }); }))
            : h('p', { className: 'section-copy', style: { marginTop: 8 } }, 'Chưa có nghĩa vụ hay khoản thu nào trong 30 ngày tới.')),
        h('section', { className: 'section' },
          h('div', { className: 'section-head-row' },
            h('div', null, h('h2', { className: 'section-heading', style: { margin: 0 } }, 'Kế hoạch chi tiêu tháng'), h('p', { className: 'section-copy budget-section-copy' }, D.fmtMonth(D.monthOf(D.today())))),
            h('button', { type: 'button', className: 'text-button', onClick: props.onBudgets }, activeBudgets.length ? 'Quản lý' : 'Thiết lập')),
          activeBudgets.length ? h('div', { className: 'budget-preview-grid' }, activeBudgets.slice(0, 4).map(function (row) {
            var pct = row.limit ? Math.min(100, row.spent / row.limit * 100) : 0;
            return h('button', { type: 'button', className: 'budget-preview ' + (row.spent > row.limit ? 'over' : row.spent >= row.limit * .8 ? 'warning' : ''), key: row.category.id, onClick: props.onBudgets },
              h('div', { className: 'budget-icon' }, h(Icon, { name: row.category.icon })),
              h('div', { className: 'budget-preview-copy' }, h('strong', null, row.category.label), h('span', null, compactMoney(row.spent) + ' / ' + compactMoney(row.limit))),
              h('div', { className: 'budget-progress' }, h('i', { style: { width: pct + '%' } })));
          })) : h('button', { type: 'button', className: 'budget-empty-cta', onClick: props.onBudgets },
            h('div', { className: 'budget-empty-icons' }, ['food', 'coffee', 'shopping', 'fuel'].map(function (name) { return h('span', { key: name }, h(Icon, { name: name })); })),
            h('strong', null, 'Đặt hạn mức theo từng nhóm'),
            h('span', null, 'Theo dõi ăn uống, cafe, mua sắm, nhà cửa và các chi phí định kỳ.'))),
        h('section', { className: 'section' },
          h('button', { type: 'button', className: 'secondary-button', onClick: props.onRisk }, 'Mở Buffer & Risk'),
          h('div', { className: 'net-card' }, h('div', { className: 'net-card-row' },
            h('div', null, h('div', { className: 'section-kicker' }, 'Cash hiện tại'), h('p', null, d.liquidAccounts.length + ' tài khoản khả dụng')),
            h('strong', null, compactMoney(d.totals.liquid)))))));
  }

  function FlowScreen(props) {
    var today = D.today();
    var tabState = React.useState('timeline'), tab = tabState[0], setTab = tabState[1];
    var ymState = React.useState(D.monthOf(today)), ym = ymState[0], setYm = ymState[1];
    var selectedState = React.useState(today), selectedDate = selectedState[0], setSelectedDate = selectedState[1];
    var filterState = React.useState('all'), filter = filterState[0], setFilter = filterState[1];
    var bounds = D.monthBounds(ym);
    var allLive = props.data.flows.filter(function (f) {
      return !f.deletedAt && !f.skipped && (filter === 'all' || f.confirmed || D.confidenceOf(f) === 'CERTAIN');
    }).slice().sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
    var live = allLive.filter(function (f) { return f.date >= bounds.from && f.date <= bounds.to; });
    var past = allLive.filter(function (f) { return f.confirmed && f.date < today; }).slice(-8);
    var current = allLive.filter(function (f) { return f.date === today; });
    var future = allLive.filter(function (f) { return !f.confirmed && f.date > today; }).slice(0, 18);
    var month = D.monthSummary(props.data.accounts, props.data.flows, ym);
    var selectedFlows = live.filter(function (f) { return f.date === selectedDate; });
    var parts = ym.split('-'), year = Number(parts[0]), monthNumber = Number(parts[1]);
    var dayCount = new Date(year, monthNumber, 0).getDate();
    var firstOffset = (new Date(year, monthNumber - 1, 1).getDay() + 6) % 7;
    var calendarCells = [];
    for (var blank = 0; blank < firstOffset; blank++) calendarCells.push(null);
    for (var day = 1; day <= dayCount; day++) calendarCells.push(ym + '-' + String(day).padStart(2, '0'));
    function changeMonth(step) {
      var next = D.addMonthsToYm(ym, step);
      setYm(next); setSelectedDate(next === D.monthOf(today) ? today : next + '-01');
    }
    function timelineRow(flow, isToday) {
      var amount = flowAmount(flow, props.data.accounts);
      return h('div', { className: 'timeline-row', key: flow.id },
        h('div', { className: 'flow-date' }, D.fmtDate(flow.date)),
        h('div', { className: 'timeline-dot ' + (isToday ? 'today' : '') }),
        h('div', { className: 'timeline-copy' }, h('div', { className: 'timeline-title', title: flowName(flow, props.data.accounts) }, flowName(flow, props.data.accounts)),
          h('div', { className: 'timeline-meta' }, flow.confirmed ? 'Actual' : confidenceLabel(flow))),
        h('div', { className: 'flow-amount ' + (amount < 0 ? 'negative' : 'positive') }, compactMoney(amount, true)));
    }
    function timelineView() {
      if (!allLive.length) return h(EmptyState, { icon: 'flow', title: 'Chưa có dòng tiền', copy: 'Dùng nút + để ghi tiền vào, tiền ra, vay, cho vay hoặc nghĩa vụ sắp tới.', action: 'Thêm giao dịch', onAction: props.onAdd });
      var isCurrentMonth = ym === D.monthOf(today);
      return h('div', { className: 'timeline' },
        past.length ? h(React.Fragment, null, h('div', { className: 'timeline-group' }, isCurrentMonth ? 'Quá khứ' : 'Đã ghi nhận'), past.map(function (f) { return timelineRow(f, false); })) : null,
        isCurrentMonth ? h(React.Fragment, null,
          h('div', { className: 'timeline-group' }, 'Hôm nay'),
          current.length ? current.map(function (f) { return timelineRow(f, true); }) : h('div', { className: 'timeline-row' }, h('div', { className: 'flow-date' }, D.fmtDate(today)), h('div', { className: 'timeline-dot today' }), h('div', { className: 'timeline-copy' }, h('div', { className: 'timeline-title' }, 'Hôm nay'), h('div', { className: 'timeline-meta' }, 'Không có dòng tiền')), h('div'))) : null,
        future.length ? h(React.Fragment, null, h('div', { className: 'timeline-group' }, 'Tương lai'), future.map(function (f) { return timelineRow(f, false); })) : null);
    }
    function calendarView() {
      return h('div', null,
        h('div', { className: 'calendar-weekdays' }, ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(function (label) { return h('span', { key: label }, label); })),
        h('div', { className: 'calendar-grid' }, calendarCells.map(function (date, index) {
          if (!date) return h('span', { className: 'calendar-blank', key: 'b' + index });
          var rows = live.filter(function (f) { return f.date === date; });
          return h('button', { type: 'button', key: date, className: 'calendar-day ' + (date === selectedDate ? 'selected ' : '') + (date === today ? 'today' : ''), onClick: function () { setSelectedDate(date); } },
            h('span', null, Number(date.slice(-2))), rows.length ? h('i', { className: rows.some(function (f) { return flowAmount(f, props.data.accounts) < 0; }) ? 'out' : 'in' }) : null);
        })),
        h('div', { className: 'calendar-events' }, h('h3', null, D.fmtDateFull(selectedDate)),
          selectedFlows.length ? h('div', { className: 'flow-list' }, selectedFlows.map(function (flow) { return h(FlowRow, { key: flow.id, flow: flow, accounts: props.data.accounts }); })) : h('p', { className: 'section-copy' }, 'Không có dòng tiền trong ngày này.')));
    }
    return h('main', { className: 'page' },
      h(AppBar, { title: 'Flow', subtitle: filter === 'certain' ? 'Chỉ dòng đã xác nhận' : 'Quá khứ · hiện tại · tương lai' }, h(IconButton, { icon: 'filter', label: filter === 'all' ? 'Chỉ hiện dòng đã xác nhận' : 'Hiện tất cả dòng tiền', onClick: function () { setFilter(filter === 'all' ? 'certain' : 'all'); } })),
      h('div', { className: 'content' },
        h('div', { className: 'segmented' }, h('button', { type: 'button', className: 'seg-button ' + (tab === 'timeline' ? 'on' : ''), onClick: function () { setTab('timeline'); } }, 'Timeline'), h('button', { type: 'button', className: 'seg-button ' + (tab === 'calendar' ? 'on' : ''), onClick: function () { setTab('calendar'); } }, 'Calendar')),
        h('div', { className: 'month-control' }, h(IconButton, { icon: 'back', label: 'Tháng trước', onClick: function () { changeMonth(-1); } }), h('strong', null, D.fmtMonth(ym)), h(IconButton, { icon: 'chevron', label: 'Tháng sau', onClick: function () { changeMonth(1); } })),
        tab === 'calendar' ? calendarView() : timelineView(),
        h('div', { className: 'metric-strip' },
          h('div', { className: 'metric-box' }, h('div', { className: 'metric-label' }, 'Thu tháng'), h('div', { className: 'metric-value positive' }, compactMoney(month.income, true))),
          h('div', { className: 'metric-box' }, h('div', { className: 'metric-label' }, 'Chi tháng'), h('div', { className: 'metric-value negative' }, compactMoney(-month.expense, true))),
          h('div', { className: 'metric-box' }, h('div', { className: 'metric-label' }, 'Dòng tiền ròng'), h('div', { className: 'metric-value ' + (month.netCash < 0 ? 'negative' : 'positive') }, compactMoney(month.netCash, true))))));
  }

  function PositionScreen(props) {
    var d = props.derived;
    var total = Math.max(1, d.totals.assets);
    var slices = [d.totals.liquid, d.totals.investment, d.totals.receivable, d.totals.fixedAsset];
    var colors = ['#176b45', '#3c8b61', '#74a985', '#b7cdbb'];
    var cursor = 0, stops = [];
    slices.forEach(function (value, i) { var next = cursor + value / total * 100; stops.push(colors[i] + ' ' + cursor + '% ' + next + '%'); cursor = next; });
    if (cursor < 100) stops.push('#e1e5e1 ' + cursor + '% 100%');
    var have = [
      ['cash', 'Tiền sẵn sàng', d.totals.liquid], ['work', 'Tiền đang làm việc', d.totals.investment],
      ['people', 'Người khác nợ bạn', d.totals.receivable], ['asset', 'Tài sản khác', d.totals.fixedAsset]
    ];
    var owe = props.data.accounts.filter(function (a) { return !a.archived && D.isLiability(a); });
    var interestSchedule = props.data.flows.filter(function (flow) {
      return flow && !flow.deletedAt && !flow.skipped && !flow.confirmed && flow.kind === 'repay' && D.repayCost(flow) > 0 && flow.date >= D.today();
    }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).slice(0, 6);
    return h('main', { className: 'page' },
      h(AppBar, { title: 'Position', subtitle: 'Vị thế tài chính hiện tại' }, h(IconButton, { icon: 'info', label: 'Giải thích vị thế', onClick: props.onSettings })),
      h('div', { className: 'content' },
        h('div', { className: 'segmented' }, h('button', { className: 'seg-button on', type: 'button' }, 'Tóm tắt'), h('button', { className: 'seg-button', type: 'button' }, 'Chi tiết')),
        h('section', null,
          h('div', { className: 'position-total' }, h('span', null, 'BẠN ĐANG CÓ'), h('strong', null, compactMoney(d.totals.assets))),
          have.map(function (row) { return h('div', { className: 'position-row', key: row[1] }, h('div', { className: 'position-label' }, h('div', { className: 'flow-icon' }, h(Icon, { name: row[0] })), h('span', null, row[1])), h('div', { className: 'position-value' }, compactMoney(row[2]))); }),
          h('div', { className: 'position-visual' },
            h('div', { className: 'donut', style: { background: 'conic-gradient(' + stops.join(',') + ')' } }, h('div', { className: 'donut-center' }, h('strong', null, compactMoney(d.totals.assets)), h('span', null, 'Tổng tài sản'))),
            h('div', { className: 'legend-list' }, have.map(function (row, i) { return h('div', { className: 'legend-row', key: row[1] }, h('i', { className: 'legend-dot', style: { background: colors[i] } }), h('span', null, row[1]), h('strong', null, Math.round(row[2] / total * 100) + '%')); })) )),
        h('section', { className: 'section' },
          h('div', { className: 'position-total' }, h('span', null, 'BẠN ĐANG NỢ'), h('strong', { style: { color: 'var(--text)' } }, compactMoney(d.totals.liability))),
          owe.length ? owe.map(function (account) { return h('div', { className: 'position-row', key: account.id }, h('div', { className: 'position-label' }, h('div', { className: 'flow-icon' }, h(Icon, { name: account.type === 'credit_card' ? 'wallet' : 'borrow' })), h('span', { title: account.name }, account.name)), h('div', { className: 'position-value' }, compactMoney(d.balances[account.id] || 0))); }) : h('p', { className: 'section-copy' }, 'Không có khoản nợ đang hoạt động.'),
          h('div', { className: 'net-card' }, h('div', { className: 'net-card-row' }, h('div', null, h('div', { className: 'section-kicker' }, 'Giá trị ròng của bạn'), h('p', null, 'Tài sản − các khoản đang nợ')), h('strong', null, compactMoney(d.totals.netWorth))))),
        interestSchedule.length ? h('section', { className: 'section loan-interest-section' },
          h('div', { className: 'section-kicker' }, 'Cashflow nghĩa vụ'),
          h('h2', { className: 'section-heading', style: { marginTop: 4 } }, 'Lịch trả lãi sắp tới'),
          h('div', { className: 'interest-schedule-card' }, interestSchedule.map(function (flow) {
            return h('div', { className: 'interest-schedule-row', key: flow.id },
              h('div', { className: 'interest-date' }, D.fmtDate(flow.date)),
              h('div', { className: 'row-label' }, h('strong', null, flow.counterpartyName || 'Khoản vay'), h('span', null, flow.note || 'Kỳ trả lãi')),
              h('div', { className: 'interest-amount' }, h('span', null, 'Lãi'), h('strong', null, compactMoney(D.repayCost(flow)))));
          }))) : null,
        h('button', { type: 'button', className: 'text-button', style: { width: '100%', marginTop: 10 }, onClick: props.onSettings }, 'Xem chi tiết kế toán')));
  }

  function BufferRisk(props) {
    var model = props.derived.liquidity;
    var pct = model.operatingBuffer > 0 ? Math.max(0, Math.min(100, model.projectedLow / model.operatingBuffer * 100)) : 100;
    return h('main', { className: 'page' },
      h(AppBar, { title: 'Buffer & Risk', subtitle: 'Vì sao trạng thái này xuất hiện', onBack: props.onBack }, h(IconButton, { icon: 'info', label: 'Giải thích buffer', onClick: props.onSettings })),
      h('div', { className: 'content' },
        h('div', { className: 'risk-grid' },
          h('div', { className: 'risk-card wide' }, h('div', { className: 'risk-label' }, 'Liquidity runway'), h('div', { className: 'risk-value' }, model.runwayCapped ? '≥ ' + model.runwayDays : model.runwayDays, h('small', null, ' ngày')), h('div', { className: 'risk-note' }, model.runwayCapped ? 'Không chạm 0 trong kỳ dự phóng.' : 'Số ngày trước khi tiền khả dụng chạm 0.'), h('div', { className: 'buffer-track' }, h('div', { className: 'buffer-fill ' + statusClass(model.status), style: { width: pct + '%' } }))),
          h('div', { className: 'risk-card' }, h('div', { className: 'risk-label' }, 'Projected low'), h('div', { className: 'risk-value' }, compactMoney(model.projectedLow)), h('div', { className: 'risk-note' }, D.fmtDateFull(model.pressurePointDate))),
          h('div', { className: 'risk-card' }, h('div', { className: 'risk-label' }, 'Liquidity buffer'), h('div', { className: 'risk-value', style: model.liquidityBuffer < 0 ? { color: 'var(--danger)' } : null }, compactMoney(model.liquidityBuffer, true)), h('div', { className: 'risk-note' }, 'So với hard floor ' + compactMoney(model.hardFloor))),
          h('div', { className: 'risk-card wide' }, h('div', { className: 'risk-label' }, 'Operating headroom'), h('div', { className: 'risk-value', style: model.operatingHeadroom < 0 ? { color: 'var(--warning)' } : null }, compactMoney(model.operatingHeadroom, true)), h('div', { className: 'risk-note' }, 'So với mức vận hành ' + compactMoney(model.operatingBuffer)), h('div', { className: 'buffer-track' }, h('div', { className: 'buffer-fill ' + statusClass(model.status), style: { width: pct + '%' } })))),
        h('section', { className: 'section' }, h('h2', { className: 'section-heading' }, 'Điểm an toàn'),
          h('div', { className: 'pressure-card' },
            h('div', { className: 'summary-row' }, h('span', null, 'Tiền khả dụng hiện tại'), h('strong', { className: 'row-value' }, compactMoney(model.current))),
            h('div', { className: 'summary-row' }, h('span', null, 'Hard floor'), h('strong', { className: 'row-value' }, compactMoney(model.hardFloor))),
            h('div', { className: 'summary-row' }, h('span', null, 'Operating buffer'), h('strong', { className: 'row-value' }, compactMoney(model.operatingBuffer))),
            h('div', { className: 'summary-row' }, h('span', null, 'Trạng thái'), h(StatusPill, { status: model.status })) )),
        model.status !== 'SAFE' ? h('div', { className: 'alert-card' }, h(Icon, { name: 'warning' }), h('div', null, h('strong', null, model.status === 'UNSAFE' ? 'Có rủi ro thủng hard floor' : 'Buffer vận hành đang căng'), h('span', null, 'Điểm áp lực ' + D.fmtDateFull(model.pressurePointDate) + '. Kết quả chính không tính inflow Expected là tiền chắc chắn.'))) : null,
        model.dependsOnExpected ? h('div', { className: 'data-note' }, 'Nếu các khoản Expected đến đúng hạn, projected low là ' + compactMoney(model.expectedLow) + '. Rootflow không dùng con số đó để chứng minh an toàn.') : null,
        h('section', { className: 'section' }, h('div', { className: 'safe-deploy' }, h('span', null, 'SAFE TO DEPLOY NOW'), h('strong', null, '≤ ' + compactMoney(model.safeDeployableNow)), h('span', null, 'Giữ dòng tiền đã xác nhận trên hard floor.')))));
  }

  var DECISIONS = [
    ['lend', 'lend', 'Cho vay'], ['buy_asset', 'asset', 'Mua tài sản'], ['borrow', 'borrow', 'Vay tiền'],
    ['invest', 'work', 'Đầu tư'], ['repay', 'repay', 'Trả nợ sớm'], ['commitment', 'calendar', 'Thêm nghĩa vụ']
  ];

  function DecideScreen(props) {
    var firstLiquid = props.derived.liquidAccounts[0];
    var state = React.useState({ kind: 'lend', amount: '', counterparty: '', date: D.addDays(D.today(), 30), accountId: firstLiquid ? firstLiquid.id : '' });
    var form = state[0], setForm = state[1];
    function set(key, value) { setForm(function (prev) { var next = Object.assign({}, prev); next[key] = value; return next; }); }
    var amount = D.parseMoney(form.amount);
    var sim = D.simulateDecision(props.data.accounts, props.data.flows, props.data.settings, { kind: form.kind, amount: amount });
    var after = sim.after;
    function saveScenario() {
      if (!amount) return props.onToast('Nhập số tiền cần mô phỏng.');
      props.onSaveScenario({ name: DECISIONS.filter(function (x) { return x[0] === form.kind; })[0][2], kind: form.kind, amount: amount, date: form.date, counterpartyName: form.counterparty });
    }
    return h('main', { className: 'page' },
      h(AppBar, { title: 'Decide', subtitle: 'Mô phỏng trước khi quyết định' }, h(IconButton, { icon: 'clock', label: 'Kịch bản đã lưu', onClick: props.onSettings })),
      h('div', { className: 'content' },
        h('div', { className: 'eyebrow' }, 'Bạn đang cân nhắc điều gì?'),
        h('div', { className: 'decision-options', style: { marginTop: 10 } }, DECISIONS.map(function (item) {
          return h('button', { key: item[0], type: 'button', className: 'decision-option ' + (form.kind === item[0] ? 'on' : ''), onClick: function () { set('kind', item[0]); } }, h(Icon, { name: item[1] }), h('span', null, item[2]));
        })),
        h('div', { className: 'decision-form' },
          h(Field, { label: 'Số tiền' }, h(MoneyInput, { value: form.amount, onChange: function (v) { set('amount', v); }, placeholder: '30M' })),
          (form.kind === 'lend' || form.kind === 'borrow') ? h(Field, { label: form.kind === 'lend' ? 'Người vay' : 'Người cho vay' }, h(TextInput, { value: form.counterparty, onChange: function (e) { set('counterparty', e.target.value); }, placeholder: 'Tên đối tác' })) : null,
          h(Field, { label: form.kind === 'lend' ? 'Ngày dự kiến thu' : 'Ngày thực hiện' }, h(TextInput, { type: 'date', value: form.date, onChange: function (e) { set('date', e.target.value); } }))),
        h('div', { className: 'result-card ' + statusClass(after.status) },
          h('div', { className: 'result-head' }, h('strong', null, 'KẾT QUẢ MÔ PHỎNG'), h(StatusPill, { status: after.status })),
          h('div', { className: 'result-row' }, h('span', null, 'Projected low trước'), h('span', { className: 'result-value' }, compactMoney(sim.before.projectedLow))),
          h('div', { className: 'result-row' }, h('span', null, 'Projected low sau'), h('span', { className: 'result-value ' + (after.projectedLow < 0 ? 'negative' : '') }, compactMoney(after.projectedLow))),
          h('div', { className: 'result-row' }, h('span', null, 'Hard floor'), h('span', { className: 'result-value' }, compactMoney(after.hardFloor))),
          h('div', { className: 'result-row' }, h('span', null, 'Liquidity buffer'), h('span', { className: 'result-value', style: after.liquidityBuffer < 0 ? { color: 'var(--danger)' } : { color: 'var(--positive)' } }, compactMoney(after.liquidityBuffer, true))),
          h('div', { className: 'result-row' }, h('span', null, 'Pressure point'), h('span', { className: 'result-value' }, D.fmtDate(after.pressurePointDate))),
          after.status === 'UNSAFE' ? h('div', { className: 'alert-card' }, h(Icon, { name: 'warning' }), h('div', null, h('strong', null, 'Không an toàn với kế hoạch này'), h('span', null, 'Giảm số tiền xuống ≤ ' + compactMoney(sim.before.safeDeployableNow) + ' hoặc chờ thêm nguồn tiền đã xác nhận.'))) : null),
        h('div', { className: 'safe-deploy' }, h('span', null, 'SAFE TO DEPLOY NOW'), h('strong', null, '≤ ' + compactMoney(sim.before.safeDeployableNow)), h('span', null, 'Không dùng inflow Expected để nâng mức này.')),
        h('div', { className: 'button-row' }, h('button', { type: 'button', className: 'primary-button', onClick: saveScenario }, 'Lưu kịch bản'))));
  }

  function ContractSchedulePreview(props) {
    var rows = D.contractSchedule(props.contract);
    if (!rows.length) return null;
    var totalInterest = rows.reduce(function (sum, row) { return sum + row.interestAmount; }, 0);
    var shown = rows.length <= 4 ? rows : rows.slice(0, 3).concat([null, rows[rows.length - 1]]);
    return h('div', { className: 'loan-schedule-preview' },
      h('div', { className: 'schedule-preview-head' },
        h('div', null, h('strong', null, 'Lịch cashflow dự kiến'), h('span', null, rows.length + ' kỳ · tổng lãi ' + compactMoney(totalInterest))),
        h('div', { className: 'schedule-interest-chip' }, h('span', null, 'Lãi kỳ đầu'), h('strong', null, compactMoney(rows[0].interestAmount)))),
      h('div', { className: 'schedule-preview-list' }, shown.map(function (row, index) {
        if (!row) return h('div', { className: 'schedule-gap', key: 'gap' }, '•••');
        return h('div', { className: 'schedule-preview-row', key: row.date + '-' + index },
          h('div', { className: 'schedule-date' }, D.fmtDate(row.date)),
          h('div', { className: 'schedule-copy' }, h('strong', null, row.role === 'principal' ? 'Kỳ cuối + trả gốc' : 'Kỳ ' + (row.index + 1)), h('span', null, 'Gốc ' + compactMoney(row.principalAmount) + ' · Lãi ' + compactMoney(row.interestAmount))),
          h('strong', { className: 'schedule-total' }, compactMoney(row.amount)));
      })));
  }

  function AccountForm(props) {
    var account = props.account || null;
    var contract = props.contract || null;
    var contractType = account && (account.type === 'loan' || account.type === 'receivable');
    var liquidAccounts = props.liquidAccounts || [];
    var state = React.useState({
      name: account ? account.name : '', type: account ? account.type : 'bank',
      openingBalance: account && account.openingBalance ? D.groupDigits(account.openingBalance) : '',
      balanceAsOf: account && account.balanceAsOf ? account.balanceAsOf : D.today(),
      termClass: account && account.termClass ? account.termClass : 'current',
      creditLimit: account && account.creditLimit ? D.groupDigits(account.creditLimit) : '',
      note: account && account.note ? account.note : '', archived: account ? !!account.archived : false,
      counterparty: contract ? contract.counterpartyName : '',
      originalPrincipal: contract && contract.originalPrincipal ? D.groupDigits(contract.originalPrincipal) : contractType && props.currentBalance ? D.groupDigits(props.currentBalance) : '',
      startDate: contract && contract.startDate ? contract.startDate : account && account.balanceAsOf ? account.balanceAsOf : D.today(),
      firstPaymentDate: contract && contract.firstPaymentDate ? contract.firstPaymentDate : D.addMonths(contract && contract.startDate ? contract.startDate : D.today(), 1),
      maturityDate: contract && contract.maturityDate ? contract.maturityDate : '',
      interestFrequency: contract && contract.interestFrequency === 'at_maturity' ? 'at_maturity' : 'monthly',
      interestMode: contract ? (contract.interestMode || (contract.fixedInterest ? 'fixed' : contract.interestRate ? 'rate' : 'none')) : 'none',
      interestRate: contract && contract.interestRate ? String(contract.interestRate) : '',
      fixedInterest: contract && contract.fixedInterest ? D.groupDigits(contract.fixedInterest) : '',
      fixedInterestBasis: contract && contract.fixedInterestBasis === 'total' ? 'total' : 'per_period',
      repaymentMode: contract && contract.repaymentMode ? contract.repaymentMode : 'principal_interest',
      settlementAccountId: contract && contract.settlementAccountId ? contract.settlementAccountId : liquidAccounts[0] ? liquidAccounts[0].id : ''
    });
    var form = state[0], setForm = state[1];
    var errState = React.useState(''), error = errState[0], setError = errState[1];
    function set(key, value) { setForm(function (prev) { var next = Object.assign({}, prev); next[key] = value; return next; }); setError(''); }
    function save() {
      var nextAccount = Object.assign({}, account || {}, {
        id: account ? account.id : S.uid(), name: form.name.trim(), type: form.type,
        openingBalance: D.parseMoney(form.openingBalance), balanceAsOf: form.balanceAsOf,
        termClass: form.termClass, creditLimit: form.type === 'credit_card' ? D.parseMoney(form.creditLimit) : 0,
        note: form.note.trim(), archived: !!form.archived,
        createdAt: account ? account.createdAt : S.now(), updatedAt: S.now()
      });
      var invalid = D.validateAccount(nextAccount);
      if (invalid) return setError(invalid);
      if (nextAccount.archived && Math.abs(Number(props.currentBalance) || 0) >= 1) return setError('Hãy tất toán hoặc điều chỉnh số dư về 0 trước khi lưu trữ tài khoản.');
      if (nextAccount.archived && contract && contract.status !== 'closed') return setError('Hãy hoàn tất nghĩa vụ gốc và lãi trước khi lưu trữ tài khoản.');
      var supportsContract = form.type === 'loan' || form.type === 'receivable';
      var principal = D.parseMoney(form.originalPrincipal) || (supportsContract ? nextAccount.openingBalance : 0);
      var shouldSaveContract = supportsContract && (contract || form.counterparty.trim() || principal > 0);
      if (shouldSaveContract && !form.counterparty.trim()) return setError('Nhập tên đối tác của khoản vay hoặc phải thu.');
      if (shouldSaveContract && !(principal > 0)) return setError('Nhập số tiền gốc lớn hơn 0.');
      if (shouldSaveContract && !form.settlementAccountId) return setError('Chọn tài khoản dùng để thanh toán hoặc nhận tiền.');
      if (shouldSaveContract && !form.maturityDate) return setError('Chọn ngày tất toán để Rootflow đưa nghĩa vụ vào cashflow.');
      if (shouldSaveContract && form.maturityDate < form.startDate) return setError('Ngày đến hạn không được trước ngày bắt đầu.');
      if (shouldSaveContract && form.interestFrequency === 'monthly' && (!form.firstPaymentDate || form.firstPaymentDate <= form.startDate || form.firstPaymentDate > form.maturityDate)) return setError('Ngày trả kỳ đầu phải sau ngày bắt đầu và không vượt ngày tất toán.');
      var rate = Number(String(form.interestRate).replace(',', '.').replace('%', '')) || 0;
      var fixed = D.parseMoney(form.fixedInterest);
      if (shouldSaveContract && form.interestMode === 'rate' && !(rate > 0)) return setError('Nhập lãi suất lớn hơn 0.');
      if (shouldSaveContract && form.interestMode === 'fixed' && !(fixed > 0)) return setError('Nhập tiền lãi cố định lớn hơn 0.');
      if (shouldSaveContract && form.type === 'loan' && form.repaymentMode === 'interest_only') {
        if (form.interestMode === 'none') return setError('Chế độ chỉ lãi cần có điều khoản lãi.');
        if (!form.maturityDate) return setError('Chọn ngày tất toán gốc.');
      }
      var contractPatch = shouldSaveContract ? {
        id: contract ? contract.id : S.uid(),
        type: form.type === 'loan' ? 'payable' : 'receivable',
        counterpartyId: contract ? contract.counterpartyId : null,
        counterpartyName: form.counterparty.trim(), accountId: nextAccount.id,
        originalPrincipal: principal,
        startDate: form.startDate, firstPaymentDate: form.interestFrequency === 'monthly' ? form.firstPaymentDate : null,
        maturityDate: form.maturityDate || null,
        interestMode: form.interestMode,
        interestRate: form.interestMode === 'rate' ? rate : 0,
        fixedInterest: form.interestMode === 'fixed' ? fixed : 0,
        fixedInterestBasis: form.fixedInterestBasis,
        interestFrequency: form.interestFrequency, repaymentMode: form.type === 'loan' ? form.repaymentMode : 'principal_interest',
        principalDueDate: form.type === 'loan' && form.repaymentMode === 'interest_only' ? form.maturityDate : null,
        settlementAccountId: form.settlementAccountId,
        confidence: contract ? contract.confidence || 'EXPECTED' : 'EXPECTED', status: contract ? contract.status : 'active',
        fundingSource: contract ? contract.fundingSource : 'own',
        fundingContractId: contract ? contract.fundingContractId : null,
        note: form.note.trim(), createdAt: contract ? contract.createdAt : S.now(), updatedAt: S.now()
      } : null;
      props.onSave(nextAccount, contractPatch, contract);
    }
    var showContract = form.type === 'loan' || form.type === 'receivable';
    var previewContract = showContract ? {
      type: form.type === 'loan' ? 'payable' : 'receivable', originalPrincipal: D.parseMoney(form.originalPrincipal) || D.parseMoney(form.openingBalance),
      startDate: form.startDate, firstPaymentDate: form.firstPaymentDate, maturityDate: form.maturityDate,
      interestMode: form.interestMode, interestRate: Number(String(form.interestRate).replace(',', '.').replace('%', '')) || 0,
      fixedInterest: D.parseMoney(form.fixedInterest), interestFrequency: form.interestFrequency,
      fixedInterestBasis: form.fixedInterestBasis,
      repaymentMode: form.type === 'loan' ? form.repaymentMode : 'principal_interest'
    } : null;
    return h(React.Fragment, null,
      h('p', { className: 'sheet-intro' }, account ? 'Bạn có thể sửa toàn bộ thông tin quản trị. Loại tài khoản được khóa sau khi tạo để không làm sai các giao dịch cũ.' : 'Nhập số dư đúng tại ngày bắt đầu theo dõi. Dữ liệu chỉ lưu trên thiết bị này.'),
      h(Field, { label: 'Tên tài khoản' }, h(TextInput, { value: form.name, onChange: function (e) { set('name', e.target.value); }, placeholder: 'Ví dụ: VCB chính' })),
      h(Field, { label: 'Loại', help: account ? 'Đã khóa vì đổi loại sẽ làm sai đối ứng kế toán của lịch sử giao dịch.' : null }, h(Select, { value: form.type, disabled: !!account, onChange: function (v) { set('type', v); } },
        D.ACCOUNT_ORDER.map(function (type) { return h('option', { key: type, value: type }, D.ACCOUNT_TYPES[type].label); }))),
      props.hasContractFlows ? h('div', { className: 'account-current-card' }, h('span', null, showContract && form.type === 'loan' ? 'Dư nợ hiện tại' : 'Số dư hiện tại'), h('strong', null, compactMoney(props.currentBalance || 0)), h('small', null, 'Được tính từ hợp đồng và lịch sử giao dịch; không chỉnh tay tại đây.'))
        : h(Field, { label: showContract ? (form.type === 'loan' ? 'Dư nợ tại ngày đối chiếu' : 'Phải thu tại ngày đối chiếu') : 'Số dư tại ngày đối chiếu', help: showContract ? 'Đây là số dư snapshot hiện tại; số tiền gốc ban đầu được khai báo bên dưới.' : 'Các giao dịch sau ngày này sẽ được cộng/trừ để ra số dư hiện tại.' }, h(MoneyInput, { value: form.openingBalance, onChange: function (v) { set('openingBalance', v); }, placeholder: '67M' })),
      h(Field, { label: 'Ngày đối chiếu' }, h(TextInput, { type: 'date', value: form.balanceAsOf, onChange: function (e) { set('balanceAsOf', e.target.value); } })),
      (form.type === 'loan' || form.type === 'receivable' || form.type === 'investment') ? h(Field, { label: 'Phân loại kỳ hạn' }, h(Select, { value: form.termClass, onChange: function (v) { set('termClass', v); } }, h('option', { value: 'current' }, 'Ngắn hạn · trong 12 tháng'), h('option', { value: 'long' }, 'Dài hạn · trên 12 tháng'))) : null,
      form.type === 'credit_card' ? h(Field, { label: 'Hạn mức thẻ' }, h(MoneyInput, { value: form.creditLimit, onChange: function (v) { set('creditLimit', v); }, placeholder: '50M' })) : null,
      showContract ? h('div', { className: 'form-divider' },
        h('h3', null, form.type === 'loan' ? 'Chi tiết khoản vay' : 'Chi tiết khoản phải thu'),
        h(Field, { label: form.type === 'loan' ? 'Người cho vay' : 'Người vay' }, h(TextInput, { value: form.counterparty, onChange: function (e) { set('counterparty', e.target.value); }, placeholder: 'Tên đối tác' })),
        h(Field, { label: 'Số tiền gốc' }, h(MoneyInput, { value: form.originalPrincipal, onChange: function (v) { set('originalPrincipal', v); }, placeholder: '100M' })),
        h('div', { className: 'form-grid' },
          h(Field, { label: 'Ngày bắt đầu' }, h(TextInput, { type: 'date', value: form.startDate, onChange: function (e) { set('startDate', e.target.value); } })),
          h(Field, { label: 'Ngày tất toán' }, h(TextInput, { type: 'date', value: form.maturityDate, onChange: function (e) { set('maturityDate', e.target.value); } }))),
        h(Field, { label: form.type === 'loan' ? 'Tài khoản thanh toán' : 'Tài khoản nhận tiền' }, h(Select, { value: form.settlementAccountId, onChange: function (v) { set('settlementAccountId', v); } }, h('option', { value: '' }, 'Chọn tài khoản'), liquidAccounts.map(function (row) { return h('option', { key: row.id, value: row.id }, row.name); }))),
        h(Field, { label: 'Chu kỳ thanh toán' }, h(Select, { value: form.interestFrequency, onChange: function (v) { set('interestFrequency', v); } }, h('option', { value: 'monthly' }, 'Hàng tháng'), h('option', { value: 'at_maturity' }, 'Một lần khi tất toán'))),
        form.interestFrequency === 'monthly' ? h(Field, { label: 'Ngày trả kỳ đầu', help: 'Các kỳ sau giữ cùng ngày trong tháng; tháng ngắn sẽ tự kẹp về ngày cuối tháng.' }, h(TextInput, { type: 'date', value: form.firstPaymentDate, onChange: function (e) { set('firstPaymentDate', e.target.value); } })) : null,
        h(Field, { label: 'Điều khoản lãi' }, h(Select, { value: form.interestMode, onChange: function (v) { set('interestMode', v); } },
          h('option', { value: 'none' }, 'Không tính lãi'), h('option', { value: 'rate' }, 'Lãi suất theo tháng'), h('option', { value: 'fixed' }, 'Tiền lãi cố định'))),
        form.interestMode === 'rate' ? h(Field, { label: 'Lãi suất đơn / tháng' }, h(TextInput, { inputMode: 'decimal', value: form.interestRate, onChange: function (e) { set('interestRate', e.target.value); }, placeholder: '2.0%' })) : null,
        form.interestMode === 'fixed' && form.interestFrequency === 'monthly' ? h(Field, { label: 'Cách áp dụng tiền lãi' }, h(Select, { value: form.fixedInterestBasis, onChange: function (v) { set('fixedInterestBasis', v); } }, h('option', { value: 'per_period' }, 'Cố định mỗi tháng'), h('option', { value: 'total' }, 'Tổng cố định toàn kỳ'))) : null,
        form.interestMode === 'fixed' ? h(Field, { label: form.fixedInterestBasis === 'total' || form.interestFrequency === 'at_maturity' ? 'Tổng tiền lãi cố định' : 'Tiền lãi cố định mỗi tháng' }, h(MoneyInput, { value: form.fixedInterest, onChange: function (v) { set('fixedInterest', v); }, placeholder: '2M' })) : null,
        form.type === 'loan' ? h(Field, { label: 'Cách thanh toán theo lịch', help: form.repaymentMode === 'interest_only' ? 'Khoản trả lãi không làm giảm dư gốc. Rootflow sẽ giữ riêng một lịch trả gốc cuối kỳ.' : 'Một lịch thanh toán gồm cả phần gốc và phần lãi.' }, h(Select, { value: form.repaymentMode, onChange: function (v) { set('repaymentMode', v); } }, h('option', { value: 'principal_interest' }, 'Trả gốc + lãi'), h('option', { value: 'interest_only' }, 'Chỉ trả lãi'))) : null,
        previewContract ? h(ContractSchedulePreview, { contract: previewContract }) : null) : null,
      h(Field, { label: 'Ghi chú' }, h(TextInput, { value: form.note, onChange: function (e) { set('note', e.target.value); }, placeholder: 'Thông tin thêm (không bắt buộc)' })),
      error ? h('div', { className: 'field-error' }, error) : null,
      h('button', { type: 'button', className: 'primary-button', onClick: save }, account ? 'Lưu thay đổi' : 'Lưu tài khoản'),
      account ? h('button', { type: 'button', className: form.archived ? 'secondary-button account-archive' : 'danger-button account-archive', onClick: function () { set('archived', !form.archived); } }, form.archived ? 'Khôi phục tài khoản' : 'Ngừng theo dõi tài khoản') : null,
      account ? h('p', { className: 'archive-help' }, form.archived ? 'Tài khoản sẽ trở lại các báo cáo sau khi lưu.' : 'Chỉ có thể lưu trữ khi số dư hiện tại bằng 0; lịch sử vẫn được giữ nguyên.') : null);
  }

  var EVENT_TYPES = [
    ['income', 'arrowDown', 'Tiền vào', 'Thu nhập hoặc tiền nhận'], ['expense', 'arrowUp', 'Tiền ra', 'Chi phí đã xảy ra'],
    ['borrow', 'borrow', 'Vay tiền', 'Tăng tiền và khoản phải trả'], ['lend', 'lend', 'Cho vay', 'Chuyển tiền thành khoản phải thu'],
    ['collect', 'collect', 'Thu nợ', 'Tách phần gốc và lãi'], ['repay', 'repay', 'Trả nợ', 'Tách phần gốc và chi phí vay'],
    ['transfer', 'transfer', 'Chuyển khoản', 'Giữa hai tài khoản'], ['buy_asset', 'asset', 'Mua tài sản', 'Chuyển tiền sang tài sản sở hữu'],
    ['other', 'other', 'Khác', 'Phí hoặc điều chỉnh khác']
  ];

  function EventForm(props) {
    var accountBalances = D.balances(props.data.accounts, props.data.flows);
    var liquid = props.data.accounts.filter(function (a) { return !a.archived && D.isLiquid(a); });
    var liabilities = props.data.accounts.filter(function (a) { return !a.archived && D.isLiability(a) && (Number(accountBalances[a.id]) || 0) > 0; });
    var receivables = props.data.accounts.filter(function (a) { return !a.archived && D.isReceivable(a) && (Number(accountBalances[a.id]) || 0) > 0; });
    var payableContracts = props.data.contracts.filter(function (c) { return c.status !== 'closed' && c.type === 'payable'; });
    var initialTarget = props.type === 'collect' && receivables[0] ? receivables[0].id : props.type === 'repay' && liabilities[0] ? liabilities[0].id : '';
    var initialContract = props.data.contracts.filter(function (c) { return c.accountId === initialTarget && c.status !== 'closed'; })[0];
    var state = React.useState({
      amount: '', principal: '', interest: '', accountId: liquid[0] ? liquid[0].id : '', counterAccountId: '',
      counterparty: '', date: D.today(), firstPaymentDate: D.addMonths(D.today(), 1), dueDate: D.addMonths(D.today(), 1), expectedDate: D.addDays(D.today(), 30),
      confidence: props.type === 'lend' ? 'EXPECTED' : 'CERTAIN', interestMode: 'rate', interestRate: '', fixedInterest: '', fixedInterestBasis: 'per_period', fundingSource: 'own', fundingContractId: '',
      interestFrequency: props.type === 'borrow' ? 'monthly' : 'at_maturity', repaymentMode: initialContract && initialContract.repaymentMode ? initialContract.repaymentMode : 'principal_interest',
      category: '', note: '', assetName: '', targetAccountId: initialTarget
    });
    var form = state[0], setForm = state[1];
    var errState = React.useState(''), error = errState[0], setError = errState[1];
    function set(key, value) { setForm(function (prev) { var next = Object.assign({}, prev); next[key] = value; return next; }); setError(''); }
    function money(label, key, placeholder) { return h(Field, { label: label }, h(MoneyInput, { value: form[key], onChange: function (v) { set(key, v); }, placeholder: placeholder })); }
    function liquidSelect(label) { return h(Field, { label: label }, h(Select, { value: form.accountId, onChange: function (v) { set('accountId', v); } }, liquid.map(function (a) { return h('option', { value: a.id, key: a.id }, a.name); }))); }
    function date(label, key) { return h(Field, { label: label }, h(TextInput, { type: 'date', value: form[key], onChange: function (e) { set(key, e.target.value); } })); }
    function submit() {
      if (!liquid.length) return setError('Thêm ít nhất một tài khoản tiền trước.');
      var principal = D.parseMoney(form.principal), interest = D.parseMoney(form.interest), amount = D.parseMoney(form.amount), fixedInterest = D.parseMoney(form.fixedInterest);
      if (props.type === 'repay' && form.repaymentMode === 'interest_only') principal = 0;
      if (props.type === 'collect' || props.type === 'repay') amount = principal + interest;
      if (!(amount > 0)) return setError('Nhập số tiền lớn hơn 0.');
      if ((props.type === 'borrow' || props.type === 'lend') && !form.counterparty.trim()) return setError('Nhập tên đối tác.');
      if (props.type === 'lend' && form.fundingSource === 'borrowed' && !form.fundingContractId) return setError('Chọn khoản vay dùng làm nguồn vốn.');
      if ((props.type === 'collect' || props.type === 'repay') && !form.targetAccountId) return setError('Chọn khoản cần xử lý.');
      if ((props.type === 'borrow' || props.type === 'lend') && (props.type === 'borrow' ? form.dueDate : form.expectedDate) < form.date) return setError('Ngày đến hạn không được trước ngày bắt đầu.');
      if (props.type === 'borrow' && form.interestFrequency === 'monthly' && (!form.firstPaymentDate || form.firstPaymentDate <= form.date || form.firstPaymentDate > form.dueDate)) return setError('Ngày trả kỳ đầu phải sau ngày vay và không vượt ngày tất toán.');
      if ((props.type === 'borrow' || props.type === 'lend') && form.interestMode === 'rate' && !(Number(String(form.interestRate).replace(',', '.').replace('%', '')) > 0)) return setError('Nhập lãi suất lớn hơn 0.');
      if ((props.type === 'borrow' || props.type === 'lend') && form.interestMode === 'fixed' && !(fixedInterest > 0)) return setError('Nhập tiền lãi cố định lớn hơn 0.');
      if (props.type === 'borrow' && form.repaymentMode === 'interest_only') {
        if (form.interestMode === 'none') return setError('Chế độ chỉ lãi cần có điều khoản lãi.');
      }
      if (props.type === 'repay' && form.repaymentMode === 'interest_only' && !(interest > 0)) return setError('Nhập số tiền lãi cần trả.');
      var outstanding = Math.max(0, Number(accountBalances[form.targetAccountId]) || 0);
      if ((props.type === 'collect' || props.type === 'repay') && principal > outstanding + 1) return setError('Phần gốc vượt quá số dư còn lại ' + compactMoney(outstanding) + '.');
      if (props.type === 'buy_asset' && !form.assetName.trim()) return setError('Nhập tên tài sản.');
      props.onSave(props.type, Object.assign({}, form, { amountValue: amount, principalValue: principal, interestValue: interest, fixedInterestValue: fixedInterest }));
    }
    var body = [];
    if (props.type === 'borrow' || props.type === 'lend') {
      body.push(h(Field, { label: props.type === 'borrow' ? 'Người cho vay' : 'Người vay', key: 'cp' }, h(TextInput, { value: form.counterparty, onChange: function (e) { set('counterparty', e.target.value); }, placeholder: props.type === 'borrow' ? 'Ví dụ: Anh B' : 'Ví dụ: Nguyễn A' })));
      body.push(money('Số tiền', 'amount', props.type === 'borrow' ? '100M' : '80M'));
      body.push(liquidSelect(props.type === 'borrow' ? 'Tài khoản nhận tiền' : 'Tài khoản nguồn'));
      body.push(h('div', { className: 'form-grid', key: 'dates' }, date(props.type === 'borrow' ? 'Ngày vay' : 'Ngày cho vay', 'date'), date(props.type === 'borrow' ? 'Ngày tất toán' : 'Ngày dự kiến thu', props.type === 'borrow' ? 'dueDate' : 'expectedDate')));
      if (props.type === 'borrow') {
        body.push(h(Field, { label: 'Chu kỳ thanh toán', key: 'frequency' }, h(Select, { value: form.interestFrequency, onChange: function (v) { set('interestFrequency', v); } }, h('option', { value: 'monthly' }, 'Hàng tháng'), h('option', { value: 'at_maturity' }, 'Một lần khi tất toán'))));
        if (form.interestFrequency === 'monthly') body.push(date('Ngày trả kỳ đầu', 'firstPaymentDate'));
      }
      body.push(h(Field, { label: 'Điều khoản lãi', key: 'interest-mode' }, h(Select, { value: form.interestMode, onChange: function (v) { set('interestMode', v); } },
        h('option', { value: 'none' }, 'Không tính lãi'), h('option', { value: 'rate' }, 'Lãi suất theo tháng'), h('option', { value: 'fixed' }, 'Tiền lãi cố định'))));
      if (form.interestMode === 'rate') body.push(h(Field, { label: 'Lãi suất đơn / tháng', key: 'rate' }, h(TextInput, { inputMode: 'decimal', value: form.interestRate, onChange: function (e) { set('interestRate', e.target.value); }, placeholder: '2.0%' })));
      if (form.interestMode === 'fixed' && form.interestFrequency === 'monthly') body.push(h(Field, { label: 'Cách áp dụng tiền lãi', key: 'fixed-basis' }, h(Select, { value: form.fixedInterestBasis, onChange: function (v) { set('fixedInterestBasis', v); } }, h('option', { value: 'per_period' }, 'Cố định mỗi tháng'), h('option', { value: 'total' }, 'Tổng cố định toàn kỳ'))));
      if (form.interestMode === 'fixed') body.push(h(Field, { label: form.fixedInterestBasis === 'total' || form.interestFrequency === 'at_maturity' ? 'Tổng tiền lãi cố định' : 'Tiền lãi cố định mỗi tháng', key: 'fixed-interest' }, h(MoneyInput, { value: form.fixedInterest, onChange: function (v) { set('fixedInterest', v); }, placeholder: '2M' })));
      if (props.type === 'borrow') {
        body.push(h(Field, { label: 'Cách thanh toán theo lịch', key: 'repayment-mode', help: form.repaymentMode === 'interest_only' ? 'Trả lãi không làm giảm dư gốc; Rootflow sẽ tạo thêm lịch trả toàn bộ gốc cuối kỳ.' : 'Lịch đến hạn gồm cả gốc và lãi.' }, h(Select, { value: form.repaymentMode, onChange: function (v) { set('repaymentMode', v); } }, h('option', { value: 'principal_interest' }, 'Trả gốc + lãi'), h('option', { value: 'interest_only' }, 'Chỉ trả lãi'))));
        body.push(h(ContractSchedulePreview, { key: 'schedule-preview', contract: {
          type: 'payable', originalPrincipal: D.parseMoney(form.amount), startDate: form.date,
          firstPaymentDate: form.firstPaymentDate, maturityDate: form.dueDate,
          interestMode: form.interestMode, interestRate: Number(String(form.interestRate).replace(',', '.').replace('%', '')) || 0,
          fixedInterest: D.parseMoney(form.fixedInterest), fixedInterestBasis: form.fixedInterestBasis, interestFrequency: form.interestFrequency, repaymentMode: form.repaymentMode
        } }));
      }
      if (props.type === 'lend') {
        body.push(h(Field, { label: 'Nguồn vốn', key: 'funding', help: form.fundingSource === 'mixed' ? 'Kết hợp được ghi nhận như một nguồn tổng hợp; Rootflow không hỏi liên kết khoản vay.' : null }, h(Select, { value: form.fundingSource, onChange: function (v) { setForm(function (prev) { return Object.assign({}, prev, { fundingSource: v, fundingContractId: v === 'borrowed' ? prev.fundingContractId : '' }); }); setError(''); } }, h('option', { value: 'own' }, 'Tiền của tôi'), h('option', { value: 'borrowed' }, 'Vay từ người khác'), h('option', { value: 'mixed' }, 'Kết hợp'))));
        if (form.fundingSource === 'borrowed') body.push(h(Field, { label: 'Liên kết khoản vay', key: 'link' }, h(Select, { value: form.fundingContractId, onChange: function (v) { set('fundingContractId', v); } }, h('option', { value: '' }, 'Chọn khoản vay'), payableContracts.map(function (c) { return h('option', { value: c.id, key: c.id }, c.counterpartyName + ' · ' + compactMoney(c.originalPrincipal)); }))));
      }
    } else if (props.type === 'collect' || props.type === 'repay') {
      var targets = props.type === 'collect' ? receivables : liabilities;
      var selectedTarget = targets.filter(function (a) { return a.id === form.targetAccountId; })[0];
      body.push(h(Field, { label: props.type === 'collect' ? 'Khoản phải thu' : 'Khoản phải trả', key: 'target', help: selectedTarget ? 'Còn lại: ' + compactMoney(accountBalances[selectedTarget.id] || 0) : null }, h(Select, { value: form.targetAccountId, onChange: function (v) {
        var linked = props.data.contracts.filter(function (c) { return c.accountId === v && c.status !== 'closed'; })[0];
        setForm(function (prev) { return Object.assign({}, prev, { targetAccountId: v, repaymentMode: linked && linked.repaymentMode ? linked.repaymentMode : 'principal_interest' }); }); setError('');
      } }, h('option', { value: '' }, targets.length ? 'Chọn khoản' : 'Không có khoản đang mở'), targets.map(function (a) { return h('option', { value: a.id, key: a.id }, a.name); }))));
      body.push(liquidSelect(props.type === 'collect' ? 'Tài khoản nhận' : 'Tài khoản trả'));
      if (props.type === 'repay') body.push(h(Field, { label: 'Hình thức thanh toán', key: 'payment-mode', help: form.repaymentMode === 'interest_only' ? 'Dư gốc không giảm sau giao dịch này.' : 'Chỉ phần gốc nhập bên dưới làm giảm dư nợ.' }, h(Select, { value: form.repaymentMode, onChange: function (v) { set('repaymentMode', v); } }, h('option', { value: 'principal_interest' }, 'Trả gốc + lãi'), h('option', { value: 'interest_only' }, 'Chỉ trả lãi'))));
      if (props.type === 'repay' && form.repaymentMode === 'interest_only') body.push(money('Tiền lãi', 'interest', '1M'));
      else body.push(h('div', { className: 'form-grid', key: 'split' }, money('Phần gốc', 'principal', props.type === 'collect' ? '10M' : '20M'), money(props.type === 'collect' ? 'Tiền lãi' : 'Chi phí vay', 'interest', props.type === 'collect' ? '2M' : '1M')));
      body.push(date('Ngày giao dịch', 'date'));
    } else {
      if (props.type === 'buy_asset') body.push(h(Field, { label: 'Tên tài sản', key: 'asset' }, h(TextInput, { value: form.assetName, onChange: function (e) { set('assetName', e.target.value); }, placeholder: 'Ví dụ: Laptop, xe, vàng' })));
      body.push(money('Số tiền', 'amount', '25M'));
      body.push(liquidSelect(props.type === 'income' ? 'Tài khoản nhận' : 'Tài khoản nguồn'));
      if (props.type === 'transfer') body.push(h(Field, { label: 'Tài khoản đích', key: 'counter' }, h(Select, { value: form.counterAccountId, onChange: function (v) { set('counterAccountId', v); } }, h('option', { value: '' }, 'Chọn tài khoản'), liquid.filter(function (a) { return a.id !== form.accountId; }).map(function (a) { return h('option', { value: a.id, key: a.id }, a.name); }))));
      if (props.type === 'expense') body.push(h(Field, { label: 'Nhóm chi tiêu', key: 'cat' }, h(Select, { value: form.category, onChange: function (v) { set('category', v); } }, h('option', { value: '' }, 'Chọn nhóm'), BUDGET_CATEGORIES.map(function (item) { return h('option', { value: item.id, key: item.id }, item.label); }))));
      if (props.type === 'income' || props.type === 'other') body.push(h(Field, { label: 'Nội dung', key: 'cat' }, h(TextInput, { value: form.category, onChange: function (e) { set('category', e.target.value); }, placeholder: props.type === 'income' ? 'Lương, thưởng…' : 'Mô tả giao dịch' })));
      body.push(date('Ngày', 'date'));
    }
    if (props.type === 'borrow' || props.type === 'lend') body.push(h(Field, { label: 'Độ chắc chắn của dòng hoàn trả', key: 'confidence' }, h(Select, { value: form.confidence, onChange: function (v) { set('confidence', v); } }, h('option', { value: 'CERTAIN' }, 'Confirmed — đã cam kết'), h('option', { value: 'EXPECTED' }, 'Expected — dự kiến'), h('option', { value: 'UNCERTAIN' }, 'Uncertain — chưa chắc chắn'))));
    body.push(h(Field, { label: 'Ghi chú (không bắt buộc)', key: 'note' }, h(TextInput, { value: form.note, onChange: function (e) { set('note', e.target.value); }, placeholder: 'Chi tiết thêm' })));
    if (error) body.push(h('div', { className: 'field-error', key: 'err' }, error));
    body.push(h('button', { type: 'button', className: 'primary-button', onClick: submit, key: 'save' }, 'Lưu giao dịch'));
    return h(React.Fragment, null, body);
  }

  function EventComposer(props) {
    var state = React.useState(null), type = state[0], setType = state[1];
    var current = EVENT_TYPES.filter(function (x) { return x[0] === type; })[0];
    return h(Sheet, { title: type ? current[2] : 'Thêm giao dịch', onClose: props.onClose, onBack: type ? function () { setType(null); } : null },
      type ? h(EventForm, { type: type, data: props.data, onSave: props.onSave })
        : h(React.Fragment, null, h('p', { className: 'sheet-intro' }, 'Điều gì đã xảy ra? Rootflow tự xử lý phần kế toán phía sau.'),
          h('div', { className: 'action-list' }, EVENT_TYPES.map(function (item) {
            return h('button', { type: 'button', className: 'action-row', key: item[0], onClick: function () { setType(item[0]); } },
              h('div', { className: 'flow-icon' }, h(Icon, { name: item[1] })), h('div', { className: 'action-copy' }, h('strong', null, item[2]), h('span', null, item[3])), h(Icon, { name: 'chevron' }));
          }))));
  }

  function BudgetForm(props) {
    var existing = props.budget || null;
    var state = React.useState(existing && existing.limit ? D.groupDigits(existing.limit) : ''), limit = state[0], setLimit = state[1];
    function save() {
      props.onSave({
        id: existing ? existing.id : S.uid(), month: props.month,
        name: props.category.label, category: props.category.id, icon: props.category.icon,
        limit: Math.max(0, D.parseMoney(limit)),
        createdAt: existing ? existing.createdAt : S.now(), updatedAt: S.now()
      });
    }
    return h(React.Fragment, null,
      h('div', { className: 'budget-form-heading' }, h('div', { className: 'budget-icon large' }, h(Icon, { name: props.category.icon })),
        h('div', null, h('strong', null, props.category.label), h('span', null, D.fmtMonth(props.month)))),
      h(Field, { label: 'Hạn mức tháng', help: 'Đây là ngưỡng quản trị, không làm thay đổi số dư hay ledger.' }, h(MoneyInput, { value: limit, onChange: setLimit, placeholder: '5M' })),
      h('button', { type: 'button', className: 'primary-button', onClick: save }, existing ? 'Lưu hạn mức mới' : 'Đặt hạn mức'),
      existing ? h('button', { type: 'button', className: 'danger-button budget-delete', onClick: function () { props.onDelete(existing.id); } }, 'Xóa hạn mức nhóm này') : null);
  }

  function BudgetScreen(props) {
    var monthState = React.useState(D.monthOf(D.today())), ym = monthState[0], setYm = monthState[1];
    var rows = budgetRows(props.data, ym);
    var totalLimit = rows.reduce(function (sum, row) { return sum + row.limit; }, 0);
    var totalSpent = rows.reduce(function (sum, row) { return sum + row.spent; }, 0);
    var remaining = totalLimit - totalSpent;
    var pct = totalLimit ? Math.min(100, totalSpent / totalLimit * 100) : 0;
    var overCount = rows.filter(function (row) { return row.limit > 0 && row.spent > row.limit; }).length;
    var unplanned = rows.reduce(function (sum, row) { return sum + (row.limit ? 0 : row.spent); }, 0);
    return h('main', { className: 'page' },
      h(AppBar, { title: 'Kế hoạch tháng', subtitle: 'Quản trị chi tiêu theo nhóm', onBack: props.onBack }),
      h('div', { className: 'content' },
        h('div', { className: 'month-control budget-month' },
          h(IconButton, { icon: 'back', label: 'Tháng trước', onClick: function () { setYm(D.addMonthsToYm(ym, -1)); } }),
          h('strong', null, D.fmtMonth(ym)),
          h(IconButton, { icon: 'chevron', label: 'Tháng sau', onClick: function () { setYm(D.addMonthsToYm(ym, 1)); } })),
        h('section', { className: 'budget-summary' },
          h('div', { className: 'budget-summary-head' }, h('div', null, h('span', null, 'Đã chi / kế hoạch'), h('strong', null, compactMoney(totalSpent) + ' / ' + compactMoney(totalLimit))),
            h('div', { className: 'budget-remaining ' + (remaining < 0 ? 'negative' : '') }, h('span', null, remaining < 0 ? 'Vượt' : 'Còn lại'), h('strong', null, compactMoney(Math.abs(remaining))))),
          h('div', { className: 'budget-progress summary ' + (remaining < 0 ? 'over' : pct >= 80 ? 'warning' : '') }, h('i', { style: { width: pct + '%' } })),
          h('p', null, totalLimit ? (overCount ? overCount + ' nhóm đã vượt hạn mức. Ưu tiên điều chỉnh trước khi tăng ngân sách tổng.' : pct >= 80 ? 'Bạn đã dùng từ 80% ngân sách. Kiểm tra các khoản còn lại của tháng.' : 'Ngân sách đang trong vùng kiểm soát.') : 'Chạm vào từng nhóm bên dưới để bắt đầu lập kế hoạch.')),
        unplanned > 0 ? h('div', { className: 'data-note budget-note' }, 'Có ' + compactMoney(unplanned) + ' chi tiêu thuộc nhóm chưa đặt hạn mức. Hãy đặt kế hoạch để số liệu tổng có ý nghĩa.') : null,
        h('section', { className: 'section budget-section' },
          h('h2', { className: 'section-heading' }, 'Nhóm chi tiêu'),
          h('div', { className: 'budget-grid' }, rows.map(function (row) {
            var rowPct = row.limit ? Math.min(100, row.spent / row.limit * 100) : 0;
            var rowClass = row.limit && row.spent > row.limit ? 'over' : row.limit && row.spent >= row.limit * .8 ? 'warning' : '';
            return h('button', { type: 'button', className: 'budget-card ' + rowClass, key: row.category.id, onClick: function () { props.onEdit(row.category, ym, row.budget); } },
              h('div', { className: 'budget-card-top' }, h('div', { className: 'budget-icon' }, h(Icon, { name: row.category.icon })), h(Icon, { name: 'chevron', className: 'budget-chevron' })),
              h('strong', { className: 'budget-card-name' }, row.category.label),
              h('span', { className: 'budget-card-amount' }, row.limit ? compactMoney(row.spent) + ' / ' + compactMoney(row.limit) : row.spent ? compactMoney(row.spent) + ' đã chi' : 'Đặt ngân sách'),
              h('div', { className: 'budget-progress' }, h('i', { style: { width: rowPct + '%' } })));
          }))),
        h('div', { className: 'advice-card' }, h(Icon, { name: 'shield' }), h('div', null,
          h('strong', null, 'Nguyên tắc quản trị'),
          h('span', null, 'Giữ chi phí cố định trong một nhóm riêng, đặt cảnh báo ở 80%, và không dùng khoản thu Expected để nới hạn mức tháng.')))));
  }

  function Settings(props) {
    var s = props.data.settings;
    var state = React.useState({ hardFloor: s.hardFloor ? D.groupDigits(s.hardFloor) : '', operatingBuffer: s.operatingBuffer ? D.groupDigits(s.operatingBuffer) : '', comfortBuffer: s.comfortBuffer ? D.groupDigits(s.comfortBuffer) : '', horizonDays: s.horizonDays || 90 });
    var form = state[0], setForm = state[1];
    function set(key, value) { setForm(function (prev) { var next = Object.assign({}, prev); next[key] = value; return next; }); }
    function save() {
      var hard = D.parseMoney(form.hardFloor), operating = Math.max(hard, D.parseMoney(form.operatingBuffer)), comfort = Math.max(operating, D.parseMoney(form.comfortBuffer));
      props.onSave({ hardFloor: hard, reserveFloor: hard, operatingBuffer: operating, comfortBuffer: comfort, horizonDays: Math.max(30, Math.min(365, Number(form.horizonDays) || 90)) });
    }
    function accountRow(a) {
      var contract = props.data.contracts.filter(function (row) { return row.accountId === a.id; })[0];
      var meta = D.ACCOUNT_TYPES[a.type] ? D.ACCOUNT_TYPES[a.type].label : a.type;
      if (contract) {
        meta += contract.status === 'closed' ? ' · Đã tất toán'
          : contract.type === 'payable' && contract.repaymentMode === 'interest_only' ? ' · Chỉ lãi + gốc cuối kỳ'
          : ' · Đang theo dõi';
      }
      return h('button', { type: 'button', className: 'account-edit-row', key: a.id, onClick: function () { props.onEditAccount(a); } },
        h('div', { className: 'flow-icon' }, h(Icon, { name: D.isLiability(a) ? 'borrow' : D.isReceivable(a) ? 'people' : D.isLiquid(a) ? 'wallet' : 'asset' })),
        h('div', { className: 'row-label' }, h('strong', { title: a.name }, a.name), h('span', null, meta)),
        h('span', { className: 'row-value' }, compactMoney(props.balances[a.id] || 0)), h(Icon, { name: 'chevron' }));
    }
    var activeAccounts = props.data.accounts.filter(function (a) { return !a.archived; });
    var archivedAccounts = props.data.accounts.filter(function (a) { return a.archived; });
    return h(React.Fragment, null,
      h('div', { className: 'settings-group' }, h('h3', null, 'Ngưỡng thanh khoản'),
        h(Field, { label: 'Hard floor', help: 'Mức tiền tuyệt đối bạn không muốn xuống dưới.' }, h(MoneyInput, { value: form.hardFloor, onChange: function (v) { set('hardFloor', v); }, placeholder: '20M' })),
        h(Field, { label: 'Operating buffer', help: 'Mức tiền cần để vận hành bình thường.' }, h(MoneyInput, { value: form.operatingBuffer, onChange: function (v) { set('operatingBuffer', v); }, placeholder: '35M' })),
        h(Field, { label: 'Comfort buffer' }, h(MoneyInput, { value: form.comfortBuffer, onChange: function (v) { set('comfortBuffer', v); }, placeholder: '50M' })),
        h(Field, { label: 'Kỳ dự phóng (ngày)' }, h(TextInput, { type: 'number', min: 30, max: 365, value: form.horizonDays, onChange: function (e) { set('horizonDays', e.target.value); } })),
        h('button', { type: 'button', className: 'primary-button', onClick: save }, 'Lưu ngưỡng')),
      h('div', { className: 'settings-group section' }, h('h3', null, 'Tài khoản'),
        activeAccounts.length ? h('div', { className: 'account-list' }, activeAccounts.map(accountRow)) : h('div', { className: 'data-note' }, 'Chưa có tài khoản đang hoạt động.'),
        h('button', { type: 'button', className: 'secondary-button', style: { marginTop: 10 }, onClick: props.onAddAccount }, 'Thêm tài khoản'),
        archivedAccounts.length ? h('div', { className: 'archived-accounts' }, h('h4', null, 'Đã lưu trữ'), h('div', { className: 'account-list muted-list' }, archivedAccounts.map(accountRow))) : null),
      h('div', { className: 'settings-group section' }, h('h3', null, 'Quản trị chi tiêu'),
        h('button', { type: 'button', className: 'settings-link-row', onClick: props.onBudgets },
          h('div', { className: 'flow-icon' }, h(Icon, { name: 'shopping' })),
          h('div', { className: 'row-label' }, h('strong', null, 'Kế hoạch chi tiêu tháng'), h('span', null, 'Hạn mức, tiến độ và cảnh báo theo nhóm')), h(Icon, { name: 'chevron' }))),
      props.data.scenarios.length ? h('div', { className: 'settings-group section' }, h('h3', null, 'Kịch bản đã lưu'),
        h('div', { className: 'account-list' }, props.data.scenarios.slice().reverse().slice(0, 8).map(function (scenario) {
          return h('div', { className: 'setting-row', key: scenario.id }, h('div', { className: 'row-label' }, h('strong', null, scenario.name || 'Kịch bản'), h('span', null, scenario.date ? D.fmtDateFull(scenario.date) : 'Chưa đặt ngày')), h('span', { className: 'row-value' }, compactMoney(scenario.amount || 0)));
        }))) : null,
      h('div', { className: 'settings-group section' }, h('h3', null, 'Dữ liệu & kiểm tra'),
        h('div', { className: 'button-row' }, h('button', { type: 'button', className: 'secondary-button', onClick: props.onExport }, 'Xuất backup'), h('label', { className: 'secondary-button', style: { display: 'grid', placeItems: 'center' } }, 'Nhập backup', h('input', { type: 'file', accept: 'application/json', hidden: true, onChange: function (e) { if (e.target.files[0]) props.onImport(e.target.files[0]); } }))),
        h('button', { type: 'button', className: 'secondary-button', style: { marginTop: 10 }, onClick: props.onTest }, 'Chạy kiểm tra nghiệp vụ'),
        h('div', { className: 'data-note' }, 'Local-first · Không tài khoản · Không analytics · Không theo dõi. Backup trước khi xóa dữ liệu trình duyệt.')));
  }

  function App() {
    var loaded = React.useMemo(function () { return S.load(); }, []);
    var dataState = React.useState(loaded.data), data = dataState[0], setData = dataState[1];
    var viewState = React.useState('home'), view = viewState[0], setView = viewState[1];
    var subState = React.useState(null), subview = subState[0], setSubview = subState[1];
    var overlayState = React.useState(null), overlay = overlayState[0], setOverlay = overlayState[1];
    var accountState = React.useState(null), editingAccount = accountState[0], setEditingAccount = accountState[1];
    var budgetState = React.useState(null), budgetEditor = budgetState[0], setBudgetEditor = budgetState[1];
    var toastState = React.useState(loaded.error || ''), toast = toastState[0], setToast = toastState[1];

    React.useEffect(function () { S.persist(); }, []);
    React.useEffect(function () { if (!toast) return; var t = setTimeout(function () { setToast(''); }, 3200); return function () { clearTimeout(t); }; }, [toast]);

    function commit(mutator, message) {
      var next = JSON.parse(JSON.stringify(data));
      mutator(next);
      next.schemaVersion = S.SCHEMA;
      var saved = S.save(next);
      setData(next);
      setToast(saved.ok ? (message || 'Đã lưu trên thiết bị.') : saved.error);
    }

    var derived = React.useMemo(function () {
      var balances = D.balances(data.accounts, data.flows);
      var totals = D.totals(data.accounts, balances);
      var liquidity = D.liquidityModel(data.accounts, data.flows, data.settings);
      var liquidAccounts = data.accounts.filter(function (a) { return !a.archived && D.isLiquid(a); });
      var upcoming = D.upcoming(data.flows, 30).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
      var pressureFlows = data.flows.filter(function (f) { return !f.deletedAt && !f.skipped && !f.confirmed && f.date === liquidity.pressurePointDate; });
      return { balances: balances, totals: totals, liquidity: liquidity, liquidAccounts: liquidAccounts, upcoming: upcoming, pressureFlows: pressureFlows };
    }, [data]);

    function go(next) { setView(next); setSubview(null); global.scrollTo({ top: 0, behavior: 'auto' }); }
    function closeOverlay() { setOverlay(null); }
    function openAddAccount() { setEditingAccount(null); setOverlay('account'); }
    function openEditAccount(account) { setEditingAccount(account); setOverlay('account'); }
    function saveAccount(account, contractPatch) {
      var isEdit = data.accounts.some(function (row) { return row.id === account.id; });
      commit(function (next) {
        var accountIndex = next.accounts.findIndex(function (row) { return row.id === account.id; });
        if (accountIndex >= 0) next.accounts[accountIndex] = account;
        else next.accounts.push(account);
        if (!contractPatch) return;
        var cp = counterparty(next, contractPatch.counterpartyName);
        contractPatch.counterpartyId = cp.id;
        var contractIndex = next.contracts.findIndex(function (row) { return row.id === contractPatch.id || row.accountId === account.id; });
        if (contractIndex >= 0) next.contracts[contractIndex] = contractPatch;
        else next.contracts.push(contractPatch);
        next.flows.forEach(function (flow) {
          if (flow.contractId !== contractPatch.id) return;
          flow.counterpartyId = cp.id;
          flow.counterpartyName = cp.name;
          if ((contractPatch.type === 'payable' && flow.kind === 'borrow') || (contractPatch.type === 'receivable' && flow.kind === 'lend')) {
            flow.amount = contractPatch.originalPrincipal;
            flow.accountId = contractPatch.settlementAccountId || flow.accountId;
            flow.date = contractPatch.startDate || flow.date;
          }
          flow.updatedAt = S.now();
        });
        var remaining = contractState(contractPatch, next.flows);
        contractPatch.status = remaining.principal <= 0 && remaining.interest <= 0 ? 'closed' : 'active';
        rebuildContractSchedule(next, contractPatch);
      }, isEdit ? 'Đã cập nhật tài khoản.' : 'Đã thêm tài khoản.');
      setOverlay(null); setEditingAccount(null);
    }
    function counterparty(next, name) {
      var normalized = String(name || '').trim();
      var found = next.counterparties.filter(function (p) { return p.name.toLowerCase() === normalized.toLowerCase(); })[0];
      if (found) return found;
      found = { id: S.uid(), name: normalized, note: '', createdAt: S.now(), updatedAt: S.now() };
      next.counterparties.push(found); return found;
    }
    function pushFlow(next, flow) {
      next.flows.push(Object.assign({ id: S.uid(), date: D.today(), confirmed: true, confidence: 'CERTAIN', skipped: false, amount: 0, category: '', note: '', createdAt: S.now(), updatedAt: S.now() }, flow));
    }
    function saveEvent(type, form) {
      commit(function (next) {
        var actual = form.date <= D.today();
        if (type === 'borrow' || type === 'lend') {
          var cp = counterparty(next, form.counterparty);
          var accountType = type === 'borrow' ? 'loan' : 'receivable';
          var account = { id: S.uid(), name: (type === 'borrow' ? 'Vay · ' : 'Phải thu · ') + cp.name, type: accountType, openingBalance: 0, balanceAsOf: form.date, archived: false, createdAt: S.now(), updatedAt: S.now() };
          next.accounts.push(account);
          var contract = { id: S.uid(), type: type === 'borrow' ? 'payable' : 'receivable', counterpartyId: cp.id, counterpartyName: cp.name, accountId: account.id, originalPrincipal: form.amountValue, startDate: form.date, firstPaymentDate: type === 'borrow' && form.interestFrequency === 'monthly' ? form.firstPaymentDate : null, maturityDate: type === 'borrow' ? form.dueDate : form.expectedDate, interestMode: form.interestMode || 'none', interestRate: form.interestMode === 'rate' ? Number(String(form.interestRate).replace(',', '.').replace('%', '')) || 0 : 0, fixedInterest: form.interestMode === 'fixed' ? form.fixedInterestValue : 0, fixedInterestBasis: form.fixedInterestBasis, interestFrequency: type === 'borrow' ? form.interestFrequency : 'at_maturity', repaymentMode: type === 'borrow' ? form.repaymentMode : 'principal_interest', principalDueDate: type === 'borrow' && form.repaymentMode === 'interest_only' ? form.dueDate : null, settlementAccountId: form.accountId, confidence: form.confidence, status: 'active', fundingSource: form.fundingSource || 'own', fundingContractId: form.fundingSource === 'borrowed' ? form.fundingContractId || null : null, note: form.note, createdAt: S.now(), updatedAt: S.now() };
          next.contracts.push(contract);
          pushFlow(next, { kind: type, accountId: form.accountId, counterAccountId: account.id, amount: form.amountValue, date: form.date, confirmed: actual, confidence: actual ? 'CERTAIN' : form.confidence, contractId: contract.id, counterpartyId: cp.id, counterpartyName: cp.name, fundingSource: form.fundingSource, fundingContractId: contract.fundingContractId, note: form.note });
          rebuildContractSchedule(next, contract);
        } else if (type === 'collect' || type === 'repay') {
          var contractMatch = next.contracts.filter(function (c) { return c.accountId === form.targetAccountId && c.status !== 'closed'; })[0];
          var name = contractMatch ? contractMatch.counterpartyName : '';
          pushFlow(next, { kind: type, accountId: form.accountId, counterAccountId: form.targetAccountId, amount: form.amountValue, principalAmount: form.principalValue, borrowingCost: type === 'repay' ? form.interestValue : undefined, interestAmount: type === 'collect' ? form.interestValue : undefined, date: form.date, confirmed: actual, confidence: actual ? 'CERTAIN' : form.confidence, contractId: contractMatch && contractMatch.id, counterpartyId: contractMatch && contractMatch.counterpartyId, counterpartyName: name, note: form.note });
          if (contractMatch) {
            var remaining = contractState(contractMatch, next.flows);
            contractMatch.status = remaining.principal <= 0 && remaining.interest <= 0 ? 'closed' : 'active';
            contractMatch.updatedAt = S.now();
            rebuildContractSchedule(next, contractMatch);
          }
        } else if (type === 'buy_asset') {
          var asset = { id: S.uid(), name: form.assetName.trim(), type: 'fixed_asset', openingBalance: 0, balanceAsOf: form.date, archived: false, createdAt: S.now(), updatedAt: S.now() };
          next.accounts.push(asset);
          pushFlow(next, { kind: 'transfer', accountId: form.accountId, counterAccountId: asset.id, amount: form.amountValue, date: form.date, confirmed: actual, confidence: actual ? 'CERTAIN' : 'EXPECTED', note: form.note || 'Mua ' + asset.name });
        } else {
          var kind = type === 'other' ? 'fee' : type;
          var category = type === 'expense' ? categoryId(form.category) : form.category;
          pushFlow(next, { kind: kind, accountId: form.accountId, counterAccountId: type === 'transfer' ? form.counterAccountId : null, amount: form.amountValue, date: form.date, confirmed: actual, confidence: actual ? 'CERTAIN' : 'EXPECTED', category: category, title: type === 'expense' ? categoryMeta(category).label : '', note: form.note || (type === 'expense' ? categoryMeta(category).label : form.category) });
        }
      }, 'Đã ghi giao dịch.');
      setOverlay(null);
    }
    function saveSettings(settings) { commit(function (next) { next.settings = Object.assign({}, next.settings, settings); }, 'Đã cập nhật buffer.'); setOverlay(null); }
    function openBudgets() { setOverlay(null); setSubview('budgets'); global.scrollTo(0, 0); }
    function editBudget(category, month, budget) { setBudgetEditor({ category: category, month: month, budget: budget || null }); setOverlay('budget'); }
    function saveBudget(budget) {
      commit(function (next) {
        var index = next.budgets.findIndex(function (row) { return row.id === budget.id || (row.month === budget.month && categoryId(row.category) === budget.category); });
        if (index >= 0) next.budgets[index] = budget; else next.budgets.push(budget);
      }, 'Đã cập nhật kế hoạch tháng.');
      setOverlay(null); setBudgetEditor(null);
    }
    function deleteBudget(id) { commit(function (next) { next.budgets = next.budgets.filter(function (row) { return row.id !== id; }); }, 'Đã xóa hạn mức.'); setOverlay(null); setBudgetEditor(null); }
    function saveScenario(scenario) { commit(function (next) { next.scenarios.push(Object.assign({ id: S.uid(), createdAt: S.now(), updatedAt: S.now() }, scenario)); }, 'Đã lưu kịch bản.'); }
    function importBackup(file) { S.importFile(file, function (err, imported) { if (err) return setToast(err); var saved = S.save(imported); if (saved.ok) { setData(imported); setOverlay(null); setToast('Đã khôi phục bản sao lưu.'); } else setToast(saved.error); }); }
    function diagnostics() { var result = global.rootflowSelfTest(); setToast(result.failed ? result.failed + ' kiểm tra chưa đạt.' : 'Tất cả ' + result.total + ' kiểm tra nghiệp vụ đều đạt.'); }

    var screen;
    if (subview === 'risk') screen = h(BufferRisk, { derived: derived, onBack: function () { setSubview(null); }, onSettings: function () { setOverlay('settings'); } });
    else if (subview === 'budgets') screen = h(BudgetScreen, { data: data, derived: derived, onBack: function () { setSubview(null); }, onEdit: editBudget });
    else if (view === 'flow') screen = h(FlowScreen, { data: data, derived: derived, onAdd: function () { setOverlay('composer'); }, onSettings: function () { setOverlay('settings'); } });
    else if (view === 'position') screen = h(PositionScreen, { data: data, derived: derived, onSettings: function () { setOverlay('settings'); } });
    else if (view === 'decide') screen = h(DecideScreen, { data: data, derived: derived, onSettings: function () { setOverlay('settings'); }, onToast: setToast, onSaveScenario: saveScenario });
    else screen = h(Home, { data: data, derived: derived, onSettings: function () { setOverlay('settings'); }, onAddAccount: openAddAccount, onBudgets: openBudgets, onRisk: function () { setSubview('risk'); global.scrollTo(0, 0); }, onFlow: function () { go('flow'); } });

    return h('div', { className: 'app' }, screen,
      h(BottomNav, { view: view, onGo: go, onAdd: function () { setOverlay('composer'); } }),
      overlay === 'composer' ? h(EventComposer, { data: data, onClose: closeOverlay, onSave: saveEvent }) : null,
      overlay === 'account' ? h(Sheet, { title: editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản', onClose: closeOverlay }, h(AccountForm, {
        account: editingAccount,
        contract: editingAccount ? data.contracts.filter(function (row) { return row.accountId === editingAccount.id; })[0] : null,
        currentBalance: editingAccount ? derived.balances[editingAccount.id] || 0 : 0,
        hasContractFlows: editingAccount ? data.flows.some(function (flow) { return flow.contractId && flow.counterAccountId === editingAccount.id && (flow.kind === 'borrow' || flow.kind === 'lend'); }) : false,
        liquidAccounts: derived.liquidAccounts, onSave: saveAccount
      })) : null,
      overlay === 'budget' && budgetEditor ? h(Sheet, { title: 'Ngân sách · ' + budgetEditor.category.label, onClose: closeOverlay }, h(BudgetForm, { category: budgetEditor.category, month: budgetEditor.month, budget: budgetEditor.budget, onSave: saveBudget, onDelete: deleteBudget })) : null,
      overlay === 'settings' ? h(Sheet, { title: 'Cài đặt & dữ liệu', onClose: closeOverlay }, h(Settings, { data: data, balances: derived.balances, onSave: saveSettings, onAddAccount: openAddAccount, onEditAccount: openEditAccount, onBudgets: openBudgets, onExport: function () { S.exportFile(data); }, onImport: importBackup, onTest: diagnostics })) : null,
      toast ? h('div', { className: 'toast', role: 'status' }, toast) : null);
  }

  function ErrorBoundary(props) { React.Component.call(this, props); this.state = { error: null }; }
  ErrorBoundary.prototype = Object.create(React.Component.prototype);
  ErrorBoundary.prototype.constructor = ErrorBoundary;
  ErrorBoundary.getDerivedStateFromError = function (error) { return { error: error }; };
  ErrorBoundary.prototype.render = function () {
    if (!this.state.error) return this.props.children;
    return h('div', { className: 'boot' }, 'Rootflow gặp lỗi khi mở. Hãy tải lại trang hoặc khôi phục backup.');
  };

  ReactDOM.createRoot(document.getElementById('root')).render(h(ErrorBoundary, null, h(App)));

  if ('serviceWorker' in navigator) {
    global.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); });
  }
})(window);
