from pathlib import Path
import base64
import re

root = Path('.')

# Decode the user-provided logo into a runtime asset.
b64_path = root / 'tools/rootflow-opening-logo.b64'
logo_path = root / 'brand/rootflow-opening-logo.png'
logo_path.write_bytes(base64.b64decode(b64_path.read_text().strip()))

# Opening splash: use the supplied logo verbatim, then reveal the text.
index = (root / 'index.html').read_text()
index = index.replace('<meta name="theme-color" content="#FFFFFF">', '<meta name="theme-color" content="#B7FF9E">')
index = re.sub(
    r'  <div id="opening-splash" class="opening-splash" aria-hidden="true">.*?  <div id="root">',
    '''  <div id="opening-splash" class="opening-splash" aria-hidden="true">\n    <div class="splash-orbit splash-orbit-a"></div>\n    <div class="splash-orbit splash-orbit-b"></div>\n    <div class="splash-lockup">\n      <div class="splash-logo-frame">\n        <img class="splash-logo" src="brand/rootflow-opening-logo.png" alt="" aria-hidden="true">\n      </div>\n      <div class="splash-copy">\n        <div class="splash-tagline">Rootflow - Nơi dòng tiền được quản trị theo hệ thống</div>\n        <div class="splash-copyright">(c) Copyright from derekdaydoi</div>\n      </div>\n    </div>\n  </div>\n  <div id="root">''',
    index,
    flags=re.S,
)
if '<script src="operating-policy.js"></script>' not in index:
    index = index.replace('  <script src="capital-domain.js"></script>\n', '  <script src="capital-domain.js"></script>\n  <script src="operating-policy.js"></script>\n')
if '<link rel="stylesheet" href="brand/rootflow-theme.css">' not in index:
    index = index.replace('  <link rel="stylesheet" href="capital.css">\n', '  <link rel="stylesheet" href="capital.css">\n  <link rel="stylesheet" href="brand/rootflow-theme.css">\n')
index = index.replace('reduced ? 650 : 3850', 'reduced ? 900 : 4300')
(root / 'index.html').write_text(index)

