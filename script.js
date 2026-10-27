(() => {
  "use strict";
  const config = window.JARDINERIA_CONFIG || {};
  const digits = String(config.whatsapp || "").replace(/\D/g, "");
  const whatsappReady = /^\d{8,15}$/.test(digits);
  const demoDialog = document.getElementById("demo-dialog");
  const showDemo = () => { if (!demoDialog.open) demoDialog.showModal(); };
  demoDialog.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => demoDialog.close()));
  demoDialog.addEventListener("click", event => { if (event.target === demoDialog) demoDialog.close(); });

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  const siteHeader = document.querySelector(".site-header");
  const closeMenu = () => {
    siteHeader.classList.remove("menu-open");
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    nav.classList.toggle("open", !isOpen);
    siteHeader.classList.toggle("menu-open", !isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("click", event => {
    if (!nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  const galleryButtons = [...document.querySelectorAll("[data-gallery-index]")];
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCount = document.getElementById("lightbox-count");
  let activeImage = 0;
  let galleryTrigger = null;
  function setGalleryImage(index) {
    activeImage = (index + galleryButtons.length) % galleryButtons.length;
    const source = galleryButtons[activeImage].querySelector("img");
    lightboxImage.src = source.src;
    lightboxImage.alt = source.alt;
    lightboxCaption.textContent = source.alt + " · Imagen de referencia";
    lightboxCount.textContent = (activeImage + 1) + " / " + galleryButtons.length;
  }
  galleryButtons.forEach((button, index) => button.addEventListener("click", () => {
    galleryTrigger = button;
    setGalleryImage(index);
    lightbox.showModal();
  }));
  const closeGallery = () => { lightbox.close(); if (galleryTrigger) galleryTrigger.focus(); };
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeGallery);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => setGalleryImage(activeImage - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => setGalleryImage(activeImage + 1));
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeGallery(); });
  lightbox.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") setGalleryImage(activeImage - 1);
    if (event.key === "ArrowRight") setGalleryImage(activeImage + 1);
  });

  const form = document.getElementById("contact-form");
  const formError = document.getElementById("form-error");
  form.addEventListener("submit", event => {
    event.preventDefault();
    formError.hidden = true;
    const fields = [...form.querySelectorAll("input[required], select[required], textarea[required]")];
    for (const field of fields) {
      if (typeof field.value === "string") field.value = field.value.trim();
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return;
      }
    }
    if (!whatsappReady) {
      showDemo();
      return;
    }
    const data = new FormData(form);
    const message = [
      "Hola, Jardinería Total. Quisiera hacer una consulta.",
      "",
      "Nombre: " + data.get("nombre"),
      "Zona: " + data.get("zona"),
      "Servicio de interés: " + data.get("servicio"),
      "Mensaje: " + data.get("mensaje")
    ].join("\n");
    const url = "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
    window.location.assign(url);
  });

  document.getElementById("whatsapp-float").addEventListener("click", () => {
    if (!whatsappReady) { showDemo(); return; }
    window.location.assign("https://wa.me/" + digits + "?text=" + encodeURIComponent("Hola, Jardinería Total. Quisiera hacer una consulta."));
  });
  document.getElementById("availability-link").addEventListener("click", () => {
    window.setTimeout(() => form.elements.zona.focus({ preventScroll: true }), 450);
  });

  const socialContainer = document.getElementById("social-links");
  const social = config.redes || {};
  const links = [{ key: "instagram", text: "Instagram" }, { key: "facebook", text: "Facebook" }];
  links.forEach(item => {
    const value = String(social[item.key] || "").trim();
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return;
      const anchor = document.createElement("a");
      anchor.href = url.href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = item.text;
      socialContainer.append(anchor);
    } catch {}
  });
  document.getElementById("year").textContent = new Date().getFullYear();

})();
