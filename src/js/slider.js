export const initSliders = () => {
  document.querySelectorAll(".js-slider").forEach(sliderContainer => {
    const slider = sliderContainer.querySelector(".js-slider-viewport");
    const slides = slider ? slider.querySelectorAll(".js-slide") : [];
    const navItems = sliderContainer.querySelectorAll("[data-index]");
    const btnPrev = sliderContainer.querySelector(".js-slider-prev");
    const btnNext = sliderContainer.querySelector(".js-slider-next");
    if (!slider || slides.length === 0) return;
    
    let sliderWidth = slider.clientWidth;
    const updateSliderWidth = () => {
      sliderWidth = slider.clientWidth;
    };
    
    const resizeObserver = new ResizeObserver(() => updateSliderWidth());
    resizeObserver.observe(slider);

    function syncNavigators(activeIndex) {
      navItems.forEach(item => {
        const isActive = item.getAttribute("data-index") === activeIndex;
        if (item.classList.contains("pagination-dot")) {
          item.classList.toggle("pagination-dot--active", isActive);
        }
        if (item.classList.contains("js-thumb-item")) {
          item.classList.toggle("slider__thumb--active", isActive);
        }
      });
    }

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        const targetIndex = item.getAttribute("data-index");
        const targetSlide = slider.querySelector(`.js-slide[data-index="${targetIndex}"]`);
        if (targetSlide) {
          targetSlide.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
          syncNavigators(targetIndex);
        }
      });
    });

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        slider.scrollBy({ left: sliderWidth, behavior: "smooth" });
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        slider.scrollBy({ left: -sliderWidth, behavior: "smooth" });
      });
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            syncNavigators(entry.target.getAttribute("data-index"));
          }
        });
      },
      { root: slider, threshold: 0.6 }
    );
    
    slides.forEach(slide => observer.observe(slide));
  });
};