// modules/trafficReport.js
import { getUserSettings } from './userSettings.js';

const qs = (s, r=document) => r.querySelector(s);

function formatDateDDMMMYYYY(d=new Date()){
  const dd = d.toLocaleString('en-GB', { day: '2-digit', timeZone: 'Europe/London' });
  const mmm = d.toLocaleString('en-GB', { month: 'short', timeZone: 'Europe/London' }).toUpperCase();
  const yyyy = d.toLocaleString('en-GB', { year: 'numeric', timeZone: 'Europe/London' });
  return `${dd}/${mmm}/${yyyy}`;
}
function utcHHMM(now=new Date()){
  return now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'UTC' });
}
function getShiftCallsign(){
  try {
    for (const k of ['activityShift','currentShift','shift','userSettings']){
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const o = JSON.parse(raw);
      if (o?.callsign) return o.callsign;
    }
  } catch {}
  return '';
}

export function initTrafficReport(){
  const navBtn = qs('#navTrafficReport');
  const activity = qs('#activityCard');
  const quick = qs('#quickHubCard');
  const container = qs('#trafficReportCard');

  async function ensureLoaded(){
    if (!container.dataset.loaded){
      const src = container.dataset.src || 'forms/traffic-report.html';
      const res = await fetch(src, { cache: 'no-store' });
      const html = await res.text();
      container.innerHTML = html;
      container.dataset.loaded = '1';
      wireForm(container);
    }
  }

  function show(el){ el?.classList.remove('hidden'); }
  function hide(el){ el?.classList.add('hidden'); }

  navBtn?.addEventListener('click', async () => {
    hide(activity); hide(quick);
    await ensureLoaded();
    show(container);
  });
}

function wireForm(scope=document){
  const f = {
    date: qs('#trDate', scope),
    timeUTC: qs('#trTimeUTC', scope),
    callsign: qs('#trCallsign', scope),
    name: qs('#trOfficerName', scope),
    rank: qs('#trOfficerRank', scope),
    serial: qs('#trOfficerSerial', scope)
  };

  // Prefill
  if (f.date) f.date.value = formatDateDDMMMYYYY(new Date());
  if (f.timeUTC) f.timeUTC.value = utcHHMM(new Date());
  const cs = getShiftCallsign(); if (cs && f.callsign) f.callsign.value = cs;

  const s = (typeof getUserSettings === 'function') ? (getUserSettings() || {}) : {};
  if (s.name && f.name) f.name.value = s.name;
  if (s.rank && f.rank) f.rank.value = s.rank;
  if (s.serial && f.serial) f.serial.value = s.serial;

  // Keep UTC clock fresh
  setInterval(()=>{ if (f.timeUTC) f.timeUTC.value = utcHHMM(new Date()); }, 15000);

  // Back to dashboard
  const backBtn = qs('#trBack', scope);
  const activity = qs('#activityCard');
  const quick = qs('#quickHubCard');
  const container = qs('#trafficReportCard');

  backBtn?.addEventListener('click', () => {
    container?.classList.add('hidden');
    activity?.classList.remove('hidden');
    quick?.classList.remove('hidden');
  });

  // Submit (stub; we’ll wire Activity Log + BBCode later)
  const form = qs('#trafficReportForm', scope);
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    console.info('[Traffic Report] Submitted (stub)');
  });
}
