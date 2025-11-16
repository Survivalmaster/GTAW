/* =========================================================
   LSPD Traffic Division – Generators (single source of truth)
   Exposes:
     window.initOICForm, window.initCEICForm, window.initFCForm, window.initCICForm
   Relies on:
     - app.js templates (tplOIC/tplCEIC/tplFC/tplCIC)
     - app.js utilities: updateOutputTitle (passed in), setBB (passed in)
     - window.logActivity (optional; graceful if missing)
   ========================================================= */

/* ---------- Small helpers ---------- */
function isImageUrl(v){ return /\.(png|jpe?g|gif|webp)$/i.test((v||'').trim()); }
function toDD_MON_YYYY(dateStr){
  if(!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d)) return 'N/A';
  const dd = String(d.getDate()).padStart(2,'0');
  const mon = d.toLocaleString('en-US',{month:'short'}).toUpperCase();
  return `${dd}/${mon}/${d.getFullYear()}`;
}

/* =========================================================
   OIC (Officer Involved Collision)
   ========================================================= */
function blockOICOfficer(i){ return `
  <div class="form-section oic-officer" data-index="${i}">
    <h4>Officer #${i+1}</h4>
    <div class="form-row">
      <label class="full">Full Name<input type="text" class="o_name"></label>
    </div>
    <div class="form-row">
      <label>Department Rank
        <select class="o_rank">
          <option>Police Officer I</option><option>Police Officer II</option><option>Police Officer III</option><option>Police Officer III+1</option>
          <option>Detective I</option><option>Detective II</option><option>Detective III</option>
          <option>Sergeant I</option><option>Sergeant II</option><option>Lieutenant I</option><option>Lieutenant II</option>
          <option>Captain I</option><option>Captain II</option><option>Captain III</option>
          <option>Commander</option><option>Assistant Chief of Police</option><option>Deputy Chief of Police</option><option>Chief of Police</option>
        </select>
      </label>
      <label>Serial Number<input type="text" class="o_serial"></label>
    </div>
    <div class="form-row">
      <label>Vehicle Registration Plate<input type="text" class="o_plate"></label>
      <label>Agency<input type="text" class="o_agency" value="Los Santos Police Department" readonly></label>
    </div>
    <div class="inline-actions"><button type="button" class="btn ghost o_remove">Remove</button></div>
  </div>`; }

function blockOICCivilian(i){ return `
  <div class="form-section oic-civilian" data-index="${i}">
    <h4>Civilian #${i+1}</h4>
    <div class="form-row">
      <label class="full">Full Name<input type="text" class="civ_name" placeholder="e.g., John Doe"></label>
    </div>
    <div class="form-row">
      <label>Make &amp; Model<input type="text" class="civ_make" placeholder="e.g., Vapid Dominator"></label>
      <label>Vehicle Registration Plate<input type="text" class="civ_plate" placeholder="e.g., 12ABC345"></label>
    </div>
    <div class="inline-actions"><button type="button" class="btn ghost civ_remove">Remove</button></div>
  </div>`; }

function blockEvidence(i, prefix){ return `
  <div class="form-section ${prefix}-evidence" data-index="${i}">
    <h4>Evidence #${i+1}</h4>
    <div class="form-row">
      <label>Evidence Name<input type="text" class="ev_name" placeholder="e.g., Dashcam clip #1"></label>
      <label>Evidence Content<textarea class="ev_body" placeholder="Paste content or link"></textarea></label>
    </div>
    <div class="inline-actions"><button type="button" class="btn ghost ev_remove">Remove</button></div>
  </div>`; }

