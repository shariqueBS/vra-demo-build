/* Generates every image the demo app needs as a local SVG.
 * No external/CDN assets: Percy's asset discovery stays fast and deterministic,
 * and the build can be produced with no network access. Run: node tools/make-assets.js */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'app', 'img');
fs.mkdirSync(OUT, { recursive: true });

const write = (name, svg) => {
  fs.writeFileSync(path.join(OUT, name), svg.trim() + '\n');
  return name;
};

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;

/* ---------- logo ---------- */
write('logo.svg', svg(32, 32, `
  <rect width="32" height="32" rx="8" fill="#2456f5"/>
  <path d="M9 22 L16 9 L23 22 Z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="16" cy="18.5" r="1.9" fill="#fff"/>
`));

/* ---------- shoe illustration ----------
   Same silhouette, different colourway per product so the grid looks real. */
const shoe = (body, sole, accent) => svg(200, 200, `
  <rect width="200" height="200" fill="none"/>
  <path d="M28 132 C40 108 62 100 84 104 C100 107 108 96 124 92 C146 86 168 100 172 122 L174 138 C175 146 169 152 161 152 L40 152 C32 152 26 145 28 132 Z"
        fill="${body}"/>
  <path d="M26 138 L175 138 C176 149 169 158 158 158 L42 158 C31 158 25 149 26 138 Z" fill="${sole}"/>
  <path d="M92 106 C104 100 116 96 128 94" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M80 116 C94 110 108 106 122 104" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="152" cy="124" r="9" fill="${accent}" opacity="0.85"/>
`);

write('shoe-slate.svg',  shoe('#4a5568', '#2d3748', '#e2e8f0'));
write('shoe-blue.svg',   shoe('#2456f5', '#16307d', '#c7d5ff'));
write('shoe-sand.svg',   shoe('#d6bfa0', '#a68a68', '#5b4a35'));
write('shoe-olive.svg',  shoe('#6b7a4a', '#46512f', '#dfe6c8'));
write('shoe-coral.svg',  shoe('#e4674f', '#a8402d', '#ffd9cf'));
write('shoe-mint.svg',   shoe('#4fb79a', '#2c7a64', '#d6f2e9'));
write('shoe-plum.svg',   shoe('#7a4f7a', '#4f2f4f', '#eddcf0'));
write('shoe-charcoal.svg', shoe('#2f3440', '#1a1e26', '#8b93a6'));

/* ---------- hero ---------- */
write('hero-shoe.svg', svg(420, 300, `
  <rect width="420" height="300" rx="12" fill="#eef1fa"/>
  <g transform="translate(110,50) scale(1.0)">
    ${shoe('#2456f5', '#16307d', '#c7d5ff').replace(/^<svg[^>]*>|<\/svg>$/g, '')}
  </g>
  <circle cx="70" cy="70" r="26" fill="#dfe5fa"/>
  <rect x="300" y="222" width="72" height="8" rx="4" fill="#cdd6f3"/>
`));

/* ---------- PDP hero (the candidate build points at a path that does not exist) ---------- */
write('pdp-runner.svg', svg(320, 320, `
  <rect width="320" height="320" rx="14" fill="#f2f4fb"/>
  <g transform="translate(60,60)">
    ${shoe('#2456f5', '#16307d', '#c7d5ff').replace(/^<svg[^>]*>|<\/svg>$/g, '')}
  </g>
`));

/* ---------- avatars (two sets so the reviews page rotates between builds) ---------- */
const avatar = (bg, fg, initials) => svg(64, 64, `
  <rect width="64" height="64" rx="32" fill="${bg}"/>
  <text x="32" y="41" font-family="Helvetica,Arial,sans-serif" font-size="23" font-weight="700"
        fill="${fg}" text-anchor="middle">${initials}</text>
`);

const setA = [['#dbe4ff', '#2b4699', 'RK'], ['#ffe3d6', '#9a4620', 'TM'],
              ['#d9f2e6', '#1f6b4d', 'AS'], ['#f0dcf5', '#6a2f78', 'JL'],
              ['#fff0cc', '#8a5b00', 'DP'], ['#e3e7ee', '#3d4457', 'NB']];
const setB = [['#d9f2e6', '#1f6b4d', 'SV'], ['#f0dcf5', '#6a2f78', 'MC'],
              ['#dbe4ff', '#2b4699', 'HR'], ['#fff0cc', '#8a5b00', 'PG'],
              ['#e3e7ee', '#3d4457', 'LW'], ['#ffe3d6', '#9a4620', 'EK']];

setA.forEach((a, i) => write(`avatar-a${i + 1}.svg`, avatar(a[0], a[1], a[2])));
setB.forEach((a, i) => write(`avatar-b${i + 1}.svg`, avatar(a[0], a[1], a[2])));

/* ---------- promo banners (rotate between builds — pure marketing noise) ---------- */
const promo = (from, to, headline, kicker) => svg(1040, 168, `
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="1040" height="168" fill="url(#g)"/>
  <circle cx="900" cy="40" r="90" fill="#ffffff" opacity="0.10"/>
  <circle cx="820" cy="150" r="60" fill="#ffffff" opacity="0.08"/>
  <text x="44" y="72" font-family="Helvetica,Arial,sans-serif" font-size="15" font-weight="700"
        letter-spacing="2" fill="#ffffff" opacity="0.85">${kicker}</text>
  <text x="44" y="118" font-family="Helvetica,Arial,sans-serif" font-size="34" font-weight="700"
        fill="#ffffff">${headline}</text>
`);

write('promo-spring.svg', promo('#2456f5', '#7a3ff2', 'Up to 40% off trail runners', 'SPRING EVENT'));
write('promo-midseason.svg', promo('#0f9d58', '#14867a', 'Mid-season drop — 30% off', 'JUST LANDED'));

console.log('wrote', fs.readdirSync(OUT).length, 'assets to app/img/');
