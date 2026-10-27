(() => {
  "use strict";
  const root = document.documentElement;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const fullMotion = () => root.dataset.motion === "full";
  let frame = 0;
  const visibleImages = new Set();
  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(".hero-image");
  const heroContent = document.querySelector(".hero-content");

  // Keep each heading's real text and emphasis inside clipped, staggered lines.
  const titles = [...document.querySelectorAll("main h1, main h2")];
  titles.forEach(title => {
    const lines = [document.createDocumentFragment()];
    [...title.childNodes].forEach(node => {
      if (node.nodeName === "BR") lines.push(document.createDocumentFragment());
      else lines[lines.length - 1].append(node);
    });
    lines.forEach((content, index) => {
      const line = document.createElement("span");
      const text = document.createElement("span");
      line.className = "title-line";
      text.className = "title-text";
      text.style.setProperty("--line-delay", index * 130 + "ms");
      text.append(content);
      line.append(text);
      title.append(line);
    });
    title.querySelectorAll(":scope > br").forEach(node => node.remove());
    title.classList.add("cinema-title");
  });

  const images = [...document.querySelectorAll(".service-image, .gallery-item")];
  images.forEach((container, index) => {
    container.classList.add("cinema-frame");
    container.style.setProperty("--image-delay", (index % 3) * 90 + "ms");
    container.querySelector("img").classList.add("cinema-image");
  });

  const entrances = [...titles.filter(title => title.tagName !== "H1"), ...images];
  if ("IntersectionObserver" in window) {
    const entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("cinema-in");
          entranceObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });
    entrances.forEach(node => entranceObserver.observe(node));
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleImages.add(entry.target);
        else visibleImages.delete(entry.target);
      });
      scheduleFrame();
    }, { rootMargin: "100px 0px" });
    images.forEach(node => imageObserver.observe(node));
  } else entrances.forEach(node => node.classList.add("cinema-in"));

  function renderFrame() {
    frame = 0;
    if (!fullMotion() || document.hidden) return;
    const viewport = window.innerHeight;
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > 0) {
      heroImage.style.setProperty("--hero-y", Math.min(42, Math.max(0, -heroRect.top) * 0.065).toFixed(2) + "px");
      heroContent.style.setProperty("--hero-copy-y", Math.min(20, Math.max(0, -heroRect.top) * 0.03).toFixed(2) + "px");
    }
    // Only measure images near the viewport, on a single scroll animation frame.
    const positions = [...visibleImages].map(node => ({ node, rect: node.getBoundingClientRect() }));
    positions.forEach(({ node, rect }) => {
      const position = (viewport / 2 - rect.top - rect.height / 2) / viewport;
      const offset = Math.max(-12, Math.min(12, position * 24));
      node.style.setProperty("--image-y", offset.toFixed(2) + "px");
    });
  }
  function scheduleFrame() {
    if (!frame && fullMotion()) frame = window.requestAnimationFrame(renderFrame);
  }
  window.addEventListener("scroll", scheduleFrame, { passive: true });
  window.addEventListener("resize", scheduleFrame, { passive: true });
  document.addEventListener("visibilitychange", scheduleFrame);

  // Cursor responses stay small and never move a control's hit target.
  [...images, ...document.querySelectorAll(".hero-actions .button, .area-card .button")].forEach(node => {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    node.addEventListener("pointermove", event => {
      if (!fullMotion() || !finePointer.matches) return;
      const rect = node.getBoundingClientRect();
      const range = node.classList.contains("cinema-frame") ? 5 : 3;
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * range * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * range * 2;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(() => {
        pointerFrame = 0;
        node.style.setProperty("--pointer-x", pointerX.toFixed(2) + "px");
        node.style.setProperty("--pointer-y", pointerY.toFixed(2) + "px");
      });
    });
    node.addEventListener("pointerleave", () => {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      node.style.setProperty("--pointer-x", "0px");
      node.style.setProperty("--pointer-y", "0px");
    });
  });

  document.addEventListener("focusin", event => {
    event.target.closest?.(".cinema-frame")?.classList.add("cinema-in");
  });
  window.addEventListener("beforeprint", () => entrances.forEach(node => node.classList.add("cinema-in")));
  root.classList.add("cinema-ready");
  scheduleFrame();
})();
