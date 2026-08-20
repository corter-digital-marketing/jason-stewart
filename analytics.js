/* ============================================================
   The Jason Stewart Collection — Analytics & Tracking
   ============================================================
   Replace the placeholder IDs below with real ones once GA4 /
   Meta / TikTok accounts exist. With placeholders in place, none
   of the loaders fire and no network requests are made — this
   file is a safe no-op until real IDs are swapped in.
*/
(function () {
  'use strict';

  var GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';          // TODO: replace with real GA4 Measurement ID
  var META_PIXEL_ID      = '0000000000000';         // TODO: replace with real Meta Pixel ID
  var TIKTOK_PIXEL_ID    = 'XXXXXXXXXXXXXXXXXXXX';  // TODO: replace with real TikTok Pixel ID

  function isPlaceholder(id) {
    return !id || id.indexOf('X') !== -1 || id === '0000000000000';
  }

  /* ─── GA4 ─────────────────────────────────────────────────── */
  if (!isPlaceholder(GA4_MEASUREMENT_ID)) {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);
  }

  /* ─── Meta Pixel ──────────────────────────────────────────── */
  if (!isPlaceholder(META_PIXEL_ID)) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ─── TikTok Pixel ────────────────────────────────────────── */
  if (!isPlaceholder(TIKTOK_PIXEL_ID)) {
    /* eslint-disable */
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e) {
        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i;
        var o = document.createElement("script"); o.type = "text/javascript"; o.async = true; o.src = i + "?sdkid=" + e + "&lib=" + t;
        var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a);
      };
      ttq.load(TIKTOK_PIXEL_ID); ttq.page();
    }(window, document, 'ttq');
    /* eslint-enable */
  }

  /* ─── Unified event helpers ───────────────────────────────────
     Call these from page scripts instead of gtag/fbq/ttq directly —
     they fan out to whichever pixels are actually configured, and
     never throw (a broken analytics call should never break the page).
  ──────────────────────────────────────────────────────────────── */
  window.JSC = window.JSC || {};

  function safe(fn) { try { fn(); } catch (e) { /* analytics must never break the page */ } }

  window.JSC.trackViewItem = function (item) {
    safe(function () {
      var value = (item.price || 0) / 100;
      if (window.gtag) window.gtag('event', 'view_item', {
        currency: 'USD', value: value,
        items: [{ item_name: item.name, item_variant: item.color, price: value }]
      });
      if (window.fbq) window.fbq('track', 'ViewContent', { content_name: item.name, content_category: item.color, value: value, currency: 'USD' });
      if (window.ttq) window.ttq.track('ViewContent', { content_name: item.name, value: value, currency: 'USD' });
    });
  };

  window.JSC.trackAddToCart = function (item) {
    safe(function () {
      var qty = item.qty || 1;
      var value = ((item.price || 0) * qty) / 100;
      if (window.gtag) window.gtag('event', 'add_to_cart', {
        currency: 'USD', value: value,
        items: [{ item_name: item.name, item_variant: item.color, price: (item.price || 0) / 100, quantity: qty }]
      });
      if (window.fbq) window.fbq('track', 'AddToCart', { content_name: item.name, value: value, currency: 'USD' });
      if (window.ttq) window.ttq.track('AddToCart', { content_name: item.name, value: value, currency: 'USD' });
    });
  };

  window.JSC.trackBeginCheckout = function (items) {
    safe(function () {
      var value = items.reduce(function (sum, i) { return sum + (i.price || 0) * (i.qty || 1); }, 0) / 100;
      if (window.gtag) window.gtag('event', 'begin_checkout', { currency: 'USD', value: value });
      if (window.fbq) window.fbq('track', 'InitiateCheckout', { value: value, currency: 'USD' });
      if (window.ttq) window.ttq.track('InitiateCheckout', { value: value, currency: 'USD' });
    });
  };

  window.JSC.trackLead = function (formName) {
    safe(function () {
      if (window.gtag) window.gtag('event', 'generate_lead', { form_name: formName });
      if (window.fbq) window.fbq('track', 'Lead', { content_name: formName });
      if (window.ttq) window.ttq.track('SubmitForm', { content_name: formName });
    });
  };

  /* No dollar value is attached here — a static Stripe Payment Link
     redirect can't tell us the real order amount without a server-side
     lookup against the Stripe API. This fires the conversion event so
     purchase COUNT is trackable immediately; wire up real order value
     later via a Stripe webhook or the Checkout Session API. */
  window.JSC.trackPurchase = function () {
    safe(function () {
      if (window.gtag) window.gtag('event', 'purchase', { currency: 'USD' });
      if (window.fbq) window.fbq('track', 'Purchase', { currency: 'USD' });
      if (window.ttq) window.ttq.track('CompletePayment', { currency: 'USD' });
    });
  };
})();
