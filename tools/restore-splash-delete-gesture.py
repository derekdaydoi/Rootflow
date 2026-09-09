from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


# index.html — restore the smart-treasury opening splash without weakening
# the global viewport accessibility contract.
path = Path('index.html')
text = path.read_text(encoding='utf-8')
text = replace_once(
    text,
    '  <link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="capital.css">\n</head>\n<body>\n  <div id="root"><div class="boot">Đang mở Rootflow…</div></div>',
    '''  <link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="capital.css">\n  <link rel="stylesheet" href="brand/rootflow-splash.css">\n</head>\n<body class="splash-active">\n  <div id="opening-splash" class="opening-splash" aria-hidden="true">\n    <div class="splash-halo"></div>\n    <div class="splash-lockup">\n      <svg class="splash-mark" viewBox="0 0 128 128" role="presentation" aria-hidden="true">\n        <defs>\n          <linearGradient id="splash-rf-green" x1="24" y1="104" x2="104" y2="24" gradientUnits="userSpaceOnUse">\n            <stop offset="0" stop-color="#0F4F35"></stop>\n            <stop offset="1" stop-color="#1C8A58"></stop>\n          </linearGradient>\n        </defs>\n        <g class="splash-gear" transform="translate(84 73)">\n          <g fill="#1C8A58" stroke="#0F4F35" stroke-width="4.8" stroke-linejoin="round">\n            <circle cx="0" cy="0" r="16.5"></circle>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4"></rect>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4" transform="rotate(45)"></rect>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4" transform="rotate(90)"></rect>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4" transform="rotate(135)"></rect>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4" transform="rotate(180)"></rect>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4" transform="rotate(225)"></rect>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4" transform="rotate(270)"></rect>\n            <rect x="-4.4" y="-31" width="8.8" height="14" rx="2.4" transform="rotate(315)"></rect>\n          </g>\n          <circle cx="0" cy="0" r="6.8" fill="#F5F6F2" stroke="#0F4F35" stroke-width="5"></circle>\n        </g>\n        <g class="splash-bulb">\n          <path d="M46 12C25.5 12 12 27.9 12 47.4c0 11.7 5.4 20.6 12.6 28.5 3.1 3.6 5.1 7.3 5.4 12.3h31.4c.4-5.2 2.8-9.3 6.3-13 7.4-7.6 12-16.2 12-28.1C79.7 27.8 65.2 12 46 12Z" fill="#E8F2EB" stroke="#0F4F35" stroke-width="6.8" stroke-linejoin="round"></path>\n          <path class="splash-glint" pathLength="1" d="M30 31c3.9-7.1 10.1-11.7 17.8-13.5" fill="none" stroke="#FFFFFF" stroke-width="4.8" stroke-linecap="round"></path>\n          <g class="splash-coin">\n            <circle cx="46" cy="47" r="18.3" fill="#1C8A58" stroke="#0F4F35" stroke-width="5.8"></circle>\n            <path class="splash-money-line" pathLength="1" d="M53.5 37.2c-2.3-4.1-10.3-4.8-13.7.1-4.1 5.8 2.1 8.6 7.2 10.3 7.3 2.5 9.5 6.3 6.6 11.3-3.7 5.5-13.4 5.1-16.4-.8" fill="none" stroke="#0F4F35" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"></path>\n            <path class="splash-money-line" pathLength="1" d="M46 32.3v4.8M46 57.6v4.9" fill="none" stroke="#0F4F35" stroke-width="4.5" stroke-linecap="round"></path>\n          </g>\n          <g class="splash-base">\n            <rect x="25" y="84.5" width="41.5" height="12.8" rx="6.4" fill="url(#splash-rf-green)" stroke="#0F4F35" stroke-width="5.5"></rect>\n            <rect x="28.8" y="95.5" width="33.8" height="12.8" rx="6.4" fill="#1C8A58" stroke="#0F4F35" stroke-width="5.5"></rect>\n            <path d="M35.8 108.3h20.2c0 6.2-4.6 10.2-10.1 10.2-5.5 0-10.1-4-10.1-10.2Z" fill="#1C8A58" stroke="#0F4F35" stroke-width="5.5" stroke-linejoin="round"></path>\n            <path d="M33.6 91h10.6" stroke="#79D8A5" stroke-width="3.7" stroke-linecap="round" opacity=".82"></path>\n          </g>\n        </g>\n      </svg>\n      <div class="splash-wordmark"><strong>Rootflow</strong></div>\n      <div class="splash-copyright">© 2026 <strong>@derekdaydoi</strong>. All rights reserved.</div>\n    </div>\n  </div>\n  <div id="root"><div class="boot">Đang mở Rootflow…</div></div>''',
    'index splash mount'
)
text = replace_once(
    text,
    '  <script src="capital-ui.js"></script>\n  <script src="app.js"></script>\n</body>',
    '''  <script src="capital-ui.js"></script>\n  <script src="app.js"></script>\n  <script>\n    (function () {\n      var splash = document.getElementById('opening-splash');\n      if (!splash) return;\n      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n      window.setTimeout(function () {\n        document.body.classList.remove('splash-active');\n        splash.remove();\n      }, reduced ? 650 : 3850);\n    })();\n  </script>\n</body>''',
    'index splash cleanup'
)
path.write_text(text, encoding='utf-8')