function initOICForm(updateTitle, setBB){
  const root = document.getElementById('form-container');
  const offWrap = root.querySelector('#oic_officers');
  const civWrap = root.querySelector('#oic_civilians');
  const evWrap  = root.querySelector('#oic_evidence');

  // seed one of each
  offWrap.innerHTML = blockOICOfficer(0);
  civWrap.innerHTML = blockOICCivilian(0);
  evWrap.innerHTML  = blockEvidence(0,'oic');

  // adders
  root.querySelector('#oic_add_officer').addEventListener('click', ()=>{
    const i = offWrap.querySelectorAll('.oic-officer').length;
    offWrap.insertAdjacentHTML('beforeend', blockOICOfficer(i));
    renumber();
  });
  root.querySelector('#oic_add_civilian').addEventListener('click', ()=>{
    const i = civWrap.querySelectorAll('.oic-civilian').length;
    civWrap.insertAdjacentHTML('beforeend', blockOICCivilian(i));
    renumber();
  });
  root.querySelector('#oic_add_evidence').addEventListener('click', ()=>{
    const i = evWrap.querySelectorAll('.oic-evidence').length;
    evWrap.insertAdjacentHTML('beforeend', blockEvidence(i,'oic'));
    renumber();
  });

  // removers
  root.addEventListener('click', (e)=>{
    if(e.target.classList.contains('o_remove')){
      const n = offWrap.querySelectorAll('.oic-officer').length;
      if(n>1) e.target.closest('.oic-officer').remove(), renumber();
    }
    if(e.target.classList.contains('civ_remove')){
      const n = civWrap.querySelectorAll('.oic-civilian').length;
      if(n>1) e.target.closest('.oic-civilian').remove(), renumber();
    }
    if(e.target.classList.contains('ev_remove')){
      const n = evWrap.querySelectorAll('.oic-evidence').length;
      if(n>1) e.target.closest('.oic-evidence').remove(), renumber();
    }
  });

  function renumber(){
    offWrap.querySelectorAll('.oic-officer h4').forEach((h,i)=>h.textContent=`Officer #${i+1}`);
    civWrap.querySelectorAll('.oic-civilian h4').forEach((h,i)=>h.textContent=`Civilian #${i+1}`);
    evWrap .querySelectorAll('.oic-evidence  h4').forEach((h,i)=>h.textContent=`Evidence #${i+1}`);
    // disable removes at 1
    const toggle = (sel, btnSel)=>{
      const n = root.querySelectorAll(sel).length;
      root.querySelectorAll(btnSel).forEach(b=>{ b.disabled = n<=1; b.style.opacity = n<=1 ? .5 : 1; });
    };
    toggle('#oic_officers .oic-officer', '#oic_officers .o_remove');
    toggle('#oic_civilians .oic-civilian', '#oic_civilians .civ_remove');
    toggle('#oic_evidence  .oic-evidence',  '#oic_evidence  .ev_remove');
  }
  renumber();

  // defaults + title listeners
  const now = new Date();
  root.querySelector('#oic_date').value = now.toISOString().slice(0,10);
  root.querySelector('#oic_time').value = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;

  ['oic_date','oic_road','oic_area'].forEach(id=>{
    const el = root.querySelector('#'+id); el?.addEventListener('input', updateTitle); el?.addEventListener('change', updateTitle);
  });
  updateTitle();

  // generate
  root.querySelector('#oic_generate').addEventListener('click', ()=>{
    setBB( bbOIC(root) );
    updateTitle();
    if (window.logActivity) window.logActivity('TCI','Officer Involved Collision');
  });
}

