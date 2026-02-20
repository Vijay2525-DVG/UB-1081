require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5001;
const CACHE_TTL = parseInt(process.env.CACHE_TTL, 10) || 300;
const cache = new NodeCache({ stdTTL: CACHE_TTL });

app.use(cors());
app.use(express.json());

// -------------------- CONFIG --------------------
const DAVANAGERE_LAT = 14.4663;
const DAVANAGERE_LON = 75.9242;
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

// -------------------- MOCK DATA (fallback) --------------------
const mockAlerts = [
  { id: 1, title: "Severe flood warning - Davanagere", severity: "critical", type: "flood", region: "davanagere", time: "2 min ago", description: "Tungabhadra river rising. Immediate evacuation.", impact: "Over 3,500 people affected, 2 relief camps opened." },
  { id: 2, title: "Cyclone BOB 07 - Odisha coast", severity: "high", type: "cyclone", region: "india", time: "15 min ago", description: "Cyclone alert for Puri. Wind speed 110 km/h.", impact: "Fishermen advised not to venture." },
  { id: 3, title: "Forest fire - Western Ghats", severity: "high", type: "fire", region: "india", time: "1 hour ago", description: "Active fires in Chikkamagaluru.", impact: "Two fire tenders, 40 personnel working." },
  { id: 4, title: "Drought distress - Davanagere rural", severity: "moderate", type: "drought", region: "davanagere", time: "1 day ago", description: "Below average rainfall.", impact: "Drinking water scarcity in 30 villages." },
];

const mockResources = [
  { name: "NDRF - National Disaster Response Force", type: "gov agency", region: "india", contact: "ndrf.gov.in / 011-24363260" },
  { name: "Davanagere District Emergency Control", type: "evacuation plan", region: "davanagere", contact: "davanagere.nic.in/disaster" },
  { name: "Goonj (NGO) - relief & rehabilitation", type: "NGO", region: "india", contact: "goonj.org / 24x7 helpline" },
  { name: "CGWB - groundwater monitoring", type: "tool", region: "india", contact: "cgwb.gov.in/ drought bulletins" },
  { name: "Davanagere flood safe zones map", type: "evacuation plan", region: "davanagere", contact: "pdf available (mock)" },
  { name: "SEEDS India - climate resilience", type: "NGO", region: "india", contact: "seedsindia.org" },
  { name: "Bhuvan - ISRO fire alerts", type: "tool", region: "india", contact: "bhuvan.nrsc.gov.in" },
];

