/* ============================================================
   MODULE RENDERERS — Three Counties Windows Sales Navigator
   ============================================================ */

const Modules = {

  /* ============================================================
     WELCOME
     ============================================================ */
  renderWelcome() {
    return `
<div class="slide" id="slide-welcome" style="position:relative;min-height:480px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2.5rem 1.5rem;">
  <div class="slide-eyebrow green"><i class="fas fa-house"></i> Three Counties</div>
  <h1 class="slide-h1" style="font-size:2rem;max-width:600px;">Let's find the <span class="accent">right windows</span> for your home</h1>
  <p class="slide-lead" style="max-width:520px;margin:0 auto 2rem;">No hassle, no pressure. Just clear, honest advice from a local team that has been doing this for over 20 years.</p>
  <p style="font-size:0.87rem;color:var(--text-soft);max-width:480px;margin:0 auto 2rem;line-height:1.7;">We will walk through everything that matters to you, from how the windows perform to what they cost and how to spread it. Take your time, ask anything, and we will only ever recommend what is right for your home.</p>
  <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;">
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-shield-halved"></i> Zero Deposit</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-star"></i> 1,500+ Reviews</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-certificate"></i> FENSA Registered</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-phone"></i> 01344 777515</div>
  </div>
</div>`;
  },

  /* ============================================================
     PRIORITIES
     ============================================================ */
  renderPriorities() {
    const opts = [
      { key: 'security',    label: 'Security',           icon: 'fa-shield-halved', desc: 'Keeping your home and family safe' },
      { key: 'thermal',     label: 'Thermal Efficiency', icon: 'fa-temperature-half', desc: 'A warmer home and lower energy bills' },
      { key: 'aesthetics',  label: 'Aesthetics',         icon: 'fa-eye',           desc: 'Windows that transform how your home looks' },
      { key: 'maintenance', label: 'Easy Maintenance',   icon: 'fa-screwdriver-wrench', desc: 'Quality that lasts with very little upkeep' },
    ];
    return `
<div class="slide" id="slide-priorities">
  <div class="slide-eyebrow green"><i class="fas fa-list-check"></i> Personalise Your Journey</div>
  <h1 class="slide-h1">What <span class="accent">matters most</span> to you?</h1>
  <p class="slide-lead">Tap the things that are important, and we will focus on those first.</p>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;max-width:640px;margin:0 auto;">
    ${opts.map(o => `
      <button class="priority-chip" data-priority="${o.key}" onclick="togglePriority('${o.key}')"
        style="background:var(--bg-card);border:2px solid var(--border);border-radius:var(--r-md);padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.2s;">
        <i class="fas ${o.icon}" style="font-size:1.8rem;color:var(--green);margin-bottom:0.65rem;display:block;"></i>
        <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">${o.label}</div>
        <div style="font-size:0.75rem;color:var(--text-soft);">${o.desc}</div>
      </button>`).join('')}
  </div>
  <style>.priority-chip.selected{border-color:var(--green)!important;background:var(--green-light)!important;}</style>
</div>`;
  },

  /* ============================================================
     ECO VS ECO+
     ============================================================ */
  async renderEcoComparison() {
    const items = AppState.getModuleItems('eco_vs_eco_plus');
    const eco  = items.find(i => i.title === 'Eco')  || { title: 'Eco',  body: '', meta1: 'Centre pane U-value: 1.20 W/m²K', meta2: 'Finance: Buy Now Pay Later' };
    const ecoP = items.find(i => i.title === 'Eco+') || { title: 'Eco+', body: '', meta1: 'Centre pane U-value: 1.0 W/m²K',  meta2: 'Finance: Buy Now Pay Later + Interest Free Credit (2 to 5 years)' };

    return `
<div class="slide" id="slide-eco-vs-eco-plus">
  <div class="slide-eyebrow green"><i class="fas fa-leaf"></i> Glass Performance</div>
  <h1 class="slide-h1">Eco or <span class="accent">Eco+</span>, the choice is yours</h1>
  <p class="slide-lead">Both are energy-efficient. One goes further on performance, and unlocks interest-free credit.</p>
  <div style="background:var(--green-light);border-radius:var(--r-md);padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:0.87rem;color:var(--green);">
    <i class="fas fa-circle-info"></i> Our low-emissivity glass can cut the energy lost through your windows by <strong>up to 75%</strong>, giving you three times the thermal insulation of standard double glazing.
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
    <!-- ECO -->
    <div style="background:var(--bg-card);border:2px solid var(--border);border-radius:var(--r-lg);padding:1.75rem;box-shadow:var(--shadow-sm);">
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-soft);margin-bottom:0.5rem;">Standard</div>
      <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1rem;">Eco</h2>
      <p style="font-size:0.85rem;color:var(--text-soft);margin-bottom:1.25rem;">${escHtml(eco.body) || 'Our standard soft-coat low-emissivity glass with argon gas. Energy efficient and meets the latest building regulations.'}</p>
      <div style="display:flex;flex-direction:column;gap:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:var(--green);"></i> Soft-coat low-emissivity glass</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:var(--green);"></i> Argon gas filled</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:var(--green);"></i> ${escHtml(eco.meta1)}</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:var(--green);"></i> Meets latest building regulations</div>
      </div>
      <div style="margin-top:1.25rem;padding:0.85rem;background:#f5f5f5;border-radius:var(--r-sm);font-size:0.8rem;color:var(--text-soft);">
        <strong>Finance:</strong> Buy Now Pay Later
      </div>
    </div>
    <!-- ECO+ -->
    <div style="background:var(--green);border:2px solid var(--green);border-radius:var(--r-lg);padding:1.75rem;box-shadow:var(--shadow-md);color:#fff;position:relative;">
      <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--orange);color:#fff;font-size:0.7rem;font-weight:700;padding:0.3rem 0.85rem;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Recommended</div>
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;opacity:0.8;margin-bottom:0.5rem;">Premium</div>
      <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1rem;">Eco+</h2>
      <p style="font-size:0.85rem;opacity:0.9;margin-bottom:1.25rem;">${escHtml(ecoP.body) || 'A higher specification of soft-coat low-emissivity glass for our best thermal performance.'}</p>
      <div style="display:flex;flex-direction:column;gap:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:#fff;"></i> Higher-spec soft-coat low-emissivity</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:#fff;"></i> Argon gas filled</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:#fff;"></i> ${escHtml(ecoP.meta1)}</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:#fff;"></i> The warmest, most efficient choice</div>
      </div>
      <div style="margin-top:1.25rem;padding:0.85rem;background:rgba(255,255,255,0.15);border-radius:var(--r-sm);font-size:0.8rem;">
        <strong>Finance:</strong> Buy Now Pay Later <strong>+ Interest Free Credit</strong> (2–5 years)
      </div>
    </div>
  </div>
  <p style="font-size:0.82rem;color:var(--text-soft);margin-top:1.25rem;text-align:center;">
    <i class="fas fa-lightbulb" style="color:var(--orange);"></i>
    Eco+ is the only range with interest-free credit, so the better-performing glass is also the easiest to spread the cost on.
  </p>
</div>`;
  },

  /* ============================================================
     GALLERY
     ============================================================ */
  async renderGallery() {
    const items = AppState.getModuleItems('gallery');
    const galleryHTML = items.length ? items.map((img, i) => `
      <div onclick="Modules.openLightbox(${i})" style="cursor:pointer;border-radius:var(--r-md);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow-sm);">
        <img src="${escHtml(img.meta1 || img.body)}" alt="${escHtml(img.title)}"
          style="width:100%;height:100%;object-fit:cover;transition:transform 0.2s;"
          onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'" />
      </div>`).join('') :
      `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-soft);">
        <i class="fas fa-images" style="font-size:2.5rem;margin-bottom:1rem;display:block;opacity:0.4;"></i>
        <p>Gallery images will appear here once added in Admin.</p>
      </div>`;

    return `
<div class="slide" id="slide-gallery">
  <div class="slide-eyebrow green"><i class="fas fa-images"></i> Our Work</div>
  <h1 class="slide-h1">See what's <span class="accent">possible</span></h1>
  <p class="slide-lead">Real homes, real installs, right across Surrey, Hampshire and Berkshire.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.85rem;">${galleryHTML}</div>
  <!-- Lightbox -->
  <div id="gallery-lightbox" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;align-items:center;justify-content:center;" onclick="Modules.closeLightbox()">
    <img id="lightbox-img" src="" style="max-width:90vw;max-height:90vh;border-radius:var(--r-md);box-shadow:0 8px 40px rgba(0,0,0,0.5);" />
    <button onclick="Modules.closeLightbox()" style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,0.15);border:none;color:#fff;width:40px;height:40px;border-radius:50%;font-size:1.2rem;cursor:pointer;">✕</button>
  </div>
</div>`;
  },

  openLightbox(idx) {
    const items = AppState.getModuleItems('gallery');
    if (!items[idx]) return;
    const lb = document.getElementById('gallery-lightbox');
    const img = document.getElementById('lightbox-img');
    if (lb && img) {
      img.src = items[idx].meta1 || items[idx].body;
      lb.style.display = 'flex';
    }
  },

  closeLightbox() {
    const lb = document.getElementById('gallery-lightbox');
    if (lb) lb.style.display = 'none';
  },

  /* ============================================================
     DOOR BUILDER (Glazing Vault script embed)
     ============================================================ */
  renderDoorBuilder() {
    return `
<div class="slide" id="slide-door-builder">
  <div class="slide-eyebrow green"><i class="fas fa-door-open"></i> Design Your Door</div>
  <h1 class="slide-h1">Design your perfect <span class="accent">door</span></h1>
  <p class="slide-lead">Choose your style, colour and glass, then see it on your own home.</p>
  <p style="font-size:0.87rem;color:var(--text-soft);max-width:640px;margin:0 auto 1.25rem;line-height:1.7;">Use our door designer to build the exact look you want. When you've got it right, the <strong>Home Visualizer</strong> lets you upload a photo of your house and preview your new door in place — before you commit to anything.</p>
  <div class="glazing-vault-wrap" style="width:100%;min-height:726px;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-md);background:var(--bg-card);">
    <iframe src="https://www.theglazingvault.com/sm2/designer/create/5054/73a0e24341861f07fcfcb93d9af92a06"
            title="Door Designer" loading="lazy" allow="fullscreen"
            style="width:100%;height:726px;min-height:726px;border:0;display:block;"></iframe>
  </div>
</div>`;
  },

  /* ============================================================
     EMBEDDED TOOL (Installs Map, Get Quote)
     ============================================================ */
  renderEmbeddedTool(toolKey) {
    const tool = EMBEDDED_TOOLS[toolKey];
    if (!tool) return `<div class="slide"><h2>Tool not configured: ${toolKey}</h2></div>`;

    const popOut = `<a class="btn-primary" href="${tool.url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.4rem;">
      <i class="fas fa-external-link-alt"></i> Open ${tool.label} in full
    </a>`;

    const isPlaceholder = !tool.url || tool.url.startsWith('CONFIRM');

    if (isPlaceholder) {
      return `
<div class="slide" id="slide-${toolKey}">
  <div class="slide-eyebrow orange"><i class="fas fa-clock"></i> Coming Soon</div>
  <h1 class="slide-h1">${tool.label}</h1>
  <p class="slide-lead">${tool.blurb}</p>
  <div style="background:var(--bg-card);border:2px dashed var(--border);border-radius:var(--r-lg);padding:3rem;text-align:center;">
    <i class="fas fa-link" style="font-size:2rem;opacity:0.3;margin-bottom:1rem;display:block;"></i>
    <p style="color:var(--text-soft);font-size:0.87rem;">Tool URL to be confirmed. This will open the ${tool.label} tool.</p>
  </div>
</div>`;
    }

    if (tool.embeddable) {
      return `
<div class="slide" id="slide-${toolKey}">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
    <div>
      <div class="slide-eyebrow green"><i class="fas fa-door-open"></i> Interactive Tool</div>
      <h1 class="slide-h1" style="margin:0;">${tool.label}</h1>
    </div>
    ${popOut}
  </div>
  <p class="slide-lead">${tool.blurb}</p>
  <div style="position:relative;width:100%;height:70vh;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-md);">
    <iframe src="${tool.url}" title="${tool.label}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
      allow="fullscreen" style="width:100%;height:100%;border:0;"></iframe>
  </div>
</div>`;
    }

    return `
<div class="slide" id="slide-${toolKey}">
  <div class="slide-eyebrow green"><i class="fas fa-door-open"></i> Interactive Tool</div>
  <h1 class="slide-h1">${tool.label}</h1>
  <p class="slide-lead">${tool.blurb}</p>
  <div style="background:var(--green-light);border-radius:var(--r-lg);padding:3rem;text-align:center;">
    <i class="fas fa-door-open" style="font-size:2.5rem;color:var(--green);margin-bottom:1rem;display:block;"></i>
    <h3 style="margin-bottom:0.75rem;">${tool.label}</h3>
    <p style="color:var(--text-soft);font-size:0.87rem;margin-bottom:1.5rem;">${tool.blurb}</p>
    ${popOut}
  </div>
</div>`;
  },

  /* ============================================================
     WHY CHOOSE 3C
     ============================================================ */
  async renderWhyChoose() {
    const items = AppState.getModuleItems('why_choose');
    const icons = ['fa-shield-halved','fa-star','fa-sterling-sign','fa-certificate','fa-check-circle','fa-tag'];

    const cardsHTML = items.length ? items.map((item, i) => `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;display:flex;gap:0.85rem;align-items:flex-start;box-shadow:var(--shadow-sm);">
        <div class="usp-icon-box"><i class="fas ${icons[i % icons.length]}"></i></div>
        <div>
          <h4 style="margin-bottom:0.3rem;">${escHtml(item.title)}</h4>
          <p style="font-size:0.82rem;color:var(--text-soft);">${escHtml(item.body)}</p>
        </div>
      </div>`).join('') :
      `<p style="color:var(--text-soft);">No content yet. Add items in Admin.</p>`;

    return `
<div class="slide" id="slide-why-choose">
  <div class="slide-eyebrow green"><i class="fas fa-shield-halved"></i> Why Choose Us</div>
  <h1 class="slide-h1">Why choose <span class="accent">Three Counties</span></h1>
  <p class="slide-lead">Helping you make the right decision for your home.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-bottom:1.5rem;">${cardsHTML}</div>
  <div style="background:var(--green);border-radius:var(--r-md);padding:1.25rem;color:#fff;text-align:center;">
    <p style="font-size:0.9rem;opacity:0.95;font-style:italic;">A family-run local business you can trust, here long before the sale and long after.</p>
    <div style="margin-top:0.75rem;display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">
      <span style="font-size:0.8rem;opacity:0.85;"><i class="fas fa-map-marker-alt"></i> Based in Camberley</span>
      <span style="font-size:0.8rem;opacity:0.85;"><i class="fas fa-phone"></i> 01344 777515</span>
      <span style="font-size:0.8rem;opacity:0.85;"><i class="fas fa-globe"></i> threecounties.co.uk</span>
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

    const platformCards = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;text-align:center;box-shadow:var(--shadow-sm);">
          <a href="https://www.checkatrade.com/ThreeCountiesConservatoriesWindowsDoors/" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
            <div style="font-weight:800;font-size:1.5rem;color:var(--green);margin-bottom:0.25rem;">9.8/10</div>
            <div style="font-size:0.72rem;font-weight:700;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.4px;">Checkatrade</div>
            <div style="font-size:0.78rem;color:var(--text-soft);margin-top:0.25rem;">1,200+ reviews</div>
            <div style="color:#f59e0b;font-size:0.9rem;margin-top:0.35rem;">★★★★★</div>
          </a>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;text-align:center;box-shadow:var(--shadow-sm);">
          <a href="https://www.trustpilot.com/review/threecountiesltd.co.uk" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
            <div style="font-weight:800;font-size:1.5rem;color:var(--green);margin-bottom:0.25rem;">5/5</div>
            <div style="font-size:0.72rem;font-weight:700;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.4px;">Trustpilot</div>
            <div style="font-size:0.78rem;color:var(--text-soft);margin-top:0.25rem;">116 reviews</div>
            <div style="color:#f59e0b;font-size:0.9rem;margin-top:0.35rem;">★★★★★</div>
          </a>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;text-align:center;box-shadow:var(--shadow-sm);">
          <a href="https://www.google.com/search?q=Three+Counties+Conservatories+Windows+Doors+Camberley+reviews" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
            <div style="font-weight:800;font-size:1.5rem;color:var(--green);margin-bottom:0.25rem;">4.6/5</div>
            <div style="font-size:0.72rem;font-weight:700;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.4px;">Google</div>
            <div style="font-size:0.78rem;color:var(--text-soft);margin-top:0.25rem;">220 reviews</div>
            <div style="color:#f59e0b;font-size:0.9rem;margin-top:0.35rem;">★★★★★</div>
          </a>
        </div>
      </div>`;

    const carouselCards = reviews.filter(r => r.body && r.body.length > 10).map(r => `
      <div class="rev-card" style="flex:0 0 300px;scroll-snap-align:start;">
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--green);margin-bottom:0.4rem;">${escHtml(r.meta1 || '')}</div>
        <div style="color:#f59e0b;font-size:0.9rem;margin-bottom:0.6rem;">${stars(r.meta2)}</div>
        <div style="font-size:0.85rem;color:var(--text);font-style:italic;margin-bottom:0.75rem;line-height:1.6;">"${escHtml(r.body)}"</div>
        <div style="font-weight:700;font-size:0.82rem;">${escHtml(r.title)}</div>
        <div style="font-size:0.75rem;color:var(--text-soft);margin-top:0.15rem;">${escHtml(r.meta3 || '')}</div>
      </div>`).join('');

    return `
<div class="slide" id="slide-reviews">
  <div class="slide-eyebrow"><i class="fas fa-star"></i> Customer Reviews</div>
  <h1 class="slide-h1">Don't just take <span class="accent">our word for it</span></h1>
  <p class="slide-lead">Thousands of local homeowners have trusted us with their homes.</p>
  ${platformCards}
  ${carouselCards ? `
  <div style="display:flex;align-items:center;justify-content:flex-end;gap:0.5rem;margin-bottom:0.6rem;">
    <button onclick="document.getElementById('rev-track').scrollBy({left:-330,behavior:'smooth'})"
      style="width:36px;height:36px;border-radius:50%;border:2px solid var(--green);background:var(--green-light);color:var(--green);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">&#8592;</button>
    <button onclick="document.getElementById('rev-track').scrollBy({left:330,behavior:'smooth'})"
      style="width:36px;height:36px;border-radius:50%;border:2px solid var(--green);background:var(--green-light);color:var(--green);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">&#8594;</button>
  </div>
  <div id="rev-track" style="display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding-bottom:0.5rem;">${carouselCards}</div>` : ''}
  <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;margin-top:1.25rem;">
    <a href="https://www.checkatrade.com/ThreeCountiesConservatoriesWindowsDoors/" target="_blank" rel="noopener" class="btn-secondary" style="font-size:0.82rem;"><i class="fas fa-star"></i> View All Checkatrade Reviews</a>
    <a href="https://www.trustpilot.com/review/threecountiesltd.co.uk" target="_blank" rel="noopener" class="btn-secondary" style="font-size:0.82rem;"><i class="fas fa-star"></i> View All Trustpilot Reviews</a>
    <a href="https://www.google.com/search?q=Three+Counties+Conservatories+Windows+Doors+Camberley+reviews" target="_blank" rel="noopener" class="btn-secondary" style="font-size:0.82rem;"><i class="fas fa-star"></i> View All Google Reviews</a>
  </div>
</div>`;
  },

  /* ============================================================
     INSTALLS NEAR YOU
     ============================================================ */
  renderInstallsMap() {
    const mapUrl = AppState.getSettingStr('installs_map.embed_url', '');
    return `
<div class="slide" id="slide-installs-map">
  <div class="slide-eyebrow green"><i class="fas fa-map-location-dot"></i> Local Work</div>
  <h1 class="slide-h1">We've been busy <span class="accent">in your area</span></h1>
  <p class="slide-lead">See where we have recently fitted windows and doors near you.</p>
  <p style="font-size:0.87rem;color:var(--text-soft);margin-bottom:1.25rem;">We work right across Surrey, Hampshire and Berkshire, so chances are we have already transformed a home not far from yours.</p>
  ${mapUrl ? `
  <div style="position:relative;width:100%;height:500px;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-md);">
    <iframe src="${mapUrl}" title="Installs Near You" style="width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
  </div>` : `
  <div style="background:var(--bg-card);border:2px dashed var(--border);border-radius:var(--r-lg);padding:3rem;text-align:center;">
    <i class="fas fa-map" style="font-size:2.5rem;opacity:0.3;margin-bottom:1rem;display:block;"></i>
    <p style="color:var(--text-soft);">Map embed URL not yet configured in settings.</p>
  </div>`}
</div>`;
  },

  /* ============================================================
     SECURE LIVING WARRANTY
     ============================================================ */
  async renderSecureLiving() {
    const items = AppState.getModuleItems('secure_living');
    const payouts = items.filter((_, i) => i > 0);
    const intro = items[0] || { body: 'A free security guarantee that pays you directly if your home is broken into due to a failure of approved window or door hardware. Up to £5,000 of total cover.' };

    const payoutCards = payouts.length ? payouts.map(p => `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;text-align:center;box-shadow:var(--shadow-sm);">
        <div style="font-size:1.4rem;font-weight:800;color:var(--green);margin-bottom:0.35rem;">${escHtml(p.meta1 || '')}</div>
        <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.3rem;">${escHtml(p.title)}</div>
        <div style="font-size:0.78rem;color:var(--text-soft);">${escHtml(p.body)}</div>
      </div>`).join('') :
      ['Emergency Boarding Up — Up to £1,000','Repair or Replace — Up to £1,500','Insurance Excess — Up to £1,500','Goodwill Payment — £1,000'].map(t => {
        const [label, val] = t.split(' — ');
        return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;text-align:center;box-shadow:var(--shadow-sm);">
          <div style="font-size:1.4rem;font-weight:800;color:var(--green);margin-bottom:0.35rem;">${val}</div>
          <div style="font-weight:700;font-size:0.85rem;">${label}</div>
        </div>`;
      }).join('');

    return `
<div class="slide" id="slide-secure-living">
  <div class="slide-eyebrow green"><i class="fas fa-shield"></i> Security Guarantee</div>
  <h1 class="slide-h1">Security, <span class="accent">guaranteed</span></h1>
  <p class="slide-lead">A free warranty that pays you directly, for genuine peace of mind.</p>
  <div style="background:var(--green);border-radius:var(--r-md);padding:1.25rem 1.5rem;color:#fff;margin-bottom:1.5rem;display:flex;gap:1rem;align-items:flex-start;">
    <i class="fas fa-shield" style="font-size:2rem;flex-shrink:0;margin-top:0.2rem;"></i>
    <div>
      <div style="font-weight:700;margin-bottom:0.35rem;">Up to £5,000 of total cover — included at no extra cost</div>
      <p style="font-size:0.85rem;opacity:0.9;">${escHtml(intro.body)}</p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;">${payoutCards}</div>
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1rem 1.25rem;font-size:0.8rem;color:var(--text-soft);">
    <strong><i class="fas fa-info-circle"></i> Hardware Partners:</strong> Backed by industry-leading hardware from Avantis, VBH and Yale. Terms and conditions apply.
  </div>
</div>`;
  },

  /* ============================================================
     FINANCE OPTIONS
     ============================================================ */
  renderFinance() {
    const disclaimer = AppState.getSettingStr('finance.disclaimer', 'Illustration only. This is not a quote or an offer of credit. Finance subject to status and affordability.');
    const fcaLine    = AppState.getSettingStr('finance.fca_line',   '3 Counties (Sandhurst) Ltd, FRN 727419, is authorised and regulated by the Financial Conduct Authority. We are a credit broker, not a lender. Credit is provided by Mitsubishi HC Capital UK PLC (Novuna).');

    return `
<div class="slide" id="slide-finance">
  <div class="slide-eyebrow green"><i class="fas fa-sterling-sign"></i> Finance Options</div>
  <h1 class="slide-h1">Spread the cost, <span class="accent">your way</span></h1>
  <p class="slide-lead">Flexible finance to suit your budget, including interest-free credit.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.5rem;">
    <!-- BNPL -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.5rem;box-shadow:var(--shadow-sm);">
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-soft);margin-bottom:0.5rem;">Available on all products</div>
      <h3 style="margin-bottom:1rem;">Buy Now Pay Later</h3>
      <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:var(--green);"></i> Buy now, pay within 12 months</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:var(--green);"></i> No interest if paid in full within 12 months</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle" style="color:var(--green);"></i> A £29 fee applies on settlement</div>
      </div>
    </div>
    <!-- IFC -->
    <div style="background:var(--green);border:1px solid var(--green);border-radius:var(--r-lg);padding:1.5rem;box-shadow:var(--shadow-md);color:#fff;position:relative;">
      <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--orange);color:#fff;font-size:0.7rem;font-weight:700;padding:0.3rem 0.85rem;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Eco+ Only</div>
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;opacity:0.8;margin-bottom:0.5rem;">Eco+ window range</div>
      <h3 style="margin-bottom:1rem;">Interest Free Credit</h3>
      <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle"></i> Spread over 2, 3, 4 or 5 years</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle"></i> 0% interest</div>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;"><i class="fas fa-check-circle"></i> Only available on Eco+ range</div>
      </div>
    </div>
  </div>

  <!-- Illustrative Calculator -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.5rem;box-shadow:var(--shadow-sm);margin-bottom:1.25rem;">
    <h3 style="margin-bottom:1rem;"><i class="fas fa-calculator" style="color:var(--orange);margin-right:0.4rem;"></i> Illustrative Monthly Figure</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
      <div class="form-grp">
        <label class="form-lbl">Project Total (£)</label>
        <div class="input-wrap">
          <input type="number" id="fin-total" class="form-inp" value="5000" min="500" max="100000" step="100" oninput="Modules.calcFinance()" />
          <span class="inp-sfx">£</span>
        </div>
      </div>
      <div class="form-grp">
        <label class="form-lbl">Finance Term</label>
        <div class="input-wrap">
          <select id="fin-term" class="form-inp" onchange="Modules.calcFinance()">
            <option value="bnpl">Buy Now Pay Later (12 months)</option>
            <option value="2">Interest Free — 2 years (Eco+ only)</option>
            <option value="3">Interest Free — 3 years (Eco+ only)</option>
            <option value="4">Interest Free — 4 years (Eco+ only)</option>
            <option value="5">Interest Free — 5 years (Eco+ only)</option>
          </select>
        </div>
      </div>
    </div>
    <div id="fin-result" style="background:var(--green-light);border-radius:var(--r-md);padding:1rem;text-align:center;">
      <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-soft);margin-bottom:0.35rem;">Illustrative Monthly Payment</div>
      <div id="fin-monthly" style="font-size:2rem;font-weight:800;color:var(--green);">—</div>
      <div id="fin-note" style="font-size:0.75rem;color:var(--text-soft);margin-top:0.25rem;"></div>
    </div>
  </div>

  <div class="calc-disclaimer">
    <i class="fas fa-circle-info"></i>
    <span>${escHtml(disclaimer)} ${escHtml(fcaLine)}</span>
  </div>
</div>`;
  },

  calcFinance() {
    const total = parseFloat(document.getElementById('fin-total')?.value) || 0;
    const term  = document.getElementById('fin-term')?.value;
    const monthly = document.getElementById('fin-monthly');
    const note    = document.getElementById('fin-note');
    if (!monthly || !note) return;

    if (!total) { monthly.textContent = '—'; note.textContent = ''; return; }

    if (term === 'bnpl') {
      monthly.textContent = `£${(total / 12).toFixed(2)}`;
      note.textContent = `Pay £${total.toFixed(2)} within 12 months. £29 settlement fee applies.`;
    } else {
      const months = parseInt(term) * 12;
      monthly.textContent = `£${(total / months).toFixed(2)}`;
      note.textContent = `0% interest over ${term} years (${months} months). Eco+ range only.`;
    }
  },

  /* ============================================================
     GET YOUR QUOTE (Close screen)
     ============================================================ */
  renderGetQuote() {
    const quoteUrl = AppState.getSettingStr('tommy_trinder.url', '');
    const hasUrl   = quoteUrl && !quoteUrl.startsWith('CONFIRM');

    return `
<div class="slide" id="slide-get-quote" style="text-align:center;">
  <div class="slide-eyebrow"><i class="fas fa-rocket"></i> Next Steps</div>
  <h1 class="slide-h1">Ready for your free, <span class="accent">no-obligation quote?</span></h1>
  <p class="slide-lead" style="max-width:520px;margin:0 auto 2rem;">No pressure, no hard sell. Just an honest price for the right windows.</p>
  <p style="font-size:0.87rem;color:var(--text-soft);max-width:480px;margin:0 auto 2rem;line-height:1.7;">Build your quote now and we will talk you through it. There is no obligation, and the decision is always yours.</p>
  <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;margin-bottom:2rem;">
    ${hasUrl ? `
    <a href="${quoteUrl}" target="_blank" rel="noopener" class="btn-book" style="font-size:1rem;padding:1rem 2.5rem;">
      Start my quote <i class="fas fa-arrow-right"></i>
    </a>` : `
    <button class="btn-book" style="font-size:1rem;padding:1rem 2.5rem;opacity:0.6;cursor:not-allowed;">
      Start my quote <i class="fas fa-arrow-right"></i>
    </button>
    <p style="font-size:0.75rem;color:var(--text-soft);">Quoting tool URL to be confirmed.</p>`}
    <a href="tel:01344777515" class="btn-secondary" style="font-size:0.9rem;">
      <i class="fas fa-phone"></i> Or call us: 01344 777515
    </a>
  </div>
  <div style="display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.75rem 1rem;font-size:0.78rem;color:var(--green);font-weight:600;"><i class="fas fa-shield-halved"></i> Zero Deposit</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.75rem 1rem;font-size:0.78rem;color:var(--green);font-weight:600;"><i class="fas fa-certificate"></i> FENSA Registered</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.75rem 1rem;font-size:0.78rem;color:var(--green);font-weight:600;"><i class="fas fa-star"></i> 1,500+ Reviews</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.75rem 1rem;font-size:0.78rem;color:var(--green);font-weight:600;"><i class="fas fa-lock"></i> Secure Living Warranty</div>
  </div>
</div>`;
  },

  /* ============================================================
     DISPATCH
     ============================================================ */
  async renderModule(moduleId, inputs, isReadOnly) {
    switch (moduleId) {
      case 'welcome':        return Modules.renderWelcome();
      case 'priorities':     return Modules.renderPriorities();
      case 'eco_vs_eco_plus':return await Modules.renderEcoComparison();
      case 'gallery':        return await Modules.renderGallery();
      case 'door_builder':   return Modules.renderDoorBuilder();
      case 'why_choose':     return await Modules.renderWhyChoose();
      case 'reviews':        return await Modules.renderReviews();
      case 'installs_map':   return Modules.renderInstallsMap();
      case 'secure_living':  return await Modules.renderSecureLiving();
      case 'finance':        return Modules.renderFinance();
      case 'get_quote':      return Modules.renderGetQuote();
      default: return `<div class="slide"><h2>Unknown module: ${moduleId}</h2></div>`;
    }
  }
};

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
