import { initHeader } from "./header-fixed?lodgePage";
import { initMenu } from "./menu?lodgePage";
import "/sass/lodge.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});
