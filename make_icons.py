from pathlib import Path
import cairosvg

OUT = Path(__file__).resolve().parent
SIZES = [180, 192, 256, 512, 1024]

ICON = r'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="paper" cx="48%" cy="38%" r="78%">
      <stop offset="0" stop-color="#F7FAEF"/>
      <stop offset="0.46" stop-color="#F4F5E9"/>
      <stop offset="1" stop-color="#EEECE3"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="48%">
      <stop offset="0" stop-color="#DCEACB" stop-opacity=".64"/>
      <stop offset="1" stop-color="#DCEACB" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="green" x1="255" y1="835" x2="680" y2="190" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4F7B48"/>
      <stop offset="0.55" stop-color="#608E54"/>
      <stop offset="1" stop-color="#7BA65F"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#paper)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <!-- flowing path -->
  <path d="M205 826C352 798 443 749 489 685C535 622 500 574 409 552C320 530 320 476 424 453C493 438 554 439 568 431"
        fill="none" stroke="url(#green)" stroke-width="84" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M198 827C333 803 420 764 464 711C508 658 487 620 414 600"
        fill="none" stroke="#F6F4EB" stroke-width="18" stroke-linecap="round" opacity=".98"/>
  <!-- stem -->
  <path d="M568 456V278" fill="none" stroke="url(#green)" stroke-width="56" stroke-linecap="round"/>
  <!-- leaves -->
  <path d="M544 388C466 382 414 332 414 256C492 257 548 301 571 370C575 385 559 390 544 388Z" fill="url(#green)"/>
  <path d="M596 393C603 316 660 270 742 278C734 355 678 403 602 413C591 414 589 402 596 393Z" fill="url(#green)"/>
  <path d="M561 285C546 209 581 154 653 126C695 195 670 258 594 300C578 309 567 300 561 285Z" fill="url(#green)"/>
</svg>'''

MARK = r'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-labelledby="title desc">
  <title id="title">Rootflow mark</title>
  <desc id="desc">A growing sprout rising from a flowing path.</desc>
  <defs>
    <linearGradient id="g" x1="25" y1="106" x2="86" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4F7B48"/>
      <stop offset=".55" stop-color="#608E54"/>
      <stop offset="1" stop-color="#7BA65F"/>
    </linearGradient>
  </defs>
  <path d="M18 106C37 102 48 96 54 88C60 80 55 74 43 71C31 68 31 61 45 58C54 56 62 56 64 55" fill="none" stroke="url(#g)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17 106C34 103 45 98 51 91C57 84 54 79 44 76" fill="none" stroke="#F6F4EB" stroke-width="2.9" stroke-linecap="round" opacity=".98"/>
  <path d="M64 59V30" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round"/>
  <path d="M60 48C49 47 42 40 42 29C53 29 61 35 64 45C64 47 62 48 60 48Z" fill="url(#g)"/>
  <path d="M68 49C69 38 77 31 89 32C88 43 80 50 69 52C68 52 67 50 68 49Z" fill="url(#g)"/>
  <path d="M63 31C61 20 66 12 76 8C82 18 78 27 67 33C65 34 64 33 63 31Z" fill="url(#g)"/>
</svg>'''

WORDMARK = r'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" role="img" aria-labelledby="title desc">
  <title id="title">ROOTFLOW</title>
  <desc id="desc">Rootflow wordmark. ROOT is graphite and FLOW is botanical green.</desc>
  <defs>
    <linearGradient id="g" x1="25" y1="106" x2="86" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4F7B48"/><stop offset=".55" stop-color="#608E54"/><stop offset="1" stop-color="#7BA65F"/>
    </linearGradient>
    <radialGradient id="tile" cx="48%" cy="38%" r="76%">
      <stop offset="0" stop-color="#F3F8E8"/><stop offset="1" stop-color="#F5F3EA"/>
    </radialGradient>
  </defs>
  <rect x="8" y="8" width="142" height="142" rx="38" fill="url(#tile)"/>
  <g transform="translate(20 18) scale(.92)">
    <path d="M18 106C37 102 48 96 54 88C60 80 55 74 43 71C31 68 31 61 45 58C54 56 62 56 64 55" fill="none" stroke="url(#g)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17 106C34 103 45 98 51 91C57 84 54 79 44 76" fill="none" stroke="#F6F4EB" stroke-width="2.9" stroke-linecap="round"/>
    <path d="M64 59V30" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round"/>
    <path d="M60 48C49 47 42 40 42 29C53 29 61 35 64 45C64 47 62 48 60 48Z" fill="url(#g)"/>
    <path d="M68 49C69 38 77 31 89 32C88 43 80 50 69 52C68 52 67 50 68 49Z" fill="url(#g)"/>
    <path d="M63 31C61 20 66 12 76 8C82 18 78 27 67 33C65 34 64 33 63 31Z" fill="url(#g)"/>
  </g>
  <text x="180" y="88" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-weight="850" font-size="66" letter-spacing="-3" fill="#171A18">ROOT</text>
  <text x="390" y="88" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-weight="850" font-size="66" letter-spacing="-3" fill="#6B9B58">FLOW</text>
  <text x="183" y="128" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-weight="700" font-size="15" letter-spacing="5" fill="#898D86">SEE WHAT COMES NEXT.</text>
</svg>'''

(OUT / 'icon-master.svg').write_text(ICON, encoding='utf-8')
(OUT / 'brand').mkdir(exist_ok=True)
(OUT / 'brand' / 'rootflow-mark.svg').write_text(MARK, encoding='utf-8')
(OUT / 'brand' / 'rootflow-wordmark.svg').write_text(WORDMARK, encoding='utf-8')

for size in SIZES:
    cairosvg.svg2png(bytestring=ICON.encode(), write_to=str(OUT / f'icon-{size}.png'), output_width=size, output_height=size)

cairosvg.svg2png(bytestring=MARK.encode(), write_to=str(OUT / 'brand' / 'rootflow-mark-1024.png'), output_width=1024, output_height=1024)
cairosvg.svg2png(bytestring=WORDMARK.encode(), write_to=str(OUT / 'brand' / 'rootflow-wordmark.png'), output_width=1440, output_height=360)
print('generated', ', '.join(str(x) for x in SIZES))