# Dedicated splash CSS. Keeping this isolated prevents the restored brand motion
# from leaking into canonical product-screen styling.
splash_css = r'''/* Rootflow smart-treasury opening splash. Copyright © 2026 @derekdaydoi. */
body.splash-active { overflow: hidden; }
.opening-splash {
  --rf-logo-deep:#0F4F35;
  --rf-logo-green:#1C8A58;
  --rf-logo-mint:#E8F2EB;
  --rf-logo-bg:#F5F6F2;
  pointer-events:none;
  position:fixed;
  z-index:1000;
  inset:0;
  min-width:320px;
  display:grid;
  place-items:center;
  overflow:hidden;
  background:radial-gradient(circle at 50% 40%,rgba(28,138,88,.14),rgba(28,138,88,0) 35%),radial-gradient(circle at 50% 47%,rgba(15,79,53,.05),rgba(15,79,53,0) 60%),var(--rf-logo-bg);
  animation:rf-splash-screen 3.8s cubic-bezier(.22,.72,.25,1) both;
}
.opening-splash .splash-lockup { position:relative;z-index:1;width:min(84vw,392px);display:grid;justify-items:center;transform:translateY(-2.2vh); }
.opening-splash .splash-halo { position:absolute;left:50%;top:45%;width:min(60vw,238px);aspect-ratio:1;border:1px solid rgba(28,138,88,.11);border-radius:50%;opacity:0;transform:translate(-50%,-64%) scale(.58);box-shadow:0 0 0 22px rgba(28,138,88,.024),0 22px 72px rgba(15,79,53,.1);animation:rf-halo-pulse 1.2s 1.02s cubic-bezier(.18,.82,.28,1) both; }
.opening-splash .splash-mark { width:132px;height:132px;overflow:visible;filter:drop-shadow(0 10px 20px rgba(15,79,53,.12));animation:rf-mark-enter .78s .12s cubic-bezier(.18,.86,.24,1.08) both; }
.opening-splash .splash-gear,.opening-splash .splash-bulb,.opening-splash .splash-coin,.opening-splash .splash-base { transform-box:fill-box;transform-origin:center; }
.opening-splash .splash-gear { animation:rf-gear-enter 1.12s .32s cubic-bezier(.16,.82,.22,1) both; }
.opening-splash .splash-bulb { animation:rf-bulb-enter .76s .18s cubic-bezier(.18,.88,.24,1.08) both; }
.opening-splash .splash-coin { animation:rf-coin-enter .64s .92s cubic-bezier(.2,.9,.26,1.16) both; }
.opening-splash .splash-base { animation:rf-base-enter .52s .72s cubic-bezier(.2,.82,.25,1) both; }
.opening-splash .splash-money-line { stroke-dasharray:1;stroke-dashoffset:1;animation:rf-money-draw .62s 1.18s cubic-bezier(.3,.05,.18,1) both; }
.opening-splash .splash-glint { stroke-dasharray:1;stroke-dashoffset:1;opacity:0;animation:rf-glint-draw .48s 1.42s ease-out both; }
.opening-splash .splash-wordmark { margin-top:12px;opacity:0;color:var(--rf-logo-deep);font-size:43px;font-weight:700;line-height:1;letter-spacing:-2px;transform:translateY(8px);animation:rf-copy-enter .54s 1.72s cubic-bezier(.22,.8,.25,1) both; }
.opening-splash .splash-wordmark strong { color:var(--rf-logo-deep);font-weight:700; }
.opening-splash .splash-copyright { margin-top:16px;opacity:0;color:#8A918D;font-size:10px;font-weight:500;line-height:1.35;letter-spacing:.025em;text-align:center;transform:translateY(7px);animation:rf-copy-enter .5s 2.08s cubic-bezier(.22,.8,.25,1) both; }
.opening-splash .splash-copyright strong { color:var(--rf-logo-deep);font-weight:700; }
@keyframes rf-mark-enter { 0%{opacity:0;transform:translateY(9px) scale(.86)}65%{opacity:1;transform:translateY(-1px) scale(1.024)}100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes rf-gear-enter { 0%{opacity:0;transform:rotate(-22deg) translateX(4px) scale(.72)}58%{opacity:1;transform:rotate(4deg) translateX(0) scale(1.02)}100%{opacity:1;transform:rotate(0) translateX(0) scale(1)} }
@keyframes rf-bulb-enter { 0%{opacity:0;transform:translateY(8px) scale(.84)}72%{opacity:1;transform:translateY(-1px) scale(1.018)}100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes rf-coin-enter { 0%{opacity:0;transform:scale(.56)}70%{opacity:1;transform:scale(1.05)}100%{opacity:1;transform:scale(1)} }
@keyframes rf-base-enter { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
@keyframes rf-money-draw { 0%{opacity:0;stroke-dashoffset:1}14%{opacity:1}100%{opacity:1;stroke-dashoffset:0} }
@keyframes rf-glint-draw { 0%{opacity:0;stroke-dashoffset:1}30%{opacity:.82}100%{opacity:.72;stroke-dashoffset:0} }
@keyframes rf-halo-pulse { 0%{opacity:0;transform:translate(-50%,-64%) scale(.58)}46%{opacity:.82}100%{opacity:0;transform:translate(-50%,-64%) scale(1.16)} }
@keyframes rf-copy-enter { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
@keyframes rf-splash-screen { 0%{opacity:0}5%{opacity:1}90%{opacity:1}100%{opacity:0;visibility:hidden} }
@media (max-width:420px) { .opening-splash .splash-mark{width:124px;height:124px}.opening-splash .splash-wordmark{font-size:40px} }
@media (prefers-reduced-motion:reduce) {
  .opening-splash { animation:rf-splash-screen-reduced .65s linear both; }
  .opening-splash .splash-halo { display:none; }
  .opening-splash .splash-mark,.opening-splash .splash-gear,.opening-splash .splash-bulb,.opening-splash .splash-coin,.opening-splash .splash-base,.opening-splash .splash-money-line,.opening-splash .splash-glint,.opening-splash .splash-wordmark,.opening-splash .splash-copyright { animation:none!important;opacity:1;transform:none;stroke-dashoffset:0; }
}
@keyframes rf-splash-screen-reduced { 0%,76%{opacity:1}100%{opacity:0;visibility:hidden} }
'''
Path('brand').mkdir(exist_ok=True)
Path('brand/rootflow-splash.css').write_text(splash_css, encoding='utf-8')


