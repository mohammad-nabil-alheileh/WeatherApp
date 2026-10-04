// Open-Meteo requests (free, open source, no API key).
import {API} from './config.js';

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export async function findPlaces(query) {
  const data = await getJSON(`${API.geocoding}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
  return data.results || [];
}

export const toPlace = result => ({
  label: [result.name, result.country].filter(Boolean).join(', '),
  lat: result.latitude,
  lon: result.longitude
});

export const fetchForecast = ({lat, lon}) => getJSON(`${API.forecast}?latitude=${lat}&longitude=${lon}`
  + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'
  + '&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min'
  + '&timezone=auto&forecast_days=7');
