import { generateOrientationBBCode } from './generators/orientation.js';
import { generateDORBBCode } from './generators/dor.js';
import { generateWeeklyBBCode } from './generators/weekly.js';

import { generateFTOFileBBCode,
  setupMonthlyLogButton,
  submitMonthlyLogSection,
  getCurrentMonthYearLabel
} from './generators/ftofile.js';

import {
  hideAllSections,
  populateStaticOfficerInfo,
  setupDropdowns,
  resetOrientationForm,
  resetDORForm,
  resetWeeklyForm
} from './utils/ui.js';

import { saveReport, loadSavedReports, loadReport } from './utils/localstorage.js';
import { getRatingToken } from './utils/utils.js';

window.addEventListener('DOMContentLoaded', () => {
  setupDropdowns();
  loadSavedReports();

  populateStaticOfficerInfo();

  document.getElementById('orientationButton')?.addEventListener('click', e => {
    e.preventDefault();
    hideAllSections();
    const name = localStorage.getItem("officerName") || "";
    const serial = localStorage.getItem("serialNumber") || "";
    document.getElementById("oriFTO").value = name;
    document.getElementById("oriFTOSerial").value = serial;
    document.getElementById('orientationGenerator').style.display = 'block';
    document.getElementById('orientationGenerator').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('dorButton')?.addEventListener('click', e => {
    e.preventDefault();
    hideAllSections();
    const name = localStorage.getItem("officerName") || "";
    const serial = localStorage.getItem("serialNumber") || "";
    document.getElementById("dorFTO").value = name;
    document.getElementById("dorFTOSerial").value = serial;
    document.getElementById('dorGenerator').style.display = 'block';
    document.getElementById('dorGenerator').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('weeklyReportButton')?.addEventListener('click', e => {
    e.preventDefault();
    hideAllSections();
    const name = localStorage.getItem("officerName") || "";
    const serial = localStorage.getItem("serialNumber") || "";
    document.getElementById("weeklyFTM").value = name;
    document.getElementById("weeklyFTMSerial").value = serial;
    document.getElementById('weeklyGenerator').style.display = 'block';
    document.getElementById('weeklyGenerator').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('ftoFileButton')?.addEventListener('click', e => {
    e.preventDefault();
    hideAllSections();
    const container = document.getElementById("monthlyLogInputsContainer");
    container.innerHTML = "";

    const label = document.createElement("h2");
    label.style.color = "white";
    label.style.textAlign = "center";
    label.style.marginBottom = "10px";
    label.id = "monthlyLogLabel";
    label.textContent = getCurrentMonthYearLabel();
    container.appendChild(label);

    setupMonthlyLogButton();

    document.getElementById("ftoFileName").value = localStorage.getItem("officerName") || "";
    document.getElementById("ftoFileSerial").value = localStorage.getItem("serialNumber") || "";
    document.getElementById("ftoFileTime").value = localStorage.getItem("ftpTime") || "00:00";
    document.getElementById("ftoFileDivision").value = "MISSION ROW/METRO";
    document.getElementById("ftoFileGenerator").style.display = "block";
    document.getElementById("ftoFileGenerator").scrollIntoView({ behavior: 'smooth' });

    document.getElementById("addLogEntry")?.addEventListener("click", addLogEntry);
  });

  document.getElementById('backButton')?.addEventListener('click', () => {
    hideAllSections();
    document.getElementById('mainContent').style.display = 'block';
  });
  document.getElementById('dorBackButton')?.addEventListener('click', () => {
    hideAllSections();
    document.getElementById('mainContent').style.display = 'block';
  });
  document.getElementById('weeklyBackButton')?.addEventListener('click', () => {
    hideAllSections();
    document.getElementById('mainContent').style.display = 'block';
  });
  document.getElementById('ftoFileBackButton')?.addEventListener('click', () => {
    hideAllSections();
    document.getElementById('mainContent').style.display = 'block';
  });

  document.getElementById('OrientationGenerateButton')?.addEventListener('click', e => {
    e.preventDefault();
    generateOrientationBBCode();
    document.getElementById('oriBBCodeOutput')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('DORGenerateButton')?.addEventListener('click', e => {
    e.preventDefault();
    generateDORBBCode();
    document.getElementById('dorBBCodeOutput')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('generateWeekly')?.addEventListener('click', e => {
    e.preventDefault();
    generateWeeklyBBCode();
    document.getElementById('weeklyBBCodeOutput')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('generateFTOFile')?.addEventListener('click', e => {
    e.preventDefault();
    generateFTOFileBBCode();
    document.getElementById('ftoFileBBCodeOutput')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById("submitMonthlyLogs")?.addEventListener("click", submitMonthlyLogSection);
  });

  document.getElementById('remedialRequired')?.addEventListener('change', function () {
    const container = document.getElementById('remedialDetailsContainer');
    container.style.display = this.value === 'Yes' ? 'block' : 'none';
  });

document.getElementById("formButton")?.addEventListener("click", handleSidebarSaveEdit);



  document.getElementById("orientationResetButton")?.addEventListener("click", resetOrientationForm);
  document.getElementById("dorResetButton")?.addEventListener("click", resetDORForm);
  document.getElementById("weeklyResetButton")?.addEventListener("click", resetWeeklyForm);

  document.getElementById("submitMonthlyLogs")?.addEventListener("click", submitMonthlyLogSection);
});

export function handleSidebarSaveEdit(e) {
  e.preventDefault();
  const form = document.getElementById("officerForm");
  const button = document.getElementById("formButton");

  if (button.textContent === "SAVE") {
    const name = document.getElementById("officerName").value;
    const serial = document.getElementById("serialNumber").value;
    const time = document.getElementById("ftpTime").value;
    const url = document.getElementById("ftoUrl").value;

    localStorage.setItem("officerName", name);
    localStorage.setItem("serialNumber", serial);
    localStorage.setItem("ftpTime", time);
    localStorage.setItem("ftoUrl", url);

    form.innerHTML = `
  <div id="nameAndSerial">
    <span id="officerNameStatic" class="static-text">${name}</span><br>
    <span id="serialNumberStatic" class="static-text">#${serial}</span><br>
    <span id="ftpTimeStatic" class="static-text">FTP Time: ${time}</span><br>
    <a href="${url}" class="static-text" target="_blank" style="color:#0094FF;">FTO FILE</a>
  </div>
  <button id="formButton" type="submit">EDIT</button>
`;

  } else {
    const name = localStorage.getItem("officerName") || "";
    const serial = localStorage.getItem("serialNumber") || "";
    const time = localStorage.getItem("ftpTime") || "";
    const url = localStorage.getItem("ftoUrl") || "";

    form.innerHTML = `
      <div id="nameAndSerial">
        <input id="officerName" type="text" placeholder="Officer Name" value="${name}" />
        <input id="serialNumber" type="text" placeholder="Serial Number" value="${serial}" />
      </div>
      <input id="ftpTime" type="text" placeholder="Total FTP Time (HH:MM)" value="${time}" />
      <input id="ftoUrl" type="url" placeholder="FTO File URL" value="${url}" />
      <button id="formButton" type="submit">SAVE</button>
    `;
  }

  setTimeout(() => {
    document.getElementById("formButton")?.addEventListener("click", handleSidebarSaveEdit);
  }, 0);
}