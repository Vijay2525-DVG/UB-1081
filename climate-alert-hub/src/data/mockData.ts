export interface DisasterAlert {
  id: string;
  type: "cyclone" | "flood" | "drought" | "earthquake" | "fire" | "storm";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  location: string;
  coordinates: [number, number];
  timestamp: string;
  description: string;
  affectedAreas: string[];
  casualties: number | null;
  source: string;
}

export interface ClimateMetrics {
  co2: {
    current: number;
    unit: string;
    trend: "up" | "down" | "stable";
    change: string;
  };
  temperature: {
    current: number;
    unit: string;
    trend: "up" | "down" | "stable";
    change: string;
  };
  seaLevel: {
    current: number;
    unit: string;
    trend: "up" | "down" | "stable";
  };
}

export interface Resource {
  id: string;
  name: string;
  type: "tool" | "ngo" | "evacuation" | "government";
  category: string;
  region: string;
  contact: string;
  status: "active" | "inactive";
  description: string;
}

export interface RiskZone {
  id: string;
  type: "flood" | "fire" | "earthquake" | "cyclone";
  name: string;
  coordinates: [number, number][];
  severity: "critical" | "high" | "medium" | "low";
}

export const disasterAlerts: DisasterAlert[] = [
  {
    id: "alert-001",
    type: "cyclone",
    severity: "critical",
    title: "Cyclone Amphan Warning",
    location: "Odisha Coast",
    coordinates: [20.9517, 85.0585],
    timestamp: "2024-01-15T06:30:00Z",
    description: "Severe cyclonic storm approaching Odisha coast. Extremely heavy rainfall expected. Fishermen advised to stay ashore.",
    affectedAreas: ["Bhubaneswar", "Cuttack", "Puri", "Kendrapara"],
    casualties: null,
    source: "IMD",
  },
  {
    id: "alert-002",
    type: "flood",
    severity: "high",
    title: "Flood Alert - Krishna River",
    location: "Andhra Pradesh",
    coordinates: [16.5062, 80.6480],
    timestamp: "2024-01-14T18:45:00Z",
    description: "Krishna River crossing danger mark. Low-lying areas in Vijayawada and nearby villages on alert.",
    affectedAreas: ["Vijayawada", "Guntur", "Krishna District"],
    casualties: 2,
    source: "CWC",
  },
  {
    id: "alert-003",
    type: "earthquake",
    severity: "medium",
    title: "Tremors Felt in Uttarakhand",
    location: "Uttarakhand",
    coordinates: [30.0668, 79.0193],
    timestamp: "2024-01-14T12:20:00Z",
    description: "Magnitude 4.8 earthquake reported in Rudraprayag district. No major damage reported.",
    affectedAreas: ["Rudraprayag", "Chamoli", "Joshimath"],
    casualties: 0,
    source: "NCS",
  },
  {
    id: "alert-004",
    type: "fire",
    severity: "high",
    title: "Forest Fire Alert",
    location: "Karnataka - Davanagere",
    coordinates: [14.4664, 75.9237],
    timestamp: "2024-01-14T09:15:00Z",
    description: "Active forest fire detected in forest areas near Davanagere. Fire fighting teams deployed.",
    affectedAreas: ["Davanagere", "Chitradurga", "Shimoga"],
    casualties: 0,
    source: "KFD",
  },
  {
    id: "alert-005",
    type: "drought",
    severity: "medium",
    title: "Drought Conditions Persist",
    location: "Maharashtra - Marathwada",
    coordinates: [19.8762, 75.3433],
    timestamp: "2024-01-13T10:00:00Z",
    description: "Monsoon deficit continues. Water reservoirs at critically low levels. Harvest predictions lowered.",
    affectedAreas: ["Aurangabad", "Latur", "Osmanabad", "Beed"],
    casualties: null,
    source: "IMD",
  },
  {
    id: "alert-006",
    type: "storm",
    severity: "low",
    title: "Thunderstorm Warning",
    location: "Tamil Nadu",
    coordinates: [13.0827, 80.2707],
    timestamp: "2024-01-15T04:00:00Z",
    description: "Thunderstorm with light to moderate rainfall expected in Chennai and surrounding districts.",
    affectedAreas: ["Chennai", "Kanchipuram", "Tiruvallur"],
    casualties: 0,
    source: "IMD",
  },
  {
    id: "alert-007",
    type: "flood",
    severity: "critical",
    title: "Brahmaputra Flood Warning",
    location: "Assam",
    coordinates: [26.1445, 91.7662],
    timestamp: "2024-01-15T08:00:00Z",
    description: "Brahmaputra flowing above danger mark. Flood shields activated in Guwahati and Dhubri.",
    affectedAreas: ["Guwahati", "Dhubri", "Jorhat", "Dibrugarh"],
    casualties: 5,
    source: "CWC",
  },
  {
    id: "alert-008",
    type: "cyclone",
    severity: "high",
    title: "Deep Depression over Bay of Bengal",
    location: "West Bengal Coast",
    coordinates: [22.5726, 88.3639],
    timestamp: "2024-01-15T10:30:00Z",
    description: "Deep depression intensifying. Expected to cross West Bengal coast within 48 hours.",
    affectedAreas: ["Kolkata", "Hooghly", "Midnapur", "Durgapur"],
    casualties: null,
    source: "IMD",
  },
];

export const climateMetrics: ClimateMetrics = {
  co2: {
    current: 421.5,
    unit: "ppm",
    trend: "up",
    change: "+2.1",
  },
  temperature: {
    current: 1.2,
    unit: "°C above baseline",
    trend: "up",
    change: "+0.3",
  },
  seaLevel: {
    current: 3.4,
    unit: "mm/year",
    trend: "up",
  },
};

