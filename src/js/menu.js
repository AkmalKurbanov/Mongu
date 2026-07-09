const menu = document.querySelector(".js-menu");
const hamburger = document.querySelector(".js-hamburger");
const body = document.querySelector("body");
const closeMenuBtn = document.querySelector(".js-menu-close");

hamburger.addEventListener("click", () => {
  body.classList.add("scroll-locked");
  menu.classList.add("menu_is-open");
});

closeMenuBtn.addEventListener("click", () => {
  body.classList.remove("scroll-locked");
  menu.classList.remove("menu_is-open");
});

document.addEventListener("DOMContentLoaded", () => {
  const navLi = document.querySelectorAll(".menu nav li");

  navLi.forEach(li => {
    if (li.querySelector("ul")) {
      const targetElement = li.querySelector("a");

      const svgIcon = `
        <button class="js-trigger-submenu menu__submenu-trigger" type="button" aria-label="Open submenu"></button>
      `;

      targetElement.insertAdjacentHTML("afterend", svgIcon);
    }
  });

  const triggersSubmenu = document.querySelectorAll(".js-trigger-submenu");

  triggersSubmenu.forEach(trigger => {
    trigger.addEventListener("click", function () {
      // Ищем родительский li и сам список ul
      const parentLi = this.closest("li");
      const submenu = parentLi.querySelector("ul");

      // Переключаем класс
      parentLi.classList.toggle("is-droped");

      // Проверяем, открыто сейчас меню или закрыто
      if (parentLi.classList.contains("is-droped")) {
        // Разворачиваем: задаем высоту по размеру внутреннего контента
        submenu.style.height = submenu.scrollHeight + "px";
      } else {
        // Сворачиваем: обнуляем высоту
        submenu.style.height = 0;
      }
    });
  });
});
