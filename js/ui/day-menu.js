// Day selector in the hourly forecast header.
import {$} from '../dom.js';
import {store} from '../store.js';
import {closeAllDropdowns} from './dropdowns.js';

export function initDayMenu(onChange) {
  $('#day-menu').addEventListener('click', event => {
    const item = event.target.closest('.dropdown__item');
    if (!item) return;
    store.selectedDay = +item.dataset.index;
    closeAllDropdowns();
    $('#day-toggle').focus();
    onChange();
  });
}
