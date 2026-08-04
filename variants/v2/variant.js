/* Aurelia storefront — content payload for release 4.19.0 (CANDIDATE).
 * Everything that legitimately changes on every deploy — sync clocks,
 * relative timestamps, rotating avatars, the promo creative — lives here.
 * These are the diffs a reviewer should teach Percy to ignore. */

window.DEMO = {
  release: '4.19.0',

  // Global nav label — appears top-right on all 16 snapshots.
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

  sync: {
    clock: '16:07:48',
    session: 'sess_b2d40e19',
  },

  tracking: {
    id: 'AUR-9126-3307',
    updated: '16:04:22',
    scan: 'Hub — Antwerp · 15:47',
  },

  feed: [
    '5 minutes ago',
    '38 minutes ago',
    '2 hours ago',
    '7 hours ago',
    'Yesterday, 21:05',
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
