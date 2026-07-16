const API_BASE = 'https://api.openweathermap.org/data/2.5/weather'

// Basic mapping from common Korean names to OpenWeatherMap city names (with country code)
const KOREAN_CITY_MAP = {
  '서울': 'Seoul,KR',
  '부산': 'Busan,KR',
  '대구': 'Daegu,KR',
  '인천': 'Incheon,KR',
  '광주': 'Gwangju,KR',
  '대전': 'Daejeon,KR',
  '울산': 'Ulsan,KR',
  '제주': 'Jeju,KR',
  '구미': 'Gumi,KR'
}

// unify env keys (fallback to either name)
const DEFAULT_WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY || import.meta.env.VITE_WEATHER_API_KEY || ''

/**
 * Fetch current weather for a city using OpenWeatherMap
 * Defaults: city "구미", apiKey from VITE_WEATHER_KEY or VITE_WEATHER_API_KEY
 * Returns normalized object or throws an Error
 */
export async function fetchCurrentWeather(
  city = "구미",
  apiKey = DEFAULT_WEATHER_KEY
) {
  if (!city) city = "구미";
  if (!apiKey) throw new Error("API key required (set VITE_WEATHER_KEY or VITE_WEATHER_API_KEY)");

  // Map common Korean names to English+country when possible
  let query = city;
  try {
    const trimmed = (city || "").trim();
    if (/[\u3131-\u318E\uAC00-\uD7A3]/.test(trimmed)) {
      for (const k in KOREAN_CITY_MAP) {
        if (trimmed === k || trimmed.includes(k)) {
          query = KOREAN_CITY_MAP[k];
          break;
        }
      }
    }
  } catch (e) {
    // ignore mapping errors
  }

  const url = `${API_BASE}?q=${encodeURIComponent(query)}&appid=${encodeURIComponent(
    apiKey
  )}&units=metric&lang=kr`;

  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message || res.statusText || "Weather API error";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const data = body;
  return {
    city: data.name,
    country: data.sys?.country,
    temp: data.main?.temp,
    feels_like: data.main?.feels_like,
    humidity: data.main?.humidity,
    weather: data.weather?.[0]?.main || data.weather?.[0]?.description,
    weatherId: data.weather?.[0]?.id,
    icon: data.weather?.[0]?.icon,
    rain: data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0,
    snow: data.snow?.["1h"] ?? data.snow?.["3h"] ?? 0,
    raw: data,
  };
}

// Gumi coords
const GUMI_LAT = 36.119;
const GUMI_LON = 128.344;

/**
 * Fetch hourly + daily forecast via OpenWeatherMap One Call (legacy 2.5)
 * Returns { hourly: [...], daily: [...] } with normalized entries
 */
export async function fetchGumiForecast(apiKey = DEFAULT_WEATHER_KEY) {
  if (!apiKey) throw new Error('API key required (set VITE_WEATHER_KEY or VITE_WEATHER_API_KEY)');

  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${GUMI_LAT}&lon=${GUMI_LON}&exclude=minutely,alerts&units=metric&lang=kr&appid=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message || res.statusText || 'OneCall API error';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const normalizeHour = (h) => ({
    dt: h.dt, // unix
    time: new Date(h.dt * 1000).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    temp: h.temp,
    feels_like: h.feels_like,
    pop: h.pop ?? 0,
    humidity: h.humidity,
    wind_speed: h.wind_speed,
    weather: h.weather?.[0]?.description || '',
    icon: h.weather?.[0]?.icon || '',
    raw: h
  });

  const normalizeDay = (d) => ({
    dt: d.dt,
    date: new Date(d.dt * 1000).toLocaleDateString('ko-KR'),
    temp: { day: d.temp?.day, min: d.temp?.min, max: d.temp?.max, night: d.temp?.night },
    pop: d.pop ?? 0,
    humidity: d.humidity,
    weather: d.weather?.[0]?.description || '',
    icon: d.weather?.[0]?.icon || '',
    raw: d
  });

  return {
    hourly: (body.hourly || []).slice(0, 48).map(normalizeHour),
    daily: (body.daily || []).slice(0, 8).map(normalizeDay),
    timezone: body.timezone,
    raw: body
  };
}

