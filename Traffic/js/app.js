/* =========================================
   LSPD Traffic Division – App Shell + Shift Diary
   (Generators live in generators.js)
   ========================================= */

let activeForm = null;

/* ------------------------
   Hub / TCR visibility
   ------------------------ */
function showHub(){
  document.querySelectorAll('.hub-card, .activity-log').forEach(el=>el.classList.remove('hidden'));
  document.querySelector('.tcr-section')?.classList.add('hidden');
  // Upcoming card should be visible on the dashboard
  document.getElementById('upcomingDash')?.classList.remove('hidden');
}
function showTCR(){
  document.querySelectorAll('.hub-card, .activity-log').forEach(el=>el.classList.add('hidden'));
  document.querySelector('.tcr-section')?.classList.remove('hidden');
  // Hide Upcoming card while a form is open
  document.getElementById('upcomingDash')?.classList.add('hidden');
}

// --- User Settings schema migration: name -> firstName/lastName ---
(function migrateUserSettings(){
  try{
    var us = JSON.parse(localStorage.getItem('userSettings') || '{}');
    // If already migrated, do nothing
    if (us && (us.firstName || us.lastName)) return;

    if (us && us.name) {
      var parts = String(us.name).trim().split(/\s+/);
      us.firstName = parts[0] || '';
      us.lastName  = parts.slice(1).join(' ') || '';
      delete us.name;
      localStorage.setItem('userSettings', JSON.stringify(us));
    }
  }catch(e){}
})();

/* ------------------------
   Datalists (inline, file:// safe)
   ------------------------ */
(function buildLists(){
  const streets = ["Abattoir Avenue","Abe Milton Parkway","Ace Jones Drive","Adam's Apple Boulevard","Aguja Street","Algonquin Boulevard","Alhambra Drive","Alta Place","Alta Street","Amarillo Vista","Amarillo Way","Americano Way","Armadillo Avenue","Atlee Street","Autopia Parkway","Banham Canyon Drive","Barbareno Road","Bay City Avenue","Bay City Incline","Baytree Canyon Road","Boulevard Del Perro","Bridge Street","Brouge Avenue","Buccaneer Way","Buen Vino Road","Caesars Place","Calafia Road","Calais Avenue","Capital Boulevard","Carcer Way","Carson Avenue","Cascabel Avenue","Cassidy Trail","Cat-Claw Avenue","Catfish View","Chianski Passage","Cholla Road","Cholla Springs Avenue","Chum Street","Chupacabra Street","Clinton Avenue","Cockingend Drive","Conquistador Street","Cortes Street","Cougar Avenue","Covenant Avenue","Cox Way","Crusade Road","Davis Avenue","Decker Street","Del Perro Freeway","Didion Drive","Dorset Drive","Dorset Place","Dry Dock Street","Duluoz Avenue","Dunstable Drive","Dunstable Lane","Dutch London Street","East Galileo Avenue","East Joshua Road","East Mirror Drive","Eastbourne Way","Eclipse Boulevard","Edwood Way","El Burro Boulevard","El Rancho Boulevard","Elgin Avenue","Elysian Fields Freeway","Equality Way","Exceptionalists Way","Fantastic Place","Fenwell Place","Fort Zancudo Approach Road","Forum Drive","Fudge Lane","Galileo Road","Gentry Lane","Ginger Street","Glory Way","Goma Street","Grapeseed Avenue","Grapeseed Main Street","Great Ocean Highway","Greenwich Parkway","Greenwich Place","Greenwich Way","Grove Street","Hanger Way","Hangman Avenue","Hardy Way","Hawick Avenue","Heritage Way","Hillcrest Avenue","Hillcrest Ridge Access Road","Imagination Court","Industry Passage","Ineseno Road","Innocence Boulevard","Integrity Way","Invention Court","Jamestown Street","Joad Lane","Joshua Road","Kimble Hill Drive","Kortz Drive","La Puerta Freeway","Labor Place","Laguna Place","Lake Vinewood Drive","Lake Vinewood Estate","Las Lagunas Boulevard","Lesbos Lane","Liberty Street","Lindsay Circus","Little Bighorn Avenue","Lolita Avenue","Los Santos Freeway","Low Power Street","Macdonald Street","Mad Wayne Thunder Drive","Magellan Avenue","Marathon Avenue","Marina Drive","Marlowe Drive","Melanoma Street","Meringue Lane","Meteor Street","Milton Road","Mirror Park Boulevard","Mirror Place","Morningwood Boulevard","Mount Haan Drive","Mount Haan Road","Mount Vinewood Drive","Mountain View Drive","Movie Star Way","Mutiny Road","New Empire Way","Nikola Avenue","Nikola Place","Niland Avenue","Normandy Drive","North Archer Avenue","North Calafia Way","North Conker Avenue","North Rockford Drive","North Sheldon Avenue","Nowhere Road","O'Neil Way","Occupation Avenue","Olympic Freeway","Orchardville Avenue","Paleto Boulevard","Palomino Avenue","Palomino Freeway","Panorama Drive","Peaceful Street","Perth Street","Picture Perfect Drive","Plaice Place","Playa Vista","Popular Street","Portola Drive","Power Street","Procopio Drive","Procopio Promenade","Prosperity Street","Prosperity Street Promenade","Pyrite Avenue","Raton Pass","Red Desert Avenue","Richman Street","Rockford Drive","Route 68","Route 68 Approach","Roy Lowenstein Boulevard","Rub Street","Sam Austin Drive","San Andreas Avenue","San Vitus Boulevard","Sandcastle Way","Seaview Road","Senora Freeway","Senora Road","Senora Way","Shank Street","Signal Street","Sinner Street","Sinners Passage","Smoke Tree Road","South Arsenal Street","South Boulevard Del Perro","South Mo Milton Drive","South Rockford Drive","South Shambles Street","Spanish Avenue","Steele Way","Strangeways Drive","Strawberry Avenue","Supply Street","Sustancia Road","Swiss Street","Tackle Street","Tangerine Street","Tongva Drive","Tower Way","Tug Street","Union Road","Utopia Gardens","Vespucci Boulevard","Vinewood Boulevard","Vinewood Park Drive","Vitus Street","Voodoo Place","West Eclipse Boulevard","West Galileo Avenue","West Mirror Drive","Whispymound Drive","Wild Oats Drive","York Street","Zancudo Avenue","Zancudo Barranca","Zancudo Road","Zancudo Trail","Rockford Plaza"];
  const areas = ["Alamo Sea","Alta","Banham Canyon","Banning","Bolingbroke Penitentiary","Braddock Pass","Burton","Calafia Bridge","Cassidy Creek","Chamberlain Hills","Chiliad Mountain State Wilderness","Chumash","Cypress Flats","Davis","Davis Quarry","Del Perro","Del Perro Beach","Downtown","Downtown Vinewood","East Vinewood","El Burro Heights","El Gondo Lighthouse","Elysian Island","Fort Zancudo","GWC and Golfing Society","Galilee","Grand Senora Desert","Grapeseed","Great Chaparral","Harmony","Hawick","Humane Labs and Research","La Mesa","La Puerta","Lago Zancudo","Land Act Dam","Land Act Reservoir","Legion Square","Little Seoul","Los Santos International Airport (LSIA)","Maze Bank Arena","Mirror Park","Mission Row","Morningwood","Mount Chiliad","Mount Gordo","Mount Josiah","Murrieta Heights","N.O.O.S.E","North Chumash","Pacific Bluffs","Palomino Highlands","Paleto Bay","Paleto Cove","Paleto Forest","Palmer-Taylor Power Station","Pillbox Hill","Port of South Los Santos","Procopio Beach","Rancho","Raton Canyon","Redwood Lights Track","Richards Majestic","Richman","Richman Glen","Rockford Hills","Ron Alternatives Wind Farm","San Chanski Mountain Range","Sandy Shores","Stab City","Strawberry","Tataviam Mountains","Terminal","Textile City","Tongva Hills","Vespucci","Vespucci Beach","Vespucci Canals","Vinewood","Vinewood Hills","Vinewood Racetrack","West Vinewood","Zancudo River"];

  const streetDL=document.createElement('datalist'); streetDL.id='street-list';
  streets.forEach(v=>{const o=document.createElement('option');o.value=v;streetDL.appendChild(o);});
  const areaDL=document.createElement('datalist'); areaDL.id='area-list';
  areas.forEach(v=>{const o=document.createElement('option');o.value=v;areaDL.appendChild(o);});
  document.body.appendChild(streetDL); document.body.appendChild(areaDL);
})();

