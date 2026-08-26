const fs = require('fs');
const path = require('path');
const assert = require('assert');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const index = read('index.html');
const css = read('v4-polish.css');
const js = read('v4-polish.js');
const sw = read('sw.js');

assert(index.indexOf('v4-polish.css') > index.indexOf('v4.css'), 'polish CSS must load after canonical CSS');
assert(index.indexOf('v4-polish.js') > index.indexOf('v4-ui.js'), 'polish JS must load after canonical UI');
assert(css.includes('.v4-cashflow-panel .rf-mini-kpi'), 'cashflow KPI sizing override must exist');
assert(css.includes('min-height:88px'), 'cashflow KPI cards must be larger');
assert(css.includes('.rf-account-edit-sheet .rf-hide-derived-card'), 'duplicate derived balance card must be hidden in edit mode');
assert(css.includes('@container rfpanel (max-width:300px)'), 'narrow-phone fallback must exist');
assert(js.includes(".rf-obligation.is-undated"), 'undated obligations must be enhanced semantically');
assert(js.includes("prefix + ' · ' + current"), 'month-only context must move into subtitle');
assert(js.includes("aria-label') !== 'Sửa tài khoản'"), 'edit-account enhancement must target only edit sheet');
assert(js.includes('Dư nợ hiện tại'), 'loan outstanding must be exposed as editable wording');
assert(js.includes('isOptionalDateField'), 'optional date fields must be detected semantically');
assert(js.includes("button.textContent = 'Để trống'"), 'optional dates must expose a clear action');
assert(js.includes("setNativeInputValue(input, '')"), 'clear action must return the controlled date input to empty/null state');
assert(css.includes('.rf-account-edit-sheet .rf-optional-clear'), 'optional-date clear action must be styled');
assert(js.includes('enhanceAccountBackNavigation'), 'edit account sheet must expose explicit back navigation');
assert(js.includes("aria-label', 'Quay lại'"), 'edit account navigation must use a back action rather than the dismiss X');
assert(js.includes('reopenSettingsAfterClose'), 'back must restore the previous account/settings context instead of dropping to the app root');
assert(css.includes('body.rf-account-sheet-open'), 'background scrolling must be locked while editing an account');
assert(css.includes('height:min(88dvh,780px)'), 'edit sheet height must be bounded by the dynamic viewport');
assert(css.includes('font-size:16px!important'), 'editable controls must prevent iOS focus auto-zoom');
assert(sw.includes('v4-polish.css') && sw.includes('v4-polish.js'), 'PWA cache must include polish assets');
assert(sw.includes('edit-sheet-back-viewport'), 'PWA cache key must be bumped for edit-sheet navigation deploy');

console.log('Rootflow account edit + cashflow polish contract tests passed.');
