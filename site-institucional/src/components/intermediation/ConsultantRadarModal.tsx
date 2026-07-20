"use client";

import { useEffect } from "react";
import { useRadar } from "./useRadar";

interface ConsultantRadarModalProps {
  isOpen: boolean;
  vehicleId: number;
  vehicleName: string;
  onFound: (consultantId: number, sessionId: number) => void;
  onNotFound: () => void;
  onCancel: () => void;
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

export default function ConsultantRadarModal({
  isOpen,
  vehicleId,
  vehicleName,
  onFound,
  onNotFound,
  onCancel,
}: ConsultantRadarModalProps) {
  const radar = useRadar({ vehicleId });

  useEffect(() => {
    if (isOpen) {
      radar.start();
    }
  }, [isOpen, radar.start]);

  useEffect(() => {
    if (radar.state === "found" && radar.consultant && radar.sessionId) {
      onFound(radar.consultant.id, radar.sessionId);
    } else if (radar.state === "timeout") {
      onNotFound();
    }
  }, [radar.state, radar.consultant, radar.sessionId, onFound, onNotFound]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {radar.state === "searching" && (
          <div className="p-8 flex flex-col items-center space-y-6">
            <h3 className="text-lg font-bold text-slate-800">
              A buscar consultor...
            </h3>
            <p className="text-sm text-slate-500 text-center">
              Procurando consultores proximos para <strong>{vehicleName}</strong>
            </p>

            {/* Radar animation */}
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-300/30 animate-ping" />
              <div className="absolute inset-4 rounded-full border-2 border-emerald-400/40 animate-ping" style={{ animationDelay: "0.3s" }} />
              <div className="absolute inset-8 rounded-full border-2 border-emerald-500/50 animate-ping" style={{ animationDelay: "0.6s" }} />
              <div className="absolute inset-12 rounded-full border-2 border-emerald-600/60 animate-ping" style={{ animationDelay: "0.9s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#059669] animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Isto pode demorar ate 60 segundos
            </p>

            <button
              onClick={onCancel}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {radar.state === "found" && radar.consultant && (
          <div className="p-8 flex flex-col items-center space-y-6">
            <h3 className="text-lg font-bold text-[#059669]">
              Consultor encontrado!
            </h3>

            <div className="flex flex-col items-center space-y-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: getRankingColor(radar.consultant.ranking) }}
              >
                {radar.consultant.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">
                  {radar.consultant.nome}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: getRankingColor(radar.consultant.ranking) }}
                >
                  {radar.consultant.ranking}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Avaliacao:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(radar.consultant!.rating)
                          ? "text-amber-400"
                          : "text-slate-200"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-slate-500">
                  ({radar.consultant.rating.toFixed(1)})
                </span>
              </div>

              {radar.consultant.distancia_km !== undefined && (
                <p className="text-sm text-slate-500">
                  {radar.consultant.distancia_km.toFixed(1)} km de distancia
                </p>
              )}
            </div>
          </div>
        )}

        {(radar.state === "timeout" || radar.state === "error") && (
          <div className="p-8 flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">
                {radar.state === "timeout"
                  ? "Nenhum consultor encontrado"
                  : "Erro na busca"}
              </h3>
              <p className="text-sm text-slate-500">
                {radar.error || "Tente novamente mais tarde"}
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  radar.cancel();
                  radar.start();
                }}
                className="flex-1 py-2.5 bg-[#c9a84c] hover:bg-[#b8983f] text-[#060608] text-sm font-semibold rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {radar.state === "idle" && (
          <div className="p-8 flex flex-col items-center space-y-4">
            <p className="text-sm text-slate-500">A iniciar busca...</p>
          </div>
        )}
      </div>
    </div>
  );
}
