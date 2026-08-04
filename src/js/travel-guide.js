import { initHeader } from "./header-fixed?travel-guidePage";
import { initMenu } from "./menu?travel-guidePage";
import "/sass/travel-guide.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});
