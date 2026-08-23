import { initHeader } from "./header-fixed?contactsPage";
import { initScrollTop } from "./scroll?contactsPage";
import { initMenu } from "./menu?contactsPage";
import "/sass/contacts.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollTop();
  initMenu();
});