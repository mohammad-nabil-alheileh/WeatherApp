// Single shared application state.
import {IMPERIAL_UNITS, METRIC_UNITS} from './config.js';

export const store = {
  forecast: null,     // latest API response, null while loading
  place: null,        // {lat, lon, label}
  requestId: 0,       // ignores responses from outdated requests
  retryAction: null,  // re-runs the last search/load
  selectedDay: 0,     // index into the 7 forecast days
  units: {...METRIC_UNITS}
};

export const isImperial = () => Object.keys(IMPERIAL_UNITS).every(key => store.units[key] === IMPERIAL_UNITS[key]);
