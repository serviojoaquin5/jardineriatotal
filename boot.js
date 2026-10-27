(() => {
  const root = document.documentElement;
  root.classList.add("js", "is-loading");
  window.jardineriaBootStarted = performance.now();
  document.addEventListener("DOMContentLoaded", () => {
    if (!root.classList.contains("is-loading")) return;
    document.querySelectorAll(".skip-link, .site-header, main, .footer, .whatsapp-float, .back-to-top").forEach(node => {
      node.inert = true;
      node.setAttribute("data-loading-inert", "");
    });
    document.querySelector("main")?.setAttribute("aria-busy", "true");
  }, { once: true });

  window.jardineriaLoadingFallback = window.setTimeout(() => {
    root.classList.remove("is-loading", "motion-enabled");
    root.classList.add("site-ready");
    document.querySelectorAll("[data-loading-inert]").forEach(node => {
      node.inert = false;
      node.removeAttribute("data-loading-inert");
    });
    document.querySelector("main")?.removeAttribute("aria-busy");
    const loader = document.getElementById("site-loader");
    if (loader) { loader.hidden = true; loader.setAttribute("aria-hidden", "true"); }
  }, 3000);
})();
