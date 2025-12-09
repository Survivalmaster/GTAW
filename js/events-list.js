document.addEventListener("DOMContentLoaded", () => {
  const LS_KEY = "gtaw_events_portal_v1";

  const container = document.getElementById("events-container");
  const emptyEl = document.getElementById("events-empty");
  if (!container) return;

  let events = [];

  // --- Load & save helpers ---
  function loadEvents() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      events = raw ? JSON.parse(raw) : [];
    } catch {
      events = [];
    }
  }

  function saveEvents() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(events));
    } catch {
      // ignore
    }
  }

  // ---- Status helpers (same rules as old script) ----
  const STATUS_ORDER = ["NEW", "SETUP", "CONCLUDED"];

  function getSavedStatus(ev) {
    return ev.status || "NEW";
  }

  function getDisplayStatus(ev) {
    const saved = getSavedStatus(ev);

    if (saved === "CONCLUDED") return "CONCLUDED";

    if (ev.date) {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      if (ev.date === todayStr) {
        return "LIVE";
      }
    }

    return saved;
  }

  function render() {
    container.innerHTML = "";

    if (!events.length) {
      emptyEl.style.display = "block";
      return;
    }

    emptyEl.style.display = "none";

    events
      .slice()
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .forEach((ev) => {
        const card = document.createElement("article");
        card.className = "event-card";

        const dateStr =
          ev.date && ev.time
            ? `${ev.date} (${ev.time})`
            : ev.date
            ? ev.date
            : "Date not set";

        const displayStatus = getDisplayStatus(ev);
        const statusClass = `status-${displayStatus.toLowerCase()}`;

        card.innerHTML = `
          <div class="event-card__header">
            <span>📢 Event</span>
            <span>Property ID: ${ev.propertyId || "—"}</span>
          </div>
          <div class="event-card__title">${ev.name || "Untitled event"}</div>
          <div class="event-card__date">${dateStr}</div>
          <div class="event-card__handler">Handler: ${
            ev.handler || "Unknown"
          }</div>
          <div class="event-card__desc">${ev.description || ""}</div>
          <div class="event-card__footer">
            <div class="event-card__icons-left">
              <button class="event-icon-btn" data-action="discord" title="Open Discord ticket">
                <svg viewBox="0 0 24 24" class="discord-icon">
                  <path
                    d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.078.037c-.21.375-.444.864-.608 1.248a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.248.077.077 0 00-.078-.037c-1.69.283-3.316.84-4.885 1.515a.07.07 0 00-.032.027C.533 9.045-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 006.031 3.042.077.077 0 00.084-.028c.464-.63.875-1.295 1.226-1.994a.076.076 0 00-.041-.104 13.1 13.1 0 01-1.872-.878.076.076 0 01-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.246.198.372.292a.076.076 0 01-.007.127c-.6.35-1.234.635-1.873.878a.076.076 0 00-.04.105c.36.699.771 1.365 1.225 1.993a.076.076 0 00.084.028 19.9 19.9 0 006.032-3.042.076.076 0 00.031-.056c.5-5.177-.838-9.682-3.548-13.662a.061.061 0 00-.031-.03zM8.02 15.334c-1.182 0-2.157-1.08-2.157-2.408 0-1.327.955-2.408 2.157-2.408 1.213 0 2.177 1.09 2.157 2.408 0 1.328-.955 2.408-2.157 2.408zm7.974 0c-1.182 0-2.157-1.08-2.157-2.408 0-1.327.955-2.408 2.157-2.408 1.213 0 2.178 1.09 2.157 2.408 0 1.328-.944 2.408-2.157 2.408z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button class="event-icon-btn" data-action="poster" title="Copy /addevent command">🖼️</button>
            </div>
            <div class="event-card__icons-right">
              <button class="event-icon-btn" data-action="edit" title="Edit event">✏️</button>
              <button class="event-icon-btn" data-action="delete" title="Delete event">🗑️</button>
              <button class="event-status-pill ${statusClass}" data-action="status">
                ${displayStatus}
              </button>
            </div>
          </div>
        `;

        const discordBtn = card.querySelector('[data-action="discord"]');
        const posterBtn = card.querySelector('[data-action="poster"]');
        const editBtn = card.querySelector('[data-action="edit"]');
        const deleteBtn = card.querySelector('[data-action="delete"]');
        // status pill is currently display-only; no click handler yet

        if (discordBtn) {
          discordBtn.addEventListener("click", () => {
            if (ev.discord) {
              window.open(ev.discord, "_blank", "noopener");
            } else {
              alert("No Discord link was saved for this event.");
            }
          });
        }

        if (posterBtn) {
          posterBtn.addEventListener("click", () => {
            const name = ev.name || "";
            let datetime = "";
            if (ev.date && ev.time) {
              datetime = `${ev.date} ${ev.time}`;
            } else if (ev.date) {
              datetime = ev.date;
            }
            const desc = ev.description || "";
            const cmd = `/addevent name:${name} datetime:${datetime} description:${desc} image:`;

            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(cmd).catch(() => {});
            }

            const original = posterBtn.textContent;
            posterBtn.textContent = "✅";
            setTimeout(() => (posterBtn.textContent = original), 800);
          });
        }

        if (editBtn) {
          editBtn.addEventListener("click", () => {
            // 🔗 Jump to the wizard page with this event’s ID
            const targetUrl = `events-wizard.html?id=${encodeURIComponent(
              ev.id
            )}`;
            window.location.href = targetUrl;
          });
        }

        if (deleteBtn) {
          deleteBtn.addEventListener("click", () => {
            const ok = confirm(
              "Are you sure you want to delete this event? This cannot be undone."
            );
            if (!ok) return;

            events = events.filter((e) => e.id !== ev.id);
            saveEvents();
            render();
          });
        }

        container.appendChild(card);
      });
  }

  loadEvents();
  render();
});
