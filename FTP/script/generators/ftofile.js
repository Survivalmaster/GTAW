import { saveReport } from "../utils/localstorage.js";

export const monthlyLogs = [];

export const historicalLogs = JSON.parse(localStorage.getItem("historicalFTOLogs") || "[]");

export function setupMonthlyLogButton() {
  const container = document.getElementById("monthlyLogInputsContainer");
  const addBtn = document.getElementById("addLogEntry");

  if (!addBtn || !container || addBtn.dataset.bound === "true") return;

  addBtn.dataset.bound = "true";

  addBtn.addEventListener("click", () => {
    const group = document.createElement("div");
    group.classList.add("log-entry");

    group.innerHTML = `
      <input type="text" class="log-date" placeholder="DD/MMM/YYYY" />
      <select class="log-type dropdown-select">
        <option value="GUIDED">GUIDED</option>
        <option value="EVALUATION">EVALUATION</option>
        <option value="CAPS SESSION">CAPS SESSION</option>
      </select>
      <input type="text" class="log-length" placeholder="Length (e.g. 30)" />
      <input type="text" class="log-url" placeholder="Report URL" />
      <input type="text" class="log-name" placeholder="Student Name" />
    `;

    container.appendChild(group);
  });
 document.getElementById("showAllLogs")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelectorAll("#monthlyLogInputsContainer > .log-entry, #monthlyLogInputsContainer > h2").forEach(el => {
    el.style.display = "block";
  });
});
}

export function renderMonthlyLogs() {
  const container = document.getElementById("monthlyLogInputsContainer");
  if (!container) return;

  container.innerHTML = "";

  const now = new Date();
  const currentMonth = now.toLocaleString("default", { month: "long" }).toUpperCase();
  const currentYear = now.getFullYear();
  const currentLabel = `${currentMonth}, ${currentYear}`;

  const groups = {};

  monthlyLogs.forEach(log => {
    const dateObj = new Date(log.date);
    const month = dateObj.toLocaleString("default", { month: "long" }).toUpperCase();
    const year = dateObj.getFullYear();
    const label = `${month}, ${year}`;

    if (!groups[label]) groups[label] = [];
    groups[label].push(log);
  });

  const sortedLabels = Object.keys(groups).sort((a, b) => {
    const aDate = new Date(a + " 1");
    const bDate = new Date(b + " 1");
    return bDate - aDate;
  });

  sortedLabels.forEach(label => {
    const isCurrent = label === currentLabel;

    const heading = document.createElement("h2");
    heading.textContent = label;
    heading.style.color = "white";
    heading.style.textAlign = "center";
    heading.style.marginBottom = "10px";
    heading.style.display = isCurrent ? "block" : "none";
    container.appendChild(heading);

    groups[label].forEach(log => {
      const group = document.createElement("div");
      group.classList.add("log-entry");
      group.style.display = isCurrent ? "block" : "none";

      group.innerHTML = `
        <input type="text" class="log-date" value="${log.date}" placeholder="DD/MMM/YYYY" />
        <select class="log-type dropdown-select">
          <option value="GUIDED" ${log.type === "GUIDED" ? "selected" : ""}>GUIDED</option>
          <option value="EVALUATION" ${log.type === "EVALUATION" ? "selected" : ""}>EVALUATION</option>
          <option value="CAPS SESSION" ${log.type === "CAPS SESSION" ? "selected" : ""}>CAPS SESSION</option>
        </select>
        <input type="text" class="log-length" value="${log.length}" placeholder="Length (e.g. 30)" />
        <input type="text" class="log-url" value="${log.url}" placeholder="Report URL" />
        <input type="text" class="log-name" value="${log.name}" placeholder="Student Name" />
      `;

      container.appendChild(group);
    });
  });
}

