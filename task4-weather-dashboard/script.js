// Weather data from Open-Meteo (free, no API key required): https://open-meteo.com
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const RECENT_KEY = "auspify.weather.recent.v1";
const DEFAULT_CITY = "Delhi";

const $ = (id) => document.getElementById(id);
const form = $("searchForm");
const cityInput = $("cityInput");
const messageEl = $("message");
const loaderEl = $("loader");
const dashEl = $("dashboard");

let unit = "c";
let lastData = null; // { place, data }

// WMO weather codes -> label + emoji
const CODES = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌧️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"], 81: ["Rain showers", "🌧️"], 82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm, hail", "⛈️"], 99: ["Thunderstorm, hail", "⛈️"],
};
const describe = (code) => CODES[code] || ["Unknown", "🌡️"];

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.hidden = !text;
}

function setLoading(on) {
  loaderEl.hidden = !on;
  if (on) { showMessage(""); }
}

// fetch wrapper with timeout and HTTP error handling
async function getJSON(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Server error (${res.status}). Please try again later.`);
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Request timed out. Check your connection and try again.");
    if (err instanceof TypeError) throw new Error("Network error. Please check your internet connection.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function findCity(name) {
  const data = await getJSON(`${GEO_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
  if (!data.results || !data.results.length) throw new Error(`City "${name}" not found. Check the spelling and try again.`);
  const r = data.results[0];
  return { name: r.name, country: r.country || "", admin: r.admin1 || "", lat: r.latitude, lon: r.longitude };
}

async function getWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon, timezone: "auto", forecast_days: 5,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
  });
  return getJSON(`${WEATHER_URL}?${params}`);
}

const toUnit = (c) => Math.round(unit === "c" ? c : c * 9 / 5 + 32);
const sym = () => (unit === "c" ? "°C" : "°F");

function render() {
  if (!lastData) return;
  const { place, data } = lastData;
  const cur = data.current;
  const [label, emoji] = describe(cur.weather_code);

  $("place").textContent = [place.name, place.admin, place.country].filter(Boolean).join(", ");
  $("updated").textContent = "Updated " + new Date(cur.time).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
  $("icon").textContent = emoji;
  $("temp").textContent = toUnit(cur.temperature_2m) + sym();
  $("desc").textContent = label;
  $("feels").textContent = toUnit(cur.apparent_temperature) + sym();
  $("humidity").textContent = cur.relative_humidity_2m + "%";
  $("wind").textContent = Math.round(cur.wind_speed_10m) + " km/h";
  $("pressure").textContent = Math.round(cur.surface_pressure) + " hPa";

  const box = $("forecast");
  box.innerHTML = "";
  data.daily.time.forEach((d, i) => {
    const [dl, de] = describe(data.daily.weather_code[i]);
    const el = document.createElement("div");
    el.className = "day";
    const day = i === 0 ? "Today" : new Date(d + "T00:00").toLocaleDateString(undefined, { weekday: "short" });
    el.innerHTML = `<div class="d"></div><div class="i" title=""></div><div class="hi"></div><div class="lo"></div>`;
    el.querySelector(".d").textContent = day;
    el.querySelector(".i").textContent = de;
    el.querySelector(".i").title = dl;
    el.querySelector(".hi").textContent = toUnit(data.daily.temperature_2m_max[i]) + "°";
    el.querySelector(".lo").textContent = toUnit(data.daily.temperature_2m_min[i]) + "°";
    box.appendChild(el);
  });

  const rainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(cur.weather_code);
  document.body.classList.toggle("night", !cur.is_day && !rainy);
  document.body.classList.toggle("rain", rainy);
  dashEl.hidden = false;
}

async function search(name) {
  const q = name.trim();
  if (!q) { showMessage("Please enter a city name."); return; }
  if (q.length < 2 || !/[\p{L}]/u.test(q)) { showMessage("Please enter a valid city name."); return; }

  setLoading(true);
  try {
    const place = await findCity(q);
    const data = await getWeather(place.lat, place.lon);
    lastData = { place, data };
    saveRecent(place.name);
    render();
    showMessage("");
  } catch (err) {
    showMessage(err.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

// ----- recent searches -----
function loadRecent() {
  try { const r = JSON.parse(localStorage.getItem(RECENT_KEY)); return Array.isArray(r) ? r : []; } catch (_) { return []; }
}
function saveRecent(name) {
  const list = [name, ...loadRecent().filter((c) => c.toLowerCase() !== name.toLowerCase())].slice(0, 5);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (_) {}
  renderRecent();
}
function renderRecent() {
  const box = $("recent");
  box.innerHTML = "";
  loadRecent().forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c;
    b.addEventListener("click", () => { cityInput.value = c; search(c); });
    box.appendChild(b);
  });
}

form.addEventListener("submit", (e) => { e.preventDefault(); search(cityInput.value); });

document.querySelectorAll(".unit").forEach((b) => b.addEventListener("click", () => {
  unit = b.dataset.unit;
  document.querySelectorAll(".unit").forEach((x) => x.classList.toggle("active", x === b));
  render();
}));

renderRecent();
const first = loadRecent()[0] || DEFAULT_CITY;
cityInput.value = first;
search(first);
