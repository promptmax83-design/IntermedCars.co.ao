"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/components/intermediation/useGeolocation";
import { apiGet, apiPut } from "@/lib/api";

const MapaConsultores = dynamic(
  () => import("@/components/maps/MapaConsultores"),
  { ssr: false }
);

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

const RADIUS_OPTIONS = [5, 10, 15, 25] as const;

export default function ConsultorMapaPage() {
  const router = useRouter();
  const geo = useGeolocation({ enableHighAccuracy: true, watchPosition: true });
  const [radius, setRadius] = useState<number>(10);
  const [consultants, setConsultants] = useState<ConsultantMarker[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [sendingLocation, setSendingLocation] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const sendLocation = useCallback(
    async (lat: number, lng: number) => {
      setSendingLocation(true);
      try {
        await apiPut("/api/consultants/me/location", {
          latitude: lat,
          longitude: lng,
        });
        setLastUpdate(new Date());
      } catch {
        // Silently fail - will retry on next position update
      } finally {
        setSendingLocation(false);
      }
    },
    []
  );

  useEffect(() => {
    if (geo.position) {
      sendLocation(geo.position.lat, geo.position.lng);
    }
  }, [geo.position, sendLocation]);

  const fetchNearby = useCallback(async () => {
    if (!geo.position) return;
    try {
      const res = await apiGet<{ data: ConsultantMarker[] }>(
        `/api/consultants/nearby?lat=${geo.position.lat}&lng=${geo.position.lng}&radius=${radius}`
      );
      setConsultants(res.data ?? []);
    } catch {
      setConsultants([]);
    }
  }, [geo.position, radius]);

  useEffect(() => {
    if (geo.position) {
      fetchNearby();
      const interval = setInterval(fetchNearby, 10000);
      return () => clearInterval(interval);
    }
  }, [geo.position, fetchNearby]);

  const mapCenter = useMemo(
    () => geo.position ?? { lat: -8.8399, lng: 13.2894 },
    [geo.position]
  );

  const handleRefresh = () => {
    geo.refresh();
    fetchNearby();
  };

  const handleManualPosition = () => {
    const latInput = prompt("Latitude (ex: -8.8399):");
    if (!latInput) return;
    const lngInput = prompt("Longitude (ex: 13.2894):");
    if (!lngInput) return;

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Coordenadas invalidas. Insira valores numericos.");
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Coordenadas fora do intervalo valido.");
      return;
    }

    geo.setManualPosition(lat, lng);
    sendLocation(lat, lng);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });

  if (geo.loading && !geo.position) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center animate-pulse">
            <svg
              className="w-7 h-7 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            A obter a sua localizacao...
          </p>
          <p className="text-xs text-slate-400">
            Permita o acesso a localizacao no navegador
          </p>
        </div>
      </div>
    );
  }

  if (geo.permissionDenied) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-slate-800">
              Localizacao negada
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Ative a permissao de localizacao nas configuracoes do navegador
              para usar o mapa.
            </p>
          </div>
          <button
            onClick={handleManualPosition}
            className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#b8983f] text-[#060608] text-sm font-semibold rounded-lg transition-colors"
          >
            Definir Localizacao Manualmente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mapa</h1>
        <p className="text-sm text-slate-500">
          Veiculos e consultores na sua zona
        </p>
      </div>

      {/* Map */}
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden">
        <div className="h-[400px]">
          <MapaConsultores
            center={mapCenter}
            radiusKm={radius}
            consultants={consultants}
            showRadar={false}
            mode="consultant"
          />
        </div>
      </div>

      {/* Radius selector */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-800">Raio de Cobertura</h2>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                radius === r
                  ? "bg-[#059669] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Location controls */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-800">Atualizar Localizacao</h2>
        <p className="text-sm text-slate-500">
          Atualize a sua posicao para ser visivel para veiculos proximos.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={sendingLocation}
            className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#b8983f] disabled:opacity-50 text-[#060608] text-sm font-semibold rounded-lg transition-colors"
          >
            {sendingLocation ? "A enviar..." : "Usar Minha Localizacao Atual"}
          </button>
          <button
            onClick={handleManualPosition}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
          >
            Definir Manualmente
          </button>
        </div>

        {/* Location info */}
        {geo.position && (
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Lat: {geo.position.lat.toFixed(5)}, Lng:{" "}
              {geo.position.lng.toFixed(5)}
            </span>
            {lastUpdate && (
              <span>Atualizado: {formatTime(lastUpdate)}</span>
            )}
            {geo.accuracy > 0 && (
              <span>Precisao: ~{Math.round(geo.accuracy)}m</span>
            )}
          </div>
        )}

        {geo.error && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            {geo.error}
          </p>
        )}
      </div>

      {/* Consultants list */}
      {consultants.length > 0 && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-slate-800">
            Consultores Proximos ({consultants.length})
          </h2>
          <div className="space-y-2">
            {consultants.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        c.ranking.toLowerCase() === "embaixador"
                          ? "#10B981"
                          : c.ranking.toLowerCase() === "ouro"
                            ? "#FFD700"
                            : c.ranking.toLowerCase() === "prata"
                              ? "#C0C0C0"
                              : "#CD7F32",
                    }}
                  >
                    {c.nome
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {c.nome}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.ranking} &bull; {c.rating.toFixed(1)} estrela
                      {c.rating !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.distancia_km !== undefined && (
                    <span className="text-xs text-slate-500">
                      {c.distancia_km.toFixed(1)} km
                    </span>
                  )}
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        c.estado === "online"
                          ? "#10b98120"
                          : c.estado === "ocupado"
                            ? "#F59E0B20"
                            : c.estado === "ausente"
                              ? "#EF444420"
                              : "#94A3B820",
                      color:
                        c.estado === "online"
                          ? "#10b981"
                          : c.estado === "ocupado"
                            ? "#F59E0B"
                            : c.estado === "ausente"
                              ? "#EF4444"
                              : "#94A3B8",
                    }}
                  >
                    {c.estado === "online"
                      ? "Online"
                      : c.estado === "ocupado"
                        ? "Ocupado"
                        : c.estado === "ausente"
                          ? "Ausente"
                          : "Offline"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
