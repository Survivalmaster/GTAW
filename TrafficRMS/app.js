// Helpers
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
    setSidebarCollapsed(true); // close drawer
  }else{
    const next = !(sidebar.dataset.collapsed === 'true');
    setSidebarCollapsed(next);
  }
});
openBtn.addEventListener('click', () => setSidebarCollapsed(false));

/* Accordion for nav sections */
$$('.nav-section').forEach(section => {
  const key = 'traffic_division_group_' + section.dataset.group;
  const saved = localStorage.getItem(key);
  const open = saved === null ? (section.getAttribute('aria-expanded') !== 'false') : saved !== 'false';

  const toggle = $('.nav-section__toggle', section);
  const body = $('.nav-list', section);

  toggle.setAttribute('aria-expanded', String(open));
  section.setAttribute('aria-expanded', String(open));
  body.hidden = !open;

  toggle.addEventListener('click', () => {
    const nowOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(nowOpen));
    section.setAttribute('aria-expanded', String(nowOpen));
    body.hidden = !nowOpen;
    localStorage.setItem(key, String(nowOpen));
  });
});

/* Active item switching + placeholder content update */
$$('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.nav-item.is-active').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const label = $('.nav-item__label', btn)?.textContent?.trim() || 'Tool';
    const area = document.querySelector('.welcome h2');
    const p = document.querySelector('.welcome p');
    if(area && p){
      area.textContent = label;
      p.textContent = `This is a placeholder. The "${label}" form will appear here and export clean BBCode.`;
    }
    // Close drawer on mobile after selection
    if (window.matchMedia('(max-width: 960px)').matches) setSidebarCollapsed(true);
  });
});

/* Simple nav search filter */
const navSearch = $('.nav-search__input');
if (navSearch) {
  navSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    $$('.nav-list .nav-item').forEach(item => {
      const txt = item.textContent.toLowerCase();
      item.style.display = txt.includes(q) ? '' : 'none';
    });
  });
}
