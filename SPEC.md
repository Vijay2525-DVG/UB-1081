# ClimateAlert Hub - Specification Document

## 1. Project Overview

**Project Name:** ClimateAlert Hub  
**Project Type:** Web Dashboard (Climate Tech & Disaster Management Analytics)  
**Core Functionality:** A pure software web dashboard for monitoring climate risks, disaster alerts, and environmental analytics with a focus on India/Davanagere region  
**Target Users:** Emergency management officials, climate researchers, NGOs, and general public interested in climate disaster awareness

---

## 2. UI/UX Specification

### Layout Structure

**Page Sections:**
- **Navigation Header:** Fixed top navbar with logo, navigation links, search bar, and theme toggle
- **Hero/Dashboard Overview:** Key metrics summary cards
- **Main Content Areas:**
  - Global Risk Map (Leaflet.js)
  - Climate Analytics Cards
  - Disaster Alert Feed
  - Trend Visualizer Charts
  - Resource Hub Table
- **Footer:** Links, disclaimer, emergency contacts

**Grid Layout:**
- CSS Grid with 12-column system
- Dashboard cards: 1-4 columns based on viewport
- Full-width sections for map and main features

**Responsive Breakpoints:**
- Mobile: < 640px (single column, stacked cards)
- Tablet: 640px - 1024px (2-column grid)
- Desktop: > 1024px (full multi-column layout)

### Visual Design

**Color Palette:**
- Background Primary: `#0a0f1a` (deep navy black)
- Background Secondary: `#111827` (dark slate)
- Background Card: `#1a2332` (elevated dark)
- Accent Primary: `#ff4d4d` (emergency red)
- Accent Secondary: `#ff8c00` (warning orange)
- Accent Tertiary: `#00d9ff` (cyan neon)
- Accent Success: `#00ff88` (safe green)
- Text Primary: `#f1f5f9` (off-white)
- Text Secondary: `#94a3b8` (muted gray)
- Border Color: `#2d3748` (subtle gray)

**Typography:**
- Font Family Headings: `'Orbitron', sans-serif` (futuristic/emergency feel)
- Font Family Body: `'Inter', sans-serif` (clean readability)
- Font Family Mono: `'JetBrains Mono', monospace` (data/numbers)
- Heading Sizes: H1: 2.5rem, H2: 2rem, H3: 1.5rem, H4: 1.25rem
- Body Size: 1rem (16px)
- Small Text: 0.875rem (14px)

**Spacing System:**
- Base unit: 4px
- Card padding: 24px
- Section gap: 32px
- Grid gap: 24px

**Visual Effects:**
- Card shadows: `0 4px 20px rgba(0, 217, 255, 0.1)`
- Glow effects on alerts: `0 0 20px rgba(255, 77, 77, 0.5)`
- Hover transitions: 0.3s ease
- Border radius: 12px for cards, 8px for buttons

### Components

**Navigation:**
- Logo with pulse animation
- Nav links with underline hover effect
- Search bar with glass morphism effect
- Mobile hamburger menu

**Metric Cards:**
- Icon + Title + Value + Trend indicator
- Hover: slight lift + glow
- Color-coded borders by severity

**Map Component:**
- Full-width Leaflet map
- Layer toggle controls
- Custom markers for disasters
- Color-coded risk overlays (red=high, orange=medium, green=low)

**Alert Items:**
- Severity badge (Critical/High/Medium/Low)
- Timestamp
- Location
- Expandable details
- Impact Report modal trigger

**Charts:**
- Line charts for trends
- Bar charts for comparisons
- Responsive sizing
- Tooltip on hover

**Data Table:**
- Sortable columns
- Filter inputs
- Pagination
- Row hover effects

**Modals:**
- Backdrop blur
- Slide-in animation
- Close button + ESC key

---

## 3. Functionality Specification

### Core Features

