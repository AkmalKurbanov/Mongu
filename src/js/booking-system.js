// Класс для управления красивым селектом
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

// ОСНОВНАЯ ЛОГИКА БРОНИРОВАНИЯ
export class BookingSystem {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.customSelects = Array.from(this.container.querySelectorAll('.js-custom-select'))
      .map(el => new CustomSelect(el));

    this.tourCustomSelect = this.customSelects.find(cs => cs.nativeSelect.name === 'tour_id');

    // --- Интро и Визард ---
    this.introBlock = this.container.querySelector('.js-booking-intro');
    this.wizardBlock = this.container.querySelector('.js-booking-wizard');
    this.waBtns = this.container.querySelectorAll('.js-whatsapp-fast-btn');

    // --- Шаги и Панели ---
    this.panels = this.container.querySelectorAll('.js-booking-panel');
    this.steps = this.container.querySelectorAll('.booking__step');

    // --- Форма ---
    this.typeRadios = this.container.querySelectorAll('input[name="booking_type"]');
    this.tourSelectNative = this.container.querySelector('select[name="tour_id"]'); 
    
    this.dateInput = this.container.querySelector('input[name="booking_date"]');
    this.paxInput = this.container.querySelector('.js-pax-input');
    this.btnPaxMinus = this.container.querySelector('.js-pax-minus');
    this.btnPaxPlus = this.container.querySelector('.js-pax-plus');
    this.submitBtn = this.container.querySelector('.js-submit-booking');

    // --- Смета ---
    this.summaryType = this.container.querySelector('.js-summary-type');
    this.summaryDate = this.container.querySelector('.js-summary-date');
    this.summaryPax = this.container.querySelector('.js-summary-pax');
    this.summaryAddonsContainer = this.container.querySelector('.js-summary-addons-container');
    this.summaryTotal = this.container.querySelector('.js-summary-total');

    this.state = {
      step: 1,
      maxSteps: 4,
      type: 'tour',
      tourId: null,
      date: null,
      guests: 1,
      basePrice: 0,
      totalPrice: 0
    };