function bbOIC(root){
  const officers=[...root.querySelectorAll('#oic_officers .oic-officer')].map(sec=>({
    name:sec.querySelector('.o_name')?.value||'',
    rank:sec.querySelector('.o_rank')?.value||'',
    serial:sec.querySelector('.o_serial')?.value||'',
    plate:sec.querySelector('.o_plate')?.value||'',
    agency:sec.querySelector('.o_agency')?.value||''
  })).filter(o=>o.name||o.plate||o.serial);
  const civs=[...root.querySelectorAll('#oic_civilians .oic-civilian')].map(sec=>({
    name:sec.querySelector('.civ_name')?.value||'',
    make:sec.querySelector('.civ_make')?.value||'',
    plate:sec.querySelector('.civ_plate')?.value||''
  })).filter(c=>c.name||c.plate||c.make);

  const date = toDD_MON_YYYY(root.querySelector('#oic_date')?.value||'');
  const time = root.querySelector('#oic_time')?.value || 'N/A';
  const road = root.querySelector('#oic_road')?.value || 'N/A';
  const cross= root.querySelector('#oic_cross')?.value || 'N/A';
  const area = root.querySelector('#oic_area')?.value || 'N/A';
  const details = root.querySelector('#oic_details')?.value || 'N/A';

  const evs=[...root.querySelectorAll('#oic_evidence .oic-evidence')].map(sec=>{
    const n=sec.querySelector('.ev_name')?.value||''; const b=sec.querySelector('.ev_body')?.value||'';
    return (n||b) ? `[altspoiler=${n||'Evidence'}]${b||'N/A'}[/altspoiler]` : '';
  }).filter(Boolean);

  const oBlock = officers.map(o=>`[b]Full Name:[/b] ${o.name}
[b]Department Rank:[/b] ${o.rank}
[b]Serial Number:[/b] ${o.serial}
[b]Vehicle Registration Plate:[/b] ${o.plate}
[b]Agency:[/b] ${o.agency}`).join('\n\n');

  const cBlock = civs.map(c=>`[b]Full Name:[/b] ${c.name}
[b]Make & Model:[/b] ${c.make}
[b]Vehicle Registration Plate:[/b] ${c.plate}`).join('\n\n');

  const concl = root.querySelector('input[name="oic_conclusion"]:checked')?.value || 'notfault';
  const notfault = concl==='notfault' ? '[cbc]' : '[cb]';
  const fault    = concl==='fault'    ? '[cbc]' : '[cb]';
  const sigRaw = root.querySelector('#oic_signature')?.value?.trim() || '';
  const sig = sigRaw ? (isImageUrl(sigRaw) ? `[img]${sigRaw}[/img]` : sigRaw) : 'Signature Link Here or replace with typed signature';

  const header = `[divbox2=transparent][center][tedlogo=200]
[b][size=160]LOS SANTOS POLICE DEPARTMENT[/size][/b]
[size=160]TRAFFIC COLLISION INVESTIGATION REPORT[/size]
[size=140]OFFICER INVOLVED COLLISION[/size]
[/center]
[hr][/hr]`;

  const body = `
[size=120][b]INVOLVED OFFICER DETAILS[/b][/size]
[size=85]Repeat if multiple driving officers/city employees were involved. Do not include passengers.[/size]
${oBlock ? oBlock+'\n' : ''}

[size=120][b]INVOLVED CIVILIAN DETAILS[/b][/size]
[size=85]Repeat if multiple driving civilians were involved. Do not include passengers.[/size]
${cBlock ? cBlock+'\n' : ''}

[size=120][b]COLLISION DETAILS[/b][/size]
[b]Date of Incident:[/b] ${date}
[b]Time of Incident:[/b] ${time}
[b]Road:[/b] ${road}
[b]Nearest Crossroad:[/b] ${cross}
[b]Area:[/b] ${area}

[hr]
[b]Details of Incident:[/b] ${details}
${evs.length? evs.join('\n')+'\n' : ''}

[size=120][b]CONCLUSION[/b][/size]
[size=85]Please tick as appropriate.[/size]
[list=none]
[*]${notfault} [size=85] The officer(s) involved were not at fault for the collision and no further follow up is necessary.[/size]
[*]${fault} [size=85] One or more officer(s) are at fault or share fault for causing the collision and further follow up is necessary.[/size]
[/list]
[hr]
[b]Traffic Officer's Signature:[/b] ${sig}`;

  return header + body;
}

/* =========================================================
   CEIC (City Employee Involved Collision)
   ========================================================= */
function blockCEICEmployee(i){ return `
  <div class="form-section ceic-emp" data-index="${i}">
    <h4>City Employee #${i+1}</h4>
    <div class="form-row">
      <label class="full">Full Name<input type="text" class="e_name"></label>
    </div>
    <div class="form-row">
      <label>Department Rank<input type="text" class="e_rank"></label>
      <label>Serial Number<input type="text" class="e_serial"></label>
    </div>
    <div class="form-row">
      <label>Vehicle Registration Plate<input type="text" class="e_plate"></label>
      <label>Agency<input type="text" class="e_agency" placeholder="e.g., City of Los Santos"></label>
    </div>
    <div class="inline-actions"><button type="button" class="btn ghost ceic_emp_remove">Remove</button></div>
  </div>`; }

function blockCEICCivilian(i){ return `
  <div class="form-section ceic-civilian" data-index="${i}">
    <h4>Civilian #${i+1}</h4>
    <div class="form-row"><label class="full">Full Name<input type="text" class="civ_name"></label></div>
    <div class="form-row"><label class="full">Make &amp; Model<input type="text" class="civ_make"></label></div>
    <div class="form-row"><label class="full">Vehicle Registration Plate<input type="text" class="civ_plate"></label></div>
    <div class="inline-actions"><button type="button" class="btn ghost ceic_civ_remove">Remove</button></div>
  </div>`; }

