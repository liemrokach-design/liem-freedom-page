(function(){
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  // Staggered scroll-reveal
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

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var siblings = groups.get(el.parentElement) || [el];
          var index = siblings.indexOf(el);
          setTimeout(function () {
            el.classList.add("in-view");
          }, Math.min(index * 90, 450));
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // Sticky mobile CTA: show after hero, hide once the offer card is on screen
  var stickyCta = document.getElementById("stickyCta");
  var hero = document.querySelector(".hero");
  var offer = document.getElementById("offer");

  if (stickyCta && hero && offer && "IntersectionObserver" in window) {
    var heroPassed = false;
    var offerVisible = false;

    var updateSticky = function () {
      if (heroPassed && !offerVisible) {
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
        offerVisible = entries[0].isIntersecting;
        updateSticky();
      },
      { threshold: 0.2 }
    ).observe(offer);
  }

  // Hero video: swap the poster/play button for a YouTube embed on click
  var heroVideo = document.getElementById("heroVideo");
  var heroVideoTrigger = document.getElementById("heroVideoTrigger");

  if (heroVideo && heroVideoTrigger) {
    heroVideoTrigger.addEventListener("click", function () {
      var videoId = heroVideo.getAttribute("data-video-id");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
      iframe.className = "hero-video-frame";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("title", "סרטון של ליאם");
      heroVideo.innerHTML = "";
      heroVideo.appendChild(iframe);
    });
  }
})();
