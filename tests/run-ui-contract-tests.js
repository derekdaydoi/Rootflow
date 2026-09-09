/* Rootflow canonical UI + responsive architecture contracts. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }

const index = read('index.html');
const app = read('app.js');
const css = read('capital.css');
const baseCss = read('styles.css');
const ui = read('capital-ui.js');
const sw = read('sw.js');
const splashCss = read('brand/rootflow-splash.css');
const themeCss = read('brand/rootflow-theme.css');
const manifest = read('manifest.json');
const runtimeMark = fs.readFileSync(path.join(__dirname, '..', 'brand/rootflow-mark.png'));
const installIcon = fs.readFileSync(path.join(__dirname, '..', 'brand/rootflow-icon.png'));

assert(index.includes('capital.css'), 'canonical capital stylesheet must load');
assert(!index.includes('effects.css'), 'retired motion-template stylesheet must not load');
assert(index.includes('user-scalable=no') && index.includes('maximum-scale=1') && index.includes('minimum-scale=1'), 'mobile viewport must stay fixed at 1x scale');
assert(index.includes('gesturestart') && index.includes('gesturechange') && index.includes('touches.length > 1'), 'global viewport must block iOS pinch and multi-touch zoom gestures');
assert(index.includes('class="splash"') && index.includes('brand/rootflow-splash.css'), 'initial HTML must paint the Rootwork-style Rootflow splash before React');
assert(index.includes('brand/rootflow-mark.png?v=20260909-brand-r3'), 'runtime splash must use the transparent canonical mark');
assert(index.includes('brand/rootflow-icon.png?v=20260909-brand-r3'), 'browser and iOS homescreen metadata must use the canonical install icon');
assert(index.includes('© 2026 derekdaydoi. All rights reserved.'), 'opening splash must expose standard copyright ownership');
[runtimeMark, installIcon].forEach((icon) => assert(icon.length > 1000 && icon.slice(0, 8).toString('hex') === '89504e470d0a1a0a', 'canonical brand assets must be real PNG binaries'));
assert(manifest.includes('brand/rootflow-icon.png') && manifest.includes('512x512') && manifest.includes('any maskable'), 'web app manifest must use one canonical Rootflow install icon');
assert(splashCss.includes('prefers-reduced-motion:reduce'), 'opening splash must respect reduced-motion preference');
assert(app.includes('function Splash()') && app.includes('var launchState = React.useState(true)') && app.includes('setLaunch(false)'), 'React must own the splash lifecycle after first paint');
assert(index.includes('operating-policy.js') && index.indexOf('operating-policy.js') < index.indexOf('capital-ui.js'), 'operating policy must load before React presentation captures domain functions');
assert(index.indexOf('capital-ui.js') < index.indexOf('app.js'), 'React presentation must load before the application controller');
assert(!index.includes('account-editor.js') && !index.includes('account-editor.css'), 'runtime must not load imperative account-editor bridges');
assert(!index.includes('compat.js') && !index.includes('store-adapter.js') && !index.includes('i18n-base.js') && !index.includes('i18n-capital.js'), 'retired compatibility scripts must not load');

assert(app.includes('RootflowCapitalUI.Screen'), 'application controller must mount the canonical React-owned screens');
assert(app.includes('RootflowCapitalUI.BottomNav'), 'application controller must mount the canonical React-owned bottom navigation');
assert(!app.includes('function Home(props)') && !app.includes('function FlowScreen(props)') && !app.includes('function PositionScreen(props)') && !app.includes('function DecideScreen(props)'), 'legacy screen functions must be removed, not hidden behind a runtime branch');
assert(!ui.includes('brand/rootflow-mark.png') && !ui.includes('rf-brand-mark'), 'canonical app header must be text-only without an in-app logo');
assert(ui.includes("h('strong', null, 'Rootflow')"), 'canonical app header must render the exact Rootflow wordmark');
assert(!ui.includes("'root', h('b', null, 'flow')"), 'canonical app header must not split the brand into root + flow styling');

assert(ui.includes("'Tiền có thể dùng'"), 'Home hero must be available cash');
assert(!ui.includes('TÀI SẢN RÒNG'), 'net worth must not return as Home hero');
['Hôm nay', 'Dòng tiền', 'Vốn', 'Kế hoạch'].forEach(label => assert(ui.includes(label), `navigation must include ${label}`));
assert(ui.includes('Xem cách tính'), 'available cash must be explainable');
assert(ui.includes('[7, 30, 90]'), 'cashflow must support 7/30/90-day horizons');
assert(ui.includes('Stress 14 ngày'), 'cashflow must expose delayed-collection stress projection');
assert(ui.includes('Base case'), 'base projection must be visually separate');
assert(ui.includes('Nguồn vốn'), 'capital view must expose funding sources');
assert(ui.includes('Vốn đang chạy'), 'capital positions must be a primary concept');
assert(ui.includes("onEdit: function () { props.onEdit('salary'); }"), 'salary must be editable from planning');
assert(ui.includes("onEdit: function () { props.onEdit('living'); }"), 'living allocation must be editable from planning');
assert(ui.includes("onEdit: function () { props.onEdit('buffer'); }"), 'Safety Margin must be editable from planning');
assert(ui.includes('monthlyOverrides'), 'monthly income override must be persisted explicitly');
assert(ui.includes('monthlyLivingTargets'), 'living target overrides must be persisted explicitly');
assert(ui.includes('props.onCommit'), 'presentation edits must delegate persistence to the App controller');
assert(ui.includes('props.onOpenSettings'), 'canonical app bar must expose settings and data');
assert(app.includes("onOpenSettings: function () { setOverlay('settings'); }"), 'app bar settings action must open the settings/data sheet');
assert(app.includes("'Xuất backup'") && app.includes("'Nhập backup'"), 'settings/data sheet must expose export and import backup controls');
assert(app.includes("'Xóa tài khoản'") && app.includes('function deleteAccount(account)'), 'account editor must expose hard delete in addition to archive');
assert(app.includes('lockGestures: true') && app.includes('gesturestart'), 'account editor must retain explicit sheet-level gesture locking');
assert(ui.includes('props.onEditAccount(row.accountId)') && ui.includes('props.onEditAccount(source.accountId)'), 'capital positions and funding sources must open their canonical account editor');
assert(ui.includes('Giao dịch đã nhập') && ui.includes('props.onEditFlow'), 'recorded cashflows must expose correction from the canonical cashflow screen');
assert(ui.includes("recordedAll.slice(0, 12)") && ui.includes("'Xem tất cả'"), 'cashflow history must stay compact without hiding older editable records');
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
assert(baseCss.includes('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'), 'UI must use a conventional native app font stack');
const numericWeights = (baseCss + '\n' + css).match(/font-weight:\s*(\d+)/g) || [];
numericWeights.forEach(rule => assert(/(?:400|500|600|700)$/.test(rule), `typography must use a deliberate native weight: ${rule}`));

assert(themeCss.includes('--rf-green-deep:#0f5f3f') && !themeCss.includes('#24106d'), 'application theme must stay green-first instead of purple-first');
assert(themeCss.includes('.rf-chart-confirmed{stroke:var(--rf-green-deep)}'), 'confirmed cashflow must use the primary green visual language');
assert(themeCss.includes('overscroll-behavior:none') && themeCss.includes('touch-action:pan-y') && themeCss.includes('overflow-x:hidden'), 'application shell must prevent viewport drift while preserving vertical scrolling');
assert(!sw.includes('effects.css') && !sw.includes('compat.js') && !sw.includes('store-adapter.js'), 'service worker must cache only the canonical runtime');
assert(sw.includes('brand/rootflow-splash.css') && sw.includes('brand/rootflow-mark.png') && sw.includes('brand/rootflow-icon.png') && sw.includes('operating-policy.js'), 'service worker must cache the canonical opening mark, install icon and operating policy');
assert(sw.includes('rootflow-ui-2026-09-09-brand-r3'), 'service worker cache version must refresh the Rootwork-style brand release');
assert(sw.includes("if (navigation) return caches.match('./index.html')"), 'HTML fallback must be navigation-only');
assert(sw.includes('return Response.error()'), 'missing JS/CSS must not silently receive index HTML');

console.log('Rootflow UI contract tests passed.');
