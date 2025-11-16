// helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* Sidebar collapse (desktop) + drawer (mobile) */
const sidebar = $('.sidebar');
const collapseBtn = $('.js-toggle-sidebar');
const openBtn = $('.js-open-sidebar');

const SIDEBAR_KEY = 'traffic_division_sidebar_collapsed';

function setSidebarCollapsed(collapsed){
  const isMobile = window.matchMedia('(max-width: 960px)').matches;
  if(isMobile){
    // treat as drawer; false=open, true=closed
    sidebar.dataset.collapsed = String(!collapsed);
    sidebar.style.transform = collapsed ? 'translateX(-100%)' : 'translateX(0)';
  }else{
    sidebar.dataset.collapsed = String(collapsed);
    sidebar.style.transform = '';
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }
}
function getSidebarCollapsed(){
  const isMobile = window.matchMedia('(max-width: 960px)').matches;
  if(isMobile) return true; // default closed on mobile
  return localStorage.getItem(SIDEBAR_KEY) === 'true';
}
function syncSidebar(){
  setSidebarCollapsed(getSidebarCollapsed());
}
window.addEventListener('resize', syncSidebar);
document.addEventListener('DOMContentLoaded', syncSidebar);

collapseBtn.addEventListener('click', () => {
  const isMobile = window.matchMedia('(max-width: 960px)').matches;
  if(isMobile){
    // close drawer
    setSidebarCollapsed(true);
  }else{
    const next = !(sidebar.dataset.collapsed === 'true');
    setSidebarCollapsed(next);
  }
});
openBtn.addEventListener('click', () => setSidebarCollapsed(false));

/* Accordion groups */
const ACC_PREFIX = 'traffic_division_group_';
function restoreAccordionState(section){
  const key = ACC_PREFIX + section.dataset.group;
  const open = localStorage.getItem(key) !== 'false';
  const toggle = $('.nav-group__toggle', section);
  const body = $('.nav-group__body', section);
  toggle.setAttribute('aria-expanded', String(open));
  section.setAttribute('aria-expanded', String(open));
  body.hidden = !open;
}
function setAccordionState(section, open){
  const key = ACC_PREFIX + section.dataset.group;
  localStorage.setItem(key, String(open));
  const toggle = $('.nav-group__toggle', section);
  const body = $('.nav-group__body', section);
  toggle.setAttribute('aria-expanded', String(open));
  section.setAttribute('aria-expanded', String(open));
  body.hidden = !open;
}
// init all
$$('.nav-group').forEach(restoreAccordionState);
$$('.js-accordion').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const section = e.currentTarget.closest('.nav-group');
    const open = btn.getAttribute('aria-expanded') !== 'true';
    setAccordionState(section, open);
  });
});

/* Placeholder click handlers for nav buttons */
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // For now, just a friendly placeholder action
    const label = btn.textContent.trim();
    const area = document.querySelector('.welcome h2');
    const p = document.querySelector('.welcome p');
    if(area && p){
      area.textContent = label;
      p.textContent = `This is a placeholder. The "${label}" form will appear here and export clean BBCode.`;
    }
  });
});
