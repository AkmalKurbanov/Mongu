document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".js-slider").forEach(sliderContainer => {
    const slider = sliderContainer.querySelector(".js-slider-viewport");
    const btnPrev = sliderContainer.querySelector(".js-slider-prev");
    const btnNext = sliderContainer.querySelector(".js-slider-next");
    const pagination = sliderContainer.querySelector(".js-pagination");
    const slides = slider.querySelectorAll(".js-slide");
    
    const thumbnailsContainer = sliderContainer.querySelector(".js-slider-thumbnails");
    const thumbnails = sliderContainer.querySelectorAll(".js-thumb-item");

    if (!slider || slides.length === 0) return;

    // Функция для расчета ширины прокрутки (с учетом gap)
    const getScrollAmount = () => {
      const gap = parseInt(getComputedStyle(slider).gap) || 0;
      return slides[0].offsetWidth + gap;
    };

    // 1. Инициализация пагинации
    if (pagination) {
      slides.forEach((slide, index) => {
        const dot = document.createElement("div");
        dot.classList.add("pagination-dot");
        
        const slideIndex = slide.getAttribute("data-index") || index.toString();
        dot.setAttribute("data-index", slideIndex);

        if (index === 0) dot.classList.add("pagination-dot--active");
        
        dot.addEventListener("click", () => {
          const scrollLeftTarget = slide.offsetLeft - slider.offsetLeft;
          slider.scrollTo({ left: scrollLeftTarget, behavior: "smooth" });
        });
        pagination.appendChild(dot);
      });
    }

    // 2. Инициализация кликов по миниатюрам
    if (thumbnails.length > 0) {
      thumbnails.forEach((thumb, index) => {
        if (index === 0) thumb.classList.add("slider__thumb--active");
        
        thumb.addEventListener("click", () => {
          const targetIndex = thumb.getAttribute("data-index");
          const targetSlide = slider.querySelector(`.js-slide[data-index="${targetIndex}"]`);
          
          if (targetSlide) {
            const scrollLeftTarget = targetSlide.offsetLeft - slider.offsetLeft;
            slider.scrollTo({ left: scrollLeftTarget, behavior: "smooth" });
          }
        });
      });
    }

    // 3. Навигация кнопками
    if (btnNext) {
      btnNext.addEventListener("click", () => slider.scrollBy({ left: getScrollAmount(), behavior: "smooth" }));
    }
    if (btnPrev) {
      btnPrev.addEventListener("click", () => slider.scrollBy({ left: -getScrollAmount(), behavior: "smooth" }));
    }

    // 4. Основная логика синхронизации при скролле
    slider.addEventListener("scroll", () => {
      const index = Math.round(slider.scrollLeft / getScrollAmount());
      const activeSlide = slides[index];
      
      if (!activeSlide) return;

      const activeDataIndex = activeSlide.getAttribute("data-index") || index.toString();

      if (pagination) {
        const dots = pagination.querySelectorAll(".pagination-dot");
        dots.forEach(d => {
          const isActive = d.getAttribute("data-index") === activeDataIndex;
          d.classList.toggle("pagination-dot--active", isActive);
        });
      }

      if (thumbnails.length > 0) {
        thumbnails.forEach(t => t.classList.remove("slider__thumb--active"));
        
        const activeThumb = sliderContainer.querySelector(`.js-thumb-item[data-index="${activeDataIndex}"]`);
        
        if (activeThumb) {
          activeThumb.classList.add("slider__thumb--active");
          
          if (thumbnailsContainer) {
             const containerWidth = thumbnailsContainer.offsetWidth;
             const scrollLeftTarget = activeThumb.offsetLeft - (containerWidth / 2) + (activeThumb.offsetWidth / 2);
             
             thumbnailsContainer.scrollTo({
                 left: scrollLeftTarget,
                 behavior: "smooth"
             });
          }
        }
      }
    });

    // === УНИВЕРСАЛЬНАЯ ЛОГИКА DRAG-AND-DROP ===
    const enableDrag = (scrollContainer, isMainSlider) => {
      if (!scrollContainer) return;

      let isDragging = false;
      let startX;
      let initialScrollLeft; 
      let dragDistance = 0;
      let walk = 0;

      scrollContainer.addEventListener("dragstart", (e) => e.preventDefault());

      scrollContainer.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || !e.isPrimary) return;
        
        isDragging = true;
        dragDistance = 0;
        walk = 0;
        scrollContainer.classList.add("is-dragging");
        
        startX = e.pageX - scrollContainer.offsetLeft;
        initialScrollLeft = scrollContainer.scrollLeft;
      });

      const stopDragging = (e) => {
        if (!isDragging) return;
        isDragging = false;
        scrollContainer.classList.remove("is-dragging");

        // Умный свайп применяется только к основному слайдеру (не к миниатюрам)
        if (isMainSlider && dragDistance > 20) {
          const itemWidth = getScrollAmount();
          const currentIndex = Math.round(initialScrollLeft / itemWidth);
          let targetIndex = currentIndex;

          // Если потянули влево (свайп к следующим слайдам)
          if (walk < -20) {
            targetIndex = currentIndex + 1;
          } 
          // Если потянули вправо (свайп к предыдущим)
          else if (walk > 20) {
            targetIndex = currentIndex - 1;
          }

          // Защита от выхода за пределы массива
          targetIndex = Math.max(0, Math.min(targetIndex, slides.length - 1));

          // Программно докручиваем ровно до нужного слайда
          scrollContainer.scrollTo({
            left: targetIndex * itemWidth,
            behavior: "smooth"
          });
        }
      };

      scrollContainer.addEventListener("pointerleave", stopDragging);
      scrollContainer.addEventListener("pointerup", stopDragging);

      scrollContainer.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        e.preventDefault(); 
        
        const x = e.pageX - scrollContainer.offsetLeft;
        walk = (x - startX) * 1.5; // 1.5 - легкое ускорение движения за курсором
        dragDistance = Math.abs(walk);
        
        scrollContainer.scrollLeft = initialScrollLeft - walk;
      });

      // Перехватываем клики по ссылкам, если был совершен свайп
      scrollContainer.addEventListener("click", (e) => {
        if (dragDistance > 5) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { capture: true });
    };

    // Инициализируем D&D для главного слайдера
    enableDrag(slider, true); 
    
    // Инициализируем D&D для миниатюр
    if (thumbnailsContainer) {
      enableDrag(thumbnailsContainer, false); 
    }
    
  });
});