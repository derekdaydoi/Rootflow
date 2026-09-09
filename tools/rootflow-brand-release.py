from pathlib import Path
import base64
import json
import re

ROOT = Path('.')
BRAND = ROOT / 'brand'


def must_replace(text, old, new, label):
    if old not in text:
        raise SystemExit('patch target missing: ' + label)
    return text.replace(old, new, 1)


def decode_mark():
    parts = [BRAND / '.rootflow-mark.b64.00', BRAND / '.rootflow-mark.b64.01', BRAND / '.rootflow-mark.b64.02']
    if not all(p.exists() for p in parts):
        raise SystemExit('staged Rootflow mark chunks are missing')
    raw_b64 = ''.join(p.read_text(encoding='utf-8') for p in parts)
    raw = base64.b64decode(''.join(raw_b64.split()), validate=True)
    if raw[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit('runtime mark is not a PNG')
    (BRAND / 'rootflow-mark.png').write_bytes(raw)


def build_icon():
    from PIL import Image
    mark = Image.open(BRAND / 'rootflow-mark.png').convert('RGBA')
    if mark.size != (512, 512):
        raise SystemExit(f'bad runtime mark size: {mark.size}')
    bbox = mark.getchannel('A').getbbox()
    if not bbox:
        raise SystemExit('runtime mark has no visible content')
    subject = mark.crop(bbox)
    target_h = 456
    target_w = round(subject.width * target_h / subject.height)
    subject = subject.resize((target_w, target_h), Image.Resampling.LANCZOS)
    icon = Image.new('RGBA', (512, 512), (186, 255, 156, 255))
    icon.alpha_composite(subject, ((512 - target_w) // 2, (512 - target_h) // 2))
    icon.convert('RGB').save(BRAND / 'rootflow-icon.png', optimize=True)
    check = Image.open(BRAND / 'rootflow-icon.png')
    if check.size != (512, 512):
        raise SystemExit('bad install icon size')


def write_brand_spec():
    (ROOT / 'BRAND_SPEC.md').write_text('''# Rootflow brand specification

## Identity

Rootflow uses the approved cash-jar warning mark from the supplied master artwork.

- Deep green `#0F6B45` — primary action and text accent
- Launch green `#BAFF9C` — launch and homescreen background
- White / warm neutral — product surfaces

## Brand assets

Runtime and install assets are deliberately separated, following the stable Rootwork pattern:

- `brand/rootflow-mark.png` — transparent 512×512 runtime mark for the opening screen. No background, replacement SVG, WebP wrapper, CSS image hack, blur, glow, or drop-shadow.
- `brand/rootflow-icon.png` — 512×512 homescreen/PWA icon with the canonical launch-green background and enlarged artwork.

Do not use the homescreen icon as the runtime splash mark.

## Launch motion

The opening screen is present in the initial HTML first paint and React owns the same splash state after mount. Motion is restrained: mark fade/translate, tagline fade, and a short progress bar. No bounce, halo burst, morph, blur, or scale overshoot.

## Copyright

`Rootflow`, the approved brand mark and this product identity are © 2026 derekdaydoi. All rights reserved.
''', encoding='utf-8')


def write_index():
    (ROOT / 'index.html').write_text('''<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover,interactive-widget=resizes-content">
  <script>
    (function () {
      var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
      if (standalone) document.documentElement.classList.add('standalone-pwa');
      function blockViewportGesture(event) { event.preventDefault(); }
      document.addEventListener('gesturestart', blockViewportGesture, { passive: false });
      document.addEventListener('gesturechange', blockViewportGesture, { passive: false });
      document.addEventListener('gestureend', blockViewportGesture, { passive: false });
      document.addEventListener('touchmove', function (event) {
        if (event.touches && event.touches.length > 1) event.preventDefault();
      }, { passive: false });
    })();
  </script>
  <meta name="theme-color" content="#0F6B45">
  <meta name="color-scheme" content="light">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Rootflow">
  <meta name="description" content="Rootflow — hệ thống điều hành vốn và dòng tiền cá nhân.">
  <title>Rootflow — Vốn & Dòng tiền</title>
  <link rel="preload" as="image" href="brand/rootflow-mark.png?v=20260909-brand-r3" type="image/png">
  <link rel="icon" href="brand/rootflow-icon.png?v=20260909-brand-r3" type="image/png">
  <link rel="apple-touch-icon" href="brand/rootflow-icon.png?v=20260909-brand-r3">
  <link rel="manifest" href="manifest.json?v=20260909-brand-r3">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="capital.css">
  <link rel="stylesheet" href="brand/rootflow-theme.css">
  <link rel="stylesheet" href="brand/rootflow-splash.css?v=20260909-brand-r3">
</head>
<body>
  <div id="root">
    <div class="splash" role="status" aria-label="Rootflow đang khởi động">
      <div class="splash-ring splash-ring-a" aria-hidden="true"></div>
      <div class="splash-ring splash-ring-b" aria-hidden="true"></div>
      <div class="splash-lock">
        <img src="brand/rootflow-mark.png?v=20260909-brand-r3" alt="" class="splash-logo" draggable="false" aria-hidden="true">
        <strong class="splash-tagline">Rootflow - Nơi dòng tiền được quản trị theo hệ thống</strong>
        <div class="splash-loader" aria-hidden="true"><span><i></i></span></div>
      </div>
      <small class="splash-copyright">© 2026 derekdaydoi. All rights reserved.</small>
    </div>
  </div>
  <noscript><div class="boot">Rootflow cần JavaScript để chạy.</div></noscript>
  <script src="vendor/react.production.min.js"></script>
  <script src="vendor/react-dom.production.min.js"></script>
  <script src="domain.js"></script>
  <script src="cashflow-domain.js"></script>
  <script src="capital-domain.js"></script>
  <script src="operating-policy.js"></script>
  <script src="store.js"></script>
  <script src="selftest.js"></script>
  <script src="capital-ui.js"></script>
  <script src="app.js"></script>
</body>
</html>
''', encoding='utf-8')


def write_manifest():
    obj = {
        'name': 'Rootflow',
        'short_name': 'Rootflow',
        'description': 'Hệ thống điều hành vốn và dòng tiền cá nhân — biết cần giữ bao nhiêu, có thể dùng bao nhiêu và vốn đang ở đâu.',
        'start_url': './',
        'scope': './',
        'id': './',
        'display': 'standalone',
        'orientation': 'portrait',
        'background_color': '#BAFF9C',
        'theme_color': '#0F6B45',
        'categories': ['finance', 'productivity'],
        'lang': 'vi',
        'dir': 'ltr',
        'icons': [
            {'src': 'brand/rootflow-icon.png?v=20260909-brand-r3', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}
        ]
    }
    (ROOT / 'manifest.json').write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def write_splash_css():
    (BRAND / 'rootflow-splash.css').write_text('''/* Rootflow opening — Rootwork architecture: runtime mark != install icon. */
html:has(.splash),body:has(.splash){overflow:hidden;overscroll-behavior:none}
.splash{--rf-launch-bg:#baff9c;--rf-launch-ink:#123326;--rf-launch-green:#0f6b45;pointer-events:none;position:fixed;z-index:1000;inset:0;min-width:320px;display:grid;place-items:center;overflow:hidden;background:var(--rf-launch-bg)}
.splash-lock{position:relative;z-index:2;width:min(88vw,430px);display:grid;justify-items:center;text-align:center;transform:translateY(-2vh)}
.splash-logo{display:block;width:min(76vw,320px);height:auto;max-height:48vh;object-fit:contain;-webkit-user-drag:none;user-select:none;opacity:0;transform:translateY(8px);animation:rf-mark-in .45s .05s ease-out forwards}
.splash-tagline{max-width:380px;margin-top:8px;color:var(--rf-launch-ink);font-size:clamp(17px,4.7vw,21px);font-weight:700;line-height:1.38;letter-spacing:-.022em;text-wrap:balance;opacity:0;transform:translateY(7px);animation:rf-copy-in .4s .34s ease-out forwards}
.splash-loader{width:144px;margin-top:18px;opacity:0;animation:rf-copy-in .25s .55s ease-out forwards}
.splash-loader span{display:block;height:4px;overflow:hidden;border-radius:999px;background:rgba(15,107,69,.16)}
.splash-loader i{display:block;width:100%;height:100%;border-radius:inherit;background:var(--rf-launch-green);transform:translateX(-100%);animation:rf-progress 1.35s .5s cubic-bezier(.25,.7,.25,1) forwards}
.splash-copyright{position:absolute;z-index:2;left:20px;right:20px;bottom:calc(26px + env(safe-area-inset-bottom,0px));text-align:center;color:rgba(18,51,38,.62);font-size:11px;font-weight:500;line-height:1.35;letter-spacing:.008em;opacity:0;animation:rf-copy-in .35s .62s ease-out forwards}
.splash-ring{position:absolute;left:50%;top:45%;aspect-ratio:1;border:1px solid rgba(15,107,69,.105);border-radius:50%;transform:translate(-50%,-50%)}
.splash-ring-a{width:min(92vw,430px)}.splash-ring-b{width:min(126vw,590px);border-color:rgba(15,107,69,.07)}
@keyframes rf-mark-in{to{opacity:1;transform:translateY(0)}}
@keyframes rf-copy-in{to{opacity:1;transform:translateY(0)}}
@keyframes rf-progress{to{transform:translateX(0)}}
@media(max-width:420px){.splash-logo{width:min(80vw,306px)}.splash-tagline{padding:0 10px}}
@media(prefers-reduced-motion:reduce){.splash-logo,.splash-tagline,.splash-loader,.splash-copyright,.splash-loader i{animation:none!important;opacity:1!important;transform:none!important}}
''', encoding='utf-8')


def write_sw():
    (ROOT / 'sw.js').write_text('''/* Rootflow service worker. */
var CACHE='rootflow-ui-2026-09-09-brand-r3';
var ASSETS=['./','./index.html','./styles.css','./capital.css','./brand/rootflow-theme.css','./brand/rootflow-splash.css?v=20260909-brand-r3','./brand/rootflow-mark.png?v=20260909-brand-r3','./brand/rootflow-icon.png?v=20260909-brand-r3','./operating-policy.js','./domain.js','./cashflow-domain.js','./capital-domain.js','./store.js','./selftest.js','./capital-ui.js','./app.js','./manifest.json?v=20260909-brand-r3','./vendor/react.production.min.js','./vendor/react-dom.production.min.js'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function ok(r){return r&&r.ok&&r.type==='basic'}
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);if(u.origin!==location.origin)return;if(r.mode==='navigate'){e.respondWith(fetch(r).then(function(x){if(ok(x)){var y=x.clone();caches.open(CACHE).then(function(c){c.put('./index.html',y)})}return x}).catch(function(){return caches.match('./index.html')}));return}e.respondWith(caches.match(r).then(function(cached){if(cached)return cached;return fetch(r).then(function(x){if(ok(x)){var y=x.clone();caches.open(CACHE).then(function(c){c.put(r,y)})}return x})}))});
''', encoding='utf-8')


def patch_app():
    path = ROOT / 'app.js'
    app = path.read_text(encoding='utf-8')
    if 'function Splash() {' not in app:
        splash_fn = """
  function Splash() {
    return h('div', { className: 'splash', role: 'status', 'aria-label': 'Rootflow đang khởi động' },
      h('div', { className: 'splash-ring splash-ring-a', 'aria-hidden': 'true' }),
      h('div', { className: 'splash-ring splash-ring-b', 'aria-hidden': 'true' }),
      h('div', { className: 'splash-lock' },
        h('img', { src: 'brand/rootflow-mark.png?v=20260909-brand-r3', alt: '', className: 'splash-logo', draggable: false, 'aria-hidden': 'true' }),
        h('strong', { className: 'splash-tagline' }, 'Rootflow - Nơi dòng tiền được quản trị theo hệ thống'),
        h('div', { className: 'splash-loader', 'aria-hidden': 'true' }, h('span', null, h('i')))),
      h('small', { className: 'splash-copyright' }, '© 2026 derekdaydoi. All rights reserved.'));
  }

"""
        app = must_replace(app, '  function App() {\n', splash_fn + '  function App() {\n', 'Splash component')
    if 'var launchState = React.useState(true)' not in app:
        app = must_replace(app,
            "    var toastState = React.useState(loaded.error || ''), toast = toastState[0], setToast = toastState[1];\n\n    React.useEffect(function () { S.persist(); }, []);",
            "    var toastState = React.useState(loaded.error || ''), toast = toastState[0], setToast = toastState[1];\n    var launchState = React.useState(true), launch = launchState[0], setLaunch = launchState[1];\n\n    React.useEffect(function () { S.persist(); }, []);\n    React.useEffect(function () { var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; var t = setTimeout(function () { setLaunch(false); }, reduced ? 700 : 1900); return function () { clearTimeout(t); }; }, []);",
            'launch state')
    if "return h(React.Fragment, null,\n      launch ? h(Splash) : null," not in app:
        app = must_replace(app,
            "    return h('div', { className: 'app' }, screen,\n",
            "    return h(React.Fragment, null,\n      launch ? h(Splash) : null,\n      h('div', { className: 'app' }, screen,\n",
            'app return prefix')
        app = must_replace(app,
            "      toast ? h('div', { className: 'toast', role: 'status' }, toast) : null);\n  }",
            "      toast ? h('div', { className: 'toast', role: 'status' }, toast) : null));\n  }",
            'app return suffix')
    path.write_text(app, encoding='utf-8')


def patch_tests():
    path = ROOT / 'tests' / 'run-ui-contract-tests.js'
    test = path.read_text(encoding='utf-8')
    test = re.sub(
        r"const touchIcon = fs\.readFileSync\(path\.join\(__dirname, '\.\.', 'rootflow-touch-180-v2\.png'\)\);\nconst icon192 = fs\.readFileSync\(path\.join\(__dirname, '\.\.', 'rootflow-icon-192-v2\.png'\)\);\nconst icon512 = fs\.readFileSync\(path\.join\(__dirname, '\.\.', 'rootflow-icon-512-v2\.png'\)\);",
        "const runtimeMark = fs.readFileSync(path.join(__dirname, '..', 'brand/rootflow-mark.png'));\nconst installIcon = fs.readFileSync(path.join(__dirname, '..', 'brand/rootflow-icon.png'));",
        test,
        count=1,
    )
    start = test.find("assert(index.includes('opening-splash')")
    end_marker = "assert(splashCss.includes('prefers-reduced-motion:reduce'), 'opening splash must respect reduced-motion preference');"
    end = test.find(end_marker)
    if start < 0 or end < 0:
        raise SystemExit('brand assertion block missing')
    end += len(end_marker)
    replacement = """assert(index.includes('class=\"splash\"') && index.includes('brand/rootflow-splash.css'), 'initial HTML must paint the Rootwork-style Rootflow splash before React');
assert(index.includes('brand/rootflow-mark.png?v=20260909-brand-r3'), 'runtime splash must use the transparent canonical mark');
assert(index.includes('brand/rootflow-icon.png?v=20260909-brand-r3'), 'browser and iOS homescreen metadata must use the canonical install icon');
assert(index.includes('© 2026 derekdaydoi. All rights reserved.'), 'opening splash must expose standard copyright ownership');
[runtimeMark, installIcon].forEach((icon) => assert(icon.length > 1000 && icon.slice(0, 8).toString('hex') === '89504e470d0a1a0a', 'canonical brand assets must be real PNG binaries'));
assert(manifest.includes('brand/rootflow-icon.png') && manifest.includes('512x512') && manifest.includes('any maskable'), 'web app manifest must use one canonical Rootflow install icon');
assert(splashCss.includes('prefers-reduced-motion:reduce'), 'opening splash must respect reduced-motion preference');
assert(app.includes('function Splash()') && app.includes('var launchState = React.useState(true)') && app.includes('setLaunch(false)'), 'React must own the splash lifecycle after first paint');"""
    test = test[:start] + replacement + test[end:]
    old_sw_start = test.find("assert(sw.includes(\"'./brand/rootflow-splash.css'\")")
    old_sw_end_marker = "assert(sw.includes('rootflow-touch-180-v2\\\\.png') && sw.includes('rootflow-icon-192-v2\\\\.png') && sw.includes('rootflow-icon-512-v2\\\\.png'), 'homescreen icon assets must use network-first refresh policy');"
    old_sw_end = test.find(old_sw_end_marker)
    if old_sw_start >= 0 and old_sw_end >= 0:
        old_sw_end += len(old_sw_end_marker)
        sw_repl = """assert(sw.includes('brand/rootflow-splash.css') && sw.includes('brand/rootflow-mark.png') && sw.includes('brand/rootflow-icon.png') && sw.includes('operating-policy.js'), 'service worker must cache the canonical opening mark, install icon and operating policy');
assert(sw.includes('rootflow-ui-2026-09-09-brand-r3'), 'service worker cache version must refresh the Rootwork-style brand release');"""
        test = test[:old_sw_start] + sw_repl + test[old_sw_end:]
    else:
        lines = []
        for line in test.splitlines():
            if any(token in line for token in ['rootflow-opening-logo.webp', 'rootflow-icon-512-v2\\.png', 'rootflow-touch-180-v2\\.png', 'green-logo-v7-valid-png-splash']):
                continue
            lines.append(line)
        test = '\n'.join(lines) + '\n'
        anchor = "assert(!sw.includes('effects.css') && !sw.includes('compat.js') && !sw.includes('store-adapter.js'), 'service worker must cache only the canonical runtime');"
        addition = "\nassert(sw.includes('brand/rootflow-splash.css') && sw.includes('brand/rootflow-mark.png') && sw.includes('brand/rootflow-icon.png') && sw.includes('operating-policy.js'), 'service worker must cache the canonical opening mark, install icon and operating policy');\nassert(sw.includes('rootflow-ui-2026-09-09-brand-r3'), 'service worker cache version must refresh the Rootwork-style brand release');"
        if anchor in test:
            test = test.replace(anchor, anchor + addition, 1)
    path.write_text(test, encoding='utf-8')


def cleanup_old_assets():
    for name in [
        'rootflow-touch-180-v2.png','rootflow-icon-192-v2.png','rootflow-icon-512-v2.png',
        'rootflow-icon-192.png','rootflow-icon-512.png','rootflow-touch-180.png'
    ]:
        p = ROOT / name
        if p.exists():
            p.unlink()
    for name in ['.rootflow-mark.b64.00','.rootflow-mark.b64.01','.rootflow-mark.b64.02','rootflow-mark.base64','.brand-r2-source.txt']:
        p = BRAND / name
        if p.exists():
            p.unlink()


def main():
    decode_mark()
    build_icon()
    write_brand_spec()
    write_index()
    write_manifest()
    write_splash_css()
    write_sw()
    patch_app()
    patch_tests()
    cleanup_old_assets()


if __name__ == '__main__':
    main()