function initCEICForm(updateTitle, setBB){
  const root = document.getElementById('form-container');
  const empWrap = root.querySelector('#ceic_employees');
  const civWrap = root.querySelector('#ceic_civilians');
  const evWrap  = root.querySelector('#ceic_evidence');

  // seed
  empWrap.innerHTML = blockCEICEmployee(0);
  civWrap.innerHTML = blockCEICCivilian(0);
  evWrap.innerHTML  = blockEvidence(0,'ceic');

  // adders
  root.querySelector('#ceic_add_emp').addEventListener('click', ()=>{
    const i = empWrap.querySelectorAll('.ceic-emp').length;
    empWrap.insertAdjacentHTML('beforeend', blockCEICEmployee(i));
    renumber();
  });
  root.querySelector('#ceic_add_civilian').addEventListener('click', ()=>{
    const i = civWrap.querySelectorAll('.ceic-civilian').length;
    civWrap.insertAdjacentHTML('beforeend', blockCEICCivilian(i));
    renumber();
  });
  root.querySelector('#ceic_add_evidence').addEventListener('click', ()=>{
    const i = evWrap.querySelectorAll('.ceic-evidence').length;
    evWrap.insertAdjacentHTML('beforeend', blockEvidence(i,'ceic'));
    renumber();
  });

  // removers
  root.addEventListener('click', (e)=>{
    if(e.target.classList.contains('ceic_emp_remove')){
      const n = empWrap.querySelectorAll('.ceic-emp').length;
      if(n>1) e.target.closest('.ceic-emp').remove(), renumber();
    }
    if(e.target.classList.contains('ceic_civ_remove')){
      const n = civWrap.querySelectorAll('.ceic-civilian').length;
      if(n>1) e.target.closest('.ceic-civilian').remove(), renumber();
    }
    if(e.target.classList.contains('ev_remove')){
      const n = evWrap.querySelectorAll('.ceic-evidence').length;
      if(n>1) e.target.closest('.ceic-evidence').remove(), renumber();
    }
  });

  function renumber(){
    empWrap.querySelectorAll('.ceic-emp h4').forEach((h,i)=>h.textContent=`City Employee #${i+1}`);
    civWrap.querySelectorAll('.ceic-civilian h4').forEach((h,i)=>h.textContent=`Civilian #${i+1}`);
    evWrap .querySelectorAll('.ceic-evidence h4').forEach((h,i)=>h.textContent=`Evidence #${i+1}`);
    const toggle = (sel, btnSel)=>{
      const n = root.querySelectorAll(sel).length;
      root.querySelectorAll(btnSel).forEach(b=>{ b.disabled = n<=1; b.style.opacity = n<=1 ? .5 : 1; });
    };
    toggle('#ceic_employees .ceic-emp', '#ceic_employees .ceic_emp_remove');
    toggle('#ceic_civilians .ceic-civilian', '#ceic_civilians .ceic_civ_remove');
    toggle('#ceic_evidence  .ceic-evidence',  '#ceic_evidence  .ev_remove');
  }
  renumber();

  // defaults + title listeners
  const now = new Date();
  root.querySelector('#ceic_date').value = now.toISOString().slice(0,10);
  root.querySelector('#ceic_time').value = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
  ['ceic_date','ceic_road','ceic_area'].forEach(id=>{
    const el = root.querySelector('#'+id); el?.addEventListener('input', updateTitle); el?.addEventListener('change', updateTitle);
  });
  updateTitle();

  // generate
  root.querySelector('#ceic_generate').addEventListener('click', ()=>{
    setBB( bbCEIC(root) );
    updateTitle();
    if (window.logActivity) window.logActivity('TCI','City Employee Involved Collision');
  });
}

