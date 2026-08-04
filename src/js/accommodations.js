import { initHeader } from "./header-fixed?accommodationsPage";
import { initMenu } from "./menu?accommodationsPage";
import "/sass/accommodations.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});
