"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  AlertTriangle,
  Activity,
  TrendingUp,
  MapPin,
  ExternalLink,
  Filter,
  X,
  Menu,
  Cloud,
  Thermometer,
  Waves,
  Loader2,
} from "lucide-react";
import {
  fetchMetrics,
  fetchAlerts,
  fetchResources,
  fetchTrends,
  Metrics,
  Alert,
  Resource,
  Trends,
} from "@/lib/api";
import { cn, getSeverityColor, getDisasterIcon } from "@/lib/utils";
import { fetchHistory, HistoryEvent } from "@/lib/api";

// Dynamic imports for components that need client-side rendering
const RiskMap = dynamic(() => import("@/components/RiskMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-background-card rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-accent-tertiary animate-spin" />
    </div>
  ),
});

const TrendChart = dynamic(() => import("@/components/TrendChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-background-card rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-accent-tertiary animate-spin" />
    </div>
  ),
});

// Helper function to format CO2 value safely
function formatCo2Value(val: string | number): string {
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? String(val) : parsed.toFixed(1);
  }
  return String(val);
}

// Helper function to parse and render clickable contact information
function renderContactLinks(contact: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  
  // Split by common separators: " / ", " · ", ","
  const items = contact.split(/\s*[/·,]\s*/);
  
  items.forEach((item, idx) => {
    const trimmed = item.trim();
    
    // Check if it's a phone number (digits with dashes/spaces)
    const phoneRegex = /^[\d\s\-\+()]+$/;
    if (phoneRegex.test(trimmed) && trimmed.length >= 8) {
      const cleanPhone = trimmed.replace(/\D/g, '');
      parts.push(
        <a
          key={idx}
          href={`tel:+91${cleanPhone}`}
          className="text-accent-tertiary hover:text-accent-secondary underline transition-colors"
          title="Call"
        >
          {trimmed}
        </a>
      );
    }
    // Check if it's an email
    else if (trimmed.includes('@')) {
      parts.push(
        <a
          key={idx}
          href={`mailto:${trimmed}`}
          className="text-accent-tertiary hover:text-accent-secondary underline transition-colors"
          title="Email"
        >
          {trimmed}
        </a>
      );
    }
    // Check if it's a URL
    else if (trimmed.includes('.') && (trimmed.includes('.org') || trimmed.includes('.com') || trimmed.includes('.gov') || trimmed.includes('.in') || trimmed.includes('www') || trimmed.includes('http'))) {
      let url = trimmed;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      parts.push(
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-tertiary hover:text-accent-secondary underline transition-colors"
          title="Open link"
        >
          {trimmed}
        </a>
      );
    }
    // Otherwise, display as text
    else {
      parts.push(<span key={idx}>{trimmed}</span>);
    }
    
    // Add separator if not the last item
    if (idx < items.length - 1) {
      parts.push(
        <span key={`sep-${idx}`} className="text-text-secondary mx-1">
          /
        </span>
      );
    }
  });
  
  return parts;
}

