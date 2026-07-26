import { initHeader } from "./header-fixed?categoriesPage";
import { initMenu } from "./menu?categoriesPage";         
import "/sass/category.sass";

document.addEventListener("DOMContentLoaded", () => {

  initHeader();
  initMenu();

});