function bbCEIC(root){
  const emps=[...root.querySelectorAll('#ceic_employees .ceic-emp')].map(sec=>({
    name:sec.querySelector('.e_name')?.value||'',
    rank:sec.querySelector('.e_rank')?.value||'',
    serial:sec.querySelector('.e_serial')?.value||'',
    plate:sec.querySelector('.e_plate')?.value||'',
    agency:sec.querySelector('.e_agency')?.value||''
  })).filter(e=>e.name||e.plate||e.serial);
  const civs=[...root.querySelectorAll('#ceic_civilians .ceic-civilian')].map(sec=>({
    name:sec.querySelector('.civ_name')?.value||'',
    make:sec.querySelector('.civ_make')?.value||'',
    plate:sec.querySelector('.civ_plate')?.value||''
  })).filter(c=>c.name||c.plate||c.make);

  const date = toDD_MON_YYYY(root.querySelector('#ceic_date')?.value||'');
  const time = root.querySelector('#ceic_time')?.value || 'N/A';
  const road = root.querySelector('#ceic_road')?.value || 'N/A';
  const cross= root.querySelector('#ceic_cross')?.value || 'N/A';
  const area = root.querySelector('#ceic_area')?.value || 'N/A';
  const details = root.querySelector('#ceic_details')?.value || 'N/A';

  const evs=[...root.querySelectorAll('#ceic_evidence .ceic-evidence')].map(sec=>{
    const n=sec.querySelector('.ev_name')?.value||''; const b=sec.querySelector('.ev_body')?.value||'';
    return (n||b) ? `[altspoiler=${n||'Evidence'}]${b||'N/A'}[/altspoiler]` : '';
  }).filter(Boolean);

  const eBlock = emps.map(o=>`[b]Full Name:[/b] ${o.name}
[b]Department Rank:[/b] ${o.rank}
[b]Serial Number:[/b] ${o.serial}
[b]Vehicle Registration Plate:[/b] ${o.plate}
[b]Agency:[/b] ${o.agency}`).join('\n\n');

  const cBlock = civs.map(c=>`[b]Full Name:[/b] ${c.name}
[b]Make & Model:[/b] ${c.make}
[b]Vehicle Registration Plate:[/b] ${c.plate}`).join('\n\n');

  const concl = root.querySelector('input[name="ceic_conclusion"]:checked')?.value || 'notfault';
  const notfault = concl==='notfault' ? '[cbc]' : '[cb]';
  const fault    = concl==='fault'    ? '[cbc]' : '[cb]';
  const sigRaw = root.querySelector('#ceic_signature')?.value?.trim() || '';
  const sig = sigRaw ? (isImageUrl(sigRaw) ? `[img]${sigRaw}[/img]` : sigRaw) : 'Signature Link Here or replace with typed signature';

  const header = `[divbox2=transparent][center][tedlogo=200]
[b][size=160]LOS SANTOS POLICE DEPARTMENT[/size][/b]
[size=160]TRAFFIC COLLISION INVESTIGATION REPORT[/size]
[size=140]CITY EMPLOYEE INVOLVED COLLISION[/size]
[/center]
[hr][/hr]`;

  const body = `
[size=120][b]INVOLVED CITY EMPLOYEE DETAILS[/b][/size]
[size=85]Repeat if multiple driving officers/city employees were involved. Do not include passengers.[/size]
${eBlock ? eBlock+'\n' : ''}

[size=120][b]INVOLVED CIVILIAN DETAILS[/b][/size]
[size=85]Repeat if multiple driving civilians were involved. Do not include passengers.[/size]
${cBlock ? cBlock+'\n' : ''}

[size=120][b]COLLISION DETAILS[/b][/size]
[b]Date of Incident:[/b] ${date}
[b]Time of Incident:[/b] ${time}
[b]Road:[/b] ${road}
[b]Nearest Crossroad:[/b] ${cross}
[b]Area:[/b] ${area}

[hr]
[b]Details of Incident:[/b] ${details}
${evs.length? evs.join('\n')+'\n' : ''}

[size=120][b]CONCLUSION[/b][/size]
[size=85]Please tick as appropriate.[/size]
[list=none]
[*]${notfault} [size=85] The city employee(s) involved were not at fault for the collision and no further follow up is necessary.[/size]
[*]${fault} [size=85] One or more city employee(s) are at fault or share fault for causing the collision and further follow up is necessary.[/size]
[/list]
[hr]
[b]Traffic Officer's Signature:[/b] ${sig}`;

  return header + body;
}

/* =========================================================
   FC (Fatality Collision)
   ========================================================= */
function blockFCEvidence(i){ return `
  <div class="form-section fc-evidence" data-index="${i}">
    <h4>Evidence #${i+1}</h4>
    <div class="form-row">
      <label>Evidence Name<input type="text" class="fc_ev_name"></label>
      <label>Evidence Content<input type="text" class="fc_ev_content"></label>
    </div>
    <div class="inline-actions"><button type="button" class="btn ghost fc_ev_remove">Remove</button></div>
  </div>`; }

