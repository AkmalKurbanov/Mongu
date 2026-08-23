import { initHeader } from "./header-fixed?guidePage";
import { initScrollTop } from "./scroll?guidePage";
import { initMenu } from "./menu?guidePage";         
import "/sass/guide.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
});