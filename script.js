// script.js

document.addEventListener("DOMContentLoaded", () => {
  // ===== MOBILE SIDEBAR TOGGLE =====
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar--open");
    });
  }

  // ===== CLOCK IN TOPBAR =====
  const clockEl = document.getElementById("clock");

  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${h}:${m}:${s}`;
  }

  if (clockEl) {
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ===== USERNAME SETTINGS POPUP =====

  const usernameModal = document.getElementById("usernameModal");
  const usernameInput = document.getElementById("usernameInput");
  const usernameSaveBtn = document.getElementById("usernameSaveBtn");
  const usernameCancelBtn = document.getElementById("usernameCancelBtn");

  const userNameDisplay = document.querySelector(".topbar__user-name");
  const userAvatar = document.querySelector(".topbar__avatar");
  const userArea = document.querySelector(".topbar__user");

  function openUsernameModal() {
    if (!usernameModal || !usernameInput) return;
    const saved = localStorage.getItem("username") || "";
    usernameInput.value = saved;
    usernameModal.classList.remove("hidden");
    usernameInput.focus();
  }

  function closeUsernameModal() {
    if (!usernameModal) return;
    usernameModal.classList.add("hidden");
  }

  function applyUsername(name) {
    if (userNameDisplay) {
      userNameDisplay.textContent = name;
    }
    if (userAvatar && name) {
      userAvatar.textContent = name.charAt(0).toUpperCase();
    }
  }

  function saveUsername() {
    if (!usernameInput) return;
    const name = usernameInput.value.trim();
    if (!name) return;

    localStorage.setItem("username", name);
    applyUsername(name);
    closeUsernameModal();
  }

  // Bind open click to the whole top-right user area
  if (userArea && usernameModal) {
    userArea.style.cursor = "pointer";
    userArea.addEventListener("click", openUsernameModal);
  }

  // Bind buttons
  if (usernameSaveBtn) {
    usernameSaveBtn.addEventListener("click", saveUsername);
  }

  if (usernameCancelBtn) {
    usernameCancelBtn.addEventListener("click", closeUsernameModal);
  }

  // Close on backdrop click
  if (usernameModal) {
    usernameModal.addEventListener("click", (e) => {
      if (e.target === usernameModal) {
        closeUsernameModal();
      }
    });
  }

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeUsernameModal();
    }
  });

  // Initialise from localStorage
  const savedName = localStorage.getItem("username");
  if (savedName) {
    applyUsername(savedName);
  }
});
