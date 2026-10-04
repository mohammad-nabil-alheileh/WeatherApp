// Paints the store into the page. Without a forecast it paints the loading skeleton.
import {IMAGE_PATH} from '../config.js';
import {$} from '../dom.js';
import {formatDate, formatHour, formatPrecipitation, formatTemperature, formatWind} from '../format.js';
import {store} from '../store.js';
import {weatherIcon} from '../weather-codes.js';

const DAILY_SKELETON_COUNT = 7, HOURLY_SKELETON_COUNT = 8;

function renderCurrent(forecast) {
  $('#current-weather').classList.toggle('current-weather--loading', !forecast);
  if (!forecast) return;
  const {current} = forecast, icon = weatherIcon(current.weather_code), image = $('#current-icon');
  $('#current-city').textContent = store.place.label;
  $('#current-date').textContent = formatDate(current.time, {weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'});
  image.src = icon.src;
  image.alt = icon.label;
  $('#current-temperature').textContent = formatTemperature(current.temperature_2m);
}

function renderConditions(forecast) {
  const current = forecast && forecast.current;
  $('#feels-like').textContent = current ? formatTemperature(current.apparent_temperature) : '—';
  $('#humidity').textContent = current ? current.relative_humidity_2m + '%' : '—';
  $('#wind').textContent = current ? formatWind(current.wind_speed_10m) : '—';
  $('#precipitation').textContent = current ? formatPrecipitation(current.precipitation) : '—';
}

function renderDaily(forecast) {
  $('#daily-forecast-list').innerHTML = forecast
    ? forecast.daily.time.map((date, i) => {
        const icon = weatherIcon(forecast.daily.weather_code[i]);
        return `<li class="daily-forecast__card">
          <time class="daily-forecast__day" datetime="${date}">${formatDate(date, {weekday: 'short'})}</time>
          <img class="daily-forecast__icon" src="${icon.src}" alt="${icon.label}">
          <p class="daily-forecast__temperatures"><span>${formatTemperature(forecast.daily.temperature_2m_max[i])}</span><span>${formatTemperature(forecast.daily.temperature_2m_min[i])}</span></p>
        </li>`;
      }).join('')
    : '<li class="daily-forecast__card"></li>'.repeat(DAILY_SKELETON_COUNT);
}

function renderDayMenu(forecast) {
  $('#day-toggle').disabled = !forecast;
  $('#day-label').textContent = forecast ? formatDate(forecast.daily.time[store.selectedDay], {weekday: 'long'}) : '–';
  $('#day-menu').innerHTML = forecast
    ? forecast.daily.time.map((date, i) =>
        `<button class="dropdown__item" role="menuitemradio" aria-checked="${i === store.selectedDay}" data-index="${i}">${formatDate(date, {weekday: 'long'})}<img class="dropdown__check" src="${IMAGE_PATH}icon-checkmark.svg" alt=""></button>`).join('')
    : '';
}

// Today starts at the current hour; other days show all 24 hours.
function renderHourly(forecast) {
  const list = $('#hourly-list');
  if (!forecast) {
    list.innerHTML = '<li class="hourly-forecast__item"></li>'.repeat(HOURLY_SKELETON_COUNT);
  } else {
    const {hourly, current} = forecast, dayStart = store.selectedDay * 24;
    const first = dayStart + (store.selectedDay ? 0 : +current.time.slice(11, 13));
    const items = [];
    for (let i = first; i < dayStart + 24; i++) {
      const icon = weatherIcon(hourly.weather_code[i]);
      items.push(`<li class="hourly-forecast__item">
        <img class="hourly-forecast__icon" src="${icon.src}" alt="${icon.label}">
        <span class="hourly-forecast__time">${formatHour(hourly.time[i])}</span>
        <span class="hourly-forecast__temperature">${formatTemperature(hourly.temperature_2m[i])}</span>
      </li>`);
    }
    list.innerHTML = items.join('');
  }
  list.scrollTop = 0;
}

export function renderAll() {
  const forecast = store.forecast;
  renderCurrent(forecast);
  renderConditions(forecast);
  renderDaily(forecast);
  renderDayMenu(forecast);
  renderHourly(forecast);
}
