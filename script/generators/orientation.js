import { getOrientationToken } from '../utils/utils.js';
import { saveReport } from '../utils/localstorage.js';

export function generateOrientationBBCode() {
  const getValue = id => document.getElementById(id)?.value || "";

  const oriOfficer = getValue("oriOfficer");
  const oriOfficerSerial = getValue("oriOfficerSerial");
  const oriFTO = getValue("oriFTO");
  const oriFTOSerial = getValue("oriFTOSerial");
  const oriPatrolNumber = getValue("oriPatrolNumber");
  const oriDate = getValue("oriDate");
  const oriTime = getValue("oriTime");
  const oriDuration = getValue("oriDuration");
  const oriIncidentsTasks = getValue("oriIncidentsTasks");

  let bbcode = "";
  bbcode += "[font=Arial][color=black]Page [u]1[/u] of [u]1[/u][/color][/font]\n";
  bbcode += "[hr][/hr]\n";
  bbcode += "[font=Arial][center]LOS SANTOS POLICE DEPARTMENT\n";
  bbcode += "[size=120][color=black][b]PROBATIONARY POLICE OFFICER \n";
  bbcode += "INTRODUCTORY AND ORIENTATION REPORT[/b][/font][/color][/size][/center]\n\n";

  bbcode += "[table2=1,black,transparent,Arial]\n";
  bbcode += "[tr]\n";
  bbcode += `[tdwidth=1,black,transparent,top,left,30,5][size=87]PROBATIONARY POLICE OFFICER[/size]\n${oriOfficer}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]SERIAL NO.[/size]\n${oriOfficerSerial}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,25,5][size=87]FIELD TRAINING OFFICER[/size]\n${oriFTO}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]SERIAL NO.[/size]\n${oriFTOSerial}[/tdwidth][/tr]\n`;

  bbcode += "[tr]\n";
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]PATROL NUMBER[/size]\n${oriPatrolNumber}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,25,5][size=87]DATE[/size]\n${oriDate}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,15,5][size=87]TIME[/size]\n${oriTime}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,15,5][size=87]DURATION[/size]\n${oriDuration}[/tdwidth][/tr]\n`;
  bbcode += "[/table2]\n\n";

  bbcode += "[font=Arial][b][size=110]ORIENTATION CHECKLIST[/size][/b][/font]\n";
  bbcode += "[br][/br][table]\n";
  bbcode += "[tr][td][font=Arial][b]ADMINISTRATIVE[/b][/font][/td][td][center][b]✓[/b][/center][/td][td][center][b]✘[/b][/center][/td][/tr]\n";

  const checklist = [
    { label: "1. Probationer's Divisional Notebook Created", name: "oriRating1" },
    { label: "2. Uniform and Equipment Checks", name: "oriRating2", section: "FIELD" },
    { label: "3. Mission Row Familiarization", name: "oriRating3" },
    { label: "4. Radio Setup", name: "oriRating4" },
    { label: "5. Vehicle Checks (ELS, Maintenance Forms etc.)", name: "oriRating5" },
    { label: "6. Teamspeak Binds (Central / TACs)", name: "oriRating6", section: "((OUT OF CHARACTER))" },
    { label: "7. Vehicle Spawning", name: "oriRating7" },
    { label: "8. General Faction Commands", name: "oriRating8" }
  ];

  checklist.forEach((item, i) => {
    if (item.section) {
      bbcode += `[tr][td colspan="3"][font=Arial][b]${item.section}[/b][/font][/td][/tr]\n`;
    }
    const token = getOrientationToken(item.name);
    bbcode += `[tr][td][font=Arial]${item.label}[/font][/td]` +
              `[td][center]${token.yes}[/center][/td]` +
              `[td][center]${token.no}[/center][/td][/tr]\n`;
  });

  bbcode += "[/table]\n\n[br][/br]\n";
  bbcode += "[font=Arial][b][size=110]INCIDENTS/TASKS[/size][/b][/font]\n\n";
  bbcode += `${oriIncidentsTasks}\n\n`;

  const outputElem = document.getElementById('oriBBCodeOutput');
  outputElem.value = bbcode;
  outputElem.select();

  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(bbcode);
    } else {
      document.execCommand("copy");
    }
  } catch (err) {
    console.error("Clipboard copy failed", err);
  }

  saveReport("orientation");
}