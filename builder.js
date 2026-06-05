/* ============================================================
   DECK BUILDER — matches reference screenshot design exactly
   ============================================================ */

const Builder = {

  selectedModules: [],
  dragSrcIndex: null,

  /* ---- Initialise / render builder ---- */
  render() {
    Builder.renderGrid();
    Builder.renderSortable();
    Builder.updateCount();
    Builder.updateNextBtn();

    // Pre-fill from current deck if editing
    const nameEl = document.getElementById('deck-name-input');
    if (AppState.currentDeck) {
      if (nameEl) nameEl.value = AppState.currentDeck.deck_name || '';
      Builder.selectedModules = [...(AppState.currentDeck.modules_selected || [])];
      Builder.renderGrid();
      Builder.renderSortable();
      Builder.updateCount();
      Builder.updateNextBtn();
    } else {
      if (nameEl) nameEl.value = '';
      Builder.selectedModules = [];
      Builder.renderGrid();
      Builder.renderSortable();
      Builder.updateCount();
      Builder.updateNextBtn();
    }
  },

  /* ---- Render 4-column module grid ---- */
  renderGrid() {
    const grid = document.getElementById('module-grid');
    if (!grid) return;

    grid.innerHTML = MODULE_REGISTRY.map(mod => {
      const isSelected = Builder.selectedModules.includes(mod.id);
      const isPlaceholder = mod.placeholder;
      const isExternal = !!mod.externalLink;

      // Circle colour logic — matches reference:
      // orange-fill = calculator, ev charging, tariffs
      // green-fill  = why choose us, installation, reviews (second row), faqs (second row)
      // outline     = not yet selected / placeholder
      let circleClass = 'outline';
      if (isSelected) {
        circleClass = mod.iconStyle === 'orange' ? 'orange-fill' : 'green-fill';
      } else if (!isPlaceholder && !isExternal) {
        // Show default colour even when not selected
        circleClass = mod.iconStyle === 'orange' ? 'orange-fill' : 'green-fill';
      }

      const tileClasses = [
        'mod-tile',
        isSelected ? 'selected' : '',
        isPlaceholder ? 'placeholder' : ''
      ].filter(Boolean).join(' ');

      return `
        <div class="${tileClasses}"
          data-id="${mod.id}"
          onclick="Builder.toggleModule('${mod.id}', ${JSON.stringify(mod.externalLink || null)})">
          ${isPlaceholder ? '<span class="coming-soon-chip">Soon</span>' : ''}
          ${isExternal ? '<span class="ext-chip">↗ Link</span>' : ''}
          <div class="mod-circle ${circleClass}">
            <i class="fas ${mod.icon}"></i>
          </div>
          <div class="mod-tile-text">
            <div class="mod-tile-name">${escHtml(mod.name)}</div>
            <div class="mod-tile-sub">${escHtml(mod.subtitle)}</div>
          </div>
          <i class="fas fa-arrow-right mod-tile-arrow"></i>
        </div>`;
    }).join('');
  },

  /* ---- Toggle selection ---- */
  toggleModule(modId, externalLink) {
    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener');
      return;
    }
    // Placeholders are not selectable
    const mod = MODULE_REGISTRY.find(m => m.id === modId);
    if (mod?.placeholder) return;

    const idx = Builder.selectedModules.indexOf(modId);
    if (idx === -1) {
      Builder.selectedModules.push(modId);
    } else {
      Builder.selectedModules.splice(idx, 1);
    }

    Builder.renderGrid();
    Builder.renderSortable();
    Builder.updateCount();
    Builder.updateNextBtn();
  },

  /* ---- Render sortable order list ---- */
  renderSortable() {
    const section = document.getElementById('order-section');
    const list    = document.getElementById('sortable-list');
    if (!section || !list) return;

    if (Builder.selectedModules.length === 0) {
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');

    list.innerHTML = Builder.selectedModules.map((modId, i) => {
      const mod = MODULE_REGISTRY.find(m => m.id === modId);
      if (!mod) return '';
      return `
        <div class="sort-item"
          draggable="true"
          data-index="${i}"
          ondragstart="Builder.onDragStart(event,${i})"
          ondragover="Builder.onDragOver(event)"
          ondrop="Builder.onDrop(event,${i})"
          ondragend="Builder.onDragEnd()">
          <i class="fas fa-grip-vertical sort-handle"></i>
          <div class="sort-num">${i + 1}</div>
          <span class="sort-name">
            <i class="fas ${mod.icon}" style="color:var(--orange);margin-right:0.35rem;"></i>
            ${escHtml(mod.name)}
          </span>
          <button class="sort-remove" onclick="Builder.removeItem('${modId}',event)" title="Remove">
            <i class="fas fa-times"></i>
          </button>
        </div>`;
    }).join('');
  },

  removeItem(modId, e) {
    e.stopPropagation();
    const idx = Builder.selectedModules.indexOf(modId);
    if (idx !== -1) Builder.selectedModules.splice(idx, 1);
    Builder.renderGrid();
    Builder.renderSortable();
    Builder.updateCount();
    Builder.updateNextBtn();
  },

  /* ---- Drag & drop ---- */
  onDragStart(e, i) {
    Builder.dragSrcIndex = i;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  },
  onDragOver(e) {
    e.preventDefault();
    document.querySelectorAll('.sort-item').forEach(el => el.classList.remove('drag-over'));
    e.currentTarget.classList.add('drag-over');
  },
  onDrop(e, toIndex) {
    e.preventDefault();
    if (Builder.dragSrcIndex === null || Builder.dragSrcIndex === toIndex) return;
    const moved = Builder.selectedModules.splice(Builder.dragSrcIndex, 1)[0];
    Builder.selectedModules.splice(toIndex, 0, moved);
    Builder.dragSrcIndex = null;
    Builder.renderGrid();
    Builder.renderSortable();
  },
  onDragEnd() {
    Builder.dragSrcIndex = null;
    document.querySelectorAll('.sort-item').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
  },

  /* ---- Count & button ---- */
  updateCount() {
    const badge = document.getElementById('selected-count-badge');
    if (badge) badge.textContent = `${Builder.selectedModules.length} selected`;
  },
  updateNextBtn() {
    const btn = document.getElementById('btn-start-presentation');
    if (btn) btn.disabled = Builder.selectedModules.length === 0;
  },

  /* ---- Presets ---- */
  applyPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    Builder.selectedModules = [...preset.modules];
    Builder.renderGrid();
    Builder.renderSortable();
    Builder.updateCount();
    Builder.updateNextBtn();
    showToast(`Preset: ${preset.name}`, 'success');
  },

  clearAll() {
    Builder.selectedModules = [];
    Builder.renderGrid();
    Builder.renderSortable();
    Builder.updateCount();
    Builder.updateNextBtn();
  },

  /* ---- Save deck ---- */
  async saveDeck() {
    const nameEl = document.getElementById('deck-name-input');
    const name   = (nameEl?.value || '').trim();
    if (!name) {
      showToast('Please enter a deck name first.', 'error');
      nameEl?.focus();
      return;
    }
    if (Builder.selectedModules.length === 0) {
      showToast('Select at least one module.', 'error');
      return;
    }

    let calcInputs = null;
    // Try to grab calculator inputs if present on page
    if (Builder.selectedModules.includes('calculator')) {
      calcInputs = Builder.readCalcInputs();
    }

    const payload = {
      deck_name: name,
      modules_selected: Builder.selectedModules,
      customer_inputs: calcInputs ? JSON.stringify(calcInputs) : null,
      is_archived: false
    };
    if (AppState.currentDeck?.id) payload.id = AppState.currentDeck.id;

    const saved = await API.saveDeck(payload);
    if (saved) {
      AppState.currentDeck = { ...saved, modules_selected: Builder.selectedModules };
      showToast('Deck saved!', 'success');
      Builder.showShareModal(saved.id, name);
    } else {
      showToast('Error saving. Please try again.', 'error');
    }
  },

  readCalcInputs() {
    const g = (id, fb) => { const el = document.getElementById(id); return el ? (parseFloat(el.value) || fb) : fb; };
    return {
      annualUsage:    g('calc-annualUsage', 3800),
      unitPrice:      g('calc-unitPrice', 28.5),
      standingCharge: g('calc-standingCharge', 53.0),
      arraySize:      g('calc-arraySize', 4.0),
      battery:        g('calc-battery', 5.0),
      exportTariff:   g('calc-exportTariff', 15.0),
      systemCost:     g('calc-systemCost', 8500)
    };
  },

  showShareModal(deckId, deckName) {
    Builder.showShareLinkById(deckId, deckName);
  },

  showShareLinkById(deckId, deckName) {
    const url = `${window.location.origin}${window.location.pathname}?deck=${deckId}`;
    showModal(
      `<i class="fas fa-link" style="color:var(--orange);margin-right:0.4rem;"></i> Customer Share Link`,
      `<p style="margin-bottom:0.85rem;font-size:0.88rem;color:var(--text-soft);">
        Share this link with <strong>${escHtml(deckName || 'the customer')}</strong> for a read-only view of their personalised estimate.
      </p>
      <div class="share-box">
        <span class="share-url">${url}</span>
        <button class="btn-copy" onclick="Builder.copyLink('${url}')">
          <i class="fas fa-copy"></i> Copy
        </button>
      </div>
      <p style="font-size:0.73rem;color:var(--text-muted);margin-top:0.65rem;">
        <i class="fas fa-info-circle"></i> No login required. Link is valid for 12 months.
      </p>`,
      `<button class="btn-secondary" onclick="closeModal()">Done</button>`
    );
  },

  copyLink(url) {
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link copied!', 'success'))
      .catch(() => showToast('Copy the link manually from the box.', ''));
  }
};
