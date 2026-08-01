class CustomSelect {
  constructor(container) {
    this.container = container;
    this.nativeSelect = this.container.querySelector('.js-custom-select-native');
    this.trigger = this.container.querySelector('.js-custom-select-trigger');
    this.valueEl = this.container.querySelector('.js-custom-select-value');
    this.options = this.container.querySelectorAll('.js-custom-select-option');
    this.searchInput = this.container.querySelector('.js-custom-select-search'); 
    this.isOpen = false;
    this.init();
  }

  init() {
    this.trigger.addEventListener('click', () => this.toggle());

    this.options.forEach(option => {
      option.addEventListener('click', (e) => this.selectOption(e.target));
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.options.forEach(option => {
          const text = option.textContent.toLowerCase();
          option.style.display = text.includes(query) ? 'block' : 'none';
        });
      });
    }

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('custom-select_open', this.isOpen);
    if (this.isOpen && this.searchInput) {
      this.searchInput.value = '';
      this.options.forEach(opt => opt.style.display = 'block');
      setTimeout(() => this.searchInput.focus(), 50);
    }
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('custom-select_open');
  }

  selectOption(optionEl) {
    const value = optionEl.dataset.value;
    const text = optionEl.textContent;

    this.valueEl.textContent = text;
    this.nativeSelect.value = value;
    this.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

    this.options.forEach(opt => opt.classList.remove('custom-select__option_selected'));
    optionEl.classList.add('custom-select__option_selected');

    this.close();
  }

  setValue(value) {
    const optionToSelect = Array.from(this.options).find(opt => opt.dataset.value === value);
    if (optionToSelect) {
      this.selectOption(optionToSelect);
    }
  }
}

export class BookingSystem {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    // Ищем форму, а не просто див
    this.form = this.container.querySelector('#js-booking-form');
    if (!this.form) return;

    this.customSelects = Array.from(this.container.querySelectorAll('.js-custom-select'))
      .map(el => new CustomSelect(el));

    this.panels = Array.from(this.container.querySelectorAll('.js-booking-panel'));
    this.steps = Array.from(this.container.querySelectorAll('.booking__step'));
    
    this.currentStep = 1;