    this.init();
  }

  init() {
    this.setMinDate(); // Запрещаем выбор прошедших дат в инпуте
    this.parseUrlParams();
    this.bindEvents();
    this.updateView();
    this.updateSummary();
  }

  // Устанавливаем минимальную дату в инпут равной сегодняшнему дню (YYYY-MM-DD)
  setMinDate() {
    if (!this.dateInput) return;
    const today = new Date().toISOString().split('T')[0];
    this.dateInput.setAttribute('min', today);
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('tour'); 

    if (!tourId || !this.tourSelectNative) return;

    const targetOption = Array.from(this.tourSelectNative.options).find(opt => opt.value === tourId);

    if (targetOption) {
      this.state.type = 'tour';
      this.state.tourId = tourId;
      this.state.basePrice = parseFloat(targetOption.dataset.price) || 0;

      if (this.tourCustomSelect) {
        this.tourCustomSelect.setValue(tourId);
      }

      this.state.step = 2;
    } 
  }

  hideIntroShowWizard() {
    if (this.introBlock && this.wizardBlock) {
      this.introBlock.classList.add('hidden-elem');
      this.wizardBlock.classList.remove('hidden-elem');
    }
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.js-start-wizard')) {
        this.hideIntroShowWizard();
        this.updateView(); 
      }
      
      if (e.target.closest('.js-next-step')) this.nextStep();
      if (e.target.closest('.js-prev-step')) this.prevStep();
    });

    this.typeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.type = e.target.value;
        this.updateSummary();
      });
    });

    if (this.tourSelectNative) {
      this.tourSelectNative.addEventListener('change', (e) => {
        const selectedOpt = e.target.options[e.target.selectedIndex];
        this.state.tourId = e.target.value;
        this.state.basePrice = parseFloat(selectedOpt.dataset.price) || 0;
        this.updateSummary();
      });
    }

    if (this.dateInput) {
      this.dateInput.addEventListener('change', (e) => {
        this.state.date = e.target.value;
        this.updateSummary();
      });
    }

    if (this.btnPaxMinus && this.btnPaxPlus && this.paxInput) {
      this.btnPaxMinus.addEventListener('click', () => this.updatePax(-1));
      this.btnPaxPlus.addEventListener('click', () => this.updatePax(1));
    }

    const addonCheckboxes = this.container.querySelectorAll('.js-addon-checkbox');
    addonCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateSummary());
    });
  }

  updatePax(change) {
    let currentVal = parseInt(this.paxInput.value) || 1;
    let newVal = currentVal + change;
    
    if (newVal >= 1 && newVal <= 15) {
      this.paxInput.value = newVal;
      this.state.guests = newVal;
      this.updateSummary();
    }
  }

  nextStep() {
    if (this.validateStep(this.state.step)) {
      if (this.state.step < this.state.maxSteps) {
        this.state.step++;
        this.updateView();
      }
    }
  }

  prevStep() {
    if (this.state.step > 1) {
      this.state.step--;
      this.updateView();
    }
  }

  validateStep(step) {
    if (step === 1 && !this.state.type) {
      alert('Please select a booking type.');
      return false;
    }
    if (step === 2) {
      if (this.state.type === 'tour' && !this.state.tourId && !this.tourSelectNative.value) {
        alert('Please select a tour.');
        return false;
      }
    }
    return true;
  }

  updateView() {
    this.panels.forEach(panel => {
      panel.classList.toggle('hidden-elem', parseInt(panel.dataset.panel) !== this.state.step);
    });

    this.steps.forEach(step => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.toggle('booking__step_active', stepNum <= this.state.step);
    });
  }

  updateSummary() {
    const checkedRadio = this.container.querySelector('input[name="booking_type"]:checked');
    let categoryTitle = 'Expedition / Stay';
    
    if (checkedRadio) {
      const cardContent = checkedRadio.closest('.booking-card')?.querySelector('.booking-card__title');
      if (cardContent) {
        categoryTitle = cardContent.textContent.trim();
      }
    }

    let selectedItemName = categoryTitle;
    if (this.state.tourId && this.tourSelectNative) {
      const option = Array.from(this.tourSelectNative.options).find(opt => opt.value === this.state.tourId);
      if (option) {
        selectedItemName = option.text;
      }
    }

    if (this.summaryType) this.summaryType.textContent = selectedItemName;
    
    if (this.summaryDate) {
      this.summaryDate.textContent = this.state.date 
        ? new Date(this.state.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : 'Flexible / TBD';
    }
    
    if (this.summaryPax) this.summaryPax.textContent = `${this.state.guests} pax`;

    let currentTotal = this.state.basePrice * this.state.guests;
    
    const checkedAddons = this.container.querySelectorAll('.js-addon-checkbox:checked');
    if (this.summaryAddonsContainer) this.summaryAddonsContainer.innerHTML = ''; 
    
    checkedAddons.forEach(addon => {
      const price = parseFloat(addon.value) || 0;
      const title = addon.nextElementSibling.querySelector('.booking-addon__title').textContent;
      const totalAddonPrice = price * this.state.guests;
      
      currentTotal += totalAddonPrice;
      
      if (this.summaryAddonsContainer) {
        this.summaryAddonsContainer.innerHTML += `
          <div class="order-summary__addon-item">
            <span>+ ${title}</span>
            <span>$${totalAddonPrice}</span>
          </div>
        `;
      }
    });

    this.state.totalPrice = currentTotal;
    
    if (this.summaryTotal) {
      if (this.state.type === 'custom') {
         this.summaryTotal.textContent = 'On request';
         this.summaryTotal.style.fontSize = '1.25rem'; 
      } else {
         this.summaryTotal.textContent = `$${this.state.totalPrice}`;
         this.summaryTotal.style.fontSize = ''; 
      }
    }

    this.updateWhatsAppLink();
  }

  updateWhatsAppLink() {
    if (!this.waBtns || !this.waBtns.length) return;

    const phone = '996555150795';
    let message = `Hello! I would like to book a trip with MONGU.\n\n`;

    if (this.state.type === 'tour' && this.state.tourId) {
      let tourName = this.state.tourId;
      if (this.tourSelectNative) {
        const option = Array.from(this.tourSelectNative.options).find(opt => opt.value === this.state.tourId);
        tourName = option ? option.text : this.state.tourId;
      }
      message += `Tour: ${tourName}\n`;
    } else {
      message += `Type: ${this.state.type}\n`;
    }

    const dateText = this.state.date ? this.state.date : 'Flexible / TBD';
    message += `Date: ${dateText}\n`;
    message += `Guests: ${this.state.guests}`;

    this.waBtns.forEach(btn => {
      btn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    });
  }
}