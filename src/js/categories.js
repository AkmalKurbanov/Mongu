import { initHeader } from "./header-fixed?categoriesPage";
import { initMenu } from "./menu?categoriesPage";         
import "/sass/categories.sass";

document.addEventListener("DOMContentLoaded", () => {

  initHeader();
  initMenu();

});