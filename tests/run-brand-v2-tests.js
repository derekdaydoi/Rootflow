const fs = require('fs');
const path = require('path');
const assert = require('assert');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const index = read('index.html');
const css = read('brand-v2.css');
const mark = read('brand/rootflow-mark.svg');
const master = read('brand/root-master.svg');
const sw = read('sw.js');

assert(index.includes('brand-v2.css'), 'ROOT-family brand stylesheet must load');
assert(index.includes('rf-splash-root-left'), 'opening motion must draw the shared root base');
assert(index.includes('rf-splash-trunk'), 'opening motion must grow the shared trunk');
assert(index.includes('rf-splash-flow-center'), 'opening motion must reveal the Flow crown');
assert(!index.includes('splash-copyright'), 'minimal opening should not carry decorative copyright copy');
assert(index.includes('reduced ? 450 : 2100'), 'opening duration must remain compact and reduced-motion aware');

assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'brand motion must respect reduced-motion');
assert(css.includes('rf-splash-seed-out'), 'seed/source transition must resolve into the clean final mark');
assert(css.includes('rf-splash-flow-right'), 'all three Flow lanes must have sequenced motion');

assert(master.includes('id="root-base"'), 'shared ROOT master geometry must be explicit');
assert(mark.includes('id="root-base"'), 'Rootflow must reuse the ROOT base');
assert(mark.includes('id="flow-crown"'), 'Rootflow-specific crown must be explicit');
assert(mark.includes('#087A4C'), 'brand mark must use canonical Rootflow green');
assert(!mark.includes('linearGradient'), 'core mark must remain flat/monochrome-capable');

assert(sw.includes('root-family-brand-v2'), 'service worker cache key must be bumped for brand v2');
assert(sw.includes("'./brand-v2.css'"), 'service worker must cache brand motion CSS');
assert(sw.includes("'./brand/root-master.svg'"), 'service worker must cache ROOT family master asset');

console.log('Rootflow ROOT-family brand v2 contract tests passed.');