# app.js — lock account-editor background/pinch gestures and expose hard delete.
path = Path('app.js')
text = path.read_text(encoding='utf-8')
text = replace_once(
    text,
    '''  function Sheet(props) {\n    React.useEffect(function () {\n      function key(event) { if (event.key === 'Escape') props.onClose(); }\n      document.addEventListener('keydown', key);\n      return function () { document.removeEventListener('keydown', key); };\n    }, [props.onClose]);\n    return h('div', { className: 'sheet-backdrop', onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },''',
    '''  function Sheet(props) {\n    React.useEffect(function () {\n      function key(event) { if (event.key === 'Escape') props.onClose(); }\n      function blockGesture(event) { event.preventDefault(); }\n      function blockMultiTouch(event) { if (event.touches && event.touches.length > 1) event.preventDefault(); }\n      document.addEventListener('keydown', key);\n      document.body.classList.add('sheet-open');\n      if (props.lockGestures) {\n        document.addEventListener('gesturestart', blockGesture, { passive: false });\n        document.addEventListener('gesturechange', blockGesture, { passive: false });\n        document.addEventListener('touchmove', blockMultiTouch, { passive: false });\n      }\n      return function () {\n        document.removeEventListener('keydown', key);\n        document.body.classList.remove('sheet-open');\n        if (props.lockGestures) {\n          document.removeEventListener('gesturestart', blockGesture, { passive: false });\n          document.removeEventListener('gesturechange', blockGesture, { passive: false });\n          document.removeEventListener('touchmove', blockMultiTouch, { passive: false });\n        }\n      };\n    }, [props.onClose, props.lockGestures]);\n    return h('div', { className: 'sheet-backdrop' + (props.lockGestures ? ' gesture-locked' : ''), onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },''',
    'Sheet gesture lock'
)
text = replace_once(
    text,
    '''      h('button', { type: 'button', className: 'primary-button', onClick: save }, account ? 'Lưu thay đổi' : 'Lưu tài khoản'),\n      account ? h('button', { type: 'button', className: form.archived ? 'secondary-button account-archive' : 'danger-button account-archive', onClick: function () { set('archived', !form.archived); } }, form.archived ? 'Khôi phục tài khoản' : 'Ngừng theo dõi tài khoản') : null,\n      account ? h('p', { className: 'archive-help' }, form.archived ? 'Tài khoản sẽ trở lại các báo cáo sau khi lưu.' : 'Chỉ có thể lưu trữ khi số dư hiện tại bằng 0; lịch sử vẫn được giữ nguyên.') : null);''',
    '''      h('button', { type: 'button', className: 'primary-button', onClick: save }, account ? 'Lưu thay đổi' : 'Lưu tài khoản'),\n      account ? h('button', { type: 'button', className: 'secondary-button account-archive', onClick: function () { set('archived', !form.archived); } }, form.archived ? 'Khôi phục tài khoản' : 'Ngừng theo dõi tài khoản') : null,\n      account && props.onDelete ? h('button', { type: 'button', className: 'danger-button account-delete', onClick: function () { props.onDelete(account); } }, 'Xóa tài khoản') : null,\n      account ? h('p', { className: 'archive-help' }, form.archived ? 'Tài khoản sẽ trở lại các báo cáo sau khi lưu.' : 'Ngừng theo dõi chỉ ẩn tài khoản và giữ lịch sử. Xóa tài khoản sẽ xóa vĩnh viễn tài khoản cùng dữ liệu liên quan.') : null);''',
    'AccountForm delete action'
)
text = replace_once(
    text,
    '''    function counterparty(next, name) {''',
    '''    function deleteAccount(account) {\n      if (!account) return;\n      var ownedContractIds = data.contracts.filter(function (row) { return row.accountId === account.id; }).map(function (row) { return row.id; });\n      var linkedFlowCount = data.flows.filter(function (flow) {\n        return flow && !flow.deletedAt && (flow.accountId === account.id || flow.counterAccountId === account.id || ownedContractIds.indexOf(flow.contractId) >= 0);\n      }).length;\n      var warning = 'Xóa vĩnh viễn “' + (account.name || 'tài khoản') + '”?';\n      if (linkedFlowCount) warning += '\\n\\n' + linkedFlowCount + ' giao dịch liên quan và hợp đồng/sao kê gắn với tài khoản cũng sẽ bị xóa.';\n      warning += '\\n\\nKhông thể hoàn tác. Hãy xuất backup trước nếu cần giữ lại lịch sử.';\n      if (!global.confirm(warning)) return;\n      commit(function (next) {\n        var contractIds = next.contracts.filter(function (row) { return row.accountId === account.id; }).map(function (row) { return row.id; });\n        next.flows = next.flows.filter(function (flow) {\n          return flow.accountId !== account.id && flow.counterAccountId !== account.id && contractIds.indexOf(flow.contractId) < 0;\n        });\n        next.contracts = next.contracts.filter(function (row) { return row.accountId !== account.id; });\n        next.contracts.forEach(function (row) {\n          var changed = false;\n          if (contractIds.indexOf(row.fundingContractId) >= 0) {\n            row.fundingContractId = null;\n            if (row.fundingSource === 'borrowed') row.fundingSource = 'mixed';\n            changed = true;\n          }\n          if (row.settlementAccountId === account.id) { row.settlementAccountId = ''; changed = true; }\n          if (Array.isArray(row.fundingAllocations)) {\n            var before = row.fundingAllocations.length;\n            row.fundingAllocations = row.fundingAllocations.filter(function (allocation) {\n              return allocation && allocation.accountId !== account.id && contractIds.indexOf(allocation.contractId) < 0;\n            });\n            if (row.fundingAllocations.length !== before) changed = true;\n          }\n          if (changed) row.updatedAt = S.now();\n        });\n        next.statements = next.statements.filter(function (row) { return row.creditCardAccountId !== account.id; });\n        next.nonCashEvents = next.nonCashEvents.filter(function (row) { return row.accountId !== account.id && contractIds.indexOf(row.contractId) < 0; });\n        next.scenarios = next.scenarios.filter(function (row) { return row.accountId !== account.id && row.counterAccountId !== account.id; });\n        next.recurringIncomes = next.recurringIncomes.map(function (income) {\n          if (income.accountId !== account.id && income.settlementAccountId !== account.id) return income;\n          var copy = Object.assign({}, income);\n          if (copy.accountId === account.id) copy.accountId = '';\n          if (copy.settlementAccountId === account.id) copy.settlementAccountId = '';\n          copy.updatedAt = S.now();\n          return copy;\n        });\n        next.accounts = next.accounts.filter(function (row) { return row.id !== account.id; });\n      }, 'Đã xóa vĩnh viễn tài khoản và dữ liệu liên quan.');\n      setEditingAccount(null);\n      setOverlay('accounts');\n    }\n    function counterparty(next, name) {''',
    'deleteAccount controller'
)
text = replace_once(
    text,
    '''      overlay === 'account' ? h(Sheet, { title: editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản', onClose: function () { setEditingAccount(null); setOverlay('accounts'); } }, h(AccountForm, {''',
    '''      overlay === 'account' ? h(Sheet, { title: editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản', onClose: function () { setEditingAccount(null); setOverlay('accounts'); }, lockGestures: true }, h(AccountForm, {''',
    'account Sheet lockGestures prop'
)
text = replace_once(
    text,
    '''        liquidAccounts: derived.liquidAccounts, payableContracts: data.contracts.filter(function (row) { return row.type === 'payable' && row.status !== 'closed'; }), onSave: saveAccount\n      })) : null,''',
    '''        liquidAccounts: derived.liquidAccounts, payableContracts: data.contracts.filter(function (row) { return row.type === 'payable' && row.status !== 'closed'; }), onSave: saveAccount, onDelete: deleteAccount\n      })) : null,''',
    'AccountForm onDelete prop'
)
path.write_text(text, encoding='utf-8')


