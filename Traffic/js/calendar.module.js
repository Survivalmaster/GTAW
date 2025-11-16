/* js/calendar.module.js — file:// safe calendar with overlay card */
(function () {
window.LSPDCalendar = window.LSPDCalendar || {};   // << add this

  function initCalendar({
    mountId = 'calendar-root',
    openButtonSelector = '#btn-calendar',
    hideSelectors = [],
    onExit = () => {}
  } = {}) {
    const mount = document.getElementById(mountId);
    if (!mount) throw new Error('Calendar mount not found: ' + mountId);

    // ===== STATE / CONST =====
    const STORAGE_EVENTS = 'lspd.crm.calendar.events.v1';
    const TZ = 'Europe/London';
    const dfTime  = new Intl.DateTimeFormat('en-GB',{ timeZone: TZ, hour:'2-digit', minute:'2-digit', hour12:false });
    const dfMonth = new Intl.DateTimeFormat('en-GB',{ timeZone: TZ, year:'numeric', month:'long' });
    const state = { viewDate: new Date(), events: [], filters: { types: new Set(['training','operation','other']) } };

    // make simple controls available to the page
    window.LSPDCalendar.open  = () => { hideDashboard(); render(); };
    window.LSPDCalendar.close = showDashboard;
    window.LSPDCalendar.openById = (id) => {
      const e = state.events.find(x => x.id === id);
      if (e) openEditModal(e);
    };

    // ===== OVERLAY (fixed to viewport, aligned to content column) =====
    let overlay = null, overlayCard = null, overlayHost = null;

    function getContentHost() {
      const quickHub = document.querySelector('#quickHub');
      return quickHub?.parentElement
        || document.querySelector('#content')
        || document.querySelector('main')
        || document.querySelector('.main')
        || document.body;
    }

    function ensureOverlay(host) {
      overlayHost = host;
      if (overlay) return overlay;

      overlay = document.createElement('div');
      overlay.id = 'calendar-overlay';
      Object.assign(overlay.style, {
        position: 'fixed', zIndex: '50', overflow: 'auto', background: 'transparent',
        padding: '12px', boxSizing: 'border-box'
      });

      overlayCard = document.createElement('div');
      Object.assign(overlayCard.style, {
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        padding: '12px', width: '100%', minHeight: '70vh', boxSizing: 'border-box'
      });

      overlay.appendChild(overlayCard);
      document.body.appendChild(overlay);

      const positionOverlay = () => {
        const r = host.getBoundingClientRect();
        overlay.style.left   = (r.left + window.scrollX) + 'px';
        overlay.style.top    = (r.top  + window.scrollY) + 'px';
        overlay.style.width  = r.width + 'px';
        overlay.style.height = Math.max(r.height, window.innerHeight - r.top) + 'px';
      };
      positionOverlay();
      window.addEventListener('resize', positionOverlay);
      window.addEventListener('scroll', positionOverlay, { passive: true });

      return overlay;
    }

    function hideDashboard() {
      hideSelectors.forEach(sel => { const el = document.querySelector(sel); if (el) el.hidden = true; });

      const host = getContentHost();
      ensureOverlay(host).style.display = 'block';

      if (mount.parentElement !== overlayCard) overlayCard.appendChild(mount);

      mount.hidden = false;
      mount.style.display = 'grid';
      mount.style.gridTemplateColumns = '1fr 320px';
      mount.style.gap = '16px';
      mount.style.width = '100%';
      mount.style.boxSizing = 'border-box';

      render();
    }

    function showDashboard() {
      if (overlay) overlay.style.display = 'none';
      mount.hidden = true;
      hideSelectors.forEach(sel => { const el = document.querySelector(sel); if (el) el.hidden = false; });
      onExit();
    }

    // ===== STORAGE =====
    function load(){ try{ state.events = JSON.parse(localStorage.getItem(STORAGE_EVENTS)||'[]'); }catch{ state.events=[]; } }
    function save(){ localStorage.setItem(STORAGE_EVENTS, JSON.stringify(state.events)); }

    // ===== HELPERS =====
    const uuid=()=> 'xxxxxx-xxxx-4xxx-yxxx-xxxxxx'.replace(/[xy]/g,c=>((Math.random()*16)|0).toString(16));
    function typeClass(t){ return t==='training'?'type-training':(t==='operation'?'type-operation':'type-other'); }
    function btn(lbl,fn){ const b=document.createElement('button'); b.type='button'; b.className='cal-btn'; b.textContent=lbl; b.onclick=fn; return b; }
    function toISOUTC(dateLocal, timeHHMM){
      const [y,m,d] = dateLocal.split('-').map(Number);
      const [hh,mm] = (timeHHMM||'00:00').split(':').map(Number);
      return new Date(Date.UTC(y, m-1, d, hh, mm)).toISOString();
    }
    function fromISOToLocalParts(iso){
      const dt=new Date(iso);
      const y=dt.toLocaleString('en-CA',{timeZone:TZ,year:'numeric'});
      const m=dt.toLocaleString('en-CA',{timeZone:TZ,month:'2-digit'});
      const d=dt.toLocaleString('en-CA',{timeZone:TZ,day:'2-digit'});
      const hh=dt.toLocaleString('en-GB',{timeZone:TZ,hour:'2-digit',hour12:false});
      const mm=dt.toLocaleString('en-GB',{timeZone:TZ,minute:'2-digit'});
      return {date:`${y}-${m}-${d}`, time:`${hh}:${mm}`};
    }
    function getMonthMatrix(d){
      const y=d.getFullYear(), m=d.getMonth();
      const first=new Date(y,m,1);
      const start=new Date(first);
      start.setDate(first.getDate()-((first.getDay()+6)%7));
      const cells=[]; for(let i=0;i<42;i++){ const x=new Date(start); x.setDate(start.getDate()+i); cells.push(x); }
      return cells;
    }
    function eventsOnDate(d){
      const y=d.toLocaleString('en-CA',{timeZone:TZ,year:'numeric'});
      const m=d.toLocaleString('en-CA',{timeZone:TZ,month:'2-digit'});
      const dd=d.toLocaleString('en-CA',{timeZone:TZ,day:'2-digit'});
      const key=`${y}-${m}-${dd}`;
      return state.events.filter(e=> fromISOToLocalParts(e.startISO).date===key && state.filters.types.has(e.type));
    }

    // ===== HELPERS (add this next to eventsOnDate) =====
    function upcoming(limit = 10) {
      const nowISO = new Date().toISOString();
      return state.events
        // show only items that haven't finished yet, and match active type filters
        .filter(e => (e.endISO || e.startISO) >= nowISO && state.filters.types.has(e.type))
        .sort((a, b) => a.startISO.localeCompare(b.startISO))
        .slice(0, limit);
    }


    // ===== CRUD =====
    function createEvent(d){
      const startISO = d.allDay ? toISOUTC(d.date,'00:00') : toISOUTC(d.date,d.start);
      const endISO   = d.allDay ? toISOUTC(d.date,'23:59')
                       : (d.end ? toISOUTC(d.date,d.end) : new Date(new Date(startISO).getTime()+3600000).toISOString());
      state.events.push({
        id: uuid(), title: d.title.trim(), description: (d.description||'').trim(),
        type: d.type, startISO, endISO, allDay: !!d.allDay, location: (d.location||'').trim(),
        tags: d.tags||[], createdAtISO: new Date().toISOString(), updatedAtISO: new Date().toISOString()
      });
      state.events.sort((a,b)=>a.startISO.localeCompare(b.startISO)); save(); render();
      renderDashboardUpcoming();
    }
    function updateEvent(id, patch){
      const i=state.events.findIndex(e=>e.id===id); if(i<0) return;
      const cur=state.events[i]; let allDay=cur.allDay, startISO=cur.startISO, endISO=cur.endISO;
      if (patch.date || patch.start || patch.end || typeof patch.allDay==='boolean'){
        allDay = typeof patch.allDay==='boolean' ? patch.allDay : cur.allDay;
        const base = patch.date || fromISOToLocalParts(cur.startISO).date;
        const st = allDay ? '00:00' : (patch.start || fromISOToLocalParts(cur.startISO).time);
        startISO = toISOUTC(base, st);
        endISO = allDay ? toISOUTC(base,'23:59') : toISOUTC(base, (patch.end || fromISOToLocalParts(cur.endISO).time));
      }
      state.events[i] = { ...cur, ...patch, allDay, startISO, endISO, updatedAtISO: new Date().toISOString() };
      state.events.sort((a,b)=>a.startISO.localeCompare(b.startISO)); save(); render();
      renderDashboardUpcoming();
    }
    function deleteEvent(id){ const i=state.events.findIndex(e=>e.id===id); if(i<0) return; state.events.splice(i,1); save(); render(); renderDashboardUpcoming();}

    // ===== RENDER =====
    function render(){
      mount.innerHTML='';

      const head=document.createElement('div'); head.className='cal-head';
      const title=document.createElement('div'); title.className='cal-title'; title.textContent=dfMonth.format(state.viewDate); head.appendChild(title);
      const actions=document.createElement('div'); actions.className='cal-actions';
      actions.append(
        btn('‹',()=>{const d=new Date(state.viewDate); d.setMonth(d.getMonth()-1); state.viewDate=d; render();}),
        btn('Today',()=>{state.viewDate=new Date(); render();}),
        btn('›',()=>{const d=new Date(state.viewDate); d.setMonth(d.getMonth()+1); state.viewDate=d; render();}),
        btn('+ Event',()=>openCreateModal()),
      );
      head.appendChild(actions); mount.appendChild(head);

      const shell=document.createElement('div'); shell.className='cal-grid';
      shell.style.display='grid'; shell.style.gridTemplateColumns='1fr 320px'; shell.style.gap='16px';

      const month=document.createElement('div'); month.className='month-grid';
      month.style.display='grid'; month.style.gridTemplateColumns='repeat(7,1fr)';
      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(w=>{ const h=document.createElement('div'); h.className='month-head'; h.textContent=w; month.appendChild(h); });
      const cells=getMonthMatrix(state.viewDate), curM=state.viewDate.getMonth();
      cells.forEach(d=>{
        const cell=document.createElement('div'); cell.className='month-cell'; if(d.getMonth()!==curM) cell.style.opacity='.5';
        const dn=document.createElement('div'); dn.className='daynum'; dn.textContent=d.toLocaleString('en-GB',{timeZone:TZ,day:'2-digit'}); cell.appendChild(dn);
        eventsOnDate(d).forEach(e=>{
          const p=document.createElement('div'); p.className=`event-pill ${typeClass(e.type)}`;
          const time=e.allDay?'All day':dfTime.format(new Date(e.startISO));
          p.textContent=`${e.title} • ${time}`; p.onclick=()=>openEditModal(e);
          cell.appendChild(p);
        });
        cell.ondblclick=()=> openCreateModal(d.toLocaleString('en-CA',{ timeZone:TZ, year:'numeric', month:'2-digit', day:'2-digit' }));
        month.appendChild(cell);
      });
      shell.appendChild(month);

      // upcoming
const aside = document.createElement('aside'); 
aside.className = 'cal-upcoming';

const h3 = document.createElement('h3');
h3.textContent = 'Upcoming Events';
aside.appendChild(h3);

// filter chips (unchanged)
const chipWrap = document.createElement('div'); chipWrap.className = 'up-filters';
['training','operation','other'].forEach(t=>{
  const c = btn(t[0].toUpperCase()+t.slice(1), ()=>{
    state.filters.types.has(t) ? state.filters.types.delete(t) : state.filters.types.add(t);
    render();
  });
  c.classList.add('type-chip', typeClass(t));
  if (!state.filters.types.has(t)) c.classList.add('is-muted');
  chipWrap.appendChild(c);
});
aside.appendChild(chipWrap);

// pretty list
const list = document.createElement('div');
list.className = 'up-list';
const items = upcoming(10);

if (items.length === 0) {
  const empty = document.createElement('div');
  empty.className = 'up-empty';
  empty.textContent = 'No upcoming events.';
  list.appendChild(empty);
} else {
  items.forEach(e => {
    const dt = new Date(e.startISO);
    const dateStr = dt.toLocaleString('en-GB', { timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = e.allDay ? 'All day' : dfTime.format(dt);

    const card = document.createElement('div');
    card.className = 'up-card ' + typeClass(e.type);

    // left: title + meta
    const left = document.createElement('div');
    left.className = 'up-left';

    const title = document.createElement('div');
    title.className = 'up-title';
    title.textContent = e.title;

    const meta = document.createElement('div');
    meta.className = 'up-meta';
    meta.textContent = `${dateStr} • ${timeStr}`;

    left.append(title, meta);

    // right: type badge + open
    const right = document.createElement('div');
    right.className = 'up-right';

    const badge = document.createElement('span');
    badge.className = 'up-badge ' + typeClass(e.type);
    badge.textContent = e.type[0].toUpperCase() + e.type.slice(1);

   // const openBtn = btn('Open', () => openEditModal(e));
   // openBtn.classList.add('up-open');

   // right.append(badge, openBtn);

    card.append(left, right);
    list.appendChild(card);
  });
}

aside.appendChild(list);
shell.appendChild(aside);

      mount.appendChild(shell);
      ensureModal();
    }

    // ===== MODAL =====
    let modal, form, delBtn, editingId=null;
    function ensureModal(){
      if (modal) return;
      modal=document.createElement('div'); modal.className='cal-modal';
      modal.innerHTML = `
  <div class="cal-dialog">
    <h3 id="dlg-title">New Event</h3>

    <div class="evt-grid">
      <div class="evt-row evt-full">
        <label class="evt-label" for="evt-title">Title</label>
        <input id="evt-title" class="cal-input" placeholder="Title *" required>
      </div>

      <div class="evt-row">
        <div class="evt-col">
          <label class="evt-label" for="evt-type">Type</label>
          <select id="evt-type" class="cal-select">
            <option value="training">Training</option>
            <option value="operation">Operation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="evt-col">
          <label class="evt-label" for="evt-date">Date</label>
          <input id="evt-date" class="cal-input" type="date">
        </div>
      </div>

      <div class="evt-row">
        <div class="evt-col">
          <label class="evt-label" for="evt-start">Start</label>
          <input id="evt-start" class="cal-input" type="time" value="09:00">
        </div>

        <div class="evt-col">
          <label class="evt-label" for="evt-end">End</label>
          <input id="evt-end" class="cal-input" type="time" value="10:00">
        </div>
      </div>

      <div class="evt-row evt-align">
        <label class="evt-label" for="evt-allDay">All-day</label>
        <input id="evt-allDay" type="checkbox">
      </div>

      <div class="evt-row evt-full">
        <label class="evt-label" for="evt-desc">Notes</label>
        <textarea id="evt-desc" class="cal-textarea" placeholder="Brief description (optional)"></textarea>
      </div>
    </div>

    <div class="dialog-actions">
      <button id="evt-delete" class="cal-btn btn-danger" type="button" style="display:none;">Delete</button>
      <div class="dialog-actions-right">
        <button id="evt-cancel" class="cal-btn btn-ghost" type="button">Cancel</button>
        <button id="evt-save" class="cal-btn" type="button">Save</button>
      </div>
    </div>
  </div>
`;
      document.body.appendChild(modal);
      form={title:modal.querySelector('#evt-title'), type:modal.querySelector('#evt-type'), date:modal.querySelector('#evt-date'),
            start:modal.querySelector('#evt-start'), end:modal.querySelector('#evt-end'), allDay:modal.querySelector('#evt-allDay'),
            desc:modal.querySelector('#evt-desc'), save:modal.querySelector('#evt-save'), cancel:modal.querySelector('#evt-cancel')};
      delBtn=modal.querySelector('#evt-delete');
      modal.addEventListener('click',e=>{ if(e.target===modal) closeModal(); });
      form.cancel.addEventListener('click', closeModal);
    }
    function openCreateModal(prefill){
      ensureModal(); editingId=null; delBtn.style.display='none';
      form.title.value=''; form.type.value='operation';
      form.date.value=prefill||new Date().toLocaleString('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
      form.start.value='09:00'; form.end.value='10:00'; form.allDay.checked=false; form.desc.value='';
      form.save.onclick=()=>{ if(!form.title.value.trim())return alert('Title required');
        createEvent({title:form.title.value,type:form.type.value,date:form.date.value,start:form.start.value,end:form.end.value,allDay:form.allDay.checked,description:form.desc.value});
        closeModal(); };
      modal.classList.add('open');
    }
    function openEditModal(e){
      ensureModal(); editingId=e.id; delBtn.style.display='inline';
      form.title.value=e.title; form.type.value=e.type;
      form.date.value=fromISOToLocalParts(e.startISO).date; form.start.value=fromISOToLocalParts(e.startISO).time; form.end.value=fromISOToLocalParts(e.endISO).time;
      form.allDay.checked=e.allDay; form.desc.value=e.description||'';
      form.save.onclick=()=>{ updateEvent(e.id,{title:form.title.value,type:form.type.value,date:form.date.value,start:form.start.value,end:form.end.value,allDay:form.allDay.checked,description:form.desc.value}); closeModal(); };
      delBtn.onclick=()=>{ if(confirm('Delete?')){ deleteEvent(e.id); closeModal(); } };
      modal.classList.add('open');
    }
    function closeModal(){ modal.classList.remove('open'); }

    // ===== BOOT =====
load();               // load events, but do NOT render yet
mount.hidden = true;  // keep hidden on page load
mount.innerHTML = '';

// wire the open button (belt & braces)
const openBtn = document.querySelector(openButtonSelector);
if (openBtn) {
  const open = () => { hideDashboard(); render(); };
  openBtn.addEventListener('click', open);
  openBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
}

// Auto-close on other nav / Esc / hash change (only when overlay is open)
document.addEventListener('click', (ev) => {
  if (!overlay || overlay.style.display === 'none') return;
  const el = ev.target.closest('.item, .nav-link, [data-nav], a[href], button[href]');
  if (!el || el.id === 'btn-calendar') return;
  showDashboard();
}, true);
window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && overlay && overlay.style.display !== 'none') showDashboard();
});
window.addEventListener('hashchange', () => {
  if (overlay && overlay.style.display !== 'none') showDashboard();
});
window.addEventListener('crm:navigate', () => {
  if (overlay && overlay.style.display !== 'none') showDashboard();
});

// public helpers
window.LSPDCalendar = window.LSPDCalendar || {};
window.LSPDCalendar.open  = () => { hideDashboard(); render(); };
window.LSPDCalendar.close = showDashboard;
window.LSPDCalendar.openById = (id) => {
  const e = state.events.find(x => x.id === id);
  if (e) openEditModal(e);
};

// also let the calendar call the dashboard refresher after CRUD
window.LSPDCalendar._refreshDashboard = () => { try { renderDashboardUpcoming(); } catch {} };

} // <<< END OF initCalendar ----------------------------------------------------


// ===== Dashboard Upcoming (between Quick Hub & Activity Log) =====
// Standalone (no dependency on initCalendar scope)
function renderDashboardUpcoming() {
  const list  = document.getElementById('upcomingDashList');
  const empty = document.getElementById('upcomingDashEmpty');
  if (!list || !empty) return;

  const STORAGE = 'lspd.crm.calendar.events.v1';
  const TZ = 'Europe/London';
  const fmtTime = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour:'2-digit', minute:'2-digit', hour12:false });

  let events = [];
  try { events = JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch {}

  const nowISO = new Date().toISOString();
  const items = events
    .filter(e => (e.endISO || e.startISO) >= nowISO)
    .sort((a,b) => a.startISO.localeCompare(b.startISO))
    .slice(0,5);

  list.innerHTML = '';
  if (items.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  items.forEach(e => {
    const dt = new Date(e.startISO);
    const dateStr = dt.toLocaleString('en-GB', { timeZone: TZ, day:'2-digit', month:'short', year:'numeric' });
    const timeStr = e.allDay ? 'All day' : fmtTime.format(dt);

    const li = document.createElement('li');
    li.className = 'up-card';

    const left = document.createElement('div');
    left.className = 'up-left';

    const title = document.createElement('div');
    title.className = 'up-title';
    title.textContent = e.title || '(Untitled)';

    const meta = document.createElement('div');
    meta.className = 'up-meta';
    meta.textContent = `${(e.type||'Other').replace(/^\w/, c=>c.toUpperCase())} • ${dateStr} • ${timeStr}`;

    const right = document.createElement('div');
    right.className = 'up-right';
    const badge = document.createElement('span');
    badge.className = 'up-badge';
    badge.textContent = (e.type||'Other').replace(/^\w/, c=>c.toUpperCase());

    right.append(badge);
    left.append(title, meta);
    li.append(left, right);
    list.appendChild(li);
  });
}

// render on load + when storage changes
window.addEventListener('DOMContentLoaded', renderDashboardUpcoming);
window.addEventListener('storage', renderDashboardUpcoming);

// (optional) expose for other scripts
window.renderDashboardUpcoming = renderDashboardUpcoming;
window.LSPDCalendar.initCalendar = initCalendar;

})(); // <<< END OF IIFE