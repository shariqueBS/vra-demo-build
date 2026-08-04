/* Aurelia storefront — content payload for release 4.18.0 (BASELINE).
 * Everything that legitimately changes on every deploy — sync clocks,
 * relative timestamps, rotating avatars, the promo creative — lives here.
 * These are the diffs a reviewer should teach Percy to ignore. */

window.DEMO = {
  release: '4.18.0',

  // Global nav label — appears top-right on all 16 snapshots.
  nav: {
    cart: 'Cart',
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
    clock: '09:41:12',
    session: 'sess_7f3a91c2',
  },

  tracking: {
    id: 'AUR-4471-8823',
    updated: '09:38:04',
    scan: 'Hub — Rotterdam · 09:12',
  },

  feed: [
    '2 minutes ago',
    '17 minutes ago',
    '1 hour ago',
    '4 hours ago',
    'Yesterday, 18:20',
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
