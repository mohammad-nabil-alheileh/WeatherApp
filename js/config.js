// Static configuration: endpoints, defaults and unit definitions.
export const IMAGE_PATH = 'assets/images/';

export const API = {
  forecast: 'https://api.open-meteo.com/v1/forecast',
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search'
};

export const DEFAULT_CITY = 'Berlin';
export const MIN_QUERY_LENGTH = 2;
export const SUGGESTION_DELAY_MS = 300;

export const METRIC_UNITS = {temperature: 'c', wind: 'kmh', precipitation: 'mm'};
export const IMPERIAL_UNITS = {temperature: 'f', wind: 'mph', precipitation: 'in'};

// [group title, unit key, [[value, label], ...]]
export const UNIT_GROUPS = [
  ['Temperature', 'temperature', [['c', 'Celsius (°C)'], ['f', 'Fahrenheit (°F)']]],
  ['Wind Speed', 'wind', [['kmh', 'km/h'], ['mph', 'mph']]],
  ['Precipitation', 'precipitation', [['mm', 'Millimeters (mm)'], ['in', 'Inches (in)']]]
];
