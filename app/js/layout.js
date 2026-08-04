/* Injects the shared nav + footer and binds variant data into the page.
 * Runs synchronously on every page BEFORE Percy serialises the DOM, so the
 * captured snapshot contains the fully rendered markup.
 *
 * window.DEMO is defined by /variant.js and is the ONLY source of
 * build-to-build content differences (images, timestamps, copy). Layout
 * itself is identical in both builds. */

(function () {
  var D = window.DEMO || {};
  var page = document.body.getAttribute('data-page') || '';

  var NAV = [
    ['New in', 'new', '/products.html'],
    ['Men', 'men', '/products.html'],
    ['Women', 'women', '/products.html'],
    ['Deals', 'deals', '/deals.html'],
    ['Pricing', 'pricing', '/pricing.html'],
  ];

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // ---- top bar + nav ----------------------------------------------------
  var links = NAV.map(function (n) {
    var active = n[1] === page ? ' class="is-active"' : '';
    return '<a href="' + n[2] + '"' + active + '>' + n[0] + '</a>';
  }).join('');

  var header = el(
    '<header>' +
      '<div class="topbar"><div class="shell topbar__inner">' +
        '<span>Free carbon-neutral shipping over $80</span>' +
        '<span><a href="/order-status.html">Track order</a> &nbsp;·&nbsp; <a href="/help.html">Help</a></span>' +
      '</div></div>' +
      '<nav class="nav"><div class="shell nav__inner">' +
        '<a class="nav__logo" href="/">' +
          '<img src="' + (D.images && D.images.logo) + '" alt="Aurelia">' +
          '<span class="nav__logo-text">Aurelia</span>' +
        '</a>' +
        '<div class="nav__links">' + links + '</div>' +
        '<div class="nav__actions">' +
          '<a href="/login.html" class="muted" style="font-size:14px;font-weight:500">Sign in</a>' +
          '<span class="nav__cart">' + ((D.nav && D.nav.cart) || 'Cart') +
            ' <span class="nav__cart-count">3</span></span>' +
        '</div>' +
      '</div></nav>' +
    '</header>'
  );
  document.body.insertBefore(header, document.body.firstChild);

  // ---- footer ----------------------------------------------------------
  var cols = [
    ['Shop', ['New arrivals', 'Trail', 'Road', 'Recycled line', 'Gift cards']],
    ['Support', ['Track order', 'Returns', 'Size guide', 'Help centre', 'Contact us']],
    ['Company', ['About Aurelia', 'Sustainability', 'Careers', 'Press', 'Stores']],
    ['Legal', ['Terms', 'Privacy', 'Cookies', 'Accessibility']],
  ].map(function (c) {
    return '<div><h4>' + c[0] + '</h4><ul>' + c[1].map(function (i) {
      return '<li><a href="/help.html">' + i + '</a></li>';
    }).join('') + '</ul></div>';
  }).join('');

  document.body.appendChild(el(
    '<footer class="footer">' +
      '<div class="shell footer__inner">' + cols + '</div>' +
      '<div class="shell footer__legal">© 2026 Aurelia Footwear Ltd. All rights reserved.</div>' +
    '</footer>'
  ));

  // ---- bind variant data ----------------------------------------------
  // data-demo="path.to.value"  -> textContent
  // data-demo-src="images.key" -> img src
  function lookup(path) {
    return path.split('.').reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, D);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-demo]'), function (n) {
    var v = lookup(n.getAttribute('data-demo'));
    if (v !== undefined) n.textContent = v;
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-demo-src]'), function (n) {
    var v = lookup(n.getAttribute('data-demo-src'));
    if (v !== undefined) n.setAttribute('src', v);
  });

  // Repeating lists: data-demo-list="avatars" fills the nth <img> in order.
  Array.prototype.forEach.call(document.querySelectorAll('[data-demo-list]'), function (host) {
    var arr = lookup(host.getAttribute('data-demo-list')) || [];
    Array.prototype.forEach.call(host.querySelectorAll('img'), function (img, i) {
      if (arr[i]) img.setAttribute('src', arr[i]);
    });
  });
})();
