// Utilities
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];
const fmtDate = (ts)=> new Date(ts||Date.now()).toLocaleString(undefined,{
  year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'
});

// Minimal local data
const db = {
  load(){ try{ return JSON.parse(localStorage.getItem('lspd_td_rms')) || {cases:[],reports:[]}; }catch(e){ return {cases:[],reports:[]}; } },
  save(v){ localStorage.setItem('lspd_td_rms', JSON.stringify(v)); }
};
let state = db.load();

function genId(prefix){
  const rand = Math.random().toString(36).slice(2,6).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${ts}${rand}`;
}

// Routing
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
  $$('.route').forEach(x=>x.classList.remove('active'));
  routes[route].classList.add('active');
  $('#viewTitle').textContent = route[0].toUpperCase()+route.slice(1);
  $$('.nav-item[data-route]').forEach(b=>b.classList.toggle('active', b.dataset.route===route));
  render();
}
$$('.nav-item[data-route]').forEach(b=> b.addEventListener('click', ()=> go(b.dataset.route)));

// Theme
$('#toggleTheme').addEventListener('click', ()=>{
  const r = document.documentElement;
  r.setAttribute('data-theme', r.getAttribute('data-theme')==='light' ? 'dark' : 'light');
});

// Clock
function tickClock(){ $('#systemClock').textContent = fmtDate(Date.now()); }
setInterval(tickClock, 1000); tickClock();

// Open modals
const modals = {
  collision: $('#modal-collision'),
  tstop: $('#modal-tstop'),
  citation: $('#modal-generic'),
  dui: $('#modal-generic')
};
$$('[data-open-modal]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const k = btn.dataset.openModal;
    if(k==='citation') $('#genericTitle').textContent='New Citation';
    if(k==='dui') $('#genericTitle').textContent='New DUI Report';
    modals[k].showModal();
  });
});

// Create: Collision => Case + Report
$('#formCollision').addEventListener('submit', (e)=>{
  if(e.submitter?.value==='cancel') return;
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const officer = fd.get('officer').trim();
  const location = fd.get('location').trim();
  const plateA = (fd.get('plateA')||'').trim();
  const plateB = (fd.get('plateB')||'').trim();
  const summary = fd.get('summary').trim();
  const needsFollowup = fd.get('needsFollowup') === 'on';

  const caseId = genId('CASE');
  const reportId = genId('TC');

  state.cases.unshift({
    id: caseId,
    primaryReportId: reportId,
    officer,
    status: needsFollowup ? 'Pending Follow-up' : 'Open',
    involved: [plateA, plateB].filter(Boolean).join(' • ') || '—',
    createdAt: Date.now(),
    title: `Traffic Collision — ${location}`
  });
  state.reports.unshift({
    id: reportId, type:'Traffic Collision', caseId,
    officer, subject: [plateA, plateB].filter(Boolean).join(' vs ') || 'Unknown',
    createdAt: Date.now(), title: summary
  });

  db.save(state);
  modals.collision.close();
  go('cases');
});

// Create: Traffic Stop
$('#formTStop').addEventListener('submit', (e)=>{
  if(e.submitter?.value==='cancel') return;
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const officer = fd.get('officer').trim();
  const plate = fd.get('plate').trim();
  const reason = fd.get('reason').trim();
  const notes = (fd.get('notes')||'').trim();

  state.reports.unshift({
    id: genId('TS'), type:'Traffic Stop', caseId:null,
    officer, subject: plate, createdAt: Date.now(),
    title: `${reason}${notes ? ' — ' + notes : ''}`
  });
  db.save(state);
  modals.tstop.close();
  go('reports');
});

// Create: Generic (Citation, DUI)
$('#formGeneric').addEventListener('submit', (e)=>{
  if(e.submitter?.value==='cancel') return;
  e.preventDefault();
  const hdr = $('#genericTitle').textContent;
  const type = hdr.includes('Citation') ? 'Citation' : (hdr.includes('DUI') ? 'DUI' : 'Report');
  const fd = new FormData(e.currentTarget);
  const officer = fd.get('officer').trim();
  const subject = fd.get('subject').trim();
  const notes = (fd.get('notes')||'').trim();

  const id = genId(type==='Citation' ? 'CIT' : type==='DUI' ? 'DUI' : 'RPT');
  state.reports.unshift({ id, type, caseId:null, officer, subject, createdAt: Date.now(), title: notes || '(No notes)' });
  db.save(state);
  modals.citation.close();
  go('reports');
});

// Rendering
function renderKPIs(){
  $('#kpiOpenCases').textContent = state.cases.filter(c=>c.status!=='Closed').length;
  const dayAgo = Date.now() - 24*3600*1000;
  $('#kpiReports24h').textContent = state.reports.filter(r=>r.createdAt>=dayAgo).length;
  $('#kpiFollowups').textContent = state.cases.filter(c=>c.status==='Pending Follow-up').length;
}

function renderRecent(){
  const tbody = $('#recentTable tbody'); tbody.innerHTML='';
  const items = [
    ...state.cases.map(c=>({kind:'Case', id:c.id, title:c.title, officer:c.officer, status:c.status, createdAt:c.createdAt})),
    ...state.reports.map(r=>({kind:r.type, id:r.id, title:r.title, officer:r.officer, status:r.caseId?'Linked to Case':'—', createdAt:r.createdAt}))
  ].sort((a,b)=>b.createdAt - a.createdAt).slice(0,12);

  for(const it of items){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.kind}</td>
      <td>${it.id}</td>
      <td>${escape(it.title)}</td>
      <td>${escape(it.officer||'—')}</td>
      <td><span class="status ${cls(it.status)}">${escape(it.status||'—')}</span></td>
      <td>${fmtDate(it.createdAt)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderCases(){
  const tbody = $('#casesTable tbody'); tbody.innerHTML='';
  const filter = $('#caseFilter').value;
  const list = filter ? state.cases.filter(c=>c.status===filter) : state.cases;

  for(const c of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.primaryReportId}</td>
      <td>${escape(c.officer)}</td>
      <td><span class="status ${cls(c.status)}">${c.status}</span></td>
      <td>${escape(c.involved)}</td>
      <td>${fmtDate(c.createdAt)}</td>
      <td class="t-right">
        <button class="btn linklike" data-action="caseFollow" data-id="${c.id}">${c.status==='Pending Follow-up'?'Set Open':'Set Follow-up'}</button>
        <span aria-hidden="true">•</span>
        <button class="btn linklike" data-action="caseClose" data-id="${c.id}">Close</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const c = state.cases.find(x=>x.id===id);
    if(!c) return;

    if(btn.dataset.action==='caseClose'){ c.status='Closed'; }
    if(btn.dataset.action==='caseFollow'){ c.status = c.status==='Pending Follow-up' ? 'Open' : 'Pending Follow-up'; }
    db.save(state);
    render();
  }, { once:true });
}
$('#caseFilter').addEventListener('change', render);

function renderReports(){
  const tbody = $('#reportsTable tbody'); tbody.innerHTML='';
  const t = $('#reportTypeFilter').value;
  const list = t ? state.reports.filter(r=>r.type===t) : state.reports;

  for(const r of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.type}</td>
      <td>${r.id}</td>
      <td>${r.caseId || '—'}</td>
      <td>${escape(r.officer)}</td>
      <td>${escape(r.subject || '—')}</td>
      <td>${fmtDate(r.createdAt)}</td>
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

  const pool = [
    ...state.cases.map(c=>({kind:'Case', id:c.id, title:c.title, officer:c.officer, status:c.status, createdAt:c.createdAt})),
    ...state.reports.map(r=>({kind:r.type, id:r.id, title:r.title, officer:r.officer, status:r.caseId?'Linked to Case':'—', createdAt:r.createdAt}))
  ];

  const res = pool.filter(it=>{
    const qMatch = !q || Object.values(it).join(' ').toLowerCase().includes(q);
    const tMatch = !type || it.kind===type;
    const sMatch = !status || it.status===status;
    return qMatch && tMatch && sMatch;
  });

  const tbody = $('#searchTable tbody'); tbody.innerHTML='';
  for(const it of res){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.kind}</td>
      <td>${it.id}</td>
      <td>${escape(it.title)}</td>
      <td>${escape(it.officer||'—')}</td>
      <td><span class="status ${cls(it.status)}">${escape(it.status)}</span></td>
      <td>${fmtDate(it.createdAt)}</td>
    `;
    tbody.appendChild(tr);
  }
});