export default function Home() {
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 100) {
        // scrolling down
        setHideHeader(true);
      } else {
        // scrolling up
        setHideHeader(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    "flood",
    "fire",
    "earthquake",
    "cyclone",
  ]);
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch data from backend API
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    staleTime: 300000,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    staleTime: 60000,
  });

  const { data: resources = [], isLoading: resourcesLoading } =
    useQuery<Resource[]>({
      queryKey: ["resources"],
      queryFn: fetchResources,
      staleTime: 3600000,
    });

  const { data: trends } = useQuery<Trends>({
    queryKey: ["trends"],
    queryFn: fetchTrends,
    staleTime: 3600000,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<HistoryEvent[]>({
    queryKey: ["history"],
    queryFn: fetchHistory,
    staleTime: 3600000,
  });

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesSeverity =
      filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesLocation =
      filterLocation === "all" ||
      (filterLocation === "india" &&
        (alert.region.toLowerCase().includes("india") ||
          alert.region.toLowerCase() === "india" ||
          alert.region.toLowerCase() === "davanagere")) ||
      (filterLocation === "global" &&
        alert.region.toLowerCase() !== "india" &&
        !alert.region.toLowerCase().includes("india") &&
        alert.region.toLowerCase() !== "davanagere");
    return matchesSearch && matchesType && matchesSeverity && matchesLocation;
  });

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      resourceFilter === "all" ||
      resource.type.toLowerCase() === resourceFilter.toLowerCase();
    const matchesRegion =
      regionFilter === "all" ||
      resource.region.toLowerCase() === regionFilter.toLowerCase();
    return matchesSearch && matchesType && matchesRegion;
  });

  // Combined suggestions for search (alerts + resources)
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const alertMatches = alerts
      .filter((a) => (a.title + " " + a.region).toLowerCase().includes(q))
      .slice(0, 5)
      .map((a) => ({ type: 'alert', id: a.id, title: a.title, region: a.region }));
    const resourceMatches = resources
      .filter((r) => (r.name + " " + r.contact).toLowerCase().includes(q))
      .slice(0, 5)
      .map((r) => ({ type: 'resource', name: r.name, region: r.region }));
    return [...alertMatches, ...resourceMatches].slice(0, 6);
  }, [searchQuery, alerts, resources]);

  const goToSuggestion = (item: any) => {
    if (!item) return;
    if (item.type === 'alert') {
      const el = document.getElementById('alerts');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (item.type === 'resource') {
      const el = document.getElementById('resources');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowSuggestions(false);
  };

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  // Calculate critical events
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  ).length;

  return (
    <div id="top" className="min-h-screen bg-background-primary">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${hideHeader ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#top" className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="w-8 h-8 text-accent-primary animate-pulse" />
                <div className="absolute inset-0 bg-accent-primary rounded-full animate-ping opacity-20" />
              </div>
              <div>
                <h1 className="font-heading text-lg font-bold text-white">
                  ClimateAlert
                </h1>
                <p className="text-xs text-accent-tertiary font-mono">HUB</p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <a href="#map" className="text-text-secondary hover:text-accent-tertiary transition-colors px-3 py-2 rounded">
                Risk Map
              </a>
              <a href="#analytics" className="text-text-secondary hover:text-accent-tertiary transition-colors px-3 py-2 rounded">
                Analytics
              </a>
              <a href="#alerts" className="text-text-secondary hover:text-accent-tertiary transition-colors px-3 py-2 rounded">
                Alerts
              </a>
              <a href="#trends" className="text-text-secondary hover:text-accent-tertiary transition-colors px-3 py-2 rounded">
                Trends
              </a>
              <a href="#resources" className="text-text-secondary hover:text-accent-tertiary transition-colors px-3 py-2 rounded">
                Resources
              </a>
              <a href="#history" className="text-text-secondary hover:text-accent-tertiary transition-colors px-3 py-2 rounded">
                History
              </a>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search alerts, resources..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (suggestions.length > 0) {
                            goToSuggestion(suggestions[0]);
                          } else {
                            const el = document.getElementById('alerts');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }}
                      className="w-full bg-background-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-tertiary transition-colors"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-2 bg-background-card border border-border rounded-lg shadow-lg z-50">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onMouseDown={(ev) => { ev.preventDefault(); goToSuggestion(s); }}
                            className="w-full text-left px-3 py-2 hover:bg-background-secondary/60 text-sm text-text-secondary"
                          >
                            <span className="font-medium text-white mr-2">{s.type === 'alert' ? 'Alert' : 'Resource'}</span>
                            {s.title || s.name} {s.region ? `· ${s.region}` : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background-secondary border-t border-border">
              <div className="px-4 py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-text-secondary"
                />
              </div>
              <a href="#map" className="block text-text-secondary hover:text-white py-2 px-2 rounded">Risk Map</a>
              <a href="#analytics" className="block text-text-secondary hover:text-white py-2 px-2 rounded">Analytics</a>
              <a href="#alerts" className="block text-text-secondary hover:text-white py-2 px-2 rounded">Alerts</a>
              <a href="#trends" className="block text-text-secondary hover:text-white py-2 px-2 rounded">Trends</a>
              <a href="#resources" className="block text-text-secondary hover:text-white py-2 px-2 rounded">Resources</a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden gradient-emergency py-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-tertiary rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-8">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
                ClimateAlert <span className="text-accent-tertiary">Hub</span>
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Real-time climate monitoring and disaster management dashboard
                for India. Track floods, cyclones, earthquakes, and access
                emergency resources.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background-card/80 backdrop-blur rounded-xl p-4 border border-border card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {alerts.length}
                    </p>
                    <p className="text-xs text-text-secondary">Active Alerts</p>
                  </div>
                </div>
              </div>
              <div className="bg-background-card/80 backdrop-blur rounded-xl p-4 border border-border card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-secondary/20 rounded-lg">
                    <Activity className="w-5 h-5 text-accent-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {criticalCount}
                    </p>
                    <p className="text-xs text-text-secondary">Critical Events</p>
                  </div>
                </div>
              </div>
              <div className="bg-background-card/80 backdrop-blur rounded-xl p-4 border border-border card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-tertiary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-accent-tertiary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {metrics ? formatCo2Value(metrics.co2.value) : "--"}
                    </p>
                    <p className="text-xs text-text-secondary">CO2 (ppm)</p>
                  </div>
                </div>
              </div>
              <div className="bg-background-card/80 backdrop-blur rounded-xl p-4 border border-border card-hover">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-success/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-accent-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {resources.length}
                    </p>
                    <p className="text-xs text-text-secondary">Resources</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Map Section */}
        <section id="map" className="py-12 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-accent-tertiary" />
                  Global Risk Map
                </h2>
                <p className="text-text-secondary mt-1">
                  Interactive map showing flood, fire, and earthquake risk zones
                </p>
              </div>
              <div className="flex gap-2">
                {["flood", "fire", "earthquake", "cyclone"].map((layer) => (
                  <button
                    key={layer}
                    onClick={() => toggleLayer(layer)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                      activeLayers.includes(layer)
                        ? "bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary"
                        : "bg-background-card border-border text-text-secondary hover:border-text-secondary"
                    )}
                  >
                    {layer.charAt(0).toUpperCase() + layer.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <RiskMap activeLayers={activeLayers} alerts={alerts} />
          </div>
        </section>

        {/* History Section */}
        <section id="history" className="py-12 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-accent-tertiary" />
                  India - 10 Year Disaster History
                </h2>
                <p className="text-text-secondary mt-1">Events detected within India's bounds over the past 10 years (sourced from NASA EONET).</p>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-accent-tertiary animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center text-text-secondary py-8">No historical events found for India in the last 10 years.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((h) => (
                  <div key={String(h.id)} className="bg-background-card rounded-xl p-4 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{h.title}</h3>
                        <p className="text-xs text-text-secondary">{h.category} · {h.date ? new Date(h.date).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm mb-2">{h.description}</p>
                    {h.coordinates && (
                      <p className="text-xs text-text-secondary">Location: {h.coordinates[0].toFixed(3)}, {h.coordinates[1].toFixed(3)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Climate Analytics Section */}
        <section id="analytics" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-accent-tertiary" />
              Climate Analytics Dashboard
            </h2>
            {metricsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-accent-tertiary animate-spin" />
              </div>
            ) : metrics ? (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* CO2 Card */}
                  <button
                    onClick={() => setExpandedMetric(expandedMetric === "co2" ? null : "co2")}
                    className="bg-background-card rounded-xl p-6 border border-border card-hover text-left transition-all cursor-pointer hover:border-accent-primary"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-accent-primary/20 rounded-lg">
                        <Cloud className="w-6 h-6 text-accent-primary" />
                      </div>
                      <span className="text-accent-primary text-sm font-medium">
                        Live Data
                      </span>
                    </div>
                    <h3 className="text-text-secondary text-sm mb-1">CO2 Levels</h3>
                    <p className="text-3xl font-bold text-white font-mono">
                      {formatCo2Value(metrics.co2.value)}
                      <span className="text-lg text-text-secondary ml-1">ppm</span>
                    </p>
                    <p className="text-xs text-text-secondary mt-2">
                      {metrics.co2.trend}
                    </p>
                    <p className="text-xs text-accent-primary mt-3">Click for more info ↓</p>
                  </button>

                  {/* Temperature Card */}
                  <button
                    onClick={() => setExpandedMetric(expandedMetric === "temp" ? null : "temp")}
                    className="bg-background-card rounded-xl p-6 border border-border card-hover text-left transition-all cursor-pointer hover:border-accent-secondary"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-accent-secondary/20 rounded-lg">
                        <Thermometer className="w-6 h-6 text-accent-secondary" />
                      </div>
                      <span className="text-accent-secondary text-sm font-medium">
                        Live Data
                      </span>
                    </div>
                    <div className="space-y-2">
                      {metrics.currentTemp && (
                        <div>
                          <h3 className="text-text-secondary text-sm mb-1">
                            Current Location Temperature
                          </h3>
                          <p className="text-3xl font-bold text-white font-mono">
                            {formatCo2Value(metrics.currentTemp.value)}
                            <span className="text-lg text-text-secondary ml-1">°C</span>
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {metrics.currentTemp.location}
                          </p>
                        </div>
                      )}
                      <div className={metrics.currentTemp ? "border-t border-border pt-2" : ""}>
                        <h3 className="text-text-secondary text-sm mb-1">
                          Temperature Anomaly
                        </h3>
                        <p className="text-xl font-bold text-white font-mono">
                          +{formatCo2Value(metrics.tempAnomaly.value)}°C
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-accent-secondary mt-3">Click for more info ↓</p>
                  </button>

                  {/* Sea Level Card */}
                  <button
                    onClick={() => setExpandedMetric(expandedMetric === "sea" ? null : "sea")}
                    className="bg-background-card rounded-xl p-6 border border-border card-hover text-left transition-all cursor-pointer hover:border-accent-tertiary"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-accent-tertiary/20 rounded-lg">
                        <Waves className="w-6 h-6 text-accent-tertiary" />
                      </div>
                      <span className="text-accent-tertiary text-sm font-medium">
                        Projection
                      </span>
                    </div>
                    <h3 className="text-text-secondary text-sm mb-1">
                      Sea Level Rise
                    </h3>
                    <p className="text-3xl font-bold text-white font-mono">
                      {formatCo2Value(metrics.seaRise.value)}
                      <span className="text-lg text-text-secondary ml-1">mm/yr</span>
                    </p>
                    <p className="text-xs text-text-secondary mt-2">
                      {metrics.seaRise.trend}
                    </p>
                    <p className="text-xs text-accent-tertiary mt-3">Click for more info ↓</p>
                  </button>
                </div>

                {/* Expanded Metric Information */}
                {expandedMetric === "co2" && (
                  <div className="mt-6 bg-background-card rounded-xl p-6 border border-accent-primary/50 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-accent-primary" />
                        CO2 Levels - Detailed Information
                      </h3>
                      <button
                        onClick={() => setExpandedMetric(null)}
                        className="text-text-secondary hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-text-secondary mb-1">Current Level: <span className="text-white font-mono font-bold">{formatCo2Value(metrics.co2.value)} ppm</span></p>
                        <p className="text-xs text-text-secondary">{metrics.co2.trend}</p>
                      </div>
                      <div className="border-t border-border pt-3">
                        <p className="text-accent-primary font-semibold mb-2">⚠ Health & Environmental Impact:</p>
                        <ul className="space-y-1 text-text-secondary">
                          <li>• CO2 levels above 415 ppm indicate accelerating climate change</li>
                          <li>• Pre-industrial levels were around 280 ppm</li>
                          <li>• Current trend contributes to global warming and ocean acidification</li>
                          <li>• Mitigation: Reduce fossil fuel dependence, increase renewable energy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {expandedMetric === "temp" && (
                  <div className="mt-6 bg-background-card rounded-xl p-6 border border-accent-secondary/50 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-accent-secondary" />
                        Temperature Data - Detailed Information
                      </h3>
                      <button
                        onClick={() => setExpandedMetric(null)}
                        className="text-text-secondary hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      {metrics.currentTemp && (
                        <div>
                          <p className="text-text-secondary mb-1">Location Temperature: <span className="text-white font-mono font-bold">{formatCo2Value(metrics.currentTemp.value)}°C</span> at {metrics.currentTemp.location}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-text-secondary mb-1">Anomaly: <span className="text-white font-mono font-bold">+{formatCo2Value(metrics.tempAnomaly.value)}°C</span></p>
                        <p className="text-xs text-text-secondary">{metrics.tempAnomaly.trend}</p>
                      </div>
                      <div className="border-t border-border pt-3">
                        <p className="text-accent-secondary font-semibold mb-2">🌡 Temperature Impact:</p>
                        <ul className="space-y-1 text-text-secondary">
                          <li>• Positive anomaly indicates warming above historical baseline</li>
                          <li>• Each 1°C increase affects weather patterns and ecosystems</li>
                          <li>• Consequences: Extreme heat events, crop failures, water scarcity</li>
                          <li>• Adaptation: Early warning systems, climate-resilient agriculture</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {expandedMetric === "sea" && (
                  <div className="mt-6 bg-background-card rounded-xl p-6 border border-accent-tertiary/50 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                        <Waves className="w-5 h-5 text-accent-tertiary" />
                        Sea Level Rise - Detailed Information
                      </h3>
                      <button
                        onClick={() => setExpandedMetric(null)}
                        className="text-text-secondary hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-text-secondary mb-1">Annual Rise: <span className="text-white font-mono font-bold">{formatCo2Value(metrics.seaRise.value)} mm/year</span></p>
                        <p className="text-xs text-text-secondary">{metrics.seaRise.trend}</p>
                      </div>
                      <div className="border-t border-border pt-3">
                        <p className="text-accent-tertiary font-semibold mb-2">🌊 Sea Level Risk:</p>
                        <ul className="space-y-1 text-text-secondary">
                          <li>• Rising sea levels threaten coastal cities and island nations</li>
                          <li>• Causes: Thermal expansion and melting glaciers/ice sheets</li>
                          <li>• At current rate: ~39cm rise by 2100 (without major action)</li>
                          <li>• India Impact: Threatens coastal regions, increases flood risk</li>
                          <li>• Solutions: Coastal protection, mangrove restoration, sustainable development</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-text-secondary">
                Failed to load metrics
              </div>
            )}
          </div>
        </section>

        {/* Disaster Alert Feed Section */}
        <section id="alerts" className="py-12 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-accent-primary" />
                Disaster Alert Feed
              </h2>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-tertiary"
                >
                  <option value="all">All Types</option>
                  <option value="cyclone">Cyclone</option>
                  <option value="flood">Flood</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="fire">Fire</option>
                  <option value="drought">Drought</option>
                  <option value="storm">Storm</option>
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-tertiary"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-tertiary"
                >
                  <option value="all">All Locations</option>
                  <option value="india">India</option>
                  <option value="global">Global</option>
                </select>
              </div>
            </div>

            {alertsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center text-text-secondary py-8">
                    No alerts found
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "bg-background-card rounded-xl border p-4 transition-all card-hover cursor-pointer",
                        selectedAlert === alert.id
                          ? "border-accent-tertiary shadow-glow-cyan"
                          : "border-border hover:border-accent-tertiary/50"
                      )}
                      onClick={() =>
                        setSelectedAlert(
                          selectedAlert === alert.id ? null : alert.id
                        )
                      }
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">
                          {getDisasterIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {alert.title}
                            </h3>
                            <span
                              className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-full capitalize",
                                getSeverityColor(alert.severity)
                              )}
                            >
                              {alert.severity}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {alert.region}
                            </span>
                            <span>{alert.time}</span>
                          </div>
                          {selectedAlert === alert.id && (
                            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                              <p className="text-text-secondary text-sm mb-3">
                                {alert.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-text-secondary mb-1">
                                    Impact:
                                  </p>
                                  <p className="text-sm text-white">
                                    {alert.impact}
                                  </p>
                                </div>
                                <button className="flex items-center gap-1 px-4 py-2 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors text-sm">
                                  Impact Report
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Trend Visualizer Section */}
        <section id="trends" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-accent-tertiary" />
              Trend Visualizer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-white mb-4">
                  30-Day CO2 Emissions Trend
                </h3>
                <TrendChart
                  data={trends?.co2 || []}
                  label="CO2 (ppm)"
                  color="#ff4d4d"
                  forecastColor="#ff8c00"
                />
              </div>
              <div className="bg-background-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-white mb-4">
                  30-Day Temperature Anomaly
                </h3>
                <TrendChart
                  data={trends?.temp || []}
                  label="Temp (°C)"
                  color="#ff8c00"
                  forecastColor="#00d9ff"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Resource Hub Section */}
        <section id="resources" className="py-12 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
                <Filter className="w-6 h-6 text-accent-tertiary" />
                Resource Hub
              </h2>
              <div className="flex flex-wrap gap-3">
                <select
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-tertiary"
                >
                  <option value="all">All Types</option>
                  <option value="tool">Tools</option>
                  <option value="ngo">NGOs</option>
                  <option value="gov agency">Government</option>
                  <option value="evacuation plan">Evacuation</option>
                </select>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="bg-background-card border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-tertiary"
                >
                  <option value="all">All Regions</option>
                  <option value="davanagere">Davanagere</option>
                  <option value="india">All India</option>
                </select>
              </div>
            </div>

            {resourcesLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-accent-tertiary animate-spin" />
              </div>
            ) : (
              <div className="bg-background-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs text-text-secondary font-medium uppercase tracking-wider px-6 py-4">
                          Name
                        </th>
                        <th className="text-left text-xs text-text-secondary font-medium uppercase tracking-wider px-6 py-4">
                          Type
                        </th>
                        <th className="text-left text-xs text-text-secondary font-medium uppercase tracking-wider px-6 py-4">
                          Region
                        </th>
                        <th className="text-left text-xs text-text-secondary font-medium uppercase tracking-wider px-6 py-4">
                          Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredResources.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-text-secondary"
                          >
                            No resources found
                          </td>
                        </tr>
                      ) : (
                        filteredResources.map((resource, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-background-secondary/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <p className="font-medium text-white">
                                {resource.name}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs font-medium rounded bg-accent-tertiary/20 text-accent-tertiary capitalize">
                                {resource.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-text-secondary capitalize">
                              {resource.region}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-accent-tertiary text-sm space-y-1">
                                {renderContactLinks(resource.contact)}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-secondary border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-accent-primary" />
              <div>
                <p className="font-heading text-sm font-bold text-white">
                  ClimateAlert Hub
                </p>
                <p className="text-xs text-text-secondary">
                  Climate & Disaster Management Analytics
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-text-secondary">
              <a
                href="#"
                className="hover:text-accent-tertiary transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="hover:text-accent-tertiary transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-accent-tertiary transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-accent-tertiary transition-colors"
              >
                Emergency Contacts
              </a>
            </div>
            <p className="text-xs text-text-secondary">
              © 2024 ClimateAlert Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
