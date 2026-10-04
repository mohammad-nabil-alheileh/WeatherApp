// Search form and place suggestions.
import {IMAGE_PATH, MIN_QUERY_LENGTH, SUGGESTION_DELAY_MS} from '../config.js';
import {$} from '../dom.js';
import {findPlaces} from '../api.js';
import {escapeHtml} from '../format.js';
import {closeAllDropdowns} from './dropdowns.js';

let suggestions = [], timer, inputId = 0;

function showSuggestions(html) {
  closeAllDropdowns();
  const menu = $('#search-suggestions');
  menu.innerHTML = html;
  menu.hidden = false;
}

const suggestionLabel = place => [...new Set([place.name, place.admin1, place.country].filter(Boolean))].join(', ');

const progressMarkup = `<div class="search-progress"><img class="search-progress__spinner" src="${IMAGE_PATH}icon-loading.svg" alt="">Search in progress</div>`;

// Invalidates pending suggestion requests so they cannot reopen the menu.
function cancelSuggestions() {
  inputId++;
  clearTimeout(timer);
}

export function initSearch({onSelect, onSubmit}) {
  const input = $('#search-input');

  input.addEventListener('input', () => {
    cancelSuggestions();
    const query = input.value.trim(), id = inputId;
    if (query.length < MIN_QUERY_LENGTH) return closeAllDropdowns();
    showSuggestions(progressMarkup);
    timer = setTimeout(async () => {
      try {
        const results = await findPlaces(query);
        if (id !== inputId) return;
        if (!results.length) return closeAllDropdowns();
        suggestions = results;
        showSuggestions(results.map((place, i) =>
          `<button class="dropdown__item" type="button" data-index="${i}">${escapeHtml(suggestionLabel(place))}</button>`).join(''));
      } catch {
        if (id === inputId) closeAllDropdowns();
      }
    }, SUGGESTION_DELAY_MS);
  });

  $('#search-suggestions').addEventListener('click', event => {
    const item = event.target.closest('.dropdown__item');
    if (!item) return;
    const place = suggestions[+item.dataset.index];
    cancelSuggestions();
    closeAllDropdowns();
    input.value = place.name;
    onSelect(place);
  });

  $('#search-form').addEventListener('submit', event => {
    event.preventDefault();
    cancelSuggestions();
    onSubmit(input.value);
  });
}
