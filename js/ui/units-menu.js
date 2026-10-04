// Units dropdown: the Imperial/Metric switch plus per-unit choices.
import {IMAGE_PATH, IMPERIAL_UNITS, METRIC_UNITS, UNIT_GROUPS} from '../config.js';
import {$, $$} from '../dom.js';
import {isImperial, store} from '../store.js';

const check = `<img class="dropdown__check" src="${IMAGE_PATH}icon-checkmark.svg" alt="">`;

const groupMarkup = ([title, key, options]) => `
  <div class="dropdown__group" role="group" aria-label="${title}">
    <p class="dropdown__group-title">${title}</p>
    ${options.map(([value, label]) =>
      `<button class="dropdown__item" role="menuitemradio" data-unit="${key}" data-value="${value}">${label}${check}</button>`).join('')}
  </div>`;

function syncMenu() {
  $('#units-switch').textContent = 'Switch to ' + (isImperial() ? 'Metric' : 'Imperial');
  $$('#units-menu [data-unit]').forEach(item =>
    item.setAttribute('aria-checked', store.units[item.dataset.unit] === item.dataset.value));
}

export function initUnitsMenu(onChange) {
  const menu = $('#units-menu');
  menu.innerHTML = '<button class="dropdown__item" id="units-switch" role="menuitem"></button>' + UNIT_GROUPS.map(groupMarkup).join('');
  menu.addEventListener('click', event => {
    const item = event.target.closest('.dropdown__item');
    if (!item) return;
    if (item.dataset.unit) store.units[item.dataset.unit] = item.dataset.value;
    else Object.assign(store.units, isImperial() ? METRIC_UNITS : IMPERIAL_UNITS);
    syncMenu();
    onChange();
  });
  syncMenu();
}
