import { initHeader } from "./header-fixed?accommodationsPage";
import { initMenu } from "./menu?accommodationsPage";
import "/sass/content-card.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});