// Quick search (dashboard table)
$('#quickSearch').addEventListener('input', (e)=>{
  const v = e.target.value.trim().toLowerCase();
  if(!v) return renderRecent();
  const pool = [
    ...state.cases.map(c=>({kind:'Case', id:c.id, title:c.title, officer:c.officer, status:c.status, createdAt:c.createdAt})),
    ...state.reports.map(r=>({kind:r.type, id:r.id, title:r.title, officer:r.officer, status:r.caseId?'Linked to Case':'—', createdAt:r.createdAt}))
  ].filter(it => Object.values(it).join(' ').toLowerCase().includes(v)).slice(0,12);

  const tbody = $('#recentTable tbody'); tbody.innerHTML='';
  for(const it of pool){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.kind}</td><td>${it.id}</td>
      <td>${escape(it.title)}</td>
      <td>${escape(it.officer||'—')}</td>
      <td><span class="status ${cls(it.status)}">${escape(it.status)}</span></td>
      <td>${fmtDate(it.createdAt)}</td>`;
    tbody.appendChild(tr);
  }
});

// Helpers
function cls(s){ return (s||'').replace(/\s+/g,'\\ '); }
function escape(x){ return (x||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])); }

// Seed demo data once
(function seed(){
  if(state.cases.length || state.reports.length) { render(); return; }
  const caseId = genId('CASE'), rptId = genId('TC');
  state.cases.push({
    id: caseId, primaryReportId: rptId, officer:'Ofc. J. Carter #5123',
    status:'Pending Follow-up', involved:'4SXR912 • —', createdAt: Date.now()-1000*60*60*6,
    title:'Traffic Collision — Vinewood Blvd / Meteor St'
  });
  state.reports.push({
    id: rptId, type:'Traffic Collision', caseId, officer:'Ofc. J. Carter #5123',
    subject:'4SXR912', createdAt: Date.now()-1000*60*60*6, title:'Rear-end collision, minor injuries'
  });
  state.reports.push({
    id: genId('TS'), type:'Traffic Stop', caseId:null, officer:'Sgt. K. Diaz #4107',
    subject:'8KLM223', createdAt: Date.now()-1000*60*60*2, title:'No front plate, verbal warning'
  });
  db.save(state);
  render();
})();

function render(){
  renderKPIs();
  if(currentRoute==='dashboard'){ renderRecent(); }
  if(currentRoute==='cases'){ renderCases(); }
  if(currentRoute==='reports'){ renderReports(); }
}
