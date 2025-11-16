/* =========================================
   ActivityLog Core (storage + API + wiring)
   Exposes: window.ActivityLog, window.logActivity (alias)
   ========================================= */

(function () {
  const STORAGE_PREFIX = 'tcr.activity.';
  const cfg = {
    list: '#activityList',
    empty: '#activityEmpty',
    meta: '#activityMeta',
    clear: '#clearActivity',
  };

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + todayKey());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(STORAGE_PREFIX + todayKey(), JSON.stringify(list || []));
    } catch {}
  }

  function setMetaDate(metaEl) {
    if (!metaEl) return;
    const d = new Date();
    metaEl.textContent = d.toLocaleDateString(undefined, {
      weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/,/g, '');
  }

  function render() {
    const list = load();
    const listEl  = document.querySelector(cfg.list);
    const emptyEl = document.querySelector(cfg.empty);
    const metaEl  = document.querySelector(cfg.meta);

    if (!listEl) return;

    // Delegate to renderer
    if (window.ActivityLogRender && typeof window.ActivityLogRender.render === 'function') {
      window.ActivityLogRender.render(list, { listEl, emptyEl });
    } else {
      // super-safe fallback (very unlikely to hit)
      listEl.innerHTML = list.map(it => {
        const t = new Date(it.time);
        const hh = String(t.getUTCHours()).padStart(2, '0');
        const mm = String(t.getUTCMinutes()).padStart(2, '0');
        return `<li class="log-item">
          <div class="log-pill">${(it.type||'?').toUpperCase()}</div>
          <div>
            <div class="log-title">${it.label || 'Generated Form'}</div>
            <div class="log-sub">${it.title || ''}</div>
          </div>
          <div class="log-time">${hh}:${mm}</div>
        </li>`;
      }).join('');
      if (emptyEl) emptyEl.style.display = list.length ? 'none' : 'block';
    }

    setMetaDate(metaEl);
  }

  function clearToday() {
    localStorage.removeItem(STORAGE_PREFIX + todayKey());
    render();
  }

  function log(type, label, title) {
    const list = load();
    const titleFromField = (document.getElementById('outTitle')?.value) || '';
    list.unshift({
      type,
      label,
      title: title ?? titleFromField,
      time: Date.now()
    });
    save(list);
    render();
  }

  const ActivityLog = {
    init(options = {}) {
      Object.assign(cfg, options);

      // Wire "Clear Today"
      const clearBtn = document.querySelector(cfg.clear);
      if (clearBtn) {
        clearBtn.addEventListener('click', clearToday);
      }

      // Initial paint
      render();
    },
    log,
    getAll: load,
    render,         // manual refresh if needed
    clearToday,
  };

  window.ActivityLog = ActivityLog;
  // Back-compat alias so existing calls keep working
  window.logActivity = (type, label, title) => ActivityLog.log(type, label, title);
})();
