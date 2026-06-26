/* ============================================================
   DATA LAYER — Supabase REST API (PostgREST) + Auth
   Project : https://oakzkikvdskadksochdp.supabase.co
   App     : Three Counties Windows Sales Navigator
   ============================================================ */

/* ---------- Table name constants (single source of truth) ---------- */
const TABLES = {
  content:  'windows_content_items',
  settings: 'windows_settings',
  decks:    'windows_decks',
};

/* ---------- Supabase connection config ---------- */
const SUPABASE_URL = 'https://oakzkikvdskadksochdp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WPly-6PBOUSPvXljBhxyUg_ldQ7fudb';

/* ---------- Supabase JS client (auth + storage session) ---------- */
const SupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Dynamic REST headers ---------- */
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
   API
   ============================================================ */
const API = {

  /* ---- SETTINGS ---- */

  async getSettings() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLES.settings}?select=*&order=key.asc&limit=100`,
        { headers: sbHeaders() }
      );
      if (!res.ok) { console.error('getSettings HTTP', res.status); return {}; }
      const rows = await res.json();
      const map  = {};
      (rows || []).forEach(s => { map[s.key] = s; });
      return map;
    } catch (e) { console.error('getSettings error', e); return {}; }
  },

  async saveSetting(recordId, value) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLES.settings}?id=eq.${encodeURIComponent(recordId)}`,
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
      let url = `${SUPABASE_URL}/rest/v1/${TABLES.content}?select=*&order=sort_order.asc&limit=200`;
      if (moduleId) url += `&module=eq.${encodeURIComponent(moduleId)}`;
      const res = await fetch(url, { headers: sbHeaders() });
      if (!res.ok) { console.error('getContentItems HTTP', res.status); return []; }
      const rows = await res.json();
      return (rows || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (e) { console.error('getContentItems error', e); return []; }
  },

  async getAllContentItems() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLES.content}?select=*&order=sort_order.asc&limit=500`,
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
      if (isNew) delete payload.id;

      const doFetch = () => {
        if (isNew) {
          return fetch(
            `${SUPABASE_URL}/rest/v1/${TABLES.content}`,
            { method: 'POST', headers: sbHeaders({ 'Prefer': 'return=representation' }), body: JSON.stringify(payload) }
          );
        }
        return fetch(
          `${SUPABASE_URL}/rest/v1/${TABLES.content}?id=eq.${encodeURIComponent(item.id)}`,
          { method: 'PATCH', headers: sbHeaders({ 'Prefer': 'return=representation' }), body: JSON.stringify(payload) }
        );
      };

      let res = await doFetch();
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
        `${SUPABASE_URL}/rest/v1/${TABLES.content}?id=eq.${encodeURIComponent(id)}`,
        { method: 'DELETE', headers: sbHeaders() }
      );
      return res.ok;
    } catch (e) { console.error('deleteContentItem error', e); return false; }
  },

  /* ---- DECKS ---- */

  async getDecks() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLES.decks}?select=*&order=created_at.asc&limit=200`,
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
        `${SUPABASE_URL}/rest/v1/${TABLES.decks}?id=eq.${encodeURIComponent(id)}&select=*`,
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

      if (typeof payload.modules_selected === 'string') {
        try { payload.modules_selected = JSON.parse(payload.modules_selected); } catch (_) {}
      }

      let res;
      if (isNew) {
        delete payload.id;
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/${TABLES.decks}`,
          {
            method:  'POST',
            headers: sbHeaders({ 'Prefer': 'return=representation' }),
            body:    JSON.stringify(payload)
          }
        );
      } else {
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/${TABLES.decks}?id=eq.${encodeURIComponent(deck.id)}`,
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
        `${SUPABASE_URL}/rest/v1/${TABLES.decks}?id=eq.${encodeURIComponent(id)}`,
        { method: 'DELETE', headers: sbHeaders() }
      );
      return res.ok;
    } catch (e) { console.error('hardDeleteDeck error', e); return false; }
  },

  async deleteOldDecks() {
    try {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLES.decks}?created_at=lt.${encodeURIComponent(cutoff)}`,
        { method: 'DELETE', headers: sbHeaders() }
      );
      if (!res.ok && res.status !== 204) {
        console.warn('deleteOldDecks HTTP', res.status);
      }
    } catch (e) {
      console.warn('deleteOldDecks error (ignored)', e);
    }
  }
};

/* ============================================================
   APP STATE (in-memory)
   ============================================================ */
const AppState = {
  currentView:       'home',
  isAdminLoggedIn:   false,
  adminAccessToken:  null,
  adminRefreshToken: null,
  settings:          {},
  contentItems:      {},
  currentDeck:       null,
  presentationIndex: 0,
  isCustomerView:    false,
  priorities:        null,
  products:          null,

  getModuleItems(moduleId) {
    return Object.values(this.contentItems)
      .filter(i => i.module === moduleId && i.is_active !== false)
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
   EMBEDDED TOOL CONFIG
   ============================================================ */
const EMBEDDED_TOOLS = {
  tommy_trinder: {
    label: 'Get Your Quote',
    url: 'CONFIRM_WITH_STEPH',
    embeddable: false,
    blurb: 'Build a live, accurate quote for your windows.'
  },
  door_builder: {
    label: 'Design Your Door',
    url: 'CONFIRM_GLAZING_VAULT_ENTRY_URL',
    embeddable: null,
    blurb: 'Design your perfect composite door and preview it on your own home with the Home Visualizer.'
  },
  installs_map: {
    label: 'Installs Near You',
    url: 'https://www.google.com/maps/d/embed?mid=1TWdJc7EJYgg9E61-ZU_cLf93vMTmzzI',
    embeddable: true,
    blurb: 'See where we have recently installed near you.'
  }
};

/* ============================================================
   MODULE REGISTRY
   ============================================================ */
const MODULE_REGISTRY = [
  {
    id: 'welcome',
    name: 'Welcome',
    subtitle: 'Opening screen',
    icon: 'fa-house',
    iconStyle: 'green',
    essential: true,
    placeholder: false
  },
  {
    id: 'priorities',
    name: 'Priorities',
    subtitle: 'What matters most',
    icon: 'fa-list-check',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'how_we_help',
    name: 'How We Help',
    subtitle: 'Tailored to what matters',
    icon: 'fa-hands-helping',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'eco_vs_eco_plus',
    name: 'Eco vs Eco+',
    subtitle: 'Glass performance comparison',
    icon: 'fa-leaf',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'gallery',
    name: 'Gallery',
    subtitle: 'Real homes, real installs',
    icon: 'fa-images',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  },
  {
    id: 'door_builder',
    name: 'Design Your Door',
    subtitle: 'Door designer tool',
    icon: 'fa-door-open',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  },
  {
    id: 'why_choose',
    name: 'Why Choose 3C',
    subtitle: 'Why Three Counties',
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
    id: 'installs_map',
    name: 'Installs Near You',
    subtitle: 'See our local work',
    icon: 'fa-map-location-dot',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'secure_living',
    name: 'Secure Living Warranty',
    subtitle: 'Security guarantee',
    icon: 'fa-shield',
    iconStyle: 'green',
    essential: false,
    placeholder: false
  },
  {
    id: 'finance',
    name: 'Finance Options',
    subtitle: 'Spread the cost',
    icon: 'fa-sterling-sign',
    iconStyle: 'orange',
    essential: false,
    placeholder: false
  },
  {
    id: 'get_quote',
    name: 'Get Your Quote',
    subtitle: 'Close & next steps',
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
  security: {
    name: 'Security Focus',
    modules: ['welcome', 'priorities', 'secure_living', 'why_choose', 'reviews', 'get_quote']
  },
  thermal: {
    name: 'Thermal & Finance',
    modules: ['welcome', 'priorities', 'eco_vs_eco_plus', 'finance', 'why_choose', 'get_quote']
  },
  aesthetics: {
    name: 'Aesthetics Focus',
    modules: ['welcome', 'priorities', 'gallery', 'door_builder', 'reviews', 'get_quote']
  },
  trust: {
    name: 'Trust Builder',
    modules: ['welcome', 'why_choose', 'reviews', 'secure_living', 'installs_map', 'get_quote']
  },
  all: {
    name: 'Full Deck',
    modules: ['welcome', 'priorities', 'eco_vs_eco_plus', 'gallery', 'door_builder', 'why_choose', 'reviews', 'installs_map', 'secure_living', 'finance', 'get_quote']
  }
};

const ADMIN_PIN = '';
