(() => {
  "use strict";
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const loader = document.getElementById("site-loader");
  const loaderSkip = document.getElementById("loader-skip");
  const loadingTargets = [...document.querySelectorAll(".skip-link, .site-header, main, .footer, .whatsapp-float, .back-to-top")];
  let loadingFinished = false;

  if (root.classList.contains("is-loading")) {
    loadingTargets.forEach(node => { node.inert = true; node.setAttribute("data-loading-inert", ""); });
    document.querySelector("main").setAttribute("aria-busy", "true");
  }

  function finishLoading() {
    if (loadingFinished) return;
    loadingFinished = true;
    const focusWasInLoader = loader.contains(document.activeElement);
    const wasLoading = root.classList.contains("is-loading");
    window.clearTimeout(window.jardineriaLoadingFallback);
    if (wasLoading && !reducedMotion.matches) loader.classList.add("is-leaving");
    root.classList.remove("is-loading");
    root.classList.add("site-ready");
    loadingTargets.forEach(node => { node.inert = false; node.removeAttribute("data-loading-inert"); });
    document.querySelector("main").removeAttribute("aria-busy");
    loader.setAttribute("aria-hidden", "true");
    loader.inert = true;
    if (focusWasInLoader) {
      const heading = document.querySelector("h1");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    window.setTimeout(() => { loader.hidden = true; loader.classList.remove("is-leaving"); }, reducedMotion.matches ? 0 : 420);
  }
  loaderSkip.addEventListener("click", finishLoading);
  window.addEventListener("pageshow", event => { if (event.persisted) finishLoading(); });
  const heroImage = document.querySelector(".hero-image");
  const heroReady = typeof heroImage.decode === "function" ? heroImage.decode().catch(() => {}) : new Promise(resolve => {
    if (heroImage.complete) resolve();
    else { heroImage.addEventListener("load", resolve, { once: true }); heroImage.addEventListener("error", resolve, { once: true }); }
  });
  Promise.race([heroReady, new Promise(resolve => window.setTimeout(resolve, 1800))]).then(() => {
    const elapsed = performance.now() - (window.jardineriaBootStarted || 0);
    window.setTimeout(finishLoading, reducedMotion.matches ? 0 : Math.max(0, 450 - elapsed));
  });

  const reveals = [...document.querySelectorAll(".reveal")];
  const groups = document.querySelectorAll(".benefits-grid, .service-grid, .gallery-grid, .steps, .reviews-grid");
  groups.forEach(group => {
    [...group.querySelectorAll(":scope > .reveal")].forEach((node, index) => {
      node.style.setProperty("--reveal-delay", Math.min(index, 3) * 80 + "ms");
    });
  });
  let revealObserver;
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px 24px 0px" });
    root.classList.add("motion-enabled");
    reveals.forEach(node => revealObserver.observe(node));
  } else reveals.forEach(node => node.classList.add("is-visible"));

  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".reading-progress span");
  const backToTop = document.querySelector(".back-to-top");
  const navLinks = [...document.querySelectorAll(".nav > a:not(.button)")];
  const sections = [
    { element: document.querySelector(".hero"), id: "#inicio" },
    { element: document.getElementById("servicios"), id: "#servicios" },
    { element: document.getElementById("trabajos"), id: "#trabajos" },
    { element: document.getElementById("resenas"), id: "#resenas" },
    { element: document.getElementById("contacto"), id: "#contacto" }
  ];
  let activeId = "";
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ")";
    backToTop.hidden = y < 650;
    let current = "#inicio";
    sections.forEach(section => {
      if (section.element.getBoundingClientRect().top <= window.innerHeight * 0.42) current = section.id;
    });
    if (current !== activeId) {
      activeId = current;
      navLinks.forEach(link => {
        const active = link.getAttribute("href") === current;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }
  function requestScrollUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  updateScroll();

  document.querySelectorAll("[data-service]").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelector('#contact-form select[name="servicio"]').value = link.dataset.service;
    });
  });

  const details = [...document.querySelectorAll(".faq-list details")];
  const detailAnimations = new Map();
  function expandDetail(item, expand) {
    const start = item.getBoundingClientRect().height;
    const previous = detailAnimations.get(item);
    if (previous) previous.cancel();
    item.dataset.expanded = String(expand);
    if (reducedMotion.matches || typeof item.animate !== "function") {
      item.open = expand;
      item.style.height = "";
      item.style.overflow = "";
      return;
    }
    item.open = true;
    item.style.height = "";
    const end = expand ? item.getBoundingClientRect().height : item.querySelector("summary").getBoundingClientRect().height + 1;
    item.style.height = start + "px";
    item.style.overflow = "hidden";
    const animation = item.animate([{ height: start + "px" }, { height: end + "px" }], {
      duration: 300, easing: "cubic-bezier(.22,.68,0,1)"
    });
    detailAnimations.set(item, animation);
    animation.onfinish = () => {
      item.open = expand;
      item.style.height = "";
      item.style.overflow = "";
      detailAnimations.delete(item);
    };
  }
  details.forEach(item => {
    item.dataset.expanded = String(item.open);
    item.querySelector("summary").addEventListener("click", event => {
      if (reducedMotion.matches || typeof item.animate !== "function") return;
      event.preventDefault();
      const expand = item.dataset.expanded !== "true";
      if (expand) details.filter(other => other !== item && other.open).forEach(other => expandDetail(other, false));
      expandDetail(item, expand);
    });
    item.addEventListener("toggle", () => {
      if (!reducedMotion.matches && typeof item.animate === "function") return;
      item.dataset.expanded = String(item.open);
      if (item.open) details.filter(other => other !== item).forEach(other => { other.open = false; other.dataset.expanded = "false"; });
    });
  });

  const lightboxImage = document.getElementById("lightbox-image");
  lightboxImage.addEventListener("load", () => {
    if (!reducedMotion.matches && typeof lightboxImage.animate === "function") {
      lightboxImage.animate([{ opacity: 0.3, transform: "scale(.985)" }, { opacity: 1, transform: "scale(1)" }], {
        duration: 260, easing: "ease-out"
      });
    }
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      root.classList.remove("motion-enabled");
      reveals.forEach(node => node.classList.add("is-visible"));
      if (revealObserver) revealObserver.disconnect();
      detailAnimations.forEach((animation, item) => {
        animation.cancel();
        item.open = item.dataset.expanded === "true";
        item.style.height = "";
        item.style.overflow = "";
      });
      detailAnimations.clear();
      finishLoading();
    }
  });
})();
