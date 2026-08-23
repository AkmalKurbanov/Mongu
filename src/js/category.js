import { initHeader } from "./header-fixed?categoryPage";
import { initScrollTop } from "./scroll?categoryPage";
import { initMenu } from "./menu?categoryPage";         
import "/sass/category.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
});