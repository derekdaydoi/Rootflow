/* Rootflow canonical mockup contract tests. */
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

assert(css.includes('container-type:inline-size'), 'components must size from their own container');
assert(css.includes('@container rfpanel'), 'container query fallback must exist');
assert(css.includes('minmax(0,1fr)'), 'fluid grid columns must use minmax');
assert(css.includes('white-space:nowrap'), 'money and compact labels must be protected from ugly wraps');
assert(css.includes('@media(max-width:560px)'), 'mobile form fallback must exist');
assert(css.includes('.sheet .form-grid{grid-template-columns:1fr!important}'), 'mobile input forms must collapse instead of wrapping badly');

assert(!sw.includes('v4-glass.css'), 'service worker must not cache removed glass CSS');
assert(!sw.includes('v4-nav-contrast.css'), 'service worker must not cache removed nav CSS');
assert(sw.includes('canonical-mockup'), 'service worker cache must be bumped for this UI');

console.log('Rootflow canonical mockup UI contract tests passed.');
