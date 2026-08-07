"""Rootflow icon system — Root Mark / Flow variant.

Flat master artwork for Home Screen/App Store: warm ivory field, graphite root
node and one continuous green flow stroke. The symbol is intentionally simple so
it stays recognisable at 60 px and shares a clear family language with Rootwork.
"""
from pathlib import Path
import cairosvg

OUT = Path(__file__).parent
SIZES = [180, 192, 256, 512, 1024]

SVG = r'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="paper" cx="46%" cy="38%" r="78%">
      <stop offset="0" stop-color="#fbfaf6"/>
      <stop offset="1" stop-color="#f0eee8"/>
    </radialGradient>
    <linearGradient id="flow" x1="270" y1="690" x2="790" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#17664d"/>
      <stop offset="0.55" stop-color="#3f9d72"/>
      <stop offset="1" stop-color="#57b982"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#paper)"/>
  <path d="M 290 640 C 360 540, 432 592, 492 624 C 555 658, 619 646, 663 584 C 715 511, 709 390, 804 318"
        fill="none" stroke="url(#flow)" stroke-width="82" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="245" cy="690" r="86" fill="#111211"/>
</svg>'''

(OUT / 'icon-master.svg').write_text(SVG, encoding='utf-8')
for size in SIZES:
    cairosvg.svg2png(bytestring=SVG.encode('utf-8'), write_to=str(OUT / f'icon-{size}.png'), output_width=size, output_height=size)
    print(f'icon-{size}.png')
