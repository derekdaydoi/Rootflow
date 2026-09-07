/* Rootflow — decision-first React presentation for the Personal Capital & Cashflow Operating System.
   React owns every rendered region. Financial semantics and persistence stay in domain/store. */
(function (global) {
  'use strict';

  var React = global.React;
  var D = global.RootflowDomain;
  var S = global.RootflowStore;
  if (!React || !D || !S) return;

  var h = React.createElement;
  var finalSummary = D.finalSummary || D.v4FinalSummary;
  var operatingSummary = D.operatingSummary || D.v4OperatingSummary;
  var projectionSummary = D.capitalProjectionSummary || D.v4ProjectionSummary;
  var futureEvents = D.futureEvents || D.v4FutureEvents;
  if (!finalSummary || !operatingSummary || !projectionSummary || !futureEvents) return;

  function cx() { return Array.prototype.slice.call(arguments).filter(Boolean).join(' '); }
  function money(value, signed) {
    var n = Number(value) || 0;
    var sign = n < 0 ? '−' : signed && n > 0 ? '+' : '';
    var text;
    try { text = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.abs(n)); }
    catch (e) { text = String(Math.round(Math.abs(n))); }
    return sign + text + ' ₫';
  }
  function compactMoney(value) {
    var n = Math.abs(Number(value) || 0);
    if (n >= 1e9) return (Math.round(n / 1e8) / 10).toString().replace('.0', '') + 'B';
    if (n >= 1e6) return (Math.round(n / 1e5) / 10).toString().replace('.0', '') + 'M';
    if (n >= 1e3) return (Math.round(n / 1e2) / 10).toString().replace('.0', '') + 'K';
    return String(Math.round(n));
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
    return p.length === 2 ? 'Tháng ' + Number(p[1]) + '/' + p[0] : String(ym || '');
  }
  function parseAmount(value) {
    if (D.parseMoney) return Math.max(0, Number(D.parseMoney(String(value || ''))) || 0);
    return Math.max(0, Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0);
  }
  function statusMeta(status) {
    if (status === 'SHORTFALL') return { cls: 'danger', label: 'Thiếu thanh khoản', note: 'Dòng tiền chắc chắn tạo funding gap nếu không bổ sung tiền.' };
    if (status === 'THIN_BUFFER') return { cls: 'warn', label: 'Buffer còn mỏng', note: 'Đủ nghĩa vụ tối thiểu nhưng chưa đạt mức dự phòng.' };
    return { cls: 'good', label: 'Thanh khoản ổn', note: 'Kịch bản chắc chắn đang nằm trong vùng vận hành an toàn.' };
  }
  function confidenceMeta(value) {
    var key = String(value || 'UNKNOWN').toUpperCase();
    if (key === 'CERTAIN') return { cls: 'certain', label: 'Chắc chắn' };
    if (key === 'EXPECTED' || key === 'INFERRED') return { cls: 'expected', label: 'Dự kiến' };
    return { cls: 'uncertain', label: 'Chưa chắc' };
  }
  function icon(name) {
    var paths = {
      home: '<path d="M3 11.5 12 4l9 7.5V20H6v-8"/><path d="M10 20v-6h4v6"/>',
      flow: '<path d="M4 7h12m0 0-3-3m3 3-3 3M20 17H8m0 0 3-3m-3 3 3 3"/>',
      capital: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
      plan: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>',
      living: '<path d="M4 11 12 4l8 7v9H4Z"/><path d="M9 20v-6h6v6"/>',
      salary: '<path d="M4 7h16v11H4zM8 7V4h8v3M8 12h8"/>',
      card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18M7 15h4"/>',
      bank: '<path d="m3 9 9-5 9 5M5 10v7m5-7v7m4-7v7m5-7v7M3 20h18"/>',
      person: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      edit: '<path d="m4 20 4.5-1 9.8-9.8-3.5-3.5L5 15.5 4 20Z"/><path d="m13.8 6.7 3.5 3.5"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
    };
    return h('svg', { className: 'rf-icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', dangerouslySetInnerHTML: { __html: paths[name] || paths.info } });
  }

  function BrandHeader(props) {
    var title = props.title || 'Rootflow';
    return h('header', { className: 'rf-appbar' },
      h('div', { className: 'rf-brand-lockup' },
        h('img', { src: 'brand/rootflow-mark.png', alt: '', draggable: false, className: 'rf-brand-mark' }),
        h('div', null, h('strong', null, 'root', h('b', null, 'flow')), title !== 'Rootflow' ? h('span', null, title) : null)),
      props.action || h('span', { className: 'rf-appbar-spacer' }));
  }

  function Metric(props) {
    return h('div', { className: cx('rf-metric', props.cls) },
      h('span', null, props.label),
      h('strong', null, props.value),
      props.note ? h('small', null, props.note) : null);
  }

  function SectionHead(props) {
    return h('div', { className: 'rf-section-head' }, h('h2', null, props.title), props.action ? h('button', { type: 'button', className: 'rf-text-action', onClick: props.onAction }, props.action) : null);
  }

  function Chart(props) {
    var cp = props.confirmed && props.confirmed.points || [];
    var ep = props.expected && props.expected.points || [];
    var values = cp.concat(ep).map(function (p) { return Number(p.value) || 0; });
    values.push(0, Math.max(0, Number(props.reference) || 0));
    var min = Math.min.apply(Math, values.length ? values : [0]);
    var max = Math.max.apply(Math, values.length ? values : [1]);
    if (max === min) max = min + 1;
    var width = 340, height = 150, px = 8, py = 14;
    function path(points) {
      var range = Math.max(1, max - min);
      return points.map(function (point, i) {
        var x = px + (width - px * 2) * (points.length === 1 ? 0 : i / (points.length - 1));
        var y = py + (height - py * 2) * (1 - (Number(point.value) - min) / range);
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
    }
    var confirmedPath = path(cp), expectedPath = path(ep);
    var refY = py + (height - py * 2) * (1 - (Math.max(0, Number(props.reference) || 0) - min) / Math.max(1, max - min));
    return h('div', { className: 'rf-chart-wrap' },
      h('svg', { className: 'rf-chart', viewBox: '0 0 340 150', role: 'img', 'aria-label': 'Dự phóng số dư tiền theo thời gian' },
        h('line', { className: 'rf-chart-grid', x1: 8, x2: 332, y1: 136, y2: 136 }),
        h('line', { className: 'rf-chart-buffer', x1: 8, x2: 332, y1: refY.toFixed(1), y2: refY.toFixed(1) }),
        expectedPath ? h('path', { className: 'rf-chart-expected', d: expectedPath }) : null,
        confirmedPath ? h('path', { className: 'rf-chart-confirmed', d: confirmedPath }) : null),
      h('div', { className: 'rf-chart-legend' },
        h('span', null, h('i', { className: 'confirmed' }), 'Kịch bản chắc chắn'),
        h('span', null, h('i', { className: 'expected' }), 'Có dòng tiền dự kiến'),
        h('span', null, h('i', { className: 'buffer' }), 'Mức nên giữ')),
      props.confirmed && props.confirmed.projectedLow !== undefined ? h('div', { className: 'rf-chart-low' }, 'Điểm thấp nhất: ', h('strong', null, money(props.confirmed.projectedLow))) : null);
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
  function EventRow(props) {
    var event = props.event;
    var confidence = confidenceMeta(event.confidence);
    var amount = Number(event.amount) || 0;
    return h('div', { className: 'rf-event-row' },
      h('time', { dateTime: event.date || '' }, fmtDate(event.date, false)),
      h('div', { className: 'rf-event-copy' }, h('strong', null, eventLabel(event)), h('span', { className: cx('rf-confidence', confidence.cls) }, confidence.label)),
      h('b', { className: amount < 0 ? 'negative' : 'positive' }, money(amount, true)));
  }

  function AvailableExplain(props) {
    var op = props.summary.operating;
    var req = op.requirement || {};
    return h('div', { className: 'rf-explain-stack' },
      h('section', { className: 'rf-explain-total' }, h('span', null, 'Tiền hiện có'), h('strong', null, money(op.currentCash))),
      h('section', { className: 'rf-card' },
        h('h2', null, 'Cần giữ'),
        h('div', { className: 'rf-explain-row' }, h('span', null, 'Nghĩa vụ có ngày'), h('strong', null, money(req.datedNeed))),
        h('div', { className: 'rf-explain-row' }, h('span', null, 'Nghĩa vụ tháng chưa rõ ngày'), h('strong', null, money(req.undatedNeed))),
        h('div', { className: 'rf-explain-row' }, h('span', null, 'Chi phí đáo thẻ dự kiến'), h('strong', null, money(req.rolloverNeed))),
        h('div', { className: 'rf-explain-row' }, h('span', null, 'Dự phòng an toàn'), h('strong', null, money(op.safetyReserve))),
        h('div', { className: 'rf-explain-row total' }, h('span', null, 'Tổng cần giữ'), h('strong', null, money(op.recommendedCash)))),
      h('section', { className: 'rf-available-result' }, h('span', null, 'Tiền có thể dùng'), h('strong', null, money(op.availableCash)), h('small', null, 'Dòng tiền Expected không được dùng để nâng mức an toàn hôm nay.')));
  }

  function Overlay(props) {
    return h('div', { className: 'rf-os-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': props.title },
      h('div', { className: 'rf-overlay-page' },
        h('header', { className: 'rf-overlay-head' }, h('button', { type: 'button', className: 'rf-overlay-close', onClick: props.onClose, 'aria-label': 'Quay lại' }, '‹'), h('strong', null, props.title), h('span', null)),
        h('main', { className: 'rf-overlay-body' }, props.children)));
  }

  function HomeScreen(props) {
    var summary = props.summary, op = summary.operating, status = statusMeta(op.status);
    var events = (summary.upcoming || []).slice(0, 5);
    var confirmed = projectionSummary(props.data, 30, 'confirmed');
    var expected = projectionSummary(props.data, 30, 'expected');
    return h('div', { className: 'rf-os-screen rf-home' },
      h('header', { className: 'rf-home-intro' }, h('span', null, fmtDate(D.today(), true)), h('p', null, 'Quyền sử dụng tiền, không chỉ số dư.')),
      h('section', { className: 'rf-available-hero' },
        h('div', { className: 'rf-hero-label' }, 'TIỀN CÓ THỂ DÙNG'),
        h('div', { className: 'rf-hero-value' }, money(op.availableCash)),
        h('div', { className: 'rf-hero-breakdown' }, h('span', null, 'Tiền hiện có', h('strong', null, money(op.currentCash))), h('span', null, 'Cần giữ', h('strong', null, money(op.recommendedCash)))),
        h('button', { type: 'button', className: 'rf-hero-explain', onClick: props.onExplain }, 'Xem cách tính ', icon('chevron'))),
      h('section', { className: 'rf-card rf-liquidity-card' },
        h('div', { className: 'rf-status-line' }, h('span', { className: cx('rf-status-dot', status.cls) }), h('div', null, h('strong', null, status.label), h('small', null, status.note))),
        h('div', { className: 'rf-liquidity-kpis' }, h(Metric, { label: 'Điểm thấp nhất 30 ngày', value: money(op.projectedLow), note: op.pressureDate ? 'Áp lực: ' + fmtDate(op.pressureDate, false) : '', cls: op.projectedLow < 0 ? 'danger' : '' }), h(Metric, { label: 'Vốn có thể triển khai', value: money(op.deployableCapital), note: 'Sau buffer & sinh hoạt', cls: op.deployableCapital > 0 ? 'good' : '' })),
        h(Chart, { confirmed: confirmed, expected: expected, reference: op.recommendedCash })),
      h('section', { className: 'rf-card' }, h(SectionHead, { title: 'Việc sắp tới', action: events.length ? 'Dòng tiền' : '', onAction: props.onCashflow }), h('div', { className: 'rf-event-list' }, events.length ? events.map(function (event, i) { return h(EventRow, { event: event, key: event.id || event.date + '-' + i }); }) : h('p', { className: 'rf-empty' }, 'Chưa có dòng tiền tương lai có ngày cụ thể.'))),
      h('section', { className: 'rf-home-plan-grid' },
        h('div', { className: 'rf-card rf-compact-card' }, h('div', { className: 'rf-card-icon' }, icon('living')), h('span', null, 'Sinh hoạt còn lại'), h('strong', null, money(op.living.remaining)), h('small', null, monthLabel(op.living.month))),
        h('div', { className: 'rf-card rf-compact-card' }, h('div', { className: 'rf-card-icon' }, icon('capital')), h('span', null, 'Vốn deploy an toàn'), h('strong', null, money(op.deployableCapital)), h('small', null, 'Không xuyên buffer'))));
  }

  function CashflowScreen(props) {
    var op = operatingSummary(props.data, props.horizon);
    var events = futureEvents(props.data, props.horizon);
    var confirmed = projectionSummary(props.data, props.horizon, 'confirmed');
    var expected = projectionSummary(props.data, props.horizon, 'expected');
    var status = statusMeta(op.status);
    return h('div', { className: 'rf-os-screen rf-cashflow' },
      h('div', { className: 'rf-segmented', role: 'group', 'aria-label': 'Khoảng dự phóng' }, [7, 30, 90].map(function (days) { return h('button', { type: 'button', key: days, className: props.horizon === days ? 'on' : '', onClick: function () { props.onHorizon(days); } }, days === 90 ? '3 tháng' : days + ' ngày'); })),
      h('section', { className: 'rf-card' }, h('div', { className: 'rf-screen-title' }, h('div', null, h('span', null, 'SỐ DƯ DỰ KIẾN'), h('strong', null, money(op.projectedLow))), h('span', { className: cx('rf-state-pill', status.cls) }, status.label)), h(Chart, { confirmed: confirmed, expected: expected, reference: op.recommendedCash })),
      h('section', { className: 'rf-stat-grid' }, h(Metric, { label: 'Hiện có', value: money(op.currentCash) }), h(Metric, { label: 'Cần giữ', value: money(op.recommendedCash), note: 'Tối thiểu + dự phòng' }), h(Metric, { label: 'Có thể dùng', value: money(op.availableCash), cls: op.availableCash > 0 ? 'good' : '' })),
      h('section', { className: 'rf-card' }, h(SectionHead, { title: 'Dòng tiền theo thời gian' }), h('div', { className: 'rf-event-list' }, events.length ? events.map(function (event, i) { return h(EventRow, { event: event, key: event.id || event.date + '-' + i }); }) : h('p', { className: 'rf-empty' }, 'Chưa có dòng tiền tương lai trong khoảng này.'))));
  }

  function positionKindLabel(kind) {
    if (kind === 'lending') return 'Cho vay';
    if (kind === 'investment') return 'Đầu tư';
    if (kind === 'business') return 'Kinh doanh';
    if (kind === 'asset') return 'Tài sản';
    return 'Khác';
  }
  function PositionRow(props) {
    var row = props.row;
    return h('div', { className: 'rf-position-row' },
      h('div', { className: cx('rf-position-mark', row.kind) }, String(row.name || '?').slice(0, 1).toUpperCase()),
      h('div', { className: 'rf-position-copy' }, h('strong', null, row.name), h('span', null, positionKindLabel(row.kind) + (row.nextDate ? ' · ' + fmtDate(row.nextDate, false) : ''))),
      h('div', { className: 'rf-position-value' }, h('strong', null, money(row.value)), row.recurringIncome ? h('span', null, '+' + compactMoney(row.recurringIncome) + '/th') : null));
  }
  function sourceKindLabel(kind) { return kind === 'credit_card' ? 'Thẻ tín dụng' : kind === 'agent' ? 'Vay cá nhân / Agent' : 'Vay trả góp'; }
  function FundingRow(props) {
    var source = props.source, meta = [];
    if (source.kind === 'credit_card') {
      if (source.statementDay) meta.push('Sao kê ngày ' + source.statementDay);
      else if (source.statementDate) meta.push('Sao kê ' + fmtDate(source.statementDate, false));
      if (source.dueDate) meta.push('Đến hạn ' + fmtDate(source.dueDate, false));
      else if (source.dueDay) meta.push('Đến hạn ngày ' + source.dueDay);
      if (source.maxInterestFreeDays) meta.push('Tối đa ' + source.maxInterestFreeDays + ' ngày miễn lãi');
      if (source.rolloverFeeRate) meta.push('Phí đáo ' + pct(source.rolloverFeeRate));
    } else {
      var rate = Number(source.interestRate) || 0;
      var period = String(source.interestRatePeriod || '').toLowerCase();
      meta.push(rate > 0 ? ((period === 'annual' || period === 'yearly' || period === 'apr') ? 'APR ' : 'Lãi suất kỳ ') + pct(rate) : 'Không ghi nhận lãi suất');
      if (source.maturityDate) meta.push('Kết thúc ' + fmtDate(source.maturityDate, false));
    }
    var iconName = source.kind === 'credit_card' ? 'card' : source.kind === 'agent' ? 'person' : 'bank';
    return h('div', { className: 'rf-funding-row' }, h('div', { className: cx('rf-funding-icon', source.kind) }, icon(iconName)), h('div', { className: 'rf-funding-copy' }, h('div', null, h('strong', null, source.name), h('span', null, sourceKindLabel(source.kind))), h('small', null, meta.join(' · ') || 'Chưa đủ dữ liệu kỳ hạn')), h('div', { className: 'rf-funding-value' }, h('strong', null, money(source.balance)), h('span', null, 'Dư nợ')));
  }
  function CapitalScreen(props) {
    var cap = props.summary.capital;
    if (props.mode === 'funding') {
      return h('div', { className: 'rf-os-screen rf-capital' },
        h('div', { className: 'rf-capital-tabs' }, h('button', { type: 'button', onClick: function () { props.onMode('positions'); } }, 'Tổng quan'), h('button', { type: 'button', className: 'on', onClick: function () { props.onMode('funding'); } }, 'Nguồn vốn')),
        h('section', { className: 'rf-card' }, h(SectionHead, { title: 'Nguồn vốn đang sử dụng', action: 'Thêm', onAction: props.onAdd }), h('div', { className: 'rf-funding-list' }, cap.fundingSources.length ? cap.fundingSources.map(function (source) { return h(FundingRow, { source: source, key: source.id }); }) : h('p', { className: 'rf-empty' }, 'Chưa có nguồn vốn vay đang hoạt động.'))),
        h('section', { className: 'rf-card rf-capital-economics' }, h(SectionHead, { title: 'Chi phí vốn' }), h('div', { className: 'rf-two-col' }, h(Metric, { label: 'Chi phí vốn / tháng', value: money(cap.fundingCostMonthly) }), h(Metric, { label: 'Thu nhập từ vốn / tháng', value: money(cap.capitalIncomeMonthly), cls: cap.capitalIncomeMonthly > 0 ? 'good' : '' })), h('div', { className: 'rf-net-result' }, h('span', null, 'Chênh lệch ròng'), h('strong', { className: cap.netCapitalIncomeMonthly < 0 ? 'negative' : 'positive' }, money(cap.netCapitalIncomeMonthly, true)))));
    }
    return h('div', { className: 'rf-os-screen rf-capital' },
      h('div', { className: 'rf-capital-tabs' }, h('button', { type: 'button', className: 'on', onClick: function () { props.onMode('positions'); } }, 'Tổng quan'), h('button', { type: 'button', onClick: function () { props.onMode('funding'); } }, 'Nguồn vốn')),
      h('section', { className: 'rf-card rf-capital-hero' }, h('span', null, 'TỔNG VỐN ĐANG QUẢN LÝ'), h('strong', null, money(cap.totalManagedCapital)), h('div', { className: 'rf-capital-split' }, h('span', null, 'Đang sinh lợi', h('b', null, money(cap.earningCapital))), h('span', null, 'Tiền mặt', h('b', null, money(cap.cash))), h('span', null, 'Chi tháng này', h('b', null, money(cap.personalSpendThisMonth))))),
      h('section', { className: 'rf-card' }, h(SectionHead, { title: 'Vốn đang chạy', action: 'Thêm', onAction: props.onAdd }), h('div', { className: 'rf-position-list' }, cap.positions.length ? cap.positions.map(function (row) { return h(PositionRow, { row: row, key: row.id }); }) : h('p', { className: 'rf-empty' }, 'Chưa có khoản cho vay, đầu tư, kinh doanh hoặc tài sản đang theo dõi.'))),
      h('section', { className: 'rf-card rf-capital-economics' }, h(SectionHead, { title: 'Hiệu quả vốn' }), h('div', { className: 'rf-two-col' }, h(Metric, { label: 'Thu nhập từ vốn', value: money(cap.capitalIncomeMonthly), note: '/ tháng', cls: cap.capitalIncomeMonthly > 0 ? 'good' : '' }), h(Metric, { label: 'Chi phí vốn', value: money(cap.fundingCostMonthly), note: '/ tháng' })), h('div', { className: 'rf-net-result' }, h('span', null, 'Ròng theo dữ liệu hiện có'), h('strong', { className: cap.netCapitalIncomeMonthly < 0 ? 'negative' : 'positive' }, money(cap.netCapitalIncomeMonthly, true)))));
  }

  function PlanCard(props) {
    return h('section', { className: 'rf-card rf-plan-card' },
      h('div', { className: 'rf-plan-head' }, h('div', { className: 'rf-card-icon' }, icon(props.iconName)), h('div', null, h('span', null, props.title), h('strong', null, props.value)), h('button', { type: 'button', className: 'rf-icon-action', onClick: props.onEdit, 'aria-label': 'Chỉnh ' + props.title }, icon('edit'))),
      h('div', { className: 'rf-plan-rows' }, props.rows.map(function (row, i) { return h('span', { key: i }, row[0], h('b', null, row[1])); })));
  }
  function PlanScreen(props) {
    var income = props.summary.incomePlan, op = props.summary.operating, living = op.living;
    return h('div', { className: 'rf-os-screen rf-plan' },
      h('div', { className: 'rf-plan-intro' }, h('h1', null, 'Kế hoạch'), h('p', null, 'Chỉnh assumption và xem tác động trực tiếp lên quyền sử dụng vốn.')),
      h(PlanCard, { iconName: 'salary', title: 'Thu nhập', value: money(income.plannedAmount), onEdit: function () { props.onEdit('salary'); }, rows: [['Mặc định', money(income.defaultAmount)], ['Ngày nhận', income.paymentDay ? String(income.paymentDay) : 'Chưa đặt'], [monthLabel(income.month), money(income.plannedAmount) + (income.hasOverride ? ' · override' : '')]] }),
      h(PlanCard, { iconName: 'living', title: 'Sinh hoạt', value: money(living.target), onEdit: function () { props.onEdit('living'); }, rows: [['Đã dùng', money(living.spent)], ['Còn lại', money(living.remaining)], ['Chưa lên lịch', money(living.unscheduledReserve)]] }),
      h(PlanCard, { iconName: 'shield', title: 'Safety Margin', value: money(op.recommendedCash), onEdit: function () { props.onEdit('buffer'); }, rows: [['Tối thiểu theo timeline', money(op.requiredCash)], ['Dự phòng thêm', money(op.safetyReserve)], ['Mức nên giữ', money(op.recommendedCash)]] }),
      h('section', { className: 'rf-card rf-consequence-card' }, h('span', null, 'SAU CÁC GIẢ ĐỊNH HIỆN TẠI'), h('div', { className: 'rf-consequence-grid' }, h(Metric, { label: 'Tiền có thể dùng', value: money(op.availableCash), cls: op.availableCash > 0 ? 'good' : '' }), h(Metric, { label: 'Vốn có thể deploy', value: money(op.deployableCapital), cls: op.deployableCapital > 0 ? 'good' : '' })), h('small', null, 'Mọi thay đổi được tính lại ngay; Expected không được nâng thành tiền chắc chắn.')));
  }

  function PlanEditor(props) {
    var summary = props.summary, ym = D.monthOf(D.today()), income = summary.incomePlan, living = summary.operating.living;
    function submit(event) {
      event.preventDefault();
      var form = event.currentTarget;
      props.onCommit(function (next) {
        next.settings = next.settings || {};
        if (props.kind === 'salary') {
          var rows = next.recurringIncomes || (next.recurringIncomes = []);
          var item = rows.filter(function (row) { return row && !row.archived && row.type === 'employment_income'; })[0] || rows.filter(function (row) { return row && !row.archived && row.frequency === 'monthly'; })[0];
          if (!item) { item = { id: S.uid(), type: 'employment_income', name: 'Lương', frequency: 'monthly', amountCertainty: 'EXPECTED', fieldCertainty: {}, archived: false, note: '', createdAt: S.now() }; rows.push(item); }
          item.expectedAmount = parseAmount(form.elements.defaultAmount.value);
          item.paymentDay = Math.max(1, Math.min(31, Number(form.elements.paymentDay.value) || 28));
          item.monthlyOverrides = item.monthlyOverrides && typeof item.monthlyOverrides === 'object' ? item.monthlyOverrides : {};
          if (String(form.elements.overrideAmount.value || '').trim()) item.monthlyOverrides[ym] = parseAmount(form.elements.overrideAmount.value); else delete item.monthlyOverrides[ym];
          item.updatedAt = S.now();
        } else if (props.kind === 'living') {
          next.settings.defaultLivingTarget = parseAmount(form.elements.defaultTarget.value);
          next.settings.monthlyLivingTargets = next.settings.monthlyLivingTargets && typeof next.settings.monthlyLivingTargets === 'object' ? next.settings.monthlyLivingTargets : {};
          if (String(form.elements.monthTarget.value || '').trim()) next.settings.monthlyLivingTargets[ym] = parseAmount(form.elements.monthTarget.value); else delete next.settings.monthlyLivingTargets[ym];
        } else {
          next.settings.operatingBuffer = parseAmount(form.elements.operatingBuffer.value);
          next.settings.comfortBuffer = Math.max(Number(next.settings.comfortBuffer) || 0, next.settings.operatingBuffer);
        }
      }, 'Đã cập nhật kế hoạch.');
      props.onClose();
    }
    var title = props.kind === 'salary' ? 'Chỉnh thu nhập' : props.kind === 'living' ? 'Chỉnh sinh hoạt' : 'Chỉnh Safety Margin';
    var body;
    if (props.kind === 'salary') body = [
      h('label', { key: 'a' }, h('span', null, 'Lương / thu nhập mặc định'), h('input', { name: 'defaultAmount', inputMode: 'numeric', defaultValue: income.defaultAmount || 17000000 })),
      h('label', { key: 'b' }, h('span', null, 'Ngày nhận hàng tháng'), h('input', { name: 'paymentDay', type: 'number', min: 1, max: 31, defaultValue: income.paymentDay || 28 })),
      h('label', { key: 'c' }, h('span', null, monthLabel(ym) + ' — chỉnh riêng'), h('input', { name: 'overrideAmount', inputMode: 'numeric', defaultValue: income.hasOverride ? income.plannedAmount : '', placeholder: 'Để trống = dùng mặc định' })),
      h('p', { key: 'd' }, 'Override chỉ áp dụng cho tháng này; actual amount vẫn được ghi bằng dòng tiền thực tế.')
    ];
    else if (props.kind === 'living') body = [
      h('label', { key: 'a' }, h('span', null, 'Mức sinh hoạt mặc định / tháng'), h('input', { name: 'defaultTarget', inputMode: 'numeric', defaultValue: living.defaultTarget || living.target || 7000000 })),
      h('label', { key: 'b' }, h('span', null, monthLabel(ym) + ' — chỉnh riêng'), h('input', { name: 'monthTarget', inputMode: 'numeric', defaultValue: living.hasOverride ? living.target : '', placeholder: 'Để trống = dùng mặc định' })),
      h('p', { key: 'c' }, 'Sinh hoạt là allocation, không phải nghĩa vụ nợ. Thay đổi mức này cập nhật vốn có thể triển khai ngay.')
    ];
    else body = [
      h('label', { key: 'a' }, h('span', null, 'Dự phòng an toàn thêm'), h('input', { name: 'operatingBuffer', inputMode: 'numeric', defaultValue: summary.operating.safetyReserve || 0 })),
      h('p', { key: 'b' }, 'Required Cash vẫn do timeline tính tự động. Safety Margin chỉ cộng thêm lên mức tối thiểu.')
    ];
    return h(Overlay, { title: title, onClose: props.onClose }, h('form', { className: 'rf-edit-form', onSubmit: submit }, body, h('button', { type: 'submit', className: 'rf-save-button' }, 'Lưu thay đổi')));
  }

  function Screen(props) {
    var horizonState = React.useState(30), horizon = horizonState[0], setHorizon = horizonState[1];
    var capitalState = React.useState('positions'), capitalMode = capitalState[0], setCapitalMode = capitalState[1];
    var overlayState = React.useState(null), localOverlay = overlayState[0], setLocalOverlay = overlayState[1];
    var summary = React.useMemo(function () { return finalSummary(props.data); }, [props.data]);
    var view = props.view === 'flow' ? 'flow' : props.view === 'position' ? 'position' : props.view === 'decide' ? 'plan' : 'home';
    var title = view === 'flow' ? 'Dòng tiền' : view === 'position' ? 'Vốn' : view === 'plan' ? 'Kế hoạch' : 'Rootflow';
    var content = view === 'flow' ? h(CashflowScreen, { data: props.data, horizon: horizon, onHorizon: setHorizon }) :
      view === 'position' ? h(CapitalScreen, { summary: summary, mode: capitalMode, onMode: setCapitalMode, onAdd: props.onAdd }) :
      view === 'plan' ? h(PlanScreen, { summary: summary, onEdit: setLocalOverlay }) :
      h(HomeScreen, { data: props.data, summary: summary, onExplain: function () { setLocalOverlay('available'); }, onCashflow: function () { props.onView('flow'); } });
    return h('main', { className: 'page rf-page' },
      h(BrandHeader, { title: title }),
      h('div', { className: 'content rf-capital-os' }, h('section', { className: 'rf-panel' }, content)),
      localOverlay === 'available' ? h(Overlay, { title: 'Tiền có thể dùng', onClose: function () { setLocalOverlay(null); } }, h(AvailableExplain, { summary: summary })) : null,
      localOverlay === 'salary' || localOverlay === 'living' || localOverlay === 'buffer' ? h(PlanEditor, { kind: localOverlay, summary: summary, onCommit: props.onCommit, onClose: function () { setLocalOverlay(null); } }) : null);
  }

  function BottomNav(props) {
    var items = [
      ['home', 'home', 'Hôm nay'],
      ['flow', 'flow', 'Dòng tiền'],
      ['position', 'capital', 'Vốn'],
      ['decide', 'plan', 'Kế hoạch']
    ];
    return h('nav', { className: 'bottom-nav rf-bottom-nav', 'aria-label': 'Điều hướng chính' },
      items.map(function (item, index) {
        var button = h('button', { type: 'button', key: item[0], className: cx('nav-button', props.view === item[0] && 'on'), onClick: function () { props.onGo(item[0]); }, 'aria-current': props.view === item[0] ? 'page' : undefined }, icon(item[1]), h('span', null, item[2]));
        if (index !== 1) return button;
        return h(React.Fragment, { key: 'flow-and-add' }, button, h('button', { type: 'button', className: 'nav-add', onClick: props.onAdd, 'aria-label': 'Thêm khoản mới', title: 'Thêm khoản mới' }, icon('plus')));
      }));
  }

  global.RootflowCapitalUI = { Screen: Screen, BottomNav: BottomNav };
})(window);
