import { getRatingToken } from '../utils/utils.js';
import { saveReport } from '../utils/localstorage.js';
import { dorCategories } from '../utils/config.js';

export function generateDORBBCode() {
  const getValue = id => document.getElementById(id)?.value || "";

  const dorOfficer = getValue("dorOfficer");
  const dorOfficerSerial = getValue("dorOfficerSerial");
  const dorFTO = getValue("dorFTO");
  const dorFTOSerial = getValue("dorFTOSerial");
  const dorPatrolNumber = getValue("dorPatrolNumber");
  const dorDate = getValue("dorDate");
  const dorTime = getValue("dorTime");
  const dorDuration = getValue("dorDuration");
  const dorIncidentsTasks = getValue("dorIncidentsTasks");
  const dorBelowStandard = getValue("dorBelowStandard");
  const dorAboveStandard = getValue("dorAboveStandard");
  const learningGoalsExplanation = getValue("dorLearningGoalsExplain");
  const dorRoleplayRemarks = getValue("dorRoleplayRemarks");

  let bbcode = "";
  bbcode += "[font=Arial][color=black]Page [u]1[/u] of [u]1[/u][/color][/font]\n";
  bbcode += "[hr][/hr]\n";
  bbcode += "[font=Arial][center]LOS SANTOS POLICE DEPARTMENT\n";
  bbcode += "[size=120][color=black][b]PROBATIONARY POLICE OFFICER \n";
  bbcode += "DAILY OBSERVATION REPORT[/b][/font][/color][/size][/center]\n\n";

  bbcode += "[table2=1,black,transparent,Arial]\n[tr]\n";
  bbcode += `[tdwidth=1,black,transparent,top,left,30,5][size=87]PROBATIONARY POLICE OFFICER[/size]\n${dorOfficer}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]SERIAL NO.[/size]\n${dorOfficerSerial}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,25,5][size=87]FIELD TRAINING OFFICER[/size]\n${dorFTO}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]SERIAL NO.[/size]\n${dorFTOSerial}[/tdwidth][/tr]\n`;

  bbcode += "[tr]\n";
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]PATROL NUMBER[/size]\n${dorPatrolNumber}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,25,5][size=87]DATE[/size]\n${dorDate}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,15,5][size=87]TIME[/size]\n${dorTime}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,15,5][size=87]DURATION[/size]\n${dorDuration}[/tdwidth][/tr]\n`;
  bbcode += "[/table2]\n\n";

  bbcode += "[font=Arial][b][size=110]INCIDENTS/TASKS[/size][/b][/font]\n\n";
  bbcode += `${dorIncidentsTasks}\n\n`;

  bbcode += "[font=Arial][b][size=110]BELOW STANDARD PERFORMANCE[/size][/b][/font]\n\n";
  bbcode += `${dorBelowStandard || "Below standard performance details here"}\n\n`;

  bbcode += "[font=Arial][b][size=110]ABOVE STANDARD PERFORMANCE[/size][/b][/font]\n\n";
  bbcode += `${dorAboveStandard || "Above standard performance details here"}\n\n`;

  bbcode += "[font=Arial][b][size=110]LEARNING GOALS[/size][/b][/font]\n\n";
  bbcode += `${learningGoalsExplanation || "Explain what you taught here."}\n\n`;

  bbcode += "[font=Arial][b][size=110](( ROLEPLAY REMARKS ))[/size][/b][/font]\n\n";
  bbcode += `[ooc]${dorRoleplayRemarks || "Remarks here"}[/ooc]\n\n`;

  bbcode += "[font=Arial][b][size=110]EVALUATION CATEGORIES[/size][/b][/font]\n\n";
  bbcode += "[b]RATING INSTRUCTIONS: Use the following scale to rate the Probationary Officer's performance. A SPECIFIC comment MUST be made if a rating of (1), (2), or (4) is given. Check NOT OBSERVED (N/O) if behavior was not observed.[/b]\n";

  bbcode += "[list=none]\n";
  bbcode += "(1) [b][u]BELOW STANDARD[/u][/b] - Inability to accomplish required tasks.\n";
  bbcode += "(2) [b][u]IMPROVEMENT REQUIRED[/u][/b] - Progressing but below standard.\n";
  bbcode += "(3) [b][u]STANDARD[/u][/b] - Adequate performance.\n";
  bbcode += "(4) [b][u]ABOVE STANDARD[/u][/b] - Exceeds expectations.\n";
  bbcode += "(N/O) [b][u]NOT OBSERVED[/u][/b] - Not observed.\n";
  bbcode += "[/list]\n\n";

  bbcode += "[table]\n";
  bbcode += "[tr][td][font=Arial][b]Category[/b][/font][/td]";
  bbcode += "[td][center][b]1[/b][/center][/td][td][center][b]2[/b][/center][/td][td][center][b]3[/b][/center][/td][td][center][b]4[/b][/center][/td][td][center][b]N/O[/b][/center][/td][/tr]\n";

  let ratingIndex = 1;

  dorCategories.forEach(group => {
    bbcode += `[tr][td colspan="6"][font=Arial][b]${group.title}[/b][/font][/td][/tr]\n`;
    group.items.forEach(item => {
      const selected = document.querySelector(`input[name="dorRating${ratingIndex}"]:checked`);
      const selectedValue = selected ? selected.value : "0";

      bbcode += "[tr]\n";
      bbcode += `[td][font=Arial]${item}[/font][/td]\n`;
      ["1", "2", "3", "4", "N/O"].forEach(value => {
        bbcode += `[td][center]${getRatingToken(selectedValue, value)}[/center][/td]\n`;
      });
      bbcode += "[/tr]\n";
      ratingIndex++;
    });
  });

  bbcode += "[/table]";

  const outputElem = document.getElementById('dorBBCodeOutput');
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

  saveReport("dor");
}
