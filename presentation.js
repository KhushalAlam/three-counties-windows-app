/* ============================================================
   PRESENTATION MODE
   Handles slide rendering, navigation, jump menu
   ============================================================ */

const Presentation = {

  slides: [],
  currentIndex: 0,
  customerInputs: null,
  isReadOnly: false,

  /* ---- Initialise and render presentation ---- */
  async init(modulesSelected, customerInputs, deckName, isReadOnly) {
    Presentation.slides       = [];
    Presentation.currentIndex = 0;
    Presentation.customerInputs = customerInputs;
    Presentation.isReadOnly   = isReadOnly || false;

    // Build slide HTMLs
    for (const modId of modulesSelected) {
      const html = await Modules.renderModule(modId, customerInputs, isReadOnly);
      Presentation.slides.push({ id: modId, html });
    }

    // Update deck name in pres topbar
    const presName = document.getElementById('pres-deck-name');
    if (presName) presName.textContent = deckName || '';

    // Render first slide
    Presentation.renderSlide(0);
    Presentation.renderDots();
    Presentation.buildJumpMenu();
    Presentation.updateProgressBar();
    Presentation.updateNavButtons();
  },

  /* ---- Render slide at index ---- */
  renderSlide(index) {
    const container = document.getElementById('pres-slide-container');
    if (!container || !Presentation.slides[index]) return;

    Presentation.currentIndex = index;
    const slide = Presentation.slides[index];
    container.innerHTML =
      slide.id === 'how_we_help' ? Modules.renderHowWeHelp() :
      slide.id === 'gallery'     ? Modules.renderGallery()   :
      slide.id === 'welcome'     ? Modules.renderWelcome()   :
      slide.html;
    window.__injectedScripts = window.__injectedScripts || new Set();
    container.querySelectorAll('script').forEach(old => {
      const key = old.id || old.src;
      if (key) {
        if (window.__injectedScripts.has(key)) {
          old.parentNode.removeChild(old);
          return;
        }
        window.__injectedScripts.add(key);
      }
      const s = document.createElement('script');
      [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
      s.text = old.text;
      old.parentNode.replaceChild(s, old);
    });

    // Reinitialise calculator events after DOM is ready
    if (Presentation.slides[index].id === 'calculator') {
      setTimeout(() => Presentation.bindCalculatorEvents(), 50);
    }

    Presentation.updateProgressBar();
    Presentation.updateNavButtons();
    Presentation.updateDots();

    // Update progress text
    const pt = document.getElementById('pres-progress-text');
    if (pt) pt.textContent = `${index + 1} / ${Presentation.slides.length}`;

    // Scroll to top
    container.scrollTop = 0;
  },

  /* ---- Nav buttons ---- */
  next() {
    if (Presentation.currentIndex < Presentation.slides.length - 1) {
      Presentation.renderSlide(Presentation.currentIndex + 1);
    }
  },

  prev() {
    if (Presentation.currentIndex > 0) {
      Presentation.renderSlide(Presentation.currentIndex - 1);
    }
  },

  goTo(index) {
    if (index >= 0 && index < Presentation.slides.length) {
      Presentation.renderSlide(index);
      Presentation.closeJumpMenu();
    }
  },

  goToModule(moduleId) {
    const idx = Presentation.slides.findIndex(s => s.id === moduleId);
    if (idx !== -1) Presentation.goTo(idx);
  },

  /* ---- Progress bar ---- */
  updateProgressBar() {
    const bar = document.getElementById('pres-progress-bar');
    if (!bar || Presentation.slides.length === 0) return;
    const pct = ((Presentation.currentIndex + 1) / Presentation.slides.length) * 100;
    bar.style.width = `${pct}%`;
  },

  /* ---- Nav button states ---- */
  updateNavButtons() {
    const prev = document.getElementById('pres-btn-prev');
    const next = document.getElementById('pres-btn-next');
    if (prev) prev.disabled = Presentation.currentIndex === 0;
    if (next) {
      const isLast = Presentation.currentIndex === Presentation.slides.length - 1;
      next.disabled = false;
      next.innerHTML = isLast
        ? '<i class="fas fa-check"></i> Done'
        : 'Next <i class="fas fa-chevron-right"></i>';
      if (isLast) next.onclick = () => App.exitPresentation();
      else next.onclick = null;
    }
  },

  /* ---- Dots ---- */
  renderDots() {
    const dots = document.getElementById('pres-nav-dots');
    if (!dots) return;
    if (Presentation.slides.length <= 12) {
      dots.innerHTML = Presentation.slides.map((_, i) =>
        `<div class="nav-dot ${i === Presentation.currentIndex ? 'active' : ''}"
          onclick="Presentation.goTo(${i})" title="Slide ${i+1}"></div>`
      ).join('');
    } else {
      // Too many slides for dots — show text
      dots.innerHTML = '';
    }
  },

  updateDots() {
    const dots = document.querySelectorAll('#pres-nav-dots .nav-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === Presentation.currentIndex);
    });
  },

  /* ---- Jump Menu ---- */
  buildJumpMenu() {
    const list = document.getElementById('jump-menu-list');
    if (!list) return;
    list.innerHTML = Presentation.slides.map((slide, i) => {
      const mod = MODULE_REGISTRY.find(m => m.id === slide.id);
      const isActive = i === Presentation.currentIndex;
      return `
        <div class="jump-item ${isActive ? 'active' : ''}"
          onclick="Presentation.goTo(${i})">
          <div style="width:22px;height:22px;border-radius:50%;background:${isActive ? '#fff' : 'var(--green-light)'};
            color:${isActive ? 'var(--green)' : 'var(--green)'};display:flex;align-items:center;justify-content:center;
            font-size:0.65rem;font-weight:700;flex-shrink:0;">${i + 1}</div>
          <i class="fas ${mod?.icon || 'fa-circle'}"></i>
          <span>${escHtml(mod?.name || slide.id)}</span>
        </div>`;
    }).join('');
  },

  openJumpMenu() {
    const overlay = document.getElementById('jump-menu-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      Presentation.buildJumpMenu();
    }
  },

  closeJumpMenu() {
    const overlay = document.getElementById('jump-menu-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  /* ---- Calculator live events ---- */
  bindCalculatorEvents() {
    // Bind all calculator inputs
    const inputs = document.querySelectorAll('.calc-inp, .calc-input, #calc-arraySize, #calc-battery');
    inputs.forEach(input => {
      input.removeEventListener('input', Presentation.recalculate);
      input.removeEventListener('change', Presentation.recalculate);
      input.addEventListener('input', Presentation.recalculate);
      input.addEventListener('change', Presentation.recalculate);
    });

    // Array slider label
    const arraySlider = document.getElementById('calc-arraySize');
    if (arraySlider) {
      arraySlider.addEventListener('input', () => {
        const el = document.getElementById('calc-arraySize-val');
        if (el) el.textContent = `${parseFloat(arraySlider.value).toFixed(1)} kWp`;
      });
    }

    // Battery slider label
    const batterySlider = document.getElementById('calc-battery');
    if (batterySlider) {
      batterySlider.addEventListener('input', () => {
        const el = document.getElementById('calc-battery-val');
        if (el) el.textContent = `${parseFloat(batterySlider.value).toFixed(1)} kWh`;
      });
    }

    // Reset button
    const resetBtn = document.getElementById('calc-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const defaults = Calculator.getDefaultInputs();
        Presentation.setCalculatorValues(defaults);
        Presentation.recalculate();
      });
    }

    // Projection term dropdown
    const projTerm = document.getElementById('calc-proj-term');
    if (projTerm) {
      projTerm.removeEventListener('change', Presentation.recalculate);
      projTerm.addEventListener('change', Presentation.recalculate);
    }

    // Inflation rate input
    const inflationRate = document.getElementById('calc-inflation-rate');
    if (inflationRate) {
      inflationRate.removeEventListener('input', Presentation.recalculate);
      inflationRate.removeEventListener('change', Presentation.recalculate);
      inflationRate.addEventListener('input', Presentation.recalculate);
      inflationRate.addEventListener('change', Presentation.recalculate);
    }

    // Run initial calculation
    Presentation.recalculate();
  },

  setCalculatorValues(vals) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('calc-annualUsage',    vals.annualUsage);
    set('calc-unitPrice',      vals.unitPrice);
    set('calc-standingCharge', vals.standingCharge);
    set('calc-arraySize',      vals.arraySize);
    set('calc-battery',        vals.battery);
    set('calc-exportTariff',   vals.exportTariff);
    set('calc-systemCost',     vals.systemCost);
    const avEl = document.getElementById('calc-arraySize-val');
    if (avEl) avEl.textContent = `${parseFloat(vals.arraySize).toFixed(1)} kWp`;
    const bvEl = document.getElementById('calc-battery-val');
    if (bvEl) bvEl.textContent = `${parseFloat(vals.battery).toFixed(1)} kWh`;
  },

  recalculate() {
    const get = (id, fallback) => {
      const el = document.getElementById(id);
      return el ? (parseFloat(el.value) || fallback) : fallback;
    };

    const inputs = {
      annualUsage:    get('calc-annualUsage', 3800),
      unitPrice:      get('calc-unitPrice', 28.5),
      standingCharge: get('calc-standingCharge', 53.0),
      arraySize:      get('calc-arraySize', 4.0),
      battery:        get('calc-battery', 5.0),
      exportTariff:   get('calc-exportTariff', 15.0),
      systemCost:     get('calc-systemCost', 8500)
    };

    const results = Calculator.compute(inputs);
    const fmt     = Calculator.format(results);

    // Update all result displays — IDs must match modules.js
    const upd = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    upd('calc-current-bill',  fmt.currentBill);
    upd('res-total-saving',   fmt.totalAnnualSaving);
    upd('res-payback',        results.paybackYears !== null ? results.paybackYears + ' yrs' : 'N/A');
    upd('res-monthly',        fmt.monthlyAvgSaving);
    upd('res-generation',     fmt.generation);
    upd('res-selfuse',        fmt.selfUsePct);
    // Read projection term and inflation rate from new controls
    const termEl = document.getElementById('calc-proj-term');
    const rateEl = document.getElementById('calc-inflation-rate');
    const projYears = termEl ? (parseInt(termEl.value) || 25) : 25;
    const inflRate  = rateEl ? (parseFloat(rateEl.value) / 100 || 0.03) : 0.03;

    // Recalculate long-term savings using chosen term and rate
    const annualSaving = results.totalAnnualSaving || 0;
    let longTermSaving = 0;
    for (let y = 1; y <= projYears; y++) {
      longTermSaving += annualSaving * Math.pow(1 + inflRate, y);
    }
    const fmtLongTerm = '£' + (longTermSaving >= 1000
      ? (longTermSaving / 1000).toFixed(1) + 'k'
      : Math.round(longTermSaving).toLocaleString());

    upd('res-25yr', fmtLongTerm);
    upd('res-co2',  fmt.co2Avoided);

    // Update label and note dynamically
    const labelEl = document.getElementById('res-term-label');
    if (labelEl) labelEl.innerHTML = '<i class="fas fa-chart-line"></i> ' + projYears + ' YEAR SAVINGS';
    const noteEl = document.getElementById('res-inflation-note');
    if (noteEl) noteEl.textContent = 'Inflation adjusted @ ' + (inflRate * 100).toFixed(1).replace(/\.0$/, '') + '%';

    // Save inputs to deck state
    if (AppState.currentDeck) {
      AppState.currentDeck.customer_inputs = JSON.stringify(inputs);
    }
  },

  /* ---- Customer view initialiser ---- */
  async initCustomerView(deck) {
    const deckName = deck.deck_name || 'Your Solar Estimate';
    let customerInputs = null;
    try {
      customerInputs = deck.customer_inputs ? JSON.parse(deck.customer_inputs) : null;
    } catch (e) { customerInputs = null; }

    const bannerText = document.getElementById('customer-banner-text');
    if (bannerText) bannerText.textContent = `Personalised estimate for: ${deckName}`;

    const inner = document.getElementById('view-customer-inner');
    if (!inner) return;

    inner.innerHTML = `
      <div class="pres-bar" style="position:sticky;top:0;z-index:50;box-shadow:var(--shadow-sm);">
        <div class="pres-bar-left">
          <img src="logo.png" alt="Three Counties" class="pres-bar-logo" style="mix-blend-mode:multiply;" />
          <span class="pres-bar-name">${escHtml(deckName)}</span>
        </div>
        <div class="pres-bar-center">
          <button class="pres-pill-btn" id="cust-btn-menu"><i class="fas fa-bars"></i> Sections</button>
        </div>
        <div class="pres-bar-right">
          <span class="pres-counter" id="cust-progress-text">1 / ${deck.modules_selected?.length || 1}</span>
        </div>
      </div>
      <div class="pres-progress-track">
        <div class="pres-progress-fill" id="cust-progress-bar"></div>
      </div>
      <div id="cust-jump-overlay" class="jump-overlay hidden">
        <div class="jump-panel">
          <div class="jump-panel-header">
            <span>Jump to Section</span>
            <button class="icon-btn" onclick="document.getElementById('cust-jump-overlay').classList.add('hidden')">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div id="cust-jump-list" class="jump-list"></div>
        </div>
      </div>
      <div id="cust-slide-container" style="min-height:calc(100vh - 200px);padding-bottom:4rem;"></div>
      <div class="pres-nav">
        <button class="nav-btn nav-prev" id="cust-btn-prev" disabled>
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        <div class="nav-dots" id="cust-nav-dots"></div>
        <button class="nav-btn nav-next" id="cust-btn-next">
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>`;

    await CustomerPresentation.init(deck.modules_selected || [], customerInputs, deckName);
  }
};

