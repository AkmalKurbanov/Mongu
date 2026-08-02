import { initHeader } from "./header-fixed?aboutPage";
import { initMenu } from "./menu?aboutPage";
import "/sass/about.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});
