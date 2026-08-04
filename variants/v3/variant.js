/* Aurelia storefront — content payload for release 4.19.1 (DRIFT BUILD).
 *
 * Compared with 4.19.0: ONLY the dynamic content moves.
 *   - Seller dashboard sync clock + session id
 *   - Order tracking id, last scan, updated time, five relative feed times
 *
 * The nav still says "Bag" (that change already shipped) and neither button
 * regression is fixed, so no intentional-change or bug diff reappears.
 * Reviewed against 4.19.0 this build should surface exactly two snapshots —
 * or zero, once the reviewer has saved an ignore prompt for them. */

window.DEMO = {
  release: '4.19.1',

  // Unchanged from 4.19.0 — the rebrand already shipped.
  nav: {
    cart: 'Bag',
  },

  images: {
    logo: '/img/logo.svg',
    hero: '/img/hero-shoe.svg',
    pdp: '/img/pdp-runner.svg',
    promo: '/img/promo-spring.svg',
  },

  avatars: [
    '/img/avatar-a1.svg', '/img/avatar-a2.svg', '/img/avatar-a3.svg',
    '/img/avatar-a4.svg', '/img/avatar-a5.svg', '/img/avatar-a6.svg',
  ],

  // NOISE — churned again.
  sync: {
    clock: '08:19:35',
    session: 'sess_1c9e77af',
  },

  // NOISE — churned again.
  tracking: {
    id: 'AUR-3382-6015',
    updated: '08:16:09',
    scan: 'Hub — Venlo · 07:52',
  },

  // NOISE — churned again.
  feed: [
    '9 minutes ago',
    '52 minutes ago',
    '3 hours ago',
    '11 hours ago',
    'Yesterday, 06:40',
  ],

  reviews: [
    { name: 'Rohit K.', when: '3 days ago' },
    { name: 'Tamsin M.', when: '6 days ago' },
    { name: 'Adaeze S.', when: '2 weeks ago' },
  ],

  pricing: {
    cta: 'Start free trial',
    pro: '$29',
  },
};
