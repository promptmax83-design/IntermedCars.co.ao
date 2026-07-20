"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ConsultantMarker {
  id: number;
  user_id: number;
  nome: string;
  rating: number;
  ranking: string;
  lat: number;
  lng: number;
  estado: "online" | "offline" | "ocupado" | "ausente";
  distancia_km?: number;
}

interface MapaConsultoresProps {
  center: { lat: number; lng: number };
  radiusKm?: number;
  consultants?: ConsultantMarker[];
  onConsultantClick?: (c: ConsultantMarker) => void;
  showRadar?: boolean;
  mode?: "buyer" | "consultant";
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center.lat, center.lng, map]);
  return null;
}

function RadarPulse({ center }: { center: { lat: number; lng: number } }) {
  const rings = [300, 200, 100];
  return (
    <>
      {rings.map((radius, i) => (
        <CircleMarker
          key={i}
          center={[center.lat, center.lng]}
          radius={radius / 50}
          pathOptions={{
            color: "#059669",
            fillColor: "#059669",
            fillOpacity: 0,
            weight: 2,
            opacity: 0.6,
            className: `radar-pulse radar-pulse-${i}`,
          }}
        />
      ))}
    </>
  );
}

function getRankingColor(ranking: string): string {
  switch (ranking.toLowerCase()) {
    case "embaixador":
      return "#10B981";
    case "ouro":
    case "gold":
      return "#FFD700";
    case "prata":
    case "silver":
      return "#C0C0C0";
    case "bronze":
    default:
      return "#CD7F32";
  }
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case "online":
      return "#10B981";
    case "ocupado":
      return "#F59E0B";
    case "ausente":
      return "#EF4444";
    case "offline":
    default:
      return "#94A3B8";
  }
}

function getEstadoLabel(estado: string): string {
  switch (estado) {
    case "online":
      return "Online";
    case "ocupado":
      return "Ocupado";
    case "ausente":
      return "Ausente";
    case "offline":
    default:
      return "Offline";
  }
}

export default function MapaConsultores({
  center,
  radiusKm = 5,
  consultants = [],
  onConsultantClick,
  showRadar = false,
}: MapaConsultoresProps) {
  const radiusMeters = useMemo(() => radiusKm * 1000, [radiusKm]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="w-full h-full min-h-[400px]"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} />

      {/* User position */}
      <CircleMarker
        center={[center.lat, center.lng]}
        radius={8}
        pathOptions={{
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.8,
          weight: 3,
          opacity: 1,
        }}
      >
        <Popup>
          <span className="text-sm font-semibold">Voce esta aqui</span>
        </Popup>
      </CircleMarker>

      {/* Coverage radius */}
      <Circle
        center={[center.lat, center.lng]}
        radius={radiusMeters}
        pathOptions={{
          color: "#059669",
          fillColor: "#059669",
          fillOpacity: 0.05,
          weight: 2,
          dashArray: "8 8",
        }}
      />

      {/* Radar pulse overlay */}
      {showRadar && <RadarPulse center={center} />}

      {/* Consultant markers */}
      {consultants.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.lat, c.lng]}
          radius={10}
          pathOptions={{
            color: getRankingColor(c.ranking),
            fillColor: getRankingColor(c.ranking),
            fillOpacity: 0.8,
            weight: 3,
            opacity: 1,
          }}
          eventHandlers={{
            click: () => onConsultantClick?.(c),
          }}
        >
          <Popup>
            <div className="space-y-1 p-1">
              <p className="text-sm font-bold text-slate-800">{c.nome}</p>
              <p className="text-xs text-slate-500">
                Ranking:{" "}
                <span className="font-semibold" style={{ color: getRankingColor(c.ranking) }}>
                  {c.ranking}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Avaliacao: {c.rating.toFixed(1)} estrela{c.rating !== 1 ? "s" : ""}
              </p>
              {c.distancia_km !== undefined && (
                <p className="text-xs text-slate-500">
                  Distancia: {c.distancia_km.toFixed(1)} km
                </p>
              )}
              <span
                className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
                style={{
                  backgroundColor: getEstadoColor(c.estado) + "20",
                  color: getEstadoColor(c.estado),
                }}
              >
                {getEstadoLabel(c.estado)}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