/**
 * Fallback forecast for free-tier keys using 3-hour forecast endpoint.
 * Returns the same shape as fetchGumiForecast.
 */
export async function fetchGumiForecastFallback(apiKey = DEFAULT_WEATHER_KEY) {
  if (!apiKey) throw new Error('API key required (set VITE_WEATHER_KEY or VITE_WEATHER_API_KEY)');

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${GUMI_LAT}&lon=${GUMI_LON}&units=metric&lang=kr&appid=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = body.message || res.statusText || 'Forecast API error';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const list = body.list || [];
  const hourly = list.slice(0, 16).map((h) => ({
    dt: h.dt,
    time: new Date(h.dt * 1000).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    temp: h.main?.temp,
    feels_like: h.main?.feels_like,
    pop: h.pop ?? 0,
    humidity: h.main?.humidity,
    wind_speed: h.wind?.speed,
    weather: h.weather?.[0]?.description || '',
    icon: h.weather?.[0]?.icon || '',
    raw: h
  }));

  const dayMap = new Map();
  for (const item of list) {
    const key = new Date(item.dt * 1000).toLocaleDateString('ko-KR');
    if (!dayMap.has(key)) {
      dayMap.set(key, {
        dt: item.dt,
        date: key,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        dayTempSum: 0,
        dayTempCount: 0,
        humiditySum: 0,
        humidityCount: 0,
        popMax: 0,
        weather: item.weather?.[0]?.description || '',
        icon: item.weather?.[0]?.icon || ''
      });
    }

    const d = dayMap.get(key);
    const t = item.main?.temp;
    const hum = item.main?.humidity;
    if (typeof t === 'number') {
      d.min = Math.min(d.min, t);
      d.max = Math.max(d.max, t);
      d.dayTempSum += t;
      d.dayTempCount += 1;
    }
    if (typeof hum === 'number') {
      d.humiditySum += hum;
      d.humidityCount += 1;
    }
    d.popMax = Math.max(d.popMax, item.pop ?? 0);
  }

  const daily = Array.from(dayMap.values()).slice(0, 8).map((d) => ({
    dt: d.dt,
    date: d.date,
    temp: {
      day: d.dayTempCount ? d.dayTempSum / d.dayTempCount : undefined,
      min: Number.isFinite(d.min) ? d.min : undefined,
      max: Number.isFinite(d.max) ? d.max : undefined,
      night: undefined
    },
    pop: d.popMax,
    humidity: d.humidityCount ? d.humiditySum / d.humidityCount : undefined,
    weather: d.weather,
    icon: d.icon,
    raw: d
  }));

  return {
    hourly,
    daily,
    timezone: body.city?.timezone,
    raw: body
  };
}

export async function fetchGumiForecastSafe(apiKey = DEFAULT_WEATHER_KEY) {
  try {
    return await fetchGumiForecast(apiKey);
  } catch (err) {
    // One Call 2.5 can fail for some free-tier keys. Fallback to /forecast.
    if (err?.status === 401 || err?.status === 404) {
      return fetchGumiForecastFallback(apiKey);
    }
    throw err;
  }
}

// Convenience: fetch Gumi weather
export async function fetchGumiWeather(apiKey = DEFAULT_WEATHER_KEY) {
  return fetchCurrentWeather("구미", apiKey);
}

// Lightweight summary (keeps previous behavior)
export function getWeatherSummary(region = '구미') {
  return {
    region,
    summary: `🌤️ ${region}시 날씨: 맑음 · 25°C`,
    advice: '야외 산책과 관광지 이동에 적합한 날씨입니다.'
  }
}

export default {
  fetchCurrentWeather,
  fetchGumiWeather,
  fetchGumiForecast,
  fetchGumiForecastFallback,
  fetchGumiForecastSafe,
  getWeatherSummary
}