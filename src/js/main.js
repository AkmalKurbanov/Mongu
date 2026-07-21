import { initHeader } from "./header-fixed"; // предполагая экспорт функции
import { initMenu } from "./menu";           // предполагая экспорт функции
import { initSliders } from "./slider";     // предполагая экспорт функции
import "/sass/main.sass";

document.addEventListener("DOMContentLoaded", () => {
  // Меню и шапка инициализируются сразу
  initHeader();
  initMenu();

  // Тяжелую логику слайдеров откладываем до простоя процессора
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initSliders(), { timeout: 1000 });
  } else {
    setTimeout(initSliders, 200);
  }
});