// Maps Open-Meteo weather codes to the provided icon files.
import {IMAGE_PATH} from './config.js';

const describe = code =>
  code === 0 ? ['sunny', 'Sunny']
  : code <= 2 ? ['partly-cloudy', 'Partly cloudy']
  : code === 3 ? ['overcast', 'Overcast']
  : code <= 48 ? ['fog', 'Fog']
  : code <= 57 ? ['drizzle', 'Drizzle']
  : code <= 67 ? ['rain', 'Rain']
  : code <= 77 ? ['snow', 'Snow']
  : code <= 82 ? ['rain', 'Rain showers']
  : code <= 86 ? ['snow', 'Snow showers']
  : ['storm', 'Thunderstorm'];

export function weatherIcon(code) {
  const [file, label] = describe(code);
  return {src: `${IMAGE_PATH}icon-${file}.webp`, label};
}
