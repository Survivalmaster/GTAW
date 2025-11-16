/* LSPD Traffic Division CRM — userSettings.js (dark themed, First/Last version)
 * Stores/retrieves user profile (firstName, lastName, rank, badgeNumber) in localStorage.
 * Injects a slide-out Settings panel styled using site CSS variables.
 * Exposes TDUserSettings global: init/open/close/getProfile/onProfileChange.
 * Back-compat:
 *  - Migrates from old 'characterName'
 *  - Reads/writes legacy key 'userSettings' (with {firstName,lastName,name,rank,serial})
 */
(function () {
  'use strict';

  const LS_KEY = 'td.user';
  const LEGACY_KEY = 'userSettings'; // legacy object used elsewhere
  const MODAL_ID = 'td-settings-modal';
  const FORM_ID = 'td-settings-form';
  const GREETING_SLOT_CLASS = 'td-quickhub-greeting';
  const STYLE_ID = 'td-settings-styles';

  const RANKS = [
    'Probationary Officer', 'Police Officer I', 'Police Officer II', 'Police Officer III',
    'Senior Lead Officer', 'Sergeant I', 'Sergeant II', 'Lieutenant I', 'Lieutenant II',
    'Captain', 'Commander', 'Deputy Chief', 'Assistant Chief', 'Chief of Police'
  ];

  const state = {
    profile: null,
    listeners: new Set(),
    cfg: { quickHubSelector: null, mount: null }
  };

  // ---------- Inject dark styles using your variables ----------
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
#${MODAL_ID} { position: fixed; inset: 0; z-index: 1000; pointer-events: none; }
#${MODAL_ID}[aria-hidden="false"] { pointer-events: auto; }

/* Scrim */
#${MODAL_ID} .td-scrim {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.55);
  opacity: 0; transition: opacity .2s ease;
}

/* Panel */
#${MODAL_ID} .td-panel {
  position: absolute; right: 0; top: 0; height: 100%; width: min(420px, 100%);
  background: var(--panel-2);
  color: var(--text);
  border-left: 1px solid var(--line);
  box-shadow: -12px 0 32px rgba(0,0,0,.35);
  transform: translateX(100%);
  transition: transform .2s ease-out;
  display: flex; flex-direction: column;
}

/* Header / Footer */
#${MODAL_ID} .td-header,
#${MODAL_ID} .td-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: var(--panel-3);
  border-bottom: 1px solid var(--line);
}
#${MODAL_ID} .td-footer {
  border-top: 1px solid var(--line);
  border-bottom: none;
}

/* Title */
#${MODAL_ID} .td-title {
  font: 600 16px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif;
  color: var(--text);
}

/* Body / Form */
#${MODAL_ID} .td-body {
  padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow: auto;
  background: var(--panel);
}
#${MODAL_ID} .td-field label {
  display:block; font:500 13px system-ui; color:#cfd4d8; margin-bottom:6px;
}
#${MODAL_ID} input[type="text"],
#${MODAL_ID} input[type="search"],
#${MODAL_ID} input[type="number"],
#${MODAL_ID} select,
#${MODAL_ID} textarea {
  width:100%; padding:10px 12px; border-radius:12px;
  border:1px solid var(--line);
  background:#0f1114; color:var(--text);
}
#${MODAL_ID} input:focus,
#${MODAL_ID} select:focus,
#${MODAL_ID} textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: 0;
}

/* Error text */
#${MODAL_ID} .td-err { margin:6px 0 0; color:#ef4444; font:12px system-ui; display:none; }

/* Buttons */
#${MODAL_ID} .td-btn {
  padding:8px 12px; border-radius:10px; cursor:pointer; font:500 13px system-ui;
  transition: filter .15s ease;
}
#${MODAL_ID} .td-btn:hover { filter: brightness(1.08); }

/* Ghost buttons */
#${MODAL_ID} .td-btn.ghost {
  border:1px solid var(--line); background:#0e1013; color:#cfd4d8;
}
#${MODAL_ID} .td-btn.ghost:hover { background:#12151a; }

/* Primary button */
#${MODAL_ID} .td-btn.primary {
  background: var(--accent); color: #fff; border: 1px solid transparent;
  border-radius: 14px; padding: 8px 14px;
}

/* Close (X) */
#${MODAL_ID} .td-x {
  border:1px solid var(--line); background:#0e1013; color:#cfd4d8; border-radius:10px; padding:6px 10px;
}
#${MODAL_ID} .td-x:hover { background:#12151a; }