#### 3.1 Global Risk Map
- Interactive Leaflet.js map centered on India (focus on Davanagere, Karnataka)
- Risk layer toggles: Flood, Fire, Earthquake
- Mock colored polygon overlays showing risk zones
- Clickable markers for recent disasters
- Layer legend with color codes

#### 3.2 Climate Analytics Dashboard
- **CO2 Levels:** Current ppm value with trend
- **Temperature Anomaly:** Current vs historical average
- **Sea Level Rise:** mm/year trend
- **Data Source:** OpenWeatherMap API or realistic mock data
- Auto-refresh every 5 minutes with TanStack Query

#### 3.3 Disaster Alert Feed
- Real-time scrolling list of alerts
- Alert types: Cyclone, Flood, Drought, Earthquake, Fire, Storm
- Severity levels: Critical (red), High (orange), Medium (yellow), Low (green)
- Timeline view with relative timestamps
- "Impact Report" modal with detailed information
- Filter by type and region

#### 3.4 Trend Visualizer
- 30-day trend charts for:
  - CO2 emissions
  - Temperature variations
  - Rainfall patterns
- Predictive forecast line (simple linear projection)
- Date range selector
- Export data option (mock)

#### 3.5 Resource Hub
- Searchable directory of:
  - Software tools (apps, platforms)
  - NGOs and organizations
  - Evacuation plans
  - Government contacts
- Filter by: Category, Region (Davanagere/India focus), Availability
- Sortable table with columns: Name, Type, Region, Contact, Status

### User Interactions
- Search across all sections (unified search)
- Filter alerts by disaster type and severity
- Toggle map layers
- Expand/collapse alert details
- Open Impact Report modals
- Navigate between dashboard sections
- Responsive touch interactions on mobile

### Data Handling
- TanStack Query for API caching and state management
- Mock API routes for demonstration
- Local storage for user preferences
- Loading states with skeleton screens
- Error boundaries with fallback UI

### Edge Cases
- API failure: Show cached data or mock fallback
- No search results: Display empty state
- Map loading failure: Show static fallback image
- Slow connection: Optimistic UI updates

---

## 4. Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Data Fetching:** TanStack Query (React Query)
- **Maps:** Leaflet.js + React-Leaflet
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React
- **Deployment:** Netlify-ready with static export

---

## 5. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark emergency theme applied consistently
- [ ] Neon accent colors visible on alerts and interactive elements
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Cards have hover effects with subtle glow
- [ ] Typography hierarchy is clear and readable

### Functional Checkpoints
- [ ] Map loads with risk overlays
- [ ] Climate metrics display with data
- [ ] Disaster alerts scroll with severity badges
- [ ] Charts render with trend data
- [ ] Resource table is searchable and filterable
- [ ] Search bar filters content across sections
- [ ] Modals open/close properly
- [ ] Loading states display during data fetch
- [ ] All navigation links work

### Performance Checkpoints
- [ ] Page loads without critical console errors
- [ ] No layout shifts during loading
- [ ] Smooth animations and transitions

---

## 6. Mock Data Structure

### Disaster Alerts Sample
```
json
{
  "id": "alert-001",
  "type": "cyclone",
  "severity": "critical",
  "title": "Cyclone Amphan Warning",
  "location": "Odisha Coast",
  "coordinates": [20.9517, 85.0585],
  "timestamp": "2024-01-15T06:30:00Z",
  "description": "Severe cyclonic storm approaching Odisha coast...",
  "affectedAreas": ["Bhubaneswar", "Cuttack", "Puri"],
  "casualties": null,
  "source": "IMD"
}
```

### Climate Metrics Sample
```
json
{
  "co2": {
    "current": 421.5,
    "unit": "ppm",
    "trend": "up",
    "change": "+2.1"
  },
  "temperature": {
    "current": 1.2,
    "unit": "°C above baseline",
    "trend": "up",
    "change": "+0.3"
  },
  "seaLevel": {
    "current": 3.4,
    "unit": "mm/year",
    "trend": "up"
  }
}
