import { initHeader } from "./header-fixed?bookingPage";
import { initMenu } from "./menu?bookingPage";
import { BookingSystem } from "./booking-system?bookingPage";
// import { initSliders } from "./slider?indexPage";
import "/sass/booking.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
  new BookingSystem('.js-booking-container');
  // if ("requestIdleCallback" in window) {
  //   requestIdleCallback(() => initSliders(), { timeout: 1000 });
  // } else {
  //   setTimeout(initSliders, 200);
  // }
});
