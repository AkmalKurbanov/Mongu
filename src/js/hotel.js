import { initHeader } from "./header-fixed?hotelPage";
import { initScrollTop } from "./scroll?hotelPage";
import { initMenu } from "./menu?hotelPage";
import { BookingSystem } from "./booking-system?hotelPage";
import { initSliders } from "./slider?hotelPage";
import "/sass/hotel.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
  new BookingSystem('.js-booking-container');
    if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initSliders(), { timeout: 1000 });
  } else {
    setTimeout(initSliders, 200);
  }
});
