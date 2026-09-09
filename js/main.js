(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var track = window.trackEvent || function () {};

  document.getElementById("year").textContent = new Date().getFullYear();
  track("page_view", { page: "landing" });

  // ---------------------------------------------------------------
  // Staggered scroll-reveal
  // ---------------------------------------------------------------
  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var groups = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var siblings = groups.get(el.parentElement) || [el];
          var index = siblings.indexOf(el);
          setTimeout(function () {
            el.classList.add("in-view");
          }, Math.min(index * 90, 450));
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // ---------------------------------------------------------------
  // Sticky mobile CTA: show after hero, hide once the lead form is on screen
  // ---------------------------------------------------------------
  var stickyCta = document.getElementById("stickyCta");
  var hero = document.querySelector(".hero");
  var leadSection = document.getElementById("lead-form");

  if (stickyCta && hero && leadSection && "IntersectionObserver" in window) {
    var heroPassed = false;
    var leadVisible = false;

    var updateSticky = function () {
      if (heroPassed && !leadVisible) {
        stickyCta.classList.add("visible");
      } else {
        stickyCta.classList.remove("visible");
      }
    };

    new IntersectionObserver(
      function (entries) {
        heroPassed = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
        updateSticky();
      },
      { threshold: 0 }
    ).observe(hero);

    new IntersectionObserver(
      function (entries) {
        leadVisible = entries[0].isIntersecting;
        updateSticky();
      },
      { threshold: 0.15 }
    ).observe(leadSection);
  }

  // ---------------------------------------------------------------
  // CTA click tracking (no personal data, just which button)
  // ---------------------------------------------------------------
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      track("cta_click", { cta_id: el.getAttribute("data-cta") });
    });
  });

  // ---------------------------------------------------------------
  // Hero image: swap placeholder for the real photo when configured
  // ---------------------------------------------------------------
  (function applyHeroImage() {
    var img = document.getElementById("heroImage");
    var placeholder = document.getElementById("heroImagePlaceholder");
    if (!img || !placeholder) return;

    if (config.HERO_IMAGE) {
      img.src = config.HERO_IMAGE;
      img.alt = "ליאם רוקח";
      img.hidden = false;
      placeholder.hidden = true;
    }
  })();

  // ---------------------------------------------------------------
  // Story media: video (click-to-play YouTube embed) > static image > placeholder
  // ---------------------------------------------------------------
  (function applyStoryMedia() {
    var container = document.getElementById("storyMedia");
    var placeholder = document.getElementById("storyPlaceholder");
    if (!container || !placeholder) return;

    if (config.STORY_VIDEO) {
      placeholder.hidden = true;

      var wrap = document.createElement("div");
      wrap.className = "media-video";

      var trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "media-video-trigger";
      trigger.setAttribute("aria-label", "נגן את הסרטון");

      var thumb = document.createElement("img");
      thumb.src = "https://img.youtube.com/vi/" + encodeURIComponent(config.STORY_VIDEO) + "/maxresdefault.jpg";
      thumb.alt = "";
      thumb.loading = "lazy";

      var playBadge = document.createElement("span");
      playBadge.className = "media-video-play";
      playBadge.setAttribute("aria-hidden", "true");
      playBadge.innerHTML =
        '<span class="media-video-play-circle"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5z" fill="currentColor"/></svg></span>';

      trigger.appendChild(thumb);
      trigger.appendChild(playBadge);
      wrap.appendChild(trigger);
      container.appendChild(wrap);

      trigger.addEventListener("click", function () {
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(config.STORY_VIDEO) + "?autoplay=1";
        iframe.className = "media-video-frame";
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("title", "הסיפור האישי של ליאם");
        wrap.innerHTML = "";
        wrap.appendChild(iframe);
      });
    } else if (config.STORY_IMAGE) {
      placeholder.hidden = true;
      var img = document.createElement("img");
      img.src = config.STORY_IMAGE;
      img.alt = "ליאם רוקח";
      img.loading = "lazy";
      img.className = "media-photo";
      container.appendChild(img);
    }
  })();

  // ---------------------------------------------------------------
  // Testimonials: render from config, hide the section if none exist
  // ---------------------------------------------------------------
  (function renderTestimonials() {
    var section = document.getElementById("testimonials");
    var grid = document.getElementById("testimonialsGrid");
    if (!section || !grid) return;

    var items = Array.isArray(config.TESTIMONIALS) ? config.TESTIMONIALS.filter(function (t) { return t && t.src; }) : [];
    if (items.length === 0) return; // stays hidden

    var captions = [
      "מה קורה כשמתחילים לעבוד על עצמך גם מחוץ לשיחות.",
      "שינוי בביטחון, בהתנהגות או בדרך שבה מתאמן מתמודד עם נשים.",
      "תוצאה נוספת מתוך הליווי.",
    ];

    items.forEach(function (item, index) {
      var figure = document.createElement("figure");
      figure.className = "testimonial-card";

      var button = document.createElement("button");
      button.type = "button";
      button.className = "testimonial-trigger";
      button.setAttribute("aria-label", "הגדל תמונה");

      var img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "";
      img.loading = "lazy";

      button.appendChild(img);
      figure.appendChild(button);

      var caption = document.createElement("figcaption");
      caption.textContent = captions[index] || "עדות מתוך הליווי.";
      figure.appendChild(caption);

      grid.appendChild(figure);

      button.addEventListener("click", function () {
        openLightbox(item.src, item.alt || "");
      });
    });

    section.hidden = false;
  })();

  var lightboxDialog = null;
  function openLightbox(src, alt) {
    if (!lightboxDialog) {
      lightboxDialog = document.createElement("dialog");
      lightboxDialog.className = "lightbox";
      lightboxDialog.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="סגור">&times;</button><img class="lightbox-img" alt="">';
      document.body.appendChild(lightboxDialog);
      lightboxDialog.querySelector(".lightbox-close").addEventListener("click", function () {
        lightboxDialog.close();
      });
      lightboxDialog.addEventListener("click", function (e) {
        if (e.target === lightboxDialog) lightboxDialog.close();
      });
    }
    var imgEl = lightboxDialog.querySelector(".lightbox-img");
    imgEl.src = src;
    imgEl.alt = alt;
    if (typeof lightboxDialog.showModal === "function") {
      lightboxDialog.showModal();
    }
  }

  // ---------------------------------------------------------------
  // Footer social links + privacy link: only render what's configured
  // ---------------------------------------------------------------
  (function applyFooterLinks() {
    var wrap = document.getElementById("footerSocial");
    if (wrap) {
      var links = [];
      if (config.INSTAGRAM_URL) links.push({ href: config.INSTAGRAM_URL, label: "אינסטגרם" });
      if (config.YOUTUBE_URL) links.push({ href: config.YOUTUBE_URL, label: "יוטיוב" });
      if (config.WHATSAPP_URL) links.push({ href: config.WHATSAPP_URL, label: "וואטסאפ" });

      links.forEach(function (link) {
        var a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.label;
        a.rel = "noopener";
        a.target = "_blank";
        a.className = "footer-social-link";
        wrap.appendChild(a);
      });
    }

    var privacyWrap = document.getElementById("privacyLinkWrap");
    if (privacyWrap && config.PRIVACY_POLICY_URL) {
      privacyWrap.innerHTML = ' <a href="' + config.PRIVACY_POLICY_URL + '" class="privacy-link">מדיניות הפרטיות</a>';
    }

    var priceContact = document.getElementById("priceContact");
    if (priceContact && config.WHATSAPP_URL) {
      var link = document.createElement("a");
      link.href = config.WHATSAPP_URL;
      link.textContent = priceContact.textContent;
      link.rel = "noopener";
      link.target = "_blank";
      link.className = "price-contact-link";
      priceContact.textContent = "";
      priceContact.appendChild(link);
    }
  })();

  // ---------------------------------------------------------------
  // Lead form
  // ---------------------------------------------------------------
  (function setupLeadForm() {
    var form = document.getElementById("leadForm");
    if (!form) return;

    var firstNameInput = document.getElementById("firstName");
    var phoneInput = document.getElementById("phone");
    var messageInput = document.getElementById("message");
    var honeypotInput = document.getElementById("nickname");
    var submitBtn = document.getElementById("leadSubmitBtn");
    var btnLabel = submitBtn.querySelector(".btn-label");
    var statusEl = document.getElementById("formStatus");
    var defaultLabel = btnLabel.textContent;

    var formStarted = false;
    form.addEventListener(
      "focusin",
      function () {
        if (formStarted) return;
        formStarted = true;
        track("lead_form_start", {});
      },
      { once: true }
    );

    function setFieldError(input, errorEl, message) {
      if (message) {
        errorEl.textContent = message;
        input.setAttribute("aria-invalid", "true");
      } else {
        errorEl.textContent = "";
        input.removeAttribute("aria-invalid");
      }
    }

    function normalizePhone(value) {
      return value.replace(/[\s\-()]/g, "");
    }

    function isValidIsraeliPhone(value) {
      var normalized = normalizePhone(value);
      return /^(?:\+972|0)(?:[23489]\d{7}|5\d{8})$/.test(normalized);
    }

    function validate() {
      var valid = true;

      var nameVal = firstNameInput.value.trim();
      if (!nameVal) {
        setFieldError(firstNameInput, document.getElementById("firstNameError"), "יש להזין שם פרטי.");
        valid = false;
      } else {
        setFieldError(firstNameInput, document.getElementById("firstNameError"), "");
      }

      var phoneVal = phoneInput.value.trim();
      if (!phoneVal) {
        setFieldError(phoneInput, document.getElementById("phoneError"), "יש להזין מספר וואטסאפ.");
        valid = false;
      } else if (!isValidIsraeliPhone(phoneVal)) {
        setFieldError(phoneInput, document.getElementById("phoneError"), "מספר הטלפון לא תקין. יש להזין מספר ישראלי, לדוגמה 050-1234567.");
        valid = false;
      } else {
        setFieldError(phoneInput, document.getElementById("phoneError"), "");
      }

      var messageVal = messageInput.value.trim();
      if (!messageVal) {
        setFieldError(messageInput, document.getElementById("messageError"), "יש לכתוב כמה מילים על מה שאתה רוצה לשנות.");
        valid = false;
      } else {
        setFieldError(messageInput, document.getElementById("messageError"), "");
      }

      return valid;
    }

    [firstNameInput, phoneInput, messageInput].forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validate();
      });
    });

    function setSubmitting(isSubmitting) {
      submitBtn.disabled = isSubmitting;
      btnLabel.textContent = isSubmitting ? "שולח את הפרטים..." : defaultLabel;
    }

    function showStatus(message, kind) {
      statusEl.textContent = message;
      statusEl.classList.remove("status-success", "status-error");
      if (kind) statusEl.classList.add("status-" + kind);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Honeypot: a real visitor never fills this. Silently drop.
      if (honeypotInput && honeypotInput.value.trim() !== "") {
        form.reset();
        return;
      }

      if (!validate()) {
        showStatus("יש לתקן את השדות המסומנים למעלה.", "error");
        return;
      }

      var payload = {
        firstName: firstNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim(),
      };

      setSubmitting(true);
      showStatus("", null);

      if (!config.LEAD_ENDPOINT) {
        // No real destination configured yet — never claim success for
        // data that isn't actually going anywhere. See README for how
        // to connect api/lead.js (or another endpoint) via LEAD_ENDPOINT.
        window.console && console.warn("[lead-form] LEAD_ENDPOINT is not configured — see README.md");
        setTimeout(function () {
          setSubmitting(false);
          showStatus("לא הצלחנו לשלוח את הפרטים כרגע. אפשר לנסות שוב בעוד רגע.", "error");
          track("lead_submit_error", { reason: "not_configured" });
        }, 400);
        return;
      }

      fetch(config.LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed with status " + response.status);
          setSubmitting(false);
          showStatus("הפרטים נשלחו. אחזור אליך בהקדם כדי לבדוק אם הליווי מתאים לך.", "success");
          form.reset();
          track("lead_submit_success", {});
        })
        .catch(function () {
          setSubmitting(false);
          showStatus("לא הצלחנו לשלוח את הפרטים כרגע. אפשר לנסות שוב בעוד רגע.", "error");
          track("lead_submit_error", { reason: "network" });
        });
    });
  })();
})();
