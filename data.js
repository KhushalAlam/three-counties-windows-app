/* ============================================================
   DATA LAYER — Supabase REST API (PostgREST) + Auth
   Project : https://oakzkikvdskadksochdp.supabase.co
   ============================================================ */

/* ---------- Supabase connection config ---------- */
const SUPABASE_URL = 'https://oakzkikvdskadksochdp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WPly-6PBOUSPvXljBhxyUg_ldQ7fudb';

/* ---------- Supabase JS client (auth + storage session) ---------- */
// supabase-js v2 UMD bundle exposes window.supabase.createClient
// We use SupabaseClient as the variable name to avoid clashing with window.supabase
const SupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Dynamic REST headers (picks up auth token when signed in) ---------- */
// Call sbHeaders() at request time so the Bearer token is always fresh
function sbHeaders(extra) {
  const token = AppState.adminAccessToken || SUPABASE_KEY;
  return {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${token}`,
    ...(extra || {})
  };
}

/* ============================================================
   TOKEN REFRESH
   Supabase access_tokens expire after 1 hour. If a write
   request returns 401 we call this once to swap the stored
   refresh_token for a fresh access_token, then retry.
   ============================================================ */
async function refreshAdminToken() {
  if (!AppState.adminRefreshToken) return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body:    JSON.stringify({ refresh_token: AppState.adminRefreshToken })
      }
    );
    if (!res.ok) return false;
    const json = await res.json();
    if (!json.access_token) return false;
    AppState.adminAccessToken  = json.access_token;
    AppState.adminRefreshToken = json.refresh_token || AppState.adminRefreshToken;
    return true;
  } catch (e) {
    console.warn('refreshAdminToken error', e);
    return false;
  }
}

/* ============================================================
   API — all methods return plain objects/arrays (never null
   on success). Supabase PostgREST returns arrays by default;
   single-row endpoints use Prefer: return=representation
   so we always get the saved object back.
   ============================================================ */
const API = {

  /* ---- SETTINGS ---- */

  async getSettings() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/settings?select=*&order=setting_key.asc&limit=100`,
        { headers: sbHeaders() }
      );
      if (!res.ok) { console.error('getSettings HTTP', res.status); return {}; }
      const rows = await res.json();            // plain array from Supabase
      const map  = {};
      (rows || []).forEach(s => { map[s.setting_key] = s; });
      return map;
    } catch (e) { console.error('getSettings error', e); return {}; }
  },

  async saveSetting(recordId, value) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/settings?id=eq.${encodeURIComponent(recordId)}`,
        {
          method:  'PATCH',
          headers: sbHeaders({ 'Prefer': 'return=representation' }),
          body:    JSON.stringify({ setting_value: String(value) })
        }
      );
      if (!res.ok) { console.error('saveSetting HTTP', res.status); return null; }
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { console.error('saveSetting error', e); return null; }
  },

  /* ---- CONTENT ITEMS ---- */

  async getContentItems(moduleId) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/content_items?select=*&order=sort_order.asc&limit=200`;
      if (moduleId) url += `&module_id=eq.${encodeURIComponent(moduleId)}`;
      const res = await fetch(url, { headers: sbHeaders() });
      if (!res.ok) { console.error('getContentItems HTTP', res.status); return []; }
      const rows = await res.json();
      return (rows || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (e) { console.error('getContentItems error', e); return []; }
  },

  async getAllContentItems() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/content_items?select=*&order=sort_order.asc&limit=500`,
        { headers: sbHeaders() }
      );
      if (!res.ok) { console.error('getAllContentItems HTTP', res.status); return []; }
      const rows = await res.json();
      return (rows || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (e) { console.error('getAllContentItems error', e); return []; }
  },

  async saveContentItem(item) {
    try {
      const isNew = !item.id || item._isNew;
      const payload = { ...item };
      delete payload._isNew;
      // Always strip id from the payload when inserting — Supabase generates it.
      // Do this on payload itself (not just a local copy inside doFetch) so
      // JSON.stringify can never receive id: null and violate the not-null constraint.
      if (isNew) delete payload.id;

      const doFetch = () => {
        if (isNew) {
          return fetch(
            `${SUPABASE_URL}/rest/v1/content_items`,
            { method: 'POST', headers: sbHeaders({ 'Prefer': 'return=representation' }), body: JSON.stringify(payload) }
          );
        }
        return fetch(
          `${SUPABASE_URL}/rest/v1/content_items?id=eq.${encodeURIComponent(item.id)}`,
          { method: 'PATCH', headers: sbHeaders({ 'Prefer': 'return=representation' }), body: JSON.stringify(payload) }
        );
      };

      let res = await doFetch();

      // If 401 (expired token), refresh once and retry
      if (res.status === 401) {
        const refreshed = await refreshAdminToken();
        if (refreshed) res = await doFetch();
      }

      if (!res.ok) { console.error('saveContentItem HTTP', res.status, await res.text()); return null; }
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { console.error('saveContentItem error', e); return null; }
  },

  async deleteContentItem(id) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/content_items?id=eq.${encodeURIComponent(id)}`,
        { method: 'DELETE', headers: sbHeaders() }
      );
      return res.ok;
    } catch (e) { console.error('deleteContentItem error', e); return false; }
  },

  /* ---- DECKS ---- */

  async getDecks() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/decks?select=*&order=created_at.asc&limit=200&is_archived=eq.false`,
        { headers: sbHeaders() }
      );
      if (!res.ok) { console.error('getDecks HTTP', res.status); return []; }
      const rows = await res.json();
      return rows || [];
    } catch (e) { console.error('getDecks error', e); return []; }
  },

  async getDeck(id) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/decks?id=eq.${encodeURIComponent(id)}&select=*`,
        { headers: sbHeaders() }
      );
      if (!res.ok) { console.error('getDeck HTTP', res.status); return null; }
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { console.error('getDeck error', e); return null; }
  },

  async saveDeck(deck) {
    try {
      const isNew  = !deck.id;
      const payload = { ...deck };

      // Supabase stores modules_selected as jsonb — ensure it's an array not a string
      if (typeof payload.modules_selected === 'string') {
        try { payload.modules_selected = JSON.parse(payload.modules_selected); } catch (_) {}
      }

      let res;
      if (isNew) {
        delete payload.id;
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/decks`,
          {
            method:  'POST',
            headers: sbHeaders({ 'Prefer': 'return=representation' }),
            body:    JSON.stringify(payload)
          }
        );
      } else {
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/decks?id=eq.${encodeURIComponent(deck.id)}`,
          {
            method:  'PATCH',
            headers: sbHeaders({ 'Prefer': 'return=representation' }),
            body:    JSON.stringify(payload)
          }
        );
      }
      if (!res.ok) { console.error('saveDeck HTTP', res.status, await res.text()); return null; }
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { console.error('saveDeck error', e); return null; }
  },

  async hardDeleteDeck(id) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/decks?id=eq.${encodeURIComponent(id)}`,
        { method: 'DELETE', headers: sbHeaders() }
      );
      return res.ok;
    } catch (e) { console.error('hardDeleteDeck error', e); return false; }
  },

  async archiveDeck(id) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/decks?id=eq.${encodeURIComponent(id)}`,
        {
          method:  'PATCH',
          headers: sbHeaders({ 'Prefer': 'return=representation' }),
          body:    JSON.stringify({ is_archived: true })
        }
      );
      if (!res.ok) { console.error('archiveDeck HTTP', res.status); return null; }
      const rows = await res.json();
      return rows[0] || null;
    } catch (e) { console.error('archiveDeck error', e); return null; }
  },

  /* ---- HOUSEKEEPING ---- */

  // Hard-delete any deck whose created_at is older than 90 days.
  // Runs silently on app init — no UI, no toast, no error surfacing.
  async deleteOldDecks() {
    try {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      // PostgREST filter: created_at < cutoff (ISO 8601 string)
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/decks?created_at=lt.${encodeURIComponent(cutoff)}`,
        { method: 'DELETE', headers: sbHeaders() }
      );
      // 204 No Content is the expected success response for DELETE
      if (!res.ok && res.status !== 204) {
        console.warn('deleteOldDecks HTTP', res.status);
      }
    } catch (e) {
      // Silent — never surface housekeeping errors to the user
      console.warn('deleteOldDecks error (ignored)', e);
    }
  }
};

/* ============================================================
   APP STATE (in-memory)
   ============================================================ */
const AppState = {
  currentView:      'home',
  isAdminLoggedIn:  false,
  adminAccessToken:  null,   // set on successful login, used for write API calls
  adminRefreshToken: null,   // used to obtain a fresh access_token when it expires
  settings:         {},
  contentItems:     {},
  currentDeck:      null,   // { id, deck_name, modules_selected, customer_inputs }
  presentationIndex: 0,
  isCustomerView:   false,

  // Return active content items for a given module, sorted
  getModuleItems(moduleId) {
    return Object.values(this.contentItems)
      .filter(i => i.module_id === moduleId && i.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  getSetting(key, fallback) {
    const s = this.settings[key];
    return s ? (parseFloat(s.setting_value) || s.setting_value) : fallback;
  },

  getSettingStr(key, fallback) {
    const s = this.settings[key];
    return s ? s.setting_value : fallback;
  }
};

/* ============================================================
   MODULE REGISTRY
   ============================================================ */
const MODULE_REGISTRY = [
  {
    id: 'calculator',
    name: 'Savings Calculator',
    subtitle: 'Personalised to your bill',
    icon: 'fa-calculator',
    iconStyle: 'orange',
    essential: true,
    placeholder: false
  },
  {
    id: 'tariffs',
    name: 'Tariffs',
    subtitle: 'Compare tariffs',
    icon: 'fa-bolt',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  },
  {
    id: 'ev_charging',
    name: 'Future Proof with EV Charging',
    subtitle: 'For electric vehicle owners',
    icon: 'fa-car-battery',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'moving_house',
    name: 'Moving House? Solar Still Makes Sense',
    subtitle: 'Property value impact',
    icon: 'fa-house-chimney-crack',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  },
  {
    id: 'how_solar_works',
    name: 'How It Works',
    subtitle: 'Step by step',
    icon: 'fa-gear',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'installation_journey',
    name: 'Timelines',
    subtitle: 'When, where, how',
    icon: 'fa-calendar-check',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  },
  {
    id: 'why_choose_us',
    name: 'Why Choose Us',
    subtitle: 'Local trust & quality',
    icon: 'fa-shield-halved',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'reviews',
    name: 'Reviews',
    subtitle: 'What our customers say',
    icon: 'fa-star',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  },
  {
    id: 'videos',
    name: 'Videos',
    subtitle: 'Testimonials & explainers',
    icon: 'fa-play-circle',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'faqs',
    name: "FAQ's",
    subtitle: 'Common questions answered',
    icon: 'fa-circle-question',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'next_steps',
    name: 'Your Future Starts Here',
    subtitle: 'Review plan & next steps',
    icon: 'fa-rocket',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  }
];

/* ============================================================
   PRESET MODULE SELECTIONS
   ============================================================ */
const PRESETS = {
  savings: {
    name: 'Savings Focus',
    modules: ['calculator', 'how_solar_works', 'tariffs', 'faqs']
  },
  battery: {
    name: 'Battery + Tariff Focus',
    modules: ['calculator', 'tariffs', 'how_solar_works', 'faqs']
  },
  trust: {
    name: 'Trust Builder',
    modules: ['why_choose_us', 'reviews', 'how_solar_works', 'installation_journey', 'calculator', 'faqs', 'next_steps']
  },
  ev: {
    name: 'EV Owner',
    modules: ['calculator', 'tariffs', 'ev_charging', 'how_solar_works', 'faqs']
  },
  all: {
    name: 'Full Deck',
    modules: ['why_choose_us', 'calculator', 'how_solar_works', 'installation_journey', 'tariffs', 'reviews', 'faqs', 'videos', 'next_steps']
  }
};

/* ============================================================
   ADMIN PIN
   ============================================================ */
// ADMIN_PIN retired — authentication now handled by Supabase Auth.
// Kept as empty string so any legacy reference does not throw a ReferenceError.
const ADMIN_PIN = '';
