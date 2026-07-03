(function () {
  "use strict";

  /* ============================================================
     Environment flags
     ============================================================ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasThree = typeof window.THREE !== "undefined";

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ============================================================
     Preloader
     ============================================================ */
  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");

  function hidePreloaderAndStart() {
    if (preloader) preloader.classList.add("is-hidden");
    document.body.classList.add("is-loaded");
    playHeroIntro();
  }

  if (hasGSAP) {
    gsap.to(preloaderFill, { width: "78%", duration: 1.1, ease: "power1.inOut" });
  } else if (preloaderFill) {
    preloaderFill.style.width = "78%";
  }

  window.addEventListener("load", () => {
    const finish = () => setTimeout(hidePreloaderAndStart, 260);
    if (hasGSAP) {
      gsap.to(preloaderFill, { width: "100%", duration: 0.45, ease: "power1.out", onComplete: finish });
    } else {
      if (preloaderFill) preloaderFill.style.width = "100%";
      finish();
    }
  });

  // Safety net: never let the preloader trap the page.
  setTimeout(() => {
    if (preloader && !preloader.classList.contains("is-hidden")) hidePreloaderAndStart();
  }, 3500);

  /* ============================================================
     Hero intro timeline
     ============================================================ */
  function playHeroIntro() {
    const lines = document.querySelectorAll(".reveal-line > span");
    const heroBits = document.querySelectorAll("[data-hero-reveal]");

    if (!hasGSAP) {
      lines.forEach((l) => (l.style.transform = "translateY(0)"));
      heroBits.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      initScrollReveal();
      return;
    }

    gsap.set(heroBits, { opacity: 0, y: 24 });

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(lines, { y: "0%", duration: 1.1, stagger: 0.12 })
      .to(heroBits, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, "-=0.6");

    initScrollReveal();
  }

  /* ============================================================
     Scroll-triggered reveal for all other sections
     ============================================================ */
  function initScrollReveal() {
    const targets = document.querySelectorAll("[data-reveal]");

    if (!hasGSAP || !window.ScrollTrigger) {
      targets.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    targets.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: (i % 4) * 0.06,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Parallax on hero gradient waves
    gsap.to(".wave--1", {
      y: 140,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });
    gsap.to(".wave--2", {
      y: -100,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });
    gsap.to(".wave--3", {
      y: 80,
      x: -40,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });
    gsap.to(".hero__grid", {
      opacity: 0.2,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });
    gsap.to(".telemetry-layer", {
      y: -60,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "60% top", end: "bottom top", scrub: 0.6 },
    });

    // Section title micro parallax
    document.querySelectorAll(".section-title").forEach((title) => {
      gsap.fromTo(
        title,
        { y: 40 },
        {
          y: -10,
          ease: "none",
          scrollTrigger: { trigger: title, start: "top bottom", end: "bottom top", scrub: 0.8 },
        }
      );
    });
  }

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
  const counterGroups = [document.querySelector(".hero__stats"), document.querySelector(".telemetry-layer")];
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
     Magnetic buttons
     ============================================================ */
  function initMagneticButtons() {
    if (isTouch || !hasGSAP) return;
    document.querySelectorAll(".btn--magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const b = btn.getBoundingClientRect();
        const x = e.clientX - b.left - b.width / 2;
        const y = e.clientY - b.top - b.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.5, duration: 0.4, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }
  initMagneticButtons();

  /* ============================================================
     3D tilt on glass cards
     ============================================================ */
  function initTilt() {
    if (isTouch || !hasGSAP) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.style.transformStyle = "preserve-3d";

      card.addEventListener("mousemove", (e) => {
        const b = card.getBoundingClientRect();
        const cx = (e.clientX - b.left) / b.width - 0.5;
        const cy = (e.clientY - b.top) / b.height - 0.5;
        gsap.to(card, {
          rotateX: cy * -7,
          rotateY: cx * 7,
          duration: 0.5,
          ease: "power2.out",
          transformPerspective: 800,
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power3.out" });
      });
    });
  }
  initTilt();

  /* ============================================================
     Three.js — smart ball scenes
     ============================================================ */
function createBallTextures() {
  const size = 1024;
  const base = document.createElement("canvas");
  base.width = base.height = size;
  const bctx = base.getContext("2d");
  
  // 1. Base Dark Background Gradient
  const bg = bctx.createRadialGradient(
    size * 0.35, size * 0.28, size * 0.05,
    size * 0.5, size * 0.5, size * 0.78
  );
  bg.addColorStop(0, "#3d3d44");
  bg.addColorStop(0.55, "#18181c");
  bg.addColorStop(1, "#050506");
  
  bctx.fillStyle = bg;
  bctx.fillRect(0, 0, size, size);

  // 2. Base Text Overlay
  bctx.save();
  bctx.textAlign = "center";
  bctx.textBaseline = "middle";
  bctx.fillStyle = "#FF5B2E"; 
  bctx.font = "bold 56px 'Space Grotesk', sans-serif";
  bctx.fillText("TECHLETICS", size * 0.5, size * 0.3);

  bctx.font = "600 22px 'Inter', sans-serif";
  bctx.fillText("YOUR GAME, UPGRADED", size * 0.5, size * 0.3 + 55);
  bctx.restore();

    function drawSeams(ctx, glow) {
      ctx.save();
      ctx.lineWidth = size * 0.009;
      ctx.lineCap = "round";
      if (glow) {
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, "#FF5B2E");
        grad.addColorStop(1, "#00E5FF");
        ctx.strokeStyle = grad;
        ctx.shadowColor = "#FF8A5C";
        ctx.shadowBlur = size * 0.018;
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
      }
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.14, 0);
      ctx.quadraticCurveTo(size * 0.36, size / 2, size * 0.14, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.86, 0);
      ctx.quadraticCurveTo(size * 0.64, size / 2, size * 0.86, size);
      ctx.stroke();
      ctx.restore();
    }

    drawSeams(bctx, false);
    drawSeams(ectx, true);

    const baseTex = new THREE.CanvasTexture(base);
    const emissiveTex = new THREE.CanvasTexture(emissive);
    return { baseTex, emissiveTex };
  }

  function initBallScene(canvas, opts) {
    if (!canvas || !hasThree) return null;

    const options = Object.assign(
      { particles: false, interactive: false, autoRotateSpeed: 1 },
      opts
    );

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) {
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    const group = new THREE.Group();
    scene.add(group);

    const { baseTex, emissiveTex } = createBallTextures();
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map: baseTex,
      emissive: new THREE.Color(0xff5b2e),
      emissiveMap: emissiveTex,
      emissiveIntensity: 1.1,
      roughness: 0.4,
      metalness: 0.2,
    });
    const ball = new THREE.Mesh(geo, mat);
    group.add(ball);

    const keyLight = new THREE.PointLight(0x00e5ff, 1.5, 20);
    keyLight.position.set(-3, 2, 3);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xff5b2e, 1.7, 20);
    rimLight.position.set(3, -1.2, -2);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0x404050, 0.7));

    // Orbiting data ring
    const ringCount = 140;
    const ringPositions = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * Math.PI * 2;
      ringPositions[i * 3] = Math.cos(a) * 1.65;
      ringPositions[i * 3 + 1] = Math.sin(a) * 1.65 * 0.32;
      ringPositions[i * 3 + 2] = Math.sin(a) * 1.65 * 0.22;
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
    const ringMat = new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.032, transparent: true, opacity: 0.85 });
    const dataRing = new THREE.Points(ringGeo, ringMat);
    dataRing.rotation.x = 0.55;
    group.add(dataRing);

    // Ambient background particle field (hero only)
    let field = null;
    if (options.particles) {
      const count = 700;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 3.2 + Math.random() * 9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
        positions[i * 3 + 2] = r * Math.cos(phi) - 3.5;
      }
      const fgeo = new THREE.BufferGeometry();
      fgeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const fmat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.018, transparent: true, opacity: 0.45 });
      field = new THREE.Points(fgeo, fmat);
      scene.add(field);
    }

    // Interactive parallax tilt toward pointer
    let targetX = 0;
    let targetY = 0;
    if (options.interactive && !isTouch) {
      window.addEventListener("mousemove", (e) => {
        targetX = e.clientX / window.innerWidth - 0.5;
        targetY = e.clientY / window.innerHeight - 0.5;
      });
    }

    let scrollTilt = 0;

    function resize() {
      const parent = canvas.parentElement;
      const w = parent.clientWidth || 1;
      const h = parent.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    let visible = true;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((entry) => (visible = entry.isIntersecting)),
        { threshold: 0.05 }
      );
      io.observe(canvas.parentElement);
    }

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;

      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        ball.rotation.y += 0.0032 * options.autoRotateSpeed;
        group.position.y = Math.sin(t * 0.6) * 0.09;
        dataRing.rotation.z = t * 0.16;
        if (field) field.rotation.y = t * 0.015;
      }

      if (options.interactive) {
        group.rotation.y += (targetX * 0.55 - group.rotation.y) * 0.03;
        group.rotation.x += (targetY * 0.35 - group.rotation.x) * 0.03;
      } else {
        group.rotation.x += (scrollTilt - group.rotation.x) * 0.06;
      }

      mat.emissiveIntensity = 1.0 + Math.sin(t * 1.7) * 0.35;

      renderer.render(scene, camera);
    }
    animate();

    return {
      setScrollTilt(v) {
        scrollTilt = v;
      },
    };
  }

  const heroBall = initBallScene(document.getElementById("heroCanvas"), {
    particles: true,
    interactive: true,
    autoRotateSpeed: 1,
  });

  const productBall = initBallScene(document.getElementById("productCanvas"), {
    particles: false,
    interactive: false,
    autoRotateSpeed: 0.6,
  });

  // Tie the product ball's tilt to scroll progress through its section for a "spin through the specs" feel
  if (productBall && hasGSAP && window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: ".product",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.5,
      onUpdate: (self) => {
        productBall.setScrollTilt((self.progress - 0.5) * 0.9);
      },
    });
  }
})();
