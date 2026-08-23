import { initHeader } from "./header-fixed?lodgePage";
import { initScrollTop } from "./scroll?lodgePage";
import { initMenu } from "./menu?lodgePage";
import "/sass/lodge.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
});
