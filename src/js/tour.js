import { initHeader } from "./header-fixed?indexPage";
import { initMenu } from "./menu?indexPage";
import { initSliders } from "./slider?indexPage";
import { initTabs } from "./tabs?indexPage";
import { initAccordion } from "./accordion?indexPage";
import "/sass/tour.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();

  if ("requestIdleCallback" in window) {
    requestIdleCallback(
      () => {
        initSliders();
        initTabs();
        initAccordion();
      },
      { timeout: 1000 }
    );
  } else {
    setTimeout(() => {
      initSliders();
      initTabs();
      initAccordion();
    }, 200);
  }

  document.addEventListener("click", e => {
    const btn = e.target.closest(".js-book-btn");
    if (!btn) return; // Если клик не по кнопке - игнорируем

    e.preventDefault();

    // Берем ID тура (например, "ala-archa") из атрибута кнопки
    const tourId = btn.dataset.tourId;

    // Переходим на страницу бронирования и передаем ID прямо в ссылке!
    if (tourId) {
      window.location.href = `/booking.html?tour=${tourId}`;
    } else {
      window.location.href = `/booking.html`;
    }
  });

});
