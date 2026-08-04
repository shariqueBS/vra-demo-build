/* Aurelia storefront — content payload for release 4.19.0 (CANDIDATE).
 *
 * Compared with 4.18.0, only two things move here:
 *   INTENTIONAL  the global nav label "Cart" → "Bag" — a deliberate copy
 *                change that lands on all 16 snapshots. The AI should read
 *                this as an intended change, not a bug, and should group it
 *                as one recurring pattern across the build.
 *   NOISE        the sync clock, session id, carrier tracking id, last scan
 *                and five relative feed times — values that churn on every
 *                single deploy and are what a saved ignore prompt is for.
 *
 * Everything else — imagery, avatars, reviewers, promo creative, pricing —
 * is byte-identical to 4.18.0, so those snapshots differ only by the nav. */

window.DEMO = {
  release: '4.19.0',

  // INTENTIONAL — rebrand of the cart affordance, ships across the whole site.
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

  // NOISE — wall-clock values on the Seller dashboard.
  sync: {
    clock: '16:07:48',
    session: 'sess_b2d40e19',
  },

  // NOISE — live shipment data on Order tracking.
  tracking: {
    id: 'AUR-9126-3307',
    updated: '16:04:22',
    scan: 'Hub — Antwerp · 15:47',
  },

  // NOISE — relative timestamps on Order tracking.
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