# styles.css — prevent background drift and pinch zoom only while account form is open.
path = Path('styles.css')
text = path.read_text(encoding='utf-8')
marker = '''\n/* Account editor gesture + destructive-action controls. */\nbody.sheet-open { overflow:hidden;overscroll-behavior:none; }\n.sheet-backdrop.gesture-locked { touch-action:pan-y;overscroll-behavior:none; }\n.sheet-backdrop.gesture-locked .sheet { touch-action:pan-y;overscroll-behavior:contain; }\n.account-delete { margin-top:10px; }\n'''
if 'Account editor gesture + destructive-action controls' in text:
    raise SystemExit('styles gesture marker already present')
text = text.rstrip() + marker + '\n'
path.write_text(text, encoding='utf-8')


# sw.js — cache the restored splash and force PWA refresh.
path = Path('sw.js')
text = path.read_text(encoding='utf-8')
text = replace_once(text, "var CACHE = 'rootflow-cache-2026-09-08-backup-controls';", "var CACHE = 'rootflow-cache-2026-09-09-splash-delete-gesture';", 'service worker cache name')
text = replace_once(text, "  './capital.css',\n  './domain.js',", "  './capital.css',\n  './brand/rootflow-splash.css',\n  './domain.js',", 'service worker splash asset')
text = replace_once(text, "index\\.html|styles\\.css|capital\\.css|app\\.js", "index\\.html|styles\\.css|capital\\.css|rootflow-splash\\.css|app\\.js", 'service worker core asset')
path.write_text(text, encoding='utf-8')