splash_css = r'''/* Rootflow opening — palette derived from the supplied logo. */
body.splash-active{overflow:hidden}
.opening-splash{
  --logo-mint:#b7ff9e;
  --logo-green:#59cf24;
  --logo-deep:#24106d;
  --logo-cream:#f5eadb;
  --logo-red:#e84043;
  pointer-events:none;position:fixed;z-index:1000;inset:0;min-width:320px;display:grid;place-items:center;overflow:hidden;
  background:var(--logo-mint);
  animation:rf-splash-screen 4.25s cubic-bezier(.22,.72,.25,1) both;
}
.opening-splash::before{
  content:"";position:absolute;inset:-18%;background:
  radial-gradient(circle at 50% 38%,rgba(245,234,219,.82) 0 11%,rgba(245,234,219,0) 38%),
  radial-gradient(circle at 50% 50%,rgba(89,207,36,.22),rgba(89,207,36,0) 50%);
  animation:rf-bg-breathe 3.1s ease-out both;
}
.splash-lockup{position:relative;z-index:2;width:min(86vw,440px);display:grid;justify-items:center;transform:translateY(-2vh)}
.splash-logo-frame{width:min(68vw,300px);aspect-ratio:1;display:grid;place-items:center;border-radius:34px;overflow:hidden;box-shadow:0 24px 70px rgba(36,16,109,.13);animation:rf-logo-enter 1.05s .12s cubic-bezier(.16,.9,.22,1.08) both}
.splash-logo{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.015)}
.splash-copy{display:grid;justify-items:center;max-width:360px;margin-top:22px;text-align:center}
.splash-tagline{opacity:0;color:var(--logo-deep);font-size:clamp(17px,4.7vw,21px);font-weight:750;line-height:1.35;letter-spacing:-.025em;text-wrap:balance;transform:translateY(10px);animation:rf-copy-enter .66s 1.48s cubic-bezier(.2,.82,.25,1) forwards}
.splash-copyright{opacity:0;margin-top:11px;color:rgba(36,16,109,.68);font-size:11px;font-weight:600;line-height:1.3;letter-spacing:.01em;transform:translateY(7px);animation:rf-copy-enter .56s 1.9s cubic-bezier(.2,.82,.25,1) forwards}
.splash-orbit{position:absolute;border:2px solid rgba(36,16,109,.10);border-radius:50%;opacity:0}
.splash-orbit-a{width:min(78vw,390px);aspect-ratio:1;animation:rf-orbit 1.65s .72s ease-out both}
.splash-orbit-b{width:min(94vw,520px);aspect-ratio:1;animation:rf-orbit 1.9s .92s ease-out both}
@keyframes rf-logo-enter{0%{opacity:0;transform:translateY(18px) scale(.78);filter:blur(7px)}58%{opacity:1;transform:translateY(-3px) scale(1.025);filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
@keyframes rf-copy-enter{to{opacity:1;transform:translateY(0)}}
@keyframes rf-orbit{0%{opacity:0;transform:scale(.72)}35%{opacity:.68}100%{opacity:0;transform:scale(1.12)}}
@keyframes rf-bg-breathe{0%{transform:scale(.92);opacity:.55}100%{transform:scale(1.06);opacity:1}}
@keyframes rf-splash-screen{0%{opacity:0}4%{opacity:1}89%{opacity:1}100%{opacity:0;visibility:hidden}}
@media(max-width:420px){.splash-logo-frame{width:min(72vw,286px);border-radius:30px}.splash-copy{margin-top:18px;padding:0 8px}}
@media(prefers-reduced-motion:reduce){.opening-splash{animation:rf-splash-screen-reduced .9s linear both}.opening-splash::before,.splash-logo-frame,.splash-tagline,.splash-copyright,.splash-orbit{animation:none!important;opacity:1!important;transform:none!important;filter:none!important}.splash-orbit{display:none}}
@keyframes rf-splash-screen-reduced{0%,78%{opacity:1}100%{opacity:0;visibility:hidden}}
'''
(root / 'brand/rootflow-splash.css').write_text(splash_css)

theme_css = r'''/* Rootflow logo-derived application theme. Keep secondary copy restrained. */
:root{
  --rf-green:#4dbd22;
  --rf-green-deep:#24106d;
  --rf-green-accent:#59cf24;
  --rf-green-soft:#e8ffdc;
  --rf-bg:#f6f4ed;
  --rf-surface:#fffdf8;
  --rf-ink:#201646;
  --rf-muted:#716a83;
  --rf-line:#e8e3ef;
  --rf-danger:#d63f45;
  --rf-danger-soft:#fff0ef;
  --rf-warn:#9a641f;
  --rf-warn-soft:#fff5df;
  --rf-shadow:0 2px 10px rgba(36,16,109,.045);
}
html,body,.page{background:var(--rf-bg)}
.rf-available-hero{background:linear-gradient(145deg,#24106d,#38208a 72%,#4a2ba0);box-shadow:0 12px 34px rgba(36,16,109,.16)}
.rf-card-icon,.rf-position-mark{background:var(--rf-green-soft);color:var(--rf-green-deep)}
.rf-segmented button.on,.rf-capital-tabs button.on{background:var(--rf-green-deep);color:#fff;box-shadow:0 4px 14px rgba(36,16,109,.16)}
.rf-chart-confirmed{stroke:#d63f45}.rf-chart-expected{stroke:#59cf24;opacity:.82}
.rf-home-intro>p,.rf-section-note{display:none!important}
.rf-status-line small{max-width:42rem}
'''
(root / 'brand/rootflow-theme.css').write_text(theme_css)

