document.addEventListener("DOMContentLoaded", () => {
  // --- LocalStorage Keys ---
  const LS_KEY = "gtaw_events_portal_v1";
  const LS_HANDLER_KEY = "gtaw_events_handler";

  let events = [];
  let editingEventId = null;

  // -----------------------------
  // LOAD & SAVE EVENTS
  // -----------------------------
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

  // Load immediately so edit mode & ID generation work
  loadEvents();

  // -----------------------------
  // CLIPBOARD HELPER
  // -----------------------------
  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    }
  }

  // -----------------------------
  // HANDLER NAME PERSISTENCE
  // -----------------------------
  const handlerField = document.getElementById("handler");

  function getGlobalUsername() {
    try {
      return localStorage.getItem("username") || "";
    } catch {
      return "";
    }
  }

  function getStoredHandler() {
    try {
      return localStorage.getItem(LS_HANDLER_KEY) || "";
    } catch {
      return "";
    }
  }

  function setStoredHandler(value) {
    try {
      localStorage.setItem(LS_HANDLER_KEY, value || "");
    } catch {}
  }

  function applyStoredHandlerToField() {
    if (!handlerField) return;

    const globalUsername = getGlobalUsername();
    const storedHandler = getStoredHandler();

    // Prefer the global username; fall back to old handler key
    let valueToUse = globalUsername || storedHandler;

    if (!handlerField.value.trim() && valueToUse) {
      handlerField.value = valueToUse;
    }

    // Keep the handler key in sync with whatever we ended up using
    if (valueToUse && valueToUse !== storedHandler) {
      setStoredHandler(valueToUse);
    }
  }

  // Save handler when user edits it manually
  if (handlerField) {
    handlerField.addEventListener("blur", () => {
      const value = handlerField.value.trim();
      if (value) setStoredHandler(value);
    });
  }

  // -----------------------------
  // WIZARD ELEMENTS
  // -----------------------------
  let currentStage = 1;
  const totalStages = 3;

  const stageEls = [...document.querySelectorAll(".wizard-stage")];
  const stagePills = [...document.querySelectorAll(".stage-pill")];

  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");
  const btnCancel = document.getElementById("btn-cancel");

  function setStage(stage) {
    currentStage = stage;

    stageEls.forEach((el) => {
      el.classList.toggle("hidden", Number(el.dataset.stage) !== stage);
    });

    stagePills.forEach((pill) => {
      const label = Number(pill.dataset.stageLabel);
      pill.classList.toggle("active", label === stage);
      pill.classList.toggle("done", label < stage);
    });

    btnBack.disabled = stage === 1;
    btnNext.textContent =
      stage === totalStages
        ? editingEventId
          ? "Save Changes"
          : "Submit Event"
        : "Next";
  }

  // -----------------------------
  // ERROR HANDLING
  // -----------------------------
  function clearErrors() {
    document.querySelectorAll(".error-text").forEach((el) => {
      el.classList.add("hidden");
    });
  }

  function validateStage1() {
    clearErrors();
    let valid = true;

    const requiredIds = [
      "handler",
      "event-type",
      "event-date",
      "event-time",
      "event-name",
    ];

    // property-id required only when creating a NEW event
    if (!editingEventId) requiredIds.push("property-id");

    requiredIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        valid = false;
        const err = document.querySelector(
          `.error-text[data-error-for="${id}"]`
        );
        if (err) err.classList.remove("hidden");
      }
    });

    return valid;
  }

  function validateBeforeSubmit() {
    clearErrors();
    const propertyId = (document.getElementById("property-id") || {}).value?.trim?.() || "";

    if (!propertyId) {
      const err = document.querySelector(
        `.error-text[data-error-for="property-id"]`
      );
      if (err) err.classList.remove("hidden");
      return false;
    }
    return true;
  }

  // -----------------------------
  // COMMAND GENERATORS
  // -----------------------------
  const eventTypeField = document.getElementById("event-type");
  const eventNameField = document.getElementById("event-name");
  const eventDistrictField = document.getElementById("event-district");
  const createCommandField = document.getElementById("create-command");

  function updateCreateCommand() {
    if (!createCommandField) return;

    const type = eventTypeField?.value || "2";
    const name = eventNameField?.value.trim() || "";
    const district = eventDistrictField?.value.trim() || "";

    let suffix = "[EVENT]";
    if (name) suffix += " " + name;
    if (district) suffix += " - " + district;

    createCommandField.value = `/createproperty ${type} 0 200 0 1 M ${suffix}`;
  }

  eventTypeField?.addEventListener("change", updateCreateCommand);
  eventNameField?.addEventListener("input", updateCreateCommand);
  eventDistrictField?.addEventListener("input", updateCreateCommand);

  // /setdim
  const adminIdField = document.getElementById("admin-id");
  const cmdSetdimField = document.getElementById("cmd-setdim");
  const propertyIdField = document.getElementById("property-id");

  function updateSetdimCommand() {
    if (!cmdSetdimField) return;

    const adminId = adminIdField?.value.trim() || "";
    const propId = propertyIdField?.value.trim() || "";

    let cmd = "/setdim";
    if (adminId) cmd += " " + adminId;
    if (propId) cmd += " " + propId;

    cmdSetdimField.value = cmd;
  }

  adminIdField?.addEventListener("input", updateSetdimCommand);
  propertyIdField?.addEventListener("input", updateSetdimCommand);

  // -----------------------------
  // OWNER BLOCK LOGIC
  // -----------------------------
  const ownIngame = document.getElementById("own-ingame");
  const ownOffline = document.getElementById("own-offline");
  const ownerIngameBlock = document.getElementById("owner-ingame-block");
  const ownerOfflineBlock = document.getElementById("owner-offline-block");

  function toggleOwnerBlocks() {
    if (ownerIngameBlock)
      ownerIngameBlock.classList.toggle("hidden", !ownIngame.checked);
    if (ownerOfflineBlock)
      ownerOfflineBlock.classList.toggle("hidden", !ownOffline.checked);
  }

  ownIngame?.addEventListener("change", toggleOwnerBlocks);
  ownOffline?.addEventListener("change", toggleOwnerBlocks);

  // dynamic commands for Stage 2
  const playerIdField = document.getElementById("player-id");
  const cmdPownerField = document.getElementById("cmd-powner");

  playerIdField?.addEventListener("input", () => {
    const num = playerIdField.value.trim();
    cmdPownerField.value = num ? `/powner ${num}` : "/powner";
  });

  const charNameField = document.getElementById("char-name");
  const cmdGciofflineField = document.getElementById("cmd-gcioffline");

  charNameField?.addEventListener("input", () => {
    const name = charNameField.value.trim();
    cmdGciofflineField.value = name ? `/gcioffline ${name}` : "/gcioffline";
  });

  const ucpIdField = document.getElementById("ucp-id");
  const cmdPownerofflineField = document.getElementById("cmd-powneroffline");

  ucpIdField?.addEventListener("input", () => {
    const id = ucpIdField.value.trim();
    cmdPownerofflineField.value = id
      ? `/powneroffline 1 ${id}`
      : "/powneroffline 1";
  });

  // -----------------------------
  // COPY BUTTONS
  // -----------------------------
  document.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.copyFrom;
      const input = document.getElementById(id);
      if (!input) return;

      copyText(input.value);

      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = old), 900);
    });
  });

  // -----------------------------
  // BUILD EVENT OBJECT FROM FORM
  // -----------------------------
  function collectEventFromForm() {
    const handler = (document.getElementById("handler")?.value || "").trim();
    const type = document.getElementById("event-type")?.value || "";
    const date = document.getElementById("event-date")?.value || "";
    const time = document.getElementById("event-time")?.value || "";
    const name = (document.getElementById("event-name")?.value || "").trim();
    const district =
      (document.getElementById("event-district")?.value || "").trim();
    const discord =
      (document.getElementById("discord-link")?.value || "").trim();
    const description =
      (document.getElementById("event-description")?.value || "").trim();
    const propertyId =
      (document.getElementById("property-id")?.value || "").trim();
    const notes = (document.getElementById("notes")?.value || "").trim();

    const base = {
      handler,
      type,
      date,
      time,
      name,
      district,
      discord,
      description,
      propertyId,
      notes,
    };

    // Editing: just update fields, don't change identity/createdAt
    if (editingEventId) {
      return base;
    }

    // New event: generate id, createdAt, default status
    let newId = Date.now();
    if (Array.isArray(events) && events.length) {
      const numericIds = events
        .map((e) => Number(e.id))
        .filter((n) => !Number.isNaN(n));
      if (numericIds.length) {
        newId = Math.max(...numericIds) + 1;
      }
    }

    return {
      ...base,
      id: newId,
      createdAt: new Date().toISOString(),
      status: "NEW",
    };
  }

  // -----------------------------
  // LOAD EVENT INTO FORM
  // -----------------------------
  function loadEventIntoForm(ev) {
    document.getElementById("handler").value = ev.handler || "";
    document.getElementById("event-type").value = ev.type || "";
    document.getElementById("event-date").value = ev.date || "";
    document.getElementById("event-time").value = ev.time || "";
    document.getElementById("event-name").value = ev.name || "";
    document.getElementById("event-district").value = ev.district || "";
    document.getElementById("discord-link").value = ev.discord || "";
    document.getElementById("event-description").value =
      ev.description || "";
    document.getElementById("property-id").value = ev.propertyId || "";
    document.getElementById("notes").value = ev.notes || "";

    clearErrors();
    updateCreateCommand();
    updateSetdimCommand();
  }

  // -----------------------------
  // EDIT MODE LOADER
  // -----------------------------
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  if (editId) {
    const existing = events.find((e) => String(e.id) === String(editId));
    if (existing) {
      editingEventId = existing.id;
      loadEventIntoForm(existing);
      toggleOwnerBlocks();
      setStage(1);
    }
  }

  // -----------------------------
  // RESET FORM
  // -----------------------------
  function resetForm() {
    document
      .querySelectorAll(
        "input[type='text'], input[type='date'], input[type='time'], textarea"
      )
      .forEach((el) => {
        if (el.id.startsWith("cmd-")) return;
        el.value = "";
      });

    const typeSelect = document.getElementById("event-type");
    if (typeSelect) typeSelect.value = "";

    if (ownIngame) ownIngame.checked = true;
    if (ownOffline) ownOffline.checked = false;

    toggleOwnerBlocks();
    clearErrors();
    editingEventId = null;

    applyStoredHandlerToField();
    updateCreateCommand();
    updateSetdimCommand();
    setStage(1);
  }

  // -----------------------------
  // NEXT / BACK / CANCEL BUTTONS
  // -----------------------------
  btnBack.addEventListener("click", () => {
    if (currentStage > 1) setStage(currentStage - 1);
  });

  btnNext.addEventListener("click", () => {
    if (currentStage === 1) {
      if (!validateStage1()) return;
      setStage(2);
      return;
    }

    if (currentStage === 2) {
      setStage(3);
      return;
    }

    // Stage 3 -> Submit
    if (!validateBeforeSubmit()) return;

    const formEvent = collectEventFromForm();

    if (editingEventId) {
      const idx = events.findIndex((e) => e.id === editingEventId);
      if (idx !== -1) {
        const existing = events[idx];
        events[idx] = {
          ...existing,
          ...formEvent,
          id: existing.id,
          createdAt: existing.createdAt,
          status: existing.status || "NEW",
        };
      }
    } else {
      events.push(formEvent);
    }

    saveEvents();
    alert("Event saved. You’ll see it on the Events page.");
    resetForm();
  });

  btnCancel.addEventListener("click", resetForm);

  // Stage pill clicks (backwards only)
  stagePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const n = Number(pill.dataset.stageLabel);
      if (n <= currentStage) setStage(n);
    });
  });

  // -----------------------------
  // INITIALISE WIZARD
  // -----------------------------
  applyStoredHandlerToField(); // prefers top-right username if set
  updateCreateCommand();
  updateSetdimCommand();
  toggleOwnerBlocks();
  setStage(1);
});
