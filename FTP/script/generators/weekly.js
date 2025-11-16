import { getRatingToken, getSelectedValue } from '../utils/utils.js';
import { saveReport } from '../utils/localstorage.js';
import { dorCategories } from '../utils/config.js';

export function generateWeeklyBBCode() {
  const getValue = id => document.getElementById(id)?.value || "";

  const officer = getValue("weeklyOfficer");
  const serial = getValue("weeklyOfficerSerial");
  const ftm = getValue("weeklyFTM");
  const ftmSerial = getValue("weeklyFTMSerial");
  const discussion = getValue("weeklyDiscussion");
  const strengths = getValue("strengthsDiscussionStatus");
  const weaknesses = getValue("weaknessesDiscussionStatus");
  const remedial = getValue("remedialRequired");
  const remedialDetails = getValue("remedialDetails");
  const performance = getValue("weeklyPerformanceSelect");

  let bbcode = "";
  bbcode += "[font=Arial][color=black]Page [u]1[/u] of [u]1[/u][/color][/font]\n";
  bbcode += "[hr][/hr]\n";
  bbcode += "[font=Arial][center]LOS SANTOS POLICE DEPARTMENT\n";
  bbcode += "[size=120][color=black][b]PROBATIONARY POLICE OFFICER WEEKLY EVALUATION REPORT[/b][/font][/color][/size][/center]\n\n";

  bbcode += "[table2=1,black,transparent,Arial]\n[tr]\n";
  bbcode += `[tdwidth=1,black,transparent,top,left,30,5][size=87]PROBATIONARY POLICE OFFICER[/size]\n${officer}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]SERIAL NO.[/size]\n${serial}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,25,5][size=87]FIELD TRAINING MANAGER[/size]\n${ftm}[/tdwidth]\n`;
  bbcode += `[tdwidth=1,black,transparent,top,left,8,5][size=87]SERIAL NO.[/size]\n${ftmSerial}[/tdwidth][/tr]\n[/table2]\n\n`;

  bbcode += "[font=Arial][b]RATING INSTRUCTIONS: Use the following scale to summarize the probationary officer’s performance. A DOR comment must justify any (1), (2), or (4) rating. Use (N/O) if not observed.[/b][/font]\n";
  bbcode += "[list=none][b][u]BELOW STANDARD[/u][/b] - Inability to accomplish tasks.\n";
  bbcode += "(2) [b][u]IMPROVEMENT REQUIRED[/u][/b] - Progressing but below standard.\n";
  bbcode += "(3) [b][u]STANDARD[/u][/b] - Meets expectations.\n";
  bbcode += "(4) [b][u]ABOVE STANDARD[/u][/b] - Exceeds expectations.\n";
  bbcode += "(N/O) [b][u]NOT OBSERVED[/u][/b] - Not observed.\n[/list]\n\n";

  bbcode += "[table]\n";
  bbcode += "[tr][td][b]Category[/b][/td][td][center]1[/center][/td][td][center]2[/center][/td][td][center]3[/center][/td][td][center]4[/center][/td][td][center]N/O[/center][/td][/tr]\n";

  let index = 1;
  dorCategories.forEach(group => {
    bbcode += `[tr][td colspan="6"][b]${group.title}[/b][/td][/tr]\n`;
    group.items.forEach(label => {
      const selected = getSelectedValue(`weeklyRating${index}`);
      bbcode += "[tr]\n";
      bbcode += `[td]${label}[/td]`;
      ["1", "2", "3", "4", "N/O"].forEach(r => {
        bbcode += `[td][center]${getRatingToken(selected, r)}[/center][/td]`;
      });
      bbcode += "[/tr]\n";
      index++;
    });
  });

  bbcode += "[/table]\n\n";

  bbcode += "[table2=1,black,transparent,Arial]\n";
  bbcode += "[tr][tdwidth=1,black,transparent,top,left,100,5][b]Performance Discussion:[/b]\n";
  bbcode += "[list]\n";
  bbcode += `[*]${strengths} the Probationer's strengths.\n`;
  bbcode += `[*]${weaknesses} the Probationer's weaknesses.\n`;
  bbcode += `[*]Remedial training was ${remedial === "Yes" ? "provided" : "not provided"}.\n`;
  bbcode += "[/list]\n\n";
  bbcode += "[b]Remedial Details:[/b]\n[list][*]" + (remedial === "Yes" ? (remedialDetails || "N/A") : "N/A") + "[/list]\n";
  bbcode += "[b]Comments:[/b]\n[list][*]" + (discussion || "N/A") + "[/list]\n";
  bbcode += "[/tr][/table2]\n\n";

  bbcode += `[aligntable=left,30,0,0,0,0,0][table2=1,black,transparent,Arial][tr][tdwidth=1,black,transparent,top,left,100,5][size=87]SIGNATURE OF FIELD TRAINING MANAGER[/size]\n${ftm}[/tr][/table2][/aligntable]\n\n`;

  bbcode += "[aligntable=right,0,0,0,0,0,0][center][font=Arial][size=110][b]Weekly Performance[/b][/size][/font][/center]\n";
  bbcode += "A continuation of unsatisfactory performance may result in termination.\n";
  if (performance === "Satisfactory") {
    bbcode += "[cbc][/cbc] Satisfactory [space=200][cb][/cb] Unsatisfactory";
  } else if (performance === "Unsatisfactory") {
    bbcode += "[cb][/cb] Satisfactory [space=200][cbc][/cbc] Unsatisfactory";
  } else {
    bbcode += "[cb][/cb] Satisfactory [space=200][cb][/cb] Unsatisfactory";
  }
  bbcode += "[/aligntable]";

  const outputElem = document.getElementById("weeklyBBCodeOutput");
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

  saveReport("weekly");
}