// -------------------- HELPER: fetch with cache --------------------
async function fetchWithCache(key, fetcher, ttl = 300) {
  const cached = cache.get(key);
  if (cached) return cached;
  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

// -------------------- ENDPOINTS --------------------

// load expanded India place keywords (prefer the larger gazetteer if present)
let INDIA_PLACE_KEYWORDS = [];
try {
  const large = require('./india_places_large.json');
  if (Array.isArray(large) && large.length > 0) {
    INDIA_PLACE_KEYWORDS = large.map(s => String(s).toLowerCase());
  } else {
    // fallback to smaller list
    INDIA_PLACE_KEYWORDS = require('./india_places.json').map(s => String(s).toLowerCase());
  }
} catch (e) {
  try {
    INDIA_PLACE_KEYWORDS = require('./india_places.json').map(s => String(s).toLowerCase());
  } catch (err) {
    console.warn('india_places_large.json / india_places.json not found or failed to load');
  }
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 1. Metrics: CO2, temp anomaly, sea rise
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await fetchWithCache('metrics', async () => {
      // CO2 proxy (air pollution)
      let co2Value = 421.3, co2Trend = '+2.1 vs last month (mock)';
      let tempAnomaly = 1.48, tempTrend = '⬆ +0.3°C above 30y avg (mock)';
      let currentTemp = 28.5, currentTempLocation = 'Davanagere, India';
      let seaRise = 3.9, seaTrend = '⏫ IPCC projection (mock)';

      if (OPENWEATHER_KEY && OPENWEATHER_KEY !== 'your_actual_api_key_here') {
        try {
          // Air pollution for CO proxy
          const pollResp = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${DAVANAGERE_LAT}&lon=${DAVANAGERE_LON}&appid=${OPENWEATHER_KEY}`);
          const co = pollResp.data.list[0].components.co; // µg/m3
          co2Value = (400 + co / 100).toFixed(1);
          co2Trend = `CO reading ${co} µg/m³`;

          // Current weather for temperature anomaly and location
          const weatherResp = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${DAVANAGERE_LAT}&lon=${DAVANAGERE_LON}&units=metric&appid=${OPENWEATHER_KEY}`);
          const temp = weatherResp.data.main.temp;
          const baseline = 26.0;
          tempAnomaly = (temp - baseline).toFixed(2);
          tempTrend = `current: ${temp}°C · baseline ${baseline}°C`;
          currentTemp = temp.toFixed(1);
          currentTempLocation = `${weatherResp.data.name}, ${weatherResp.data.sys.country}`;
        } catch (e) {
          console.warn('OpenWeather fetch failed, using mock');
        }
      }

      return {
        co2: { value: co2Value, trend: co2Trend },
        tempAnomaly: { value: tempAnomaly, trend: tempTrend },
        currentTemp: { value: currentTemp, location: currentTempLocation },
        seaRise: { value: seaRise, trend: seaTrend }
      };
    }, 300);

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// 2. Alerts: USGS earthquakes + mock alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await fetchWithCache('alerts', async () => {
      // Fetch real earthquakes from USGS
      let eqAlerts = [];
      try {
        const eqResp = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        eqAlerts = eqResp.data.features.slice(0, 10).map((eq, idx) => {
          const mag = eq.properties.mag;
          const place = eq.properties.place || '';
          let severity = mag >= 5 ? 'critical' : (mag >= 4 ? 'high' : 'moderate');
          let region = 'global';
          if (place.includes('India') || place.includes('Andaman') || place.includes('Nicobar') || place.includes('Ladakh')) region = 'india';
          const coords = eq.geometry && eq.geometry.coordinates ? eq.geometry.coordinates : [];
          const lat = coords[1] || null;
          const lon = coords[0] || null;
          return {
            id: 2000 + idx,
            title: `Earthquake M${mag} - ${String(place).substring(0, 60)}`,
            severity,
            type: 'earthquake',
            region,
            time: new Date(eq.properties.time).toLocaleString(),
            description: `${place}. Depth ${coords[2] || 'N/A'} km.`,
            impact: `Magnitude ${mag}. USGS alert.`,
            coordinates: lat && lon ? [lat, lon] : undefined,
          };
        });
      } catch (e) {
        console.warn('USGS fetch failed');
      }

      // Fetch EONET events (NASA) for other disasters
      let eonetAlerts = [];
      try {
        const eoResp = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events?status=open');
        const events = eoResp.data && eoResp.data.events ? eoResp.data.events : [];
        eonetAlerts = events.slice(0, 50).map((ev, idx) => {
          const geom = ev.geometry && ev.geometry[0] ? ev.geometry[0] : null;
          let coords = null;
          if (geom && Array.isArray(geom.coordinates)) {
            // EONET coords sometimes are [lon, lat] or [lat, lon]. Normalize to [lat, lon]
            const c = geom.coordinates;
            if (c.length >= 2) {
              // if first value is outside -90..90 it's lon first
              const first = Number(c[0]);
              const second = Number(c[1]);
              if (Math.abs(first) > 90 && Math.abs(second) <= 90) {
                coords = [second, first];
              } else {
                coords = [first, second];
              }
            }
          }

          // derive type from categories if possible
          const cat = (ev.categories && ev.categories[0] && ev.categories[0].title) || '';
          let type = 'storm';
          if (/fire/i.test(cat) || /wildfire/i.test(ev.title)) type = 'fire';
          else if (/flood/i.test(cat)) type = 'flood';
          else if (/storm/i.test(cat) || /severe/i.test(cat)) type = 'storm';

          return {
            id: 3000 + idx,
            title: ev.title,
            severity: 'high',
            type,
            region: cat || 'global',
            time: geom && geom.date ? new Date(geom.date).toLocaleString() : ev.geometry && ev.geometry[0] && ev.geometry[0].date ? new Date(ev.geometry[0].date).toLocaleString() : ev.date || new Date().toLocaleString(),
            description: ev.description || ev.title,
            impact: `Event reported by EONET (${ev.source || 'NASA EONET'})`,
            coordinates: coords || undefined,
          };
        });
      } catch (e) {
        console.warn('EONET fetch failed');
      }

      // Prefer real external data: combine USGS + EONET. If both empty, fall back to mockAlerts.
      const combined = [...eqAlerts, ...eonetAlerts];
      if (combined.length === 0) return mockAlerts;
      return combined;
    }, 300);

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// 3. Resources (static mock data, could be from DB)
app.get('/api/resources', (req, res) => {
  res.json(mockResources);
});

// 4. 30-day trend data (mock, could be extended)
app.get('/api/trends', (req, res) => {
  const days = 30;
  const co2 = Array.from({ length: days }, () => 415 + Math.random() * 10);
  const temp = Array.from({ length: days }, () => 1.3 + Math.random() * 0.4);
  const forecast = [423, 425, 426, 428, 429, 430, 432];
  res.json({ labels: Array.from({ length: days }, (_, i) => `d${i + 1}`), co2, temp, forecast });
});

