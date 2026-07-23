export const initAccordion = () => {
  document.querySelectorAll(".js-accordion").forEach(accordion => {
    accordion.addEventListener("click", e => {
      const header = e.target.closest(".accordion__header");
      if (!header) return;

      const content = document.getElementById(header.getAttribute("aria-controls"));
      const isExpanded = header.getAttribute("aria-expanded") === "true";

      // Закрытие при открытии новой
      /*
      accordion.querySelectorAll('.accordion__header').forEach(h => {
        h.setAttribute('aria-expanded', 'false');
        document.getElementById(h.getAttribute('aria-controls')).hidden = true;
      });
      */

      header.setAttribute("aria-expanded", !isExpanded);
      content.setAttribute("aria-hidden", isExpanded);
      accordion.classList.toggle("accordion_active", !isExpanded);
    });
  });
};