# UI contracts — splash is now a deliberate canonical startup layer.
path = Path('tests/run-ui-contract-tests.js')
text = path.read_text(encoding='utf-8')
text = replace_once(text, "const sw = read('sw.js');", "const sw = read('sw.js');\nconst splashCss = read('brand/rootflow-splash.css');", 'UI test splash CSS read')
text = replace_once(
    text,
    "assert(!index.includes('opening-splash') && !index.includes('splash-active'), 'runtime must open directly without the legacy animated splash');",
    "assert(index.includes('opening-splash') && index.includes('splash-active') && index.includes('brand/rootflow-splash.css'), 'runtime must restore the deliberate Rootflow opening splash');\nassert(index.includes('© 2026') && index.includes('@derekdaydoi'), 'opening splash must expose copyright ownership');\nassert(splashCss.includes('prefers-reduced-motion:reduce'), 'opening splash must respect reduced-motion preference');",
    'UI splash contract'
)
text = replace_once(
    text,
    "assert(app.includes(\"'Xuất backup'\") && app.includes(\"'Nhập backup'\"), 'settings/data sheet must expose export and import backup controls');",
    "assert(app.includes(\"'Xuất backup'\") && app.includes(\"'Nhập backup'\"), 'settings/data sheet must expose export and import backup controls');\nassert(app.includes(\"'Xóa tài khoản'\") && app.includes('function deleteAccount(account)'), 'account editor must expose hard delete in addition to archive');\nassert(app.includes('lockGestures: true') && app.includes('gesturestart'), 'account editor must lock background/pinch gestures without changing the global viewport');",
    'UI delete gesture contracts'
)
text = replace_once(
    text,
    "assert(!sw.includes('effects.css') && !sw.includes('compat.js') && !sw.includes('store-adapter.js'), 'service worker must cache only the canonical runtime');",
    "assert(!sw.includes('effects.css') && !sw.includes('compat.js') && !sw.includes('store-adapter.js'), 'service worker must cache only the canonical runtime');\nassert(sw.includes(\"'./brand/rootflow-splash.css'\"), 'service worker must cache the restored splash stylesheet');",
    'UI SW splash contract'
)
path.write_text(text, encoding='utf-8')


