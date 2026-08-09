# Raster export helper. Vector source: brand/rootflow-icon-master.svg
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
MASTER = ROOT / 'brand' / 'rootflow-logo-master.png'
SIZES = (180, 192, 256, 512, 1024)

if not MASTER.exists():
    raise SystemExit(f'Missing master: {MASTER}')

img = Image.open(MASTER).convert('RGB')
for size in SIZES:
    dst = ROOT / f'icon-{size}.png'
    img.resize((size, size), Image.Resampling.LANCZOS).save(dst, optimize=True, quality=96)
    print('wrote', dst.name)

runtime = img.resize((512, 512), Image.Resampling.LANCZOS)
runtime.save(ROOT / 'brand' / 'rootflow-symbol.png', optimize=True, quality=95)
runtime.save(ROOT / 'brand' / 'rootflow-mark-512.png', optimize=True, quality=95)
img.resize((1024, 1024), Image.Resampling.LANCZOS).save(
    ROOT / 'brand' / 'rootflow-mark-1024.png', optimize=True, quality=96
)
print('done')
