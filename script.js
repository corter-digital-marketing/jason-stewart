/* ============================================================
   The Jason Stewart Collection — Shared Script
   ============================================================ */

(function () {
  'use strict';

  /* ─── Nav: transparent over hero, ivory on scroll ─────────── */
  const nav   = document.getElementById('site-nav');
  const hero  = document.querySelector('.hero');

  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('is-ivory');
      nav.classList.remove('is-dark');
    } else {
      if (hero) {
        nav.classList.remove('is-ivory');
        nav.classList.add('is-dark');
      }
    }
  }
  if (nav) {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ─── Cart state ──────────────────────────────────────────── */
  let cartItems = JSON.parse(sessionStorage.getItem('jsc-cart') || '[]');

  function saveCart() {
    sessionStorage.setItem('jsc-cart', JSON.stringify(cartItems));
  }

  function updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.textContent = cartItems.length;
    badge.style.display = cartItems.length === 0 ? 'none' : 'flex';
  }

  function formatPrice(cents) {
    return '$' + (cents / 100).toFixed(0);
  }

  function renderCart() {
    const body  = document.getElementById('cart-body');
    const total = document.getElementById('cart-total');
    if (!body) return;

    if (cartItems.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <p class="cart-empty-text">Your cart is empty.</p>
          <a href="shop.html" class="btn btn-text">Explore the Collection</a>
        </div>`;
      if (total) total.textContent = '—';
      return;
    }

    let html = '';
    let sum  = 0;
    cartItems.forEach((item, i) => {
      const qty = item.qty || 1;
      sum += item.price * qty;
      html += `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
          </div>
          <div class="cart-item-details">
            <p class="cart-item-name">${item.name}${qty > 1 ? ` &times; ${qty}` : ''}</p>
            <p class="cart-item-meta">${item.material}</p>
            <p class="cart-item-price">${formatPrice(item.price * qty)}</p>
            <button class="btn-text" style="font-size:0.625rem;margin-top:10px;color:var(--charcoal-muted);border-color:var(--stone);" data-remove="${i}">Remove</button>
          </div>
        </div>`;
    });
    body.innerHTML = html;
    if (total) total.textContent = formatPrice(sum);

    body.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        cartItems.splice(parseInt(btn.dataset.remove), 1);
        saveCart();
        updateBadge();
        renderCart();
      });
    });

    updateCheckoutLink();
  }

  const stripeLinks = {
    white:  'https://buy.stripe.com/00wbJ22rw4ls3mL3MKgYU0a',
    black:  'https://buy.stripe.com/3cIfZigim5pw1eD2IGgYU09',
    cherry: 'https://buy.stripe.com/aFadRagim5pwbThgzwgYU08',
    pink:   'https://buy.stripe.com/28E7sM9TY3ho7D1erogYU07',
    gold:   'https://buy.stripe.com/3cIeVe9TY6tA3mL974gYU06',
  };

  const bundleLinks = {
    '2cup':   'https://buy.stripe.com/cNi3cwd6adW28H5fvsgYU0b',
    '4cup':   'https://buy.stripe.com/cNi28s4zEcRY6yXerogYU0c',
    '5color': 'https://buy.stripe.com/aFa4gAc268BIaPd3MKgYU0d',
  };

  function updateCheckoutLink() {
    const link = document.getElementById('checkout-link');
    if (!link) return;
    if (cartItems.length === 0) return;
    const item = cartItems[0];
    if (item.bundleKey) {
      link.href = bundleLinks[item.bundleKey] || 'product.html#bundles';
      return;
    }
    // Prefer the explicit color key set when the item was added; fall back
    // to parsing the material string for any older cart data already in
    // sessionStorage from before this field existed.
    const color = item.color || item.material.split('·')[0].trim().toLowerCase();
    link.href = stripeLinks[color] || 'shop.html';
  }

  /* ─── Cart drawer ─────────────────────────────────────────── */
  const overlay    = document.getElementById('cart-overlay');
  const drawer     = document.getElementById('cart-drawer');
  const cartToggle = document.getElementById('cart-toggle');
  const cartClose  = document.getElementById('cart-close');

  function openCart() {
    if (!overlay || !drawer) return;
    renderCart();
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    cartClose && cartClose.focus();
  }

  function closeCart() {
    if (!overlay || !drawer) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartToggle) cartToggle.addEventListener('click', e => { e.preventDefault(); openCart(); });
  if (cartClose)  cartClose.addEventListener('click', closeCart);
  if (overlay)    overlay.addEventListener('click', e => { if (e.target === overlay) closeCart(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  /* ─── Add to cart (product page) ─────────────────────────── */
  const addBtn = document.getElementById('add-to-cart');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const qtyEl = document.getElementById('qty-display');
      const product = {
        name:      addBtn.dataset.name,
        material:  addBtn.dataset.material,
        color:     addBtn.dataset.color || '',
        bundleKey: addBtn.dataset.bundleKey || '',
        price:     parseInt(addBtn.dataset.price, 10),
        image:     addBtn.dataset.image,
        qty:       qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1,
      };
      cartItems.push(product);
      saveCart();
      updateBadge();
      openCart();
      if (window.JSC) window.JSC.trackAddToCart(product);

      // Let the page's own quantity-stepper script (which owns the qty
      // state) know it should reset itself back to 1.
      document.dispatchEvent(new CustomEvent('jsc:added-to-cart'));

      addBtn.textContent = 'Added';
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = 'Add to Cart';
        addBtn.disabled = false;
      }, 2000);
    });
  }

  /* ─── Begin checkout tracking ─────────────────────────────── */
  const checkoutLinkEl = document.getElementById('checkout-link');
  if (checkoutLinkEl) {
    checkoutLinkEl.addEventListener('click', () => {
      if (window.JSC && cartItems.length) window.JSC.trackBeginCheckout(cartItems);
    });
  }

  /* ─── Product gallery (product page) ─────────────────────── */
  const mainImg    = document.getElementById('gallery-main-img');
  const thumbBtns  = document.querySelectorAll('[data-thumb]');

  if (mainImg && thumbBtns.length) {
    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.thumb;
        const alt = btn.dataset.alt || '';
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = src;
          mainImg.alt = alt;
          mainImg.style.opacity = '1';
        }, 220);
        thumbBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
      });
    });
  }

  /* ─── Scroll reveal ───────────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ─── Init ────────────────────────────────────────────────── */
  updateBadge();
  updateCheckoutLink();

})();