/* ---------------------------------
   Utilities: title + clipboard + BB
   --------------------------------- */
function gv(id){ return (document.getElementById(id)?.value||'').trim(); }
function val(id){ return (document.getElementById(id)||{}).value||''; }

function setBB(text){
  const el = document.getElementById('bbcode');
  if (el) el.value = text || '';
}

function updateOutputTitle(){
  const code = activeForm ? activeForm.toUpperCase() : '---';
  let dateVal='', road='', area='';
  if(activeForm==='oic'){  dateVal=val('oic_date');  road=gv('oic_road');  area=gv('oic_area'); }
  if(activeForm==='ceic'){ dateVal=val('ceic_date'); road=gv('ceic_road'); area=gv('ceic_area'); }
  if(activeForm==='fc'){   dateVal=val('fc_date');   road=gv('fc_road');   area=gv('fc_area'); }
  if(activeForm==='cic'){  dateVal=val('cic_date');  road=gv('cic_road');  area=gv('cic_area'); }
  let ddmmyy='DDMMYY';
  if(dateVal){
    const d=new Date(dateVal); const dd=String(d.getDate()).padStart(2,'0');
    const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=String(d.getFullYear()).slice(-2);
    ddmmyy=`${dd}${mm}${yy}`;
  }
  const right = area ? `${road || 'STREET'}, ${area}` : (road || '');
  const el=document.getElementById('outTitle'); if(el) el.value = `[TCR-${code}-AM-${ddmmyy}] ${right}`.trim();
}

document.addEventListener('click', async (ev)=>{
  if(ev.target?.id === 'copy-bb'){
    const btn=ev.target, txt=(document.getElementById('bbcode')?.value)||'';
    try{ await navigator.clipboard.writeText(txt); const o=btn.textContent; btn.textContent='Copied!'; setTimeout(()=>btn.textContent=o,900);}catch{}
  }
  if(ev.target?.id === 'copyTitle'){
    const btn=ev.target, txt=(document.getElementById('outTitle')?.value)||'';
    try{ await navigator.clipboard.writeText(txt); const o=btn.textContent; btn.textContent='Copied!'; setTimeout(()=>btn.textContent=o,900);}catch{}
  }
});

/* =========================================
   Activity Log storage/render (today only)
   ========================================= */
