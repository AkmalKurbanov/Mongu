import { initHeader } from "./header-fixed?categoryPage";
import { initMenu } from "./menu?categoryPage";         
import "/sass/category.sass";

document.addEventListener("DOMContentLoaded", () => {

  initHeader();
  initMenu();

});