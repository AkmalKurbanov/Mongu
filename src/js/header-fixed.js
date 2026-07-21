export const initHeader = () => {
  const header = document.querySelector('.header');
  if (!header) return;

  let isTicking = false;
  const updateHeader = (currentScrollY) => {
    const isScrolled = currentScrollY > 0;
    
    document.documentElement.classList.toggle('is-scrolled', isScrolled);
    
    if (isScrolled) {
      header.classList.add('header_reduced');
      header.classList.remove('header_glued');
    } else {
      header.classList.remove('header_reduced');
      header.classList.add('header_glued');
    }
    
    isTicking = false;
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY; 
    
    if (!isTicking) {
      window.requestAnimationFrame(() => updateHeader(currentScrollY));
      isTicking = true;
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
};