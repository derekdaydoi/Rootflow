/* Rootflow — app.js
   Toàn bộ giao diện. React qua React.createElement, không JSX, không bước build. */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect,
      useMemo = React.useMemo, useRef = React.useRef;
  var D = window.RootflowDomain, S = window.RootflowStore;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(' ');
  }

  /* ============================== ICON ============================== */

  var PATHS = {
    menu: 'M4 7h16M4 12h16M4 17h16',
    back: 'M15 5l-7 7 7 7',
    arrow: 'M5 12h13M13 6l6 6-6 6',
    prev: 'M15 5l-7 7 7 7',
    next: 'M9 5l7 7-7 7',
    trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13',
    down: 'M12 4v12M6 11l6 6 6-6M4 20h16',
    up: 'M12 20V8M6 13l6-6 6 6M4 4h16',
    check: 'M5 12l5 5 9-10',
    alert: 'M12 9v4M12 16.5v.5M10.6 4.5 2.9 18.1A1.5 1.5 0 0 0 4.2 20.4h15.6a1.5 1.5 0 0 0 1.3-2.3L13.4 4.5a1.6 1.6 0 0 0-2.8 0z',
    'in': 'M12 4v11M7 11l5 5 5-5M5 20h14',
    out: 'M12 20V9M7 13l5-5 5 5M5 4h14',
    move: 'M7 8h12l-3-3M17 16H5l3 3',
    wallet: 'M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 12h3',
    card: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18',
    loan: 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6',
    hand: 'M4 12V6a1.5 1.5 0 0 1 3 0v5M7 11V4.5a1.5 1.5 0 0 1 3 0V11M10 11V5.5a1.5 1.5 0 0 1 3 0V12M13 12V8a1.5 1.5 0 0 1 3 0v7a5 5 0 0 1-5 5H9l-5-5',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 8 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H2a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 8a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V8a1.6 1.6 0 0 0 1.5 1H22a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
    play: 'M7 5l11 7-11 7z',
    plus: 'M12 5v14M5 12h14',
    home: 'M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9.5 20v-6h5v6',
    plan: 'M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2zM8 8h8M8 12h5M8 16h7',
    chart: 'M4 19V9M10 19V5M16 19v-7M22 19V3',
    edit: 'M4 20h4l11-11-4-4L4 16zM13.5 6.5l4 4',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16 16l5 5',
    coffee: 'M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a3 3 0 0 1 0 6h-2M6 4h8',
    sport: 'M13 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 8l4 2 3-1M11 10l-3 4-4 1M13 11l2 4 4 3M8 14l2 6',
    food: 'M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4',
    car: 'M5 17h14M6 17l-1-5 2-5h10l2 5-1 5M8 17v2M16 17v2M8 12h.01M16 12h.01',
    game: 'M8 8h8a5 5 0 0 1 5 5v3a3 3 0 0 1-5 2l-2-2h-4l-2 2a3 3 0 0 1-5-2v-3a5 5 0 0 1 5-5zM8 11v4M6 13h4M16 12h.01M18 14h.01',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
    invest: 'M4 19V5M4 19h16M7 15l4-4 3 3 5-7M16 7h3v3',
    trading: 'M6 3v18M4 8h4v6H4zM12 3v18M10 5h4v8h-4zM18 3v18M16 11h4v6h-4z',
    study: 'M3 5.5A3.5 3.5 0 0 1 6.5 2H11v17H6.5A3.5 3.5 0 0 0 3 22zM21 5.5A3.5 3.5 0 0 0 17.5 2H13v17h4.5A3.5 3.5 0 0 1 21 22z',
    business: 'M9 6V4h6v2M4 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM2 12h20M10 12v2h4v-2'
  };

  function Icon(name, size) {
    return h('svg', {
      width: size || 20, height: size || 20, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
      'aria-hidden': 'true'
    }, h('path', { d: PATHS[name] || '' }));
  }

  var TYPE_ICON = {
    cash: 'wallet', bank: 'card', ewallet: 'wallet',
    credit_card: 'card', loan: 'loan', receivable: 'hand'
  };

  /* ============================ SWIPE ============================ */

  function Swipe(props) {
    var front = useRef(null);
    var st = useRef({ x: 0, y: 0, dx: 0, dir: null, on: false });
    var TH = 76;

    function setX(v) { if (front.current) front.current.style.transform = 'translateX(' + v + 'px)'; }

    function start(e) {
      var t = e.touches[0];
      st.current = { x: t.clientX, y: t.clientY, dx: 0, dir: null, on: true };
      if (front.current) front.current.classList.remove('settling');
    }
    function move(e) {
      var s = st.current;
      if (!s.on) return;
      var t = e.touches[0];
      var dx = t.clientX - s.x, dy = t.clientY - s.y;
      if (!s.dir) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) s.dir = 'x';
        else if (Math.abs(dy) > 10) s.dir = 'y';
      }
      if (s.dir !== 'x') return;
      if (dx > 0 && !props.onRight) dx = 0;
      if (dx < 0 && !props.onLeft) dx = 0;
      s.dx = Math.max(-140, Math.min(140, dx));
      setX(s.dx);
    }
    function end() {
      var s = st.current;
      if (!s.on) return;
      s.on = false;
      if (front.current) front.current.classList.add('settling');
      var dx = s.dx;
      setX(0);
      s.dx = 0;
      if (dx > TH && props.onRight) props.onRight();
      else if (dx < -TH && props.onLeft) props.onLeft();
    }

    return h('div', { className: 'swipe' },
      h('div', { className: 'swipe-back' },
        h('div', { className: 'swipe-act defer' }, props.rightLabel || ''),
        h('div', { className: 'swipe-act del' }, props.leftLabel || '')),
      h('div', {
        className: 'swipe-front', ref: front,
        onTouchStart: start, onTouchMove: move, onTouchEnd: end, onTouchCancel: end
      }, props.children));
  }

  /* ============================ BIỂU ĐỒ ============================ */

  function chartGeom(points, floor, W, H) {
    var pad = 10;
    var vals = points.map(function (p) { return p.value; });
    var min = Math.min.apply(null, vals.concat([floor]));
    var max = Math.max.apply(null, vals.concat([floor]));
    if (min > 0) min = Math.min(min, min * 0.9);
    if (min < 0) min = min * 1.05;
    var span = (max - min) || 1;
    min -= span * 0.08; max += span * 0.08;
    span = max - min;

    function y(v) { return pad + (max - v) / span * (H - 2 * pad); }
    function x(i) { return points.length < 2 ? 0 : i / (points.length - 1) * W; }

    var dLine = '';
    for (var i = 0; i < points.length; i++) dLine += (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(points[i].value).toFixed(1);
    var dArea = dLine + 'L' + W + ' ' + H + 'L0 ' + H + 'Z';

    var lowIdx = 0;
    for (var j = 1; j < points.length; j++) if (points[j].value < points[lowIdx].value) lowIdx = j;

    return { dLine: dLine, dArea: dArea, y: y, x: x, lowIdx: lowIdx, W: W, H: H, min: min, max: max };
  }

  function Spark(props) {
    var W = 300, H = 52;
    var g = chartGeom(props.points, props.floor, W, H);
    return h('svg', { className: 'spark', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', 'aria-hidden': 'true' },
      h('path', { className: 'area', d: g.dArea }),
      props.floor > 0 ? h('line', { className: 'floor', x1: 0, x2: W, y1: g.y(props.floor), y2: g.y(props.floor) }) : null,
      h('path', { className: 'line', d: g.dLine }));
  }

  function Chart(props) {
    var W = 600, H = 200;
    var pts = props.points;
    var g = chartGeom(pts, props.floor, W, H);
    var low = pts[g.lowIdx];
    return h('div', null,
      h('svg', { className: 'chart', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', role: 'img', 'aria-label': 'Đường số dư dự phóng' },
        h('path', { className: 'area', d: g.dArea }),
        g.min < 0 ? h('line', { className: 'zero', x1: 0, x2: W, y1: g.y(0), y2: g.y(0) }) : null,
        props.floor > 0 ? h('line', { className: 'floor', x1: 0, x2: W, y1: g.y(props.floor), y2: g.y(props.floor) }) : null,
        h('path', { className: 'line', d: g.dLine }),
        h('circle', { className: 'low', cx: g.x(g.lowIdx), cy: g.y(low.value), r: 4.5 })),
      h('div', { className: 'chart-legend' },
        h('span', null, D.fmtDate(pts[0].date)),
        h('span', null, 'đáy ' + D.fmtDate(low.date)),
        h('span', null, D.fmtDate(pts[pts.length - 1].date))),
      h('div', { className: 'chart-keys' },
        h('span', null, h('i'), 'Số dư dự phóng'),
        props.floor > 0 ? h('span', null, h('i', { className: 'floor' }), 'Ngưỡng dự phòng') : null));
  }


  var CHART_COLORS = ['#ef7d5a', '#14614a', '#2c6f73', '#e5aa32', '#8b8d88', '#79a883', '#8c6ea8', '#cf6f6a'];

  function RootflowGlyph(props) {
    var size = props && props.size || 52;
    return h('img', {
      className: 'rootflow-glyph',
      src: './brand/rootflow-symbol.svg',
      width: size, height: size,
      alt: '', 'aria-hidden': 'true', draggable: false
    });
  }

  function BrandMark(props) {
    return h('div', { className: cx('brand-lockup', props && props.compact && 'compact'), 'aria-label': 'ROOTFLOW' },
      h('div', { className: 'rootflow-mark-wrap' }, h(RootflowGlyph, { size: props && props.compact ? 34 : 44 })),
      props && props.compact ? null : h('div', { className: 'brand-copy' },
        h('b', null, h('span', null, 'ROOT'), h('em', null, 'FLOW')),
        h('span', { className: 'brand-tagline' }, 'SEE WHAT COMES NEXT.')));
  }

  function DonutChart(props) {
    var items = (props.items || []).filter(function (x) { return x.amount > 0; });
    var total = items.reduce(function (sum, x) { return sum + x.amount; }, 0);
    var C = 2 * Math.PI * 42;
    var offset = 0;
    return h('div', { className: 'donut-wrap' },
      h('div', { className: 'donut-visual' },
        h('svg', { viewBox: '0 0 100 100', role: 'img', 'aria-label': props.label || 'Phân bổ chi tiêu' },
          h('circle', { cx: 50, cy: 50, r: 42, fill: 'none', stroke: '#e8e7e1', strokeWidth: 13 }),
          items.map(function (x, i) {
            var len = total ? x.amount / total * C : 0;
            var node = h('circle', {
              key: x.name, cx: 50, cy: 50, r: 42, fill: 'none',
              stroke: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 13,
              strokeDasharray: len + ' ' + (C - len), strokeDashoffset: -offset,
              transform: 'rotate(-90 50 50)', strokeLinecap: 'butt'
            });
            offset += len;
            return node;
          })),
        h('div', { className: 'donut-center' },
          h('span', null, props.centerLabel || 'Tổng chi'),
          h('b', null, D.fmtShort(total)),
          h('small', null, 'đ'))),
      h('div', { className: 'donut-legend' }, items.slice(0, 6).map(function (x, i) {
        return h('div', { className: 'legend-row', key: x.name },
          h('i', { style: { background: CHART_COLORS[i % CHART_COLORS.length] } }),
          h('span', null, x.name),
          h('b', null, total ? Math.round(x.amount / total * 100) + '%' : '0%'));
      })));
  }

  function ColumnChart(props) {
    var items = props.items || [];
    var max = items.reduce(function (m, x) { return Math.max(m, x.value); }, 1) || 1;
    return h('div', { className: 'column-chart', role: 'img', 'aria-label': props.label || 'Biểu đồ cột' },
      items.map(function (x, i) {
        var pct = Math.max(3, x.value / max * 100);
        return h('div', { className: 'column-item', key: x.label },
          h('div', { className: 'column-value' }, x.value ? D.fmtShort(x.value) : '0'),
          h('div', { className: 'column-track' },
            h('span', { className: i === items.length - 1 ? 'current' : '', style: { height: pct + '%' } })),
          h('div', { className: 'column-label' }, x.label));
      }));
  }

  function BurnRateChart(props) {
    var points = props.points || [];
    if (!points.length) return h('div', { className: 'mini-empty' }, 'Chưa có dữ liệu chi tiêu trong tháng.');
    var W = 600, H = 190, padY = 12;
    var max = Math.max.apply(null, points.map(function (p) { return Math.max(Number(p.actual) || 0, Number(p.expected) || 0); }).concat([1]));
    max *= 1.08;
    function x(i) { return points.length < 2 ? 0 : i / (points.length - 1) * W; }
    function y(v) { return padY + (max - v) / max * (H - padY * 2); }
    function path(key, stopAtNull) {
      var d = '', started = false;
      for (var i = 0; i < points.length; i++) {
        var v = points[i][key];
        if (v == null) { if (stopAtNull) break; else continue; }
        d += (started ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1);
        started = true;
      }
      return d;
    }
    var actualPath = path('actual', true);
    var expectedPath = props.budget > 0 ? path('expected', false) : '';
    var actualPts = points.filter(function (p) { return p.actual != null; });
    var last = actualPts[actualPts.length - 1] || points[0];
    var actualIdx = Math.max(0, actualPts.length - 1);
    return h('div', { className: 'burn-wrap' },
      h('svg', { className: 'burn-chart', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', role: 'img', 'aria-label': 'Chi tiêu tích luỹ so với nhịp ngân sách' },
        props.budget > 0 ? h('path', { className: 'burn-expected', d: expectedPath }) : null,
        actualPath ? h('path', { className: 'burn-actual', d: actualPath }) : null,
        actualPath ? h('circle', { className: 'burn-dot', cx: x(actualIdx), cy: y(last.actual || 0), r: 5 }) : null),
      h('div', { className: 'burn-axis' },
        h('span', null, '1'), h('span', null, 'Giữa tháng'), h('span', null, String(points.length))),
      h('div', { className: 'burn-keys' },
        h('span', null, h('i', { className: 'actual' }), 'Đã chi'),
        props.budget > 0 ? h('span', null, h('i', { className: 'expected' }), 'Nhịp ngân sách') : null));
  }

  function BudgetCompareBars(props) {
    var rows = props.rows || [];
    if (!rows.length) return h('div', { className: 'mini-empty' }, 'Chưa có block ngân sách cho tháng này.');
    return h('div', { className: 'budget-compare', role: 'img', 'aria-label': 'Chi tiêu theo hạn mức từng block' },
      rows.slice(0, 7).map(function (r) {
        var pct = r.limit > 0 ? r.used / r.limit * 100 : 0;
        return h('div', { className: cx('budget-compare-row', pct > 100 && 'over'), key: r.id || r.name },
          h('div', { className: 'budget-compare-head' },
            h('span', null, h('i', { className: 'budget-compare-icon' }, Icon(r.icon || 'wallet', 15)), h('b', null, r.name)),
            h('span', { className: pct > 100 ? 'neg' : '' }, D.fmtShort(r.used) + ' / ' + D.fmtShort(r.limit))),
          h('div', { className: 'budget-compare-track' }, h('span', { style: { width: Math.min(100, pct) + '%' } })),
          h('div', { className: 'budget-compare-foot' },
            h('span', null, Math.round(pct) + '%'),
            h('span', { className: r.limit - r.used >= 0 ? 'pos' : 'neg' }, r.limit - r.used >= 0 ? 'Còn ' + D.fmtShort(r.limit - r.used) : 'Vượt ' + D.fmtShort(r.used - r.limit))));
      }));
  }

  function CompareBars(props) {
    var rows = props.rows || [];
    var max = rows.reduce(function (m, r) { return Math.max(m, Math.abs(r.base), Math.abs(r.scenario)); }, 1) || 1;
    return h('div', { className: 'compare-bars' },
      h('div', { className: 'compare-legend' },
        h('span', null, h('i', { className: 'base' }), 'Cơ sở'),
        h('span', null, h('i', { className: 'scenario' }), 'Kịch bản')),
      rows.map(function (r) {
        return h('div', { className: 'compare-row', key: r.label },
          h('div', { className: 'compare-label' }, r.label),
          h('div', { className: 'compare-track' },
            h('span', { className: 'base', style: { width: Math.abs(r.base) / max * 100 + '%' } }),
            h('span', { className: 'scenario', style: { width: Math.abs(r.scenario) / max * 100 + '%' } })),
          h('div', { className: 'compare-values' },
            h('span', null, D.fmtShort(r.base)), h('b', null, D.fmtShort(r.scenario))));
      }));
  }

  function confirmedMonthStats(flows, ym) {
    var b = D.monthBounds(ym);
    var out = { income: 0, expense: 0, byCategory: {}, count: 0 };
    (flows || []).forEach(function (f) {
      if (f.deletedAt || f.skipped || !f.confirmed || f.date < b.from || f.date > b.to) return;
      var meta = D.FLOW_KINDS[f.kind] || {};
      var amt = Math.abs(Number(f.amount) || 0);
      out.count++;
      if (meta.pl === 'income') out.income += amt;
      if (meta.pl === 'expense') {
        out.expense += amt;
        var c = f.category || 'Khác';
        out.byCategory[c] = (out.byCategory[c] || 0) + amt;
      }
    });
    out.categories = Object.keys(out.byCategory).map(function (name) {
      return { name: name, amount: out.byCategory[name] };
    }).sort(function (a, b2) { return b2.amount - a.amount; });
    return out;
  }

  function monthlyExpenseSeries(flows, count) {
    var out = [];
    var current = D.monthOf(D.today());
    for (var i = count - 1; i >= 0; i--) {
      var ym = D.addMonthsToYm(current, -i);
      var stats = confirmedMonthStats(flows, ym);
      out.push({ label: 'T' + Number(ym.slice(5, 7)), value: stats.expense, ym: ym });
    }
    return out;
  }

  function monthDayCount(ym) {
    var p = String(ym).split('-');
    return new Date(Number(p[0]), Number(p[1]), 0).getDate();
  }

  function burnRateSeries(flows, budgets, ym) {
    var bounds = D.monthBounds(ym);
    var days = monthDayCount(ym);
    var today = D.today();
    var currentMonth = D.monthOf(today) === ym;
    var currentDay = currentMonth ? Number(today.slice(8, 10)) : days;
    var spendByDay = {};
    (flows || []).forEach(function (f) {
      if (f.deletedAt || f.skipped || !f.confirmed || f.date < bounds.from || f.date > bounds.to) return;
      var meta = D.FLOW_KINDS[f.kind] || {};
      if (meta.pl !== 'expense') return;
      var d = Number(String(f.date).slice(8, 10));
      spendByDay[d] = (spendByDay[d] || 0) + Math.abs(Number(f.amount) || 0);
    });
    var budget = (budgets || []).filter(function (b) { return b.month === ym; })
      .reduce(function (sum, b) { return sum + (Number(b.limit) || 0); }, 0);
    var running = 0, spentToday = 0, points = [];
    for (var i = 1; i <= days; i++) {
      running += spendByDay[i] || 0;
      if (i === currentDay) spentToday = running;
      points.push({ day: i, actual: i <= currentDay ? running : null, expected: budget > 0 ? budget * i / days : null });
    }
    if (!currentMonth) spentToday = running;
    var expectedToday = budget > 0 ? budget * currentDay / days : 0;
    var paceDelta = expectedToday > 0 ? spentToday / expectedToday - 1 : 0;
    var remainingDays = Math.max(1, days - currentDay + 1);
    var remaining = Math.max(0, budget - spentToday);
    return { points: points, budget: budget, spent: spentToday, expectedToday: expectedToday, paceDelta: paceDelta, safePerDay: budget > 0 ? remaining / remainingDays : 0, remaining: remaining, days: days, currentDay: currentDay };
  }

  function budgetCompareRows(budgets, flows, ym) {
    var stats = confirmedMonthStats(flows, ym);
    return (budgets || []).filter(function (b) { return b.month === ym; }).map(function (b) {
      return { id: b.id, name: b.name, icon: b.icon, category: b.category, limit: Number(b.limit) || 0, used: Number(stats.byCategory[b.category] || 0) };
    }).sort(function (a, b) {
      var ap = a.limit ? a.used / a.limit : 0, bp = b.limit ? b.used / b.limit : 0;
      return bp - ap;
    });
  }

  function historicalLiquidPoints(accounts, flows, days) {
    var out = [];
    for (var i = days - 1; i >= 0; i--) {
      var date = D.addDays(D.today(), -i);
      var bal = D.balances(accounts, flows, { upto: date });
      out.push({ date: date, value: D.totals(accounts, bal).liquid });
    }
    return out;
  }

  function budgetUsage(budget, flows) {
    var stats = confirmedMonthStats(flows, budget.month);
    return Number(stats.byCategory[budget.category] || 0);
  }

  function scenarioAsFlow(scenario) {
    return {
      id: 'scenario:' + scenario.id, date: scenario.date, kind: scenario.kind,
      accountId: scenario.accountId, counterAccountId: scenario.counterAccountId || null,
      amount: Math.abs(Number(scenario.amount) || 0), category: scenario.category || '',
      note: scenario.note || scenario.name, confirmed: false, skipped: false,
      createdAt: scenario.createdAt || S.now(), updatedAt: S.now()
    };
  }

  function liquidityScore(fc) {
    var floor = Math.max(1, Number(fc.reserveFloor) || 1);
    if (fc.lowest >= floor) return Math.min(100, 80 + Math.round((fc.lowest - floor) / floor * 20));
    if (fc.lowest >= 0) return Math.max(45, Math.round(fc.lowest / floor * 45));
    return Math.max(5, 40 - Math.round(Math.abs(fc.lowest) / floor * 20));
  }

  function BottomNav(props) {
    var items = [
      ['home', 'home', 'Tổng quan'],
      ['plan', 'plan', 'Kế hoạch'],
      ['scenarios', 'chart', 'Kịch bản'],
      ['flows', 'move', 'Giao dịch']
    ];
    return h('nav', { className: 'bottom-nav', 'aria-label': 'Điều hướng chính' },
      items.slice(0, 2).map(function (x) {
        return h('button', { key: x[0], className: cx(props.view === x[0] && 'on'), onClick: function () { props.onGo(x[0]); } },
          Icon(x[1], 22), h('span', null, x[2]));
      }),
      h('button', { className: 'nav-add', onClick: props.onAdd, 'aria-label': 'Thêm dòng tiền' }, Icon('plus', 28)),
      items.slice(2).map(function (x) {
        return h('button', { key: x[0], className: cx(props.view === x[0] && 'on'), onClick: function () { props.onGo(x[0]); } },
          Icon(x[1], 22), h('span', null, x[2]));
      }));
  }

  /* ============================ Ô TIỀN ============================ */

  function MoneyInput(props) {
    return h('div', { className: 'money-field' },
      h('span', { className: cx('sign', props.dir > 0 && 'in') }, props.dir > 0 ? '+' : props.dir < 0 ? '−' : '±'),
      h('input', {
        type: 'text', inputMode: 'numeric', autoComplete: 'off',
        value: props.value ? D.groupDigits(String(props.value)) : '',
        placeholder: '0', 'aria-label': 'Số tiền',
        onChange: function (e) { props.onChange(D.parseMoney(e.target.value)); }
      }),
      h('span', { className: 'cur' }, 'đ'));
  }

  function Field(label, control, stack) {
    return h('div', { className: cx('sheet-field', stack && 'stack') },
      h('label', null, label), control);
  }

  /* ============================ SHEET ============================ */

  function Sheet(props) {
    useEffect(function () {
      var root = document.documentElement;
      var body = document.body;
      var vv = window.visualViewport;

      function syncViewport() {
        var height = vv ? vv.height : window.innerHeight;
        var top = vv ? vv.offsetTop : 0;
        var keyboard = Math.max(0, window.innerHeight - height - top);
        root.style.setProperty('--visual-viewport-height', Math.max(320, height) + 'px');
        root.style.setProperty('--visual-viewport-top', Math.max(0, top) + 'px');
        root.classList.toggle('keyboard-open', keyboard > 120);
        if (keyboard > 120) {
          var active = document.activeElement;
          if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) {
            setTimeout(function () {
              try { active.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
            }, 40);
          }
        }
      }

      function revealField(e) {
        var el = e.target;
        if (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
        syncViewport();
        setTimeout(function () {
          try { el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); }
          catch (err) { el.scrollIntoView(false); }
        }, 280);
        setTimeout(syncViewport, 100);
        setTimeout(syncViewport, 360);
      }

      var lockedScrollY = window.scrollY || window.pageYOffset || 0;
      body.dataset.rfScrollY = String(lockedScrollY);
      body.classList.add('sheet-open');
      body.style.position = 'fixed';
      body.style.top = (-lockedScrollY) + 'px';
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      syncViewport();
      if (vv) { vv.addEventListener('resize', syncViewport); vv.addEventListener('scroll', syncViewport); }
      window.addEventListener('resize', syncViewport);
      document.addEventListener('focusin', revealField);

      return function () {
        body.classList.remove('sheet-open');
        var restoreY = Number(body.dataset.rfScrollY || lockedScrollY || 0);
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';
        delete body.dataset.rfScrollY;
        root.classList.remove('keyboard-open');
        root.style.removeProperty('--visual-viewport-height');
        root.style.removeProperty('--visual-viewport-top');
        if (vv) { vv.removeEventListener('resize', syncViewport); vv.removeEventListener('scroll', syncViewport); }
        window.removeEventListener('resize', syncViewport);
        document.removeEventListener('focusin', revealField);
        requestAnimationFrame(function () {
          try { window.scrollTo({ top: restoreY, left: 0, behavior: 'auto' }); }
          catch (e) { window.scrollTo(0, restoreY); }
        });
      };
    }, []);

    return h('div', {
      className: 'scrim',
      onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); }
    },
      h('div', { className: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': props.title },
        h('div', { className: 'sheet-grip' }),
        h('div', { className: 'sheet-head' },
          h('button', { className: 'sheet-x', onClick: props.onClose, 'aria-label': 'Đóng' }, Icon('back', 22)),
          h('h2', { className: 'sheet-title' }, props.title),
          props.onSave
            ? h('button', { className: 'sheet-done', onClick: props.onSave, disabled: props.saveDisabled }, props.saveLabel || 'Lưu')
            : h('span', { style: { width: '44px' } })),
        h('div', { className: 'sheet-scroll' }, props.children)));
  }

  /* Tập tài khoản hợp lệ cho từng loại dòng tiền. Tách logic này khỏi
     component để mọi picker dùng cùng một quy tắc và không tạo select rỗng. */
  function sourceAccountsForKind(accounts, kind) {
    if (kind === 'expense' || kind === 'fee' || kind === 'interest_out') {
      return accounts.filter(function (a) { return D.isLiquid(a) || a.type === 'credit_card'; });
    }
    return accounts.filter(D.isLiquid);
  }

  function counterAccountsForKind(accounts, kind, sourceId) {
    var meta = D.FLOW_KINDS[kind] || {};
    if (meta.counter === 'any') return accounts.filter(function (a) { return a.id !== sourceId; });
    if (meta.counter) return accounts.filter(function (a) { return D.groupOf(a.type) === meta.counter; });
    return [];
  }

  function kindReady(accounts, kind) {
    var meta = D.FLOW_KINDS[kind] || {};
    var sources = sourceAccountsForKind(accounts, kind);
    if (!sources.length) return false;
    if (!meta.counter) return true;
    if (meta.counter === 'any') return accounts.length > 1;
    return accounts.some(function (a) { return D.groupOf(a.type) === meta.counter; });
  }

  function kindBlockedReason(accounts, kind) {
    if (!sourceAccountsForKind(accounts, kind).length) return 'Cần ít nhất một tài khoản tiền mặt, ngân hàng hoặc ví.';
    var meta = D.FLOW_KINDS[kind] || {};
    if (meta.counter === 'any' && accounts.length < 2) return 'Cần thêm một tài khoản đối ứng.';
    if (meta.counter === 'liability' && !accounts.some(function (a) { return D.isLiability(a); })) return 'Cần tạo thẻ tín dụng hoặc khoản vay trước.';
    if (meta.counter === 'receivable' && !accounts.some(function (a) { return D.isReceivable(a); })) return 'Cần tạo tài khoản “Người nợ mình” trước.';
    return '';
  }

  /* ====================== SHEET: DÒNG TIỀN ====================== */

  function FlowSheet(props) {
    var isNew = !props.flow.id;
    var accounts = props.accounts.filter(function (a) {
      return !a.archived || (!isNew && (a.id === props.flow.accountId || a.id === props.flow.counterAccountId));
    });
    var accMap = D.byId(props.accounts);
    var allFlows = props.flows || [];

    var seriesRows = props.flow.seriesId
      ? allFlows.filter(function (x) { return !x.deletedAt && x.seriesId === props.flow.seriesId; })
          .slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); })
      : [];
    var inferredFreq = props.flow.seriesFreq;
    if (!inferredFreq && seriesRows.length > 1) {
      inferredFreq = Math.abs(D.diffDays(seriesRows[0].date, seriesRows[1].date)) >= 26 ? 'monthly' : 'weekly';
    }
    if (inferredFreq !== 'weekly' && inferredFreq !== 'monthly') inferredFreq = 'none';
    var futureSeriesRows = seriesRows.filter(function (x) {
      return !x.confirmed && !x.skipped && String(x.date) >= String(props.flow.date || '');
    });

    var [f, setF] = useState(function () {
      return Object.assign({
        date: D.today(), kind: 'expense', accountId: '', counterAccountId: null,
        amount: 0, category: '', note: '', confirmed: false, skipped: false
      }, props.flow);
    });
    var [recur, setRecur] = useState(isNew ? 'none' : inferredFreq);
    var [count, setCount] = useState(isNew ? 6 : Math.max(1, futureSeriesRows.length || Number(props.flow.seriesCount) || 1));
    var [scope, setScope] = useState('one');
    var [err, setErr] = useState(null);

    function set(k, v) {
      setF(function (prev) {
        var n = Object.assign({}, prev);
        n[k] = v;
        if (k === 'kind') {
          var meta = D.FLOW_KINDS[v];
          if (!meta.counter) n.counterAccountId = null;
          if (meta.pl !== 'expense') n.category = '';
        }
        return n;
      });
      setErr(null);
    }

    var meta = D.FLOW_KINDS[f.kind];
    var sourceList = sourceAccountsForKind(accounts, f.kind);
    var counterList = counterAccountsForKind(accounts, f.kind, f.accountId);

    /* Khi đổi loại, tài khoản cũ có thể không còn hợp lệ. Chủ động đưa picker
       về lựa chọn hợp lệ đầu tiên thay vì để select hiển thị trắng trên iOS. */
    useEffect(function () {
      var valid = sourceList.some(function (a) { return a.id === f.accountId; });
      if (!valid) {
        setF(function (prev) {
          return Object.assign({}, prev, {
            accountId: sourceList[0] ? sourceList[0].id : '',
            counterAccountId: null
          });
        });
      }
    }, [f.kind, accounts.length]);

    useEffect(function () {
      if (!f.counterAccountId) return;
      var valid = counterList.some(function (a) { return a.id === f.counterAccountId; });
      if (!valid) setF(function (prev) { return Object.assign({}, prev, { counterAccountId: null }); });
    }, [f.kind, f.accountId, accounts.length]);

    function save() {
      var e = D.validateFlow(f, accMap);
      if (e) { setErr(e); return; }
      var effectiveScope = isNew ? 'new' : (!recurring && recur !== 'none' ? 'future' : scope);
      var effectiveRecur = (!isNew && recurring && scope === 'one') ? inferredFreq : recur;
      props.onSave(f, effectiveRecur, count, effectiveScope);
    }

    var dir = meta.dir;
    var recurring = inferredFreq !== 'none' || Boolean(f.seriesId);
    var recurrenceEditable = isNew || !recurring || scope === 'future';

    if (!accounts.length) {
      return h(Sheet, { title: isNew ? 'Thêm dòng tiền' : 'Sửa dòng tiền', onClose: props.onClose },
        h('div', { className: 'empty sheet-empty' },
          h('h3', null, 'Cần có tài khoản trước'),
          h('p', null, 'Dòng tiền phải gắn với tiền mặt, ngân hàng, ví, thẻ hoặc khoản vay. Hiện chưa có tài khoản khả dụng để chọn.'),
          h('button', { type: 'button', className: 'btn primary', onClick: props.onNeedAccount }, 'Thêm tài khoản')));
    }

    return h(Sheet, {
      title: isNew ? 'Thêm dòng tiền' : 'Sửa dòng tiền',
      onClose: props.onClose, onSave: save, saveLabel: 'Lưu'
    },
      err ? h('div', { className: 'sheet-error' }, err) : null,

      h(MoneyInput, { value: f.amount, dir: dir, onChange: function (v) { set('amount', v); } }),

      h('div', { className: 'sheet-block' },
        h('div', { className: 'sheet-field stack' },
          h('label', null, 'Loại'),
          h('div', { className: 'kind-grid' },
            D.KIND_ORDER.map(function (k) {
              var ready = kindReady(accounts, k);
              return h('button', {
                type: 'button', key: k,
                className: cx('kind-btn', f.kind === k && 'on'),
                disabled: !ready,
                title: ready ? D.FLOW_KINDS[k].label : kindBlockedReason(accounts, k),
                'aria-pressed': f.kind === k,
                onClick: function () { if (ready) set('kind', k); }
              }, D.FLOW_KINDS[k].label);
            })))),
        !kindReady(accounts, f.kind)
          ? h('div', { className: 'sheet-note-line inset' }, kindBlockedReason(accounts, f.kind))
          : null,

      h('div', { className: 'sheet-block' },
        Field('Ngày', h('input', {
          className: 'field', type: 'date', value: f.date,
          onChange: function (e) { set('date', e.target.value); }
        })),
        Field(meta.counter ? 'Từ' : 'Tài khoản', h('select', {
          className: 'field', value: f.accountId,
          onChange: function (e) { set('accountId', e.target.value); }
        },
          h('option', { value: '' }, '— chọn —'),
          sourceList.map(function (a) {
            return h('option', { key: a.id, value: a.id }, a.name);
          }))),
        meta.counter ? Field(
          f.kind === 'transfer' ? 'Tới' : f.kind === 'borrow' || f.kind === 'repay' ? 'Khoản nợ' : 'Khoản cho vay',
          h('select', {
            className: 'field', value: f.counterAccountId || '',
            onChange: function (e) { set('counterAccountId', e.target.value || null); }
          },
            h('option', { value: '' }, counterList.length ? '— chọn —' : '— chưa có tài khoản phù hợp —'),
            counterList.map(function (a) {
              return h('option', { key: a.id, value: a.id }, a.name);
            }))) : null,
        meta.pl === 'expense' ? Field('Nhóm', h('select', {
          className: 'field', value: f.category || '',
          onChange: function (e) { set('category', e.target.value); }
        },
          h('option', { value: '' }, '— không phân nhóm —'),
          D.CATEGORIES.map(function (c) { return h('option', { key: c, value: c }, c); }))) : null,
        h('div', { className: 'sheet-field stack' },
          h('label', null, 'Ghi chú'),
          h('textarea', {
            className: 'field', value: f.note || '', placeholder: 'Tiền thuê nhà tháng 8…',
            onChange: function (e) { set('note', e.target.value); }
          }))),

      !isNew && recurring ? h('div', { className: 'sheet-block' },
        h('div', { className: 'sheet-field stack' },
          h('label', null, 'Áp dụng thay đổi'),
          h('div', { className: 'chip-strip' },
            [['one', 'Chỉ kỳ này'], ['future', 'Kỳ này trở đi']].map(function (o) {
              return h('button', {
                type: 'button', key: o[0], className: cx('chip', scope === o[0] && 'on'),
                'aria-pressed': scope === o[0],
                onClick: function () { setScope(o[0]); }
              }, o[0] === 'future' && f.confirmed ? 'Các kỳ sau' : o[1]);
            }))),
        f.confirmed ? h('div', { className: 'sheet-note-line inset' }, scope === 'future' ? 'Dòng hiện tại đã ghi nhận; thay đổi sẽ bắt đầu từ kỳ tương lai gần nhất.' : 'Sửa riêng dòng đã ghi nhận này không làm thay đổi các kỳ khác.') : null)
        : null,

      h('div', { className: 'sheet-block' },
        h('div', { className: 'sheet-field stack' },
          h('label', null, 'Tần suất'),
          h('div', { className: 'chip-strip' },
            [['none', 'Một lần'], ['weekly', 'Hằng tuần'], ['monthly', 'Hằng tháng']].map(function (o) {
              return h('button', {
                type: 'button', key: o[0],
                className: cx('chip', recur === o[0] && 'on'),
                'aria-pressed': recur === o[0],
                disabled: !recurrenceEditable,
                onClick: function () {
                  if (!recurrenceEditable) return;
                  setRecur(o[0]);
                  if (o[0] !== 'none' && count === 1 && !recurring) setCount(6);
                }
              }, o[1]);
            }))),
        recurrenceEditable && recur !== 'none' ? Field(isNew ? 'Số kỳ' : 'Số kỳ từ đây', h('input', {
          className: 'field', type: 'number', min: 1, max: 60, value: count,
          onChange: function (e) { setCount(Math.max(1, Math.min(60, Number(e.target.value) || 1))); }
        })) : null,
        !isNew && recurring && scope === 'one'
          ? h('div', { className: 'sheet-note-line inset' }, 'Tần suất thuộc cả chuỗi. Chọn phạm vi các kỳ tương lai để đổi lịch lặp hoặc dừng lặp.')
          : null),

      !isNew ? h('div', { className: 'sheet-block' },
        h('button', {
          className: 'row', style: { color: 'var(--danger)', fontWeight: 600 },
          onClick: function () { props.onDelete(f.id); }
        }, h('span', { className: 'row-icon' }, Icon('trash', 18)), h('span', { className: 'row-main' }, 'Xoá dòng tiền này')))
        : null,

      h('div', { className: 'sheet-note-line' },
        f.kind === 'expense' && accMap[f.accountId] && accMap[f.accountId].type === 'credit_card'
          ? 'Quẹt thẻ: tiền khả dụng chưa giảm, dư nợ thẻ tăng. Khi thanh toán sao kê hãy dùng loại Chuyển tiền từ ngân hàng sang thẻ.'
          : meta.pl === null && f.kind !== 'transfer'
            ? 'Đây là luân chuyển vốn, không tính vào thu hoặc chi trong tháng.'
            : 'Ngày hôm nay hoặc quá khứ được ghi nhận ngay. Dòng ở tương lai nằm trong dự phóng và tự ghi nhận khi đến ngày.'));
  }


  /* ====================== SHEET: TÀI KHOẢN ====================== */

  function AccountSheet(props) {
    var isNew = !props.account.id;
    var [a, setA] = useState(function () {
      return Object.assign({ name: '', type: 'bank', openingBalance: 0, creditLimit: 0, archived: false }, props.account);
    });
    var [err, setErr] = useState(null);

    function set(k, v) { setA(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); setErr(null); }

    function save() {
      var e = D.validateAccount(a);
      if (e) { setErr(e); return; }
      props.onSave(a);
    }

    var used = props.flows.filter(function (f) {
      return !f.deletedAt && (f.accountId === a.id || f.counterAccountId === a.id);
    }).length;

    return h(Sheet, { title: isNew ? 'Thêm tài khoản' : 'Sửa tài khoản', onClose: props.onClose, onSave: save },
      err ? h('div', { className: 'sheet-error' }, err) : null,

      h('div', { className: 'sheet-block' },
        Field('Tên', h('input', {
          className: 'field', value: a.name, placeholder: 'Techcombank', autoFocus: isNew,
          onChange: function (e) { set('name', e.target.value); }
        })),
        Field('Loại', h('select', {
          className: 'field', value: a.type,
          onChange: function (e) { set('type', e.target.value); }
        }, D.ACCOUNT_ORDER.map(function (t) {
          return h('option', { key: t, value: t }, D.ACCOUNT_TYPES[t].label);
        }))),
        Field(D.groupOf(a.type) === 'liability' ? 'Đang nợ' : D.groupOf(a.type) === 'receivable' ? 'Đang cho nợ' : 'Số dư',
          h('input', {
            className: 'field', type: 'text', inputMode: 'numeric',
            value: a.openingBalance ? D.groupDigits(String(a.openingBalance)) : '',
            placeholder: '0',
            onChange: function (e) { set('openingBalance', D.parseMoney(e.target.value)); }
          })),
        a.type === 'credit_card' ? Field('Hạn mức', h('input', {
          className: 'field', type: 'text', inputMode: 'numeric',
          value: a.creditLimit ? D.groupDigits(String(a.creditLimit)) : '',
          placeholder: '0',
          onChange: function (e) { set('creditLimit', D.parseMoney(e.target.value)); }
        })) : null),

      h('div', { className: 'sheet-note-line' },
        D.groupOf(a.type) === 'liability'
          ? 'Nhập số đang nợ dưới dạng số dương. Rootflow tự trừ vào tài sản ròng.'
          : 'Đây là số dư tại thời điểm bắt đầu dùng Rootflow, trước mọi dòng tiền đã ghi.'),

      !isNew ? h('div', { className: 'sheet-block' },
        h('button', {
          className: 'row', onClick: function () { set('archived', !a.archived); }
        },
          h('span', { className: 'row-icon' }, Icon('gear', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, a.archived ? 'Đang ẩn — bấm để hiện lại' : 'Ẩn tài khoản này'),
            h('span', { className: 'row-value' }, 'Tài khoản ẩn không tính vào tổng, dữ liệu cũ giữ nguyên'))),
        h('button', {
          className: 'row', style: { color: used ? 'var(--subtle)' : 'var(--danger)', fontWeight: 600 },
          disabled: used > 0,
          onClick: function () { if (!used) props.onDelete(a.id); }
        },
          h('span', { className: 'row-icon' }, Icon('trash', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, used ? 'Không xoá được' : 'Xoá tài khoản'),
            used ? h('span', { className: 'row-value' }, 'Còn ' + used + ' dòng tiền dùng tài khoản này — hãy ẩn thay vì xoá') : null)))
        : null);
  }


  /* ====================== SHEET: NGÂN SÁCH ====================== */

  function BudgetSheet(props) {
    var isNew = !props.budget.id;
    var [b, setB] = useState(function () {
      return Object.assign({
        month: props.month || D.monthOf(D.today()), name: '', category: 'Ăn uống',
        limit: 0, icon: 'wallet'
      }, props.budget || {});
    });
    var [err, setErr] = useState('');
    function set(k, v) { setB(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); setErr(''); }
    function save() {
      if (!String(b.name || '').trim()) return setErr('Nhập tên block kế hoạch.');
      if (!String(b.category || '').trim()) return setErr('Chọn nhóm giao dịch để đối chiếu.');
      var duplicate = (props.budgets || []).some(function (x) {
        return x.id !== b.id && x.month === b.month && x.category === b.category;
      });
      if (duplicate) return setErr('Tháng này đã có một block dùng nhóm “' + b.category + '”. Mỗi nhóm chỉ nên có một hạn mức để tránh tính chi tiêu hai lần.');
      if (!(Number(b.limit) > 0)) return setErr('Hạn mức phải lớn hơn 0.');
      props.onSave(Object.assign({}, b, { name: String(b.name).trim(), category: String(b.category).trim(), limit: Math.abs(Number(b.limit) || 0) }));
    }
    var icons = [['sport','Thể thao'],['coffee','Cafe'],['food','Ăn uống'],['car','Di chuyển'],['game','Giải trí'],['heart','Yêu đương'],['invest','Đầu tư'],['trading','Trading'],['study','Học tập'],['business','Business'],['home','Nhà ở'],['wallet','Khác']];
    return h(Sheet, { title: isNew ? 'Thêm block kế hoạch' : 'Sửa block kế hoạch', onClose: props.onClose, onSave: save, saveLabel: 'Lưu' },
      err ? h('div', { className: 'sheet-error' }, err) : null,
      h(MoneyInput, { value: b.limit, dir: -1, onChange: function (v) { set('limit', v); } }),
      h('div', { className: 'sheet-block' },
        Field('Tháng', h('input', { className: 'field', type: 'month', value: b.month, onChange: function (e) { set('month', e.target.value); } })),
        Field('Tên block', h('input', { className: 'field', value: b.name, placeholder: 'Thể thao, Cafe…', onChange: function (e) { set('name', e.target.value); } })),
        Field('Nhóm giao dịch', h('select', { className: 'field', value: b.category, onChange: function (e) { set('category', e.target.value); } },
          D.CATEGORIES.map(function (c) { return h('option', { key: c, value: c }, c); }))),
        h('div', { className: 'sheet-field stack' },
          h('label', null, 'Biểu tượng'),
          h('div', { className: 'icon-picker' }, icons.map(function (x) {
            return h('button', { key: x[0], className: cx('icon-choice', b.icon === x[0] && 'on'), onClick: function () { set('icon', x[0]); }, title: x[1] }, Icon(x[0], 19));
          })))),
      !isNew ? h('div', { className: 'sheet-block' },
        h('button', { className: 'row', style: { color: 'var(--danger)', fontWeight: 700 }, onClick: function () { props.onDelete(b.id); } },
          h('span', { className: 'row-icon' }, Icon('trash', 18)), h('span', { className: 'row-main' }, 'Xoá block này'))) : null,
      h('div', { className: 'sheet-note-line' }, 'Rootflow đối chiếu block với các giao dịch chi tiêu đã ghi nhận có cùng nhóm trong tháng.'));
  }

  /* ====================== SHEET: KỊCH BẢN ====================== */

  function ScenarioSheet(props) {
    var isNew = !props.scenario.id;
    var accounts = props.accounts.filter(function (a) {
      return !a.archived || (!isNew && (a.id === props.scenario.accountId || a.id === props.scenario.counterAccountId));
    });
    var [s, setS] = useState(function () {
      return Object.assign({
        name: '', date: D.addDays(D.today(), 30), kind: 'expense', amount: 0,
        accountId: '', counterAccountId: null, note: ''
      }, props.scenario || {});
    });
    var [err, setErr] = useState('');
    function set(k, v) {
      setS(function (p) {
        var n = Object.assign({}, p); n[k] = v;
        if (k === 'kind' && !(D.FLOW_KINDS[v] || {}).counter) n.counterAccountId = null;
        return n;
      });
      setErr('');
    }
    var kinds = ['expense','income','repay','borrow','lend','collect'];
    var meta = D.FLOW_KINDS[s.kind];
    var source = sourceAccountsForKind(accounts, s.kind);
    var counter = counterAccountsForKind(accounts, s.kind, s.accountId);
    useEffect(function () {
      var valid = source.some(function (a) { return a.id === s.accountId; });
      if (!valid) setS(function (prev) { return Object.assign({}, prev, { accountId: source[0] ? source[0].id : '', counterAccountId: null }); });
    }, [s.kind, accounts.length]);
    useEffect(function () {
      if (!s.counterAccountId) return;
      var valid = counter.some(function (a) { return a.id === s.counterAccountId; });
      if (!valid) setS(function (prev) { return Object.assign({}, prev, { counterAccountId: null }); });
    }, [s.kind, s.accountId, accounts.length]);
    function save() {
      if (!String(s.name || '').trim()) return setErr('Nhập tên kịch bản.');
      var flow = scenarioAsFlow(Object.assign({ id: s.id || 'new' }, s));
      var e = D.validateFlow(flow, D.byId(props.accounts));
      if (e) return setErr(e);
      props.onSave(Object.assign({}, s, { name: String(s.name).trim(), amount: Math.abs(Number(s.amount) || 0) }));
    }
    if (!accounts.length) {
      return h(Sheet, { title: isNew ? 'Tạo kịch bản' : 'Sửa kịch bản', onClose: props.onClose },
        h('div', { className: 'empty sheet-empty' },
          h('h3', null, 'Cần có tài khoản trước'),
          h('p', null, 'Kịch bản cần một tài khoản để mô phỏng tác động lên dòng tiền.'),
          h('button', { type: 'button', className: 'btn primary', onClick: props.onNeedAccount }, 'Thêm tài khoản')));
    }
    return h(Sheet, { title: isNew ? 'Tạo kịch bản' : 'Sửa kịch bản', onClose: props.onClose, onSave: save, saveLabel: 'Lưu' },
      err ? h('div', { className: 'sheet-error' }, err) : null,
      h(MoneyInput, { value: s.amount, dir: meta.dir, onChange: function (v) { set('amount', v); } }),
      h('div', { className: 'sheet-block' },
        Field('Tên', h('input', { className: 'field', value: s.name, placeholder: 'Mua xe, trả nợ sớm…', onChange: function (e) { set('name', e.target.value); } })),
        Field('Ngày xảy ra', h('input', { className: 'field', type: 'date', value: s.date, onChange: function (e) { set('date', e.target.value); } })),
        h('div', { className: 'sheet-field stack' }, h('label', null, 'Loại tác động'),
          h('div', { className: 'kind-grid' }, kinds.map(function (k) {
            var ready = kindReady(accounts, k);
            return h('button', {
              type: 'button', key: k, className: cx('kind-btn', s.kind === k && 'on'),
              disabled: !ready, title: ready ? D.FLOW_KINDS[k].label : kindBlockedReason(accounts, k),
              'aria-pressed': s.kind === k,
              onClick: function () { if (ready) set('kind', k); }
            }, D.FLOW_KINDS[k].label);
          }))),
        Field(meta.counter ? 'Từ tài khoản' : 'Tài khoản', h('select', { className: 'field', value: s.accountId, onChange: function (e) { set('accountId', e.target.value); } },
          h('option', { value: '' }, '— chọn —'), source.map(function (a) { return h('option', { key: a.id, value: a.id }, a.name); }))),
        meta.counter ? Field(s.kind === 'repay' || s.kind === 'borrow' ? 'Khoản nợ' : 'Khoản cho vay', h('select', {
          className: 'field', value: s.counterAccountId || '', onChange: function (e) { set('counterAccountId', e.target.value || null); }
        }, h('option', { value: '' }, counter.length ? '— chọn —' : '— chưa có tài khoản phù hợp —'), counter.map(function (a) { return h('option', { key: a.id, value: a.id }, a.name); }))) : null,
        h('div', { className: 'sheet-field stack' }, h('label', null, 'Ghi chú'), h('textarea', { className: 'field', value: s.note || '', onChange: function (e) { set('note', e.target.value); } }))),
      !isNew ? h('div', { className: 'sheet-block' },
        h('button', { className: 'row', style: { color: 'var(--danger)', fontWeight: 700 }, onClick: function () { props.onDelete(s.id); } },
          h('span', { className: 'row-icon' }, Icon('trash', 18)), h('span', { className: 'row-main' }, 'Xoá kịch bản'))) : null,
      h('div', { className: 'sheet-note-line' }, 'Kịch bản chỉ dùng để mô phỏng. Chỉ khi bấm “Đưa vào kế hoạch” nó mới trở thành dòng tiền dự kiến.'));
  }

  /* ====================== SHEET: MENU ỨNG DỤNG ====================== */

  function AppMenuSheet(props) {
    return h(Sheet, { title: 'Rootflow', onClose: props.onClose },
      h('div', { className: 'sheet-block app-menu-sheet' },
        h('button', { type: 'button', className: 'row', onClick: props.onAccounts },
          h('span', { className: 'row-icon in' }, Icon('wallet', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, 'Tài khoản'),
            h('span', { className: 'row-value' }, 'Ví, ngân hàng, thẻ và khoản vay'))),
        h('button', { type: 'button', className: 'row', onClick: props.onSettings },
          h('span', { className: 'row-icon' }, Icon('gear', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, 'Cài đặt'),
            h('span', { className: 'row-value' }, 'Dự phòng, backup và dữ liệu')))),
      h('div', { className: 'sheet-note-line' }, 'SEE WHAT COMES NEXT.'));
  }

  /* ====================== SHEET: CÀI ĐẶT ====================== */

  function SettingsSheet(props) {
    var [s, setS] = useState(props.settings);
    var [confirmClear, setConfirmClear] = useState(false);
    return h(Sheet, {
      title: 'Cài đặt', onClose: props.onClose,
      onSave: function () { props.onSave(s); }
    },
      h('div', { className: 'sheet-block' },
        Field('Ngưỡng dự phòng', h('input', {
          className: 'field', type: 'text', inputMode: 'numeric',
          value: s.reserveFloor ? D.groupDigits(String(s.reserveFloor)) : '',
          placeholder: '0',
          onChange: function (e) { setS(Object.assign({}, s, { reserveFloor: D.parseMoney(e.target.value) })); }
        })),
        Field('Tầm nhìn', h('select', {
          className: 'field', value: s.horizonDays,
          onChange: function (e) { setS(Object.assign({}, s, { horizonDays: Number(e.target.value) })); }
        }, [30, 60, 90, 365].map(function (n) {
          return h('option', { key: n, value: n }, n + ' ngày');
        })))),
      h('div', { className: 'sheet-note-line' },
        'An toàn chi tiêu = số dư thấp nhất trong tầm nhìn − ngưỡng dự phòng. Đặt ngưỡng bằng khoảng chi một tháng nếu chưa biết chọn số nào.'),
      h('div', { className: 'group-label' }, 'Dữ liệu'),
      h('div', { className: 'sheet-block' },
        h('button', { type: 'button', className: 'row', style: { width: '100%', textAlign: 'left' }, onClick: props.onExport },
          h('span', { className: 'row-icon' }, Icon('down', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, 'Xuất bản sao lưu'),
            h('span', { className: 'row-value' }, 'Tải toàn bộ dữ liệu thành tệp JSON'))),
        h('label', { className: 'row', style: { width: '100%', cursor: 'pointer' } },
          h('span', { className: 'row-icon' }, Icon('up', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, 'Nạp bản sao lưu'),
            h('span', { className: 'row-value' }, 'Thay dữ liệu hiện tại bằng tệp Rootflow đã xuất')),
          h('input', {
            type: 'file', accept: 'application/json,.json', className: 'sr-only',
            onChange: function (e) {
              var file = e.target.files && e.target.files[0];
              if (file) props.onImport(file);
              e.target.value = '';
            }
          })),
        h('button', { type: 'button', className: 'row', style: { width: '100%', textAlign: 'left' }, onClick: props.onTrash },
          h('span', { className: 'row-icon' }, Icon('trash', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, 'Thùng rác'),
            h('span', { className: 'row-value' }, props.trashCount + ' dòng tiền đang chờ tự xoá'))),
        !confirmClear
          ? h('button', {
              type: 'button', className: 'row',
              style: { width: '100%', color: 'var(--danger)', fontWeight: 700, textAlign: 'left' },
              onClick: function () { setConfirmClear(true); }
            },
              h('span', { className: 'row-icon', style: { color: 'var(--danger)', background: 'var(--danger-bg)' } }, Icon('trash', 18)),
              h('span', { className: 'row-main' },
                h('span', { className: 'row-label' }, 'Xoá toàn bộ dữ liệu'),
                h('span', { className: 'row-value' }, 'Tài khoản, dòng tiền, kế hoạch và kịch bản')))
          : h('div', { style: { padding: 'var(--s-4)' } },
              h('strong', { style: { display: 'block', color: 'var(--danger)', marginBottom: 'var(--s-2)' } }, 'Xoá vĩnh viễn toàn bộ dữ liệu?'),
              h('p', { style: { margin: '0 0 var(--s-3)', color: 'var(--muted)', fontSize: 'var(--t-sm)' } },
                'Thao tác này xoá cả dữ liệu của các phiên bản Rootflow cũ trên thiết bị này và không thể hoàn tác.'),
              h('div', { className: 'inline wrap', style: { gap: 'var(--s-2)' } },
                h('button', { type: 'button', className: 'btn', onClick: function () { setConfirmClear(false); } }, 'Huỷ'),
                h('button', {
                  type: 'button', className: 'btn danger',
                  onClick: function () {
                    if (window.confirm('Xoá vĩnh viễn toàn bộ dữ liệu Rootflow trên thiết bị này?')) props.onClear();
                  }
                }, 'Xoá vĩnh viễn')))),
      h('div', { className: 'sheet-note-line' },
        'Nên xuất bản sao lưu trước khi xoá nếu còn khả năng cần khôi phục dữ liệu.'),
      h('div', { className: 'group-label' }, 'Chẩn đoán'),
      h('div', { className: 'sheet-block' },
        h('button', { type: 'button', className: 'row', style: { width: '100%', textAlign: 'left' }, onClick: props.onTest },
          h('span', { className: 'row-icon' }, Icon('play', 18)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label' }, 'Chạy kiểm tra nghiệp vụ'),
            h('span', { className: 'row-value' }, 'Kiểm tra công thức tiền, thẻ, vay và chuỗi lặp')))));
  }

  /* ====================== SHEET: THÙNG RÁC ====================== */

  function TrashSheet(props) {
    var items = props.flows.filter(function (f) { return f.deletedAt; })
      .sort(function (a, b) { return a.deletedAt < b.deletedAt ? 1 : -1; });
    return h(Sheet, { title: 'Thùng rác', onClose: props.onClose },
      items.length === 0
        ? h('div', { className: 'empty' }, h('h3', null, 'Trống'), h('p', null, 'Dòng tiền đã xoá nằm ở đây 30 ngày trước khi biến mất hẳn.'))
        : h('div', { className: 'sheet-block' }, items.map(function (f) {
          return h('div', { className: 'trash-item', key: f.id },
            h('div', { className: 'trash-copy' },
              h('div', { className: 'trash-name' }, f.note || D.FLOW_KINDS[f.kind].label),
              h('div', { className: 'trash-kind' }, D.fmtDate(f.date) + ' · ' + D.fmtVND(f.amount) + ' đ')),
            h('button', { className: 'btn sm', onClick: function () { props.onRestore(f.id); } }, 'Khôi phục'));
        })),
      h('div', { className: 'sheet-note-line' }, 'Tự dọn sau ' + S.TRASH_DAYS + ' ngày.'));
  }

  /* ====================== SHEET: KIỂM TRA ====================== */

  function TestSheet(props) {
    var r = props.result;
    return h(Sheet, { title: 'Kiểm tra nghiệp vụ', onClose: props.onClose },
      h('div', { className: cx('sheet-error'), style: r.failed ? null : { background: 'var(--brand-soft)', color: 'var(--brand-strong)' } },
        r.passed + '/' + r.total + ' phép kiểm tra đạt' + (r.failed ? ' — ' + r.failed + ' phép sai' : '')),
      h('div', { className: 'sheet-block' }, r.results.map(function (x, i) {
        return h('div', { className: 'row', key: i },
          h('span', { className: cx('row-icon', x.pass && 'in') }, Icon(x.pass ? 'check' : 'alert', 16)),
          h('span', { className: 'row-main' },
            h('span', { className: 'row-label', style: { whiteSpace: 'normal' } }, x.name),
            x.pass ? null : h('span', { className: 'row-value' }, 'nhận ' + JSON.stringify(x.actual) + ', đúng phải là ' + JSON.stringify(x.expected))));
      })),
      h('div', { className: 'sheet-note-line' },
        'Đây là các quy tắc kế toán mà Rootflow phải giữ đúng: quẹt thẻ chưa trừ tiền, vay không phải thu nhập, trả gốc không phải chi tiêu, chuyển tiền không đổi tổng.'));
  }

  /* ============================== DASHBOARD ============================== */

  function Home(props) {
    var d = props.derived, data = props.data;
    var accounts = data.accounts.filter(function (a) { return !a.archived; });
    var ym = D.monthOf(D.today());

    /* Dashboard có vài phép tính O(n) và forecast O(n*horizon). Memo hoá để
       mở sheet/toast hoặc đổi UI state không bắt iPhone tính lại toàn bộ. */
    var actual = useMemo(function () { return confirmedMonthStats(data.flows, ym); }, [data.flows, ym]);
    var forecast30 = useMemo(function () { return D.forecast(data.accounts, data.flows, 30, data.settings.reserveFloor); }, [data.accounts, data.flows, data.settings.reserveFloor]);
    var history = useMemo(function () { return historicalLiquidPoints(data.accounts, data.flows, 30); }, [data.accounts, data.flows]);
    var bars = useMemo(function () { return monthlyExpenseSeries(data.flows, 6); }, [data.flows]);
    var burn = useMemo(function () { return burnRateSeries(data.flows, data.budgets || [], ym); }, [data.flows, data.budgets, ym]);
    var budgetRows = useMemo(function () { return budgetCompareRows(data.budgets || [], data.flows, ym); }, [data.budgets, data.flows, ym]);
    var upcoming = useMemo(function () { return D.upcoming(data.flows, 30).slice(0, 4); }, [data.flows]);
    var next30Net = forecast30.end - forecast30.current;

    var paceText = 'Chưa đặt ngân sách tháng';
    if (burn.budget > 0) {
      var pacePct = Math.round(Math.abs(burn.paceDelta) * 100);
      paceText = Math.abs(burn.paceDelta) < .05 ? 'Đang đúng nhịp kế hoạch'
        : burn.paceDelta > 0 ? 'Nhanh hơn nhịp ' + pacePct + '%'
          : 'Chậm hơn nhịp ' + pacePct + '%';
    }

    var notice = null;
    if (props.storageError) {
      notice = h('div', { className: 'notice danger' }, h('div', null, h('strong', null, 'Không lưu được dữ liệu'), h('p', null, props.storageError)));
    } else if (!accounts.length) {
      notice = h('div', { className: 'notice' },
        h('div', null, h('strong', null, 'Bắt đầu bằng tài khoản'), h('p', null, 'Thêm ví, ngân hàng, thẻ và khoản vay để Rootflow dựng được vị thế tiền hiện tại.')),
        h('div', { className: 'notice-actions' },
          h('button', { className: 'btn sm primary', onClick: props.onNewAccount }, 'Thêm tài khoản')));
    }

    return h('div', { className: 'dashboard' },
      h('header', { className: 'dashboard-head family-header' },
        h(BrandMark),
        h('div', { className: 'dashboard-actions' }, props.menuButton)),

      notice,

      h('section', { className: 'balance-hero' },
        h('div', { className: 'hero-label' }, 'Tổng số dư khả dụng'),
        h('div', { className: 'hero-balance' }, D.fmtVND(d.tot.liquid), h('span', null, ' đ')),
        h('div', { className: 'hero-foot' },
          h('span', null, 'Tài sản ròng ', h('b', null, D.fmtShort(d.tot.netWorth))),
          h('span', null, d.tot.liability ? 'Đang nợ ' + D.fmtShort(d.tot.liability) : 'Không có dư nợ'))),

      h('section', { className: 'stat-strip' },
        h('div', { className: 'stat-cell' }, h('span', null, 'Thu nhập tháng'), h('b', { className: 'pos' }, '+' + D.fmtVND(actual.income)), h('small', null, actual.count + ' giao dịch đã ghi nhận')),
        h('div', { className: 'stat-cell' }, h('span', null, 'Chi tiêu tháng'), h('b', { className: 'neg' }, '−' + D.fmtVND(actual.expense)), h('small', null, actual.income ? Math.round(actual.expense / actual.income * 100) + '% thu nhập' : 'Chưa có thu nhập'))),

      h('section', { className: 'dashboard-grid wide' },
        h('div', { className: 'panel chart-panel' },
          h('div', { className: 'panel-head' },
            h('div', null, h('h2', { className: 'panel-title' }, 'Dòng tiền 30 ngày'), h('div', { className: 'panel-sub' }, 'Quá khứ thực tế và vị thế hiện tại')),
            h('button', { className: 'text-link', onClick: function () { props.onGo('forecast'); } }, 'Dự phóng →')),
          h(Chart, { points: history, floor: data.settings.reserveFloor })),

        h('div', { className: 'panel burn-panel' },
          h('div', { className: 'panel-head' },
            h('div', null, h('h2', { className: 'panel-title' }, 'Nhịp chi tiêu'), h('div', { className: 'panel-sub' }, paceText)),
            h('button', { className: 'text-link', onClick: function () { props.onGo('plan'); } }, 'Kế hoạch →')),
          h(BurnRateChart, { points: burn.points, budget: burn.budget }),
          h('div', { className: 'burn-summary' },
            h('div', null, h('span', null, 'Đã chi'), h('b', null, D.fmtVND(burn.spent) + ' đ')),
            h('div', null, h('span', null, 'Còn ngân sách'), h('b', { className: burn.remaining > 0 ? 'pos' : 'neg' }, burn.budget ? D.fmtVND(burn.remaining) + ' đ' : '—')),
            h('div', null, h('span', null, 'Safe / ngày'), h('b', { className: burn.budget ? 'pos' : '' }, burn.budget ? D.fmtVND(burn.safePerDay) + ' đ' : '—')))),

      h('section', { className: 'dashboard-grid' },
        h('div', { className: 'panel' },
          h('div', { className: 'panel-head' },
            h('div', null, h('h2', { className: 'panel-title' }, 'Chi tiêu vs. ngân sách'), h('div', { className: 'panel-sub' }, D.fmtMonth(ym))),
            h('button', { className: 'text-link', onClick: function () { props.onGo('plan'); } }, 'Chi tiết →')),
          h(BudgetCompareBars, { rows: budgetRows })),
        h('div', { className: 'panel' },
          h('div', { className: 'panel-head' }, h('div', null, h('h2', { className: 'panel-title' }, 'Xu hướng chi tiêu'), h('div', { className: 'panel-sub' }, '6 tháng gần nhất'))),
          h(ColumnChart, { items: bars }))),

      h('section', { className: 'dashboard-grid' },
        h('div', { className: 'panel' },
          h('div', { className: 'panel-head' },
            h('div', null, h('h2', { className: 'panel-title' }, 'Cơ cấu chi tiêu'), h('div', { className: 'panel-sub' }, D.fmtMonth(ym))),
            h('button', { className: 'text-link', onClick: function () { props.onGo('month'); } }, 'Chi tiết →')),
          actual.categories.length ? h(DonutChart, { items: actual.categories, centerLabel: 'Tổng chi' }) : h('div', { className: 'mini-empty' }, 'Chưa có chi tiêu đã ghi nhận')),
        h('div', { className: 'insight-grid' },
          h('button', { className: 'insight-card', onClick: function () { props.onGo('plan'); } },
            h('span', null, 'Safe to spend'), h('b', { className: d.fc.safeToSpend > 0 ? 'pos' : 'neg' }, D.fmtVND(d.fc.safeToSpend) + ' đ'), h('small', null, 'Trong ' + d.horizon + ' ngày')),
          h('button', { className: 'insight-card', onClick: function () { props.onGo('forecast'); } },
            h('span', null, 'Dòng tiền 30 ngày'), h('b', { className: next30Net >= 0 ? 'pos' : 'neg' }, (next30Net >= 0 ? '+' : '−') + D.fmtVND(Math.abs(next30Net)) + ' đ'), h('small', null, 'Số dư cuối ' + D.fmtShort(forecast30.end))),
          h('button', { className: cx('insight-card', d.fc.breaches && 'warning'), onClick: function () { props.onGo('scenarios'); } },
            h('span', null, 'Cảnh báo'), h('b', null, d.fc.breaches ? 'Số dư thấp' : 'Đang an toàn'), h('small', null, d.fc.breaches ? 'Đáy ' + D.fmtShort(d.fc.lowest) + ' vào ' + D.fmtDate(d.fc.lowestDate) : 'Không thủng ngưỡng dự phòng')))),

      h('section', { className: 'panel upcoming-panel' },
        h('div', { className: 'panel-head' },
          h('div', null, h('h2', { className: 'panel-title' }, 'Khoản sắp thu / chi'), h('div', { className: 'panel-sub' }, '30 ngày tới · tự ghi nhận khi đến ngày')),
          h('button', { className: 'text-link', onClick: function () { props.onGo('flows'); } }, 'Xem tất cả →')),
        upcoming.length ? upcoming.map(function (f) {
          var delta = D.liquidDelta(f, d.accMap);
          return h('button', { className: 'upcoming-row', key: f.id, onClick: function () { props.onEditFlow(f); } },
            h('span', { className: cx('upcoming-icon', delta > 0 && 'in') }, Icon(delta > 0 ? 'in' : 'out', 17)),
            h('span', { className: 'upcoming-main' }, h('b', null, flowTitle(f)), h('small', null, D.relLabel(f.date))),
            h('span', { className: cx('amount', delta > 0 ? 'in' : 'out') }, (delta > 0 ? '+' : '−') + D.fmtVND(Math.abs(delta)), h('small', null, ' đ')));
        }) : h('div', { className: 'mini-empty' }, 'Không có khoản nào trong 30 ngày tới')),

      h('footer', { className: 'home-foot' }, h('span', null, 'Dữ liệu local-first · Xuất backup định kỳ'), h('span', null, D.fmtDateFull(D.today())))));
  }

  /* ============================ TÀI KHOẢN ============================ */

  function AccountsScreen(props) {
    var d = props.derived, data = props.data;
    var groups = [
      { key: 'liquid', label: 'Tiền khả dụng' },
      { key: 'liability', label: 'Đang nợ' },
      { key: 'receivable', label: 'Người khác nợ mình' }
    ];
    var archived = data.accounts.filter(function (a) { return a.archived; });

    return h('div', null,
      h('div', { className: 'screen-head' },
        h('div', { className: 'screen-head-left' },
          h('button', { className: 'back-btn', onClick: props.onBack, 'aria-label': 'Quay lại' }, Icon('back', 22)),
          h('div', null,
            h('h1', { className: 'screen-title' }, 'Tài khoản'),
            h('div', { className: 'screen-sub' }, 'Tài sản ròng ' + D.fmtVND(d.tot.netWorth) + ' đ'))),
        h('div', { className: 'screen-actions' },
          h('button', { className: 'icon-btn settings-btn', onClick: props.onSettings, 'aria-label': 'Cài đặt', title: 'Cài đặt' }, Icon('gear', 21)),
          h('button', { className: 'btn sm primary', onClick: props.onNew }, 'Thêm'))),

      h('div', { className: 'metrics' },
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Khả dụng'),
          h('div', { className: 'metric-value pos' }, D.fmtShort(d.tot.liquid))),
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Đang nợ'),
          h('div', { className: 'metric-value' }, D.fmtShort(d.tot.liability))),
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Ròng'),
          h('div', { className: cx('metric-value', d.tot.netWorth < 0 && 'neg') }, D.fmtShort(d.tot.netWorth)))),

      data.accounts.length === 0
        ? h('div', { className: 'empty' },
          h('h3', null, 'Chưa có tài khoản nào'),
          h('p', null, 'Thêm ví, ngân hàng, thẻ tín dụng và khoản vay để Rootflow biết mày đang đứng ở đâu.'),
          h('button', { className: 'btn primary', onClick: props.onNew }, 'Thêm tài khoản'))
        : groups.map(function (g) {
          var list = data.accounts.filter(function (a) { return !a.archived && D.groupOf(a.type) === g.key; });
          if (!list.length) return null;
          var sum = list.reduce(function (s, a) { return s + (d.bal[a.id] || 0); }, 0);
          return h('div', { key: g.key },
            h('div', { className: 'group-label' }, h('span', null, g.label), h('b', null, D.fmtVND(sum) + ' đ')),
            h('div', { className: 'group' }, list.map(function (a) {
              return h('button', { className: 'row', key: a.id, onClick: function () { props.onEdit(a); } },
                h('span', { className: 'row-icon' }, Icon(TYPE_ICON[a.type], 18)),
                h('span', { className: 'row-main' },
                  h('span', { className: 'row-label' }, a.name),
                  h('span', { className: 'row-value' },
                    D.ACCOUNT_TYPES[a.type].label +
                    (a.type === 'credit_card' && a.creditLimit
                      ? ' · còn ' + D.fmtShort(Math.max(0, a.creditLimit - (d.bal[a.id] || 0))) + ' hạn mức' : ''))),
                h('span', { className: cx('amount', g.key === 'liquid' ? 'out' : 'flat') },
                  D.fmtVND(d.bal[a.id] || 0), h('span', { className: 'unit' }, 'đ')));
            })));
        }),

      archived.length ? h('div', null,
        h('div', { className: 'group-label' }, h('span', null, 'Đã ẩn')),
        h('div', { className: 'group' }, archived.map(function (a) {
          return h('button', { className: 'row', key: a.id, onClick: function () { props.onEdit(a); }, style: { opacity: .6 } },
            h('span', { className: 'row-icon' }, Icon(TYPE_ICON[a.type], 18)),
            h('span', { className: 'row-main' }, h('span', { className: 'row-label' }, a.name)),
            h('span', { className: 'amount flat' }, D.fmtShort(d.bal[a.id] || 0)));
        }))) : null);
  }

  /* ============================ DÒNG TIỀN ============================ */

  function flowTitle(f) {
    return f.note || f.category || D.FLOW_KINDS[f.kind].label;
  }

  function FlowRow(props) {
    var f = props.flow, accMap = props.accMap;
    var delta = D.liquidDelta(f, accMap);
    var acc = accMap[f.accountId];
    var counter = f.counterAccountId ? accMap[f.counterAccountId] : null;
    var kindLabel = D.FLOW_KINDS[f.kind].label;

    var amountClass = delta > 0 ? 'in' : delta < 0 ? 'out' : 'flat';
    var sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
    var shown = delta === 0 ? Math.abs(f.amount) : Math.abs(delta);

    var sub = [kindLabel];
    if (acc) sub.push(counter ? acc.name + ' → ' + counter.name : acc.name);
    if (f.seriesId) sub.push(f.seriesFreq === 'weekly' ? 'Hằng tuần' : 'Hằng tháng');
    if (!f.confirmed) sub.push('Dự kiến');
    if (delta === 0 && f.kind === 'expense') sub.push('chưa trừ tiền');

    return h('div', { className: 'flow' },
      h('span', { className: cx('flow-state-icon', delta > 0 && 'in', delta === 0 && 'flat') },
        Icon(delta > 0 ? 'in' : delta < 0 ? 'out' : 'move', 16)),
      h('button', {
        className: 'flow-body',
        style: { border: 0, background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' },
        onClick: function () { props.onEdit(f); }
      },
        h('div', { className: 'flow-name' }, flowTitle(f)),
        h('div', { className: 'flow-sub' },
          sub.map(function (x, i) { return h('span', { key: i }, i ? '· ' + x : x); }))),
      h('div', { className: cx('amount', amountClass) },
        sign + D.fmtVND(shown), h('span', { className: 'unit' }, 'đ')));
  }

  function FlowsScreen(props) {
    var data = props.data, d = props.derived;
    var [filter, setFilter] = useState('recent');
    var [limit, setLimit] = useState(80);
    var t = D.today();

    useEffect(function () { setLimit(80); }, [filter]);

    var all = data.flows.filter(function (f) { return !f.deletedAt; });
    var filtered = all;
    if (filter === 'upcoming') filtered = all.filter(function (f) { return !f.confirmed; });
    else if (filter === 'recent') filtered = all.filter(function (f) { return f.confirmed; });

    filtered = filtered.slice().sort(function (a, b) {
      if (a.date === b.date) return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      return filter === 'upcoming' ? (a.date < b.date ? -1 : 1) : (a.date < b.date ? 1 : -1);
    });

    var list = filtered.slice(0, limit);
    var hasMore = filtered.length > list.length;
    var days = [], byDate = {};
    list.forEach(function (f) {
      if (!byDate[f.date]) { byDate[f.date] = []; days.push(f.date); }
      byDate[f.date].push(f);
    });

    function dateLabel(date) {
      if (date < t) return D.fmtDateFull(date);
      return D.relLabel(date, t);
    }

    return h('div', null,
      h('div', { className: 'screen-head' },
        h('div', { className: 'screen-head-left' },
          h('button', { className: 'back-btn', onClick: props.onBack, 'aria-label': 'Quay lại' }, Icon('back', 22)),
          h('div', null,
            h('h1', { className: 'screen-title' }, 'Giao dịch'))),
        h('div', { className: 'screen-actions' },
          h('button', { className: 'icon-btn settings-btn', onClick: props.onSettings, 'aria-label': 'Cài đặt', title: 'Cài đặt' }, Icon('gear', 21)),
          h('button', { className: 'btn sm primary', onClick: props.onNew }, 'Thêm'))),

      h('div', { className: 'chip-strip', style: { marginBottom: 'var(--s-4)' } },
        [['recent', 'Đã ghi'], ['upcoming', 'Sắp tới'], ['all', 'Tất cả']].map(function (o) {
          return h('button', {
            key: o[0], className: cx('chip', filter === o[0] && 'on'),
            onClick: function () { setFilter(o[0]); }
          }, o[1]);
        })),

      days.length === 0
        ? h('div', { className: 'empty' },
          h('h3', null, filter === 'upcoming' ? 'Không có khoản nào sắp tới' : 'Chưa có dòng tiền'),
          h('p', null, 'Nhập giao dịch là ghi nhận ngay; khoản ở tương lai sẽ tự chuyển thành actual khi đến ngày.'),
          h('button', { className: 'btn primary', onClick: props.onNew }, 'Thêm dòng tiền'))
        : days.map(function (date) {
          var rows = byDate[date];
          var net = rows.reduce(function (sum, f) { return sum + D.liquidDelta(f, d.accMap); }, 0);
          return h('div', { key: date },
            h('div', { className: 'group-label' },
              h('span', null, dateLabel(date)),
              h('b', null, (net >= 0 ? '+' : '−') + D.fmtVND(Math.abs(net)) + ' đ')),
            h('div', { className: 'group' }, rows.map(function (f) {
              return h(Swipe, {
                key: f.id,
                rightLabel: f.confirmed ? '' : 'Dời\n1 ngày',
                leftLabel: 'Xoá',
                onRight: f.confirmed ? null : function () { props.onDefer(f.id); },
                onLeft: function () { props.onDelete(f.id); }
              }, h(FlowRow, { flow: f, accMap: d.accMap, onEdit: props.onEdit }));
            })));
        }),

      hasMore ? h('div', { className: 'load-more' },
        h('button', { className: 'btn', onClick: function () { setLimit(function (x) { return x + 80; }); } },
          'Hiển thị thêm · còn ' + (filtered.length - list.length))) : null);
  }

  /* ============================ DỰ PHÓNG ============================ */

  function ForecastScreen(props) {
    var d = props.derived, data = props.data;
    var fc = d.fc;
    var big = D.upcoming(data.flows, d.horizon)
      .map(function (f) { return { f: f, delta: D.liquidDelta(f, d.accMap) }; })
      .filter(function (x) { return x.delta !== 0; })
      .sort(function (a, b) { return Math.abs(b.delta) - Math.abs(a.delta); })
      .slice(0, 6);

    return h('div', null,
      h('div', { className: 'screen-head' },
        h('div', { className: 'screen-head-left' },
          h('button', { className: 'back-btn', onClick: props.onBack, 'aria-label': 'Quay lại' }, Icon('back', 22)),
          h('div', null,
            h('h1', { className: 'screen-title' }, 'Dự phóng'))),
        h('div', { className: 'screen-actions' },
          h('button', { className: 'icon-btn settings-btn', onClick: props.onSettings, 'aria-label': 'Cài đặt', title: 'Cài đặt' }, Icon('gear', 21)))),

      h('div', { className: 'chip-strip', style: { marginBottom: 'var(--s-4)' } },
        [30, 60, 90, 365].map(function (n) {
          return h('button', {
            key: n, className: cx('chip', d.horizon === n && 'on'),
            onClick: function () { props.onHorizon(n); }
          }, n + ' ngày');
        })),

      h('div', { className: 'metrics' },
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Hôm nay'),
          h('div', { className: 'metric-value' }, D.fmtShort(fc.current)),
          h('div', { className: 'metric-foot' }, 'tiền khả dụng')),
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Thấp nhất'),
          h('div', { className: cx('metric-value', fc.breaches && 'neg') }, D.fmtShort(fc.lowest)),
          h('div', { className: 'metric-foot' }, D.fmtDate(fc.lowestDate))),
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'An toàn chi'),
          h('div', { className: cx('metric-value', fc.safeToSpend > 0 ? 'pos' : 'neg') }, D.fmtShort(fc.safeToSpend)),
          h('div', { className: 'metric-foot' }, 'ngưỡng ' + D.fmtShort(fc.reserveFloor)))),

      h('div', { className: 'panel' },
        h('div', { className: 'panel-head' },
          h('div', null,
            h('h2', { className: 'panel-title' }, 'Đường số dư'),
            h('div', { className: 'panel-sub' },
              fc.breaches
                ? 'Chạm đáy dưới ngưỡng dự phòng vào ' + D.fmtDate(fc.lowestDate) + '.'
                : 'Không chạm ngưỡng dự phòng trong tầm nhìn này.'))),
        h(Chart, { points: fc.points, floor: fc.reserveFloor })),

      big.length ? h('div', null,
        h('div', { className: 'group-label' }, h('span', null, 'Các khoản nặng nhất sắp tới')),
        h('div', { className: 'group' }, big.map(function (x) {
          return h('button', { className: 'row', key: x.f.id, onClick: function () { props.onEdit(x.f); } },
            h('span', { className: cx('row-icon', x.delta > 0 && 'in') }, Icon(x.delta > 0 ? 'in' : 'out', 16)),
            h('span', { className: 'row-main' },
              h('span', { className: 'row-label' }, flowTitle(x.f)),
              h('span', { className: 'row-value' }, D.relLabel(x.f.date))),
            h('span', { className: cx('amount', x.delta > 0 ? 'in' : 'out') },
              (x.delta > 0 ? '+' : '−') + D.fmtVND(Math.abs(x.delta)), h('span', { className: 'unit' }, 'đ')));
        }))) : null);
  }

  /* ============================== THÁNG ============================== */

  function MonthScreen(props) {
    var d = props.derived;
    var m = d.month;
    var maxCat = m.categories.length ? m.categories[0].amount : 1;

    return h('div', null,
      h('div', { className: 'screen-head' },
        h('div', { className: 'screen-head-left' },
          h('button', { className: 'back-btn', onClick: props.onBack, 'aria-label': 'Quay lại' }, Icon('back', 22)),
          h('div', null,
            h('h1', { className: 'screen-title' }, D.fmtMonth(d.ym)),
            h('div', { className: 'screen-sub' }, m.confirmed + ' dòng đã ghi nhận'))),
        h('div', { className: 'screen-actions' },
          h('button', { className: 'icon-btn settings-btn', onClick: props.onSettings, 'aria-label': 'Cài đặt', title: 'Cài đặt' }, Icon('gear', 21)),
          h('button', { className: 'icon-btn', onClick: function () { props.onMonth(-1); }, 'aria-label': 'Tháng trước' }, Icon('prev', 18)),
          h('button', {
            className: 'icon-btn', onClick: function () { props.onMonth(1); },
            disabled: d.ym >= D.monthOf(D.today()), 'aria-label': 'Tháng sau'
          }, Icon('next', 18)))),

      h('div', { className: 'metrics' },
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Thu'),
          h('div', { className: 'metric-value pos' }, D.fmtShort(m.income))),
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Chi'),
          h('div', { className: 'metric-value' }, D.fmtShort(m.expense))),
        h('div', { className: 'metric' },
          h('div', { className: 'metric-label' }, 'Còn lại'),
          h('div', { className: cx('metric-value', m.income - m.expense < 0 && 'neg') }, D.fmtShort(m.income - m.expense)),
          h('div', { className: 'metric-foot' }, m.income ? 'giữ được ' + m.savingRate + '%' : 'chưa có thu nhập'))),

      h('div', { className: 'panel' },
        h('div', { className: 'panel-head' },
          h('div', null,
            h('h2', { className: 'panel-title' }, 'Tiền mặt thực sự chuyển động'),
            h('div', { className: 'panel-sub' }, 'Gồm cả vay, trả gốc và cho vay — những khoản không phải thu chi'))),
        h('div', { className: 'metrics two', style: { marginBottom: 0 } },
          h('div', { className: 'metric', style: { boxShadow: 'none', background: 'var(--surface-2)' } },
            h('div', { className: 'metric-label' }, 'Ròng tiền mặt'),
            h('div', { className: cx('metric-value', m.netCash < 0 && 'neg') },
              (m.netCash >= 0 ? '+' : '−') + D.fmtShort(Math.abs(m.netCash)))),
          h('div', { className: 'metric', style: { boxShadow: 'none', background: 'var(--surface-2)' } },
            h('div', { className: 'metric-label' }, 'Nghĩa vụ nợ'),
            h('div', { className: 'metric-value' }, D.fmtShort(m.debtService)),
            h('div', { className: 'metric-foot' }, 'gốc + lãi đã lên lịch')))),

      m.categories.length ? h('div', { className: 'panel' },
        h('div', { className: 'panel-head' },
          h('div', null, h('h2', { className: 'panel-title' }, 'Chi theo nhóm'))),
        m.categories.map(function (c) {
          return h('div', { className: 'cat-row', key: c.name },
            h('div', { className: 'cat-name' }, c.name),
            h('div', { className: 'cat-track' }, h('span', { style: { width: (c.amount / maxCat * 100) + '%' } })),
            h('div', { className: 'cat-amt' }, D.fmtShort(c.amount)));
        })) : null,

      m.count === 0 ? h('div', { className: 'empty' },
        h('h3', null, 'Tháng này chưa có gì'),
        h('p', null, 'Chưa có dòng tiền nào rơi vào tháng này.')) : null);
  }


  /* ============================== KẾ HOẠCH ============================== */

  function PlanScreen(props) {
    var ym = props.ym;
    var budgets = (props.data.budgets || []).filter(function (b) { return b.month === ym; });
    var totalLimit = budgets.reduce(function (sum, b) { return sum + (Number(b.limit) || 0); }, 0);
    var totalUsed = budgets.reduce(function (sum, b) { return sum + budgetUsage(b, props.data.flows); }, 0);
    var remaining = totalLimit - totalUsed;
    var summaryItems = budgets.map(function (b) { return { name: b.name, amount: budgetUsage(b, props.data.flows) }; });

    return h('div', { className: 'main-screen' },
      h('div', { className: 'screen-head nav-screen-head' },
        h('div', { className: 'screen-head-left' }, h('h1', { className: 'screen-title' }, 'Kế hoạch')),
        h('div', { className: 'screen-actions' },
          h('button', { className: 'icon-btn settings-btn', onClick: props.onSettings, 'aria-label': 'Cài đặt', title: 'Cài đặt' }, Icon('gear', 21)),
          h('button', { className: 'btn sm primary', onClick: props.onNew }, 'Thêm block'))),

      h('div', { className: 'month-switcher' },
        h('button', { className: 'icon-btn', onClick: function () { props.onMonth(-1); } }, Icon('prev', 18)),
        h('b', null, D.fmtMonth(ym)),
        h('button', { className: 'icon-btn', onClick: function () { props.onMonth(1); } }, Icon('next', 18))),

      h('section', { className: 'plan-summary panel' },
        h('div', { className: 'plan-summary-numbers' },
          h('div', null, h('span', null, 'Hạn mức'), h('b', null, D.fmtVND(totalLimit) + ' đ')),
          h('div', null, h('span', null, 'Đã dùng'), h('b', { className: totalUsed > totalLimit ? 'neg' : '' }, D.fmtVND(totalUsed) + ' đ')),
          h('div', null, h('span', null, 'Còn lại'), h('b', { className: remaining >= 0 ? 'pos' : 'neg' }, (remaining < 0 ? '−' : '') + D.fmtVND(Math.abs(remaining)) + ' đ'))),
        h('div', { className: 'plan-progress' }, h('span', { className: totalUsed > totalLimit ? 'over' : '', style: { width: Math.min(100, totalLimit ? totalUsed / totalLimit * 100 : 0) + '%' } })),
        h('small', null, totalLimit ? Math.round(totalUsed / totalLimit * 100) + '% ngân sách đã sử dụng' : 'Chưa đặt hạn mức')),

      budgets.length ? h('div', { className: 'budget-list' }, budgets.map(function (b) {
        var used = budgetUsage(b, props.data.flows);
        var left = Number(b.limit) - used;
        var pct = Number(b.limit) ? used / Number(b.limit) * 100 : 0;
        return h('article', { className: cx('budget-card', pct > 100 && 'over'), key: b.id },
          h('div', { className: 'budget-icon' }, Icon(b.icon || 'wallet', 21)),
          h('div', { className: 'budget-body' },
            h('div', { className: 'budget-head' },
              h('div', null, h('h3', null, b.name), h('span', null, 'Giới hạn ' + D.fmtVND(b.limit) + ' đ · nhóm ' + b.category)),
              h('div', { className: 'budget-actions' },
                h('button', { onClick: function () { props.onEdit(b); }, 'aria-label': 'Sửa' }, Icon('edit', 17)),
                h('button', { className: 'danger', onClick: function () { props.onDelete(b.id); }, 'aria-label': 'Xoá' }, Icon('trash', 17)))),
            h('div', { className: 'budget-progress' }, h('span', { style: { width: Math.min(100, pct) + '%' } })),
            h('div', { className: 'budget-foot' },
              h('span', null, 'Đã dùng ', h('b', null, D.fmtVND(used) + ' đ'), ' (' + Math.round(pct) + '%)'),
              h('span', { className: left >= 0 ? 'pos' : 'neg' }, left >= 0 ? 'Còn ' + D.fmtVND(left) + ' đ' : 'Vượt ' + D.fmtVND(Math.abs(left)) + ' đ'))));
      })) : h('div', { className: 'empty' },
        h('h3', null, 'Chưa có block kế hoạch trong tháng này'),
        h('p', null, 'Tạo block như Ăn uống, Cafe, Thể thao hoặc bất kỳ nhóm chi tiêu nào mày cần kiểm soát.'),
        h('button', { className: 'btn primary', onClick: props.onNew }, 'Tạo block đầu tiên')),

      budgets.length ? h('section', { className: 'dashboard-grid plan-charts' },
        h('div', { className: 'panel' }, h('div', { className: 'panel-head' }, h('div', null, h('h2', { className: 'panel-title' }, 'Cơ cấu đã dùng'))), h(DonutChart, { items: summaryItems, centerLabel: 'Đã dùng' })),
        h('div', { className: 'panel plan-rule' }, h('h2', { className: 'panel-title' }, 'Cách Rootflow tính'),
          h('p', null, 'Mỗi block đối chiếu với giao dịch chi tiêu đã ghi nhận có cùng nhóm và cùng tháng.'),
          h('p', null, 'Dòng dự kiến chưa được tính là “đã dùng” để tránh làm sai trạng thái ngân sách hiện tại.'),
          h('button', { className: 'btn sm', onClick: function () { props.onGo('flows'); } }, 'Xem giao dịch'))) : null);
  }

  /* ============================== KỊCH BẢN ============================== */

  function ScenarioScreen(props) {
    var data = props.data, d = props.derived;
    var scenarios = data.scenarios || [];
    var [selectedId, setSelectedId] = useState(scenarios[0] ? scenarios[0].id : null);
    useEffect(function () { if (selectedId && !scenarios.some(function (x) { return x.id === selectedId; })) setSelectedId(scenarios[0] ? scenarios[0].id : null); }, [scenarios.length]);
    var selected = scenarios.find(function (x) { return x.id === selectedId; }) || scenarios[0] || null;
    var baseline = useMemo(function () {
      return D.forecast(data.accounts, data.flows, 90, data.settings.reserveFloor);
    }, [data.accounts, data.flows, data.settings.reserveFloor]);
    var scenarioForecasts = useMemo(function () {
      var out = {};
      scenarios.forEach(function (scenario) {
        out[scenario.id] = D.forecast(data.accounts, data.flows.concat([scenarioAsFlow(scenario)]), 90, data.settings.reserveFloor);
      });
      return out;
    }, [data.accounts, data.flows, scenarios, data.settings.reserveFloor]);
    var simulated = selected ? scenarioForecasts[selected.id] : baseline;
    var idxs = [0, 30, 60, 90];
    var rows = idxs.map(function (idx) { return { label: idx === 0 ? 'Hiện tại' : idx + ' ngày', base: baseline.points[idx].value, scenario: simulated.points[idx].value }; });
    var score = liquidityScore(simulated);

    return h('div', { className: 'main-screen' },
      h('div', { className: 'screen-head nav-screen-head' },
        h('div', { className: 'screen-head-left' }, h('h1', { className: 'screen-title' }, 'Kịch bản')),
        h('div', { className: 'screen-actions' },
          h('button', { className: 'icon-btn settings-btn', onClick: props.onSettings, 'aria-label': 'Cài đặt', title: 'Cài đặt' }, Icon('gear', 21)),
          h('button', { className: 'btn sm primary', onClick: props.onNew }, 'Tạo kịch bản'))),

      h('section', { className: 'panel scenario-forecast' },
        h('div', { className: 'panel-head' },
          h('div', null, h('h2', { className: 'panel-title' }, selected ? 'Dự phóng: ' + selected.name : 'Dự phóng cơ sở'), h('div', { className: 'panel-sub' }, 'So sánh số dư trong 90 ngày')),
          selected ? h('div', { className: cx('score-pill', score < 60 && 'risk') }, 'An toàn ' + score + '/100') : null),
        h(Chart, { points: simulated.points, floor: simulated.reserveFloor }),
        simulated.breaches ? h('div', { className: 'scenario-warning' }, Icon('alert', 18), h('span', null, 'Số dư chạm ', h('b', null, D.fmtVND(simulated.lowest) + ' đ'), ' vào ', D.fmtDate(simulated.lowestDate), '.')) : null),

      scenarios.length ? h('div', null,
        h('div', { className: 'section-title-row' }, h('h2', null, 'Kịch bản của mày'), h('span', null, scenarios.length + ' kịch bản')),
        h('div', { className: 'scenario-cards' }, scenarios.map(function (s) {
          var fc = scenarioForecasts[s.id];
          var sc = liquidityScore(fc);
          return h('button', { className: cx('scenario-card', selected && selected.id === s.id && 'on'), key: s.id, onClick: function () { setSelectedId(s.id); } },
            h('div', { className: 'scenario-card-top' }, h('span', { className: 'scenario-symbol' }, Icon(s.kind === 'expense' ? 'out' : s.kind === 'income' ? 'in' : s.kind === 'repay' ? 'loan' : s.kind === 'lend' ? 'hand' : 'move', 19)),
              h('span', { className: cx('scenario-score', sc < 60 && 'risk') }, sc + '/100')),
            h('h3', null, s.name),
            h('p', null, D.FLOW_KINDS[s.kind].label + ' · ' + D.fmtDate(s.date)),
            h('b', null, D.fmtVND(s.amount) + ' đ'));
        }))) : h('div', { className: 'empty' }, h('h3', null, 'Chưa có kịch bản'), h('p', null, 'Tạo một quyết định tương lai để nhìn tác động trước khi cam kết.'), h('button', { className: 'btn primary', onClick: props.onNew }, 'Tạo kịch bản')),

      selected ? h('section', { className: 'dashboard-grid scenario-compare' },
        h('div', { className: 'panel' },
          h('div', { className: 'panel-head' }, h('div', null, h('h2', { className: 'panel-title' }, 'So sánh cơ sở'), h('div', { className: 'panel-sub' }, 'Đơn vị: đồng'))),
          h(CompareBars, { rows: rows })),
        h('div', { className: 'panel scenario-decision' },
          h('div', { className: 'panel-head' }, h('div', null, h('h2', { className: 'panel-title' }, 'Tác động quyết định')),
            h('button', { className: 'icon-btn', onClick: function () { props.onEdit(selected); }, title: 'Sửa' }, Icon('edit', 18))),
          h('div', { className: 'decision-row' }, h('span', null, 'Đáy cơ sở'), h('b', null, D.fmtVND(baseline.lowest) + ' đ')),
          h('div', { className: 'decision-row' }, h('span', null, 'Đáy sau kịch bản'), h('b', { className: simulated.lowest < baseline.lowest ? 'neg' : 'pos' }, D.fmtVND(simulated.lowest) + ' đ')),
          h('div', { className: 'decision-row' }, h('span', null, 'Chênh lệch cuối kỳ'), h('b', { className: simulated.end - baseline.end >= 0 ? 'pos' : 'neg' }, (simulated.end - baseline.end >= 0 ? '+' : '−') + D.fmtVND(Math.abs(simulated.end - baseline.end)) + ' đ')),
          h('button', { className: 'btn primary block', onClick: function () { props.onApply(selected); } }, 'Đưa vào kế hoạch'),
          h('button', { className: 'btn danger block', onClick: function () { props.onDelete(selected.id); } }, 'Xoá kịch bản'))) : null);
  }

  /* ============================== APP ============================== */

  function App() {
    var boot = useMemo(function () { return S.load(); }, []);
    var [data, setData] = useState(boot.data);
    var [view, setView] = useState('home');
    var [sheet, setSheet] = useState(null);
    var [toast, setToast] = useState(null);
    var [storageError, setStorageError] = useState(boot.error);
    var [ym, setYm] = useState(D.monthOf(D.today()));
    var [horizon, setHorizon] = useState(boot.data.settings.horizonDays || 90);
    var [planYm, setPlanYm] = useState(D.monthOf(D.today()));
    var dataRef = useRef(boot.data);

    function goView(next) {
      setView(next);
      requestAnimationFrame(function () {
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }
        catch (e) { window.scrollTo(0, 0); }
      });
    }

    /* iOS/Safari có thể restore scroll position khi PWA được mở từ Home Screen.
       Cold mount phải luôn bắt đầu ở đầu màn hình; resume từ background không remount
       nên vẫn giữ đúng vị trí người dùng đang đọc. */
    useEffect(function () {
      try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
      function resetInitialScroll() {
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }
        catch (err) { window.scrollTo(0, 0); }
      }
      requestAnimationFrame(resetInitialScroll);
      var id = setTimeout(resetInitialScroll, 80);
      return function () { clearTimeout(id); };
    }, []);

    useEffect(function () { S.persist(); }, []);

    /* localStorage là synchronous. Debounce tránh block main thread ngay sau
       mọi thao tác; pagehide/visibilitychange vẫn flush để không mất thay đổi. */
    useEffect(function () {
      dataRef.current = data;
      if (boot.error) return;
      var id = setTimeout(function () {
        var r = S.save(dataRef.current);
        if (!r.ok) setStorageError(r.error);
        else if (r.warn) setStorageError('Dữ liệu đã vượt 3MB. Xuất bản sao lưu và cân nhắc dọn bớt dòng tiền cũ.');
        else setStorageError(null);
      }, 250);
      return function () { clearTimeout(id); };
    }, [data]);

    useEffect(function () {
      function flush() { if (!boot.error) S.save(dataRef.current); }
      function onVisibility() { if (document.visibilityState === 'hidden') flush(); }
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', onVisibility);
      return function () {
        window.removeEventListener('pagehide', flush);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }, []);

    /* Không còn checkbox xác nhận. Khi app mở/lấy focus, mọi flow đã tới ngày
       tự chuyển planned -> actual. User vẫn có thể sửa hoặc xoá sau đó. */
    useEffect(function () {
      function postDue() {
        if (document.visibilityState === 'hidden') return;
        var t = D.today();
        setData(function (prev) {
          var changed = false;
          var flows = prev.flows.map(function (f) {
            if (!f.deletedAt && !f.skipped && !f.confirmed && String(f.date || '') <= t) {
              changed = true;
              return Object.assign({}, f, { confirmed: true, autoPosted: true, updatedAt: S.now() });
            }
            return f;
          });
          return changed ? Object.assign({}, prev, { flows: flows }) : prev;
        });
      }
      postDue();
      window.addEventListener('focus', postDue);
      document.addEventListener('visibilitychange', postDue);
      return function () {
        window.removeEventListener('focus', postDue);
        document.removeEventListener('visibilitychange', postDue);
      };
    }, []);

    useEffect(function () {
      if (!toast) return;
      var id = setTimeout(function () { setToast(null); }, 5000);
      return function () { clearTimeout(id); };
    }, [toast]);

    function mutate(fn) {
      setData(function (prev) {
        /* Nhanh hơn JSON deep-clone và giữ prototype/type nguyên vẹn. Các record
           hiện đều phẳng nên shallow clone từng collection là đủ an toàn. */
        var next = Object.assign({}, prev, {
          accounts: (prev.accounts || []).map(function (x) { return Object.assign({}, x); }),
          flows: (prev.flows || []).map(function (x) { return Object.assign({}, x); }),
          budgets: (prev.budgets || []).map(function (x) { return Object.assign({}, x); }),
          scenarios: (prev.scenarios || []).map(function (x) { return Object.assign({}, x); }),
          settings: Object.assign({}, prev.settings || {})
        });
        fn(next);
        return next;
      });
    }

    function say(msg, undo) { setToast({ msg: msg, undo: undo || null, at: Date.now() }); }

    /* ---------- hành động ---------- */

    function hasActiveAccount() {
      return data.accounts.some(function (a) { return !a.archived; });
    }

    function openNewFlow() {
      if (!hasActiveAccount()) {
        setSheet({ type: 'account', account: {}, returnTo: 'flow' });
        say('Thêm tài khoản trước khi ghi dòng tiền');
        return;
      }
      setSheet({ type: 'flow', flow: {} });
    }

    function openNewScenario() {
      if (!hasActiveAccount()) {
        setSheet({ type: 'account', account: {}, returnTo: 'scenario' });
        say('Thêm tài khoản trước khi tạo kịch bản');
        return;
      }
      setSheet({ type: 'scenario', scenario: {} });
    }

    function saveFlow(f, recur, count, scope) {
      var isNew = !f.id;
      var changedSeries = false;
      var t = D.today();

      function postByDate(rows) {
        rows.forEach(function (row) {
          if (!row.skipped && !row.deletedAt) row.confirmed = String(row.date || '') <= t;
        });
        return rows;
      }

      mutate(function (n) {
        if (isNew) {
          var base = Object.assign({}, f, {
            confirmed: String(f.date || '') <= t,
            createdAt: S.now(), updatedAt: S.now()
          });
          var made = postByDate(D.expand(base, recur, count, S.uid));
          n.flows = n.flows.concat(made);
          return;
        }

        var original = null;
        for (var i = 0; i < n.flows.length; i++) {
          if (n.flows[i].id === f.id) { original = n.flows[i]; break; }
        }
        if (!original) return;

        var shouldRewriteFuture = scope === 'future' || (!original.seriesId && recur !== 'none');
        if (!shouldRewriteFuture) {
          for (var j = 0; j < n.flows.length; j++) {
            if (n.flows[j].id === f.id) {
              n.flows[j] = Object.assign({}, n.flows[j], f, {
                confirmed: String(f.date || '') <= t,
                updatedAt: S.now()
              });
              break;
            }
          }
          return;
        }

        changedSeries = true;
        var oldSeriesId = original.seriesId;
        var preserveCurrent = Boolean(original.confirmed);
        var rewriteStart = String(f.date || original.date || '');

        /* Nếu kỳ đang sửa đã là actual, history giữ nguyên. Lịch mới bắt đầu
           từ kỳ planned gần nhất; nếu chuỗi đã hết thì suy ra kỳ kế tiếp. */
        if (preserveCurrent) {
          var futureRows = n.flows.filter(function (row) {
            return !row.deletedAt && !row.skipped && !row.confirmed && oldSeriesId && row.seriesId === oldSeriesId && String(row.date || '') > String(original.date || '');
          }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
          if (futureRows.length) rewriteStart = futureRows[0].date;
          else if ((original.seriesFreq || recur) === 'weekly') rewriteStart = D.addDays(original.date, 7);
          else rewriteStart = D.addMonths(original.date, 1);
        }

        var keep = [];
        for (var k = 0; k < n.flows.length; k++) {
          var row = n.flows[k];
          var sameSeries = oldSeriesId && row.seriesId === oldSeriesId;
          var fromHere = String(row.date || '') >= rewriteStart;
          var replaceable = !row.confirmed && !row.deletedAt;
          var selectedReplaceable = row.id === original.id && !preserveCurrent;
          if ((selectedReplaceable || (sameSeries && fromHere)) && replaceable) continue;
          keep.push(row);
        }

        /* Với một actual đã ghi nhận, chọn "Một lần" trong phạm vi tương lai
           có nghĩa dừng chuỗi: xoá lịch planned còn lại, không tạo kỳ mới. */
        if (preserveCurrent && recur === 'none') {
          n.flows = keep;
          return;
        }

        var baseFuture = Object.assign({}, original, f, {
          id: undefined, date: rewriteStart, confirmed: false, deletedAt: undefined,
          seriesId: undefined, seriesFreq: undefined, seriesIndex: undefined,
          seriesCount: undefined, updatedAt: S.now()
        });
        var madeFuture = postByDate(D.expand(baseFuture, recur, count, S.uid));
        if (!preserveCurrent && madeFuture.length) {
          madeFuture[0].id = original.id;
          madeFuture[0].createdAt = original.createdAt || S.now();
        }
        n.flows = keep.concat(madeFuture);
      });
      setSheet(null);
      if (isNew) say(recur === 'none' ? 'Đã thêm dòng tiền' : 'Đã thêm ' + count + ' kỳ');
      else if (changedSeries) say(recur === 'none' ? 'Đã dừng lịch lặp tương lai' : 'Đã cập nhật lịch lặp');
      else say('Đã lưu dòng tiền');
    }

    function deferFlow(id) {
      var old = null;
      mutate(function (n) {
        for (var i = 0; i < n.flows.length; i++) if (n.flows[i].id === id) {
          old = n.flows[i].date;
          n.flows[i].date = D.addDays(n.flows[i].date, 1);
          n.flows[i].updatedAt = S.now();
        }
      });
      say('Đã dời sang hôm sau', function () {
        mutate(function (n) {
          for (var i = 0; i < n.flows.length; i++) if (n.flows[i].id === id) n.flows[i].date = old;
        });
      });
    }

    function deleteFlow(id) {
      mutate(function (n) {
        for (var i = 0; i < n.flows.length; i++) if (n.flows[i].id === id) n.flows[i].deletedAt = S.now();
      });
      setSheet(null);
      say('Đã chuyển vào thùng rác', function () {
        mutate(function (n) {
          for (var i = 0; i < n.flows.length; i++) if (n.flows[i].id === id) delete n.flows[i].deletedAt;
        });
      });
    }

    function restoreFlow(id) {
      mutate(function (n) {
        for (var i = 0; i < n.flows.length; i++) if (n.flows[i].id === id) delete n.flows[i].deletedAt;
      });
      say('Đã khôi phục');
    }

    function saveAccount(a) {
      var isNew = !a.id;
      mutate(function (n) {
        if (isNew) {
          n.accounts.push(Object.assign({ id: S.uid(), createdAt: S.now() }, a));
        } else {
          for (var i = 0; i < n.accounts.length; i++) if (n.accounts[i].id === a.id) n.accounts[i] = Object.assign({}, n.accounts[i], a);
        }
      });
      var returnTo = sheet && sheet.type === 'account' ? sheet.returnTo : null;
      if (isNew && returnTo === 'flow') setSheet({ type: 'flow', flow: {} });
      else if (isNew && returnTo === 'scenario') setSheet({ type: 'scenario', scenario: {} });
      else setSheet(null);
      say(isNew ? 'Đã thêm tài khoản' : 'Đã lưu');
    }

    function deleteAccount(id) {
      mutate(function (n) {
        n.accounts = n.accounts.filter(function (a) { return a.id !== id; });
      });
      setSheet(null);
      say('Đã xoá tài khoản');
    }


    function saveBudget(b) {
      var isNew = !b.id;
      mutate(function (n) {
        n.budgets = n.budgets || [];
        if (isNew) n.budgets.push(Object.assign({ id: S.uid(), createdAt: S.now(), updatedAt: S.now() }, b));
        else for (var i = 0; i < n.budgets.length; i++) if (n.budgets[i].id === b.id) n.budgets[i] = Object.assign({}, n.budgets[i], b, { updatedAt: S.now() });
      });
      setSheet(null); say(isNew ? 'Đã thêm block kế hoạch' : 'Đã lưu block');
    }

    function deleteBudget(id) {
      mutate(function (n) { n.budgets = (n.budgets || []).filter(function (b) { return b.id !== id; }); });
      setSheet(null); say('Đã xoá block kế hoạch');
    }

    function saveScenario(scenario) {
      var isNew = !scenario.id;
      mutate(function (n) {
        n.scenarios = n.scenarios || [];
        if (isNew) n.scenarios.push(Object.assign({ id: S.uid(), createdAt: S.now(), updatedAt: S.now() }, scenario));
        else for (var i = 0; i < n.scenarios.length; i++) if (n.scenarios[i].id === scenario.id) n.scenarios[i] = Object.assign({}, n.scenarios[i], scenario, { updatedAt: S.now() });
      });
      setSheet(null); say(isNew ? 'Đã tạo kịch bản' : 'Đã lưu kịch bản');
    }

    function deleteScenario(id) {
      mutate(function (n) { n.scenarios = (n.scenarios || []).filter(function (x) { return x.id !== id; }); });
      setSheet(null); say('Đã xoá kịch bản');
    }

    function applyScenario(scenario) {
      var f = scenarioAsFlow(scenario);
      f.id = S.uid();
      f.createdAt = S.now(); f.updatedAt = S.now();
      mutate(function (n) { n.flows.push(f); });
      say('Đã đưa “' + scenario.name + '” vào dòng tiền dự kiến');
    }

    function saveSettings(s) {
      mutate(function (n) { n.settings = Object.assign({}, n.settings, s); });
      setHorizon(s.horizonDays);
      setSheet(null);
      say('Đã lưu cài đặt');
    }

    function clearAllData() {
      S.clearAll().then(function () {
        var blank = S.empty();
        setData(blank);
        setHorizon(blank.settings.horizonDays);
        setYm(D.monthOf(D.today()));
        setPlanYm(D.monthOf(D.today()));
        goView('home');
        setSheet(null);
        say('Đã xoá toàn bộ dữ liệu');
      }).catch(function () {
        setStorageError('Không xoá được dữ liệu trên thiết bị này. Hãy kiểm tra quyền lưu trữ của trình duyệt.');
      });
    }

    function exportBackup() {
      try { S.exportFile(data); say('Đã tạo bản sao lưu'); }
      catch (e) { say('Không xuất được bản sao lưu'); }
    }

    function importBackup(file) {
      S.importFile(file, function (err, next) {
        if (err) { say(err); return; }
        setData(next);
        setHorizon(next.settings.horizonDays || 90);
        setYm(D.monthOf(D.today()));
        setPlanYm(D.monthOf(D.today()));
        goView('home');
        setSheet(null);
        say('Đã nạp bản sao lưu');
      });
    }

    function runDiagnostics() {
      var result = window.rootflowSelfTest();
      setSheet({ type: 'test', result: result });
    }


    /* ---------- phím tắt ---------- */

    useEffect(function () {
      function onKey(e) {
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
        if (e.key === 'Escape') {
          if (sheet) setSheet(null);
          else setView('home');
          return;
        }
        if (sheet) return;
        if (e.key === '1') setView('home');
        else if (e.key === '2') setView('plan');
        else if (e.key === '3') setView('scenarios');
        else if (e.key === '4') setView('flows');
        else if (e.key.toLowerCase() === 'n') openNewFlow();
      }
      window.addEventListener('keydown', onKey);
      return function () { window.removeEventListener('keydown', onKey); };
    }, [sheet, data.accounts.length]);

    /* ---------- số liệu dẫn xuất ---------- */

    var derived = useMemo(function () {
      var accMap = D.byId(data.accounts);
      var bal = D.balances(data.accounts, data.flows);
      var tot = D.totals(data.accounts, bal);
      var fc = D.forecast(data.accounts, data.flows, horizon, data.settings.reserveFloor);
      var month = D.monthSummary(data.accounts, data.flows, ym);
      return { accMap: accMap, bal: bal, tot: tot, fc: fc, month: month, ym: ym, horizon: horizon };
    }, [data, horizon, ym]);

    /* ---------- cài đặt ---------- */

    var settingsButton = h('button', {
      className: 'icon-btn settings-btn',
      onClick: function () { setSheet({ type: 'settings' }); },
      'aria-label': 'Cài đặt', title: 'Cài đặt'
    }, Icon('gear', 21));

    var menuButton = h('button', {
      className: 'icon-btn app-menu-btn',
      onClick: function () { setSheet({ type: 'menu' }); },
      'aria-label': 'Menu Rootflow', title: 'Menu'
    }, Icon('menu', 22));

    /* ---------- màn hình ---------- */

    var screen;
    if (view === 'accounts') {
      screen = h(AccountsScreen, {
        data: data, derived: derived, onBack: function () { goView('home'); },
        onNew: function () { setSheet({ type: 'account', account: {} }); },
        onEdit: function (a) { setSheet({ type: 'account', account: a }); },
        onSettings: function () { setSheet({ type: 'settings' }); }
      });
    } else if (view === 'flows') {
      screen = h(FlowsScreen, {
        data: data, derived: derived, onBack: function () { goView('home'); },
        onNew: openNewFlow,
        onEdit: function (f) { setSheet({ type: 'flow', flow: f }); },
        onDefer: deferFlow, onDelete: deleteFlow,
        onSettings: function () { setSheet({ type: 'settings' }); }
      });
    } else if (view === 'forecast') {
      screen = h(ForecastScreen, {
        data: data, derived: derived, onBack: function () { goView('home'); },
        onHorizon: setHorizon, onSettings: function () { setSheet({ type: 'settings' }); },
        onEdit: function (f) { setSheet({ type: 'flow', flow: f }); }
      });
    } else if (view === 'month') {
      screen = h(MonthScreen, {
        data: data, derived: derived, onBack: function () { goView('home'); },
        onMonth: function (n) { setYm(D.addMonthsToYm(ym, n)); }, onGo: goView,
        onSettings: function () { setSheet({ type: 'settings' }); }
      });
    } else if (view === 'plan') {
      screen = h(PlanScreen, {
        data: data, derived: derived, ym: planYm, onGo: goView,
        onMonth: function (n) { setPlanYm(D.addMonthsToYm(planYm, n)); },
        onNew: function () { setSheet({ type: 'budget', budget: {}, month: planYm }); },
        onEdit: function (b) { setSheet({ type: 'budget', budget: b, month: planYm }); },
        onDelete: deleteBudget, onSettings: function () { setSheet({ type: 'settings' }); }
      });
    } else if (view === 'scenarios') {
      screen = h(ScenarioScreen, {
        data: data, derived: derived,
        onNew: openNewScenario,
        onEdit: function (scenario) { setSheet({ type: 'scenario', scenario: scenario }); },
        onDelete: deleteScenario, onApply: applyScenario,
        onSettings: function () { setSheet({ type: 'settings' }); }
      });
    } else {
      screen = h(Home, {
        data: data, derived: derived, menuButton: menuButton, storageError: storageError,
        onGo: goView, onEditFlow: function (f) { setSheet({ type: 'flow', flow: f }); },
        onNewAccount: function () { setSheet({ type: 'account', account: {} }); }
      });
    }

    /* ---------- sheet ---------- */

    var sheetNode = null;
    if (sheet && sheet.type === 'flow') {
      sheetNode = h(FlowSheet, {
        key: sheet.flow.id || 'new', flow: sheet.flow, accounts: data.accounts, flows: data.flows,
        onClose: function () { setSheet(null); }, onSave: saveFlow, onDelete: deleteFlow,
        onNeedAccount: function () { setSheet({ type: 'account', account: {}, returnTo: 'flow' }); }
      });
    } else if (sheet && sheet.type === 'account') {
      sheetNode = h(AccountSheet, {
        key: sheet.account.id || 'new', account: sheet.account, flows: data.flows,
        onClose: function () { setSheet(null); }, onSave: saveAccount, onDelete: deleteAccount
      });
    } else if (sheet && sheet.type === 'budget') {
      sheetNode = h(BudgetSheet, {
        key: sheet.budget.id || 'new-budget', budget: sheet.budget, month: sheet.month, budgets: data.budgets || [],
        onClose: function () { setSheet(null); }, onSave: saveBudget, onDelete: deleteBudget
      });
    } else if (sheet && sheet.type === 'scenario') {
      sheetNode = h(ScenarioSheet, {
        key: sheet.scenario.id || 'new-scenario', scenario: sheet.scenario, accounts: data.accounts,
        onClose: function () { setSheet(null); }, onSave: saveScenario, onDelete: deleteScenario,
        onNeedAccount: function () { setSheet({ type: 'account', account: {}, returnTo: 'scenario' }); }
      });
    } else if (sheet && sheet.type === 'menu') {
      sheetNode = h(AppMenuSheet, {
        onClose: function () { setSheet(null); },
        onAccounts: function () { setSheet(null); goView('accounts'); },
        onSettings: function () { setSheet({ type: 'settings' }); }
      });
    } else if (sheet && sheet.type === 'settings') {
      sheetNode = h(SettingsSheet, {
        settings: data.settings,
        trashCount: data.flows.filter(function (f) { return Boolean(f.deletedAt); }).length,
        onClose: function () { setSheet(null); },
        onSave: saveSettings, onClear: clearAllData,
        onExport: exportBackup, onImport: importBackup,
        onTrash: function () { setSheet({ type: 'trash' }); },
        onTest: runDiagnostics
      });
    } else if (sheet && sheet.type === 'trash') {
      sheetNode = h(TrashSheet, {
        flows: data.flows, onClose: function () { setSheet(null); }, onRestore: restoreFlow
      });
    } else if (sheet && sheet.type === 'test') {
      sheetNode = h(TestSheet, { result: sheet.result, onClose: function () { setSheet(null); } });
    }

    return h('div', { className: 'app-frame' },
      h('main', { className: 'app-shell' },
        screen,
        h('footer', { className: 'app-copyright' }, '© derekdaydoi')),
      h(BottomNav, { view: view, onGo: goView, onAdd: openNewFlow }),
      sheetNode,
      toast ? h('div', { className: 'toast' },
        h('span', null, toast.msg),
        toast.undo ? h('button', { onClick: function () { toast.undo(); setToast(null); } }, 'Hoàn tác') : null) : null);
  }

  /* ======================= LỚP CHẶN LỖI =======================
     Không có ErrorBoundary thì một lỗi runtime = màn hình trắng không manh mối. */

  var ErrorBoundary = (function () {
    function EB(props) { React.Component.call(this, props); this.state = { err: null }; }
    EB.prototype = Object.create(React.Component.prototype);
    EB.prototype.constructor = EB;
    EB.getDerivedStateFromError = function (err) { return { err: err }; };
    EB.prototype.componentDidCatch = function (err, info) { console.error('Rootflow lỗi:', err, info); };
    EB.prototype.render = function () {
      if (!this.state.err) return this.props.children;
      return h('div', { className: 'app-shell' },
        h('div', { className: 'notice danger' },
          h('div', null,
            h('strong', null, 'Rootflow gặp lỗi và phải dừng'),
            h('p', null, String(this.state.err && this.state.err.message || this.state.err)),
            h('p', { style: { marginTop: '8px' } }, 'Dữ liệu vẫn còn trong máy. Mở Console để xem chi tiết, hoặc tải lại trang.'))),
        h('div', { className: 'inline', style: { gap: 'var(--s-2)' } },
          h('button', { className: 'btn primary', onClick: function () { location.reload(); } }, 'Tải lại'),
          h('button', {
            className: 'btn', onClick: function () {
              try { S.exportFile(S.load().data); } catch (e) { alert('Không xuất được: ' + e.message); }
            }
          }, 'Xuất bản sao lưu')));
    };
    return EB;
  })();

  /* ============================ KHỞI ĐỘNG ============================ */

  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(ErrorBoundary, null, h(App)));

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (e) {
        console.warn('Không đăng ký được service worker:', e);
      });
    });
  }
})();