# Copy changes: base case is the operating view; stress means delayed collections, not vanished income.
ui_path = root / 'capital-ui.js'
ui = ui_path.read_text()
replacements = {
    "if (status === 'SHORTFALL') return { cls: 'danger', label: 'Thiếu thanh khoản', note: 'Dòng tiền chắc chắn tạo funding gap nếu không bổ sung tiền.' };": "if (status === 'SHORTFALL') return { cls: 'danger', label: 'Base case thiếu thanh khoản', note: 'Lịch tiền vào/ra hiện tại tạo funding gap trong kịch bản vận hành cơ sở.' };",
    "if (status === 'THIN_BUFFER') return { cls: 'warn', label: 'Buffer còn mỏng', note: 'Đủ nghĩa vụ tối thiểu nhưng chưa đạt mức dự phòng.' };": "if (status === 'THIN_BUFFER') return { cls: 'warn', label: 'Buffer còn mỏng', note: 'Base case vẫn chạy được nhưng mức dự phòng còn mỏng.' };",
    "return { cls: 'good', label: 'Thanh khoản ổn', note: 'Kịch bản chắc chắn đang nằm trong vùng vận hành an toàn.' };": "return { cls: 'good', label: 'Thanh khoản ổn', note: 'Base case nằm trong vùng vận hành; stress được theo dõi riêng.' };",
    "h('span', null, h('i', { className: 'confirmed' }), 'Kịch bản chắc chắn'),": "h('span', null, h('i', { className: 'confirmed' }), 'Stress 14 ngày'),",
    "h('span', null, h('i', { className: 'expected' }), 'Có dòng tiền dự kiến'),": "h('span', null, h('i', { className: 'expected' }), 'Base case'),",
    "h('small', null, 'Dòng tiền Expected không được dùng để nâng mức an toàn hôm nay.')": "h('small', null, 'Base case dùng forecast; stress trì hoãn khoản thu dự kiến 14 ngày.')",
    "h('header', { className: 'rf-home-intro' }, h('span', null, fmtDate(D.today(), true)), h('p', null, 'Quyền sử dụng tiền, không chỉ số dư.'))": "h('header', { className: 'rf-home-intro' }, h('span', null, fmtDate(D.today(), true)))",
    "h(Metric, { label: 'Điểm thấp nhất 30 ngày', value: money(op.projectedLow), note: op.pressureDate ? 'Áp lực: ' + fmtDate(op.pressureDate, false) : '', cls: op.projectedLow < 0 ? 'danger' : '' })": "h(Metric, { label: 'Điểm thấp nhất · Base', value: money(op.projectedLow), note: op.pressureDate ? 'Áp lực: ' + fmtDate(op.pressureDate, false) : '', cls: op.projectedLow < 0 ? 'danger' : '' })",
    "h(Metric, { label: 'Vốn có thể triển khai', value: money(op.deployableCapital), note: 'Sau mức giữ và sinh hoạt', cls: op.deployableCapital > 0 ? 'good' : '' })": "h(Metric, { label: 'Stress gap · 14 ngày', value: money(op.stressGap || 0), note: op.stressGap > 0 ? 'Cần thêm nếu khoản thu trễ' : 'Đủ chịu stress hiện tại', cls: op.stressGap > 0 ? 'danger' : 'good' })",
}
for old, new in replacements.items():
    if old not in ui:
        print('WARN missing UI snippet:', old[:80])
    ui = ui.replace(old, new)
ui_path.write_text(ui)

# PWA cache bust.
sw_path = root / 'sw.js'
sw = sw_path.read_text()
sw = re.sub(r"rootflow-cache-[^'\"]+", 'rootflow-cache-2026-09-09-liquidity-logo', sw, count=1)
sw_path.write_text(sw)

# Remove staging helpers from the published source commit.
b64_path.unlink(missing_ok=True)
Path('tools/rootflow-sept09-release.py').unlink(missing_ok=True)
