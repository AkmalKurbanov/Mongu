import { initHeader } from "./header-fixed?indexPage";
import { initScrollTop } from "./scroll?indexPage";
import { initMenu } from "./menu?indexPage";
import { initSliders } from "./slider?indexPage";
import "/sass/index.sass";

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
