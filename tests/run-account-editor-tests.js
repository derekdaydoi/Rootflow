/* Rootflow React-owned account editor contracts. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }

const root = path.join(__dirname, '..');
const index = read('index.html');
const app = read('app.js');
const css = read('styles.css') + '\n' + read('capital.css');
const sw = read('sw.js');

assert(!fs.existsSync(path.join(root, 'account-editor.js')), 'imperative account-editor bridge must be removed');
assert(!fs.existsSync(path.join(root, 'account-editor.css')), 'account-editor patch stylesheet must be removed');
assert(!index.includes('account-editor.js') && !index.includes('account-editor.css'), 'runtime must not load account-editor bridge assets');
assert(!sw.includes('account-editor.js') && !sw.includes('account-editor.css'), 'PWA cache must not retain account-editor bridge assets');

assert(app.includes('function AccountForm(props)'), 'AccountForm must remain React-owned');
assert(app.includes("overlay === 'account' ? h(Sheet"), 'account editing must mount through React sheet state');
assert(app.includes("editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'"), 'account sheet must preserve edit/add semantics');
assert(app.includes("h('button', { type: 'button', className: 'secondary-button'"), 'React forms must expose explicit actions without DOM injection');
assert(app.includes('Dư gốc hiện tại'), 'outstanding principal must remain editable');
assert(app.includes('outstandingAsOf'), 'current outstanding must retain an explicit as-of date');
assert(app.includes('maturityDate'), 'optional maturity date semantics must remain in the React form');
assert(app.includes("type: 'date'"), 'date editing must use native controlled inputs that can return to empty/null');
assert(!app.includes('MutationObserver'), 'application controller must not use MutationObserver architecture');

assert(css.includes('font-size:16px'), 'mobile editable controls must avoid iOS focus auto-zoom');
assert(css.includes('env(safe-area-inset-bottom'), 'sheets/mobile chrome must respect safe areas');
assert(css.includes('dvh'), 'viewport-sensitive UI must use dynamic viewport units');

console.log('Rootflow React account editor contract tests passed.');
