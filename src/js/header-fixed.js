export const initHeader = () => {
  const header = document.querySelector('.header');
  if (!header) return;

  let isTicking = false;

  // Инициализация при загрузке
  const initialScroll = Math.max(0, window.scrollY);
  let currentState = 'glued';
  if (initialScroll > 0 && initialScroll < 150) currentState = 'hidden';
  else if (initialScroll >= 150) currentState = 'reduced';

  header.classList.remove('header_glued', 'header_hidden', 'header_reduced');
  header.classList.add(`header_${currentState}`);
  if (currentState === 'hidden') header.classList.add('header_glued');

  const updateHeader = () => {
    // 1. ЗАПРЕЩАЕМ ОТРИЦАТЕЛЬНЫЙ СКРОЛЛ (лечит прыжки на Mac/iOS)
    const scrollY = Math.max(0, window.scrollY);
    document.documentElement.classList.toggle('is-scrolled', scrollY > 0);

    // Определяем нужную позицию
    let targetState = 'glued';
    if (scrollY > 0 && scrollY < 150) targetState = 'hidden';
    else if (scrollY >= 150) targetState = 'reduced';

    if (currentState !== targetState) {

      // === СЦЕНАРИЙ 1: ПРЫЖОК НА САМЫЙ ВЕРХ (0px) ===
      // Шапка не должна падать с небес. Она должна встать на место мгновенно.
      if (targetState === 'glued') {
        header.classList.add('header_no-transition'); // Глушим анимацию
        header.classList.remove('header_hidden', 'header_reduced');
        header.classList.add('header_glued');
        
        void header.offsetHeight; // Принудительно применяем
        header.classList.remove('header_no-transition');
      }

      // === СЦЕНАРИЙ 2: РЕЗКИЙ СРЫВ ВНИЗ (Сразу к reduced) ===
      else if (currentState === 'glued' && targetState === 'reduced') {
        header.classList.add('header_no-transition', 'header_hidden');
        header.classList.add('header_reduced');
        header.classList.remove('header_glued');
        
        void header.offsetHeight;
        
        // Включаем анимацию и плавно спускаем уже компактную шапку
        header.classList.remove('header_no-transition', 'header_hidden');
      }

      // === СЦЕНАРИЙ 3: ПЛАВНЫЙ ВЫХОД ИЗ МЕРТВОЙ ЗОНЫ ВНИЗ ===
      else if (currentState === 'hidden' && targetState === 'reduced') {
        header.classList.add('header_no-transition');
        header.classList.add('header_reduced');
        header.classList.remove('header_glued');
        
        void header.offsetHeight;
        
        header.classList.remove('header_no-transition');
        header.classList.remove('header_hidden'); // Плавно выезжает вниз
      }

      // === СЦЕНАРИЙ 4: ВХОД В МЕРТВУЮ ЗОНУ (в любой ситуации прячем наверх) ===
      else if (targetState === 'hidden') {
        header.classList.add('header_hidden'); // Плавно уезжает
      }

      currentState = targetState;
    }

    isTicking = false;
  };

  const handleScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateHeader);
      isTicking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};