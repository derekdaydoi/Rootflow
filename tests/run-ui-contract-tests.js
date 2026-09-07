/* Rootflow Capital OS UI + responsive contract tests. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }

const index = read('index.html');
const css = read('v4.css');
const ui = read('v4-ui.js');
const sw = read('sw.js');

assert(index.includes('v4.css'), 'Capital OS stylesheet must load');
assert(!index.includes('v4-refinements.js'), 'refinement patch layer must be consolidated into canonical domain');
assert(!index.includes('user-scalable=no'), 'standalone PWA must not disable user zoom');
assert(!index.includes('maximum-scale=1'), 'viewport must remain accessibility-safe');

assert(ui.includes('TIỀN CÓ THỂ DÙNG'), 'Home hero must be available cash');
assert(!ui.includes('TÀI SẢN RÒNG'), 'net worth must not return as Home hero');
assert(ui.includes("['Hôm nay', 'Dòng tiền', 'Vốn', 'Kế hoạch']"), 'primary navigation must follow Capital OS mental model');
assert(ui.includes('Xem cách tính'), 'available cash must be explainable');
assert(ui.includes('data-rf-horizon'), 'cashflow must support time horizons');
assert(ui.includes('Kịch bản chắc chắn'), 'cashflow must expose conservative projection');
assert(ui.includes('Có dòng tiền dự kiến'), 'expected projection must be visually separate');
assert(ui.includes('Nguồn vốn'), 'capital view must expose funding sources');
assert(ui.includes('Vốn đang chạy'), 'capital positions must be a primary concept');
assert(ui.includes("editablePlanCard('salary', 'Thu nhập'"), 'salary must be editable from planning');
assert(ui.includes("editablePlanCard('living', 'Sinh hoạt'"), 'living allocation must be editable from planning');
assert(ui.includes("editablePlanCard('shield', 'Buffer'"), 'buffer reserve must be editable from planning');
assert(ui.includes('monthlyOverrides'), 'monthly income override must be persisted explicitly');
assert(ui.includes('monthlyLivingTargets'), 'living target overrides must be persisted explicitly');
assert(!ui.includes('var originalSave = S.save'), 'presentation must not monkey-patch persistence');

assert(css.includes('container-type:inline-size'), 'financial blocks must size from their own container');
assert(css.includes('minmax(0,1fr)'), 'fluid layouts must protect shrinkable text columns');
assert(css.includes('clamp('), 'money typography must scale responsively');
assert(css.includes('font-variant-numeric:tabular-nums'), 'money values must use stable numeral widths');
assert(css.includes('@container rfpanel (max-width:320px)'), '320px fit fallback must exist');
assert(css.includes('@media(max-width:640px)'), 'mobile form fallback must exist');
assert(css.includes('font-size:16px'), 'mobile inputs must avoid iOS focus zoom');
assert(!css.includes('overflow-wrap:anywhere'), 'Vietnamese words must not be broken arbitrarily');

assert(sw.includes('capital-os'), 'PWA cache must be bumped for Capital OS deploy');
assert(!sw.includes('v4-refinements.js'), 'service worker must not cache removed patch layer');
assert(sw.includes("if (navigation) return caches.match('./index.html')"), 'HTML fallback must be navigation-only');
assert(sw.includes('return Response.error()'), 'missing JS/CSS must not silently receive index HTML');

console.log('Rootflow Capital OS UI contract tests passed.');
