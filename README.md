# ClimateAlert Hub
# ClimateAlert Hub
Local setup & run instructions for the ClimateAlert Hub (frontend + backend).

This repository contains two main apps:
- `climate-alert-hub` — Next.js frontend (React, Tailwind, React Query)
- `climate-alert-hub-backend` — Express backend that proxies external data sources and exposes an SSE alerts stream

Prerequisites
- Node.js 18+ (recommended)
- npm or yarn
- Optional: an OpenWeather API key to enable live metrics

Ports used (defaults)
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3000`

Environment variables
- Create a `.env` file in `climate-alert-hub-backend` with:

```env
PORT=5001
OPENWEATHER_API_KEY=your_openweather_key_here
CACHE_TTL=300             # seconds for cached API responses
ALERTS_POLL_MS=30000      # interval (ms) backend polls external sources and broadcasts via SSE
```

Quick install & run (recommended)
1. Start backend

```powershell
cd "climate-alert-hub-backend"
npm install
# set env vars (or create .env) then:
node server.js
```

2. Start frontend

```powershell
cd "climate-alert-hub"
npm install
npm run dev
```

What I implemented for live alerts
- Backend SSE endpoint: `/api/alerts/stream` — server-sent events that push refreshed alerts to connected clients automatically.
- Frontend subscribes using `EventSource` and updates the React Query `alerts` cache so the map and alerts feed update in real time.

How to validate SSE manually
- Using curl (or a browser):

```powershell
curl -N http://localhost:5001/api/alerts/stream
```

You should see newline-delimited `data:` events. The frontend will automatically reflect updates when the SSE sends an array of alerts.

Notes & troubleshooting
- If you want faster refreshes for testing, set `ALERTS_POLL_MS` to a lower value (e.g., `5000`).
- If metrics don't appear live, set `OPENWEATHER_API_KEY` in backend `.env`.
- SSE is unidirectional (server -> client). If you need bidirectional comms, consider switching to WebSockets (e.g., `socket.io`).

Optional improvements
- Add an admin POST endpoint to force immediate refresh & broadcast for testing.
- Add authentication on SSE endpoint for production.
- Convert SSE to WebSocket if clients must send data back.

Files changed for SSE
- `climate-alert-hub-backend/server.js` — added SSE stream + periodic refresh/broadcast
- `climate-alert-hub/src/lib/api.ts` — exported `API_BASE_URL`
- `climate-alert-hub/src/app/page.tsx` — added `EventSource` subscriber to update React Query cache

If you want, I can:
- Add a small `npm` script to run backend with `nodemon` for dev
- Add the optional force-refresh admin route
- Convert SSE to `socket.io`

Would you like me to add a `dev` script for the backend and the force-refresh endpoint now?
