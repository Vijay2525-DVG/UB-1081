const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Metrics {
  co2: { value: string; trend: string };
  tempAnomaly: { value: string; trend: string };
  currentTemp: { value: string | number; location: string };
  seaRise: { value: number; trend: string };
}

export interface Alert {
  id: number;
  title: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  type: 'flood' | 'cyclone' | 'fire' | 'drought' | 'earthquake' | 'storm';
  region: string;
  time: string;
  description: string;
  impact: string;
}

export interface Resource {
  name: string;
  type: string;
  region: string;
  contact: string;
}

export interface Trends {
  labels: string[];
  co2: number[];
  temp: number[];
  forecast: number[];
}

export interface HistoryEvent {
  id: string | number;
  title: string;
  category?: string;
  date?: string | null;
  coordinates?: [number, number] | null;
  description?: string;
  source?: string;
}

// Fetch metrics from backend
export async function fetchMetrics(): Promise<Metrics> {
  const res = await fetch(`${API_BASE_URL}/metrics`, {
    next: { revalidate: 300 } // Cache for 5 minutes
  });
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

// Fetch alerts from backend
export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch(`${API_BASE_URL}/alerts`, {
    next: { revalidate: 60 } // Cache for 1 minute
  });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

// Fetch resources from backend
export async function fetchResources(): Promise<Resource[]> {
  const res = await fetch(`${API_BASE_URL}/resources`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  if (!res.ok) throw new Error('Failed to fetch resources');
  return res.json();
}

// Fetch trends from backend
export async function fetchTrends(): Promise<Trends> {
  const res = await fetch(`${API_BASE_URL}/trends`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  if (!res.ok) throw new Error('Failed to fetch trends');
  return res.json();
}

// Fetch 10-year India history of disasters from backend
export async function fetchHistory(): Promise<HistoryEvent[]> {
  const res = await fetch(`${API_BASE_URL}/history`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}