/* ---- Customer-view presentation (read-only) ---- */
const CustomerPresentation = {
  slides: [],
  currentIndex: 0,

  async init(modulesSelected, customerInputs, deckName) {
    CustomerPresentation.slides = [];
    CustomerPresentation.currentIndex = 0;

    for (const modId of modulesSelected) {
      const html = await Modules.renderModule(modId, customerInputs, true);
      CustomerPresentation.slides.push({ id: modId, html });
    }

    CustomerPresentation.renderSlide(0);
    CustomerPresentation.renderDots();
    CustomerPresentation.buildJumpMenu();

    const prevBtn = document.getElementById('cust-btn-prev');
    const nextBtn = document.getElementById('cust-btn-next');
    const menuBtn = document.getElementById('cust-btn-menu');
    if (prevBtn) prevBtn.addEventListener('click', CustomerPresentation.prev);
    if (nextBtn) nextBtn.addEventListener('click', CustomerPresentation.next);
    if (menuBtn) menuBtn.addEventListener('click', () => {
      const overlay = document.getElementById('cust-jump-overlay');
      if (overlay) overlay.classList.remove('hidden');
    });
  },

  renderSlide(index) {
    const container = document.getElementById('cust-slide-container');
    if (!container || !CustomerPresentation.slides[index]) return;
    CustomerPresentation.currentIndex = index;
    const slide = CustomerPresentation.slides[index];
    container.innerHTML =
      slide.id === 'how_we_help' ? Modules.renderHowWeHelp() :
      slide.id === 'gallery'     ? Modules.renderGallery()   :
      slide.id === 'welcome'     ? Modules.renderWelcome()   :
      slide.html;
    window.__injectedScripts = window.__injectedScripts || new Set();
    container.querySelectorAll('script').forEach(old => {
      const key = old.id || old.src;
      if (key) {
        if (window.__injectedScripts.has(key)) {
          old.parentNode.removeChild(old);
          return;
        }
        window.__injectedScripts.add(key);
      }
      const s = document.createElement('script');
      [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
      s.text = old.text;
      old.parentNode.replaceChild(s, old);
    });

    const pt = document.getElementById('cust-progress-text');
    if (pt) pt.textContent = `${index + 1} / ${CustomerPresentation.slides.length}`;

    const bar = document.getElementById('cust-progress-bar');
    if (bar) bar.style.width = `${((index + 1) / CustomerPresentation.slides.length) * 100}%`;

    const prev = document.getElementById('cust-btn-prev');
    const next = document.getElementById('cust-btn-next');
    if (prev) prev.disabled = index === 0;
    if (next) {
      next.disabled = index === CustomerPresentation.slides.length - 1;
      next.innerHTML = index === CustomerPresentation.slides.length - 1
        ? '<i class="fas fa-check"></i> Done'
        : 'Next <i class="fas fa-chevron-right"></i>';
    }

    CustomerPresentation.updateDots();
    container.scrollTop = 0;
  },

  next() {
    if (CustomerPresentation.currentIndex < CustomerPresentation.slides.length - 1) {
      CustomerPresentation.renderSlide(CustomerPresentation.currentIndex + 1);
    }
  },

  prev() {
    if (CustomerPresentation.currentIndex > 0) {
      CustomerPresentation.renderSlide(CustomerPresentation.currentIndex - 1);
    }
  },

  renderDots() {
    const dotsEl = document.getElementById('cust-nav-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = CustomerPresentation.slides.map((_, i) =>
      `<div class="nav-dot ${i === 0 ? 'active' : ''}"
        onclick="CustomerPresentation.renderSlide(${i})"></div>`
    ).join('');
  },

  updateDots() {
    const dots = document.querySelectorAll('#cust-nav-dots .nav-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === CustomerPresentation.currentIndex);
    });
  },

  buildJumpMenu() {
    const list = document.getElementById('cust-jump-list');
    if (!list) return;
    list.innerHTML = CustomerPresentation.slides.map((slide, i) => {
      const mod = MODULE_REGISTRY.find(m => m.id === slide.id);
      return `
        <div class="jump-item ${i === CustomerPresentation.currentIndex ? 'active' : ''}"
          onclick="CustomerPresentation.renderSlide(${i});document.getElementById('cust-jump-overlay').classList.add('hidden');">
          <span style="min-width:18px;font-weight:700;font-size:0.75rem;">${i + 1}</span>
          <i class="fas ${mod?.icon || 'fa-circle'}"></i>
          <span>${escHtml(mod?.name || slide.id)}</span>
        </div>`;
    }).join('');
  }
};
