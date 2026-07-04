(function () {
  "use strict";

  /* ============================================================
     Environment flags
     ============================================================ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ============================================================
     Preloader (pure CSS/JS — no external dependency)
     ============================================================ */
  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");

  function hidePreloaderAndStart() {
    if (preloader) preloader.classList.add("is-hidden");
    document.body.classList.add("is-loaded");
    playHeroIntro();
  }

  if (preloaderFill) preloaderFill.style.width = "70%";

  window.addEventListener("load", () => {
    if (preloaderFill) preloaderFill.style.width = "100%";
    setTimeout(hidePreloaderAndStart, 320);
  });

  // Safety net: guarantees the page reveals itself no matter what.
  setTimeout(() => {
    if (preloader && !preloader.classList.contains("is-hidden")) hidePreloaderAndStart();
  }, 2200);

  /* ============================================================
     Hero intro — staggered CSS-transition reveal
     ============================================================ */
  function playHeroIntro() {
    const lines = document.querySelectorAll(".reveal-line > span");
    lines.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.12}s`;
      requestAnimationFrame(() => (el.style.transform = "translateY(0%)"));
    });

    const heroBits = document.querySelectorAll("[data-hero-reveal]");
    heroBits.forEach((el, i) => {
      el.style.transitionDelay = `${0.35 + i * 0.12}s`;
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });

    initScrollReveal();
  }

  /* ============================================================
     Scroll-triggered reveal for everything else
     ============================================================ */
  function initScrollReveal() {
    const targets = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => observer.observe(el));
  }

  /* ============================================================
     Hero parallax (waves, grid, telemetry) — plain scroll listener
     ============================================================ */
  function initHeroParallax() {
    if (prefersReducedMotion) return;

    const hero = document.querySelector(".hero");
    const wave1 = document.querySelector(".wave--1");
    const wave2 = document.querySelector(".wave--2");
    const wave3 = document.querySelector(".wave--3");
    const grid = document.querySelector(".hero__grid");
    const telemetryLayer = document.querySelector(".telemetry-layer");
    if (!hero) return;

    let ticking = false;

    function update() {
      ticking = false;
      const heroHeight = hero.offsetHeight || 1;
      const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

      if (wave1) wave1.style.transform = `translateY(${progress * 140}px)`;
      if (wave2) wave2.style.transform = `translateY(${progress * -100}px)`;
      if (wave3) wave3.style.transform = `translate(${progress * -40}px, ${progress * 80}px)`;
      if (grid) grid.style.opacity = String(1 - progress * 0.8);

      if (telemetryLayer) {
        const t = Math.max(0, (progress - 0.55) / 0.45);
        telemetryLayer.style.transform = `translateY(${t * -60}px)`;
        telemetryLayer.style.opacity = String(1 - t);
      }
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }
  initHeroParallax();

  /* ============================================================
     Nav: scroll shadow + mobile toggle
     ============================================================ */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================================
     Animated counters (telemetry + stat chips)
     ============================================================ */
  let countersPlayed = false;

  function animateCounters() {
    if (countersPlayed) return;
    countersPlayed = true;

    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const duration = 1300;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    const heroSection = document.querySelector(".hero");
    if (heroSection) counterObserver.observe(heroSection);
  } else {
    animateCounters();
  }

  /* ============================================================
     FAQ accordion
     ============================================================ */
  const accordionItems = document.querySelectorAll(".accordion__item");

  accordionItems.forEach((item) => {
    const trigger = item.querySelector(".accordion__trigger");
    const panel = item.querySelector(".accordion__panel");

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      accordionItems.forEach((other) => {
        if (other === item) return;
        const otherTrigger = other.querySelector(".accordion__trigger");
        const otherPanel = other.querySelector(".accordion__panel");
        otherTrigger.setAttribute("aria-expanded", "false");
        otherPanel.style.maxHeight = null;
      });

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
    });
  });

  /* ============================================================
     Contact form validation
     ============================================================ */
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("formSuccess");

  function setError(fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    const wrapper = field ? field.closest(".form__field") : null;

    if (errorEl) errorEl.textContent = message || "";
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    let valid = true;

    const name = form.name.value.trim();
    if (!name) {
      setError("name", "Please enter your name.");
      valid = false;
    } else setError("name", "");

    const email = form.email.value.trim();
    if (!email) {
      setError("email", "Please enter your email.");
      valid = false;
    } else if (!isValidEmail(email)) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    } else setError("email", "");

    const sport = form.sport.value;
    if (!sport) {
      setError("sport", "Please choose a sport.");
      valid = false;
    } else setError("sport", "");

    return valid;
  }

  if (form) {
    ["name", "email", "sport"].forEach((fieldName) => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.addEventListener("input", () => setError(fieldName, ""));
        field.addEventListener("change", () => setError(fieldName, ""));
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      successMsg.classList.remove("is-visible");
      if (!validateForm()) return;

      const submitBtn = form.querySelector(".form__submit");
      const submitText = form.querySelector(".form__submit-text");
      const originalText = submitText.textContent;

      submitBtn.disabled = true;
      submitText.textContent = "Sending...";

      setTimeout(() => {
        submitBtn.disabled = false;
        submitText.textContent = originalText;
        successMsg.classList.add("is-visible");
        form.reset();
      }, 700);
    });
  }

  /* ============================================================
     Cursor glow (desktop only)
     ============================================================ */
  function initCursorGlow() {
    if (isTouch) return;
    const glow = document.getElementById("cursorGlow");
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.classList.add("is-active");
    });

    function loop() {
      x += (mouseX - x) * 0.14;
      y += (mouseY - y) * 0.14;
      glow.style.left = x + "px";
      glow.style.top = y + "px";
      requestAnimationFrame(loop);
    }
    loop();
  }
  initCursorGlow();

  /* ============================================================
     Magnetic buttons — CSS transition handles the easing
     ============================================================ */
  function initMagneticButtons() {
    if (isTouch) return;
    document.querySelectorAll(".btn--magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const b = btn.getBoundingClientRect();
        const x = (e.clientX - b.left - b.width / 2) * 0.3;
        const y = (e.clientY - b.top - b.height / 2) * 0.5;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }
  initMagneticButtons();

  /* ============================================================
     3D tilt on glass cards — CSS transition handles the easing
     ============================================================ */
  function initTilt() {
    if (isTouch) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const b = card.getBoundingClientRect();
        const cx = (e.clientX - b.left) / b.width - 0.5;
        const cy = (e.clientY - b.top) / b.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${cy * -7}deg) rotateY(${cx * 7}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }
  initTilt();
})();
