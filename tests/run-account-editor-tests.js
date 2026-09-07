/* Rootflow account editor compatibility tests. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }

const index = read('index.html');
const css = read('account-editor.css');
const js = read('account-editor.js');
const sw = read('sw.js');

assert(index.indexOf('account-editor.css') > index.indexOf('capital.css'), 'account editor CSS must load after canonical capital CSS');
assert(index.indexOf('account-editor.js') > index.indexOf('capital-ui.js'), 'account editor JS must load after canonical capital UI');
assert(!css.includes('.v4-cashflow-panel .rf-mini-kpi'), 'cashflow visual patches must not live in the account editor layer');
assert(!js.includes('enhanceUndatedObligations'), 'cashflow DOM mutation must not remain in the account editor layer');
assert(js.includes("aria-label') !== 'Sửa tài khoản'"), 'account enhancement must remain scoped to the edit sheet');
assert(js.includes('Dư nợ hiện tại'), 'loan outstanding must remain understandable in the editor');
assert(js.includes('isOptionalDateField'), 'optional date fields must remain clearable');
assert(js.includes("button.textContent = 'Để trống'"), 'optional dates must expose a clear action');
assert(js.includes("setNativeInputValue(input, '')"), 'clear action must return the controlled date input to empty/null state');
assert(css.includes('.rf-account-edit-sheet .rf-optional-clear'), 'optional-date clear action must remain styled');
assert(js.includes('enhanceAccountBackNavigation'), 'edit account sheet must retain back navigation');
assert(js.includes("aria-label', 'Quay lại'"), 'back navigation must remain accessible');
assert(css.includes('height:min(88dvh,780px)'), 'edit sheet must stay bounded by the dynamic viewport');
assert(css.includes('font-size:16px!important'), 'editable controls must prevent iOS focus auto-zoom');
assert(sw.includes('account-editor.css') && sw.includes('account-editor.js'), 'PWA cache must include account editor assets');
assert(sw.includes('capital-os-final'), 'PWA cache key must match the final deploy');

console.log('Rootflow account editor compatibility tests passed.');