    this.init();
  }

  init() {
    // Ставим минимальную дату
    const dateInput = this.form.querySelector('input[name="booking_date"]');
    if (dateInput) {
      dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
    }
    
    this.bindEvents();
    this.updateSummary();
  }

  bindEvents() {
    // Делегирование кликов
    this.container.addEventListener('click', (e) => {
      // Переход из интро в форму
      if (e.target.closest('.js-start-wizard')) {
        this.container.querySelector('.js-booking-intro').classList.add('booking-hidden-elem');
        this.form.classList.remove('booking-hidden-elem');
      }
      
      // Навигация по шагам
      if (e.target.closest('.js-next-step')) this.navigate(1);
      if (e.target.closest('.js-prev-step')) this.navigate(-1);

      // Кнопки плюс/минус
      const btnMinus = e.target.closest('.js-pax-minus');
      const btnPlus = e.target.closest('.js-pax-plus');
      if (btnMinus || btnPlus) {
        const input = this.form.querySelector('.js-pax-input');
        if (input) {
          let val = parseInt(input.value) || 1;
          input.value = btnMinus ? Math.max(1, val - 1) : Math.min(15, val + 1);
          this.updateSummary(); // Сразу пересчитываем смету
        }
      }
    });

    // Единый слушатель на изменение формы (радио, селекты, чекбоксы)
    this.form.addEventListener('change', () => this.updateSummary());

    // Перехват отправки формы (для будущего October CMS)
    this.form.addEventListener('submit', (e) => {
      e.preventDefault(); 
      const formData = new FormData(this.form);
      console.log('Данные формы готовы к отправке:', Object.fromEntries(formData.entries()));
      // Здесь будет fetch запрос к твоему бэкенду
    });
  }

  navigate(direction) {
    const next = this.currentStep + direction;
    if (next >= 1 && next <= this.panels.length) {
      this.currentStep = next;
      // Показываем нужную панель
      this.panels.forEach(p => p.classList.toggle('booking-hidden-elem', parseInt(p.dataset.panel) !== this.currentStep));
      // Обновляем прогресс-бар
      this.steps.forEach(s => s.classList.toggle('booking__step_active', parseInt(s.dataset.step) <= this.currentStep));
    }
  }

  updateSummary() {
    const formData = new FormData(this.form);
    const guests = parseInt(formData.get('guests')) || 1;
    const date = formData.get('booking_date');
    
    // Получаем текущую радиокнопку и читаем её data-атрибуты
    const checkedRadio = this.form.querySelector('input[name="booking_type"]:checked');
    const typeValue = checkedRadio ? checkedRadio.value : '';
    const itemType = checkedRadio ? checkedRadio.dataset.itemType : 'tour'; // tour, custom, accommodation
    
    let categoryTitle = checkedRadio 
      ? checkedRadio.closest('.booking-card').querySelector('.booking-card__title').textContent.trim() 
      : '';
      
    let total = 0;
    const isAccommodation = itemType === 'accommodation';
    const isCustom = itemType === 'custom';

    // 1. Скрытие/показ селекта туров (если это только жилье - скрываем)
    const tourWrap = this.form.querySelector('.js-tour-select-wrap');
    if (tourWrap) tourWrap.style.display = isAccommodation ? 'none' : 'block';

    // 2. Расчет базовой цены
    if (!isAccommodation && !isCustom) {
      const tourSelect = this.form.querySelector('select[name="tour_id"]');
      if (tourSelect && tourSelect.value) {
        const option = tourSelect.options[tourSelect.selectedIndex];
        categoryTitle = option.textContent;
        total += (parseFloat(option.dataset.price) || 0) * guests;
      }
    }

    // 3. Универсальный расчет доп. услуг на основе data-атрибутов
    const addonsContainer = this.form.querySelector('.js-summary-addons-container');
    addonsContainer.innerHTML = '';

    this.form.querySelectorAll('.js-addon-wrap').forEach(wrap => {
      // Читаем список исключений (например, "mongu,sokmo")
      const excludeOn = (wrap.dataset.excludeOn || '').split(',');
      const shouldHide = excludeOn.includes(typeValue);
      
      // Скрываем или показываем весь блок
      wrap.classList.toggle('booking-hidden-elem', shouldHide);
      
      const checkbox = wrap.querySelector('.js-addon-checkbox');
      
      if (shouldHide && checkbox) {
        checkbox.checked = false; // Тихо снимаем галочку, если блок скрыт
      } else if (checkbox && checkbox.checked) {
        const price = parseFloat(checkbox.value) || 0;
        
        // Главная логика: читаем из HTML тип расчета
        const itemTotal = checkbox.dataset.calcType === 'fixed' ? price : price * guests;
        total += itemTotal;

        addonsContainer.innerHTML += `
          <div class="order-summary__addon-item">
            <span>+ ${checkbox.dataset.title}</span>
            <span>$${itemTotal}</span>
          </div>
        `;
      }
    });

    // 4. Обновление текстовых данных в сайдбаре
    const render = (selector, text) => {
      const el = this.form.querySelector(selector);
      if (el) el.textContent = text;
    };

    render('.js-summary-type', categoryTitle);
    render('.js-summary-date', date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible / TBD');
    render('.js-summary-pax', `${guests} pax`);

    const elTotal = this.form.querySelector('.js-summary-total');
    if (elTotal) {
      if (isCustom || isAccommodation) {
        elTotal.textContent = 'On request';
        elTotal.style.fontSize = '1.25rem';
      } else {
        elTotal.textContent = `$${total}`;
        elTotal.style.fontSize = '';
      }
    }

    // 5. Обновление ссылок WhatsApp
    this.updateWhatsAppLink(categoryTitle, date, guests);
  }

  updateWhatsAppLink(title, date, guests) {
    const btns = this.container.querySelectorAll('.js-whatsapp-fast-btn');
    if (!btns.length) return;

    const msg = `Hello! I would like to book a trip with MONGU.\n\n` +
                `Selected: ${title}\n` +
                `Date: ${date ? date : 'Flexible / TBD'}\n` +
                `Guests: ${guests}`;

    btns.forEach(btn => {
      btn.href = `https://wa.me/996555150795?text=${encodeURIComponent(msg)}`;
    });
  }
}