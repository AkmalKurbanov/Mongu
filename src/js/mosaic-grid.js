import { initHeader } from "./header-fixed?destinationsPage";
import { initMenu } from "./menu?destinationsPage";
import "/sass/destinations.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});
