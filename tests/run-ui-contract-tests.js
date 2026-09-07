/* Rootflow canonical UI + responsive architecture contracts. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }

const index = read('index.html');
const app = read('app.js');
const css = read('capital.css');
const ui = read('capital-ui.js');
const sw = read('sw.js');

assert(index.includes('capital.css'), 'canonical capital stylesheet must load');
assert(!index.includes('user-scalable=no') && !index.includes('maximum-scale=1'), 'viewport must remain accessibility-safe');
assert(index.includes('brand/rootflow-mark.png'), 'splash must use the canonical raster artwork');
assert(index.includes('4150'), 'splash timing must preserve the approved final cadence');
assert(index.indexOf('capital-ui.js') < index.indexOf('app.js'), 'React presentation must load before the application controller');
assert(!index.includes('account-editor.js') && !index.includes('account-editor.css'), 'runtime must not load imperative account-editor bridges');

assert(app.includes('RootflowCapitalUI.Screen'), 'application controller must mount the canonical React-owned screens');
assert(app.includes('RootflowCapitalUI.BottomNav'), 'application controller must mount the canonical React-owned bottom navigation');
assert(app.includes('brand/rootflow-mark.png'), 'application artwork must use the canonical raster source');
assert(!app.includes('brand/rootflow-mark.svg'), 'application must not reference the retired SVG redraw');

assert(ui.includes('TIỀN CÓ THỂ DÙNG'), 'Home hero must be available cash');
assert(!ui.includes('TÀI SẢN RÒNG'), 'net worth must not return as Home hero');
['Hôm nay', 'Dòng tiền', 'Vốn', 'Kế hoạch'].forEach(label => assert(ui.includes(label), `navigation must include ${label}`));
assert(ui.includes('Xem cách tính'), 'available cash must be explainable');
assert(ui.includes('[7, 30, 90]'), 'cashflow must support 7/30/90-day horizons');
assert(ui.includes('Kịch bản chắc chắn'), 'cashflow must expose conservative projection');
assert(ui.includes('Có dòng tiền dự kiến'), 'expected projection must be visually separate');
assert(ui.includes('Nguồn vốn'), 'capital view must expose funding sources');
assert(ui.includes('Vốn đang chạy'), 'capital positions must be a primary concept');
assert(ui.includes("onEdit: function () { props.onEdit('salary'); }"), 'salary must be editable from planning');
assert(ui.includes("onEdit: function () { props.onEdit('living'); }"), 'living allocation must be editable from planning');
assert(ui.includes("onEdit: function () { props.onEdit('buffer'); }"), 'Safety Margin must be editable from planning');
assert(ui.includes('monthlyOverrides'), 'monthly income override must be persisted explicitly');
assert(ui.includes('monthlyLivingTargets'), 'living target overrides must be persisted explicitly');
assert(ui.includes('props.onCommit'), 'presentation edits must delegate persistence to the App controller');
assert(!ui.includes('querySelector') && !ui.includes('innerHTML'), 'React presentation must not imperatively mutate owned DOM');
assert(!ui.includes('MutationObserver') && !ui.includes('setTimeout'), 'presentation must not use observer/timer sync bridges');
assert(!ui.includes('S.save('), 'presentation must not persist outside the App controller');

assert(css.includes('container-type:inline-size'), 'financial blocks must size from their own container');
assert(css.includes('minmax(0,1fr)'), 'fluid layouts must protect shrinkable text columns');
assert(css.includes('clamp('), 'money typography must scale responsively');
assert(css.includes('font-variant-numeric:tabular-nums'), 'money values must use stable numeral widths');
assert(css.includes('@container rfpanel (max-width:320px)'), '320px fit fallback must exist');
assert(css.includes('@media(max-width:640px)'), 'mobile form fallback must exist');
assert(css.includes('font-size:16px'), 'mobile inputs must avoid iOS focus zoom');
assert(css.includes('env(safe-area-inset-bottom'), 'mobile chrome must respect safe areas');
assert(!css.includes('overflow-wrap:anywhere'), 'Vietnamese words must not be broken arbitrarily');

assert(sw.includes("if (navigation) return caches.match('./index.html')"), 'HTML fallback must be navigation-only');
assert(sw.includes('return Response.error()'), 'missing JS/CSS must not silently receive index HTML');

console.log('Rootflow UI contract tests passed.');
