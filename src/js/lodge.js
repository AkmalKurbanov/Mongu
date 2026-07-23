import { initHeader } from "./header-fixed?indexPage";
import { initMenu } from "./menu?indexPage";
import "/sass/lodge.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});
