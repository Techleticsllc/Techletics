(function () {
  "use strict";

  /* ============================================================
     Environment flags
     ============================================================ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ============================================================
     Preloader Management
     ============================================================ */
  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");

  function hidePreloaderAndStart() {
    if (preloader) {
      preloader.style.opacity = "0";
      preloader.style.pointerEvents = "none";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }
    document.body.classList.add("is-loaded");
    playHeroIntro();
  }

  if (preloaderFill) preloaderFill.style.width = "70%";

  window.addEventListener("load", () => {
    if (preloaderFill) preloaderFill.style.width = "100%";
    setTimeout(hidePreloaderAndStart, 300);
  });

  // Safeguard: Force close preloader if loading takes too long
  setTimeout(() => {
    if (preloader && preloader.style.display !== "none") {
      console.warn("Preloader timeout reached. Forcing page display.");
      hidePreloaderAndStart();
    }
  }, 2000);

  /* ============================================================
     Hero Intro & Reveal Animations
     ============================================================ */
  function playHeroIntro() {
    const lines = document.querySelectorAll(".reveal-line > span");
    lines.forEach((el, i) => {
      el.style.transform = "translateY(0%)";
    });

    const heroBits = document.querySelectorAll("[data-hero-reveal]");
    heroBits.forEach((el) => {
      el.classList.add("is-visible");
    });

    initScrollReveal();
  }

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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => observer.observe(el));
  }

  /* ============================================================
     UI Component Interactions (Nav, Accoridion, Form)
     ============================================================ */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (nav) {
    window.addEventListener("scroll", () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 10);
    }, { passive: true });
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".accordion__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion__item");
      const panel = item.querySelector(".accordion__panel");
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      
      trigger.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  });

  /* ============================================================
     Three.js 3D Engine Integration
     ============================================================ */
  function initThreeDScenes() {
    if (typeof THREE === 'undefined') {
      console.error("Three.js Core Library is missing. Please verify the CDN script tag in index.html.");
      return;
    }

    // 1. Generate a procedural pebbled leather texture directly in code (eliminates file loading errors)
    const createPebbledTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Base midtone grey for normal/bump map mapping
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw high-density micro-pebbles
      for (let i = 0; i < 40000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5 + 0.5;
        ctx.fillStyle = Math.random() > 0.5 ? '#9a9a9a' : '#666666';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };

    const leatherBumpMap = createPebbledTexture();

    // 2. Instance builder function
    function createBallInstance(canvasId, scale) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;

      const container = canvas.parentElement;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || 450;

      // Scene setup
      const scene = new THREE.Scene();
      
      // Camera Setup
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 6.5;

      // Renderer Setup
      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Dynamic Athletic Lighting Configuration
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const highKeyLight = new THREE.DirectionalLight(0xffffff, 0.9);
      highKeyLight.position.set(5, 5, 4);
      scene.add(highKeyLight);

      const rimBlueLight = new THREE.DirectionalLight(0x00e5ff, 0.5);
      rimBlueLight.position.set(-5, -3, -2);
      scene.add(rimBlueLight);

      // Sphere Setup (Athletic Tech-Blue Basketball Base)
      const geometry = new THREE.SphereGeometry(1.8 * scale, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        color: 0x112b56, // Deep vibrant core athletic blue
        bumpMap: leatherBumpMap,
        bumpScale: 0.015,
        roughness: 0.45,
        metalness: 0.1
      });

      const ballMesh = new THREE.Mesh(geometry, material);
      
      // Slightly tilt toward camera for professional display alignment
      ballMesh.rotation.x = 0.3;
      ballMesh.rotation.z = -0.1;
      scene.add(ballMesh);

      return { canvas, container, scene, camera, renderer, ballMesh };
    }

    // Initialize targets
    const renderTargets = [
      createBallInstance('heroCanvas', 1.1),
      createBallInstance('productCanvas', 0.95)
    ].filter(Boolean);

    // 3. Continuous Animation Rendering Loop
    function frameLoop() {
      requestAnimationFrame(frameLoop);
      
      renderTargets.forEach(target => {
        if (!prefersReducedMotion) {
          target.ballMesh.rotation.y += 0.004; // Smooth, continuous steady tracking rotation
        }
        target.renderer.render(target.scene, target.camera);
      });
    }
    
    if (renderTargets.length > 0) {
      frameLoop();
    }

    // 4. Responsive Viewport Recalculation Handler
    window.addEventListener('resize', () => {
      renderTargets.forEach(target => {
        const w = target.container.clientWidth || window.innerWidth;
        const h = target.container.clientHeight || 450;
        
        target.camera.aspect = w / h;
        target.camera.updateProjectionMatrix();
        target.renderer.setSize(w, h);
      });
    });
  }

  // Trigger setup logic safely depending on execution state
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initThreeDScenes);
  } else {
    initThreeDScenes();
  }

})();
