export const initScrollTop = () => {
  // Находим все элементы, которым просто нужен класс при скролле
  const toggleElements = document.querySelectorAll('.js-scroll-toggle');
  // Находим конкретную кнопку для клика
  const scrollBtn = document.querySelector('.js-scroll-btn');

  if (!toggleElements.length) return;

  let isTicking = false;

  const handleScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        // Если проскроллили больше 500px — true, иначе false
        const isScrolled = window.scrollY > 500;
        
        // Добавляем или убираем класс у всех найденных элементов разом
        toggleElements.forEach(el => el.classList.toggle('is-active', isScrolled));
        
        isTicking = false;
      });
      isTicking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Вешаем клик ИСКЛЮЧИТЕЛЬНО на кнопку (если она есть на странице)
  if (scrollBtn) {
    scrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth' 
      });
    });
  }
};