/* Greeting slot under Quick Hub header */
#${MODAL_ID} ~ .td-quickhub-greeting { margin:6px 12px 0 12px; }
    `.trim();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---------- Storage ----------
  function deriveCharacterName(firstName, lastName) {
    const f = String(firstName || '').trim();
    const l = String(lastName || '').trim();
    return (f || l) ? `${f}${f && l ? ' ' : ''}${l}` : '';
  }

  function loadProfile() {
    // 1) Try new schema
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          return {
            firstName: String(p.firstName || '').trim(),
            lastName: String(p.lastName || '').trim(),
            rank: String(p.rank || '').trim(),
            badgeNumber: String(p.badgeNumber || '').trim(),
          };
        }
      }
    } catch {}

    // 2) Try legacy key (migrate)
    try {
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        const u = JSON.parse(legacyRaw) || {};
        const firstName = String(u.firstName || '').trim() ||
                          String((u.name || '').split(/\s+/)[0] || '').trim();
        const lastName  = String(u.lastName || '').trim() ||
                          String((u.name || '').split(/\s+/).slice(1).join(' ') || '').trim();
        const rank = String(u.rank || '').trim();
        const badgeNumber = String(u.serial || u.badgeNumber || '').trim();
        const migrated = { firstName, lastName, rank, badgeNumber };
        localStorage.setItem(LS_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch {}

    // 3) Try very old single characterName (previous file version)
    try {
      const oldRaw = localStorage.getItem(LS_KEY);
      if (oldRaw) {
        const o = JSON.parse(oldRaw) || {};
        if (o.characterName && !o.firstName && !o.lastName) {
          const parts = String(o.characterName).trim().split(/\s+/);
          const migrated = {
            firstName: parts[0] || '',
            lastName:  parts.slice(1).join(' ') || '',
            rank: String(o.rank || '').trim(),
            badgeNumber: String(o.badgeNumber || '').trim(),
          };
          localStorage.setItem(LS_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
    } catch {}

    return null;
  }

  function saveProfile(p) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }

  // Keep legacy mirror to avoid breaking older code (e.g., Traffic Report seeding)
  function mirrorLegacy(p) {
    // legacy object shape used in parts of the app: { firstName, lastName, name, rank, serial }
    const legacy = {
      firstName: p.firstName || '',
      lastName:  p.lastName || '',
      name: deriveCharacterName(p.firstName, p.lastName),
      rank: p.rank || '',
      serial: p.badgeNumber || ''
    };
    try { localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy)); } catch {}
  }

  // ---------- Validation ----------
  function validateProfile(p) {
    const errors = {};
    const nameRe = /^[A-Za-z][A-Za-z '\-]{1,39}$/; // 2–40 chars, letters/space/'/-
    if (!nameRe.test(p.firstName || '')) {
      errors.firstName = "Enter a valid first name (letters, spaces, ' and - only, 2–40 chars).";
    }
    if (!nameRe.test(p.lastName || '')) {
      errors.lastName = "Enter a valid last name (letters, spaces, ' and - only, 2–40 chars).";
    }
    if (!RANKS.includes(p.rank || '')) {
      errors.rank = 'Please select a rank from the list.';
    }
    if (!/^\d{1,6}$/.test(p.badgeNumber || '')) {
      errors.badgeNumber = 'Badge number must be 1–6 digits.';
    }
    return errors;
  }

  // ---------- UI: Modal ----------
  function ensureModal() {
    ensureStyles();

    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    const mount = state.cfg.mount || document.body;

    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
      <div class="td-scrim"></div>
      <section class="td-panel" role="dialog" aria-label="Settings">
        <header class="td-header">
          <h2 class="td-title">Settings</h2>
          <button type="button" class="td-x td-close" aria-label="Close">✕</button>
        </header>

        <form id="${FORM_ID}" class="td-body">
          <div class="td-field">
            <label>First Name</label>
            <input type="text" name="firstName" placeholder="e.g., Alex" />
            <p class="td-err err-firstName"></p>
          </div>

          <div class="td-field">
            <label>Last Name</label>
            <input type="text" name="lastName"  placeholder="e.g., Mercer" />
            <p class="td-err err-lastName"></p>
          </div>

          <div class="td-field">
            <label>Rank</label>
            <select name="rank"></select>
            <p class="td-err err-rank"></p>
          </div>

          <div class="td-field">
            <label>Badge Number</label>
            <input type="text" name="badgeNumber" placeholder="e.g., 38181" inputmode="numeric" />
            <p class="td-err err-badgeNumber"></p>
          </div>
        </form>

        <footer class="td-footer">
          <button type="button" class="td-btn ghost td-clear">Clear profile</button>
          <div style="display:flex;gap:8px">
            <button type="button" class="td-btn ghost td-cancel">Cancel</button>
            <button type="submit" form="${FORM_ID}" class="td-btn primary td-save">Save</button>
          </div>
        </footer>
      </section>
    `;
    mount.appendChild(modal);

    // Populate ranks
    const rankSelect = modal.querySelector('select[name="rank"]');
    RANKS.forEach(r => {
      const o = document.createElement('option');
      o.value = r; o.textContent = r; rankSelect.appendChild(o);
    });

    // Wire buttons
    modal.querySelector('.td-close').addEventListener('click', close);
    modal.querySelector('.td-cancel').addEventListener('click', close);
    modal.querySelector('.td-clear').addEventListener('click', () => {
      setProfile(null);
      const f = modal.querySelector('#' + FORM_ID);
      f.firstName.value = '';
      f.lastName.value = '';
      f.rank.value = '';
      f.badgeNumber.value = '';
      renderGreeting();
    });

    // Numeric enforcement
    modal.querySelector('input[name="badgeNumber"]').addEventListener('input', (e) => {
      e.target.value = (e.target.value || '').replace(/[^0-9]/g, '').slice(0, 6);
    });

    // Submit handling
    modal.querySelector('#' + FORM_ID).addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const draft = {
        firstName: f.firstName.value.trim(),
        lastName: f.lastName.value.trim(),
        rank: f.rank.value.trim(),
        badgeNumber: f.badgeNumber.value.trim(),
      };
      const errs = validateProfile(draft);
      showErrors(errs);
      if (Object.keys(errs).length) return;
      setProfile(draft);
      close();
      renderGreeting();
    });

    return modal;
  }

  function showErrors(errs) {
    const modal = document.getElementById(MODAL_ID);
    [['firstName', '.err-firstName'], ['lastName', '.err-lastName'], ['rank', '.err-rank'], ['badgeNumber', '.err-badgeNumber']]
      .forEach(([k, sel]) => {
        const el = modal.querySelector(sel);
        const has = !!errs[k];
        el.textContent = has ? errs[k] : '';
        el.style.display = has ? 'block' : 'none';
      });
  }

  // ---------- Open/Close ----------
  function open() {
    const modal = ensureModal();
    const f = modal.querySelector('#' + FORM_ID);
    const p = state.profile || { firstName: '', lastName: '', rank: '', badgeNumber: '' };
    f.firstName.value = p.firstName || '';
    f.lastName.value = p.lastName || '';
    f.rank.value = p.rank || '';
    f.badgeNumber.value = p.badgeNumber || '';

    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.td-scrim').style.opacity = '1';
    modal.querySelector('.td-panel').style.transform = 'translateX(0)';
  }

  function close() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.querySelector('.td-scrim').style.opacity = '0';
    modal.querySelector('.td-panel').style.transform = 'translateX(100%)';
  }

  // ---------- Profile state ----------
  function setProfile(p) {
    if (p === null) {
      state.profile = null;
      localStorage.removeItem(LS_KEY);
      try { localStorage.removeItem(LEGACY_KEY); } catch {}
    } else {
      state.profile = {
        firstName: String(p.firstName || '').trim(),
        lastName: String(p.lastName || '').trim(),
        rank: String(p.rank || '').trim(),
        badgeNumber: String(p.badgeNumber || '').trim(),
      };
      saveProfile(state.profile);
      mirrorLegacy(state.profile); // keep older parts of the app happy
    }
    state.listeners.forEach(fn => { try { fn(getProfile()); } catch {} });
    document.dispatchEvent(new CustomEvent('td:userprofile:changed', { detail: getProfile() }));
  }

  function onProfileChange(fn) { state.listeners.add(fn); return () => state.listeners.delete(fn); }

  // ---------- Quick Hub greeting (below header line) ----------
  function renderGreeting() {
    if (!state.cfg.quickHubSelector) return;
    const root = document.querySelector(state.cfg.quickHubSelector);
    if (!root) return;

    let slot = root.querySelector('.' + GREETING_SLOT_CLASS);
    if (!slot) {
      slot = document.createElement('div');
      slot.className = GREETING_SLOT_CLASS;
      const head = root.querySelector('.quickhub-header');
      if (head) head.insertAdjacentElement('afterend', slot);
      else root.prepend(slot);
      // spacing driven by CSS injection too, but keep a fallback:
      slot.style.margin = '6px 12px 0 12px';
    }

    const p = getProfile();
    if (p) {
      slot.innerHTML = `
        <div style="font:500 12px system-ui;color:#94a3b8">Welcome back,</div>
        <div style="font:600 14px system-ui">
          ${escapeHtml(p.rank)} ${escapeHtml(p.characterName)}
          ${p.badgeNumber ? `<span style="color:#64748b"> · #${escapeHtml(p.badgeNumber)}</span>` : ''}
        </div>
      `;
    } else {
      slot.innerHTML = `<div style="font:500 12px system-ui;color:#eab308">Set up your profile in Settings →</div>`;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function getProfile() {
    if (!state.profile) return null;
    return {
      firstName: state.profile.firstName,
      lastName: state.profile.lastName,
      rank: state.profile.rank,
      badgeNumber: state.profile.badgeNumber,
      characterName: deriveCharacterName(state.profile.firstName, state.profile.lastName)
    };
  }

  // ---------- Public API ----------
  function init(cfg = {}) {
    state.cfg.quickHubSelector = cfg.quickHubSelector || null;
    state.cfg.mount = cfg.mount || null;
    state.profile = loadProfile();
    ensureModal();
    renderGreeting();
  }

  window.TDUserSettings = {
    init, open, close,
    getProfile,
    onProfileChange,
    _debug: { validateProfile, renderGreeting }
  };
})();