function initFCForm(updateTitle, setBB){
  const root = document.getElementById('form-container');
  const evWrap = root.querySelector('#fc_evidence');

  evWrap.innerHTML = blockFCEvidence(0);
  renumber();

  root.querySelector('#fc_add_evidence')?.addEventListener('click', ()=>{
    const i = evWrap.querySelectorAll('.fc-evidence').length;
    evWrap.insertAdjacentHTML('beforeend', blockFCEvidence(i));
    renumber();
  });
  root.addEventListener('click',(e)=>{
    if(e.target.classList.contains('fc_ev_remove')){
      const n = evWrap.querySelectorAll('.fc-evidence').length;
      if(n>1) e.target.closest('.fc-evidence').remove(), renumber();
    }
  });

  function renumber(){
    evWrap.querySelectorAll('.fc-evidence h4').forEach((h,i)=>h.textContent=`Evidence #${i+1}`);
    const n = evWrap.querySelectorAll('.fc-evidence').length;
    evWrap.querySelectorAll('.fc_ev_remove').forEach(b=>{ b.disabled = n<=1; b.style.opacity = n<=1 ? .5 : 1; });
  }

  // defaults + title listeners
  const now = new Date();
  root.querySelector('#fc_date').value = now.toISOString().slice(0,10);
  root.querySelector('#fc_time').value = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
  ['fc_date','fc_road','fc_area'].forEach(id=>{
    const el = root.querySelector('#'+id); el?.addEventListener('input', updateTitle); el?.addEventListener('change', updateTitle);
  });
  updateTitle();

  // generate
  root.querySelector('#fc_generate').addEventListener('click', ()=>{
    setBB( bbFC(root) );
    updateTitle();
    if (window.logActivity) window.logActivity('TCI','Fatality Collision');
  });
}

function bbFC(root){
  const name   = root.querySelector('#fc_officer_name')?.value || 'N/A';
  const rank   = root.querySelector('#fc_officer_rank')?.value || 'N/A';
  const serial = root.querySelector('#fc_officer_serial')?.value || 'N/A';

  const primary = `[size=120][b]PRIMARY OFFICER DETAILS[/b][/size]
[b]Full Name:[/b] ${name}
[b]Department Rank:[/b] ${rank}
[b]Serial Number:[/b] ${serial}`;

  const date = toDD_MON_YYYY(root.querySelector('#fc_date')?.value||'');
  const time = root.querySelector('#fc_time')?.value || 'N/A';
  const road = root.querySelector('#fc_road')?.value || 'N/A';
  const cross= root.querySelector('#fc_cross')?.value || 'N/A';
  const area = root.querySelector('#fc_area')?.value || 'N/A';

  const collision = `[size=120][b]COLLISION DETAILS[/b][/size]
[b]Date of Incident:[/b] ${date}
[b]Time of Incident:[/b] ${time}
[b]Road:[/b] ${road}
[b]Nearest Crossroad:[/b] ${cross}
[b]Area:[/b] ${area}`;

  const details = root.querySelector('#fc_details')?.value || 'N/A';
  const evs=[...root.querySelectorAll('#fc_evidence .fc-evidence')].map(sec=>{
    const n=sec.querySelector('.fc_ev_name')?.value||''; const b=sec.querySelector('.fc_ev_content')?.value||'';
    return (n||b) ? `[altspoiler=${n||'Evidence'}]${b||'N/A'}[/altspoiler]` : '';
  }).filter(Boolean);

  const conc = root.querySelector('input[name="fc_conclusion"]:checked')?.value || 'deceased';
  const deceased = conc==='deceased' ? '[cbc]' : '[cb]';
  const otherNeg = conc==='other_crimneg' ? '[cbc]' : '[cb]';
  const otherHR  = conc==='other_hitrun' ? '[cbc]' : '[cb]';

  const sigRaw = root.querySelector('#fc_signature')?.value?.trim() || '';
  const sig = sigRaw ? (isImageUrl(sigRaw) ? `[img]${sigRaw}[/img]` : sigRaw) : 'Signature Link Here or replace with typed signature';

  const header = `[divbox2=transparent][center][tedlogo=200]
[b][size=160]LOS SANTOS POLICE DEPARTMENT[/size][/b]
[size=160]TRAFFIC COLLISION INVESTIGATION REPORT[/size]
[size=140]FATALITY COLLISION[/size]
[/center]
[hr][/hr]`;

  return header + `

` + primary + `

[hr]

` + collision + `

[hr]
[b]Details of Incident:[/b] ${details}
${evs.length? '\n'+evs.join('\n') : ''}

[hr][/hr]
[size=120][b]CONCLUSION[/b][/size]
[size=85]Please tick as appropriate.[/size]
[list=none]
[*] ${deceased} [size=85]The deceased party was at fault for the collision.[/size]
[*] ${otherNeg} [size=85]The other involved party was at fault, or share fault, for the collision with criminal negligence.[/size]
[*] ${otherHR} [size=85]The other involved party was at fault, or share fault, with the incident being a Hit and Run.[/size]
[/list]
[hr]
[b]Traffic Officer's Signature:[/b] ${sig}`;
}

