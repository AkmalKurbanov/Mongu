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
    requestIdleCallback(() => {
      initSliders();
      initTabs();
      initAccordion();
    }, { timeout: 1000 });
  } else {
    setTimeout(() => {
      initSliders();
      initTabs();
      initAccordion();
    }, 200);
  }
});
