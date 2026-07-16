/* ============================================================
   MODULE RENDERERS — Three Counties Windows Sales Navigator
   ============================================================ */

const Modules = {

  /* ============================================================
     WELCOME
     ============================================================ */
  renderWelcome() {
    const productOrder = ['windows', 'doors', 'conservatories'];
    const sel = AppState.products ? productOrder.filter(p => AppState.products.has(p)) : [];
    const productLabel = sel.length === 0 ? 'windows'
      : sel.length === 1 ? sel[0]
      : sel.length === 2 ? sel.join(' & ')
      : `${sel[0]}, ${sel[1]} & ${sel[2]}`;
    const displayMap = { windows: 'windows', doors: 'doors', conservatories: 'conservatory' };
    const selD = sel.map(p => displayMap[p]);
    const headlineLabel = selD.length === 0 ? 'windows'
      : selD.length === 1 ? selD[0]
      : selD.length === 2 ? selD.join(' & ')
      : `${selD[0]}, ${selD[1]} & ${selD[2]}`;
    const defaultHeroes = ['welcome-1.jpg','welcome-2.jpg','welcome-3.jpg','welcome-4.jpg'];
    let heroes;
    if (sel.length > 0) {
      const heroPicks = {
        windows: ['Windows-6.jpg','Windows-38.jpg','Windows-24.jpg','Windows-10.jpg']
      };
      const byProduct = sel.map(p => {
        if (heroPicks[p]) return heroPicks[p].slice();
        const all = Modules.gallery.filter(g => g.product === p).map(g => g.src);
        const want = Math.max(1, Math.ceil(4 / sel.length));
        const step = Math.max(1, Math.floor(all.length / want));
        const picks = [];
        for (let i = 0; i < all.length && picks.length < want; i += step) picks.push(all[i]);
        return picks;
      });
      heroes = [];
      for (let round = 0; heroes.length < 4; round++) {
        let added = false;
        for (const list of byProduct) {
          if (list[round]) { heroes.push(list[round]); added = true; }
          if (heroes.length === 4) break;
        }
        if (!added) break;
      }
      if (heroes.length === 0) heroes = defaultHeroes;
    } else {
      heroes = defaultHeroes;
    }
    const wLead = AppState.getSettingStr('welcome.lead', 'No hassle, no pressure. Just clear, honest advice from a local team that has been doing this for over 20 years.');
    const wBody = (AppState.getSettingStr('welcome.body', 'We will walk through everything that matters to you, from how the {product} perform to what they cost and how to spread it. Take your time, ask anything, and we will only ever recommend what is right for your home.')).split('{product}').join(productLabel);
    return `
<div class="slide" id="slide-welcome" style="position:relative;min-height:480px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2.5rem 1.5rem;">
  <div class="slide-eyebrow green"><i class="fas fa-house"></i> Three Counties</div>
  <h1 class="slide-h1" style="font-size:2rem;max-width:600px;">Let's find the <span class="accent">right ${headlineLabel}</span> for your home</h1>
  <p class="slide-lead" style="max-width:520px;margin:0 auto 2rem;">${escHtml(wLead)}</p>
  <p style="font-size:0.87rem;color:var(--text-soft);max-width:480px;margin:0 auto 2rem;line-height:1.7;">${wBody}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;width:100%;max-width:840px;margin:0 auto 2rem;">
    ${heroes.map(src => `<img src="${src}" alt="Three Counties installation" style="width:100%;height:150px;object-fit:cover;border-radius:var(--r-md);box-shadow:var(--shadow-sm);display:block;">`).join('')}
  </div>
  <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;">
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-shield-halved"></i> Zero Deposit</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-star"></i> 1,500+ Reviews</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-certificate"></i> FENSA Registered</div>
    <div style="background:var(--green-light);border-radius:var(--r-md);padding:0.85rem 1.25rem;font-size:0.8rem;color:var(--green);font-weight:600;"><i class="fas fa-phone"></i> 01344 777515</div>
  </div>
  <div style="margin-top:1.75rem;display:flex;gap:1.25rem;justify-content:center;align-items:center;flex-wrap:wrap;">
    <span style="background:#fff;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);height:72px;width:170px;"><img src="fensa-logo.jpg" alt="FENSA Registered" style="max-height:56px;max-width:150px;width:auto;object-fit:contain;"></span>
    <span style="background:#fff;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);height:72px;width:170px;"><img src="ggf-logo.jpg" alt="GGF Member" style="max-height:56px;max-width:150px;width:auto;object-fit:contain;"></span>
    <span style="background:#fff;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);height:72px;width:170px;"><img src="uktsa-surrey.webp" alt="Surrey Trading Standards Approved" style="max-height:56px;max-width:150px;width:auto;object-fit:contain;"></span>
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
      { key: 'resell',      label: 'Resell Value',       icon: 'fa-arrow-trend-up',     desc: 'Windows that add value when you sell' },
    ];
    return `
<div class="slide" id="slide-priorities">
  <style>
    .priority-chip.selected{border-color:var(--green)!important;background:var(--green-light)!important;}
    .product-chip.selected{border-color:var(--green)!important;background:var(--green-light)!important;}
    @media(max-width:760px){#priorities-grid{grid-template-columns:1fr!important;}#priorities-img{order:1;min-height:220px!important;}}
  </style>
  <div id="priorities-grid" style="display:grid;grid-template-columns:1.4fr 1fr;gap:2rem;align-items:stretch;max-width:1040px;margin:0 auto;">
    <!-- LEFT -->
    <div>
      <div class="slide-eyebrow green"><i class="fas fa-layer-group"></i> What are you looking for?</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-top:0.75rem;">
        ${[{key:'windows',label:'Windows',icon:'fa-border-all'},{key:'doors',label:'Doors',icon:'fa-door-open'},{key:'conservatories',label:'Conservatories',icon:'fa-house-chimney-window'}].map(p => `
          <button class="product-chip${AppState.products?.has(p.key) ? ' selected' : ''}" data-product="${p.key}" onclick="toggleProduct('${p.key}')"
            style="background:var(--bg-card);border:2px solid var(--border);border-radius:var(--r-md);padding:1rem 0.5rem;text-align:center;cursor:pointer;transition:all 0.2s;">
            <i class="fas ${p.icon}" style="font-size:1.4rem;color:var(--green);margin-bottom:0.45rem;display:block;"></i>
            <div style="font-weight:700;font-size:0.85rem;">${p.label}</div>
          </button>`).join('')}
      </div>
      <div style="margin-top:1.75rem;">
      <div class="slide-eyebrow green"><i class="fas fa-list-check"></i> Personalise Your Journey</div>
      <h1 class="slide-h1">What <span class="accent">matters most</span> to you?</h1>
      <p class="slide-lead">Tap the things that are important, and we will focus on those first.</p>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-top:1.5rem;">
        ${opts.map(o => `
          <button class="priority-chip${AppState.priorities?.has(o.key) ? ' selected' : ''}" data-priority="${o.key}" onclick="togglePriority('${o.key}')"
            style="background:var(--bg-card);border:2px solid var(--border);border-radius:var(--r-md);padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.2s;">
            <i class="fas ${o.icon}" style="font-size:1.8rem;color:var(--green);margin-bottom:0.65rem;display:block;"></i>
            <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">${o.label}</div>
            <div style="font-size:0.75rem;color:var(--text-soft);">${o.desc}</div>
          </button>`).join('')}
      </div>
      </div>
    </div>
    <!-- RIGHT -->
    <div id="priorities-img" style="border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-md);min-height:440px;">
      <img src="priorities.png" alt="Three Counties home" style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>
  </div>
</div>`;
  },

  /* ============================================================
     HOW WE HELP — tagged sentences + renderer
     ============================================================ */
  howWeHelpSentences: [
    {product:'windows',        priority:'security',    text:'Security-approved locking and hardware from Avantis, VBH and Yale'},
    {product:'windows',        priority:'security',    text:'Our Secure Living Warranty pays you up to \u00a35,000 if approved hardware fails in a break-in'},
    {product:'windows',        priority:'security',    text:'Fully FENSA registered and fitted to standard'},
    {product:'windows',        priority:'thermal',     text:'Low-emissivity glass that cuts heat loss by up to 75 per cent'},
    {product:'windows',        priority:'thermal',     text:'Up to three times the insulation of standard double glazing'},
    {product:'windows',        priority:'thermal',     text:'Eco+ for our warmest, most efficient specification'},
    {product:'windows',        priority:'aesthetics',  text:'A wide range of styles, colours and finishes to suit your home'},
    {product:'windows',        priority:'aesthetics',  text:'Slim, modern frames that let in more light'},
    {product:'windows',        priority:'aesthetics',  text:'Finished to a standard you will be proud to show off'},
    {product:'windows',        priority:'maintenance', text:'Durable frames that stay looking good with a simple wipe down'},
    {product:'windows',        priority:'maintenance', text:'No repainting, no warping, no constant upkeep'},
    {product:'windows',        priority:'maintenance', text:'Quality that lasts, from a family-run local team'},
    {product:'windows',        priority:'resell',      text:'Modern windows that lift kerb appeal and first impressions'},
    {product:'windows',        priority:'resell',      text:'Better efficiency supports a stronger EPC rating'},
    {product:'windows',        priority:'resell',      text:'FENSA registration gives buyers reassurance at sale'},
    {product:'doors',          priority:'security',    text:'High-security multipoint locking and approved hardware from Avantis, VBH and Yale'},
    {product:'doors',          priority:'security',    text:'Our Secure Living Warranty pays you up to \u00a35,000 if approved hardware fails in a break-in'},
    {product:'doors',          priority:'security',    text:'Solid, reinforced construction that stands up to force'},
    {product:'doors',          priority:'thermal',     text:'Insulated, solid-core construction that holds warmth in'},
    {product:'doors',          priority:'thermal',     text:'Weather-tight seals that cut out draughts and cold spots'},
    {product:'doors',          priority:'thermal',     text:'Energy-efficient glazing for light without the heat loss'},
    {product:'doors',          priority:'aesthetics',  text:'A wide choice of styles, from classic to contemporary'},
    {product:'doors',          priority:'aesthetics',  text:'Glazing, hardware and furniture options to match your taste'},
    {product:'doors',          priority:'aesthetics',  text:'Preview your new door on your own home before you commit'},
    {product:'doors',          priority:'maintenance', text:'Hard-wearing finishes that resist fading, warping and weather'},
    {product:'doors',          priority:'maintenance', text:'No repainting or sanding, just an occasional wipe down'},
    {product:'doors',          priority:'maintenance', text:'Quality that lasts, from a family-run local team'},
    {product:'doors',          priority:'resell',      text:'A striking entrance is one of the first things buyers notice'},
    {product:'doors',          priority:'resell',      text:'Better insulation and security are genuine selling points'},
    {product:'doors',          priority:'resell',      text:'FENSA registration gives buyers reassurance at sale'},
    {product:'conservatories', priority:'security',    text:'Security-approved locking and hardware from Avantis, VBH and Yale throughout'},
    {product:'conservatories', priority:'security',    text:'Our Secure Living Warranty pays you up to \u00a35,000 if approved hardware fails in a break-in'},
    {product:'conservatories', priority:'security',    text:'Toughened glass and solid construction for genuine peace of mind'},
    {product:'conservatories', priority:'thermal',     text:'Low-emissivity glass that keeps heat in during winter and out in summer'},
    {product:'conservatories', priority:'thermal',     text:'Insulated roof options that make the space usable all year'},
    {product:'conservatories', priority:'thermal',     text:'Lower running costs than you would expect from a glazed room'},
    {product:'conservatories', priority:'aesthetics',  text:"Designed to complement your home's character, not fight it"},
    {product:'conservatories', priority:'aesthetics',  text:'Floods your living space with natural light'},
    {product:'conservatories', priority:'aesthetics',  text:'A wide choice of styles, frames and finishes to suit the property'},
    {product:'conservatories', priority:'maintenance', text:'Durable, weather-resistant frames that need only a simple clean'},
    {product:'conservatories', priority:'maintenance', text:'Modern glazing that resists grime and stays clear'},
    {product:'conservatories', priority:'maintenance', text:'Quality that lasts, from a family-run local team'},
    {product:'conservatories', priority:'resell',      text:'Adds a genuine, year-round room that buyers value'},
    {product:'conservatories', priority:'resell',      text:'Quality construction and efficient glazing strengthen the appeal'},
    {product:'conservatories', priority:'resell',      text:'A professionally installed, compliant build buyers can trust'}
  ],
  howWeHelpDefault: [
    'Energy-efficient glass that helps lower your bills',
    'Security-approved hardware and our Secure Living Warranty',
    'Quality that lasts, from a family-run local team'
  ],

  renderHowWeHelp() {
    // --- Headline: derive product name(s) ---
    const productOrder = ['windows', 'doors', 'conservatories'];
    const selProducts  = AppState.products
      ? productOrder.filter(p => AppState.products.has(p))
      : [];
    const productLabel = selProducts.length === 0 ? 'windows'
      : selProducts.length === 1 ? selProducts[0]
      : selProducts.length === 2 ? selProducts.join(' & ')
      : `${selProducts[0]}, ${selProducts[1]} & ${selProducts[2]}`;
    const displayMap = { windows: 'windows', doors: 'doors', conservatories: 'conservatory' };
    const selD = selProducts.map(p => displayMap[p]);
    const headlineLabel = selD.length === 0 ? 'windows'
      : selD.length === 1 ? selD[0]
      : selD.length === 2 ? selD.join(' & ')
      : `${selD[0]}, ${selD[1]} & ${selD[2]}`;
    const headline = `The right ${headlineLabel}, <span class="accent">done properly</span>`;

    // --- Sentence selection & ordering ---
    const priorityWeight = ['security', 'thermal', 'resell', 'aesthetics', 'maintenance'];
    const hasProducts    = selProducts.length > 0;
    const hasPriorities  = AppState.priorities && AppState.priorities.size > 0;

    let sentences;
    if (!hasProducts) {
      sentences = Modules.howWeHelpDefault;
    } else {
      const dbRows = AppState.getModuleItems('how_we_help');
      const sourceSentences = (dbRows && dbRows.length)
        ? dbRows.map(r => ({ product: r.meta1, priority: r.meta2, text: r.title }))
        : Modules.howWeHelpSentences;
      const matched = sourceSentences.filter(
        s => AppState.products.has(s.product) && (!hasPriorities || AppState.priorities.has(s.priority))
      );
      if (matched.length === 0) {
        sentences = Modules.howWeHelpDefault;
      } else {
        matched.sort((a, b) => {
          const pw = priorityWeight.indexOf(a.priority) - priorityWeight.indexOf(b.priority);
          if (pw !== 0) return pw;
          return productOrder.indexOf(a.product) - productOrder.indexOf(b.product);
        });
        if (!hasPriorities) {
          // No priorities chosen: show one sentence per priority-group per product
          // (first sentence encountered after sort, so ordering stays canonical)
          const seen = new Set();
          sentences = matched
            .filter(s => {
              const key = s.product + '|' + s.priority;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .map(s => s.text);
        } else {
          sentences = matched.map(s => s.text);
        }
      }
    }

    const pointsHTML = sentences.map(p => `
      <div style="display:flex;align-items:flex-start;gap:1rem;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.1rem 1.25rem;box-shadow:var(--shadow-sm);">
        <i class="fas fa-circle-check" style="color:var(--green);font-size:1.15rem;flex-shrink:0;margin-top:0.1rem;"></i>
        <span style="font-size:0.9rem;line-height:1.6;color:var(--text);">${escHtml(p)}</span>
      </div>`).join('');

    return `
<div class="slide" id="slide-how-we-help" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
  <div class="slide-eyebrow green"><i class="fas fa-hands-helping"></i> How We Help</div>
  <h1 class="slide-h1" style="max-width:760px;">${headline}</h1>
  <p class="slide-lead" style="max-width:620px;margin:0 auto 2rem;">Warmth, security, looks and longevity, all in one.</p>
  <div style="display:flex;flex-direction:column;gap:0.85rem;width:100%;max-width:760px;text-align:left;">
    ${pointsHTML}
  </div>
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
  gallery: [
    {src:'Windows-1.jpg', product:'windows', priority:null},
    {src:'Windows-2.jpg', product:'windows', priority:null},
    {src:'Windows-3.jpg', product:'windows', priority:null},
    {src:'Windows-4.jpg', product:'windows', priority:null},
    {src:'Windows-5.jpg', product:'windows', priority:null},
    {src:'Windows-6.jpg', product:'windows', priority:null},
    {src:'Windows-7.jpg', product:'windows', priority:null},
    {src:'Windows-8.jpg', product:'windows', priority:null},
    {src:'Windows-9.jpg', product:'windows', priority:null},
    {src:'Windows-10.jpg', product:'windows', priority:null},
    {src:'Windows-11.jpg', product:'windows', priority:null},
    {src:'Windows-12.jpg', product:'windows', priority:null},
    {src:'Windows-13.jpg', product:'windows', priority:null},
    {src:'Windows-14.jpg', product:'windows', priority:null},
    {src:'Windows-15.jpg', product:'windows', priority:null},
    {src:'Windows-16.jpg', product:'windows', priority:null},
    {src:'Windows-17.jpg', product:'windows', priority:null},
    {src:'Windows-18.jpg', product:'windows', priority:null},
    {src:'Windows-19.jpg', product:'windows', priority:null},
    {src:'Windows-20.jpg', product:'windows', priority:null},
    {src:'Windows-21.jpg', product:'windows', priority:null},
    {src:'Windows-22.jpg', product:'windows', priority:null},
    {src:'Windows-23.jpg', product:'windows', priority:null},
    {src:'Windows-24.jpg', product:'windows', priority:null},
    {src:'Windows-25.jpg', product:'windows', priority:null},
    {src:'Windows-26.jpg', product:'windows', priority:null},
    {src:'Windows-27.jpg', product:'windows', priority:null},
    {src:'Windows-28.jpg', product:'windows', priority:null},
    {src:'Windows-29.jpg', product:'windows', priority:null},
    {src:'Windows-30.jpg', product:'windows', priority:null},
    {src:'Windows-31.jpg', product:'windows', priority:null},
    {src:'Windows-32.jpg', product:'windows', priority:null},
    {src:'Windows-33.jpg', product:'windows', priority:null},
    {src:'Windows-34.jpg', product:'windows', priority:null},
    {src:'Windows-35.jpg', product:'windows', priority:null},
    {src:'Windows-36.jpg', product:'windows', priority:null},
    {src:'Windows-37.jpg', product:'windows', priority:null},
    {src:'Windows-38.jpg', product:'windows', priority:null},
    {src:'Windows-39.jpg', product:'windows', priority:null},
    {src:'Windows-40.jpg', product:'windows', priority:null},
    {src:'Windows-41.jpg', product:'windows', priority:null},
    {src:'Windows-42.jpg', product:'windows', priority:null},
    {src:'Windows-43.jpg', product:'windows', priority:null},
    {src:'Windows-44.jpg', product:'windows', priority:null},
    {src:'Windows-45.jpg', product:'windows', priority:null},
    {src:'Windows-46.jpg', product:'windows', priority:null},
    {src:'Windows-47.jpg', product:'windows', priority:null},
    {src:'Windows-48.jpg', product:'windows', priority:null},
    {src:'Windows-49.jpg', product:'windows', priority:null},
    {src:'Windows-50.jpg', product:'windows', priority:null},
    {src:'Windows-51.jpg', product:'windows', priority:null},
    {src:'Windows-52.jpg', product:'windows', priority:null},
    {src:'Windows-53.jpg', product:'windows', priority:null},
    {src:'Doors-1.jpg', product:'doors', priority:null},
    {src:'Doors-2.jpg', product:'doors', priority:null},
    {src:'Doors-3.jpg', product:'doors', priority:null},
    {src:'Doors-4.jpg', product:'doors', priority:null},
    {src:'Doors-5.jpg', product:'doors', priority:null},
    {src:'Doors-6.jpg', product:'doors', priority:null},
    {src:'Doors-7.jpg', product:'doors', priority:null},
    {src:'Doors-8.jpg', product:'doors', priority:null},
    {src:'Doors-9.jpg', product:'doors', priority:null},
    {src:'Doors-10.jpg', product:'doors', priority:null},
    {src:'Doors-11.jpg', product:'doors', priority:null},
    {src:'Doors-12.jpg', product:'doors', priority:null},
    {src:'Doors-13.jpg', product:'doors', priority:null},
    {src:'Doors-14.jpg', product:'doors', priority:null},
    {src:'Doors-15.jpg', product:'doors', priority:null},
    {src:'Doors-16.jpg', product:'doors', priority:null},
    {src:'Doors-17.jpg', product:'doors', priority:null},
    {src:'Doors-18.jpg', product:'doors', priority:null},
    {src:'Doors-19.jpg', product:'doors', priority:null},
    {src:'Doors-20.jpg', product:'doors', priority:null},
    {src:'Doors-21.jpg', product:'doors', priority:null},
    {src:'Doors-22.jpg', product:'doors', priority:null},
    {src:'Doors-23.jpg', product:'doors', priority:null},
    {src:'Doors-24.jpg', product:'doors', priority:null},
    {src:'Doors-25.jpg', product:'doors', priority:null},
    {src:'Doors-26.jpg', product:'doors', priority:null},
    {src:'Doors-27.jpg', product:'doors', priority:null},
    {src:'Doors-28.jpg', product:'doors', priority:null},
    {src:'Doors-29.jpg', product:'doors', priority:null},
    {src:'Doors-30.jpg', product:'doors', priority:null},
    {src:'Doors-31.jpg', product:'doors', priority:null},
    {src:'Conservatory-1.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-2.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-3.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-4.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-5.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-6.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-7.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-8.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-9.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-10.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-11.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-12.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-13.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-14.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-15.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-16.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-17.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-18.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-19.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-20.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-21.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-22.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-23.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-24.jpg', product:'conservatories', priority:null},
    {src:'Conservatory-25.jpg', product:'conservatories', priority:null}
  ],
  _galleryVisible: [],

  renderGallery() {
    // Hard-filter by product
    const hasProducts = AppState.products && AppState.products.size > 0;
    let visible = hasProducts
      ? Modules.gallery.filter(item => AppState.products.has(item.product))
      : Modules.gallery.slice();
    if (visible.length === 0) visible = Modules.gallery.slice();

    // Soft-order by priority (items with a matching priority float to front)
    const hasPriorities = AppState.priorities && AppState.priorities.size > 0;
    if (hasPriorities) {
      const pri = [], rest = [];
      visible.forEach(item => {
        (item.priority && AppState.priorities.has(item.priority) ? pri : rest).push(item);
      });
      visible = [...pri, ...rest];
    }

    Modules._galleryVisible = visible;

    const tilesHTML = visible.map((item, i) => `
      <div onclick="Modules.openLightbox(${i})"
        style="cursor:pointer;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-sm);
               aspect-ratio:4/3;transition:transform 0.18s;background:var(--bg-card);"
        onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='scale(1)'">
        <img src="${item.src}" alt="Three Counties installation ${i + 1}" loading="lazy" decoding="async"
          style="width:100%;height:100%;object-fit:cover;display:block;">
      </div>`).join('');
    return `
<div class="slide" id="slide-gallery">
  <div class="slide-eyebrow green"><i class="fas fa-images"></i> Our Work</div>
  <h1 class="slide-h1">See what's <span class="accent">possible</span></h1>
  <p class="slide-lead">Real homes, real installs, right across Surrey, Hampshire and Berkshire.</p>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;">
    ${tilesHTML}
  </div>
  <div id="gallery-lightbox"
    style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:1000;
           align-items:center;justify-content:center;"
    onclick="Modules.closeLightbox()">
    <img id="lightbox-img" src="" alt="Gallery image"
      style="max-width:92vw;max-height:90vh;border-radius:var(--r-md);box-shadow:var(--shadow-md);display:block;">
  </div>
</div>`;
  },

  openLightbox(idx) {
    const item = Modules._galleryVisible[idx];
    if (!item) return;
    const src = item.src;
    const lb = document.getElementById('gallery-lightbox');
    const img = document.getElementById('lightbox-img');
    if (lb && img) {
      img.src = src;
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
    <div style="margin-top:1.25rem;display:flex;gap:1.25rem;justify-content:center;align-items:center;flex-wrap:wrap;">
      <span style="background:#fff;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:center;height:66px;width:155px;"><img src="fensa-logo.jpg" alt="FENSA Registered" style="max-height:50px;max-width:135px;width:auto;object-fit:contain;"></span>
      <span style="background:#fff;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:center;height:66px;width:155px;"><img src="ggf-logo.jpg" alt="GGF Member" style="max-height:50px;max-width:135px;width:auto;object-fit:contain;"></span>
      <span style="background:#fff;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:center;height:66px;width:155px;"><img src="uktsa-surrey.webp" alt="Surrey Trading Standards Approved" style="max-height:50px;max-width:135px;width:auto;object-fit:contain;"></span>
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
          <a href="https://www.checkatrade.com/trades/threecountiesconservatorieswindowsdoors1075774" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
            <div style="height:38px;display:flex;align-items:center;justify-content:center;margin:0 auto 0.6rem;"><img src="check-a-trade.png" alt="Checkatrade" style="max-height:28px;max-width:150px;width:auto;object-fit:contain;"></div>
            <div style="font-weight:800;font-size:1.5rem;color:var(--green);margin-bottom:0.25rem;">9.8/10</div>
            <div style="font-size:0.72rem;font-weight:700;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.4px;">Checkatrade</div>
            <div style="font-size:0.78rem;color:var(--text-soft);margin-top:0.25rem;">1,500+ reviews</div>
            <div style="color:#f59e0b;font-size:0.9rem;margin-top:0.35rem;">★★★★★</div>
          </a>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;text-align:center;box-shadow:var(--shadow-sm);">
          <a href="https://www.trustpilot.com/review/threecountiesltd.co.uk" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
            <div style="height:38px;display:flex;align-items:center;justify-content:center;margin:0 auto 0.6rem;"><img src="trustpilot-logo.png" alt="Trustpilot" style="max-height:36px;max-width:150px;width:auto;object-fit:contain;"></div>
            <div style="font-weight:800;font-size:1.5rem;color:var(--green);margin-bottom:0.25rem;">5/5</div>
            <div style="font-size:0.72rem;font-weight:700;color:var(--text-soft);text-transform:uppercase;letter-spacing:0.4px;">Trustpilot</div>
            <div style="font-size:0.78rem;color:var(--text-soft);margin-top:0.25rem;">116 reviews</div>
            <div style="color:#f59e0b;font-size:0.9rem;margin-top:0.35rem;">★★★★★</div>
          </a>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;text-align:center;box-shadow:var(--shadow-sm);">
          <a href="https://www.google.com/search?q=Three+Counties+Conservatories+Windows+Doors+Camberley+reviews" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
            <div style="height:38px;display:flex;align-items:center;justify-content:center;margin:0 auto 0.6rem;"><img src="Google-review-logo.png" alt="Google Reviews" style="max-height:34px;max-width:150px;width:auto;object-fit:contain;"></div>
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
    <a href="https://www.checkatrade.com/trades/threecountiesconservatorieswindowsdoors1075774" target="_blank" rel="noopener" class="btn-secondary" style="font-size:0.82rem;"><i class="fas fa-star"></i> View All Checkatrade Reviews</a>
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
  <div style="position:relative;width:100%;height:520px;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-md);">
    <iframe src="${mapUrl}" title="Installs Near You" style="width:100%;height:100%;border:0;display:block;" allowfullscreen></iframe>
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
  <style>@media(max-width:720px){#secure-payouts{grid-template-columns:repeat(2,1fr)!important;}}</style>
  <div id="secure-payouts" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-bottom:1.5rem;">${payoutCards}</div>
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
  <style>
  .fin-modes{display:inline-flex;background:#e7e7dd;border-radius:999px;padding:5px;margin-bottom:1.5rem}
  .fin-modes button{border:0;background:transparent;font:inherit;font-weight:700;font-size:0.9rem;padding:0.65rem 1.5rem;border-radius:999px;cursor:pointer;color:#6b7268;transition:all .18s}
  .fin-modes button.on{background:#2f6b2f;color:#fff;box-shadow:0 2px 8px rgba(47,107,47,.35)}
  .fin-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:1.5rem;align-items:start}
  @media(max-width:900px){.fin-grid{grid-template-columns:1fr}}
  .fin-panel{background:#fff;border-radius:16px;box-shadow:0 6px 18px rgba(40,60,35,.08);padding:1.75rem}
  .fin-fldrow{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem;margin-bottom:1.5rem}
  @media(max-width:560px){.fin-fldrow{grid-template-columns:1fr}}
  .fin-lbl{display:block;font-weight:700;font-size:0.9rem;margin:0 0 0.5rem}
  .fin-iw{position:relative}
  .fin-iw .sym{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#6b7268;font-size:0.85rem}
  .fin-in{width:100%;font:inherit;font-size:1.05rem;font-weight:600;padding:0.85rem 2rem 0.85rem 1rem;border:1.5px solid #e3e3da;border-radius:12px;background:#fbfbf7;outline:none;transition:border .15s}
  .fin-in:focus{border-color:#2f6b2f}
  .fin-sect{font-weight:700;font-size:0.9rem;margin:0.25rem 0 0.75rem}
  .fin-prods{display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1.5rem}
  @media(max-width:680px){.fin-prods{grid-template-columns:1fr}}
  .fin-prod{position:relative;text-align:left;border:2px solid #e3e3da;border-radius:14px;background:#fff;padding:1rem 1rem 0.85rem;cursor:pointer;font:inherit;transition:border .15s,background .15s}
  .fin-prod:hover{border-color:#bccdb2}
  .fin-prod.on{border-color:#2f6b2f;background:#e9f0e2}
  .fin-nm{font-weight:800;font-size:1rem;display:flex;align-items:center;gap:0.5rem}
  .fin-dot{width:16px;height:16px;border-radius:50%;border:2px solid #b9b9ac;flex:0 0 16px;position:relative}
  .fin-prod.on .fin-dot,.fin-opt.on .fin-dot{border-color:#2f6b2f}
  .fin-prod.on .fin-dot::after,.fin-opt.on .fin-dot::after{content:"";position:absolute;inset:3px;border-radius:50%;background:#2f6b2f}
  .fin-ds{color:#6b7268;font-size:0.85rem;margin:0.4rem 0 0.15rem}
  .fin-apr{font-size:0.82rem;font-weight:700;color:#2f6b2f}
  .fin-badge{position:absolute;top:-11px;right:12px;background:#7cab54;color:#fff;font-size:0.68rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:0.25rem 0.6rem;border-radius:999px}
  .fin-opts{display:flex;flex-direction:column;gap:0.75rem}
  .fin-opt{text-align:left;border:2px solid #e3e3da;border-radius:14px;background:#fff;padding:1rem 1.1rem;cursor:pointer;font:inherit;display:flex;gap:0.9rem;align-items:flex-start;transition:border .15s,background .15s}
  .fin-opt:hover{border-color:#bccdb2}
  .fin-opt.on{border-color:#2f6b2f;background:#e9f0e2}
  .fin-opt .fin-dot{margin-top:3px}
  .fin-amt{font-weight:800;font-size:1.1rem;color:#2c4a28}
  .fin-tm{font-size:0.9rem;color:#1e2420;margin-top:2px}
  .fin-sub{font-size:0.82rem;color:#6b7268;margin-top:2px}
  .fin-note{background:#eaf2e3;border-radius:12px;padding:0.9rem 1rem;font-size:0.88rem;color:#2c4a28;margin-bottom:0.9rem;line-height:1.5}
  .fin-note b{font-weight:800}
  .fin-summary{background:#3a5f34;color:#fff;border-radius:16px;box-shadow:0 6px 18px rgba(40,60,35,.08);padding:1.75rem}
  .fin-summary h3{font-size:0.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#cfe0c4;margin-bottom:1.1rem}
  .fin-srow{display:flex;justify-content:space-between;padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,.12);font-size:0.9rem}
  .fin-srow .k{color:#d9e6d0}.fin-srow .v{font-weight:700}
  .fin-srow.big{border-bottom:0;padding-top:1rem}.fin-srow.big .v{font-size:1.8rem;font-weight:800}
  .fin-ph{color:#c4d6b8;font-size:0.9rem;line-height:1.6}
  .fin-aff-wrap{display:flex;flex-direction:column;gap:0.75rem;margin-top:0.4rem}
  .fin-aff{border:2px solid #e3e3da;border-radius:14px;padding:1rem 1.1rem;background:#fff;display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap}
  .fin-aff .l .p{font-weight:800;font-size:1rem}.fin-aff .l .t{font-size:0.85rem;color:#6b7268;margin-top:2px}
  .fin-aff .r{text-align:right}.fin-aff .r .v{font-weight:800;font-size:1.35rem;color:#2f6b2f}.fin-aff .r .lb{font-size:0.72rem;color:#6b7268}
  .fin-aff.best{border-color:#2f6b2f;background:#e9f0e2}
  .fin-hide{display:none}
  </style>
  <div class="fin-modes">
    <button id="fin-mode-fwd" class="on" onclick="Modules.finSetMode('fwd')">Monthly figure</button>
    <button id="fin-mode-rev" onclick="Modules.finSetMode('rev')">What can I afford?</button>
  </div>
  <div id="fin-view-fwd">
    <div class="fin-grid">
      <div class="fin-panel">
        <div class="fin-fldrow">
          <div><label class="fin-lbl" for="fin-total">Project Total (£)</label><div class="fin-iw"><input type="number" id="fin-total" class="fin-in" value="${parseFloat(AppState.getSettingStr('finance.default_total','5000'))||5000}" min="${Modules._finMinTotal()}" max="${Modules._finMaxTotal()}" step="100" oninput="Modules.finRecalc()"><span class="sym">£</span></div></div>
          <div><label class="fin-lbl" for="fin-deposit">Deposit (£)</label><div class="fin-iw"><input type="number" id="fin-deposit" class="fin-in" value="0" min="0" step="100" oninput="Modules.finRecalc()"><span class="sym">£</span></div></div>
        </div>
        <div class="fin-sect">Finance product</div>
        <div class="fin-prods" id="fin-prods">${Modules._finProductsHTML()}</div>
        <div id="fin-bnpl-note" class="fin-note${Modules._fin.product==='bnpl'?'':' fin-hide'}"><b>How Buy Now Pay Later works:</b> nothing to pay for ${Modules._finDeferral()} months. Settle in full within the deferral period and you pay only the cash price plus a ${Modules._finGbp0(Modules._finFee())} fee, with no interest. If you let it run, it converts to monthly repayments at ${Modules._finProducts().find(p=>p.id==='bnpl').aprLb}.</div>
        <div class="fin-sect">Repayment options</div>
        <div class="fin-opts" id="fin-opts">${Modules._finOptsHTML()}</div>
      </div>
      <div class="fin-summary"><h3>Loan illustration</h3><div id="fin-sbody">${Modules._finSummaryHTML()}</div></div>
    </div>
  </div>
  <div id="fin-view-rev" class="fin-hide">
    <div class="fin-grid">
      <div class="fin-panel">
        <label class="fin-lbl" for="fin-budget">What monthly payment feels comfortable? (£)</label>
        <div class="fin-iw" style="max-width:320px"><input type="number" id="fin-budget" class="fin-in" value="150" min="20" max="5000" step="10" oninput="Modules.finRecalcRev()"><span class="sym">£/mo</span></div>
        <p style="color:#6b7268;font-size:0.88rem;margin:0.6rem 0 1.4rem">We will show you the size of project that budget could support on each finance option.</p>
        <div class="fin-sect">Your budget could fund…</div>
        <div class="fin-aff-wrap" id="fin-affres">${Modules._finAffHTML()}</div>
      </div>
      <div class="fin-summary"><h3>Why this way round?</h3><p class="fin-ph" style="color:#e2eeda">Most people think in monthly budgets, not project totals. Start from what feels comfortable each month, and we will show what is possible — often more than you would expect, especially on interest-free credit with the Eco+ range.</p></div>
    </div>
  </div>
  <div class="calc-disclaimer"><i class="fas fa-circle-info"></i><span>${escHtml(disclaimer)} ${escHtml(fcaLine)}</span></div>
</div>`;
  },

  _fin:{product:'bnpl',term:null,mode:'fwd'},
  _finProducts(){const g=(k,d)=>AppState.getSettingStr(k,d);return[{id:'bnpl',nm:'BNPL',ds:'Buy now pay later',apr:parseFloat(g('finance.bnpl_apr','0.199')),aprLb:g('finance.bnpl_apr_label','19.9% APR'),badge:null},{id:'ifc',nm:'IFC',ds:'Interest free credit',apr:parseFloat(g('finance.ifc_apr','0')),aprLb:g('finance.ifc_apr_label','0% APR'),badge:'Eco+ only'},{id:'ibc',nm:'IBC',ds:'Interest bearing credit',apr:parseFloat(g('finance.ibc_apr','0.129')),aprLb:g('finance.ibc_apr_label','12.9% APR'),badge:null}];},
  _finTerms(){const g=(k,d)=>AppState.getSettingStr(k,d);const parse=s=>String(s).split(',').map(x=>parseInt(x.trim(),10)).filter(Boolean);return{ifc:parse(g('finance.ifc_terms','24,36,48,60')),ibc:parse(g('finance.ibc_terms','36,48,60,120')),bnpl:[60]};},
  _finFee(){return parseFloat(AppState.getSettingStr('finance.bnpl_fee','29'))||29;},
  _finDeferral(){return parseInt(AppState.getSettingStr('finance.bnpl_deferral','12'),10)||12;},
  _finMinTotal(){return parseFloat(AppState.getSettingStr('finance.min_total','500'))||500;},
  _finMaxTotal(){return parseFloat(AppState.getSettingStr('finance.max_total','100000'))||100000;},
  _finEffR(apr){return Math.pow(1+apr,1/12)-1;},
  _finPay(P,n,apr){return apr===0?P/n:P*Modules._finEffR(apr)/(1-Math.pow(1+Modules._finEffR(apr),-n));},
  _finRev(M,n,apr){return apr===0?M*n:M*(1-Math.pow(1+Modules._finEffR(apr),-n))/Modules._finEffR(apr);},
  _finGbp(v){return '£'+Number(v).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});},
  _finGbp0(v){return '£'+Math.round(v).toLocaleString('en-GB');},
  _finBorrowed(){const te=document.getElementById('fin-total'),de=document.getElementById('fin-deposit');let t=te?Math.max(0,parseFloat(te.value)||0):(parseFloat(AppState.getSettingStr('finance.default_total','5000'))||5000);t=Math.min(Modules._finMaxTotal(),Math.max(Modules._finMinTotal(),t));const d=Math.min(t,Math.max(0,parseFloat(de?de.value:'0')||0));return{t,d,P:t-d};},
  _finBudget(){const e=document.getElementById('fin-budget');return e?Math.max(0,parseFloat(e.value)||0):(parseFloat(AppState.getSettingStr('finance.default_budget','150'))||150);},
  _finOptionData(){const {P}=Modules._finBorrowed();const prod=Modules._finProducts().find(p=>p.id===Modules._fin.product);const fee=Modules._finFee();if(Modules._fin.product==='bnpl'){const settle=P+fee,P2=P*(1+prod.apr),m=Modules._finPay(P2,60,prod.apr);return[{key:'settle',amt:Modules._finGbp(settle)+' total',tm:`Settle within ${Modules._finDeferral()} months`,sub:`No interest. Cash price plus ${Modules._finGbp0(fee)} settlement fee.`,n:Modules._finDeferral(),monthly:null,total:settle,interest:fee,defer:true},{key:'run',amt:Modules._finGbp(m)+'/month',tm:'60 months after deferral',sub:`Repay ${Modules._finGbp(m*60)} inc. ${Modules._finGbp(m*60-P)} interest (illustrative)`,n:60,monthly:m,total:m*60,interest:m*60-P,defer:true}];}return Modules._finTerms()[Modules._fin.product].map(n=>{const m=Modules._finPay(P,n,prod.apr),tot=m*n,int=tot-P;return{key:String(n),amt:Modules._finGbp(m)+'/month',tm:n+' months',sub:prod.apr===0?`Repay ${Modules._finGbp(tot)} interest free`:`Repay ${Modules._finGbp(tot)} inc. ${Modules._finGbp(int)} interest`,n,monthly:m,total:tot,interest:int,defer:false};});},
  _finProductsHTML(){return Modules._finProducts().map(p=>`<button class="fin-prod ${Modules._fin.product===p.id?'on':''}" onclick="Modules.finPick('${p.id}')">${p.badge?`<span class="fin-badge">${p.badge}</span>`:''}<span class="fin-nm"><span class="fin-dot"></span>${p.nm}</span><div class="fin-ds">${p.ds}</div><div class="fin-apr">${p.aprLb}</div></button>`).join('');},
  _finOptsHTML(){const data=Modules._finOptionData();if(!data.find(o=>o.key===Modules._fin.term))Modules._fin.term=null;return data.map(o=>`<button class="fin-opt ${Modules._fin.term===o.key?'on':''}" onclick="Modules.finPickTerm('${o.key}')"><span class="fin-dot"></span><span><div class="fin-amt">${o.amt}</div><div class="fin-tm">${o.tm}</div><div class="fin-sub">${o.sub}</div></span></button>`).join('');},
  _finSummaryHTML(){const data=Modules._finOptionData();const o=data.find(x=>x.key===Modules._fin.term);const {t,d,P}=Modules._finBorrowed();const prod=Modules._finProducts().find(p=>p.id===Modules._fin.product);if(!o)return '<p class="fin-ph">Choose a repayment option to see your illustration.</p>';return `<div class="fin-srow"><span class="k">Total cost</span><span class="v">${Modules._finGbp(t)}</span></div><div class="fin-srow"><span class="k">Deposit</span><span class="v">${Modules._finGbp(d)}</span></div><div class="fin-srow"><span class="k">Amount borrowed</span><span class="v">${Modules._finGbp(P)}</span></div>${o.defer?`<div class="fin-srow"><span class="k">Deferred for</span><span class="v">${Modules._finDeferral()} months</span></div>`:''}<div class="fin-srow"><span class="k">Repaid over</span><span class="v">${o.monthly?o.n+' months':'within 12 months'}</span></div><div class="fin-srow"><span class="k">Representative APR</span><span class="v">${prod.aprLb}${o.key==='settle'?' (0% if settled)':''}</span></div><div class="fin-srow"><span class="k">Interest / fees</span><span class="v">${Modules._finGbp(o.interest)}</span></div><div class="fin-srow"><span class="k">Total payable</span><span class="v">${Modules._finGbp(o.total)}</span></div><div class="fin-srow big"><span class="k">${o.monthly?'Monthly repayment':'One-off settlement'}</span><span class="v">${o.monthly?Modules._finGbp(o.monthly):Modules._finGbp(o.total)}</span></div>`;},
  _finAffHTML(){const M=Modules._finBudget();const T=Modules._finTerms();const prods=Modules._finProducts();const ifc=prods.find(p=>p.id==='ifc'),ibc=prods.find(p=>p.id==='ibc');const rows=[];T.ifc.forEach(n=>rows.push({p:'Interest Free Credit',badge:'Eco+ only · '+ifc.aprLb,t:n,v:Modules._finRev(M,n,ifc.apr),best:n===60}));T.ibc.forEach(n=>rows.push({p:'Interest Bearing Credit',badge:ibc.aprLb,t:n,v:Modules._finRev(M,n,ibc.apr),best:false}));return rows.map(r=>`<div class="fin-aff ${r.best?'best':''}"><div class="l"><div class="p">${r.p} · ${r.t} months</div><div class="t">${r.badge}</div></div><div class="r"><div class="v">${Modules._finGbp0(r.v)}</div><div class="lb">project total</div></div></div>`).join('');},
  finPick(id){Modules._fin.product=id;Modules._fin.term=null;const p=document.getElementById('fin-prods');if(p)p.innerHTML=Modules._finProductsHTML();const note=document.getElementById('fin-bnpl-note');if(note)note.classList.toggle('fin-hide',id!=='bnpl');Modules.finRecalc();},
  finPickTerm(k){Modules._fin.term=k;Modules.finRecalc();},
  finRecalc(){const o=document.getElementById('fin-opts');if(o)o.innerHTML=Modules._finOptsHTML();const s=document.getElementById('fin-sbody');if(s)s.innerHTML=Modules._finSummaryHTML();},
  finRecalcRev(){const a=document.getElementById('fin-affres');if(a)a.innerHTML=Modules._finAffHTML();},
  finSetMode(m){Modules._fin.mode=m;const f=document.getElementById('fin-mode-fwd'),r=document.getElementById('fin-mode-rev'),vf=document.getElementById('fin-view-fwd'),vr=document.getElementById('fin-view-rev');if(f)f.classList.toggle('on',m==='fwd');if(r)r.classList.toggle('on',m==='rev');if(vf)vf.classList.toggle('fin-hide',m!=='fwd');if(vr)vr.classList.toggle('fin-hide',m!=='rev');},

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
  <div style="margin-top:1.75rem;display:flex;gap:1.25rem;justify-content:center;align-items:center;flex-wrap:wrap;">
    <span style="background:#fff;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);height:72px;width:170px;"><img src="fensa-logo.jpg" alt="FENSA Registered" style="max-height:56px;max-width:150px;width:auto;object-fit:contain;"></span>
    <span style="background:#fff;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);height:72px;width:170px;"><img src="ggf-logo.jpg" alt="GGF Member" style="max-height:56px;max-width:150px;width:auto;object-fit:contain;"></span>
    <span style="background:#fff;border-radius:10px;padding:10px 16px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);height:72px;width:170px;"><img src="uktsa-surrey.webp" alt="Surrey Trading Standards Approved" style="max-height:56px;max-width:150px;width:auto;object-fit:contain;"></span>
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
      case 'how_we_help':     return Modules.renderHowWeHelp();
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
