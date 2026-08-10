/* ============================================================
   ADMIN MODULE v3
   Content Manager, Calculator Settings, Tariff Settings, Decks
   ============================================================ */

const Admin = {

  currentSection: 'calculator',

  async renderSection(section) {
    Admin.currentSection = section;
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
    const content = document.getElementById('admin-content');
    if (!content) return;
    content.innerHTML = '<div class="loading"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';
    switch (section) {
      case 'settings':
      case 'calculator':
        content.innerHTML = await Admin.renderCalculatorSettings();
        Admin.bindCalculatorSettingsSave();
        break;
      case 'faqs':
        content.innerHTML = await Admin.renderFAQsEditor();
        Admin.bindContentListEvents('faqs', 'faq');
        break;
      case 'reviews':
        content.innerHTML = await Admin.renderReviewsEditor();
        Admin.bindContentListEvents('reviews', 'review');
        break;
      case 'tariffs':
        content.innerHTML = await Admin.renderTariffsEditor();
        Admin.bindTariffsEvents();
        break;
      case 'journey':
        content.innerHTML = await Admin.renderJourneyEditor();
        Admin.bindContentListEvents('installation_journey', 'journey_step');
        break;
      case 'videos':
        content.innerHTML = await Admin.renderVideosEditor();
        Admin.bindContentListEvents('videos', 'video');
        break;
      case 'customer_hub':
        content.innerHTML = await Admin.renderCustomerHubEditor();
        Admin.bindContentListEvents('customer_hub', 'hub_item');
        break;
      case 'ev_charging_admin':
        content.innerHTML = await Admin.renderEvChargingEditor();
        Admin.bindContentListEvents('ev_charging', 'faq');
        break;
      case 'moving_house_admin':
        content.innerHTML = await Admin.renderMovingHouseEditor();
        Admin.bindContentListEvents('moving_house', 'faq');
        break;
      case 'decks_admin':
        content.innerHTML = await Admin.renderDecksAdmin();
        break;
      case 'welcome':
        content.innerHTML = await Admin.renderWelcomeEditor();
        Admin.bindWelcomeEditorSave();
        break;
      case 'secure_living':
        content.innerHTML = await Admin.renderSecureLivingEditor();
        Admin.bindContentListEvents('secure_living', 'secure_living');
        break;
      case 'finance':
        content.innerHTML = await Admin.renderFinanceEditor();
        Admin.bindFinanceEditorSave();
        break;
      case 'why_choose':
        content.innerHTML = await Admin.renderWhyChooseEditor();
        Admin.bindContentListEvents('why_choose', 'hub_item');
        break;
      case 'how_we_help':
        content.innerHTML = await Admin.renderHowWeHelpEditor();
        Admin.bindContentListEvents('how_we_help', 'how_we_help');
        break;
      default:
        content.innerHTML = '<div class="empty-state"><p>Section not found.</p></div>';
    }
  },

  async renderCalculatorSettings() {
    const settings = AppState.settings;
    const renderField = (key, description) => {
      const s = settings[key];
      if (!s) return '';
      const isFloat = s.setting_value.includes('.');
      const step = isFloat ? '0.001' : '1';
      return `
        <div class="admin-field">
          <label>${escHtml(s.label)}</label>
          <div class="field-desc">${escHtml(s.description)}</div>
          <input type="number" class="admin-input calc-setting-input"
            data-record-id="${s.id}"
            data-key="${key}"
            value="${s.setting_value}"
            step="${step}" />
        </div>`;
    };
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-calculator" style="color:var(--orange);margin-right:0.5rem;"></i> Calculator Settings</h2>
        <p>Edit the default input values and global assumptions used in the savings calculator.</p>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Global Assumptions</h3>
          <span class="last-updated">These affect all calculations</span>
        </div>
        ${renderField('yield_kwh_per_kwp')}
        ${renderField('baselineSelfUsePct_noBattery')}
        ${renderField('maxSelfUsePct_bigBattery')}
        ${renderField('co2_factor_kg_per_kwh')}
        ${renderField('savingsEscalationRate')}
        <div class="admin-save-btn-row">
          <button class="btn-primary" id="btn-save-calc-assumptions">
            <i class="fas fa-floppy-disk"></i> Save Assumptions
          </button>
        </div>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Default Input Values</h3>
          <span class="last-updated">Pre-filled values when starting a new deck</span>
        </div>
        ${renderField('default_annualUsage')}
        <div class="admin-row">
          ${renderField('default_unitPrice')}
          ${renderField('default_standingCharge')}
        </div>
        <div class="admin-row">
          ${renderField('default_arraySize')}
          ${renderField('default_battery')}
        </div>
        <div class="admin-row">
          ${renderField('default_exportTariff')}
          ${renderField('default_systemCost')}
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" id="btn-save-calc-defaults">
            <i class="fas fa-floppy-disk"></i> Save Defaults
          </button>
        </div>
      </div>
      <div class="admin-card" style="background:var(--orange-light);border-color:rgba(232,119,34,0.3);">
        <div class="admin-card-header">
          <h3><i class="fas fa-lock" style="color:var(--orange);"></i> Formula Logic (Locked)</h3>
        </div>
        <p style="font-size:0.85rem;color:var(--text-soft);">
          The core calculation formulas are fixed to prevent accidental breakage. Only the assumption values above are editable.
          To change formulas, a developer update is required.
        </p>
        <div style="margin-top:0.75rem;background:var(--bg-card);border-radius:8px;padding:1rem;font-size:0.78rem;font-family:monospace;color:var(--text-soft);">
          Current Bill = (usage x unit_price/100) + (standing_charge/100 x 365)<br/>
          Generation = array_kWp x yield_per_kWp<br/>
          Self-Use% = baseline + (max - baseline) x battery_coverage<br/>
          Annual Saving = (self_consumed x unit_price/100) + (exported x export_tariff/100)<br/>
          Payback = system_cost / annual_saving<br/>
          25yr = Sum(annual_saving x (1 + escalation)^year) for 25 years
        </div>
      </div>`;
  },

  bindCalculatorSettingsSave() {
    const saveBtn1 = document.getElementById('btn-save-calc-assumptions');
    const saveBtn2 = document.getElementById('btn-save-calc-defaults');
    const saveAll = async (btn) => {
      const inputs = document.querySelectorAll('.calc-setting-input');
      let allOk = true;
      for (const input of inputs) {
        const recordId = input.dataset.recordId;
        const val = input.value.trim();
        if (!recordId || val === '') continue;
        const result = await API.saveSetting(recordId, val);
        if (result) {
          const key = input.dataset.key;
          if (AppState.settings[key]) AppState.settings[key].setting_value = val;
        } else {
          allOk = false;
        }
      }
      if (allOk) showToast('Settings saved!', 'success');
      else showToast('Some settings failed to save.', 'error');
    };
    if (saveBtn1) saveBtn1.addEventListener('click', saveAll);
    if (saveBtn2) saveBtn2.addEventListener('click', saveAll);
  },

  async renderFAQsEditor() {
    const items = AppState.getModuleItems('faqs');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-circle-question" style="color:var(--orange);margin-right:0.5rem;"></i> FAQs &amp; Objections</h2>
        <p>Manage the common questions shown to customers. Click to expand and edit.</p>
      </div>
      <div class="admin-list" id="admin-faqs-list">
        ${Admin.renderContentItemsList(items, 'faq')}
      </div>
      <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('faqs', 'faq')">
        <i class="fas fa-plus"></i> Add New FAQ
      </button>`;
  },

  async renderReviewsEditor() {
    const items = AppState.getModuleItems('reviews');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-star" style="color:var(--orange);margin-right:0.5rem;"></i> Customer Reviews</h2>
        <p>Add, edit, or remove customer reviews displayed in the presentation.</p>
      </div>
      <div class="admin-list" id="admin-reviews-list">
        ${Admin.renderContentItemsList(items, 'review')}
      </div>
      <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('reviews', 'review')">
        <i class="fas fa-plus"></i> Add New Review
      </button>`;
  },

  async renderSecureLivingEditor() {
    const items = AppState.getModuleItems('secure_living');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-shield" style="color:var(--orange);margin-right:0.5rem;"></i> Security Guaranteed</h2>
        <p>Edit the Secure Living page. The first item is the intro banner text; the rest are the payout cards (figure, label, description). Drag order via Sort Order.</p>
      </div>
      <div class="admin-list" id="admin-secure_living-list">
        ${Admin.renderContentItemsList(items, 'secure_living')}
      </div>
      <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('secure_living', 'secure_living')">
        <i class="fas fa-plus"></i> Add New Payout Card
      </button>`;
  },

  async renderJourneyEditor() {
    const items = AppState.getModuleItems('installation_journey');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-road" style="color:var(--orange);margin-right:0.5rem;"></i> Installation Journey</h2>
        <p>Edit the step-by-step installation timeline shown to customers.</p>
      </div>
      <div class="admin-list" id="admin-journey-list">
        ${Admin.renderContentItemsList(items, 'journey_step')}
      </div>
      <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('installation_journey', 'journey_step')">
        <i class="fas fa-plus"></i> Add New Step
      </button>`;
  },

  async renderVideosEditor() {
    const allVideos = Object.values(AppState.contentItems)
      .filter(i => i.module_id === 'videos')
      .sort((a,b) => (a.sort_order||0) - (b.sort_order||0));
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-play-circle" style="color:var(--orange);margin-right:0.5rem;"></i> Videos</h2>
        <p>Add YouTube or Vimeo video URLs to display in the Videos module. Leave URL empty to hide.</p>
      </div>
      <div class="admin-list" id="admin-videos-list">
        ${Admin.renderContentItemsList(allVideos, 'video')}
      </div>
      <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('videos', 'video')">
        <i class="fas fa-plus"></i> Add New Video
      </button>`;
  },

  async renderCustomerHubEditor() {
    const items = Object.values(AppState.contentItems)
      .filter(i => i.module_id === 'customer_hub')
      .sort((a,b) => (a.sort_order||0) - (b.sort_order||0));

    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-users" style="color:var(--orange);margin-right:0.5rem;"></i> Customer Hub</h2>
        <p>Edit the content shown in the Customer Proof Hub.</p>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>About Us Text</h3>
          <span class="last-updated">Shown on the About Us tab</span>
        </div>
        <div class="admin-field">
          <label>Paragraph 1</label>
          <textarea class="admin-textarea" id="hub-about-p1" rows="3">${escHtml(Admin._getHubSetting('about_p1', "We've spent years building our reputation as trusted local solar installers across Surrey, Berkshire and Hampshire."))}</textarea>
        </div>
        <div class="admin-field">
          <label>Paragraph 2</label>
          <textarea class="admin-textarea" id="hub-about-p2" rows="3">${escHtml(Admin._getHubSetting('about_p2', "At Three Counties Solar, we work with both residential and commercial clients, helping homeowners make confident, informed decisions about their energy."))}</textarea>
        </div>
        <div class="admin-field">
          <label>Service Area Text</label>
          <input type="text" class="admin-input" id="hub-service-area" value="${escHtml(Admin._getHubSetting('service_area', 'Based in Camberley - solar panels, EV charging, home battery storage across Surrey, Berkshire & Hampshire.'))}" />
        </div>
        <div class="admin-field">
          <label>Phone Number</label>
          <input type="text" class="admin-input" id="hub-phone" value="${escHtml(Admin._getHubSetting('phone', '01252 414800'))}" />
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveHubSettings()">
            <i class="fas fa-floppy-disk"></i> Save About Us
          </button>
        </div>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>UK Solar Stats</h3>
          <span class="last-updated">4 stats shown in the green box</span>
        </div>
        <div class="admin-row">
          <div class="admin-field">
            <label>Stat 1 Value</label>
            <input type="text" class="admin-input" id="hub-stat1-val" value="${escHtml(Admin._getHubSetting('stat1_val', '1.4M+'))}" />
          </div>
          <div class="admin-field">
            <label>Stat 1 Label</label>
            <input type="text" class="admin-input" id="hub-stat1-label" value="${escHtml(Admin._getHubSetting('stat1_label', 'Solar installations across UK homes'))}" />
          </div>
        </div>
        <div class="admin-row">
          <div class="admin-field">
            <label>Stat 2 Value</label>
            <input type="text" class="admin-input" id="hub-stat2-val" value="${escHtml(Admin._getHubSetting('stat2_val', 'GBP1,000+'))}" />
          </div>
          <div class="admin-field">
            <label>Stat 2 Label</label>
            <input type="text" class="admin-input" id="hub-stat2-label" value="${escHtml(Admin._getHubSetting('stat2_label', 'Average annual savings for solar homes'))}" />
          </div>
        </div>
        <div class="admin-row">
          <div class="admin-field">
            <label>Stat 3 Value</label>
            <input type="text" class="admin-input" id="hub-stat3-val" value="${escHtml(Admin._getHubSetting('stat3_val', '25 yrs'))}" />
          </div>
          <div class="admin-field">
            <label>Stat 3 Label</label>
            <input type="text" class="admin-input" id="hub-stat3-label" value="${escHtml(Admin._getHubSetting('stat3_label', 'Typical panel performance lifespan'))}" />
          </div>
        </div>
        <div class="admin-row">
          <div class="admin-field">
            <label>Stat 4 Value</label>
            <input type="text" class="admin-input" id="hub-stat4-val" value="${escHtml(Admin._getHubSetting('stat4_val', '4-7 yrs'))}" />
          </div>
          <div class="admin-field">
            <label>Stat 4 Label</label>
            <input type="text" class="admin-input" id="hub-stat4-label" value="${escHtml(Admin._getHubSetting('stat4_label', 'Typical payback period in the UK'))}" />
          </div>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveHubSettings()">
            <i class="fas fa-floppy-disk"></i> Save Stats
          </button>
        </div>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>USP List</h3>
          <span class="last-updated">Credentials shown on the right side</span>
        </div>
        <div id="admin-hub-list">
          ${Admin.renderContentItemsList(items, 'hub_item')}
        </div>
        <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('customer_hub', 'hub_item')">
          <i class="fas fa-plus"></i> Add New USP
        </button>
      </div>`;
  },

  _getHubSetting(key, defaultVal) {
    const s = AppState.settings['hub_' + key];
    return s ? s.setting_value : defaultVal;
  },

  async saveHubSettings() {
    const fields = {
      'hub_about_p1':     document.getElementById('hub-about-p1') ? document.getElementById('hub-about-p1').value : null,
      'hub_about_p2':     document.getElementById('hub-about-p2') ? document.getElementById('hub-about-p2').value : null,
      'hub_service_area': document.getElementById('hub-service-area') ? document.getElementById('hub-service-area').value : null,
      'hub_phone':        document.getElementById('hub-phone') ? document.getElementById('hub-phone').value : null,
      'hub_stat1_val':    document.getElementById('hub-stat1-val') ? document.getElementById('hub-stat1-val').value : null,
      'hub_stat1_label':  document.getElementById('hub-stat1-label') ? document.getElementById('hub-stat1-label').value : null,
      'hub_stat2_val':    document.getElementById('hub-stat2-val') ? document.getElementById('hub-stat2-val').value : null,
      'hub_stat2_label':  document.getElementById('hub-stat2-label') ? document.getElementById('hub-stat2-label').value : null,
      'hub_stat3_val':    document.getElementById('hub-stat3-val') ? document.getElementById('hub-stat3-val').value : null,
      'hub_stat3_label':  document.getElementById('hub-stat3-label') ? document.getElementById('hub-stat3-label').value : null,
      'hub_stat4_val':    document.getElementById('hub-stat4-val') ? document.getElementById('hub-stat4-val').value : null,
      'hub_stat4_label':  document.getElementById('hub-stat4-label') ? document.getElementById('hub-stat4-label').value : null,
    };

    let allOk = true;
    for (const key in fields) {
      const val = fields[key];
      if (val === null || val === undefined) continue;
      const existing = AppState.settings[key];
      if (existing) {
        const result = await API.saveSetting(existing.id, val);
        if (result) AppState.settings[key].setting_value = val;
        else allOk = false;
      } else {
        try {
          const res = await fetch(SUPABASE_URL + '/rest/v1/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + (AppState.adminAccessToken || SUPABASE_KEY),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ setting_key: key, setting_value: val, label: key, description: '' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]) AppState.settings[key] = data[0];
          } else allOk = false;
        } catch (e) { allOk = false; }
      }
    }
    if (allOk) showToast('Customer Hub saved!', 'success');
    else showToast('Some fields failed to save.', 'error');
  },

  async renderTariffsEditor() {
    const tariffs = AppState.getModuleItems('tariffs');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-bolt" style="color:var(--orange);margin-right:0.5rem;"></i> Tariff Settings</h2>
        <p>Edit the tariff comparison table and outbound links shown to customers.</p>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Tariff Examples</h3>
          <span class="last-updated">Used in the Tariff Comparison module</span>
        </div>
        <div id="admin-tariffs-list">
          ${tariffs.map(t => Admin.renderTariffItem(t)).join('')}
        </div>
        <button class="admin-add-btn mt-2" onclick="Admin.addNewTariff()">
          <i class="fas fa-plus"></i> Add Tariff
        </button>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Tariff Outbound Links</h3>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem;">
          Links are currently hardcoded to Octopus Energy pages.
        </p>
        <div style="background:var(--bg);border-radius:8px;padding:1rem;">
          <div style="font-size:0.85rem;margin-bottom:0.5rem;"><strong>Current links:</strong></div>
          <div style="font-size:0.82rem;color:var(--text-muted);">
            Octopus Tariffs: <a href="https://octopus.energy/tariffs/" target="_blank">octopus.energy/tariffs/</a><br/>
            Octopus Flux: <a href="https://octopus.energy/flux/" target="_blank">octopus.energy/flux/</a>
          </div>
        </div>
      </div>`;
  },

  renderTariffItem(t) {
    return `
      <div class="admin-list-item" id="tariff-item-${t.id}">
        <div class="admin-list-item-header">
          <strong>${escHtml(t.title)}</strong>
          <div class="admin-list-item-actions">
            <button class="btn-danger" onclick="Admin.deleteTariff('${t.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="admin-row-3">
          <div class="admin-field">
            <label>Tariff Name</label>
            <input type="text" class="admin-input" data-field="title" value="${escHtml(t.title)}" />
          </div>
          <div class="admin-field">
            <label>Day Rate (p/kWh)</label>
            <input type="number" class="admin-input" data-field="meta1" value="${t.meta1 || ''}" step="0.1" />
          </div>
          <div class="admin-field">
            <label>Night Rate (p/kWh)</label>
            <input type="number" class="admin-input" data-field="meta2" value="${t.meta2 || ''}" step="0.1" />
          </div>
        </div>
        <div class="admin-row">
          <div class="admin-field">
            <label>Export Rate (p/kWh)</label>
            <input type="number" class="admin-input" data-field="meta3" value="${t.meta3 || ''}" step="0.1" />
          </div>
          <div class="admin-field">
            <label>Notes / Description</label>
            <input type="text" class="admin-input" data-field="body" value="${escHtml(t.body || '')}" />
          </div>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-secondary" onclick="Admin.saveTariff('${t.id}', this.closest('.admin-list-item'))">
            <i class="fas fa-floppy-disk"></i> Save
          </button>
        </div>
      </div>`;
  },

  bindTariffsEvents() {},

  async saveTariff(itemId, container) {
    const getVal = (field) => container.querySelector('[data-field="' + field + '"]') ? container.querySelector('[data-field="' + field + '"]').value.trim() : '';
    const item = Object.values(AppState.contentItems).find(i => i.id === itemId);
    if (!item) return;
    const updated = { ...item, title: getVal('title'), body: getVal('body'), meta1: getVal('meta1'), meta2: getVal('meta2'), meta3: getVal('meta3') };
    const result = await API.saveContentItem(updated);
    if (result) { AppState.contentItems[itemId] = result; showToast('Tariff saved!', 'success'); }
    else showToast('Error saving tariff.', 'error');
  },

  async addNewTariff() {
    const newItem = {
      module_id: 'tariffs', content_type: 'tariff', title: 'New Tariff', body: '',
      meta1: '25.0', meta2: '15.0', meta3: '15.0',
      sort_order: Object.values(AppState.contentItems).filter(i => i.module_id === 'tariffs').length + 1,
      is_active: true, _isNew: true
    };
    const result = await API.saveContentItem(newItem);
    if (result) { AppState.contentItems[result.id] = result; await Admin.renderSection('tariffs'); showToast('New tariff added!', 'success'); }
  },

  async deleteTariff(itemId) {
    if (!confirm('Delete this tariff?')) return;
    const ok = await API.deleteContentItem(itemId);
    if (ok) { delete AppState.contentItems[itemId]; document.getElementById('tariff-item-' + itemId) && document.getElementById('tariff-item-' + itemId).remove(); showToast('Tariff deleted.', ''); }
  },

  renderContentItemsList(items, type) {
    if (items.length === 0) return '<div class="empty-state"><i class="fas fa-inbox"></i><p>No items yet. Add one below.</p></div>';
    return items.map(item => Admin.renderContentItemCard(item, type)).join('');
  },

  renderContentItemCard(item, type) {
    const typeConfig = {
      faq: { fields: [{ key: 'title', label: 'Question / Headline', type: 'text' }, { key: 'body', label: 'Answer', type: 'textarea' }] },
      review: { fields: [{ key: 'title', label: 'Review Headline', type: 'text' }, { key: 'body', label: 'Review Text', type: 'textarea' }, { key: 'meta1', label: 'Reviewer Name', type: 'text' }, { key: 'meta2', label: 'Star Rating (1-5)', type: 'number', min: 1, max: 5 }, { key: 'meta3', label: 'Location', type: 'text' }] },
      journey_step: { fields: [{ key: 'title', label: 'Step Title', type: 'text' }, { key: 'meta1', label: 'Timing (e.g. Day 1)', type: 'text' }, { key: 'body', label: 'Description', type: 'textarea' }] },
      video: { fields: [{ key: 'title', label: 'Video Title', type: 'text' }, { key: 'meta2', label: 'Video URL (YouTube or Vimeo)', type: 'text' }, { key: 'meta1', label: 'Caption / Description', type: 'text' }] },
      hub_item: { fields: [{ key: 'title', label: 'USP Title (e.g. MCS Certified)', type: 'text' }, { key: 'body', label: 'USP Description', type: 'text' }, { key: 'meta1', label: 'Icon (e.g. fa-certificate)', type: 'text' }] },
      secure_living: { fields: [{ key: 'meta1', label: 'Figure (e.g. £1,000) — leave blank for the intro banner', type: 'text' }, { key: 'title', label: 'Card Label (e.g. Emergency Boarding Up)', type: 'text' }, { key: 'body', label: 'Description / Intro banner text', type: 'textarea' }] },
      how_we_help: { fields: [{ key: 'title', label: 'Sentence text', type: 'textarea' }, { key: 'meta1', label: 'Product', type: 'select', options: ['windows','doors','conservatories'] }, { key: 'meta2', label: 'Priority', type: 'select', options: ['security','thermal','aesthetics','maintenance','resell'] }] }
    };
    const config = typeConfig[type] || { fields: [] };
    const isActive = item.is_active !== false;
    const fieldsHTML = config.fields.map(f => {
      const val = escHtml(item[f.key] || '');
      if (f.type === 'select') return `<div class="admin-field"><label>${f.label}</label><select class="admin-input" data-field="${f.key}">${f.options.map(o => `<option value="${o}" ${ (item[f.key]||'') === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
      if (f.type === 'textarea') return `<div class="admin-field"><label>${f.label}</label><textarea class="admin-textarea" data-field="${f.key}">${val}</textarea></div>`;
      return `<div class="admin-field"><label>${f.label}</label><input type="${f.type}" class="admin-input" data-field="${f.key}" value="${val}" ${f.min !== undefined ? 'min="' + f.min + '"' : ''} ${f.max !== undefined ? 'max="' + f.max + '"' : ''} /></div>`;
    }).join('');
    return `
      <div class="admin-list-item" id="content-item-${item.id}">
        <div class="admin-list-item-header">
          <strong>${escHtml(item.title || 'Untitled')}</strong>
          <div class="admin-list-item-actions">
            <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;">
              <input type="checkbox" ${isActive ? 'checked' : ''} data-field="is_active" onchange="Admin.toggleItemActive('${item.id}', this)" /> Active
            </label>
            <button class="btn-danger" onclick="Admin.deleteItem('${item.id}', '${type}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        ${fieldsHTML}
        <div class="admin-field">
          <label>Sort Order</label>
          <input type="number" class="admin-input" data-field="sort_order" value="${item.sort_order || 0}" style="width:80px;" />
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-secondary" onclick="Admin.saveItem('${item.id}', '${type}', this.closest('.admin-list-item'))">
            <i class="fas fa-floppy-disk"></i> Save
          </button>
        </div>
      </div>`;
  },

  bindContentListEvents(moduleId, type) {},

  async saveItem(itemId, type, container) {
    const item = AppState.contentItems[itemId];
    if (!item) return;
    const fields = container.querySelectorAll('[data-field]');
    const updates = { ...item };
    fields.forEach(f => {
      const field = f.dataset.field;
      if (field === 'is_active') return;
      if (f.type === 'checkbox') updates[field] = f.checked;
      else if (f.type === 'number') updates[field] = parseFloat(f.value) || 0;
      else updates[field] = f.value;
    });
    if (type === 'video') {
      const urlField = container.querySelector('[data-field="meta2"]');
      updates.is_active = !!(urlField && urlField.value.trim());
    }
    const result = await API.saveContentItem(updates);
    if (result) { AppState.contentItems[itemId] = result; showToast('Saved!', 'success'); }
    else showToast('Error saving item.', 'error');
  },

  async toggleItemActive(itemId, checkbox) {
    const item = AppState.contentItems[itemId];
    if (!item) return;
    const result = await API.saveContentItem({ ...item, is_active: checkbox.checked });
    if (result) { AppState.contentItems[itemId] = result; showToast(checkbox.checked ? 'Item made active.' : 'Item hidden.', 'success'); }
  },

  async deleteItem(itemId, type) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    const ok = await API.deleteContentItem(itemId);
    if (ok) {
      delete AppState.contentItems[itemId];
      const el = document.getElementById('content-item-' + itemId);
      if (el) el.remove();
      showToast('Deleted.', '');
    }
  },

  async addNewItem(moduleId, type) {
    // Determine which list container to inject the new card into
    const listIdMap = {
      faqs:                 'admin-faqs-list',
      reviews:              'admin-reviews-list',
      installation_journey: 'admin-journey-list',
      videos:               'admin-videos-list',
      customer_hub:         'admin-hub-list',
      ev_charging:          'admin-ev-faqs-list',
      moving_house:         'admin-mh-faqs-list'
    };
    const listEl = document.getElementById(listIdMap[moduleId] || '');

    const existingItems = Object.values(AppState.contentItems).filter(i => i.module_id === moduleId);
    const newItem = {
      module_id: moduleId, content_type: type,
      title: type === 'faq' ? 'New Question' : type === 'review' ? 'New Review' : type === 'video' ? 'New Video' : type === 'hub_item' ? 'New USP' : type === 'how_we_help' ? 'New sentence' : 'New Step',
      body: '',
      meta1: type === 'review' ? 'Customer Name' : type === 'journey_step' ? 'Week 1' : type === 'hub_item' ? 'fa-star' : type === 'how_we_help' ? 'windows' : '',
      meta2: type === 'review' ? '5' : type === 'how_we_help' ? 'security' : '', meta3: '',
      sort_order: existingItems.length + 1,
      is_active: type !== 'video', _isNew: true
    };

    // Insert a temporary "saving…" placeholder immediately so the user sees feedback
    const tempId = 'new-item-temp-' + Date.now();
    if (listEl) {
      const tempEl = document.createElement('div');
      tempEl.id = tempId;
      tempEl.className = 'admin-list-item';
      tempEl.style.cssText = 'opacity:0.5;padding:1rem;text-align:center;';
      tempEl.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="margin-right:0.5rem;"></i> Saving new ' + type + '…';
      listEl.appendChild(tempEl);
      tempEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const result = await API.saveContentItem(newItem);

    if (result) {
      AppState.contentItems[result.id] = result;
      // Replace the temp placeholder with the real rendered card
      const tempEl2 = document.getElementById(tempId);
      const cardHTML = Admin.renderContentItemCard(result, type);
      if (tempEl2 && listEl) {
        tempEl2.outerHTML = cardHTML;
      } else if (listEl) {
        listEl.insertAdjacentHTML('beforeend', cardHTML);
      } else {
        // Fallback: full re-render
        await Admin.renderSection(Admin.currentSection);
      }
      showToast('New ' + type + ' added — fill in the details and click Save.', 'success');
    } else {
      // Remove the placeholder and show error
      const tempEl2 = document.getElementById(tempId);
      if (tempEl2) tempEl2.remove();
      showToast('Could not create item — check your connection and try again.', 'error');
    }
  },

  _getEvSetting(key, defaultVal) {
    const s = AppState.settings['ev_' + key];
    return s ? s.setting_value : defaultVal;
  },

  async saveEvChargingSettings() {
    const fieldIds = {
      'ev_eyebrow':  'ev-eyebrow',
      'ev_heading':  'ev-heading',
      'ev_intro':    'ev-intro',
      'ev_image':    'ev-image',
      'ev_body':     'ev-body',
      'ev_spotlight':'ev-spotlight',
    };
    let allOk = true;
    for (const key in fieldIds) {
      const el = document.getElementById(fieldIds[key]);
      if (!el) continue;
      const val = el.value;
      const existing = AppState.settings[key];
      if (existing) {
        const result = await API.saveSetting(existing.id, val);
        if (result) AppState.settings[key].setting_value = val;
        else allOk = false;
      } else {
        try {
          const res = await fetch(SUPABASE_URL + '/rest/v1/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + (AppState.adminAccessToken || SUPABASE_KEY),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ setting_key: key, setting_value: val, label: key, description: '' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]) AppState.settings[key] = data[0];
          } else allOk = false;
        } catch (e) { allOk = false; }
      }
    }
    if (allOk) showToast('EV Charging content saved!', 'success');
    else showToast('Some fields failed to save.', 'error');
  },

  async renderEvChargingEditor() {
    const faqItems = Object.values(AppState.contentItems)
      .filter(i => i.module_id === 'ev_charging')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-car-battery" style="color:var(--orange);margin-right:0.5rem;"></i> EV Charging Module</h2>
        <p>Edit all content shown in the EV Charging presentation slide.</p>
      </div>

      <!-- Text content card -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Page Copy</h3>
          <span class="last-updated">Eyebrow, heading, intro paragraph</span>
        </div>
        <div class="admin-field">
          <label>Eyebrow Label</label>
          <input type="text" class="admin-input" id="ev-eyebrow"
            value="${escHtml(Admin._getEvSetting('eyebrow', 'EV Charging'))}" />
        </div>
        <div class="admin-field">
          <label>Main Heading</label>
          <input type="text" class="admin-input" id="ev-heading"
            value="${escHtml(Admin._getEvSetting('heading', 'Future Proof with EV Charging'))}" />
        </div>
        <div class="admin-field">
          <label>Intro Paragraph</label>
          <textarea class="admin-textarea" id="ev-intro" rows="3">${escHtml(Admin._getEvSetting('intro', 'Adding an EV charger alongside your solar installation is a smart way to make the most of your home energy setup. Even if you do not need one right away, it can help futureproof your property, improve convenience, and put you in a stronger position for EV-friendly energy tariffs.'))}</textarea>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveEvChargingSettings()">
            <i class="fas fa-floppy-disk"></i> Save Page Copy
          </button>
        </div>
      </div>

      <!-- Hero image card -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Hero Image</h3>
          <span class="last-updated">Full-width image shown below the intro</span>
        </div>
        <div class="admin-field">
          <label>Image Path or URL</label>
          <input type="text" class="admin-input" id="ev-image"
            value="${escHtml(Admin._getEvSetting('image', ''))}"
            placeholder="https://... image URL" />
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveEvChargingSettings()">
            <i class="fas fa-floppy-disk"></i> Save Image
          </button>
        </div>
      </div>

      <!-- Body copy card -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Body Copy</h3>
          <span class="last-updated">Left column — separate paragraphs with a blank line</span>
        </div>
        <div class="admin-field">
          <label>Body Paragraphs</label>
          <textarea class="admin-textarea" id="ev-body" rows="10">${escHtml(Admin._getEvSetting('body', 'If you already own an electric vehicle, or think you may in the future, it often makes sense to plan for charging at the same time as your solar installation. Combining the two helps create a more joined-up energy setup at home, making it easier to generate, store and use your electricity more efficiently.\n\nInstalling an EV charger alongside solar can also be more cost-effective than coming back to do it later. Because the work is being considered as part of the same project, it can be a simpler and more streamlined way to upgrade your home in one go.\n\nEven if you do not have an EV today, a home charger can still be a valuable addition. It helps futureproof the property, adds practical appeal, and gives you more flexibility if your circumstances change in the next few years. As electric vehicles become more common, having charging already in place may become an increasingly attractive feature for homeowners and buyers alike.\n\nFor customers looking at the bigger picture, EV charging also opens the door to smarter tariffs and better control over household energy use. When paired with solar, it becomes part of a more efficient, forward-thinking home energy setup rather than just a standalone add-on.'))}</textarea>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveEvChargingSettings()">
            <i class="fas fa-floppy-disk"></i> Save Body Copy
          </button>
        </div>
      </div>

      <!-- Spotlight fact card -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Spotlight Fact</h3>
          <span class="last-updated">Green highlight box at the bottom of the left column</span>
        </div>
        <div class="admin-field">
          <label>Spotlight Text</label>
          <textarea class="admin-textarea" id="ev-spotlight" rows="3">${escHtml(Admin._getEvSetting('spotlight', 'Future-ready homes stand out: adding an EV charger at the same time as solar can be a more cost-effective way to upgrade your property, while also opening up access to more EV-friendly tariff options.'))}</textarea>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveEvChargingSettings()">
            <i class="fas fa-floppy-disk"></i> Save Spotlight
          </button>
        </div>
      </div>

      <!-- FAQ repeater -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>FAQ Accordion</h3>
          <span class="last-updated">Right column — up to 6 items, first one open by default</span>
        </div>
        <div id="admin-ev-faqs-list">
          ${Admin.renderContentItemsList(faqItems, 'faq')}
        </div>
        <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('ev_charging', 'faq')">
          <i class="fas fa-plus"></i> Add New FAQ
        </button>
      </div>`;
  },

  _getMhSetting(key, defaultVal) {
    const s = AppState.settings['mh_' + key];
    return s ? s.setting_value : defaultVal;
  },

  async saveMovingHouseSettings() {
    const fieldIds = {
      'mh_eyebrow':  'mh-eyebrow',
      'mh_heading':  'mh-heading',
      'mh_intro':    'mh-intro',
      'mh_image':    'mh-image',
      'mh_body':     'mh-body',
      'mh_spotlight':'mh-spotlight',
    };
    let allOk = true;
    for (const key in fieldIds) {
      const el = document.getElementById(fieldIds[key]);
      if (!el) continue;
      const val = el.value;
      const existing = AppState.settings[key];
      if (existing) {
        const result = await API.saveSetting(existing.id, val);
        if (result) AppState.settings[key].setting_value = val;
        else allOk = false;
      } else {
        try {
          const res = await fetch(SUPABASE_URL + '/rest/v1/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + (AppState.adminAccessToken || SUPABASE_KEY),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ setting_key: key, setting_value: val, label: key, description: '' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]) AppState.settings[key] = data[0];
          } else allOk = false;
        } catch (e) { allOk = false; }
      }
    }
    if (allOk) showToast('Moving House content saved!', 'success');
    else showToast('Some fields failed to save.', 'error');
  },

  async renderMovingHouseEditor() {
    const faqItems = Object.values(AppState.contentItems)
      .filter(i => i.module_id === 'moving_house')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-house-chimney-crack" style="color:var(--orange);margin-right:0.5rem;"></i> Moving House Module</h2>
        <p>Edit all content shown in the Moving House presentation slide.</p>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Page Copy</h3>
          <span class="last-updated">Eyebrow, heading, intro paragraph</span>
        </div>
        <div class="admin-field">
          <label>Eyebrow Label</label>
          <input type="text" class="admin-input" id="mh-eyebrow"
            value="${escHtml(Admin._getMhSetting('eyebrow', 'Moving House'))}" />
        </div>
        <div class="admin-field">
          <label>Main Heading</label>
          <input type="text" class="admin-input" id="mh-heading"
            value="${escHtml(Admin._getMhSetting('heading', 'Moving House? Solar Still Makes Sense'))}" />
        </div>
        <div class="admin-field">
          <label>Intro Paragraph</label>
          <textarea class="admin-textarea" id="mh-intro" rows="4">${escHtml(Admin._getMhSetting('intro', 'Planning to move in the next few years does not automatically make solar a bad investment. In many cases, it can strengthen your home\'s appeal, improve energy performance, and give future buyers one more reason to choose your property.'))}</textarea>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveMovingHouseSettings()">
            <i class="fas fa-floppy-disk"></i> Save Page Copy
          </button>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Hero Image</h3>
          <span class="last-updated">Full-width image shown below the intro</span>
        </div>
        <div class="admin-field">
          <label>Image Path or URL</label>
          <input type="text" class="admin-input" id="mh-image"
            value="${escHtml(Admin._getMhSetting('image', 'moving-house.jpg'))}"
            placeholder="moving-house.jpg or https://..." />
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveMovingHouseSettings()">
            <i class="fas fa-floppy-disk"></i> Save Image
          </button>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Body Copy</h3>
          <span class="last-updated">Left column — separate paragraphs with a blank line</span>
        </div>
        <div class="admin-field">
          <label>Body Paragraphs</label>
          <textarea class="admin-textarea" id="mh-body" rows="10">${escHtml(Admin._getMhSetting('body', 'If moving house is on your mind, solar should be seen as an asset, not a burden. Buyers are increasingly aware of energy bills, running costs, and overall home efficiency, so having solar already installed can become a real selling point rather than an obstacle.\n\nSolar can also help your home feel more future-ready. A better EPC, lower running costs, and visible renewable technology can all add to buyer confidence.\n\nFrom a practical point of view, documentation does not usually need to become a sticking point either. EPCs stay with the property for up to 10 years unless replaced, and MCS certification is linked to the installation rather than only the original homeowner.'))}</textarea>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveMovingHouseSettings()">
            <i class="fas fa-floppy-disk"></i> Save Body Copy
          </button>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3>Spotlight Fact</h3>
          <span class="last-updated">Green highlight box at the bottom of the left column</span>
        </div>
        <div class="admin-field">
          <label>Spotlight Text</label>
          <textarea class="admin-textarea" id="mh-spotlight" rows="3">${escHtml(Admin._getMhSetting('spotlight', 'Did you know? A home improving from an EPC rating of D to C could see an average value increase of around 3%, while homes moving from F to C showed a much larger average uplift in Rightmove\'s analysis of 300,000 properties.'))}</textarea>
        </div>
        <div class="admin-save-btn-row">
          <button class="btn-primary" onclick="Admin.saveMovingHouseSettings()">
            <i class="fas fa-floppy-disk"></i> Save Spotlight
          </button>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3>FAQ Accordion</h3>
          <span class="last-updated">Right column — up to 6 items, first one open by default</span>
        </div>
        <div id="admin-mh-faqs-list">
          ${Admin.renderContentItemsList(faqItems, 'faq')}
        </div>
        <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('moving_house', 'faq')">
          <i class="fas fa-plus"></i> Add New FAQ
        </button>
      </div>`;
  },

  async renderDecksAdmin() {
    const decks = await API.getDecks();
    const decksHTML = decks.length === 0
      ? '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No saved decks yet.</p></div>'
      : decks.map(d => {
          const date = new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const modules = Array.isArray(d.modules_selected) ? d.modules_selected : [];
          return `
            <div class="admin-list-item">
              <div class="admin-list-item-header">
                <div>
                  <strong>${escHtml(d.deck_name || 'Unnamed Deck')}</strong>
                  <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.2rem;">Created: ${date} &nbsp;|&nbsp; ${modules.length} modules</div>
                </div>
                <div class="admin-list-item-actions">
                  <button class="btn-secondary btn-sm" onclick="Admin.openDeck('${d.id}')"><i class="fas fa-eye"></i> Open</button>
                  <button class="btn-ghost btn-sm" onclick="Admin.copyShareLink('${d.id}', '${escHtml(d.deck_name || '')}')"><i class="fas fa-link"></i> Share</button>
                  <button class="btn-danger btn-sm" onclick="Admin.archiveDeck('${d.id}', this)"><i class="fas fa-archive"></i></button>
                </div>
              </div>
              <div style="font-size:0.8rem;color:var(--text-muted);">
                Modules: ${modules.map(m => { const mod = MODULE_REGISTRY.find(r => r.id === m); return mod ? mod.name : m; }).join(', ')}
              </div>
            </div>`;
        }).join('');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-folder" style="color:var(--orange);margin-right:0.5rem;"></i> Saved Decks</h2>
        <p>All customer decks created by your team. Open a deck to view or share it.</p>
      </div>
      <div class="admin-list">${decksHTML}</div>`;
  },

  openDeck(deckId) { App.loadAndOpenDeck(deckId); },

  copyShareLink(deckId, deckName) {
    const shareUrl = window.location.origin + window.location.pathname + '?deck=' + deckId;
    navigator.clipboard.writeText(shareUrl)
      .then(() => showToast('Share link copied!', 'success'))
      .catch(() => showToast('Link: ' + shareUrl, ''));
  },

  async archiveDeck(deckId, btn) {
    if (!confirm('Permanently delete this deck? This cannot be undone.')) return;
    const result = await API.hardDeleteDeck(deckId);
    if (result) { btn.closest('.admin-list-item').remove(); showToast('Deck deleted.', ''); }
  },

  async renderWelcomeEditor() {
    const s = AppState.settings;
    const field = (key) => {
      const r = s[key]; if (!r) return '';
      return `<div class="admin-field"><label>${escHtml(r.label)}</label><div class="field-desc">${escHtml(r.description)}</div><textarea class="admin-input welcome-setting-input" data-record-id="${r.id}" data-key="${key}" rows="4">${escHtml(r.setting_value)}</textarea></div>`;
    };
    return `
      <div class="admin-section-header"><h2><i class="fas fa-house" style="color:var(--orange);margin-right:0.5rem;"></i> Welcome Page</h2><p>Edit the intro text on the opening slide. In the body, {product} is replaced with the customer's selected product.</p></div>
      <div class="admin-card">
        <div class="admin-card-header"><h3>Welcome text</h3></div>
        ${field('welcome.lead')}
        ${field('welcome.body')}
        <div class="admin-save-btn-row"><button class="btn-primary" id="btn-save-welcome"><i class="fas fa-floppy-disk"></i> Save Welcome Text</button></div>
      </div>`;
  },
  bindWelcomeEditorSave() {
    const btn = document.getElementById('btn-save-welcome');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const inputs = document.querySelectorAll('.welcome-setting-input');
      let ok = true;
      for (const input of inputs) {
        const val = input.value.trim();
        if (!input.dataset.recordId || val === '') continue;
        const res = await API.saveSetting(input.dataset.recordId, val);
        if (res) { if (AppState.settings[input.dataset.key]) AppState.settings[input.dataset.key].setting_value = val; }
        else ok = false;
      }
      showToast(ok ? 'Welcome text saved!' : 'Some text failed to save.', ok ? 'success' : 'error');
    });
  },

  async renderFinanceEditor() {
    const s = AppState.settings;
    const f = (key, attrs='') => { const r = s[key]; if (!r) return ''; const isTA = (r.setting_value||'').length > 60; const inp = isTA
      ? `<textarea class="admin-input fin-set-input" data-record-id="${r.id}" data-key="${key}" rows="3">${escHtml(r.setting_value)}</textarea>`
      : `<input class="admin-input fin-set-input" data-record-id="${r.id}" data-key="${key}" value="${escHtml(r.setting_value)}" ${attrs} />`;
      return `<div class="admin-field"><label>${escHtml(r.label)}</label><div class="field-desc">${escHtml(r.description)}</div>${inp}</div>`; };
    return `
      <div class="admin-section-header"><h2><i class="fas fa-pound-sign" style="color:var(--orange);margin-right:0.5rem;"></i> Finance Calculator</h2><p>These values feed the live calculator. APRs are decimals (0.199 = 19.9%). The payment formulas and the IFC 0% rate are fixed in code and not editable.</p></div>
      <div class="admin-card"><div class="admin-card-header"><h3>Rates & fees</h3></div>
        ${f('finance.bnpl_apr')}${f('finance.ibc_apr')}${f('finance.bnpl_fee')}${f('finance.bnpl_deferral')}
      </div>
      <div class="admin-card"><div class="admin-card-header"><h3>Term options</h3></div>
        ${f('finance.ifc_terms')}${f('finance.ibc_terms')}
      </div>
      <div class="admin-card"><div class="admin-card-header"><h3>Input boundaries</h3></div>
        ${f('finance.min_total')}${f('finance.max_total')}${f('finance.default_total')}${f('finance.default_budget')}
      </div>
      <div class="admin-card"><div class="admin-card-header"><h3>Compliance text</h3></div>
        ${f('finance.disclaimer')}${f('finance.fca_line')}
      </div>
      <div class="admin-save-btn-row"><button class="btn-primary" id="btn-save-finance"><i class="fas fa-floppy-disk"></i> Save Finance Settings</button></div>`;
  },

  bindFinanceEditorSave() {
    const btn = document.getElementById('btn-save-finance');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const val = k => { const el = document.querySelector('.fin-set-input[data-key="'+k+'"]'); return el ? el.value.trim() : null; };
      const errs = [];
      const apr = k => parseFloat(val(k));
      ['finance.bnpl_apr','finance.ibc_apr'].forEach(k => { const v = apr(k); if (isNaN(v) || v < 0 || v > 0.5) errs.push(k+' must be a decimal between 0 and 0.50 (0.199 = 19.9%).'); });
      const fee = parseFloat(val('finance.bnpl_fee')); if (isNaN(fee) || fee < 0) errs.push('BNPL fee must be 0 or more.');
      const defer = parseInt(val('finance.bnpl_deferral'),10); if (isNaN(defer) || defer < 1 || !Number.isInteger(defer)) errs.push('Deferral must be a whole number of months.');
      const termsOk = k => { const parts = (val(k)||'').split(',').map(x=>x.trim()); return parts.length>0 && parts.every(x=>/^\d+$/.test(x)); };
      ['finance.ifc_terms','finance.ibc_terms'].forEach(k => { if (!termsOk(k)) errs.push(k+' must be whole months separated by commas, e.g. 24,36,48,60.'); });
      const mn = parseFloat(val('finance.min_total')), mx = parseFloat(val('finance.max_total'));
      if (isNaN(mn) || isNaN(mx) || mn >= mx) errs.push('Minimum project total must be below the maximum.');
      if (errs.length) { showToast(errs[0], 'error'); return; }
      const inputs = document.querySelectorAll('.fin-set-input');
      let ok = true;
      for (const input of inputs) { const v = input.value.trim(); if (!input.dataset.recordId || v === '') continue; const res = await API.saveSetting(input.dataset.recordId, v); if (res) { if (AppState.settings[input.dataset.key]) AppState.settings[input.dataset.key].setting_value = v; } else ok = false; }
      showToast(ok ? 'Finance settings saved!' : 'Some settings failed to save.', ok ? 'success' : 'error');
    });
  },

  async renderWhyChooseEditor() {
    const items = AppState.getModuleItems('why_choose');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-shield-halved" style="color:var(--orange);margin-right:0.5rem;"></i> Why Choose 3C</h2>
        <p>Edit the USP cards on the "Why choose Three Counties" slide. Each card has a title, a short description, and an icon. Reorder via Sort Order.</p>
      </div>
      <div class="admin-list" id="admin-why_choose-list">
        ${Admin.renderContentItemsList(items, 'hub_item')}
      </div>
      <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('why_choose', 'hub_item')">
        <i class="fas fa-plus"></i> Add New Card
      </button>`;
  },

  async renderHowWeHelpEditor() {
    const items = AppState.getModuleItems('how_we_help');
    return `
      <div class="admin-section-header">
        <h2><i class="fas fa-hands-helping" style="color:var(--orange);margin-right:0.5rem;"></i> How We Help</h2>
        <p>Edit the tagged sentences on the "How We Help" slide. Each sentence has a Product and a Priority tag; the slide shows sentences matching the customer's selection. Reorder via Sort Order.</p>
      </div>
      <div class="admin-list" id="admin-how_we_help-list">
        ${Admin.renderContentItemsList(items, 'how_we_help')}
      </div>
      <button class="admin-add-btn mt-2" onclick="Admin.addNewItem('how_we_help', 'how_we_help')">
        <i class="fas fa-plus"></i> Add New Sentence
      </button>`;
  },
};
