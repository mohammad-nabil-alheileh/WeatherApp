// Unit conversion and text formatting. The API always returns metric values.
import {store} from './store.js';

export const formatTemperature = celsius =>
  Math.round(store.units.temperature === 'f' ? celsius * 9 / 5 + 32 : celsius) + '°';

export const formatWind = kmh =>
  store.units.wind === 'mph' ? Math.round(kmh / 1.609344) + ' mph' : Math.round(kmh) + ' km/h';

export const formatPrecipitation = mm =>
  store.units.precipitation === 'in' ? +(mm / 25.4).toFixed(2) + ' in' : +mm.toFixed(1) + ' mm';

// "2025-08-05T15:00" -> "3 PM" (API times are already local to the place)
export function formatHour(isoTime) {
  const hour = +isoTime.slice(11, 13);
  return `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
}

export const formatDate = (isoTime, options) =>
  new Date(isoTime.slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-US', {...options, timeZone: 'UTC'});

export const escapeHtml = text =>
  text.replace(/[&<>"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[char]));
