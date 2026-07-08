document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    window.requestAnimationFrame(() => {
      // Если прокрутили больше 0 пикселей — добавляем класс
      if (window.scrollY > 0) {
        header.classList.add('header_bg');
      } else {
        header.classList.remove('header_bg');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
});