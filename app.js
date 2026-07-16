/* ============================================================
   MAIN APP CONTROLLER
   Three Counties Windows Sales Navigator
   ============================================================ */

const App = {

  /* ---- Bootstrap ---- */
  async init() {
    await App.loadAllData();
    API.deleteOldDecks();

    const params = new URLSearchParams(window.location.search);
    const deckId = params.get('deck');
    if (deckId) {
      await App.loadCustomerView(deckId);
      return;
    }

    App.showView('home');
    App.bindGlobalEvents();
    App.renderProofHubTab('about');
  },

  /* ---- Load all settings and content ---- */
  async loadAllData() {
    AppState.settings = await API.getSettings();
    const allItems = await API.getAllContentItems();
    AppState.contentItems = {};
    allItems.forEach(item => { AppState.contentItems[item.id] = item; });
  },

  /* ---- Bind all top-level UI events ---- */
  bindGlobalEvents() {
    document.querySelectorAll('.product-pill[data-product]').forEach(btn => {
      btn.addEventListener('click', () => App.selectBuilderProduct(btn.dataset.product));
    });

    document.querySelectorAll('.preset-pill[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => Builder.applyPreset(btn.dataset.preset));
    });
    const clearBtn = document.getElementById('btn-clear-all');
    if (clearBtn) clearBtn.addEventListener('click', Builder.clearAll);

    const saveBtn = document.getElementById('btn-save-deck');
    if (saveBtn) saveBtn.addEventListener('click', Builder.saveDeck);
    const startBtn = document.getElementById('btn-start-presentation');
    if (startBtn) startBtn.addEventListener('click', () => App.startPresentation());

    const prevBtn = document.getElementById('pres-btn-prev');
    const nextBtn = document.getElementById('pres-btn-next');
    const menuBtn = document.getElementById('pres-btn-menu');
    const exitBtn = document.getElementById('pres-btn-exit');
    const jumpClose = document.getElementById('jump-menu-close');
    if (prevBtn) prevBtn.addEventListener('click', Presentation.prev);
    if (nextBtn) nextBtn.addEventListener('click', Presentation.next);
    if (menuBtn) menuBtn.addEventListener('click', Presentation.openJumpMenu);
    if (exitBtn) exitBtn.addEventListener('click', App.exitPresentation);
    if (jumpClose) jumpClose.addEventListener('click', Presentation.closeJumpMenu);

    const jumpOverlay = document.getElementById('jump-menu-overlay');
    if (jumpOverlay) {
      jumpOverlay.addEventListener('click', (e) => {
        if (e.target === jumpOverlay) Presentation.closeJumpMenu();
      });
    }

    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', App.adminLogout);

    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => Admin.renderSection(btn.dataset.section));
    });

    document.querySelectorAll('.proof-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.proof-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        App.renderProofHubTab(tab.dataset.tab);
      });
    });

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (AppState.currentView !== 'presentation') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') Presentation.next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   Presentation.prev();
      if (e.key === 'Escape') Presentation.closeJumpMenu();
    });
  },

  /* ---- Show a top-level view ---- */
  showView(viewId) {
    AppState.currentView = viewId;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');
  },

  /* ---- Back navigation ---- */
  goBack(fromView) {
    switch (fromView) {
      case 'builder':      App.showView('home'); break;
      case 'presentation': App.exitPresentation(); break;
      case 'proof-hub':    App.showView('home'); break;
      case 'admin-panel':  App.showView('home'); break;
      default:             App.showView('home');
    }
  },

  /* ---- Home Actions ---- */
  startNewDeck() {
    AppState.currentDeck = null;
    AppState.priorities = new Set();
    AppState.products = new Set();
    Builder.selectedModules = [...assembleDeckFromProducts()];
    Builder.render();
    syncProductBarUI();
    App.showView('builder');
  },

  /* Select a product from the builder product-bar (single-select toggle) */
  selectBuilderProduct(key) {
    if (!AppState.products) AppState.products = new Set();
    // Toggle: clicking the already-active product deselects it
    if (AppState.products.has(key)) {
      AppState.products.delete(key);
    } else {
      AppState.products.add(key);
    }
    syncProductBarUI();
    // Keep presentation-slide chips in sync (if priorities slide is rendered)
    document.querySelectorAll('.product-chip').forEach(chip => {
      chip.classList.toggle('selected', AppState.products.has(chip.dataset.product));
    });
    // Rebuild the deck
    Builder.selectedModules = [...assembleDeckFromProducts()];
    Builder.renderGrid();
    Builder.renderSortable();
    Builder.updateCount();
    Builder.updateNextBtn();
  },

  async toggleDecksPanel() {
    const overlay = document.getElementById('decks-overlay');
    if (!overlay) return;
    if (overlay.classList.contains('hidden')) {
      overlay.classList.remove('hidden');
      await App.loadDecksList();
    } else {
      overlay.classList.add('hidden');
    }
  },

  closeDecksPanel() {
    const overlay = document.getElementById('decks-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  async loadDecksList() {
    const listEl = document.getElementById('decks-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="loading"><i class="fas fa-circle-notch fa-spin"></i> Loading…</div>';

    const decks = await API.getDecks();
    if (!decks || decks.length === 0) {
      listEl.innerHTML = `<div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>No saved decks yet. Build one to get started.</p>
      </div>`;
      return;
    }

    listEl.innerHTML = [...decks].reverse().map(d => {
      const date = new Date(d.created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      const modules = Array.isArray(d.modules_selected) ? d.modules_selected : [];
      return `
        <div class="deck-item" onclick="App.loadAndOpenDeck('${d.id}')">
          <div class="deck-item-info">
            <h4>${escHtml(d.deck_name || 'Unnamed Deck')}</h4>
            <p>${date} &nbsp;·&nbsp; ${modules.length} module${modules.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="deck-item-actions">
            <button class="btn-primary btn-sm" onclick="event.stopPropagation();App.loadAndStartPresentation('${d.id}')">
              <i class="fas fa-play"></i> Present
            </button>
            <button class="btn-ghost btn-sm" onclick="event.stopPropagation();Builder.showShareLinkById('${d.id}','${escHtml(d.deck_name||'')}')">
              <i class="fas fa-share-nodes"></i>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  async loadAndOpenDeck(deckId) {
    try {
      const deck = await API.getDeck(deckId);
      if (!deck) { showToast('Deck not found.', 'error'); return; }
      AppState.currentDeck = {
        ...deck,
        modules_selected: Array.isArray(deck.modules_selected) ? deck.modules_selected : []
      };
      AppState.products = new Set();
      try {
        const ci = deck.customer_inputs ? JSON.parse(deck.customer_inputs) : null;
        if (ci && Array.isArray(ci.products)) AppState.products = new Set(ci.products);
      } catch (_) {}
      Builder.selectedModules = [...AppState.currentDeck.modules_selected];
      Builder.render();
      syncProductBarUI();
      App.closeDecksPanel();
      App.showView('builder');
    } catch (e) {
      showToast('Error loading deck.', 'error');
    }
  },

  async loadAndStartPresentation(deckId) {
    try {
      const deck = await API.getDeck(deckId);
      if (!deck) { showToast('Deck not found.', 'error'); return; }
      let customerInputs = null;
      try { customerInputs = deck.customer_inputs ? JSON.parse(deck.customer_inputs) : null; } catch (e) {}
      if (customerInputs && Array.isArray(customerInputs.priorities)) {
        AppState.priorities = new Set(customerInputs.priorities);
      }
      if (customerInputs && Array.isArray(customerInputs.products)) {
        AppState.products = new Set(customerInputs.products);
      }
      AppState.currentDeck = {
        ...deck,
        modules_selected: Array.isArray(deck.modules_selected) ? deck.modules_selected : []
      };
      Builder.selectedModules = [...AppState.currentDeck.modules_selected];
      App.closeDecksPanel();
      await App.startPresentation(customerInputs);
    } catch (e) {
      showToast('Error loading deck.', 'error');
    }
  },

  /* ---- Start Presentation ---- */
  async startPresentation(customerInputsOverride) {
    const modules = Builder.selectedModules;
    if (!modules || modules.length === 0) {
      showToast('Select at least one module first.', 'error');
      return;
    }
    const deckName = document.getElementById('deck-name-input')?.value?.trim()
      || AppState.currentDeck?.deck_name || '';
    let calcInputs = customerInputsOverride || null;
    if (!calcInputs) {
      calcInputs = Calculator.getDefaultInputs();
      if (AppState.currentDeck?.customer_inputs) {
        try {
          const parsed = JSON.parse(AppState.currentDeck.customer_inputs);
          calcInputs = parsed;
          if (Array.isArray(parsed.priorities)) {
            AppState.priorities = new Set(parsed.priorities);
          }
          if (Array.isArray(parsed.products)) {
            AppState.products = new Set(parsed.products);
          }
        } catch (e) {}
      }
    }
    App.showView('presentation');
    await Presentation.init(modules, calcInputs, deckName, false);
  },

  /* ---- Exit presentation ---- */
  exitPresentation() {
    App.showView('builder');
  },

  jumpToModule(moduleId) {
    Presentation.goToModule(moduleId);
  },

  /* ---- Proof Hub ---- */
  renderProofHubTab(tab) {
    const content = document.getElementById('proof-hub-content');
    if (!content) return;

    switch (tab) {
      case 'about':
        content.innerHTML = `
          <div class="why-layout">
            <div>
              <img src="ourwork-1.jpg"
                alt="Three Counties Windows"
                style="border-radius:var(--r-lg);width:100%;box-shadow:var(--shadow-md);margin-bottom:1.25rem;" />
              <div style="font-size:0.87rem;color:var(--text-soft);line-height:1.7;margin-bottom:0.85rem;">
                <p style="margin-bottom:0.75rem;">We've spent over 20 years building our reputation as trusted local window and door installers across Surrey, Berkshire and Hampshire. Our focus is simple — deliver high-quality installations, honest advice and a smooth experience from first consultation through to long-term support.</p>
                <p style="margin-bottom:0.75rem;">At Three Counties, we work with both residential and commercial clients, helping homeowners make confident, informed decisions about their homes. We don't just install windows — we build long-term relationships with our customers and support them well beyond installation.</p>
              </div>
              <div class="service-strip" style="margin-bottom:1rem;">
                <strong><i class="fas fa-map-marker-alt"></i> Service Area:</strong>
                Based in Camberley — windows, doors, conservatories and roofline across
                <strong>Surrey, Berkshire &amp; Hampshire</strong>.
              </div>
              <div style="background:var(--green);border-radius:var(--r-md);padding:1.25rem;color:#fff;margin-bottom:1rem;">
                <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;opacity:0.8;margin-bottom:0.85rem;">
                  <i class="fas fa-chart-bar"></i> Why New Windows Matter
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;">
                  <div style="background:rgba(255,255,255,0.12);border-radius:var(--r-sm);padding:0.85rem;text-align:center;">
                    <div style="font-size:1.6rem;font-weight:800;letter-spacing:-0.5px;">75%</div>
                    <div style="font-size:0.72rem;opacity:0.85;margin-top:0.2rem;">Less energy lost with low-e glass vs standard</div>
                  </div>
                  <div style="background:rgba(255,255,255,0.12);border-radius:var(--r-sm);padding:0.85rem;text-align:center;">
                    <div style="font-size:1.6rem;font-weight:800;letter-spacing:-0.5px;">£5,000</div>
                    <div style="font-size:0.72rem;opacity:0.85;margin-top:0.2rem;">Secure Living cover included at no extra cost</div>
                  </div>
                  <div style="background:rgba(255,255,255,0.12);border-radius:var(--r-sm);padding:0.85rem;text-align:center;">
                    <div style="font-size:1.6rem;font-weight:800;letter-spacing:-0.5px;">10 yrs</div>
                    <div style="font-size:0.72rem;opacity:0.85;margin-top:0.2rem;">Guarantee on installations</div>
                  </div>
                  <div style="background:rgba(255,255,255,0.12);border-radius:var(--r-sm);padding:0.85rem;text-align:center;">
                    <div style="font-size:1.6rem;font-weight:800;letter-spacing:-0.5px;">1,500+</div>
                    <div style="font-size:0.72rem;opacity:0.85;margin-top:0.2rem;">Verified Checkatrade reviews</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="usp-list">
                <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-shield-halved"></i></div><div><h4>Zero Deposit Required</h4><p>Nothing to pay upfront, and nothing to lose.</p></div></div>
                <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-star"></i></div><div><h4>More Reviews Than Local Competitors</h4><p>Over double the positive reviews of anyone nearby.</p></div></div>
                <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-sterling-sign"></i></div><div><h4>Buy Now Pay Later</h4><p>Flexible finance across our entire range.</p></div></div>
                <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-certificate"></i></div><div><h4>10 Year Guarantee</h4><p>Real peace of mind, subject to terms.</p></div></div>
                <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-check-circle"></i></div><div><h4>FENSA &amp; GGF Members</h4><p>Fully accredited and registered for your protection.</p></div></div>
                <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-phone"></i></div><div><h4>01344 777515</h4><p>Give us a call — we're always happy to help.</p></div></div>
              </div>
            </div>
          </div>`;
        break;

      case 'reviews': {
        const reviews = AppState.getModuleItems('reviews');
        const starsHTML = n => '★'.repeat(parseInt(n || 5)) + '☆'.repeat(5 - parseInt(n || 5));
        content.innerHTML = `
          <div class="reviews-grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));">
            ${reviews.map(r => `
              <div class="rev-card">
                <div class="rev-stars">${starsHTML(r.meta2)}</div>
                <div class="rev-title">${escHtml(r.title)}</div>
                <div class="rev-body">"${escHtml(r.body)}"</div>
                <div class="rev-footer">
                  <div class="rev-name">${escHtml(r.meta1)}</div>
                  <div class="rev-loc">${escHtml(r.meta3 || '')}</div>
                </div>
              </div>`).join('')}
          </div>`;
        break;
      }

      case 'accreditations':
        content.innerHTML = `
          <div>
            <h2 style="margin-bottom:0.5rem;font-size:1.2rem;font-weight:700;">Accreditations &amp; Memberships</h2>
            <p style="color:var(--text-soft);margin-bottom:1.5rem;font-size:0.87rem;">
              We hold the following industry accreditations — giving you complete confidence in the quality and legitimacy of your installation.
            </p>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-bottom:1.5rem;">
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.5rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:var(--shadow-sm);">
                <div style="width:72px;height:56px;border-radius:10px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:6px;"><img src="fensa-logo.jpg" alt="FENSA Registered" style="max-width:100%;max-height:100%;object-fit:contain;"></div>
                <div>
                  <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">FENSA Registered</div>
                  <div style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:0.5rem;">Fenestration Self-Assessment Scheme</div>
                  <p style="font-size:0.8rem;color:var(--text-soft);line-height:1.55;">Government-authorised scheme ensuring window and door replacements comply with building regulations.</p>
                </div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.5rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:var(--shadow-sm);">
                <div style="width:72px;height:56px;border-radius:10px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:6px;"><img src="ggf-logo.jpg" alt="GGF Member" style="max-width:100%;max-height:100%;object-fit:contain;"></div>
                <div>
                  <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">GGF Member</div>
                  <div style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:0.5rem;">Glass &amp; Glazing Federation</div>
                  <p style="font-size:0.8rem;color:var(--text-soft);line-height:1.55;">The leading trade association for the glass and glazing industry, ensuring high standards of workmanship.</p>
                </div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.5rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:var(--shadow-sm);">
                <div style="width:72px;height:56px;border-radius:10px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:6px;"><img src="check-a-trade.png" alt="Checkatrade Approved" style="max-width:100%;max-height:100%;object-fit:contain;"></div>
                <div>
                  <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">Checkatrade Approved</div>
                  <div style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:0.5rem;">9.8/10 from 1,500+ reviews</div>
                  <p style="font-size:0.8rem;color:var(--text-soft);line-height:1.55;">Independently verified reviews from real customers across Surrey, Berkshire and Hampshire.</p>
                </div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.5rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:var(--shadow-sm);">
                <div style="width:72px;height:56px;border-radius:10px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:6px;"><img src="uktsa-surrey.webp" alt="Surrey Trading Standards Approved" style="max-width:100%;max-height:100%;object-fit:contain;"></div>
                <div>
                  <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">Trading Standards Approved</div>
                  <div style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:0.5rem;">Surrey County Council Trading Standards</div>
                  <p style="font-size:0.8rem;color:var(--text-soft);line-height:1.55;">Vetted and monitored under a Trading Standards approved trader scheme — your assurance of fair, honest and legitimate trading.</p>
                </div>
              </div>
              <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.5rem;display:flex;gap:1rem;align-items:flex-start;box-shadow:var(--shadow-sm);">
                <div style="width:48px;height:48px;border-radius:12px;background:var(--green-light);color:var(--green);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;"><i class="fas fa-lock"></i></div>
                <div>
                  <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">Secure Living Warranty</div>
                  <div style="font-size:0.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:0.5rem;">Up to £5,000 cover included free</div>
                  <p style="font-size:0.8rem;color:var(--text-soft);line-height:1.55;">Security guarantee that pays you directly in the unlikely event of a break-in caused by hardware failure.</p>
                </div>
              </div>
            </div>
            <div class="calc-disclaimer">
              <i class="fas fa-info-circle"></i>
              <span>Specific membership numbers and registration details are available on request.
              Please call <strong>01344 777515</strong> or visit <strong>threecounties.co.uk</strong>.</span>
            </div>
          </div>`;
        break;
    }
  },

  /* ---- Admin ---- */
  showAdmin() {
    App.showView('admin');
    if (AppState.isAdminLoggedIn) {
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-panel').classList.remove('hidden');
      Admin.renderSection('why_choose');
    } else {
      document.getElementById('admin-login').style.display = 'flex';
      document.getElementById('admin-panel').classList.add('hidden');
      const errEl = document.getElementById('admin-login-error');
      if (errEl) errEl.classList.add('hidden');
      App.resetForgotPasswordPanel();
    }
  },

  async adminLogin() {
    const emailEl    = document.getElementById('admin-email-input');
    const passwordEl = document.getElementById('admin-password-input');
    const errorEl    = document.getElementById('admin-login-error');
    const errorMsg   = document.getElementById('admin-login-error-msg');
    const btnLabel   = document.getElementById('btn-admin-login-label');
    const btnLoading = document.getElementById('btn-admin-login-loading');
    const submitBtn  = document.getElementById('btn-admin-login');

    const email    = emailEl?.value?.trim() || '';
    const password = passwordEl?.value      || '';

    if (!email || !password) {
      if (errorMsg) errorMsg.textContent = 'Please enter your email and password.';
      if (errorEl)  errorEl.classList.remove('hidden');
      return;
    }

    if (btnLabel)   btnLabel.classList.add('hidden');
    if (btnLoading) btnLoading.classList.remove('hidden');
    if (submitBtn)  submitBtn.disabled = true;
    if (errorEl)    errorEl.classList.add('hidden');

    try {
      const res = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
          body: JSON.stringify({ email, password })
        }
      );
      const json = await res.json();
      if (!res.ok || !json.access_token) {
        const raw = json?.error_description || json?.msg || json?.message || '';
        const msg = (raw.toLowerCase().includes('invalid') || raw.toLowerCase().includes('credentials') || raw === '')
          ? 'Incorrect email or password. Please try again.' : raw;
        if (errorMsg) errorMsg.textContent = msg;
        if (errorEl)  errorEl.classList.remove('hidden');
        if (passwordEl) { passwordEl.value = ''; passwordEl.focus(); }
      } else {
        AppState.isAdminLoggedIn   = true;
        AppState.adminAccessToken  = json.access_token;
        AppState.adminRefreshToken = json.refresh_token || null;
        if (errorEl) errorEl.classList.add('hidden');
        document.getElementById('admin-login').style.display  = 'none';
        document.getElementById('admin-panel').classList.remove('hidden');
        Admin.renderSection('why_choose');
      }
    } catch (e) {
      console.error('adminLogin error', e);
      if (errorMsg) errorMsg.textContent = 'Could not reach the server. Check your connection and try again.';
      if (errorEl)  errorEl.classList.remove('hidden');
    } finally {
      if (btnLabel)   btnLabel.classList.remove('hidden');
      if (btnLoading) btnLoading.classList.add('hidden');
      if (submitBtn)  submitBtn.disabled = false;
    }
  },

  async adminLogout() {
    try {
      if (AppState.adminAccessToken) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${AppState.adminAccessToken}` }
        });
      }
    } catch (e) { console.warn('signOut error (ignored)', e); }
    AppState.adminAccessToken = null;
    AppState.isAdminLoggedIn = false;
    const emailEl    = document.getElementById('admin-email-input');
    const passwordEl = document.getElementById('admin-password-input');
    if (emailEl)    emailEl.value    = '';
    if (passwordEl) passwordEl.value = '';
    const icon = document.getElementById('pw-toggle-icon');
    const pwInput = document.getElementById('admin-password-input');
    if (icon)    icon.className = 'fas fa-eye';
    if (pwInput) pwInput.type   = 'password';
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-panel').classList.add('hidden');
    App.showView('home');
  },

  togglePasswordVisibility() {
    const pwInput = document.getElementById('admin-password-input');
    const icon    = document.getElementById('pw-toggle-icon');
    if (!pwInput) return;
    const isHidden = pwInput.type === 'password';
    pwInput.type   = isHidden ? 'text' : 'password';
    if (icon) icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
  },

  toggleForgotPassword() {
    const panel = document.getElementById('forgot-pw-panel');
    const link  = document.getElementById('btn-forgot-pw');
    if (!panel) return;
    const isOpen = !panel.classList.contains('hidden');
    if (isOpen) {
      panel.classList.add('hidden');
      if (link) link.innerHTML = '<i class="fas fa-key"></i> Forgot password?';
      App.resetForgotPasswordPanel();
    } else {
      panel.classList.remove('hidden');
      if (link) link.innerHTML = '<i class="fas fa-chevron-up"></i> Hide';
      const loginEmail = document.getElementById('admin-email-input')?.value?.trim();
      const resetEmail = document.getElementById('forgot-pw-email');
      if (resetEmail && loginEmail) resetEmail.value = loginEmail;
      setTimeout(() => document.getElementById('forgot-pw-email')?.focus(), 60);
    }
  },

  resetForgotPasswordPanel() {
    const panel   = document.getElementById('forgot-pw-panel');
    const form    = document.getElementById('forgot-pw-form');
    const success = document.getElementById('forgot-pw-success');
    const errEl   = document.getElementById('forgot-pw-error');
    const emailEl = document.getElementById('forgot-pw-email');
    const link    = document.getElementById('btn-forgot-pw');
    if (form)    form.classList.remove('hidden');
    if (success) success.classList.add('hidden');
    if (errEl)   errEl.classList.add('hidden');
    if (emailEl) emailEl.value = '';
    if (panel)   panel.classList.add('hidden');
    if (link)    link.innerHTML = '<i class="fas fa-key"></i> Forgot password?';
  },

  async forgotPassword() {
    const emailEl   = document.getElementById('forgot-pw-email');
    const errEl     = document.getElementById('forgot-pw-error');
    const errMsg    = document.getElementById('forgot-pw-error-msg');
    const btnLabel  = document.getElementById('btn-send-reset-label');
    const btnLoad   = document.getElementById('btn-send-reset-loading');
    const submitBtn = document.getElementById('btn-send-reset');
    const form      = document.getElementById('forgot-pw-form');
    const success   = document.getElementById('forgot-pw-success');
    const sentTo    = document.getElementById('forgot-pw-sent-to');

    const email = emailEl?.value?.trim() || '';
    if (!email) {
      if (errMsg) errMsg.textContent = 'Please enter your email address.';
      if (errEl)  errEl.classList.remove('hidden');
      emailEl?.focus(); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errMsg) errMsg.textContent = 'Please enter a valid email address.';
      if (errEl)  errEl.classList.remove('hidden');
      emailEl?.focus(); return;
    }
    if (btnLabel)  btnLabel.classList.add('hidden');
    if (btnLoad)   btnLoad.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
    if (errEl)     errEl.classList.add('hidden');
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ email, redirectTo: window.location.origin + window.location.pathname })
      });
      if (!res.ok) {
        let raw = '';
        try { raw = (await res.json())?.msg || ''; } catch (_) {}
        const msg = raw.toLowerCase().includes('rate') || raw.toLowerCase().includes('limit')
          ? 'Too many requests. Please wait a few minutes and try again.'
          : (raw || 'Failed to send reset email. Please try again.');
        if (errMsg) errMsg.textContent = msg;
        if (errEl)  errEl.classList.remove('hidden');
      } else {
        if (sentTo) sentTo.textContent = email;
        if (form)    form.classList.add('hidden');
        if (success) success.classList.remove('hidden');
      }
    } catch (e) {
      if (errMsg) errMsg.textContent = 'Could not reach the server. Check your connection and try again.';
      if (errEl)  errEl.classList.remove('hidden');
    } finally {
      if (btnLabel)  btnLabel.classList.remove('hidden');
      if (btnLoad)   btnLoad.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  /* ---- Customer Share Link ---- */
  async loadCustomerView(deckId) {
    try {
      const deck = await API.getDeck(deckId);
      if (!deck) {
        document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;
            flex-direction:column;gap:1rem;font-family:Inter,sans-serif;background:#F5F5F0;padding:2rem;text-align:center;">
            <img src="logo.png" alt="Three Counties" style="height:50px;" />
            <h2 style="color:#E87722;font-size:1.3rem;">Deck Not Found</h2>
            <p style="color:#666;font-size:0.9rem;">This link may have expired or been removed.</p>
            <p style="color:#2D6A2F;font-weight:700;font-size:1rem;">📞 01344 777515</p>
            <p style="color:#999;font-size:0.8rem;">threecounties.co.uk</p>
          </div>`;
        return;
      }
      deck.modules_selected = Array.isArray(deck.modules_selected) ? deck.modules_selected : [];
      App.showView('customer');
      App.bindGlobalEvents();
      await Presentation.initCustomerView(deck);
    } catch (e) {
      console.error('Customer view error', e);
    }
  }
};

/* ============================================================
   GLOBAL UI HELPERS
   ============================================================ */

function showToast(message, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.className = 'toast hidden'; }, 3000);
}

function showModal(header, body, footer) {
  const h = document.getElementById('modal-header');
  const b = document.getElementById('modal-body');
  const f = document.getElementById('modal-footer');
  const o = document.getElementById('modal-overlay');
  if (h) h.innerHTML = header;
  if (b) b.innerHTML = body;
  if (f) f.innerHTML = footer;
  if (o) o.classList.remove('hidden');
}

function closeModal() {
  const o = document.getElementById('modal-overlay');
  if (o) o.classList.add('hidden');
}

function faqToggle(el, idx) {
  const isOpen = el.classList.contains('open');
  const grid = el.closest('.faqs-grid');
  if (grid) grid.querySelectorAll('.faq-card.open').forEach(card => card.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

function togglePriority(key) {
  if (!AppState.priorities) AppState.priorities = new Set();
  AppState.priorities.has(key) ? AppState.priorities.delete(key) : AppState.priorities.add(key);
  document.querySelectorAll('.priority-chip').forEach(chip => {
    chip.classList.toggle('selected', AppState.priorities.has(chip.dataset.priority));
  });
}

function toggleProduct(key) {
  if (!AppState.products) AppState.products = new Set();
  AppState.products.has(key) ? AppState.products.delete(key) : AppState.products.add(key);
  document.querySelectorAll('.product-chip').forEach(chip => {
    chip.classList.toggle('selected', AppState.products.has(chip.dataset.product));
  });
  // Recompute builder deck only when the builder view is active
  if (AppState.currentView === 'builder' && document.getElementById('module-grid')) {
    Builder.selectedModules = [...assembleDeckFromProducts()];
    Builder.renderGrid();
    Builder.renderSortable();
    Builder.updateCount();
    Builder.updateNextBtn();
  }
}

/* Sync the product-bar active state to AppState.products */
function syncProductBarUI() {
  document.querySelectorAll('.product-pill[data-product]').forEach(btn => {
    btn.classList.toggle('active', !!(AppState.products && AppState.products.has(btn.dataset.product)));
  });
}

function assembleDeckFromProducts() {
  const selected = AppState.products ? [...AppState.products] : [];
  if (selected.length === 0) return [...DEFAULT_DECK];
  // Collect all slides from each selected product's list
  const merged = new Set();
  selected.forEach(p => {
    const list = PRODUCT_DECKS[p];
    if (list) list.forEach(id => merged.add(id));
  });
  // Re-order by the position each slide appears in DEFAULT_DECK,
  // then append any extras (unknown products) at the end
  const ordered = DEFAULT_DECK.filter(id => merged.has(id));
  merged.forEach(id => { if (!ordered.includes(id)) ordered.push(id); });
  return ordered.length ? ordered : [...DEFAULT_DECK];
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
