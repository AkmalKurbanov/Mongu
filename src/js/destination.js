import { initHeader } from "./header-fixed?destinationPage";
import { initScrollTop } from "./scroll?destinationPage";
import { initMenu } from "./menu?destinationPage";
import "/sass/destination.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
});
