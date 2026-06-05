# Three Counties Solar — Sales Navigator

A guided consultation and sales presentation tool for Three Counties Solar advisors. Enables reps to build a personalised slide deck, run it live with a customer, and share quotes and proposals.

---

## 🚀 Entry Point

| Path | Description |
|------|-------------|
| `index.html` | Main app — home screen, deck builder, presentation runner, proof hub, admin panel |

---

## ✅ Completed Features

- **Home Screen** — Quick-action cards to start a new deck, open a saved deck, view the proof hub, or access admin
- **Deck Builder** — Choose and order modules to build a custom presentation
- **Presentation Runner** — Full-screen slide-by-slide presentation mode
- **Customer Proof Hub** — Reviews, credentials, and accreditation badges
- **Admin Panel** — Password-protected panel to edit content and settings
- **Calculator** — Solar savings/ROI calculator embedded in the flow
- **Data Layer** — Product, pricing, and module data in `data.js`

---

## 📁 File Structure

```
index.html              — Main single-page application shell
style.css               — All styles (68 KB)
app.js                  — Core app controller & navigation (35 KB)
modules.js              — Slide/module content definitions (44 KB)
admin.js                — Admin panel logic (48 KB)
builder.js              — Deck builder logic (10 KB)
presentation.js         — Presentation runner (17 KB)
calculator.js           — Solar ROI calculator (5 KB)
data.js                 — Product & pricing data (15 KB)

── Images ──
logo.png                — Three Counties Solar logo (PNG)
logo.jpg                — Three Counties Solar logo (JPG)
MCS-LOGO.png            — MCS accreditation logo
NAPIT.png               — NAPIT accreditation logo
NIC-EIC-.png            — NIC EIC accreditation logo
RECC-LOGO.png           — RECC accreditation logo
TrustMark-Logo.png      — TrustMark accreditation logo
ev-charging.jpg         — EV charging hero image
moving-house.jpg        — Moving house scenario image
solar-house.jpg         — Solar house hero image
timeline.jpg            — Installation timeline image
schematic-animated-new.gif — Animated solar schematic
```

---

## 🛠️ Tech Stack

- Vanilla HTML5 / CSS3 / JavaScript (no framework)
- Google Fonts — Inter
- Font Awesome 6 (CDN)
- LocalStorage for saving decks client-side

---

## 📋 Source Repository

Fetched from: [https://github.com/KhushalAlam/three-counties-windows-app](https://github.com/KhushalAlam/three-counties-windows-app)

---

## 💡 Recommended Next Steps

- Connect admin content edits to persistent storage (currently localStorage only)
- Add PDF/email export of customer proposals
- Integrate a live quote API for real-time pricing
- Add customer-facing shareable quote URL
