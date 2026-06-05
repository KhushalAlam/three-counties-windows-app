/* ============================================================
   MODULE RENDERERS — all use new CSS class names
   ============================================================ */

const Modules = {

  /* ============================================================
     SAVINGS CALCULATOR
     ============================================================ */
  renderCalculator(inputs, isReadOnly) {
    const vals   = inputs || Calculator.getDefaultInputs();
    const results= Calculator.compute(vals);
    const fmt    = Calculator.format(results);
    const ro     = isReadOnly ? 'readonly' : '';

    return `
<div class="slide" id="slide-calculator">
  <div class="slide-eyebrow"><i class="fas fa-calculator"></i> Live Calculator</div>
  <h1 class="slide-h1"><span class="accent">Live</span> Savings Calculator</h1>
  <p class="slide-lead">Personalised to your home. Adjust the inputs to see your estimated savings in real time.</p>

  <div class="calc-layout">
    <div>
      <!-- Panel 1: Bill -->
      <div class="calc-panel">
        <div class="calc-section-title">
          <div class="step-dot">1</div> Current Electricity Bill
        </div>
        <div class="form-grp">
          <label class="form-lbl">Annual Usage (kWh)</label>
          <div class="input-wrap">
            <input type="number" class="form-inp calc-inp" id="calc-annualUsage"
              value="${vals.annualUsage}" min="500" max="30000" step="100" ${ro}/>
            <span class="inp-sfx">kWh</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-grp">
            <label class="form-lbl">Unit Price</label>
            <div class="input-wrap">
              <input type="number" class="form-inp calc-inp" id="calc-unitPrice"
                value="${vals.unitPrice}" min="1" max="100" step="0.1" ${ro}/>
              <span class="inp-sfx">p/kWh</span>
            </div>
          </div>
          <div class="form-grp">
            <label class="form-lbl">Standing Charge</label>
            <div class="input-wrap">
              <input type="number" class="form-inp calc-inp" id="calc-standingCharge"
                value="${vals.standingCharge}" min="0" max="200" step="0.5" ${ro}/>
              <span class="inp-sfx">p/day</span>
            </div>
          </div>
        </div>
        <div class="bill-display">
          <div>
            <div class="bill-label">CURRENT ANNUAL BILL</div>
            <div class="bill-val" id="calc-current-bill">${fmt.currentBill}</div>
          </div>
          <i class="fas fa-file-invoice" style="font-size:1.3rem;opacity:0.35;"></i>
        </div>
      </div>

      <!-- Panel 2: System -->
      <div class="calc-panel" style="margin-top:0.85rem;">
        <div class="calc-section-title">
          <div class="step-dot">2</div> System Configuration
        </div>
        <div class="slider-grp">
          <div class="slider-head">
            <span class="slider-lbl">Solar Array Size</span>
            <span class="slider-val" id="calc-arraySize-val">${parseFloat(vals.arraySize).toFixed(1)} kWp</span>
          </div>
          <input type="range" id="calc-arraySize" min="1.5" max="14" step="0.1" value="${vals.arraySize}" class="calc-input" ${ro}/>
          <div class="slider-hints"><span>Small (1.5kW)</span><span>Large (14kW)</span></div>
        </div>
        <div class="slider-grp">
          <div class="slider-head">
            <span class="slider-lbl">Battery Storage</span>
            <span class="slider-val" id="calc-battery-val">${parseFloat(vals.battery).toFixed(1)} kWh</span>
          </div>
          <input type="range" id="calc-battery" min="0" max="20" step="0.5" value="${vals.battery}" class="calc-input" ${ro}/>
          <div class="slider-hints"><span>None</span><span>20 kWh</span></div>
        </div>
        <hr class="divider"/>
        <div class="form-row">
          <div class="form-grp">
            <label class="form-lbl">Export Tariff</label>
            <div class="input-wrap">
              <input type="number" class="form-inp calc-inp" id="calc-exportTariff"
                value="${vals.exportTariff}" min="0" max="50" step="0.5" ${ro}/>
              <span class="inp-sfx">p/kWh</span>
            </div>
          </div>
          <div class="form-grp">
            <label class="form-lbl">System Cost</label>
            <div class="input-wrap">
              <input type="number" class="form-inp calc-inp" id="calc-systemCost"
                value="${vals.systemCost}" min="1000" max="100000" step="100" ${ro}/>
              <span class="inp-sfx">£</span>
            </div>
          </div>
        </div>
        ${!isReadOnly ? `<div style="margin-top:0.5rem;">
          <button class="btn-ghost btn-sm" id="calc-reset-btn">
            <i class="fas fa-rotate-left"></i> Reset to defaults
          </button>
        </div>` : ''}
      </div>
    </div>

    <!-- Results -->
    <div class="results-panel">
      <div class="results-hero">
        <div class="rh-label">TOTAL ANNUAL SAVINGS</div>
        <div class="rh-val" id="res-total-saving">${fmt.totalAnnualSaving}</div>
        <div class="rh-sub">Based on your inputs and system configuration</div>
      </div>
      <div class="results-grid">
        <div class="res-card">
          <div class="res-lbl">Payback Period</div>
          <div class="res-val green" id="res-payback">${results.paybackYears !== null ? results.paybackYears + ' yrs' : 'N/A'}</div>
          <div class="res-sub">${results.paybackYears !== null ? 'Years' : 'Enter system cost'}</div>
        </div>
        <div class="res-card">
          <div class="res-lbl">Monthly Avg. Save</div>
          <div class="res-val orange" id="res-monthly">${fmt.monthlyAvgSaving}</div>
          <div class="res-sub">Per month on average</div>
        </div>
        <div class="res-card">
          <div class="res-lbl">Solar Generation</div>
          <div class="res-val" id="res-generation" style="font-size:1.15rem;">${fmt.generation}</div>
          <div class="res-sub">Estimated annual output</div>
        </div>
        <div class="res-card">
          <div class="res-lbl">Self-Use Rate</div>
          <div class="res-val" id="res-selfuse" style="font-size:1.35rem;">${fmt.selfUsePct}</div>
          <div class="res-sub">With ${results.battery} kWh battery</div>
        </div>
      </div>
      <!-- Projection controls -->
      <div class="form-row" style="margin-bottom:0.75rem;">
        <div class="form-grp">
          <label class="form-lbl">Projection Term</label>
          <div class="input-wrap">
            <select class="form-inp calc-inp" id="calc-proj-term" style="cursor:pointer;">
              <option value="10">10 years</option>
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="25" selected>25 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
        </div>
        <div class="form-grp">
          <label class="form-lbl">Inflation Rate</label>
          <div class="input-wrap">
            <input type="number" class="form-inp calc-inp" id="calc-inflation-rate"
              value="3.0" min="0" max="10" step="0.5" />
            <span class="inp-sfx">%</span>
          </div>
        </div>
      </div>

      <div class="results-long">
        <div class="long-card orange-bg">
          <div class="long-lbl" id="res-term-label"><i class="fas fa-chart-line"></i> 25 YEAR SAVINGS</div>
          <div class="long-val" id="res-25yr">${fmt.savings25yr}</div>
          <div class="long-note" id="res-inflation-note">Inflation adjusted @ ${(AppState.getSetting('savingsEscalationRate',0.03)*100).toFixed(0)}%</div>
        </div>
        <div class="long-card green-bg">
          <div class="long-lbl"><i class="fas fa-leaf"></i> CO₂ AVOIDED</div>
          <div class="long-val" id="res-co2">${fmt.co2Avoided}</div>
          <div class="long-note">Per year approx.</div>
        </div>
      </div>
      <div class="calc-disclaimer">
        <i class="fas fa-circle-info"></i>
        <span>Savings shown are estimates based on inputs provided and typical performance assumptions.
        Actual savings will vary depending on roof orientation, shading, weather, system design, and
        electricity tariffs. Final figures will be confirmed following a full design and site survey.</span>
      </div>
    </div>
  </div>
</div>`;
  },

  /* ============================================================
     HOW SOLAR WORKS
     ============================================================ */
  async renderHowSolarWorks() {
    const steps = AppState.getModuleItems('how_solar_works');
    const icons = ['fa-solar-panel','fa-battery-three-quarters','fa-house-chimney'];

    const stepsHTML = steps.length ? steps.map((s, i) => {
      const isLast = i === steps.length - 1;
      return `
        <div class="solar-step" style="position:relative;">
          <div class="step-num-badge">${i + 1}</div>
          <div class="step-icon-ring"><i class="fas ${icons[i] || 'fa-sun'}"></i></div>
          <h3>${escHtml(s.title)}</h3>
          <p>${escHtml(s.body)}</p>
          <div class="key-benefit">
            <i class="fas fa-circle-check"></i>
            <span><strong>Key Benefit:</strong> ${escHtml(s.meta2 || '')}</span>
          </div>
          ${!isLast ? '<div class="step-chevron"><i class="fas fa-chevron-right"></i></div>' : ''}
        </div>`;
    }).join('') : '<p style="color:var(--text-soft);">No steps configured. Add them in Admin.</p>';

    return `
<div class="slide" id="slide-how-solar-works">
  <div class="slide-eyebrow green"><i class="fas fa-gear"></i> Simple 3-Step Process</div>
  <h1 class="slide-h1">From <span class="accent">Sunlight</span> to Savings</h1>
  <p class="slide-lead">Your home becomes a mini power station. Clean, simple, and automatic.</p>
  <div style='display:flex;justify-content:center;margin-bottom:1.75rem;'><div style='background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.5rem;box-shadow:var(--shadow-sm);max-width:580px;width:100%;text-align:center;'><img src='schematic-animated-new.gif' alt='How Solar Works' style='width:100%;max-width:500px;' /></div></div>
  <div class="solar-steps">${stepsHTML}</div>
  <div class="dyk-bar">
    <div class="dyk-dot"><i class="fas fa-lightbulb"></i></div>
    <div class="dyk-text">
      <strong>Did you know?</strong>
      With a smart tariff (like Octopus Flux), you can buy cheap energy at night to fill your battery and sell at peak times — stacking on top of your solar savings.
    </div>
    <button class="btn-secondary btn-sm" onclick="App.jumpToModule('tariffs')">
      See Tariffs <i class="fas fa-arrow-right"></i>
    </button>
  </div>
</div>`;
  },

  /* ============================================================
     INSTALLATION JOURNEY
     ============================================================ */
  async renderInstallationJourney() {
    const steps = AppState.getModuleItems('installation_journey');
    const iconMap = {
      'phone':'fa-phone','drafting-compass':'fa-drafting-compass',
      'clipboard-check':'fa-clipboard-check','tools':'fa-screwdriver-wrench',
      'check-double':'fa-check-double','heart':'fa-heart'
    };
    const stepsHTML = steps.map((s, i) => `
      <div class="journey-card">
        <div class="j-num">${i + 1}</div>
        <div class="j-icon"><i class="fas ${iconMap[s.meta2] || 'fa-circle'}"></i></div>
        <h3>${escHtml(s.title)}</h3>
        <div class="j-timing">${escHtml(s.meta1 || '')}</div>
        <p>${escHtml(s.body)}</p>
      </div>`).join('');

    return `
<div class="slide" id="slide-installation-journey">
  <div class="slide-eyebrow"><i class="fas fa-calendar-check"></i> Installation Journey</div>
  <h1 class="slide-h1">What to <span class="accent">Expect</span></h1>
  <p class="slide-lead">From our first chat to a lifetime of savings. We handle the paperwork, scaffolding, and setup.</p>
  <img src="timeline.jpg" alt="Installation Timeline" style="width:100%;border-radius:var(--r-md);margin-bottom:1.75rem;box-shadow:var(--shadow-md);" />
  <div class="journey-grid">${stepsHTML}</div>
  <div class="journey-note">
    <i class="fas fa-calendar-alt" style="font-size:1.8rem;opacity:0.65;flex-shrink:0;"></i>
    <p><strong>Typical timeline: 3–4 weeks from first call to commissioned system.</strong><br/>
    We handle DNO notification, MCS certification, and all grid export paperwork — so you simply enjoy the savings.</p>
  </div>
</div>`;
  },

  /* ============================================================
     TARIFFS
     ============================================================ */
  async renderTariffs() {
    const tariffs = AppState.getModuleItems('tariffs');

    const rows = tariffs.map(t => {
      const isFlux = (t.title||'').toLowerCase().includes('flux');
      return `
        <tr ${isFlux ? 'class="highlight"' : ''}>
          <td>
            <div class="tariff-name">${escHtml(t.title)}</div>
            <div style="display:flex;gap:0.3rem;margin-top:0.2rem;">
              <span class="t-tag">${isFlux ? 'Solar + Battery' : 'Solar'}</span>
              ${isFlux ? '<span class="t-tag">Smart Tariff</span>' : ''}
            </div>
          </td>
          <td>${parseFloat(t.meta1||0).toFixed(1)}p</td>
          <td class="rate-hi">${parseFloat(t.meta2||0).toFixed(1)}p</td>
          <td>${parseFloat(t.meta3||0).toFixed(1)}p</td>
        </tr>`;
    }).join('');

    return `
<div class="slide" id="slide-tariffs">
  <div class="slide-eyebrow"><i class="fas fa-bolt"></i> Tariff Comparison</div>
  <h1 class="slide-h1">Why <span class="accent">Tariffs</span> Matter</h1>
  <p class="slide-lead">The right energy tariff can add hundreds of pounds per year on top of your solar savings.</p>
  <div class="tariff-layout">
    <div class="tariff-card">
      <h3><i class="fas fa-chess" style="color:var(--orange);margin-right:0.4rem;"></i> Smart Battery Strategy</h3>
      <div class="strategy-list">
        <div class="s-step">
          <div class="s-icon blue"><i class="fas fa-moon"></i></div>
          <div class="s-text"><h4>1. Charge overnight cheaply</h4><p>Buy electricity at night rates (e.g. 7p/kWh) to fill your battery.</p></div>
        </div>
        <div class="s-step">
          <div class="s-icon yellow"><i class="fas fa-sun"></i></div>
          <div class="s-text"><h4>2. Use solar during the day</h4><p>Your panels generate free electricity through daylight hours.</p></div>
        </div>
        <div class="s-step">
          <div class="s-icon green"><i class="fas fa-arrow-up"></i></div>
          <div class="s-text"><h4>3. Export at peak rates</h4><p>Sell stored energy back to the grid at morning &amp; evening peak prices.</p></div>
        </div>
      </div>
      <div class="tariff-boost">
        <strong><i class="fas fa-coins" style="color:var(--orange);margin-right:0.35rem;"></i> Boost your savings:</strong>
        Smart tariffs like Octopus Flux can add an estimated <strong>£200–£400/year</strong> on top of standard solar savings.
      </div>
      <div class="tariff-links">
        <a href="https://octopus.energy/tariffs/" target="_blank" rel="noopener" class="t-link">
          <i class="fas fa-external-link-alt"></i> Check Live Octopus Tariffs
        </a>
        <a href="https://octopus.energy/smart/flux/" target="_blank" rel="noopener" class="t-link outline">
          <i class="fas fa-bolt"></i> Octopus Flux
        </a>
      </div>
    </div>
    <div class="tariff-card">
      <h3><i class="fas fa-table" style="color:var(--green);margin-right:0.4rem;"></i> Example Tariff Comparison</h3>
      <p style="font-size:0.76rem;color:var(--text-soft);margin-bottom:0.85rem;">
        <i class="fas fa-circle-info"></i> Indicative rates — check live rates before switching.
      </p>
      <table class="tariff-tbl">
        <thead>
          <tr><th>Tariff</th><th>Day Rate</th><th>Night Rate</th><th>Export</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:1rem;background:var(--green-light);border-radius:var(--r-sm);padding:0.8rem;font-size:0.8rem;color:var(--green);">
        <strong><i class="fas fa-circle-check"></i> SEG (Smart Export Guarantee):</strong>
        All solar customers are entitled to export payments. We handle the application for you.
      </div>
    </div>
  </div>
</div>`;
  },

  /* ============================================================
     FAQS
     ============================================================ */
  async renderFAQs() {
    const faqs  = AppState.getModuleItems('faqs');
    const icons = ['fa-house','fa-cloud-sun','fa-house-chimney','fa-wrench','fa-hard-hat','fa-bolt','fa-certificate'];

    const leftCol  = faqs.filter((_, i) => i % 2 === 0);
    const rightCol = faqs.filter((_, i) => i % 2 !== 0);

    const renderCard = (f, i) => {
      let bodyContent = escHtml(f.body);
      if (f.title && f.title.toLowerCase().includes('properly certified')) {
        bodyContent += `<div style='display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;align-items:center;'>
          <img src='MCS-LOGO.png' alt='MCS Certified' style='height:40px;object-fit:contain;background:#1a5c38;padding:6px;border-radius:6px;'>
          <img src='RECC-LOGO.png' alt='RECC Member' style='height:40px;object-fit:contain;background:white;padding:4px;border-radius:6px;'>
          <img src='TrustMark-Logo.png' alt='TrustMark' style='height:40px;object-fit:contain;background:#1a5c38;padding:6px;border-radius:6px;'>
        </div>`;
      }
      return `
      <div class="faq-card" data-faq-index="${i}" onclick="faqToggle(this, ${i})">
        <div class="faq-q">
          <div class="faq-q-left">
            <div class="faq-icon-box"><i class="fas ${icons[i % icons.length]}"></i></div>
            <div class="faq-q-text">${escHtml(f.title)}</div>
          </div>
          <i class="fas fa-chevron-down faq-chevron"></i>
        </div>
        <div class="faq-answer">${bodyContent}</div>
      </div>`;
    };

    const leftHTML  = leftCol.map((f, i) => renderCard(f, i * 2)).join('');
    const rightHTML = rightCol.map((f, i) => renderCard(f, i * 2 + 1)).join('');

    return `
<div class="slide" id="slide-faqs">
  <div class="slide-eyebrow green"><i class="fas fa-circle-question"></i> Common Questions</div>
  <h1 class="slide-h1">Got <span class="accent">Questions?</span></h1>
  <p class="slide-lead">Here are the things we hear most often. Click any question to reveal the answer.</p>
  <div class="faqs-grid" id="faqs-grid">
    <div class="faq-col">${leftHTML}</div>
    <div class="faq-col">${rightHTML}</div>
  </div>
</div>`;
  },

  /* ============================================================
     WHY CHOOSE US
     ============================================================ */
  async renderWhyChooseUs() {
    return `
<div class="slide" id="slide-why-choose-us">
  <div class="slide-eyebrow green"><i class="fas fa-shield-halved"></i> Why Choose Us</div>
  <h1 class="slide-h1">Why <span class="accent">Three Counties Solar?</span></h1>
  <p class="slide-lead">We've spent years building our reputation as trusted local installers across Surrey, Berkshire, and Hampshire.</p>
  <div class="why-layout">
    <div>
      <img src="solar-house.jpg"
        alt="Three Counties Solar" style="border-radius:var(--r-md);width:100%;margin-bottom:1.25rem;box-shadow:var(--shadow-md);" />
      <p style="font-size:0.87rem;color:var(--text-soft);line-height:1.7;margin-bottom:0.85rem;">
        Here at Three Counties Solar, we've worked for many years to build our reputation across our local area as trusted local installers.
        We're committed to providing nothing but quality service that our customers can rely on.
      </p>
      <p style="font-size:0.87rem;color:var(--text-soft);line-height:1.7;">
        As solar specialists, we've helped many residential and commercial clients across Surrey, Berkshire, and Hampshire.
        We'll help you make an informed choice on the right system for your home.
      </p>
      <div class="service-strip">
        <strong><i class="fas fa-map-marker-alt"></i> Service Area:</strong>
        Based in Camberley — installing solar panels, EV charging, home battery storage, and solar repairs across <strong>Surrey, Berkshire &amp; Hampshire</strong>.
      </div>
    </div>
    <div>
      <div class="usp-list">
        <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-certificate"></i></div><div><h4>MCS Certified Installers</h4><p>The industry benchmark for quality solar installation.</p></div></div>
        <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-user-shield"></i></div><div><h4>RECC Member</h4><p>Independent consumer protection for your peace of mind.</p></div></div>
        <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-plug"></i></div><div><h4>NIC EIC Approved</h4><p>Giving you added confidence in safe, compliant electrical installation standards.</p></div></div>
        <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-map-pin"></i></div><div><h4>Genuinely Local</h4><p>Based in Camberley. Quick response times, personal service.</p></div></div>
        <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-clock-rotate-left"></i></div><div><h4>Years of Experience</h4><p>Many years installing solar, batteries, and EV charge points.</p></div></div>
        <div class="usp-row"><div class="usp-icon-box"><i class="fas fa-heart"></i></div><div><h4>Lifetime Support</h4><p>We don't disappear after installation. Ongoing aftercare always.</p></div></div>
      </div>
      <div class="accred-box">
        <h4>Accreditations &amp; Memberships</h4>
        <div class="accred-chips">
          <img src='MCS-LOGO.png' alt='MCS Certified' style='height:45px;object-fit:contain;background:#1a5c38;padding:6px;border-radius:6px;'>
          <img src='RECC-LOGO.png' alt='RECC Member' style='height:45px;object-fit:contain;background:white;padding:4px;border-radius:6px;'>
          <img src='NIC-EIC-.png' alt='NIC EIC Approved' style='height:45px;object-fit:contain;background:#1a5c38;padding:6px;border-radius:6px;'>
        </div>
      </div>
    </div>
  </div>
</div>`;
  },

  /* ============================================================
     REVIEWS
     ============================================================ */
  async renderReviews() {
    const reviews = AppState.getModuleItems('reviews');
    const stars = n => '★'.repeat(parseInt(n)||5) + '☆'.repeat(5-(parseInt(n)||5));

    const html = reviews.map(r => `
      <div class="rev-card">
        <div class="rev-stars">${stars(r.meta2)}</div>
        <div class="rev-title">${escHtml(r.title)}</div>
        <div class="rev-body">"${escHtml(r.body)}"</div>
        <div class="rev-footer">
          <div>
            <div class="rev-name">${escHtml(r.meta1)}</div>
            <div class="rev-loc">${escHtml(r.meta3||'')}</div>
          </div>
        </div>
      </div>`).join('');

    return `
<div class="slide" id="slide-reviews">
  <div class="slide-eyebrow">Customer Reviews <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
  <h1 class="slide-h1">What Our <span class="accent">Customers Say</span></h1>
  <p class="slide-lead">Real customers, real savings, real experiences.</p>
  <div class="reviews-grid">${html}</div>
</div>`;
  },

  /* ============================================================
     VIDEOS
     ============================================================ */
  async renderVideos() {
    const active = AppState.getModuleItems('videos').filter(v => v.is_active && v.meta2);

    if (!active.length) {
      return `
<div class="slide" id="slide-videos">
  <div class="slide-eyebrow green"><i class="fas fa-play-circle"></i> Videos</div>
  <h1 class="slide-h1">See Solar <span class="accent">In Action</span></h1>
  <p class="slide-lead">Watch real customer testimonials and installation walkthroughs.</p>
  <div class="placeholder-center">
    <div class="ph-icon green"><i class="fas fa-play-circle"></i></div>
    <h2>Videos Coming Soon</h2>
    <p>Add YouTube or Vimeo URLs in the Admin panel to display testimonials and explainers here.</p>
  </div>
</div>`;
    }

    const html = active.map(v => {
      const url = Modules._embedUrl(v.meta2);
      return `
        <div style="margin-bottom:1.5rem;">
          <h3 style="margin-bottom:0.75rem;">${escHtml(v.title)}</h3>
          <div style="position:relative;padding-bottom:56.25%;border-radius:12px;overflow:hidden;box-shadow:var(--shadow-md);">
            <iframe src="${url}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;"></iframe>
          </div>
        </div>`;
    }).join('');

    return `
<div class="slide" id="slide-videos">
  <div class="slide-eyebrow green"><i class="fas fa-play-circle"></i> Videos</div>
  <h1 class="slide-h1">See Solar <span class="accent">In Action</span></h1>
  <p class="slide-lead">Watch real customer testimonials and installation walkthroughs.</p>
  <div style="max-width:760px;">${html}</div>
</div>`;
  },

  _embedUrl(url) {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    return url;
  },

  /* ============================================================
     NEXT STEPS
     ============================================================ */
  renderNextSteps(inputs) {
    const vals    = inputs || Calculator.getDefaultInputs();
    const results = Calculator.compute(vals);
    const fmt     = Calculator.format(results);

    return `
<div class="slide" id="slide-next-steps">
  <div class="slide-eyebrow"><i class="fas fa-rocket"></i> Closing the Consultation</div>
  <h1 class="slide-h1">What's <span class="accent">Next</span></h1>

  <div class="next-steps-grid">
    <!-- Projection -->
    <div>
      <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-soft);margin-bottom:0.65rem;">
        <i class="fas fa-chart-line" style="color:var(--green);"></i> YOUR PROJECTION
      </p>
      <div class="ns-projection">
        <div class="ns-proj-lbl">ESTIMATED 1ST YEAR SAVINGS</div>
        <div class="ns-proj-val" id="ns-saving">${fmt.totalAnnualSaving}</div>
        <div class="ns-proj-note">*Based on proposed system &amp; usage</div>
        <div class="ns-proj-stats">
          <div><div class="ns-stat-val" id="ns-payback">${results.paybackYears || 'N/A'}</div><div class="ns-stat-lbl">Years Payback</div></div>
          <div><div class="ns-stat-val" id="ns-25yr">${fmt.savings25yr}</div><div class="ns-stat-lbl">25yr Savings</div></div>
        </div>
      </div>
      <div class="ns-size-bar">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <i class="fas fa-solar-panel" style="color:var(--orange);"></i>
          <span style="font-size:0.8rem;font-weight:600;color:var(--text-soft);">System Size · Proposed Capacity</span>
        </div>
        <span class="ns-size-val" id="ns-size">${vals.arraySize} kWp</span>
      </div>
    </div>

    <!-- Next Steps -->
    <div>
      <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-soft);margin-bottom:0.65rem;">
        Next Steps
      </p>
      <div class="ns-panel">
        <div class="now-section">
          <div class="now-item"><i class="fas fa-check-circle"></i><div><strong>Survey solar panel options</strong></div></div>
          <div class="now-item"><i class="fas fa-check-circle"></i><div><strong>Build quote</strong></div></div>
          <div class="now-item"><i class="fas fa-check-circle"></i><div><strong>Provide timelines</strong></div></div>
        </div>
      </div>
    </div>

    <!-- Start Proposal -->
    <div>
      <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-soft);margin-bottom:0.65rem;">
        <i class="fas fa-arrow-right" style="color:var(--green);"></i> NEXT STEPS
      </p>
      <div class="slot-panel">
        <div class="slot-icon"><i class="fas fa-file-signature"></i></div>
        <h3>Ready to build the proposal?</h3>
        <p>Open OpenSolar to survey options, build the quote and provide timelines.</p>
        <a href="https://app.opensolar.com/login" target="_blank" rel="noopener" class="btn-book">Start Proposal →</a>
        <div class="slot-contact">
          <div style="font-size:0.68rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.4rem;">Have more questions?</div>
          <a href="tel:01344777515" class="slot-phone"><i class="fas fa-phone" style="color:var(--orange);margin-right:0.3rem;"></i> 01344 777515</a>
          <div class="slot-web">www.threecountiessolar.com</div>
        </div>
      </div>
      <div class="cert-chips" style='display:flex;gap:0.65rem;flex-wrap:wrap;margin-top:0.75rem;justify-content:center;align-items:center;'>
        <img src='MCS-LOGO.png' alt='MCS Certified' style='height:40px;object-fit:contain;background:#1a5c38;padding:6px;border-radius:6px;'>
        <img src='RECC-LOGO.png' alt='RECC Member' style='height:40px;object-fit:contain;background:white;padding:4px;border-radius:6px;'>
        <img src='NIC-EIC-.png' alt='NIC EIC Approved' style='height:40px;object-fit:contain;background:#1a5c38;padding:6px;border-radius:6px;'>
      </div>
    </div>
  </div>
</div>`;
  },

  /* ============================================================
     EV CHARGING
     ============================================================ */
  renderEvCharging() {
    const gs = (key, fallback) => {
      const s = AppState.settings['ev_' + key];
      return (s && s.setting_value) ? s.setting_value : fallback;
    };

    const eyebrow  = gs('eyebrow',  'EV Charging');
    const heading  = gs('heading',  'Future Proof with EV Charging');
    const intro    = gs('intro',    'Adding an EV charger alongside your solar installation is a smart way to make the most of your home energy setup. Even if you do not need one right away, it can help futureproof your property, improve convenience, and put you in a stronger position for EV-friendly energy tariffs.');
    const heroImg  = gs('image',    'ev-charging.jpg');
    const spotlight = gs('spotlight', 'Future-ready homes stand out: adding an EV charger at the same time as solar can be a more cost-effective way to upgrade your property, while also opening up access to more EV-friendly tariff options.');

    const rawBody = gs('body',
      'If you already own an electric vehicle, or think you may in the future, it often makes sense to plan for EV charging at the same time as your solar installation. Combining the two creates a more joined-up home energy setup — easier to generate, store and use your own electricity.\n\nInstalling a charger alongside solar is also more cost-effective than returning to do it separately. Even if you don\'t have an EV yet, adding a charger now helps futureproof your home, adds practical appeal, and keeps your options open as electric vehicles become more common.\n\nWhen paired with solar, EV charging opens the door to smarter tariffs, better energy control, and a more efficient home setup — rather than just a standalone add-on.'
    );
    const bodyHTML = rawBody.split(/\n\n+/).map(p =>
      `<p style="font-size:0.87rem;color:var(--text-soft);line-height:1.75;margin-bottom:1rem;">${escHtml(p.trim())}</p>`
    ).join('');

    const storedFaqs = AppState.getModuleItems('ev_charging');
    const faqs = storedFaqs.length > 0 ? storedFaqs : [
      { title: 'Can I add an EV charger as part of my solar installation?',  body: 'Yes. If it is done at the same time, it can usually be added as part of the wider project, making the whole installation more efficient and often more cost-effective than coming back to do it later.' },
      { title: 'Do you install EV chargers yourselves?',                      body: 'Yes, EV chargers are part of the service and can be included alongside your solar installation as a natural extension of the overall home energy setup.' },
      { title: 'What EV charger brand do you use?',                          body: 'We use Fox ESS chargers as part of our EV charging offering.' },
      { title: 'I do not have an EV yet. Is it still worth considering?',    body: 'Yes. Even without an immediate need, installing an EV charger can help futureproof your home, add practical value, and prepare the property for changing lifestyles, future vehicle choices, and more flexible energy use.' }
    ];

    const faqIcons = ['fa-car-battery', 'fa-plug', 'fa-certificate', 'fa-bolt'];
    const faqHTML = faqs.map((f, i) => `
      <div class="faq-card${i === 0 ? ' open' : ''}" data-ev-faq-index="${i}" onclick="evFaqToggle(this, ${i})">
        <div class="faq-q">
          <div class="faq-q-left">
            <div class="faq-icon-box"><i class="fas ${faqIcons[i % faqIcons.length]}"></i></div>
            <div class="faq-q-text">${escHtml(f.title)}</div>
          </div>
          <i class="fas fa-chevron-down faq-chevron"></i>
        </div>
        <div class="faq-answer">${escHtml(f.body)}</div>
      </div>`).join('');

    const heroHTML = heroImg ? `
  <div style="width:100%;margin-bottom:1.75rem;">
    <img src="${escHtml(heroImg)}" alt="EV charger being plugged into a car"
      style="width:100%;height:320px;object-fit:cover;display:block;border-radius:var(--r-md);box-shadow:var(--shadow-md);" />
  </div>` : '';

    return `
<div class="slide" id="slide-ev-charging">
  <div class="slide-eyebrow"><i class="fas fa-car-battery"></i> ${escHtml(eyebrow)}</div>
  <h1 class="slide-h1"><span class="accent">Future Proof</span> with EV Charging</h1>
  <p class="slide-lead">${escHtml(intro)}</p>

  ${heroHTML}

  <div class="ev-body-layout">
    <div class="ev-body-left">
      ${bodyHTML}
      <div class="ev-spotlight">
        <p>${escHtml(spotlight)}</p>
      </div>
    </div>
    <div class="ev-faq-col" id="ev-faqs-grid">
      ${faqHTML}
    </div>
  </div>
</div>`;
  },

  /* ============================================================
     MOVING HOUSE
     ============================================================ */
  renderMovingHouse() {
    const gs = (key, fallback) => {
      const s = AppState.settings['mh_' + key];
      return (s && s.setting_value) ? s.setting_value : fallback;
    };

    const eyebrow   = gs('eyebrow',   'Moving House');
    const heading   = gs('heading',   'Moving House? Solar Still Makes Sense');
    const intro     = gs('intro',     'Planning to move in the next few years does not automatically make solar a bad investment. In many cases, it can strengthen your home\'s appeal, improve energy performance, and give future buyers one more reason to choose your property. Energy Performance Certificates are a legal part of the sales process in England and Wales, and stronger energy efficiency credentials can help a home stand out. Rightmove\'s research has also found a measurable green premium for homes that improve their EPC rating.');
    const heroImg   = gs('image',     'moving-house.jpg');
    const spotlight = gs('spotlight',  'Did you know? A home improving from an EPC rating of D to C could see an average value increase of around 3%, while homes moving from F to C showed a much larger average uplift in Rightmove\'s analysis of 300,000 properties.');

    const rawBody = gs('body',
      'If moving house is on your mind, solar should be seen as an asset, not a burden. Buyers are increasingly aware of energy bills, running costs, and overall home efficiency, so having solar already installed can become a real selling point rather than an obstacle. Rightmove reports that homes improving from an EPC rating of D to C could see an average value uplift of 3%, with bigger gains possible where the improvement is more significant.\n\nSolar can also help your home feel more future-ready. A better EPC, lower running costs, and visible renewable technology can all add to buyer confidence. Rightmove\'s more recent reporting also shows that energy efficiency has a growing influence on moving decisions, with many home-movers and renters willing to pay more for efficient homes.\n\nFrom a practical point of view, documentation does not usually need to become a sticking point either. EPCs stay with the property for up to 10 years unless replaced, and MCS certification is linked to the installation rather than only the original homeowner, so records can still support the sale process for the next owner.'
    );
    const bodyHTML = rawBody.split(/\n\n+/).map((p, idx) => {
      const paragraph = `<p style="font-size:0.87rem;color:var(--text-soft);line-height:1.75;margin-bottom:1rem;">${escHtml(p.trim())}</p>`;
      if (idx === 2 && p.includes('MCS certification')) {
        return paragraph + `<div style='margin:1rem 0;'><img src='MCS-LOGO.png' alt='MCS Certified' style='height:60px;object-fit:contain;background:#1a5c38;padding:8px;border-radius:6px;' /></div>`;
      }
      return paragraph;
    }).join('');

    const storedFaqs = AppState.getModuleItems('moving_house');
    const faqs = storedFaqs.length > 0 ? storedFaqs : [
      { title: 'I might move in a few years. Is solar still worth it?',
        body:  'Yes, it often is. Solar can reduce your energy bills while you are living in the property, and it may also improve buyer appeal when it comes time to sell. Homes with stronger EPC performance and visible energy-saving features are increasingly attractive to buyers.' },
      { title: 'Does solar add value to a property?',
        body:  'It can. The amount varies by property, location, and EPC improvement, but Rightmove found that homes improving from a D to C EPC rating could see an average uplift of 3%, with larger gains where efficiency improvements are greater.' },
      { title: 'Will solar help my home sell faster?',
        body:  'There is no guaranteed rule for speed of sale, but solar can make a property more appealing because buyers are paying closer attention to energy efficiency, future bills, and green upgrades. That can help your home stand out more clearly against similar properties.' },
      { title: 'Can the warranties and paperwork transfer to the new owner?',
        body:  'In most cases, the key documentation can continue to support the new owner, but the exact transfer process depends on the product warranty terms. MCS certification is recorded against the installation, and details can be updated where needed.' },
      { title: 'Does solar improve my EPC rating?',
        body:  'It can contribute to a better EPC rating, depending on the property and its overall energy performance. Because EPCs are part of the selling process, an improved rating can become a useful point in your favour when marketing the home.' },
      { title: 'What is the main message if I am worried solar will tie me to the property?',
        body:  'The key message is that solar is usually an upgrade to the home, not a reason to delay moving. You benefit from lower running costs while you live there, and the next buyer may see added value in the energy savings, EPC performance, and future-ready setup.' }
    ];

    const faqIcons = ['fa-house-chimney-crack', 'fa-sterling-sign', 'fa-clock', 'fa-file-contract', 'fa-leaf', 'fa-lightbulb'];
    const faqHTML = faqs.map((f, i) => `
      <div class="faq-card${i === 0 ? ' open' : ''}" onclick="mhFaqToggle(this, ${i})">
        <div class="faq-q">
          <div class="faq-q-left">
            <div class="faq-icon-box"><i class="fas ${faqIcons[i % faqIcons.length]}"></i></div>
            <div class="faq-q-text">${escHtml(f.title)}</div>
          </div>
          <i class="fas fa-chevron-down faq-chevron"></i>
        </div>
        <div class="faq-answer">${escHtml(f.body)}</div>
      </div>`).join('');

    const heroHTML = heroImg ? `
  <div style="width:100%;margin:1.25rem 0 1.75rem;">
    <img src="${escHtml(heroImg)}" alt="House with solar panels"
      style="width:100%;height:320px;object-fit:cover;display:block;border-radius:var(--r-md);box-shadow:var(--shadow-md);" />
  </div>` : '';

    return `
<div class="slide" id="slide-moving-house">
  <div class="mh-layout">

    <!-- LEFT COLUMN -->
    <div class="mh-left">
      <div class="slide-eyebrow"><i class="fas fa-house-chimney-crack"></i> ${escHtml(eyebrow)}</div>
      <h1 class="slide-h1">Moving House? <span class="accent">Solar Still Makes Sense</span></h1>
      <p class="slide-lead">${escHtml(intro)}</p>
      ${heroHTML}
      ${bodyHTML}
      <div class="ev-spotlight">
        <p>${escHtml(spotlight)}</p>
      </div>
    </div>

    <!-- RIGHT COLUMN -->
    <div class="mh-faq-col">
      ${faqHTML}
      <div style="margin-top:1.25rem;">
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-soft);margin-bottom:0.5rem;">Further Reading</div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
          <a href="https://www.rightmove.co.uk/news/articles/property-news/green-premium-epc-ratings/" target="_blank" rel="noopener" style="font-size:0.8rem;color:var(--green);text-decoration:none;display:flex;align-items:center;gap:0.35rem;"><i class="fas fa-external-link-alt"></i> Rightmove — Green Premium &amp; EPC Ratings</a>
          <a href="https://www.bettermove.co.uk/blog/increase-home-value-with-residential-solar-panels/#going-green-attracts-buyers" target="_blank" rel="noopener" style="font-size:0.8rem;color:var(--green);text-decoration:none;display:flex;align-items:center;gap:0.35rem;"><i class="fas fa-external-link-alt"></i> BetterMove — Solar &amp; Home Value</a>
          <a href="https://www.gov.uk/find-energy-certificate" target="_blank" rel="noopener" style="font-size:0.8rem;color:var(--green);text-decoration:none;display:flex;align-items:center;gap:0.35rem;"><i class="fas fa-external-link-alt"></i> GOV.UK — Find an Energy Certificate</a>
        </div>
      </div>
    </div>

  </div>
</div>`;
  },

  /* ============================================================
     DISPATCH
     ============================================================ */
  async renderModule(moduleId, inputs, isReadOnly) {
    switch (moduleId) {
      case 'calculator':           return Modules.renderCalculator(inputs, isReadOnly);
      case 'how_solar_works':      return await Modules.renderHowSolarWorks();
      case 'installation_journey': return await Modules.renderInstallationJourney();
      case 'tariffs':              return await Modules.renderTariffs();
      case 'faqs':                 return await Modules.renderFAQs();
      case 'why_choose_us':        return await Modules.renderWhyChooseUs();
      case 'reviews':              return await Modules.renderReviews();
      case 'videos':               return await Modules.renderVideos();
      case 'next_steps':           return Modules.renderNextSteps(inputs);
      case 'ev_charging':          return Modules.renderEvCharging();
      case 'moving_house':         return Modules.renderMovingHouse();
      default: return `<div class="slide"><h2>Unknown module: ${moduleId}</h2></div>`;
    }
  }
};

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
