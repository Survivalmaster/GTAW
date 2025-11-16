import { handleSidebarSaveEdit } from '../main.js';

export function hideAllSections() {
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('orientationGenerator').style.display = 'none';
  document.getElementById('dorGenerator').style.display = 'none';
  document.getElementById('weeklyGenerator').style.display = 'none';
  document.getElementById('ftoFileGenerator').style.display = 'none';
}

export function populateStaticOfficerInfo() {
  const form = document.getElementById("officerForm");
  if (!form) return;

  const name = localStorage.getItem("officerName") || "";
  const serial = localStorage.getItem("serialNumber") || "";
  const rank = localStorage.getItem("officerRank") || "";
  const time = localStorage.getItem("ftpTime") || "00:00";
  const url = localStorage.getItem("ftoUrl") || "";

  form.innerHTML = `
    <div id="nameAndSerial">
      <span id="officerNameStatic" class="static-text">${name}</span><br>
      <span id="serialNumberStatic" class="static-text">#${serial}</span><br>
      <span id="officerRankStatic" class="static-text">${rank}</span>
    </div>
    <div class="sidebar-static">
      <span class="static-text" id="ftpTimeStatic">FTP Time: ${time}</span><br>
      <a href="${url}" class="static-text" target="_blank" style="color:#0094FF;">FTO FILE</a>
    </div>
    <button id="formButton" type="submit">EDIT</button>
  `;

  document.getElementById("formButton")?.addEventListener("click", handleSidebarSaveEdit);
}

export function setupDropdowns() {
  document.querySelectorAll(".dropdown-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      this.parentElement.classList.toggle("active");
    });
  });

  document.querySelectorAll(".dropdown").forEach(dropdown => {
    dropdown.classList.add("active");
  });
}

export function resetOrientationForm() {
  document.getElementById("orientationForm")?.reset();
}

export function resetDORForm() {
  document.getElementById("dorForm")?.reset();
}

export function resetWeeklyForm() {
  document.getElementById("weeklyForm")?.reset();
}