import { initHeader } from "./header-fixed?articlePage";
import { initScrollTop } from "./scroll?articlePage";
import { initMenu } from "./menu?articlePage";
import "/sass/article.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
});