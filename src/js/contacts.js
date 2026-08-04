import { initHeader } from "./header-fixed?contactsPage";
import { initMenu } from "./menu?contactsPage";
import "/sass/contacts.sass";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMenu();
});