// 5. History: curated India disaster data (past 10 years) - no API key required
const INDIA_DISASTER_HISTORY = [
  { id: 'h1', title: 'Kerala Floods', category: 'Flood', date: new Date('2018-08-15'), coordinates: [10.8505, 76.2711], description: 'Severe monsoon floods in Kerala with 500+mm rainfall. Over 400 deaths, thousands displaced.', source: 'Historical' },
  { id: 'h2', title: 'Uttarakhand Floods', category: 'Flood', date: new Date('2021-07-20'), coordinates: [30.5, 79.5], description: 'Flash floods in Uttarakhand triggered by heavy downpour. Multiple villages affected.', source: 'Historical' },
  { id: 'h3', title: 'Cyclone Amphan - West Bengal', category: 'Storm', date: new Date('2020-05-20'), coordinates: [22.5669, 88.3627], description: 'Super cyclone Amphan caused extensive damage in West Bengal. 26 deaths, thousands evacuated.', source: 'Historical' },
  { id: 'h4', title: 'Assam Floods', category: 'Flood', date: new Date('2021-05-17'), coordinates: [26.2, 92.8], description: 'Annual monsoon floods in Assam affecting Brahmaputra valley. Over 2 million people affected.', source: 'Historical' },
  { id: 'h5', title: 'Maharashtra Monsoon', category: 'Flood', date: new Date('2022-07-10'), coordinates: [19.7515, 75.7139], description: 'Heavy monsoon rains triggered landslides and floods in Maharashtra.', source: 'Historical' },
  { id: 'h6', title: 'Cyclone Yaas - Odisha', category: 'Storm', date: new Date('2021-05-26'), coordinates: [19.8135, 85.9283], description: 'Severe cyclone Yaas impacted Odisha coast. Storm surge and heavy rainfall.', source: 'Historical' },
  { id: 'h7', title: 'Chennai Floods', category: 'Flood', date: new Date('2020-11-12'), coordinates: [13.0827, 80.2707], description: 'Cyclone-triggered urban flooding in Chennai. Heavy rainfall inundated streets.', source: 'Historical' },
  { id: 'h8', title: 'Dharamshala Cloudbursts', category: 'Flash Flood', date: new Date('2017-08-05'), coordinates: [32.2190, 76.3236], description: 'Unprecedented cloudburst in Himachal Pradesh. Landslides and flash floods.', source: 'Historical' },
  { id: 'h9', title: 'Earthquake - Uttarkashi', category: 'Earthquake', date: new Date('2023-11-30'), coordinates: [30.7345, 78.9988], description: 'Moderate earthquake (M6.2) in Uttarkashi region, minimal casualties.', source: 'Historical' },
  { id: 'h10', title: 'Cyclone Biporjoy - Gujarat', category: 'Storm', date: new Date('2023-06-15'), coordinates: [21.1458, 72.3711], description: 'Severe cyclone Biporjoy affected Gujarat coast with high winds and heavy rainfall.', source: 'Historical' },
  { id: 'h11', title: 'Himachal Wildfires', category: 'Fire', date: new Date('2022-05-20'), coordinates: [31.7724, 77.1097], description: 'Major forest fires across Himachal Pradesh affecting large forest areas.', source: 'Historical' },
  { id: 'h12', title: 'Rajasthan Drought', category: 'Drought', date: new Date('2019-06-01'), coordinates: [27.0238, 74.2179], description: 'Severe drought conditions in Rajasthan affecting agricultural output and water resources.', source: 'Historical' },
  { id: 'h13', title: 'Mizoram Landslides', category: 'Landslide', date: new Date('2020-09-01'), coordinates: [23.8103, 93.2868], description: 'Heavy rains triggered multiple landslides in Mizoram. Connectivity affected.', source: 'Historical' },
  { id: 'h14', title: 'Telangana Floods', category: 'Flood', date: new Date('2020-11-02'), coordinates: [17.3850, 78.4867], description: 'Heavy rainfall caused widespread flooding in Hyderabad and surrounding areas.', source: 'Historical' },
  { id: 'h15', title: 'Earthquake - Ladakh', category: 'Earthquake', date: new Date('2021-03-29'), coordinates: [33.9680, 77.5860], description: 'Moderate earthquake (M5.2) in Ladakh region, minimal impact.', source: 'Historical' },
];

app.get('/api/history', async (req, res) => {
  try {
    const history = await fetchWithCache('history', () => {
      // Return sorted by date (newest first)
      const sorted = [...INDIA_DISASTER_HISTORY].sort((a, b) => new Date(b.date) - new Date(a.date));
      return sorted.map(ev => ({
        id: ev.id,
        title: ev.title,
        category: ev.category,
        date: new Date(ev.date).toISOString(),
        coordinates: ev.coordinates,
        description: ev.description,
        source: ev.source,
      }));
    }, 3600);

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`ClimateAlert Hub backend running on port ${PORT}`);
  if (!OPENWEATHER_KEY || OPENWEATHER_KEY === 'your_actual_api_key_here') {
    console.warn('OPENWEATHER_API_KEY not set or is using placeholder. Metrics will use mock/approx data.');
  } else {
    console.log('OPENWEATHER_API_KEY detected — metrics will fetch live data from OpenWeather.');
  }
});
