import { initHeader } from "./header-fixed?bookingPage";
import { initScrollTop } from "./scroll?bookingPage";
import { initMenu } from "./menu?bookingPage";
import { BookingSystem } from "./booking-system?bookingPage";
import "/sass/booking.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
  new BookingSystem('.js-booking-container');
});
