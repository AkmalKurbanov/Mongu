import { initHeader } from "./header-fixed?categoriesPage";
import { initScrollTop } from "./scroll?categoriesPage";
import { initMenu } from "./menu?categoriesPage";         
import "/sass/categories.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
});