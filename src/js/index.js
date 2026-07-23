import { initHeader } from "./header-fixed?indexPage";
import { initMenu } from "./menu?indexPage";
import { initSliders } from "./slider?indexPage";
import "/sass/index.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();

  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initSliders(), { timeout: 1000 });
  } else {
    setTimeout(initSliders, 200);
  }
});
