// RECO AI — GitHub Pages / frontend-only mode.
// There is no private backend or LLM in this build. Device state and issue reports
// are stored only in the current visitor's browser (localStorage).

const REPORTS_KEY = 'reco_github_pages_reports_v1'
const DEVICE_KEY = 'reco_github_pages_device_v1'
const HISTORY_KEY = 'reco_github_pages_device_history_v1'

const DEFAULT_DEVICE = {
  device_id: 'RECO-001',
  battery: 86,
  fan_on: false,
  runtime_hours: 2.4,
  filter_usage_pct: 28,
  connection: 'demo-local',
  source: 'browser-demo',
  created_at: new Date().toISOString(),
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    throw new Error('This browser could not save the demo data. Check available site storage and try again.')
  }
}

async function requestAirQuality(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'us_aqi,european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide',
    hourly: 'us_aqi,pm2_5',
    timezone: 'auto',
    forecast_days: '1',
  })
  const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`)
  if (!response.ok) throw new Error(`Air-quality provider returned ${response.status}. Please try again later.`)
  const raw = await response.json()
  const times = raw.hourly?.time || []
  const hourly = times.map((time, index) => ({
    time,
    us_aqi: raw.hourly?.us_aqi?.[index] ?? null,
    pm2_5: raw.hourly?.pm2_5?.[index] ?? null,
  }))
  return {
    current: raw.current || {},
    hourly,
    source: 'Open-Meteo Air Quality API (modelled grid data)',
    current_units: raw.current_units || {},
    timezone: raw.timezone || 'local provider time',
  }
}

let lastGeocodeAt = 0
async function geocodePlace(query) {
  const wait = Math.max(0, 1100 - (Date.now() - lastGeocodeAt))
  if (wait) await new Promise(resolve => setTimeout(resolve, wait))
  lastGeocodeAt = Date.now()
  const params = new URLSearchParams({ format: 'jsonv2', limit: '1', q: query })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'en' },
  })
  if (!response.ok) throw new Error(`Location search returned ${response.status}. Try again in a moment.`)
  const items = await response.json()
  if (!items.length) throw new Error(`We could not find “${query}”. Add a city or state to the place name.`)
  return { latitude: Number(items[0].lat), longitude: Number(items[0].lon), name: items[0].display_name }
}

async function sampleRouteAir(route) {
  const coords = route.geometry?.coordinates || []
  if (coords.length < 2) return { average_us_aqi: null, average_pm2_5: null, sample_count: 0 }
  const fractions = [0.25, 0.75]
  const points = fractions.map(f => coords[Math.min(coords.length - 1, Math.floor((coords.length - 1) * f))])
  const samples = await Promise.all(points.map(([lon, lat]) => requestAirQuality(lat, lon).catch(() => null)))
  const valid = samples.map(s => s?.current).filter(Boolean)
  const mean = key => {
    const values = valid.map(v => Number(v[key])).filter(Number.isFinite)
    return values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null
  }
  return { average_us_aqi: mean('us_aqi'), average_pm2_5: mean('pm2_5'), sample_count: valid.length }
}

async function compareRoutes(originText, destinationText) {
  const origin = await geocodePlace(originText)
  const destination = await geocodePlace(destinationText)
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=true&steps=false`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Routing service returned ${response.status}. Please try again later.`)
  const data = await response.json()
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No driving route was returned for these places.')

  const enriched = await Promise.all(data.routes.slice(0, 3).map(async (route, index) => {
    const air = await sampleRouteAir(route)
    return {
      id: `route-${index + 1}`,
      rank: index + 1,
      recommended: false,
      distance_km: Number((route.distance / 1000).toFixed(1)),
      duration_minutes: Math.round(route.duration / 60),
      geometry: route.geometry,
      ...air,
    }
  }))
  enriched.sort((a, b) => {
    if (a.average_us_aqi != null && b.average_us_aqi != null && a.average_us_aqi !== b.average_us_aqi) return a.average_us_aqi - b.average_us_aqi
    if (a.average_us_aqi != null && b.average_us_aqi == null) return -1
    if (a.average_us_aqi == null && b.average_us_aqi != null) return 1
    return a.duration_minutes - b.duration_minutes
  })
  enriched.forEach((route, index) => { route.rank = index + 1; route.recommended = index === 0 })
  const hasSamples = enriched.some(r => r.sample_count > 0)
  return {
    origin: { latitude: origin.latitude, longitude: origin.longitude, name: origin.name },
    destination: { latitude: destination.latitude, longitude: destination.longitude, name: destination.name },
    routes: enriched,
    method: hasSamples
      ? 'Routes are returned by the public OSRM demo routing service. Available route-point air-quality samples are compared first; duration is used as a tie-breaker.'
      : 'Routes are returned by the public OSRM demo routing service and ordered by estimated driving duration because route-point air-quality samples were unavailable.',
    limitations: 'This is an indicative browser demo. Public services can be rate-limited; model-grid air data is not street-level monitoring and does not guarantee a clean or safe route.',
  }
}

function readReports() {
  return readStorage(REPORTS_KEY, [])
}

async function compressImage(file) {
  if (!file) return null
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Please choose an image smaller than 5 MB.')
  if (!('createImageBitmap' in window)) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('The image could not be read.'))
      reader.readAsDataURL(file)
    })
  }
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', 0.72)
}

function localChatReply(message) {
  const q = message.toLowerCase()
  if (q.includes('aqi') || q.includes('air quality index')) return 'AQI means Air Quality Index. It turns several air-pollution measurements into a scale that is easier to understand. A higher AQI generally means poorer air quality. RECO AI can display modelled air-quality data for a nearby grid cell; it is not a reading from the helmet itself.'
  if (q.includes('pm2.5') || q.includes('pm 2.5') || q.includes('pm10') || q.includes('pm 10')) return 'PM2.5 refers to very small airborne particles, while PM10 includes a larger size range of particles. They are reported as concentrations, commonly in micrograms per cubic metre (µg/m³). The values on the RECO dashboard come from an external model/data provider, not a personal exposure sensor.'
  if (q.includes('route') || q.includes('clean road') || q.includes('journey')) return 'The Clean Route Finder looks up your start and destination, requests available driving routes, and samples modelled air-quality data at a small number of points along each route when available. This is an indicative comparison, not a guarantee of the cleanest or safest road. Public map and routing services may be rate-limited.'
  if (q.includes('helmet') || q.includes('reco device') || q.includes('fan') || q.includes('filter')) return 'The RECO helmet is a full-face smart-helmet concept with a proposed rear module containing a fan, air filter, battery and perforated grill. The My RECO device page in this GitHub Pages edition is a browser demo. Its fan switch and telemetry are simulated; they do not control a physical helmet.'
  if (q.includes('report') || q.includes('issue') || q.includes('smoke') || q.includes('dust')) return 'Report Issue lets you record an observation with a title, category, location, description and optional photo. In this frontend-only edition, reports are saved only in the current browser. They are not sent to a shared server or visible to other visitors.'
  if (q.includes('ai') || q.includes('llm') || q.includes('chatgpt')) return 'This GitHub Pages edition does not connect to an AI model or LLM. I am a small built-in demo assistant with prepared explanations about AQI, particles, route comparison, reporting and the RECO helmet. A real AI assistant needs a secure backend service and an API key kept off the public website.'
  return 'I can explain the RECO helmet concept, AQI, PM2.5 and PM10, Clean Route Finder, Report Issue, and the simulated My RECO device dashboard. This public GitHub Pages version has no connected LLM or private backend.'
}

export const api = {
  base: '',
  health: async () => ({ status: 'ok', mode: 'github-pages-frontend-only' }),
  airQuality: (lat, lon) => requestAirQuality(lat, lon),
  compareRoutes,
  latestDevice: async () => ({ device: readStorage(DEVICE_KEY, DEFAULT_DEVICE) }),
  deviceHistory: async () => ({ readings: readStorage(HISTORY_KEY, []) }),
  demoDevice: async payload => {
    const device = { ...readStorage(DEVICE_KEY, DEFAULT_DEVICE), ...payload, source: 'browser-demo', connection: 'demo-local', created_at: new Date().toISOString() }
    writeStorage(DEVICE_KEY, device)
    const history = readStorage(HISTORY_KEY, [])
    history.push({ ...device, id: `local-${Date.now()}` })
    writeStorage(HISTORY_KEY, history.slice(-50))
    return { device }
  },
  reports: async () => ({ reports: readReports() }),
  createReport: async formData => {
    const image = await compressImage(formData.get('image'))
    const reports = readReports()
    const report = {
      id: `LOCAL-${Date.now()}`,
      title: String(formData.get('title') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      category: String(formData.get('category') || 'Other'),
      location: String(formData.get('location') || '').trim(),
      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
      image_url: image,
      created_at: new Date().toISOString(),
      status: 'pending-review',
      storage: 'this-browser-only',
    }
    reports.unshift(report)
    writeStorage(REPORTS_KEY, reports.slice(0, 30))
    return { report }
  },
  chat: async message => ({ reply: localChatReply(message), mode: 'Browser demo assistant (no LLM)' }),
  analytics: async () => ({
    report_count: readReports().length,
    device_reading_count: readStorage(HISTORY_KEY, []).length,
  }),
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export function aqiLabel(value) {
  if (value == null || Number.isNaN(Number(value))) return { label: 'Unavailable', tone: 'neutral' }
  const n = Number(value)
  if (n <= 50) return { label: 'Good', tone: 'good' }
  if (n <= 100) return { label: 'Moderate', tone: 'moderate' }
  if (n <= 150) return { label: 'Sensitive groups', tone: 'moderate' }
  if (n <= 200) return { label: 'Unhealthy', tone: 'poor' }
  if (n <= 300) return { label: 'Very unhealthy', tone: 'poor' }
  return { label: 'Hazardous', tone: 'danger' }
}