/* =========================================================
   CIC (Civilian Collision)
   ========================================================= */
function blockCICDriver(i){ return `
  <div class="form-section cic-driver" data-index="${i}">
    <h4>Driver #${i+1}</h4>
    <div class="form-row">
      <label class="full">Full Name<input type="text" class="drv_name"></label>
    </div>
    <div class="form-row">
      <label>Vehicle Registration Plate<input type="text" class="drv_plate"></label>
      <label>Make/Model<input type="text" class="drv_make"></label>
    </div>
    <div class="inline-actions"><button type="button" class="btn ghost cic_remove_driver">Remove</button></div>
  </div>`; }

function blockCICEvidence(i){ return `
  <div class="form-section cic-evidence" data-index="${i}">
    <h4>Evidence #${i+1}</h4>
    <div class="form-row">
      <label>Evidence Name<input type="text" class="cic_ev_name"></label>
      <label>Evidence Content<input type="text" class="cic_ev_content"></label>
    </div>
    <div class="inline-actions"><button type="button" class="btn ghost cic_ev_remove">Remove</button></div>
  </div>`; }

function initCICForm(updateTitle, setBB){
  const root = document.getElementById('form-container');
  const dWrap = root.querySelector('#cic_drivers');
  const eWrap = root.querySelector('#cic_evidence');

  // seed
  dWrap.innerHTML = blockCICDriver(0);
  eWrap.innerHTML = blockCICEvidence(0);
  renumber();

  // adders
  root.querySelector('#cic_add_driver').addEventListener('click', ()=>{
    const i = dWrap.querySelectorAll('.cic-driver').length;
    dWrap.insertAdjacentHTML('beforeend', blockCICDriver(i));
    renumber();
  });
  root.querySelector('#cic_add_evidence').addEventListener('click', ()=>{
    const i = eWrap.querySelectorAll('.cic-evidence').length;
    eWrap.insertAdjacentHTML('beforeend', blockCICEvidence(i));
    renumber();
  });

  // removers
  root.addEventListener('click',(e)=>{
    if(e.target.classList.contains('cic_remove_driver')){
      const n = dWrap.querySelectorAll('.cic-driver').length;
      if(n>1) e.target.closest('.cic-driver').remove(), renumber();
    }
    if(e.target.classList.contains('cic_ev_remove')){
      const n = eWrap.querySelectorAll('.cic-evidence').length;
      if(n>1) e.target.closest('.cic-evidence').remove(), renumber();
    }
  });

  function renumber(){
    dWrap.querySelectorAll('.cic-driver h4').forEach((h,i)=>h.textContent=`Driver #${i+1}`);
    eWrap.querySelectorAll('.cic-evidence h4').forEach((h,i)=>h.textContent=`Evidence #${i+1}`);
    const toggle = (sel, btnSel)=>{
      const n = root.querySelectorAll(sel).length;
      root.querySelectorAll(btnSel).forEach(b=>{ b.disabled = n<=1; b.style.opacity = n<=1 ? .5 : 1; });
    };
    toggle('#cic_drivers .cic-driver',  '#cic_drivers .cic_remove_driver');
    toggle('#cic_evidence .cic-evidence','#cic_evidence .cic_ev_remove');
  }
  renumber();

  // defaults + title listeners
  const now = new Date();
  root.querySelector('#cic_date').value = now.toISOString().slice(0,10);
  root.querySelector('#cic_time').value = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
  ['cic_date','cic_road','cic_area'].forEach(id=>{
    const el = root.querySelector('#'+id); el?.addEventListener('input', updateTitle); el?.addEventListener('change', updateTitle);
  });
  updateTitle();

  // generate
  root.querySelector('#cic_generate').addEventListener('click', ()=>{
    setBB( bbCIC(root) );
    updateTitle();
    if (window.logActivity) window.logActivity('TCI','Civilian Collision');
  });
}

