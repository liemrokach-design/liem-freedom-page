/**
 * Minimal analytics wrapper.
 *
 * Fully inert until window.SITE_CONFIG.ANALYTICS_ID is set: no script
 * is injected, no network request is made, no event fires. Once a
 * real GA4-style measurement ID is configured (and privacy
 * requirements for it have been checked), this loads gtag.js and
 * forwards events through it.
 *
 * Never pass personal data (name, phone, message content) as event
 * params — only structural/UX signals.
 */
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var analyticsId = config.ANALYTICS_ID;
  var ready = false;

  function loadGtag(id) {
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    ready = true;
  }

  if (analyticsId) {
    loadGtag(analyticsId);
  }

  /**
   * Track a product event. No-ops silently when analytics isn't
   * configured, so call sites never need to check first.
   * @param {string} name one of: page_view, cta_click, lead_form_start,
   *   lead_submit_success, lead_submit_error
   * @param {Object} [params]
   */
  window.trackEvent = function (name, params) {
    if (!ready || typeof window.gtag !== "function") return;
    window.gtag("event", name, params || {});
  };
})();
