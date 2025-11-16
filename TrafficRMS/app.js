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
  if(isMobile) return true;
  return localStorage.getItem(SIDEBAR_KEY) === 'true';
}
function syncSidebar(){ setSidebarCollapsed(getSidebarCollapsed()); }
window.addEventListener('resize', syncSidebar);
document.addEventListener('DOMContentLoaded', syncSidebar);

if (collapseBtn) {
  collapseBtn.addEventListener('click', () => {
    const isMobile = window.matchMedia('(max-width: 960px)').matches;
    if(isMobile){ setSidebarCollapsed(true); }
    else{
      const next = !(sidebar.dataset.collapsed === 'true');
      setSidebarCollapsed(next);
    }
  });
}
if (openBtn) openBtn.addEventListener('click', () => setSidebarCollapsed(false));

/* Accordion */
$$('.rail-section').forEach(section => {
  const key = 'traffic_division_group_' + section.dataset.group;
  const saved = localStorage.getItem(key);
  const defaultOpen = section.querySelector('.js-accordion')?.getAttribute('aria-expanded') !== 'false';
  const open = saved === null ? defaultOpen : saved !== 'false';

  const toggle = $('.js-accordion', section);
  const body = $('.rail-list', section);

  toggle.setAttribute('aria-expanded', String(open));
  body.hidden = !open;
  toggle.querySelector('.chevron').style.transform = open ? 'rotate(0)' : 'rotate(-90deg)';

  toggle.addEventListener('click', () => {
    const nowOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(nowOpen));
    body.hidden = !nowOpen;
    toggle.querySelector('.chevron').style.transform = nowOpen ? 'rotate(0)' : 'rotate(-90deg)';
    localStorage.setItem(key, String(nowOpen));
  });
});

/* Active switching + sample content update */
$$('.rail-item').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.rail-item.is-active').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const label = $('.rail-item__label', btn)?.textContent?.trim() || 'Tool';
    const h2 = document.querySelector('.welcome h2');
    const p = document.querySelector('.welcome p');
    if(h2 && p){
      h2.textContent = label;
      p.textContent = `This is a placeholder. The "${label}" form will appear here and export clean BBCode.`;
    }
    if (window.matchMedia('(max-width: 960px)').matches) setSidebarCollapsed(true);
  });
});

/* Search filter */
const navSearch = $('.rail-search__input');
if (navSearch) {
  navSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    $$('.rail-list .rail-item').forEach(item => {
      const txt = item.textContent.toLowerCase();
      item.style.display = txt.includes(q) ? '' : 'none';
    });
  });
}
