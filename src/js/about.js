import { initHeader } from "./header-fixed?aboutPage";
import { initScrollTop } from "./scroll?aboutPage";
import { initMenu } from "./menu?aboutPage";
import { initSliders } from "./slider?aboutPage";
import "/sass/about.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();

  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initSliders(), { timeout: 1000 });
  } else {
    setTimeout(initSliders, 200);
  }
  
});