function bbCIC(root){
  const drivers=[...root.querySelectorAll('#cic_drivers .cic-driver')].map((sec,i)=>({
    name:sec.querySelector('.drv_name')?.value||'',
    plate:sec.querySelector('.drv_plate')?.value||'',
    make:sec.querySelector('.drv_make')?.value||'',
    idx:i+1
  })).filter(d=>d.name||d.plate||d.make);

  const date = toDD_MON_YYYY(root.querySelector('#cic_date')?.value||'');
  const time = root.querySelector('#cic_time')?.value || 'N/A';
  const road = root.querySelector('#cic_road')?.value || 'N/A';
  const cross= root.querySelector('#cic_cross')?.value || 'N/A';
  const area = root.querySelector('#cic_area')?.value || 'N/A';
  const details = root.querySelector('#cic_details')?.value || 'N/A';

  const evs=[...root.querySelectorAll('#cic_evidence .cic-evidence')].map(sec=>{
    const n=sec.querySelector('.cic_ev_name')?.value||''; const b=sec.querySelector('.cic_ev_content')?.value||'';
    return (n||b) ? `[altspoiler=${n||'Evidence'}]${b||'N/A'}[/altspoiler]` : '';
  }).filter(Boolean);

  const dBlock = drivers.map(d=>`[u]Driver ${d.idx}[/u]
[b]Full Name:[/b] ${d.name}
[b]Vehicle Registration Plate:[/b] ${d.plate}
[b]Make & Model:[/b] ${d.make}`).join('\n\n');

  const conc = root.querySelector('input[name="cic_conclusion"]:checked')?.value || 'd1';
  const d1   = conc==='d1'   ? '[cbc]' : '[cb]';
  const d2   = conc==='d2'   ? '[cbc]' : '[cb]';
  const both = conc==='both' ? '[cbc]' : '[cb]';
  const sigRaw = root.querySelector('#cic_signature')?.value?.trim() || '';
  const sig = sigRaw ? (isImageUrl(sigRaw) ? `[img]${sigRaw}[/img]` : sigRaw) : 'Signature Link Here or replace with typed signature';

  const header = `[divbox2=transparent][center][tedlogo=200]
[b][size=160]LOS SANTOS POLICE DEPARTMENT[/size][/b]
[size=160]TRAFFIC COLLISION INVESTIGATION REPORT[/size]
[size=140]CIVILIAN COLLISION[/size]
[/center]
[hr][/hr]`;

  const body = `
[size=120][b]INVOLVED DRIVERS DETAILS[/b][/size]
[size=85]Repeat if more then two drivers are involved. Do not include passengers.[/size]
${dBlock ? dBlock+'\n' : ''}

[size=120][b]COLLISION DETAILS[/b][/size]
[b]Date of Incident:[/b] ${date}
[b]Time of Incident:[/b] ${time}
[b]Road:[/b] ${road}
[b]Nearest Crossroad:[/b] ${cross}
[b]Area:[/b] ${area}

[hr]
[b]Details of Incident:[/b] ${details}
${evs.length? evs.join('\n')+'\n' : ''}

[size=120][b]CONCLUSION[/b][/size]
[size=85]Please tick as appropriate.[/size]
[list=none]
[*] ${d1} [size=85]Driver one is at fault for causing the collision.[/size]
[*] ${d2} [size=85]Driver two is at fault for causing the collision.[/size]
[*] ${both} [size=85]Both drivers are mutually at fault for causing the collision.[/size]
[/list]
[hr]
[b]Traffic Officer's Signature:[/b] ${sig}`;

  return header + body;
}

/* ---------- Expose initializers ---------- */
window.initOICForm  = initOICForm;
window.initCEICForm = initCEICForm;
window.initFCForm   = initFCForm;
window.initCICForm  = initCICForm;
