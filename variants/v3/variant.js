/* Aurelia storefront — content payload for release 4.19.1 (DRIFT).
 * Everything that legitimately changes on every deploy — sync clocks,
 * relative timestamps, rotating avatars, the promo creative — lives here.
 * These are the diffs a reviewer should teach Percy to ignore. */

window.DEMO = {
  release: '4.19.1',

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
    clock: '08:19:35',
    session: 'sess_1c9e77af',
  },

  tracking: {
    id: 'AUR-3382-6015',
    updated: '08:16:09',
    scan: 'Hub — Venlo · 07:52',
  },

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
