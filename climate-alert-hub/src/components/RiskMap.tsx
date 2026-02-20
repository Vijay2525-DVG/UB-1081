"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon, Marker, Popup, LayersControl, Circle } from "react-leaflet";
import L from "leaflet";
import { riskZones, type RiskZone, disasterAlerts } from "@/data/mockData";

interface AlertData {
  id: number | string;
  title: string;
  severity: string;
  type?: string;
  region?: string;
  time?: string;
  coordinates?: [number, number];
}

interface RiskMapProps {
  activeLayers: string[];
  alerts: AlertData[];
}

const centerIndia: [number, number] = [22.0, 78.0];

function getLayerColor(type: string, severity: string) {
  const colors: Record<string, Record<string, string>> = {
    flood: { critical: "#ff0000", high: "#ff8c00", medium: "#ffff00", low: "#00ff00" },
    fire: { critical: "#ff0000", high: "#ff4500", medium: "#ff8c00", low: "#ffa500" },
    earthquake: { critical: "#ff0000", high: "#ff4444", medium: "#ff8888", low: "#ffcccc" },
    cyclone: { critical: "#ff0000", high: "#ff4400", medium: "#ff8800", low: "#ffcc00" },
  };
  return colors[type]?.[severity] || "#ff0000";
}

const defaultMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function RiskMap({ activeLayers, alerts }: RiskMapProps): JSX.Element {
  // Try to enrich alerts with coordinates if missing by matching to mock data
  const enrichedAlerts = alerts.map((a) => {
    // if already has coordinates, keep
    // @ts-ignore
    if (a.coordinates && Array.isArray(a.coordinates)) return a;
    // try match by region/title using mock disasterAlerts
    const match = disasterAlerts.find((d) =>
      (a.region && d.location && d.location.toLowerCase().includes(String(a.region).toLowerCase())) ||
      (a.title && d.title && String(a.title).toLowerCase().includes(String(d.title).toLowerCase()))
    );
    if (match) return { ...a, coordinates: match.coordinates };
    return a;
  });

  return (
    <div className="relative h-[500px] bg-background-card rounded-xl border border-border overflow-hidden">
      <MapContainer center={centerIndia} zoom={5} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay name="Risk Zones" checked>
            <LayerGroupPlaceholder />
          </LayersControl.Overlay>
        </LayersControl>

        {/* Render polygons for risk zones */}
        {riskZones
          .filter((zone: RiskZone) => activeLayers.includes(zone.type))
          .map((zone: RiskZone) => (
            <Polygon
              key={zone.id}
              pathOptions={{ color: getLayerColor(zone.type, zone.severity), weight: 2, fillOpacity: 0.25 }}
              positions={zone.coordinates as [number, number][]}
            >
              <Popup>
                <div>
                  <strong>{zone.name}</strong>
                  <div className="text-xs">Type: {zone.type}</div>
                  <div className="text-xs">Severity: {zone.severity}</div>
                </div>
              </Popup>
            </Polygon>
          ))}

        {/* Render alert markers when coordinates exist */}
        {enrichedAlerts
          .filter((a) => a.coordinates && a.coordinates.length === 2)
          .map((a) => (
            <Marker key={String(a.id)} position={a.coordinates as [number, number]} icon={defaultMarkerIcon}>
              <Popup>
                <div>
                  <strong>{a.title}</strong>
                  <div className="text-xs text-muted">{a.region}</div>
                  <div className="text-xs">Severity: {a.severity}</div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Map overlays */}
      <div className="absolute top-4 left-4 bg-background-card/90 backdrop-blur rounded-lg p-3 border border-border">
        <h4 className="text-sm font-semibold text-white mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          {activeLayers.includes("flood") && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-70"></div>
              <span className="text-text-secondary">Flood Risk</span>
            </div>
          )}
          {activeLayers.includes("fire") && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 opacity-70"></div>
              <span className="text-text-secondary">Fire Risk</span>
            </div>
          )}
          {activeLayers.includes("earthquake") && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 opacity-70"></div>
              <span className="text-text-secondary">Seismic Zone</span>
            </div>
          )}
          {activeLayers.includes("cyclone") && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600 opacity-70"></div>
              <span className="text-text-secondary">Cyclone Zone</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-background-card/90 backdrop-blur rounded-lg p-3 border border-border">
        <h4 className="text-sm font-semibold text-white mb-2">Active Alerts</h4>
        <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
          {alerts.slice(0, 5).map((alert) => (
            <div key={String(alert.id)} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                alert.severity === 'critical' ? 'bg-red-500' :
                alert.severity === 'high' ? 'bg-orange-500' :
                alert.severity === 'moderate' || alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></span>
              <span className="text-text-secondary truncate">{alert.region || alert.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// small placeholder component because react-leaflet LayersControl requires a child
function LayerGroupPlaceholder(): null {
  return null;
}
