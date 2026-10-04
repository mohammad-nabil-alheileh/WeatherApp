# Weather Now

A responsive weather app built with plain **HTML, CSS and JavaScript**, with no frameworks and no build step. Search for a place and see its current conditions, a 7-day forecast and an hourly forecast, with full control over the measurement units.

Weather data comes from [Open-Meteo](https://open-meteo.com/), which needs no API key.

## Contents

- [Features](#features)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Layout and styling](#layout-and-styling)
- [Accessibility](#accessibility)

## Features

- **Search** for any place, with live suggestions while typing. Press **Enter**, click **Search**, or pick a suggestion.
- **Current conditions:** city and country, full date, weather icon and temperature.
- **Extra metrics:** feels like, humidity, wind and precipitation.
- **7-day forecast:** weekday, icon, daily high and daily low.
- **Hourly forecast:** icon, time and temperature for each hour, with a day selector for the seven forecast days.
- **Units:** one switch between Imperial and Metric, plus individual choices for temperature, wind speed and precipitation. Units can be mixed, and changing them is instant.
- **Interface states:** loading, no results and API error (with a Retry button).

## Getting started

The JavaScript uses ES modules, and browsers block modules on `file://` URLs. Serve the folder over HTTP instead of opening `index.html` directly:

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, VS Code Live Server, and so on). An internet connection is needed to fetch weather data.

## Project structure

```
weather-now/
├── index.html              # semantic page structure
├── css/
│   └── style.css           # one stylesheet, sections in page order, media queries at the bottom
├── js/
│   ├── main.js             # entry point: wires modules, owns the load and search flows
│   ├── config.js           # endpoints, defaults, unit definitions
│   ├── store.js            # shared application state
│   ├── api.js              # Open-Meteo requests (geocoding + forecast)
│   ├── format.js           # unit conversion and text formatting
│   ├── weather-codes.js    # weather code -> icon mapping
│   ├── dom.js              # DOM helpers and the view switcher
│   └── ui/
│       ├── render.js       # paints the store into the page (and the loading skeleton)
│       ├── search.js       # search form and place suggestions
│       ├── dropdowns.js    # shared dropdown behaviour (one open at a time)
│       ├── units-menu.js   # Units dropdown
│       └── day-menu.js     # day selector of the hourly forecast
└── assets/
    ├── fonts/              # DM Sans and Bricolage Grotesque
    └── images/             # weather icons, backgrounds, logo, favicon, UI icons
```

### Module responsibilities

| Module | Role | Imports |
|--------|------|---------|
| `main.js` | Starts the app, runs `loadForecast` and `searchLocation`, passes callbacks to the UI modules | `api`, `config`, `dom`, `store` and every `ui/` module |
| `config.js` | Constants only: API URLs, default city (Berlin), minimum query length, suggestion delay, unit definitions | none |
| `store.js` | The single state object and the `isImperial()` helper | `config` |
| `api.js` | `findPlaces`, `toPlace`, `fetchForecast` | `config` |
| `format.js` | Temperature, wind, precipitation, hour and date formatting, HTML escaping | `store` |
| `weather-codes.js` | Turns a weather code into an icon path and a text label | `config` |
| `dom.js` | `$`, `$$` and `setView` | none |
| `ui/render.js` | Writes the store into the page | `config`, `dom`, `format`, `store`, `weather-codes` |
| `ui/search.js` | Typing, suggestions and form submission | `api`, `config`, `dom`, `format`, `ui/dropdowns` |
| `ui/dropdowns.js` | Open, close and keyboard behaviour shared by all menus | `dom` |
| `ui/units-menu.js` | Builds and updates the Units menu | `config`, `dom`, `store` |
| `ui/day-menu.js` | Handles the day choice | `dom`, `store`, `ui/dropdowns` |

No module imports `main.js`. Instead, `main.js` hands the UI modules callbacks (`onSelect`, `onSubmit`, `onChange`), so there are no circular imports.

## How it works

### Startup

`main.js` initialises the dropdowns, the Units menu, the day menu and the search form, renders the empty skeleton, and then runs `searchLocation('Berlin')`. The page starts in the `loading` view and switches to `ready` when the forecast arrives.

### Data flow

1. **Geocoding:** the search term goes to the Open-Meteo geocoding API (`count=5`). On submit, the first match is used. While typing, up to five matches are offered as suggestions after a 300 ms pause and a minimum of two characters.
2. **Forecast:** one request per place asks for current conditions (temperature, feels like, humidity, precipitation, weather code, wind), hourly temperature and weather code, and daily weather code with highest and lowest temperature, in the place's local timezone, for 7 days.
3. **State:** the result is stored in `store.js` (`forecast`, `place`, `selectedDay`, `units`), and `renderAll()` repaints the page from that state.
4. **Re-rendering:** changing units or the day does not call the API. It only updates the store and runs `renderAll()` again.

### The store

```js
{
  forecast: null,     // latest API response, null while loading
  place: null,        // {lat, lon, label}
  requestId: 0,       // lets outdated responses be ignored
  retryAction: null,  // re-runs the last search or load
  selectedDay: 0,     // index into the 7 forecast days
  units: {temperature: 'c', wind: 'kmh', precipitation: 'mm'}
}
```

### Views

The page has four views: `loading`, `ready`, `empty` and `error`. A single `data-view` attribute on `<body>` selects one, and CSS shows or hides the matching sections.

| View | What is shown |
|------|---------------|
| `loading` | Skeleton of the whole page: loading indicator, `—` in the metric cards, empty forecast cards |
| `ready` | Current weather, metrics, daily forecast and hourly forecast |
| `empty` | "No search result found!" under the search bar (Open-Meteo returns an empty list rather than an error) |
| `error` | Full-page "Something went wrong" message with a **Retry** button |

**Retry** runs `store.retryAction`, which always holds the last failed search or forecast load.

### Stale responses

Every search and forecast load takes a new `requestId`, and a response is dropped when its id is no longer current. A slow response can therefore never overwrite a newer search. Suggestions use the same idea with their own counter, so a late suggestion list cannot reopen a menu the user has already left.

### Units

Data is always requested in metric. Conversion to imperial happens in the browser in `format.js`.

| Measure | Metric | Imperial | Conversion | Rounding |
|---------|--------|----------|------------|----------|
| Temperature | °C | °F | `°C × 9/5 + 32` | whole number |
| Wind speed | km/h | mph | `km/h ÷ 1.609344` | whole number |
| Precipitation | mm | in | `mm ÷ 25.4` | 1 decimal in mm, 2 decimals in inches |

The first item of the Units menu switches all three units at once. Its label reads "Switch to Metric" when all three are imperial and "Switch to Imperial" otherwise, including any mixed selection. The selected option in each group shows a checkmark.

### Weather icons

`weather-codes.js` maps Open-Meteo weather codes onto the eight provided icons.

| Weather codes | Icon | Label |
|---------------|------|-------|
| 0 | Sunny | Sunny |
| 1, 2 | Partly cloudy | Partly cloudy |
| 3 | Overcast | Overcast |
| 45, 48 | Fog | Fog |
| 51 – 57 | Drizzle | Drizzle |
| 61 – 67 | Rain | Rain |
| 71 – 77 | Snow | Snow |
| 80 – 82 | Rain | Rain showers |
| 85, 86 | Snow | Snow showers |
| 95 – 99 | Storm | Thunderstorm |

The label is used as the image's text alternative.

### Rendering

`render.js` has one function per area (current weather, metrics, daily cards, day menu, hourly list). Each one handles both cases: with a forecast it fills in real content, without one it paints the skeleton.

- **Dates and times:** API times are already local to the place. Hours are formatted straight from the ISO string, and dates are formatted in UTC, so the viewer's own timezone never shifts them.
- **Hourly list:** the selected day owns 24 consecutive entries of the hourly arrays. Today starts at the current hour, and every other day shows all 24 hours. The list scrolls back to the top on every render.
- **Suggestions:** place names are escaped before being inserted as HTML.

### Dropdowns

Three menus share the behaviour in `dropdowns.js`: Units, the day selector, and the search suggestions.

- Only one menu is open at a time.
- Clicking outside closes the open menu.
- **Esc** closes it and returns focus to its toggle button (or to the search field for suggestions).
- **↑ / ↓** move through the items and wrap around at the ends.
- Choosing a day closes the menu and returns focus to the day button.

### Code conventions

- **HTML:** semantic elements (`header`, `main`, `section`, `form role="search"`, `dl`, `ol`, `time`) and BEM-style class names such as `current-weather__temperature`.
- **CSS:** sections follow the order of the page, properties are alphabetical in every rule, sizes are in `rem` (only borders and outlines stay in `px`), and all media queries sit at the bottom grouped by breakpoint, then by section.
- **JS:** small ES modules with one responsibility each.

## Layout and styling

The layout is mobile-first and the content is capped at 76rem (1216px) wide.

| Width | Layout |
|-------|--------|
| below 360px | Compact current-weather card and metric cards so extreme values fit |
| below 600px | Single column, full-width search button, 2 metric columns, 3 daily columns |
| 600px and up | Larger header logo, row layout inside the current-weather card, 4 daily columns |
| 760px and up | 4 metric columns, 7 daily columns |
| 960px and up | Two columns: summary on the left, hourly panel on the right |

- **Hourly panel on desktop:** it matches the height of the left column and scrolls internally.
- **Units menu:** a dropdown anchored under the Units button in the header.
- **Loading state:** the current-weather card swaps its background for a neutral panel with animated dots.

## Accessibility

- A visible 2px focus outline on every interactive element (`:focus-visible`), plus hover states.
- Dropdown toggles use `aria-expanded`, `aria-controls` and `aria-haspopup`. The Units and day menus use `role="menu"` with `role="menuitemradio"` items and `aria-checked`.
- Weather icons have text alternatives (for example "Partly cloudy"). Decorative icons have empty `alt` text.
- The "no results" message uses `role="status"` and the error state uses `role="alert"`.
- Animations are switched off for users who prefer reduced motion.
