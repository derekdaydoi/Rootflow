/* Rootflow canonical mockup + content-aware layout contract tests. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const index = read('index.html');
const css = read('v4.css');
const ui = read('v4-ui.js');
const sw = read('sw.js');

assert(index.includes('v4.css'), 'canonical UI stylesheet must load');
assert(!index.includes('v4-glass.css'), 'obsolete glass layer must not load');
assert(!index.includes('v4-nav-contrast.css'), 'obsolete nav layer must not load');
assert(ui.includes('Chào ngày mới Bro!'), 'approved greeting must be present');
assert(ui.includes('TÀI SẢN RÒNG'), 'mockup hero must be net assets');
assert(ui.includes('Nợ & Thanh khoản'), 'debt decision block must exist');
assert(ui.includes('Hoạt động kinh doanh'), 'business decision block must exist');
assert(ui.includes('Chi tiêu & Kế hoạch'), 'planning decision block must exist');
assert(ui.includes("detail:'assets'"), 'asset/investment drilldown must exist');
assert(!ui.includes('data-v4-toggle-advanced'), 'legacy advanced dashboard toggle should be removed');

assert(ui.includes("'is-dated' : 'is-undated'"), 'obligations must have semantic date variants');
assert(ui.includes('rf-period-badge'), 'month-only obligation period badge must exist');
assert(css.includes('.rf-obligation.is-dated .rf-obligation-copy'), 'exact-date obligation layout must exist');
assert(css.includes('.rf-obligation.is-undated .rf-obligation-copy'), 'month-only obligation layout must exist');
assert(css.includes('grid-template-columns:1fr;gap:5px'), 'undated obligation must not reserve the exact-date rail');

assert(ui.includes("miniKpi('Tiền chắc chắn về'"), 'cashflow KPI must use compact consumer copy');
assert(ui.includes("miniKpi('Nợ 30 ngày'"), 'debt KPI must use compact consumer copy');
assert(!ui.includes("miniKpi('Dòng tiền chắc chắn về'"), 'long KPI label should not return');
assert(!ui.includes("miniKpi('Nợ cần trả 30 ngày'"), 'long debt KPI label should not return');

assert(css.includes('container-type:inline-size'), 'components must size from their own container');
assert(css.includes('@container rfpanel'), 'container query fallback must exist');
assert(css.includes('minmax(0,1fr)'), 'fluid grid columns must use minmax');
assert(css.includes('white-space:nowrap'), 'money values and compact chrome must be protected from ugly wraps');
assert(!css.includes('overflow-wrap:anywhere'), 'UI must not split Vietnamese words arbitrarily');
assert(css.includes('text-wrap:pretty'), 'meaningful copy must wrap at natural word boundaries');
assert(css.includes('@media(max-width:640px)'), 'mobile form fallback must exist');
assert(css.includes('.sheet .form-grid{grid-template-columns:1fr!important}'), 'mobile input forms must collapse instead of wrapping badly');

assert(!sw.includes('v4-glass.css'), 'service worker must not cache removed glass CSS');
assert(!sw.includes('v4-nav-contrast.css'), 'service worker must not cache removed nav CSS');
assert(sw.includes('canonical-mockup'), 'service worker cache must remain on canonical UI family');

console.log('Rootflow content-aware canonical UI contract tests passed.');
