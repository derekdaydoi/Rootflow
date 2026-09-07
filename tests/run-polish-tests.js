/* Rootflow scoped legacy-editor compatibility tests. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }

const index = read('index.html');
const css = read('v4-polish.css');
const js = read('v4-polish.js');
const sw = read('sw.js');

assert(index.indexOf('v4-polish.css') > index.indexOf('v4.css'), 'scoped compatibility CSS must load after canonical UI CSS');
assert(index.indexOf('v4-polish.js') > index.indexOf('v4-ui.js'), 'scoped compatibility JS must load after canonical UI');
assert(!css.includes('.v4-cashflow-panel .rf-mini-kpi'), 'cashflow visual patches must be removed from the legacy polish layer');
assert(!js.includes('enhanceUndatedObligations'), 'cashflow DOM mutation must not remain in the legacy polish layer');
assert(js.includes("aria-label') !== 'Sửa tài khoản'"), 'account enhancement must remain scoped to the edit sheet');
assert(js.includes('Dư nợ hiện tại'), 'loan outstanding must remain understandable in the legacy editor');
assert(js.includes('isOptionalDateField'), 'optional date fields must remain clearable');
assert(js.includes("button.textContent = 'Để trống'"), 'optional dates must expose a clear action');
assert(js.includes("setNativeInputValue(input, '')"), 'clear action must return the controlled date input to empty/null state');
assert(css.includes('.rf-account-edit-sheet .rf-optional-clear'), 'optional-date clear action must remain styled');
assert(js.includes('enhanceAccountBackNavigation'), 'edit account sheet must retain back navigation');
assert(js.includes("aria-label', 'Quay lại'"), 'back navigation must remain accessible');
assert(css.includes('height:min(88dvh,780px)'), 'edit sheet must stay bounded by the dynamic viewport');
assert(css.includes('font-size:16px!important'), 'legacy editable controls must prevent iOS focus auto-zoom');
assert(sw.includes('v4-polish.css') && sw.includes('v4-polish.js'), 'PWA cache must include compatibility assets');
assert(sw.includes('capital-os'), 'PWA cache key must match the Capital OS deploy');

console.log('Rootflow scoped legacy-editor compatibility tests passed.');