function todayKey(){
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function loadActivityRaw(){
  return localStorage.getItem('tcr.activity.'+todayKey());
}
function loadActivity(){
  const raw = loadActivityRaw();
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveActivity(list){
  localStorage.setItem('tcr.activity.'+todayKey(), JSON.stringify(list||[]));
}

/* ===== Shift state (per day) ===== */
function loadShift(){
  try { return JSON.parse(localStorage.getItem('tcr.shift.'+todayKey())) || null; } catch { return null; }
}
function saveShift(s){ localStorage.setItem('tcr.shift.'+todayKey(), JSON.stringify(s||null)); }
function clearShift(){ localStorage.removeItem('tcr.shift.'+todayKey()); }

/* ===== Badge helper (icons) — crisp SVGs ===== */
function activityBadgeHTML(type, label = '') {
  const t = (type || '').toUpperCase();

  const svgPlay = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="activity-badge__svg">
        <path d="M8 5l11 7-11 7V5z" fill="currentColor"/>
      </svg>`;

  const svgStop = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="activity-badge__svg">
        <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
      </svg>`;

  const svgChart = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="activity-badge__svg">
    <path d="M5 19V5M9 19v-6M13 19v-3M17 19V8M21 19H3"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  const svgMeal = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="activity-badge__svg">
      <path d="M4 9a8 5 0 0 1 16 0H4z" fill="currentColor"/>
      <rect x="4" y="11" width="16" height="2" rx="1" ry="1" fill="currentColor"/>
      <path d="M4 15h16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="currentColor"/>
    </svg>`;

  const svgClipboard = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="activity-badge__svg">
    <rect x="5" y="4" width="14" height="16" rx="2" ry="2" fill="none"
          stroke="currentColor" stroke-width="2"/>
    <path d="M8 8h8M8 12h8M8 16h6"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  const svgCar = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="activity-badge__svg">
        <rect x="4" y="11" width="13" height="2" rx="1" ry="1"/>
        <path d="M3 13l1.5-5a2 2 0 0 1 1.9-1.5h9.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-12 0v3m10-3v3M6 16h.01M18 16h.01M5 13h14"
          fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  if (t === 'SHIFT_START')   return `<span class="activity-badge is-icon shift-start">${svgPlay}</span>`;
  if (t === 'SHIFT_END')     return `<span class="activity-badge is-icon shift-end">${svgStop}</span>`;
  if (t === 'SHIFT_SUMMARY') return `<span class="activity-badge is-icon shift-summary">${svgChart}</span>`;
  if (t === 'MEAL')          return `<span class="activity-badge is-icon meal">${svgMeal}</span>`;
  if (t === 'TASK')          return `<span class="activity-badge is-icon task">${svgClipboard}</span>`;

  if (t === 'OIC')  return `<span class="activity-badge collision-oic">${svgCar}</span>`;
  if (t === 'CEIC') return `<span class="activity-badge collision-ceic">${svgCar}</span>`;
  if (t === 'FC')   return `<span class="activity-badge collision-fc">${svgCar}</span>`;
  if (t === 'CIC')  return `<span class="activity-badge collision-cic">${svgCar}</span>`;

  if (t === 'TCI') {
    const txt = (label || '').toLowerCase();
    if (/officer/.test(txt) || /\boic\b/.test(txt))   return `<span class="activity-badge collision-oic">${svgCar}</span>`;
    if (/city/.test(txt)    || /\bceic\b/.test(txt))  return `<span class="activity-badge collision-ceic">${svgCar}</span>`;
    if (/fatal/.test(txt)   || /\bfc\b/.test(txt))    return `<span class="activity-badge collision-fc">${svgCar}</span>`;
    if (/civilian/.test(txt)|| /\bcic\b/.test(txt))   return `<span class="activity-badge collision-cic">${svgCar}</span>`;
    return `<span class="activity-badge collision-oic">${svgCar}</span>`;
  }

  return `<span class="activity-badge is-icon">${svgClipboard}</span>`;
}

/* ===== Render list ===== */
function renderActivity(list){
  const ul = document.getElementById('activityList');
  if (!ul) return;

  ul.innerHTML = (list||[]).map(it=>{
    const d = new Date(typeof it.time === 'number' ? it.time : Date.now());
    const hh = String(d.getUTCHours()).padStart(2,'0');
    const mm = String(d.getUTCMinutes()).padStart(2,'0');

    let title = it.title || '';
    let sub   = it.label || '';

    if (it.type === 'SHIFT_START'){
      title = 'Shift Started';
      const p = it.payload || {};
      const bits = [];
      if (p.callsign) bits.push(`Callsign: ${p.callsign}`);
      if (p.assignment) bits.push(p.assignment);
      if (p.partnerName || p.partnerBadge) bits.push(`Partner: ${p.partnerName||''}${p.partnerBadge?' #'+p.partnerBadge:''}`);
      if (p.area) bits.push(`Area: ${p.area}`);
      if (p.notes) bits.push(`Notes: ${p.notes}`);
      sub = bits.join(' • ');
    }

    if (it.type === 'SHIFT_END'){
      title = 'Shift Ended';
      const p = it.payload || {};
      const bits = [];
      if (p.callsign) bits.push(`Callsign: ${p.callsign}`);
      if (typeof p.durationMins === 'number'){
        const h = Math.floor(p.durationMins/60), m = p.durationMins % 60;
        bits.push(`Duration: ${h}h ${String(m).padStart(2,'0')}m`);
      }
      if (p.notes) bits.push(`Notes: ${p.notes}`);
      sub = bits.join(' • ');
    }

    if (it.type === 'MEAL'){
      title = 'Meal Break';
      const p = it.payload || {};
      sub = [p.mins ? `${p.mins} mins` : '', p.notes || ''].filter(Boolean).join(' • ');
    }

    if (it.type === 'TASK'){
      title = (it.payload && it.payload.title) ? it.payload.title : 'General Task';
      sub = (it.payload && it.payload.notes) ? it.payload.notes : '';
    }

    if (it.type === 'SHIFT_SUMMARY'){
      title = 'Shift Summary';
      const t = it.payload?.totals || {};
      sub = `TCIs: ${t.TCI||0} • Stops: ${t.STOP||0} • Citations: ${t.CITATION||0} • Warnings: ${t.WARNING||0} • Calls: ${t.CALL||0} • Tasks: ${t.TASK||0} • Meals: ${t.MEAL||0}`;
    }

    return `<li class="log-item">
      ${activityBadgeHTML(it.type, it.label || '')}
      <div>
        <div class="log-title">${title}</div>
        <div class="log-sub">${sub}</div>
      </div>
      <div class="log-time">${hh}:${mm}</div>
    </li>`;
  }).join('');

  const empty = document.getElementById('activityEmpty');
  if (empty) empty.style.display = list && list.length ? 'none' : 'block';

  const meta = document.getElementById('activityMeta');
  if (meta){
    const d = new Date();
    meta.textContent = d.toLocaleDateString(undefined, {
      weekday:'long', day:'2-digit', month:'short', year:'numeric'
    }).replace(/,/g,'');
  }

  updateShiftControls?.();
}

function pnk(v){ return (v||'').trim(); }

/* ===== Public log API (used by generators.js too) ===== */
function logActivity(type,label,title, timeOverride, payload){
  const list = loadActivity();
  list.unshift({
    type,
    label,
    title: (title ?? document.getElementById('outTitle')?.value) || '',
    time: (typeof timeOverride === 'number') ? timeOverride : new Date(timeOverride || Date.now()).getTime(),
    payload: payload || undefined
  });
  saveActivity(list);
  renderActivity(list);
}
window.logActivity = logActivity;


/* ===== Clear today ===== */
document.getElementById('clearActivity')?.addEventListener('click', ()=>{
  localStorage.removeItem('tcr.activity.'+todayKey());
  clearShift();
  renderActivity([]);
});

/* ===== Initial load ===== */
renderActivity(loadActivity());

/* =========================================
   SHIFT LIFE CYCLE + MANUAL ENTRIES (UI)
   ========================================= */
const shiftBtn   = document.getElementById('shiftToggleBtn');
const mealBtn    = document.getElementById('addMealBtn');
const taskBtn    = document.getElementById('addTaskBtn');

const shiftModal = document.getElementById('shiftModal');
const mealModal  = document.getElementById('mealModal');
const taskModal  = document.getElementById('taskModal');

function openModal(m) {
  if (!m) return;
  m.style.removeProperty('display');
  m.setAttribute('aria-hidden', 'false');
}
function closeModal(m) {
  if (!m) return;
  m.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.modal [data-close]').forEach(b=>b.addEventListener('click', e=> closeModal(e.target.closest('.modal')) ));
window.addEventListener('keydown', e=>{ if(e.key==='Escape'){ document.querySelectorAll('.modal').forEach(m=>closeModal(m)); } });

/* Partner toggle show/hide */
const partnerChk = document.getElementById('shift_partnered');
const partnerBlk = document.getElementById('shift_partner_block');
partnerChk?.addEventListener('change', ()=>{ if(partnerBlk) partnerBlk.style.display = partnerChk.checked ? '' : 'none'; });

/* Helpers for datetime-local defaults */
function toLocalDateTimeValue(d=new Date()){
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* Update button label based on shift state */
function updateShiftControls(){
  const btn = document.getElementById('shiftToggleBtn');
  const s = loadShift();
  if(!btn) return;
  if(s && s.active){
    btn.textContent = 'End Shift';
    btn.classList.add('danger');
  }else{
    btn.textContent = 'Start Shift';
    btn.classList.remove('danger');
  }
}

/* =========================================
   SHIFT LIFE CYCLE + MANUAL ENTRIES (UI)
   ========================================= */
(function wireShiftOnce(){
  if (window.__TD_SHIFT_WIRED__) return;
  window.__TD_SHIFT_WIRED__ = true;

  const shiftBtn        = document.getElementById('shiftToggleBtn');
  const shiftConfirmBtn = document.getElementById('shiftConfirmBtn');
  const shiftModal      = document.getElementById('shiftModal');
  const shiftModalTitle = document.getElementById('shiftModalTitle');

  function openModal(m){ if(!m) return; m.style.removeProperty('display'); m.setAttribute('aria-hidden','false'); }
  function closeModal(m){ if(!m) return; m.setAttribute('aria-hidden','true'); }

  document.querySelectorAll('.modal [data-close]')
    .forEach(b => b.addEventListener('click', e => closeModal(e.target.closest('.modal'))));
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => closeModal(m));
  });

  const partnerChk = document.getElementById('shift_partnered');
  const partnerBlk = document.getElementById('shift_partner_block');
  partnerChk?.addEventListener('change', ()=>{ if (partnerBlk) partnerBlk.style.display = partnerChk.checked ? '' : 'none'; });

  window.toLocalDateTimeValue = toLocalDateTimeValue;
  window.updateShiftControls  = updateShiftControls;

  shiftBtn?.addEventListener('click', ()=>{
    const s = loadShift();

    const startEl   = document.getElementById('shift_start_time');
    const callEl    = document.getElementById('shift_callsign');
    const asgEl     = document.getElementById('shift_assignment');
    const areaEl    = document.getElementById('shift_area');
    const pNameEl   = document.getElementById('shift_partner_name');
    const pBadgeEl  = document.getElementById('shift_partner_badge');
    const notesEl   = document.getElementById('shift_notes');

    const onShift = !!(s && s.active);

    if (shiftModalTitle) shiftModalTitle.textContent = onShift ? 'End Shift' : 'Start Shift';
    if (shiftConfirmBtn) shiftConfirmBtn.textContent = onShift ? 'End Shift' : 'Start Shift';

    if (startEl) startEl.value = toLocalDateTimeValue(new Date());
    if (callEl)  callEl.value  = onShift ? (s.callsign   || '') : '';
    if (asgEl)   asgEl.value   = onShift ? (s.assignment || '') : '';
    if (areaEl)  areaEl.value  = onShift ? (s.area       || '') : '';

    const partnered = onShift ? !!(s.partnerName || s.partnerBadge) : false;
    if (partnerChk) partnerChk.checked = partnered;
    if (partnerBlk) partnerBlk.style.display = partnered ? '' : 'none';
    if (pNameEl)  pNameEl.value  = onShift ? (s.partnerName  || '') : '';
    if (pBadgeEl) pBadgeEl.value = onShift ? (s.partnerBadge || '') : '';
    if (notesEl)  notesEl.value  = '';

    openModal(shiftModal);
  });

  shiftConfirmBtn?.addEventListener('click', ()=>{
    const s = loadShift();
    const isEnding = !!(s && s.active);

    const tsLocal = document.getElementById('shift_start_time')?.value;
    const when    = tsLocal ? new Date(tsLocal) : new Date();
    const ms      = when.getTime();

    const callsign    = (document.getElementById('shift_callsign')?.value || '').trim();
    const assignment  = (document.getElementById('shift_assignment')?.value || '').trim();
    const area        = (document.getElementById('shift_area')?.value || '').trim();
    const partnered   = !!document.getElementById('shift_partnered')?.checked;
    const partnerName = partnered ? (document.getElementById('shift_partner_name')?.value || '').trim() : '';
    const partnerBadge= partnered ? (document.getElementById('shift_partner_badge')?.value || '').trim() : '';
    const notes       = (document.getElementById('shift_notes')?.value || '').trim();

    if (!isEnding){
      saveShift({ active:true, startUTC:ms, callsign, assignment, area, partnerName, partnerBadge });
      logActivity('SHIFT_START','', '', ms, { callsign, assignment, area, partnerName, partnerBadge, notes });
    } else {
      s.active = false;
      s.endUTC = ms;
      saveShift(s);

      const summary = computeShiftSummary(s.startUTC, s.endUTC);
      logActivity('SHIFT_END','',   '', ms, { callsign: s.callsign, durationMins: summary.durationMins, notes });
      logActivity('SHIFT_SUMMARY','', '', ms, { totals: summary.totals });
    }

    renderActivity(loadActivity());
    updateShiftControls();

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    const m = document.getElementById('shiftModal');
    if (m) m.setAttribute('aria-hidden','true');
  });

  updateShiftControls();
})();

/* ----- Manual entries (Meal / Task) ----- */
if(mealBtn){
  mealBtn.addEventListener('click', ()=>{
    document.getElementById('meal_time').value = toLocalDateTimeValue(new Date());
    document.getElementById('meal_mins').value = 30;
    document.getElementById('meal_notes').value = '';
    openModal(mealModal);
  });
}
document.getElementById('mealConfirmBtn')?.addEventListener('click', ()=>{
  const ts = document.getElementById('meal_time').value;
  const when = ts ? new Date(ts) : new Date();
  const mins = parseInt(document.getElementById('meal_mins').value,10) || 0;
  const notes= pnk(document.getElementById('meal_notes').value);
  logActivity('MEAL','', '', when, { mins, notes });
  closeModal(mealModal);
});

if(taskBtn){
  taskBtn.addEventListener('click', ()=>{
    document.getElementById('task_time').value = toLocalDateTimeValue(new Date());
    document.getElementById('task_title').value = '';
    document.getElementById('task_notes').value = '';
    openModal(taskModal);
  });
}
document.getElementById('taskConfirmBtn')?.addEventListener('click', ()=>{
  const ts = document.getElementById('task_time').value;
  const when = ts ? new Date(ts) : new Date();
  const title = pnk(document.getElementById('task_title').value) || 'General Task';
  const notes = pnk(document.getElementById('task_notes').value);
  logActivity('TASK', '', '', when, { title, notes });
  closeModal(taskModal);
});

/* ===== Compute summary between start/end ===== */
function computeShiftSummary(startUTC, endUTC){
  const list = loadActivity();
  const PAD = 60 * 1000;
  const rangeStart = Math.max(0, startUTC - PAD);
  const rangeEnd   = endUTC + PAD;

  const within = list.filter(it => {
    const t = typeof it.time === 'number' ? it.time : 0;
    return t >= rangeStart && t <= rangeEnd;
  });

  const totals = { TCI:0, STOP:0, CITATION:0, WARNING:0, CALL:0, TASK:0, MEAL:0 };

  for (const it of within){
    const k = (it.type || '').toUpperCase().trim();
    if (k in totals) { totals[k]++; continue; }

    const lbl = (it.label || '').toLowerCase();
    if (k === '' && /collision/.test(lbl)) totals.TCI++;
  }

  const durationMins = Math.max(0, Math.round((endUTC - startUTC) / 60000));
  return { totals, durationMins };
}

/* -----------------------------
   Templates (forms)
   ----------------------------- */
function optRank(){
  return `
  <option>Police Officer I</option><option>Police Officer II</option><option>Police Officer III</option><option>Police Officer III+1</option>
  <option>Detective I</option><option>Detective II</option><option>Detective III</option>
  <option>Sergeant I</option><option>Sergeant II</option><option>Lieutenant I</option><option>Lieutenant II</option>
  <option>Captain I</option><option>Captain II</option><option>Captain III</option>
  <option>Commander</option><option>Assistant Chief of Police</option><option>Deputy Chief of Police</option><option>Chief of Police</option>`;
}

/* OIC */
function tplOIC(){ return `
<h3>Officer Involved Collision</h3>
<div class="inline-actions section-head"><span class="tag">INVOLVED OFFICER DETAILS</span><button class="btn ghost" id="oic_add_officer" type="button">+ Add Officer</button></div>
<div id="oic_officers"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">INVOLVED CIVILIAN DETAILS</span><button class="btn ghost" id="oic_add_civilian" type="button">+ Add Civilian</button></div>
<div id="oic_civilians"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">COLLISION DETAILS</span></div>
<div class="form-section">
  <div class="form-row">
    <label>Date of Incident<input type="date" id="oic_date"></label>
    <label>Time of Incident<input type="time" id="oic_time"></label>
  </div>
  <div class="form-row">
    <label>Road<input type="text" id="oic_road" list="street-list" placeholder="Start typing a street…"></label>
    <label>Nearest Crossroad<input type="text" id="oic_cross" list="street-list" placeholder="Start typing a street…"></label>
  </div>
  <div class="form-row"><label class="full">Area<input type="text" id="oic_area" list="area-list" placeholder="Start typing an area…"></label></div>
</div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">NARRATIVE &amp; EVIDENCE</span><button class="btn ghost" id="oic_add_evidence" type="button">+ Add Evidence</button></div>
<div class="form-section">
  <div class="form-row"><label class="full">Details of Incident
    <textarea id="oic_details" placeholder="(Include a full summary of your findings, including any statements from witnesses or the involved officer, as well as your conclusion.)"></textarea>
  </label></div>
</div>
<div id="oic_evidence"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">CONCLUSION</span></div>
<div class="form-section">
  <div class="radio-line">
    <input type="radio" name="oic_conclusion" id="oic_conc_notfault" value="notfault" checked>
    <label for="oic_conc_notfault" class="radio-label">The officer(s) involved were not at fault for the collision and no further follow up is necessary.</label>
  </div>
  <div class="radio-line">
    <input type="radio" name="oic_conclusion" id="oic_conc_fault" value="fault">
    <label for="oic_conc_fault" class="radio-label">One or more officer(s) are at fault or share fault for causing the collision and further follow up is necessary.</label>
  </div>
  <div class="form-row" style="margin-top:8px;"><label class="full">Officer Signature (URL or typed)
    <input type="text" id="oic_signature" placeholder="https://...png or John Smith"></label></div>
</div>
<div class="inline-actions"><button class="btn" id="oic_generate" type="button">Generate Report</button></div>
`;}

function tplCEIC(){ return `
<h3>City Employee Involved Collision</h3>
<div class="inline-actions section-head"><span class="tag">INVOLVED CITY EMPLOYEE DETAILS</span><button class="btn ghost" id="ceic_add_emp" type="button">+ Add Employee</button></div>
<div id="ceic_employees"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">INVOLVED CIVILIAN DETAILS</span><button class="btn ghost" id="ceic_add_civilian" type="button">+ Add Civilian</button></div>
<div id="ceic_civilians"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">COLLISION DETAILS</span></div>
<div class="form-section">
  <div class="form-row">
    <label>Date of Incident<input type="date" id="ceic_date"></label>
    <label>Time of Incident<input type="time" id="ceic_time"></label>
  </div>
  <div class="form-row">
    <label>Road<input type="text" id="ceic_road" list="street-list"></label>
    <label>Nearest Crossroad<input type="text" id="ceic_cross" list="street-list"></label>
  </div>
  <div class="form-row"><label class="full">Area<input type="text" id="ceic_area" list="area-list"></label></div>
</div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">NARRATIVE &amp; EVIDENCE</span><button class="btn ghost" id="ceic_add_evidence" type="button">+ Add Evidence</button></div>
<div class="form-section">
  <div class="form-row"><label class="full">Details of Incident
    <textarea id="ceic_details" placeholder="(Include a full summary of your findings, including any statements from witnesses or the involved employee, as well as your conclusion.)"></textarea>
  </label></div>
</div>
<div id="ceic_evidence"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">CONCLUSION</span></div>
<div class="form-section">
  <div class="radio-line">
    <input type="radio" name="ceic_conclusion" id="ceic_conc_notfault" value="notfault" checked>
    <label class="radio-label" for="ceic_conc_notfault">The city employee(s) involved were not at fault for the collision and no further follow up is necessary.</label>
  </div>
  <div class="radio-line">
    <input type="radio" name="ceic_conclusion" id="ceic_conc_fault" value="fault">
    <label class="radio-label" for="ceic_conc_fault">One or more city employee(s) are at fault or share fault for causing the collision and further follow up is necessary.</label>
  </div>
  <div class="form-row" style="margin-top:8px;"><label class="full">Officer Signature (URL or typed)
    <input type="text" id="ceic_signature" placeholder="https://...png or John Smith"></label></div>
</div>
<div class="inline-actions"><button class="btn" id="ceic_generate" type="button">Generate Report</button></div>
`;}

/* FC */
function tplFC(){ return `
<h3>Fatality Collision</h3>
<div class="inline-actions section-head"><span class="tag">PRIMARY OFFICER DETAILS</span></div>
<div class="form-section">
  <div class="form-row"><label class="full">Full Name<input type="text" id="fc_officer_name"></label></div>
  <div class="form-row">
    <label>Department Rank
      <select id="fc_officer_rank">${optRank()}</select>
    </label>
    <label>Serial Number<input type="text" id="fc_officer_serial"></label>
  </div>
</div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">COLLISION DETAILS</span></div>
<div class="form-section">
  <div class="form-row"><label>Date of Incident<input type="date" id="fc_date"></label><label>Time of Incident<input type="time" id="fc_time"></label></div>
  <div class="form-row"><label>Road<input type="text" id="fc_road" list="street-list"></label><label>Nearest Crossroad<input type="text" id="fc_cross" list="street-list"></label></div>
  <div class="form-row"><label class="full">Area<input type="text" id="fc_area" list="area-list"></label></div>
</div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">NARRATIVE &amp; EVIDENCE</span><button class="btn ghost" id="fc_add_evidence" type="button">+ Add Evidence</button></div>
<div class="form-section">
  <div class="form-row"><label class="full">Details of Incident
    <textarea id="fc_details"></textarea>
  </label></div>
</div>
<div id="fc_evidence"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">CONCLUSION</span></div>
<div class="form-section">
  <div class="radio-line"><input type="radio" name="fc_conclusion" id="fc_conc_deceased" value="deceased" checked>
    <label class="radio-label" for="fc_conc_deceased">The deceased party was at fault for the collision.</label></div>
  <div class="radio-line"><input type="radio" name="fc_conclusion" id="fc_conc_other_crimneg" value="other_crimneg">
    <label class="radio-label" for="fc_conc_other_crimneg">The other involved party was at fault, or share fault, for the collision with criminal negligence.</label></div>
  <div class="radio-line"><input type="radio" name="fc_conclusion" id="fc_conc_other_hitrun" value="other_hitrun">
    <label class="radio-label" for="fc_conc_other_hitrun">The other involved party was at fault, or share fault, with the incident being a Hit and Run.</label></div>
  <div class="form-row" style="margin-top:8px;"><label class="full">Officer Signature (URL or typed)
    <input type="text" id="fc_signature"></label></div>
</div>
<div class="inline-actions"><button class="btn" id="fc_generate" type="button">Generate Report</button></div>
`;}

/* CIC */
function tplCIC(){ return `
<h3>Civilian Collision</h3>
<div class="inline-actions section-head"><span class="tag">INVOLVED DRIVERS DETAILS</span><button class="btn ghost" id="cic_add_driver" type="button">+ Add Driver</button></div>
<div id="cic_drivers"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">COLLISION DETAILS</span></div>
<div class="form-section">
  <div class="form-row"><label>Date of Incident<input type="date" id="cic_date"></label><label>Time of Incident<input type="time" id="cic_time"></label></div>
  <div class="form-row"><label>Road<input type="text" id="cic_road" list="street-list"></label><label>Nearest Crossroad<input type="text" id="cic_cross" list="street-list"></label></div>
  <div class="form-row"><label class="full">Area<input type="text" id="cic_area" list="area-list"></label></div>
</div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">NARRATIVE &amp; EVIDENCE</span><button class="btn ghost" id="cic_add_evidence" type="button">+ Add Evidence</button></div>
<div class="form-section">
  <div class="form-row"><label class="full">Details of Incident
    <textarea id="cic_details"></textarea>
  </label></div>
</div>
<div id="cic_evidence"></div>
<div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">CONCLUSION</span></div>
<div class="form-section">
  <div class="radio-line"><input type="radio" name="cic_conclusion" id="cic_conc_d1" value="d1" checked>
    <label class="radio-label" for="cic_conc_d1">Driver one is at fault for causing the collision.</label></div>
  <div class="radio-line"><input type="radio" name="cic_conclusion" id="cic_conc_d2" value="d2">
    <label class="radio-label" for="cic_conc_d2">Driver two is at fault for causing the collision.</label></div>
  <div class="radio-line"><input type="radio" name="cic_conclusion" id="cic_conc_both" value="both">
    <label class="radio-label" for="cic_conc_both">Both drivers are mutually at fault for causing the collision.</label></div>
  <div class="form-row" style="margin-top:8px;"><label class="full">Officer Signature (URL or typed)
    <input type="text" id="cic_signature"></label></div>
</div>
<div class="inline-actions"><button class="btn" id="cic_generate" type="button">Generate Report</button></div>
`;}

function compactEvidenceTextareas() {
  // Make any Evidence Content textareas start compact and auto-grow on input
  document.querySelectorAll('[id$="_evidence"] textarea').forEach(t => {
    // start as a single line
    t.rows = 1;

    const grow = () => {
      t.style.height = '36px';               // reset to base
      const max = 240;                       // cap so it doesn't explode the layout
      t.style.height = Math.min(t.scrollHeight, max) + 'px';
    };
    t.addEventListener('input', grow);
    // initialize for any prefilled content
    requestAnimationFrame(grow);
  });
}

/* ===== Traffic Report (with Location, Vehicle Details, Charges) ===== */
function tplTRAFFICREPORT(){ return `
<div id="trafficStopCard">
  <h3>Traffic Report</h3>

  <!-- GENERAL INFORMATION -->
  <div class="inline-actions section-head"><span class="tag">GENERAL INFORMATION</span></div>
  <div class="form-section" id="tr_general_section">
    <div class="form-row">
      <label>Date
        <input type="text" id="trDate" placeholder="DD/MMM/YYYY">
      </label>
      <label>Time (UTC)
        <input type="text" id="trTimeUTC" placeholder="HH:MM">
      </label>
      <label>Callsign
        <input type="text" id="trCallsign" placeholder="e.g., 2T31">
      </label>
    </div>
  </div>

  <!-- LOCATION DETAILS -->
  <div class="inline-actions section-head" style="margin-top:12px;"><span class="tag">LOCATION DETAILS</span></div>
  <div class="form-section" id="tr_location_section">
    <div class="form-row">
      <label>District
        <input type="text" id="trDistrict" list="area-list" placeholder="Start typing an area…">
      </label>
      <label>Street Name
        <input type="text" id="trStreet" list="street-list" placeholder="Start typing a street…">
      </label>
    </div>
  </div>

  <!-- DISPOSAL TYPE (moved up) -->
  <div class="inline-actions section-head" style="margin-top:12px;">
      <span class="tag">DISPOSAL TYPE</span>
    </div>
    <div class="form-section" id="tr_disposal_section">
    <div class="form-row">
      <label class="chk">
        <input type="checkbox" id="tr_disposal_citation" data-disposal="citation">
        <span>Citation</span>
      </label>
      <label class="chk">
        <input type="checkbox" id="tr_disposal_written" data-disposal="writtenwarning">
        <span>Written Warning</span>
      </label>
      <label class="chk">
        <input type="checkbox" id="tr_disposal_verbal" data-disposal="verbalwarning">
        <span>Verbal Warning</span>
      </label>
    </div>
    <div class="hint" style="opacity:.7;margin-top:6px;">Select one.</div>
  </div>

  <!-- OFFICERS (wrapped so we can hide as a block) -->
  <div id="tr_officers_wrap">
    <div class="inline-actions section-head" style="margin-top:12px;">
      <span class="tag">INVOLVED OFFICER DETAILS</span>
      <button class="btn ghost" id="tr_add_officer" type="button">+ Add Officer</button>
    </div>
    <div id="tr_officers"></div>
  </div>

  <!-- DEFENDANT & NARRATIVE (wrapped) -->
  <div id="tr_def_section">
    <div class="inline-actions section-head"><span class="tag">DEFENDANT &amp; NARRATIVE</span></div>
    <div class="form-section">
      <div class="form-row">
        <label>First Name
          <input type="text" id="trDefFName" placeholder="e.g., John">
        </label>
        <label>Last Name
          <input type="text" id="trDefLName" placeholder="e.g., Citizen">
        </label>
        <label>Driver's License Status
          <select id="trLicenseStatus">
            <option value="" disabled selected>Select status…</option>
            <option>Valid</option>
            <option>No License</option>
            <option>Expired</option>
            <option>Suspended</option>
            <option>Revoked</option>
          </select>
        </label>
      </div>

      <div class="form-row" id="trNarrativeRow">
        <label class="full">Traffic Stop Narrative
          <textarea id="trNarrative" placeholder="Summarize the stop..."></textarea>
        </label>
      </div>

      <div class="form-row" id="trDashcamRow">
        <label class="full">Dashboard Camera
          <textarea id="trDashcam" placeholder="Links, IDs, or notes regarding dashcam footage…"></textarea>
        </label>
      </div>
    </div>
  </div>

  <!-- VEHICLE DETAILS -->
  <div id="tr_vehicle_wrap">
  <div class="inline-actions section-head" style="margin-top:12px;">
    <span class="tag">VEHICLE DETAILS</span>
  </div>
  <div class="form-section" id="trVehicleSection">
    <!-- Registered -->
    <div class="vr-row">
      <div class="vr-left">
        <label class="switch">
          <input type="checkbox" id="tr_registered" checked>
          <span class="switch-ui" aria-hidden="true"></span>
          <span class="switch-label">Registered</span>
        </label>
      </div>
      <div class="vr-right" id="tr_reg_fields">
        <label>Registered Owner
          <input type="text" id="trRegOwner" placeholder="Firstname Lastname">
        </label>
        <label>Identification Plate
          <input type="text" id="trPlate" placeholder="##XXX">
        </label>
      </div>
    </div>

    <!-- Insured -->
    <div class="vr-row">
      <div class="vr-left">
        <label class="switch">
          <input type="checkbox" id="tr_insured" checked>
          <span class="switch-ui" aria-hidden="true"></span>
          <span class="switch-label">Insured</span>
        </label>
      </div>
      <div class="vr-right" id="tr_ins_fields">
        <label class="span-2">Insurance Expired Date
          <input type="text" id="trInsExpiry" placeholder="DD/MM/YYYY">
        </label>
      </div>
    </div>

    <!-- Always visible -->
    <div class="vr-row">
      <div class="vr-left"></div>
      <div class="vr-right">
        <label>Make &amp; Model
          <input type="text" id="trMakeModel" placeholder="e.g., Vapid Dominator GTX">
        </label>
        <label>Tint Level
          <select id="trTint">
            <option>Uninspected</option>
            <option>Level 0</option><option>Level 1</option><option>Level 2</option>
            <option>Level 3</option><option>Level 4</option><option>Level 5</option>
          </select>
        </label>
      </div>
    </div>
  </div>

  <!-- CHARGES -->
  <div class="form-section" id="tr_charges_wrap">
    <div class="subhead">CHARGES</div>
    <div id="tr_charges"></div>
    <div class="inline-actions">
      <button class="btn ghost" id="tr_add_charge" type="button">+ Add Charge</button>
    </div>
  </div>

  <!-- SUBMIT -->
  <form id="trafficReportForm">
    <div class="inline-actions">
      <button class="btn" id="tr_generate" type="submit">Save (Stub)</button>
    </div>
  </form>
</div>
`; }


/* -----------------------
   Inject + initialize form
   ----------------------- */
function setDefaultDateTime(dateId, timeId){
  const d = document.getElementById(dateId);
  const t = document.getElementById(timeId);
  const now = new Date();

  // Date stays YYYY-MM-DD (UTC)
  if (d) d.value = now.toISOString().slice(0,10);

  // Time uses UTC hours/minutes
  if (t){
    const hh = String(now.getUTCHours()).padStart(2,'0');
    const mm = String(now.getUTCMinutes()).padStart(2,'0');
    t.value = `${hh}:${mm}`;
  }
}

/* Helpers for Traffic Report formatting */
function formatDDMMMYYYY(d=new Date()){
  const dd   = d.toLocaleString('en-GB', { day: '2-digit',   timeZone: 'UTC' });
  const mmm  = d.toLocaleString('en-GB', { month: 'short',   timeZone: 'UTC' }).toUpperCase();
  const yyyy = d.toLocaleString('en-GB', { year: 'numeric', timeZone: 'UTC' });
  return `${dd}/${mmm}/${yyyy}`;
}

function utcHHMM(now=new Date()){
  return now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'UTC' });
}

/* --- Disposal Type helpers (shared) --- */
// Return 'citation' | 'writtenwarning' | 'verbalwarning' | ''
function getTrafficDisposalType(){
  const checked = document.querySelector('#tr_disposal_section input[data-disposal]:checked');
  return checked ? checked.dataset.disposal : '';
}

// Show/hide sections based on disposal type
function updateTrafficDisposalVisibility(){
  const disp = getTrafficDisposalType();

  const officersWrap = document.getElementById('tr_officers_wrap');
  const defWrap      = document.getElementById('tr_def_section');
  const vehWrap      = document.getElementById('tr_vehicle_wrap');  // instead of trVehicleSection
  const chargesWrap  = document.getElementById('tr_charges_wrap');
  const narrativeRow = document.getElementById('trNarrativeRow');
  const dashcamRow   = document.getElementById('trDashcamRow');

  // Charges visible ONLY for citation
  if (chargesWrap) chargesWrap.style.display = (disp === 'citation') ? '' : 'none';

  // Verbal warning adjustments
  const isVerbal = (disp === 'verbalwarning');

  if (officersWrap) officersWrap.style.display = '';        // always show officers
  if (defWrap)      defWrap.style.display      = '';        // always show defendant section
  if (vehWrap) vehWrap.style.display = isVerbal ? 'none' : '';

  if (narrativeRow) narrativeRow.style.display = isVerbal ? 'none' : '';
  if (dashcamRow)   dashcamRow.style.display   = isVerbal ? 'none' : '';
}


// Make three checkboxes behave like radios + set default
function wireTrafficDisposal(){
  const boxes = Array.from(document.querySelectorAll('#tr_disposal_section input[data-disposal]'));
  if (!boxes.length) return;

  const onChange = (clicked) => {
    boxes.forEach(b => { if (b !== clicked) b.checked = false; });
    updateTrafficDisposalVisibility();
  };

  boxes.forEach(b => b.addEventListener('change', () => onChange(b)));

  // Default: Verbal Warning
  if (!boxes.some(b => b.checked)) {
    const def = document.getElementById('tr_disposal_verbal');
    if (def) def.checked = true;
  }
  updateTrafficDisposalVisibility();
}

function initTrafficReportDisposalSection(){ wireTrafficDisposal(); }

// Require ≥1 charge only if Citation
function validateTrafficReport(){
  if (getTrafficDisposalType() === 'citation'){
    const count = document.querySelectorAll('#tr_charges .tr-charge').length;
    if (count < 1){
      alert('At least one charge is required for a Citation.');
      document.getElementById('tr_add_charge')?.focus();
      return false;
    }
  }
  return true;
}

/* --- Traffic Report DOM wiring (wrapped) --- */
function initTrafficReportDOM(){
  try{
    // Prefill date/time + callsign
    var now = new Date();
    var dateEl = document.getElementById('trDate');
    var timeEl = document.getElementById('trTimeUTC');
    if (dateEl) dateEl.value = formatDDMMMYYYY(now);
    if (timeEl) timeEl.value = utcHHMM(now);

    var sh = (typeof loadShift === 'function') ? loadShift() : null;
    if (sh && sh.callsign) { var cs = document.getElementById('trCallsign'); if (cs) cs.value = sh.callsign; }

    var tInterval = setInterval(function(){
      if (!document.getElementById('trTimeUTC')) { clearInterval(tInterval); return; }
      var t = document.getElementById('trTimeUTC');
      if (t) t.value = utcHHMM(new Date());
    }, 15000);

    // Officers (add/remove)
    (function(){
      var list   = document.getElementById('tr_officers');
      var addBtn = document.getElementById('tr_add_officer');
      if (!list || !addBtn) return;

      function officerBlock(index, preset){
        preset = preset || {};
        var wrap = document.createElement('div');
        wrap.className = 'form-section tr-officer';
        wrap.setAttribute('data-index', String(index));
        wrap.innerHTML =
          '<div class="form-row">' +
            '<label>First Name' +
              '<input type="text" id="tr_officer_fname_' + index + '" value="' + (preset.fname||'') + '">' +
            '</label>' +
            '<label>Last Name' +
              '<input type="text" id="tr_officer_lname_' + index + '" value="' + (preset.lname||'') + '">' +
            '</label>' +
            '<label>Rank' +
              '<input type="text" id="tr_officer_rank_' + index + '" value="' + (preset.rank||'') + '">' +
            '</label>' +
            '<label>Serial Number' +
              '<input type="text" id="tr_officer_serial_' + index + '" value="' + (preset.serial||'') + '">' +
            '</label>' +
          '</div>' +
          '<div class="inline-actions">' +
            '<button class="btn ghost tr_remove_officer" type="button">Remove Officer</button>' +
          '</div>';
        return wrap;
      }

      function nextIndex(){
        var nodes = list.querySelectorAll('.tr-officer');
        var max = 0;
        for (var i=0;i<nodes.length;i++){
          var v = parseInt(nodes[i].getAttribute('data-index') || '0', 10);
          if (v > max) max = v;
        }
        return max + 1;
      }
      function addOfficer(preset){ list.appendChild(officerBlock(nextIndex(), preset)); }

      var us = {};
      try { us = JSON.parse(localStorage.getItem('userSettings') || '{}'); } catch(e){}
      var fname = (us.firstName || '').trim();
      var lname = (us.lastName  || '').trim();
      if (!fname && !lname && us.name) {
        var parts = String(us.name).trim().split(/\s+/);
        fname = parts[0] || '';
        lname = parts.slice(1).join(' ') || '';
      }
      if (!list.children.length) {
        addOfficer({ fname: fname, lname: lname, rank: us.rank||'', serial: us.serial||'' });
      }

      addBtn.addEventListener('click', function(){ addOfficer(); });
      list.addEventListener('click', function(e){
        var tgt = e.target || e.srcElement;
        var btn = (tgt && tgt.closest) ? tgt.closest('.tr_remove_officer') : null;
        if (!btn) return;
        var block = btn.closest ? btn.closest('.tr-officer') : null;
        if (block && block.parentNode) block.parentNode.removeChild(block);
      });
    })();

    // Vehicle toggles
    (function(){
      var regChk     = document.getElementById('tr_registered');
      var insChk     = document.getElementById('tr_insured');
      var regFields  = document.getElementById('tr_reg_fields');
      var insFields  = document.getElementById('tr_ins_fields');
      var regOwner   = document.getElementById('trRegOwner');
      var regPlate   = document.getElementById('trPlate');
      var insExpiry  = document.getElementById('trInsExpiry');

      if (regFields) regFields.style.display = (regChk && regChk.checked) ? '' : 'none';
      if (insFields) insFields.style.display = (insChk && insChk.checked) ? 'none' : '';

      if (regChk) regChk.addEventListener('change', function(){
        var on = regChk.checked;
        if (regFields) regFields.style.display = on ? '' : 'none';
        if (!on){ if (regOwner) regOwner.value=''; if (regPlate) regPlate.value=''; }
      });
      if (insChk) insChk.addEventListener('change', function(){
        var insured = insChk.checked;
        if (insFields) insFields.style.display = insured ? 'none' : '';
        if (insured && insExpiry) insExpiry.value='';
      });
    })();

    // Charges (dynamic)
    (function(){
      var chargesList  = document.getElementById('tr_charges');
      var addChargeBtn = document.getElementById('tr_add_charge');
      if (!chargesList || !addChargeBtn) return;

      var CHARGES = [
        "403. Failure to Produce Driver's License (I)",
        "404. Failure to Produce Vehicle Registration (I)",
        "405. Failure to Produce Proof of Insurance (I)",
        "406. Unregistered Vehicle (I)",
        "407. No Insurance (I)",
        "410. Speeding (I)",
        "411. Excessive Speeding (I)",
        "412. Failure to Yield/Stop to a Traffic Control Device (I)",
        "413. Failure to Yield at Intersection (I)",
        "414. Failure to Yield Entering Roadway (I)",
        "415. Failure to Yield for Crosswalk (I)",
        "416. Failure to Yield to an Emergency Vehicle (I)",
        "417. Improper Lane Entry while Turning (I)",
        "418. Prohibited Parking (I)",
        "421. Drive Without Headlights (I)",
        "422. Unsafe Reversing (I)",
        "423. Obstructing Traffic (I)",
        "424. Driving Against One-Way Traffic (I)",
        "425. Imprudent Driving (I)",
        "426. Use of an Electronic Device while Driving (I)",
        "427. Vehicular Noise Violation (I)",
        "428. Illegal Usage of Hydraulics (I)",
        "429. Tinted Windows (I)",
        "433. Jaywalking (I)",
        "434. Possession of Open Container (I)",
        "435. Failure to Wear a Seatbelt/Safety Equipment (I)",
        "436. Operation of Unsafe Motor Vehicle (I)",
        "441. Negligent Operation of Bicycle (I)",
        "442. Operation of an Unauthorized Vehicle on Vespucci Beach (I)"
      ];

      function chargeBlock(index, selected){
        selected = selected || '';
        var wrap = document.createElement('div');
        wrap.className = 'form-section tr-charge';
        wrap.setAttribute('data-index', String(index));
        wrap.setAttribute('data-charge-row','');

        var opts = '<option value="" disabled selected>Select a charge…</option>';
        for (var i=0;i<CHARGES.length;i++){
          var cOpt = CHARGES[i];
          opts += '<option' + (cOpt===selected ? ' selected' : '') + '>' + cOpt + '</option>';
        }

        wrap.innerHTML =
          '<div class="form-row">' +
            '<label class="full">Charge' +
              '<select id="tr_charge_' + index + '">' + opts + '</select>' +
            '</label>' +
          '</div>' +
          '<div class="inline-actions">' +
            '<button class="btn ghost tr_remove_charge" type="button">Remove Charge</button>' +
          '</div>';
        return wrap;
      }
      function nextChargeIndex(){
        var nodes = chargesList.querySelectorAll('.tr-charge');
        var max = 0;
        for (var i=0;i<nodes.length;i++){
          var v = parseInt(nodes[i].getAttribute('data-index') || '0', 10);
          if (v > max) max = v;
        }
        return max + 1;
      }
      function addCharge(selected){ chargesList.appendChild(chargeBlock(nextChargeIndex(), selected)); }

      addChargeBtn.addEventListener('click', function(){ addCharge(); });
      chargesList.addEventListener('click', function(e){
        var tgt = e.target || e.srcElement;
        var btn = (tgt && tgt.closest) ? tgt.closest('.tr_remove_charge') : null;
        if (!btn) return;
        var block = btn.closest ? btn.closest('.tr-charge') : null;
        if (block && block.parentNode) block.parentNode.removeChild(block);
      });

      if (!chargesList.children.length && getTrafficDisposalType() === 'citation') {
        addCharge();
      }
    })();

    // Disposal section
    initTrafficReportDisposalSection?.();

    // Submit stub
    var trForm = document.getElementById('trafficReportForm');
    if (trForm) trForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateTrafficReport?.()) return;
      console.info('[Traffic Report] Submitted (stub)');
    });

  }catch(err){
    console.error('[Traffic Report] init error:', err);
  }
}

/* === selectForm — inject + init (ALL forms) === */
function selectForm(key){
  try {
    activeForm = key;

    const head = document.querySelector('.workarea .head');
    if (head) head.textContent = (key === 'trafficreport')
      ? 'Traffic Reports'
      : 'Traffic Collision Reports';

    const c = document.getElementById('form-container');
    const map = { oic: tplOIC, ceic: tplCEIC, fc: tplFC, cic: tplCIC, trafficreport: tplTRAFFICREPORT };
    c.innerHTML = (map[key] ? map[key]() : `<div style="padding:16px">Form unavailable: ${key}</div>`);

    const titleWrap    = document.querySelector('.output .title-wrap');
    const copyTitleBtn = document.getElementById('copyTitle');
    const copyBodyBtn  = document.getElementById('copy-bb');

    if (key === 'trafficreport') {
      if (titleWrap)    titleWrap.style.display = 'none';
      if (copyTitleBtn) copyTitleBtn.style.display = 'none';
      if (copyBodyBtn)  copyBodyBtn.textContent = 'Copy Report';

      initTrafficReportDOM();

    } else {
      if (titleWrap)    titleWrap.style.display = '';
      if (copyTitleBtn) copyTitleBtn.style.display = '';
      if (copyBodyBtn)  copyBodyBtn.textContent = 'Copy TCI Body';
    }

    // Collision-form-only defaults
    if (key === 'oic')  setDefaultDateTime('oic_date','oic_time');
    if (key === 'ceic') setDefaultDateTime('ceic_date','ceic_time');
    if (key === 'fc')   setDefaultDateTime('fc_date','fc_time');
    if (key === 'cic')  setDefaultDateTime('cic_date','cic_time');

    // Wire title pieces for collision forms
    ['date','road','area'].forEach(s => {
      const id = `${key}_${s}`;
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateOutputTitle);
    });
    updateOutputTitle();

    // Collision form handoffs (if defined)
    if (key==='oic'  && window.initOICForm)  window.initOICForm(updateOutputTitle, setBB);
    if (key==='ceic' && window.initCEICForm) window.initCEICForm(updateOutputTitle, setBB);
    if (key==='fc'   && window.initFCForm)   window.initFCForm(updateOutputTitle, setBB);
    if (key==='cic'  && window.initCICForm)  window.initCICForm(updateOutputTitle, setBB);

    // after initOICForm/initCEICForm/initFCForm/initCICForm calls (or right after updateOutputTitle())
    compactEvidenceTextareas();


  } catch (err) {
    console.error('selectForm error:', err);
  }
}

/* -------------
   Global open
   ------------- */
window.openForm = function(key){
  const t = document.getElementById('forms-link');
  const m = document.getElementById('forms-submenu');

  // Only toggle the hamburger for collision forms
  const isCollision = ['oic','ceic','fc','cic'].includes(key);
  if (isCollision) {
    if (m) m.classList.add('show');
    if (t) t.classList.add('open');
  } else {
    // Ensure it stays closed for Traffic Report
    if (m) m.classList.remove('show');
    if (t) t.classList.remove('open');
  }

  showTCR();
  const cont = document.getElementById('form-container');
  if (cont) cont.textContent = 'Loading…';

  document.querySelectorAll('.work-actions .btn').forEach(b=>{
    b.classList.toggle('active', b.getAttribute('onclick')?.includes(`'${key}'`));
  });

  selectForm(key);
};

// Start with hub visible
showHub();