# Account editor contracts — explicit gesture containment and hard-delete cascade.
path = Path('tests/run-account-editor-tests.js')
text = path.read_text(encoding='utf-8')
text = replace_once(
    text,
    "assert(app.includes(\"editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'\"), 'account sheet must preserve edit/add semantics');",
    "assert(app.includes(\"editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'\"), 'account sheet must preserve edit/add semantics');\nassert(app.includes('lockGestures: true') && app.includes('blockMultiTouch'), 'account sheet must prevent pinch/background drift while preserving single-finger form scroll');\nassert(app.includes('function deleteAccount(account)') && app.includes(\"'Xóa tài khoản'\"), 'account editor must expose hard delete');\nassert(app.includes('next.flows = next.flows.filter') && app.includes('next.statements = next.statements.filter') && app.includes('next.accounts = next.accounts.filter'), 'hard delete must cascade owned records instead of leaving dangling references');",
    'account editor hard delete contracts'
)
text = replace_once(
    text,
    "assert(css.includes('dvh'), 'viewport-sensitive UI must use dynamic viewport units');",
    "assert(css.includes('dvh'), 'viewport-sensitive UI must use dynamic viewport units');\nassert(css.includes('.sheet-backdrop.gesture-locked') && css.includes('body.sheet-open'), 'account sheet must contain gestures and background scrolling');",
    'account editor gesture CSS contract'
)
path.write_text(text, encoding='utf-8')

# Delete this staging script from the source commit produced by Actions.
Path(__file__).unlink()
