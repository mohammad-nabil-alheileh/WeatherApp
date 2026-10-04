// Entry point: wires the modules together and owns the load/search flows.
import {fetchForecast, findPlaces, toPlace} from './api.js';
import {DEFAULT_CITY} from './config.js';
import {$, setView} from './dom.js';
import {store} from './store.js';
import {initDayMenu} from './ui/day-menu.js';
import {closeAllDropdowns, initDropdowns} from './ui/dropdowns.js';
import {renderAll} from './ui/render.js';
import {initSearch} from './ui/search.js';
import {initUnitsMenu} from './ui/units-menu.js';

async function loadForecast(place) {
  const id = ++store.requestId;
  Object.assign(store, {forecast: null, place, retryAction: () => loadForecast(place)});
  setView('loading');
  renderAll();
  try {
    const forecast = await fetchForecast(place);
    if (id !== store.requestId) return;
    Object.assign(store, {forecast, selectedDay: 0});
    setView('ready');
  } catch {
    if (id !== store.requestId) return;
    setView('error');
  }
  renderAll();
}

async function searchLocation(query) {
  query = query.trim();
  if (!query) return;
  const id = ++store.requestId;
  Object.assign(store, {forecast: null, retryAction: () => searchLocation(query)});
  setView('loading');
  renderAll();
  closeAllDropdowns();
  try {
    const results = await findPlaces(query);
    if (id !== store.requestId) return;
    if (!results.length) return setView('empty');
    loadForecast(toPlace(results[0]));
  } catch {
    if (id === store.requestId) setView('error');
  }
}

initDropdowns();
initUnitsMenu(renderAll);
initDayMenu(renderAll);
initSearch({onSelect: place => loadForecast(toPlace(place)), onSubmit: searchLocation});
$('#retry-button').addEventListener('click', () => store.retryAction && store.retryAction());

renderAll();
searchLocation(DEFAULT_CITY);
