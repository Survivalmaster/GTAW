/* =========================================
   ActivityLog Render (DOM + badges/icons)
   Depends on: ActivityLog core calling render()
   ========================================= */

(function () {
  function activityBadgeHTML(tag, title = '') {
    const t = (tag || '').toUpperCase();
    if (t !== 'TCI') {
      // Legacy text pill for non-TCI (future forms can map to icons later)
      return `<div class="log-pill">${t || '?'}</div>`;
    }

    // Tint variants inferred from the label/title
    let variant = 'default';
    if (/officer/i.test(title)) variant = 'officer';
    else if (/city\s*employee/i.test(title)) variant = 'city';

    // Inline SVG car (inherits currentColor)
    const carSVG = `
      <svg viewBox="0 0 24 24" aria-hidden="true" class="activity-badge__svg">
        <path d="M3 13l1.5-5a2 2 0 0 1 1.9-1.5h9.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-12 0v3m10-3v3M6 16h.01M18 16h.01M5 13h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    return `<span class="activity-badge is-icon badge-${variant}">${carSVG}</span>`;
  }

  function render(list, { listEl, emptyEl }) {
    listEl.innerHTML = list.map(it => {
      const t = new Date(it.time);
      const hh = String(t.getUTCHours()).padStart(2, '0');   // UTC hours
      const mm = String(t.getUTCMinutes()).padStart(2, '0'); // UTC minutes
      return `<li class="log-item">
        ${activityBadgeHTML(it.type, it.label || '')}
        <div>
          <div class="log-title">${it.label || 'Generated Form'}</div>
          <div class="log-sub">${it.title || ''}</div>
        </div>
        <div class="log-time">${hh}:${mm}</div>
      </li>`;
    }).join('');

    if (emptyEl) emptyEl.style.display = list.length ? 'none' : 'block';
  }

  window.ActivityLogRender = { render };
})();
