// Shared dropdown behaviour: only one menu is open at a time.
import {$, $$} from '../dom.js';

export function closeAllDropdowns() {
  $$('.dropdown__menu').forEach(menu => { menu.hidden = true; });
  $$('.dropdown__toggle').forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
}

function toggleMenu(toggle) {
  const menu = $('#' + toggle.getAttribute('aria-controls')), wasClosed = menu.hidden;
  closeAllDropdowns();
  if (wasClosed) {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }
}

function handleKeys(event) {
  const openMenu = $('.dropdown__menu:not([hidden])');
  if (!openMenu) return;

  if (event.key === 'Escape') {
    const toggle = openMenu.parentElement.querySelector('.dropdown__toggle');
    closeAllDropdowns();
    (toggle || $('#search-input')).focus();
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    const items = [...openMenu.querySelectorAll('.dropdown__item')];
    if (!items.length) return;
    const goDown = event.key === 'ArrowDown', current = items.indexOf(document.activeElement);
    const next = current < 0 ? (goDown ? 0 : items.length - 1) : (current + (goDown ? 1 : -1) + items.length) % items.length;
    event.preventDefault();
    items[next].focus();
  }
}

export function initDropdowns() {
  $$('.dropdown__toggle').forEach(toggle => toggle.addEventListener('click', () => toggleMenu(toggle)));
  document.addEventListener('click', event => {
    if (!event.target.closest('.dropdown, .search-form__field')) closeAllDropdowns();
  });
  document.addEventListener('keydown', handleKeys);
}
