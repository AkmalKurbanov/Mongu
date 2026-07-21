export const initMenu = () => {
  const menu = document.querySelector(".js-menu");
  const hamburger = document.querySelector(".js-hamburger");
  const body = document.querySelector("body");
  const closeMenuBtn = document.querySelector(".js-menu-close");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      body.classList.add("scroll-locked");
      menu.classList.add("menu_is-open");
    });
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", () => {
      body.classList.remove("scroll-locked");
      menu.classList.remove("menu_is-open");
    });
  }

  const triggersSubmenu = document.querySelectorAll(".js-trigger-submenu");
  triggersSubmenu.forEach(trigger => {
    trigger.addEventListener("click", function () {
      this.closest("li").classList.toggle("is-droped");
    });
  });
};