export function generateFTOFileBBCode() {
  const name = document.getElementById("ftoFileName")?.value || "";
  const serial = document.getElementById("ftoFileSerial")?.value || "";
  const division = document.getElementById("ftoFileDivision")?.value || "MISSION ROW/METRO";
  const ftpTime = document.getElementById("ftoFileTime")?.value || "00:00";

  let bbcode = "";
  bbcode += "[font=Arial][center]LOS SANTOS POLICE DEPARTMENT\n";
  bbcode += "[size=120][color=black][b]FIELD TRAINING OFFICER\n";
  bbcode += "TRAINING FILE[/b][/font][/color][/size][/center]\n\n";

  bbcode += "[table2=1,black,transparent,Arial]\n[tr]\n";
  bbcode += `[tdwidth=1,black,transparent,top,left,25,5][size=87]FIELD TRAINING OFFICER[/size]\n${name}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]SERIAL NO.[/size]\n${serial}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,18,5][size=87]DIVISION[/size]\n${division}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,20,5][size=87]TOTAL INSTRUCTION TIME[/size]\n${ftpTime}[/tdwidth][/tr]\n[/table2][font=Arial]\n`;

  const monthlyInputs = document.querySelectorAll(".log-entry");
  monthlyLogs.length = 0;

  monthlyInputs.forEach(entry => {
    const date = entry.querySelector(".log-date")?.value.trim();
    const type = entry.querySelector(".log-type")?.value.trim();
    const length = entry.querySelector(".log-length")?.value.trim();
    const url = entry.querySelector(".log-url")?.value.trim();
    const name = entry.querySelector(".log-name")?.value.trim();

    const alreadyExists = monthlyLogs.some(log =>
      log.date === date &&
      log.type === type &&
      log.length === length &&
      log.url === url &&
      log.name === name
    );

    if (date && type && length && url && name && !alreadyExists) {
      monthlyLogs.push({ date, type, length, url, name });
    }
  });

  const historical = JSON.parse(localStorage.getItem("historicalFTOLogs") || "[]");
  const allLogs = [...monthlyLogs, ...historical];
  const groupedLogs = {};

  allLogs.forEach(log => {
    const parts = log.date.split('/');
    if (parts.length !== 3) return;
    const [day, month, year] = parts;
    const key = `${month.toUpperCase()}, ${year}`;
    if (!groupedLogs[key]) groupedLogs[key] = [];
    groupedLogs[key].push(log);
  });

  const parseKey = key => {
    const [monthName, year] = key.split(', ');
    return new Date(`${monthName} 1, ${year}`);
  };

  const sortedKeys = Object.keys(groupedLogs).sort((a, b) => parseKey(a) - parseKey(b));

  bbcode += `\n[size=120][b]MONTHLY LOGS[/b][/size]\n`;

  sortedKeys.forEach(key => {
    const entries = groupedLogs[key];
    let totalMins = 0;

    entries.forEach(log => {
      let mins = 0;
      if (log.length.includes(":")) {
        const [h, m] = log.length.split(":").map(Number);
        mins = h * 60 + (m || 0);
      } else {
        mins = parseInt(log.length, 10);
      }
      totalMins += isNaN(mins) ? 0 : mins;
    });

    const hours = String(Math.floor(totalMins / 60)).padStart(2, "0");
    const mins = String(totalMins % 60).padStart(2, "0");

    bbcode += `[b]${key} - Total Time:[/b] ${hours}:${mins}\n[list]\n`;
    entries.forEach(log => {
      const type = log.type ? `${log.type} - ` : "";
      bbcode += `[*]${log.date} - ${type}${log.length}  - [url=${log.url}]${log.name}[/url]\n`;
    });
    bbcode += "[/list]\n";
  });

  saveReport("ftofile");
  localStorage.setItem("monthlyFTOLogs", JSON.stringify(monthlyLogs));
  renderMonthlyLogs();

  const output = document.getElementById("ftoFileBBCodeOutput");
  output.value = bbcode;
  output.select();
  navigator.clipboard.writeText(bbcode).catch(console.error);
}

const MONTH_MAP = {
  JAN: "January",
  FEB: "February",
  MAR: "March",
  APR: "April",
  MAY: "May",
  JUN: "June",
  JUL: "July",
  AUG: "August",
  SEP: "September",
  OCT: "October",
  NOV: "November",
  DEC: "December"
};

function calculateTotalMonthlyTime() {
let totalMins = 0;
if (log.length.includes(":")) {
  const [h, m] = log.length.split(":").map(Number);
  totalMins = (h * 60) + m;
} else {
  totalMins = parseInt(log.length, 10);
}

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function getCurrentMonthYearLabel() {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" }).toUpperCase();
  const year = now.getFullYear();
  return `${month}, ${year}`;
}

function isAllCaps(str) {
  return str === str.toUpperCase() && /[A-Z]/.test(str);
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function submitMonthlyLogSection() {
  const raw = prompt("Paste your current FTO file here:");
  if (!raw || !raw.includes("[list]")) return;

  const logs = [];
  const lines = raw.split(/\r?\n/);

  lines.forEach(line => {
    const rawDate = line.match(/(\d{2})\/([A-Z]{3})\/(\d{4})/i);
    const date = rawDate ? `${rawDate[1]}/${MONTH_MAP[rawDate[2].toUpperCase()]}/${rawDate[3]}` : null;
    const length =
  line.match(/(\d{1,2}:\d{1,2})/)?.[1] ||
  line.match(/-\s*(\d{3,4})\s*-/)?.[1] || // Matches ` - 00380  - `
  line.match(/(\d{1,4})\s*Minutes/i)?.[1];
    const urlMatch = line.match(/\[url=(.+?)\](.+?)\[\/url\]/i);

    if (!date || !length || !urlMatch) return;

    const [_, url, name] = urlMatch;
    const upper = line.toUpperCase();

    let type = null;
    if (upper.includes("GUIDED")) type = "GUIDED";
    else if (upper.includes("EVALUATION")) type = "EVALUATION";
    else if (upper.includes("CAP")) type = "CAP";

    logs.push({
      date,
      type,
      length: length.padStart(5, "0"),
      url: url.trim(),
      name: isAllCaps(name) ? toTitleCase(name.trim()) : name.trim()
    });
  });

  if (logs.length === 0) {
    alert("No valid log entries were found.");
    return;
  }

  localStorage.setItem("historicalFTOLogs", JSON.stringify(logs));
  alert(`${logs.length} patrol log(s) saved successfully.`);
}