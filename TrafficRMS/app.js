// --- Utilities & State -------------------------------------------------------
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const fmtDate = (d=new Date()) =>
  d.toLocaleString(undefined,{year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'});

const db = {
  load(){
    const raw = localStorage.getItem('lspd_td_rms');
    try { return raw ? JSON.parse(raw) : { cases:[], reports:[] }; }
    catch(e){ return { cases:[], reports:[] }; }
  },
  save(data){ localStorage.setItem('lspd_td_rms', JSON.stringify(data)); }
};
let state = db.load();

function genId(prefix){
  const rand = Math.random().toString(36).slice(2,7).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${ts}${rand}`;
}

// --- Routing -----------------------------------------------------------------
const routes = {
  dashboard: $('[data-view="dashboard"]'),
  cases: $('[data-view="cases"]'),
  reports: $('[data-view="reports"]'),
  search: $('[data-view="search"]')
};
let currentRoute = 'dashboard';

function go(route){
  if(!routes[route]) route = 'dashboard';
  currentRoute = route;
  $$('.route').forEach(r => r.classList.remove('active'));
  routes[route].classList.add('active');
  $('#viewTitle').textContent = route[0].toUpperCase()+route.slice(1);
  $$('.nav .nav-item').forEach(el => el.classList.toggle('active', el.dataset.route===route));
  render();
}

$$('.nav .nav-item[data-route]').forEach(btn=>{
  btn.addEventListener('click', ()=> go(btn.dataset.route));
});

// --- Theme -------------------------------------------------------------------
$('#toggleTheme').addEventListener('click', ()=>{
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') !== 'light';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// --- Modals: openers ---------------------------------------------------------
const modals = {
  collision: $('#modal-collision'),
  tstop: $('#modal-tstop'),
  citation: $('#modal-generic'),
  dui: $('#modal-generic')
};
$$('[data-open-modal]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const key = btn.dataset.openModal;
    if(key==='citation'){ $('#genericTitle').textContent = 'New Citation'; }
    if(key==='dui'){ $('#genericTitle').textContent = 'New DUI Report'; }
    modals[key].showModal();
  });
});

// Close on cancel clicks (built-in <dialog> handles method=dialog)
['modal-collision','modal-tstop','modal-generic'].forEach(id=>{
  const dlg = document.getElementById(id);
  dlg.addEventListener('close', ()=> {
    // no-op; forms handle submit
  });
});

// --- Create: Collision => Case + Report -------------------------------------
$('#formCollision').addEventListener('submit', (e)=>{
  if(e.submitter?.value==='cancel') return; // canceled
  e.preventDefault();

  const fd = new FormData(e.currentTarget);
  const officer = fd.get('officer').trim();
  const location = fd.get('location').trim();
  const plateA = fd.get('plateA').trim();
  const plateB = fd.get('plateB').trim();
  const summary = fd.get('summary').trim();
  const needsFollowup = fd.get('needsFollowup') === 'on';

  const caseId = genId('CASE');
  const reportId = genId('TC');

  const newCase = {
    id: caseId,
    primaryReportId: reportId,
    officer, status: needsFollowup ? 'Pending Follow-up' : 'Open',
    involved: [plateA, plateB].filter(Boolean).join(' • ') || '—',
    createdAt: Date.now(),
    title: `Traffic Collision at ${location}`
  };
  const newReport = {
    id: reportId, type: 'Traffic Collision', caseId,
    officer, subject: `${plateA || 'Unknown'} ${plateB ? 'vs ' + plateB : ''}`.trim(),
    createdAt: Date.now(),
    title: summary
  };

  state.cases.unshift(newCase);
  state.reports.unshift(newReport);
  db.save(state);

  modals.collision.close();
  go('cases');
});

// --- Create: Traffic Stop ----------------------------------------------------
$('#formTStop').addEventListener('submit', (e)=>{
  if(e.submitter?.value==='cancel') return;
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const officer = fd.get('officer').trim();
  const plate = fd.get('plate').trim();
  const reason = fd.get('reason').trim();
  const notes = fd.get('notes').trim();

  const reportId = genId('TS');
  state.reports.unshift({
    id: reportId, type:'Traffic Stop', caseId:null,
    officer, subject: plate, createdAt: Date.now(),
    title: `${reason} — ${notes || 'No additional notes'}`
  });
  db.save(state);
  modals.tstop.close();
  go('reports');
});

// --- Create: Generic (Citation, DUI) ----------------------------------------
$('#formGeneric').addEventListener('submit', (e)=>{
  if(e.submitter?.value==='cancel') return;
  e.preventDefault();
  const titleText = $('#genericTitle').textContent;
  const type = titleText.includes('Citation') ? 'Citation' :
               titleText.includes('DUI') ? 'DUI' : 'Report';
  const fd = new FormData(e.currentTarget);
  const officer = fd.get('officer').trim();
  const subject = fd.get('subject').trim();
  const notes = fd.get('notes').trim();

  const idPrefix = type==='Citation' ? 'CIT' : (type==='DUI' ? 'DUI' : 'RPT');
  const reportId = genId(idPrefix);

  state.reports.unshift({
    id: reportId, type, caseId:null,
    officer, subject, createdAt: Date.now(),
    title: notes || '(No notes)'
  });
  db.save(state);
  modals.citation.close(); // same dialog DOM id for citation/dui
  go('reports');
});

// --- Rendering ---------------------------------------------------------------
function renderKPIs(){
  // Open cases
  const open = state.cases.filter(c=>c.status!=='Closed').length;
  $('#kpiOpenCases').textContent = open;

  // Reports last 24h
  const dayAgo = Date.now() - 24*3600*1000;
  const r24 = state.reports.filter(r=>r.createdAt >= dayAgo).length;
  $('#kpiReports24h').textContent = r24;

  // Pending follow-ups
  $('#kpiFollowups').textContent = state.cases.filter(c=>c.status==='Pending Follow-up').length;
}

function renderRecent(){
  const tbody = $('#recentTable tbody');
  tbody.innerHTML = '';
  const items = [
    ...state.cases.map(c=>({kind:'Case', id:c.id, title:c.title, officer:c.officer, status:c.status, createdAt:c.createdAt})),
    ...state.reports.map(r=>({kind:r.type, id:r.id, title:r.title, officer:r.officer, status: r.caseId? 'Linked to Case' : '—', createdAt:r.createdAt}))
  ].sort((a,b)=>b.createdAt - a.createdAt).slice(0,10);

  for(const it of items){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.kind}</td>
      <td>${it.id}</td>
      <td>${escapeHTML(it.title)}</td>
      <td>${escapeHTML(it.officer || '—')}</td>
      <td><span class="status ${cssClassSafe(it.status)}">${escapeHTML(it.status || '—')}</span></td>
      <td>${fmtDate(new Date(it.createdAt))}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderCases(){
  const tbody = $('#casesTable tbody');
  tbody.innerHTML = '';
  const filter = $('#caseFilter').value;
  const list = filter ? state.cases.filter(c=>c.status===filter) : state.cases;

  for(const c of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.primaryReportId}</td>
      <td>${escapeHTML(c.officer)}</td>
      <td><span class="status ${cssClassSafe(c.status)}">${c.status}</span></td>
      <td>${escapeHTML(c.involved)}</td>
      <td>${fmtDate(new Date(c.createdAt))}</td>
      <td>
        <button class="btn subtle" data-action="caseClose" data-id="${c.id}">Close</button>
        <button class="btn subtle" data-action="caseFollow" data-id="${c.id}">Follow-up</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // actions
  tbody.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const c = state.cases.find(x=>x.id===id);
    if(!c) return;

    if(btn.dataset.action==='caseClose'){ c.status = 'Closed'; }
    if(btn.dataset.action==='caseFollow'){
      c.status = (c.status==='Pending Follow-up') ? 'Open' : 'Pending Follow-up';
    }
    db.save(state);
    render();
  }, { once:true }); // reattach each render
}
$('#caseFilter').addEventListener('change', render);

function renderReports(){
  const tbody = $('#reportsTable tbody');
  tbody.innerHTML = '';
  const t = $('#reportTypeFilter').value;
  const list = t ? state.reports.filter(r=>r.type===t) : state.reports;

  for(const r of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.type}</td>
      <td>${r.id}</td>
      <td>${r.caseId || '—'}</td>
      <td>${escapeHTML(r.officer)}</td>
      <td>${escapeHTML(r.subject || '—')}</td>
      <td>${fmtDate(new Date(r.createdAt))}</td>
    `;
    tbody.appendChild(tr);
  }
}
$('#reportTypeFilter').addEventListener('change', render);

// Search
$('#advSearchForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const q = (fd.get('q')||'').toString().trim().toLowerCase();
  const type = fd.get('type')||'';
  const status = fd.get('status')||'';

  const hay = [
    ...state.cases.map(c=>({kind:'Case', id:c.id, title:c.title, officer:c.officer, status:c.status, createdAt:c.createdAt})),
    ...state.reports.map(r=>({kind:r.type, id:r.id, title:r.title, officer:r.officer, status:r.caseId?'Linked':'—', createdAt:r.createdAt}))
  ];

  const results = hay.filter(it=>{
    const matchesQ = !q || Object.values(it).join(' ').toLowerCase().includes(q);
    const matchesType = !type || it.kind===type;
    const matchesStatus = !status || it.status===status;
    return matchesQ && matchesType && matchesStatus;
  });

  const tbody = $('#searchTable tbody');
  tbody.innerHTML='';
  for(const it of results){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.kind}</td>
      <td>${it.id}</td>
      <td>${escapeHTML(it.title)}</td>
      <td>${escapeHTML(it.officer || '—')}</td>
      <td><span class="status ${cssClassSafe(it.status)}">${escapeHTML(it.status)}</span></td>
      <td>${fmtDate(new Date(it.createdAt))}</td>
    `;
    tbody.appendChild(tr);
  }
});

// Quick Search (topbar)
$('#quickSearch').addEventListener('input', (e)=>{
  const val = e.target.value.trim().toLowerCase();
  if(!val){ renderRecent(); return; }
  const hay = [
    ...state.cases.map(c=>({kind:'Case', id:c.id, title:c.title, officer:c.officer, status:c.status, createdAt:c.createdAt})),
    ...state.reports.map(r=>({kind:r.type, id:r.id, title:r.title, officer:r.officer, status:r.caseId?'Linked':'—', createdAt:r.createdAt}))
  ];
  const rs = hay.filter(it => Object.values(it).join(' ').toLowerCase().includes(val)).slice(0,10);
  const tbody = $('#recentTable tbody');
  tbody.innerHTML='';
  for(const it of rs){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.kind}</td><td>${it.id}</td>
      <td>${escapeHTML(it.title)}</td>
      <td>${escapeHTML(it.officer || '—')}</td>
      <td><span class="status ${cssClassSafe(it.status)}">${escapeHTML(it.status)}</span></td>
      <td>${fmtDate(new Date(it.createdAt))}</td>`;
    tbody.appendChild(tr);
  }
});

