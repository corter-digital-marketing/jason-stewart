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
      sum += item.price;
      html += `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
          </div>
          <div class="cart-item-details">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-meta">${item.material}</p>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
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
    white:  'https://buy.stripe.com/6oU7sM2rw4ls2iHgzwgYU01',
    black:  'https://buy.stripe.com/4gMaEYd6a2dk5uTgzwgYU02',
    cherry: 'https://buy.stripe.com/8x27sMfei2dk4qP2IGgYU03',
    pink:   'https://buy.stripe.com/9B6eVe0jo4ls4qP0AygYU04',
    gold:   'https://buy.stripe.com/5kQ6oIfeidW2aPd3MKgYU05',
  };

  function updateCheckoutLink() {
    const link = document.getElementById('checkout-link');
    if (!link) return;
    if (cartItems.length === 0) return;
    const color = cartItems[0].material.split('·')[0].trim().toLowerCase();
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
      const product = {
        name:     addBtn.dataset.name,
        material: addBtn.dataset.material,
        price:    parseInt(addBtn.dataset.price),
        image:    addBtn.dataset.image,
      };
      cartItems.push(product);
      saveCart();
      updateBadge();
      openCart();

      addBtn.textContent = 'Added';
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = 'Add to Cart';
        addBtn.disabled = false;
      }, 2000);
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
