(() => {
  "use strict";
  document.querySelectorAll("[data-comparison]").forEach(view => {
    const range = view.querySelector(".comparison-range");
    const beforeLabel = view.querySelector(".comparison-label-before");
    const afterLabel = view.querySelector(".comparison-label-after");
    let activePointer = null;
    function render() {
      const value = Math.min(100, Math.max(0, Number(range.value)));
      view.style.setProperty("--compare", value + "%");
      range.setAttribute("aria-valuetext", value + "% de la imagen antes visible");
      beforeLabel.style.opacity = value > 8 ? "1" : "0";
      afterLabel.style.opacity = value < 92 ? "1" : "0";
    }
    function move(clientX) {
      const rect = view.getBoundingClientRect();
      range.value = String(Math.round((clientX - rect.left) / rect.width * 100));
      render();
    }
    range.addEventListener("input", render);
    range.addEventListener("pointerdown", event => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      activePointer = event.pointerId;
      range.focus({ preventScroll: true });
      range.setPointerCapture(event.pointerId);
      view.classList.add("is-comparing");
      move(event.clientX);
    });
    range.addEventListener("pointermove", event => {
      if (activePointer === event.pointerId) move(event.clientX);
    });
    function release(event) {
      if (activePointer !== event.pointerId) return;
      activePointer = null;
      view.classList.remove("is-comparing");
      if (range.hasPointerCapture(event.pointerId)) range.releasePointerCapture(event.pointerId);
    }
    range.addEventListener("pointerup", release);
    range.addEventListener("pointercancel", release);
    range.addEventListener("lostpointercapture", () => { activePointer = null; view.classList.remove("is-comparing"); });
    render();
  });
  // Pause a clip when the visitor moves on or leaves the browser tab.
  const videos = [...document.querySelectorAll(".work-video video")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) entry.target.pause();
    }), { threshold: 0.05 });
    videos.forEach(video => observer.observe(video));
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
})();