// --- Helpers -----------------------------------------------------------------
function cssClassSafe(text){ return (text||'').replace(/\s+/g,'\\ '); }
function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// --- Boot: seed demo data if empty ------------------------------------------
(function seed(){
  if(state.cases.length || state.reports.length) return;
  const demoCaseId = genId('CASE');
  const demoReportId = genId('TC');
  state.cases.push({
    id: demoCaseId, primaryReportId: demoReportId, officer: 'Ofc. J. Carter #5123',
    status: 'Pending Follow-up', involved: '4SXR912 • —', createdAt: Date.now()-3600*1000*6,
    title: 'Traffic Collision at Vinewood Blvd / Meteor St'
  });
  state.reports.push({
    id: demoReportId, type:'Traffic Collision', caseId: demoCaseId, officer:'Ofc. J. Carter #5123',
    subject:'4SXR912', createdAt: Date.now()-3600*1000*6, title:'Rear-end collision, minor injuries'
  });
  state.reports.push({
    id: genId('TS'), type:'Traffic Stop', caseId:null, officer:'Sgt. K. Diaz #4107',
    subject:'8KLM223', createdAt: Date.now()-3600*1000*2, title:'No front plate, verbal warning'
  });
  db.save(state);
})();

// --- Initial render ----------------------------------------------------------
function render(){
  renderKPIs();
  renderRecent();
  if(currentRoute==='cases') renderCases();
  if(currentRoute==='reports') renderReports();
}
render();