export const resources: Resource[] = [
  {
    id: "res-001",
    name: "FloodWatch App",
    type: "tool",
    category: "Monitoring",
    region: "All India",
    contact: "floodwatch.gov.in",
    status: "active",
    description: "Real-time flood monitoring and alert application by CWC",
  },
  {
    id: "res-002",
    name: "India Meteorological Department",
    type: "government",
    category: "Weather",
    region: "All India",
    contact: "mausam.imd.gov.in",
    status: "active",
    description: "Official weather forecasts and disaster warnings",
  },
  {
    id: "res-003",
    name: "NDMA",
    type: "government",
    category: "Disaster Management",
    region: "All India",
    contact: "ndma.gov.in",
    status: "active",
    description: "National Disaster Management Authority",
  },
  {
    id: "res-004",
    name: "SEOC Karnataka",
    type: "government",
    category: "Emergency Operations",
    region: "Karnataka",
    contact: "seoc.karnataka.gov.in",
    status: "active",
    description: "State Emergency Operations Centre Karnataka",
  },
  {
    id: "res-005",
    name: "Davanagere District Emergency",
    type: "evacuation",
    category: "Evacuation Plan",
    region: "Davanagere",
    contact: "davanagere.nic.in",
    status: "active",
    description: "District evacuation routes and shelter locations",
  },
  {
    id: "res-006",
    name: "Indian Red Cross Society",
    type: "ngo",
    category: "Relief",
    region: "All India",
    contact: "indianredcross.org",
    status: "active",
    description: "Humanitarian relief and emergency response",
  },
  {
    id: "res-007",
    name: "ActionAid India",
    type: "ngo",
    category: "Development",
    region: "All India",
    contact: "actionaidindia.org",
    status: "active",
    description: "Climate resilience and disaster relief programs",
  },
  {
    id: "res-008",
    name: "QuakeWatch India",
    type: "tool",
    category: "Earthquake Monitoring",
    region: "All India",
    contact: "seismo.gov.in",
    status: "active",
    description: "Earthquake monitoring and early warning system",
  },
  {
    id: "res-009",
    name: "FireWatch India",
    type: "tool",
    category: "Fire Monitoring",
    region: "All India",
    contact: "fsi.nic.in",
    status: "active",
    description: "Forest fire detection and monitoring satellite system",
  },
  {
    id: "res-010",
    name: "Karnataka State Disaster Management",
    type: "government",
    category: "Disaster Management",
    region: "Karnataka",
    contact: "sdma.karnataka.gov.in",
    status: "active",
    description: "Karnataka State Disaster Management Authority",
  },
  {
    id: "res-011",
    name: "Davanagere Municipal Corporation",
    type: "government",
    category: "Local Authority",
    region: "Davanagere",
    contact: "davanageremc.gov.in",
    status: "active",
    description: "Local municipal emergency services",
  },
  {
    id: "res-012",
    name: "Care India",
    type: "ngo",
    category: "Relief",
    region: "All India",
    contact: "careindia.org",
    status: "active",
    description: "Disaster response and community development",
  },
];

export const riskZones: RiskZone[] = [
  {
    id: "zone-001",
    type: "flood",
    name: "Krishna River Flood Zone",
    coordinates: [
      [16.3, 80.1],
      [16.5, 80.3],
      [16.7, 80.2],
      [16.6, 79.9],
      [16.3, 80.1],
    ],
    severity: "high",
  },
  {
    id: "zone-002",
    type: "fire",
    name: "Davanagere Forest Zone",
    coordinates: [
      [14.3, 75.7],
      [14.5, 75.9],
      [14.6, 75.8],
      [14.4, 75.6],
      [14.3, 75.7],
    ],
    severity: "high",
  },
  {
    id: "zone-003",
    type: "earthquake",
    name: "Himalayan Seismic Zone",
    coordinates: [
      [28.0, 78.0],
      [30.0, 78.5],
      [31.0, 79.0],
      [29.5, 80.0],
      [28.0, 79.5],
      [28.0, 78.0],
    ],
    severity: "critical",
  },
  {
    id: "zone-004",
    type: "flood",
    name: "Brahmaputra Flood Zone",
    coordinates: [
      [26.0, 90.5],
      [26.5, 91.0],
      [27.0, 91.5],
      [26.8, 92.0],
      [26.2, 91.8],
      [26.0, 90.5],
    ],
    severity: "critical",
  },
  {
    id: "zone-005",
    type: "cyclone",
    name: "Odisha Coast Cyclone Zone",
    coordinates: [
      [19.5, 84.5],
      [20.5, 85.5],
      [21.0, 86.5],
      [20.8, 87.0],
      [19.8, 86.5],
      [19.5, 84.5],
    ],
    severity: "critical",
  },
];

export const trendData = {
  co2: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    value: 418 + Math.random() * 5 + i * 0.1,
    forecast: null,
  })).map((item, i) => ({
    ...item,
    forecast: i > 20 ? item.value + Math.random() * 2 : null,
  })),
  temperature: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    value: 0.8 + Math.random() * 0.8 + i * 0.02,
    forecast: null,
  })).map((item, i) => ({
    ...item,
    forecast: i > 20 ? item.value + Math.random() * 0.3 : null,
  })),
  rainfall: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    value: Math.random() * 100,
    forecast: null,
  })).map((item, i) => ({
    ...item,
    forecast: i > 20 ? Math.random() * 100 : null,
  })),
};
