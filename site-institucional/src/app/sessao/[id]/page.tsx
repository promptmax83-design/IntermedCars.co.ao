"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SessionChat from "@/components/intermediation/SessionChat";

const MapaConsultores = dynamic(
  () => import("@/components/maps/MapaConsultores"),
  { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getUserIdFromToken(): number | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || payload.id || null;
  } catch {
    return null;
  }
}

function getUserRoleFromToken(): string {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "user";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "user";
  } catch {
    return "user";
  }
}

export default function SessaoPage() {
  const params = useParams();
  const router = useRouter();
  const sessaoId = Number(params.id);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState("user");
  const [showMap, setShowMap] = useState(false);
  const [consultorPos, setConsultorPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const id = getUserIdFromToken();
    const role = getUserRoleFromToken();
    setUserId(id);
    setUserRole(role);

    if (!id) {
      router.push("/login");
    }
  }, [router]);

  // Poll consultor position when map is visible
  useEffect(() => {
    if (!showMap || !sessaoId) return;

    const fetchConsultorLocation = async () => {
      try {
        const token = localStorage.getItem("token");
        const sessaoRes = await fetch(`${API_BASE}/api/sessoes/${sessaoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessaoData = await sessaoRes.json();

        if (sessaoData.success && sessaoData.data?.consultor_id) {
          const locRes = await fetch(
            `${API_BASE}/api/consultants/${sessaoData.data.consultor_id}/location`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const locData = await locRes.json();
          if (locData.success && locData.data?.latitude && locData.data?.longitude) {
            setConsultorPos({
              lat: Number(locData.data.latitude),
              lng: Number(locData.data.longitude),
            });
          }
        }
      } catch {
        // Silent fail
      }
    };

    fetchConsultorLocation();
    const interval = setInterval(fetchConsultorLocation, 10000);
    return () => clearInterval(interval);
  }, [showMap, sessaoId]);

  if (!userId || !sessaoId) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col">
      {/* Desktop: split view | Mobile: chat only */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat column */}
        <div className={`${showMap ? "lg:w-[55%]" : "w-full"} transition-all duration-300 flex flex-col`}>
          <SessionChat
            sessaoId={sessaoId}
            currentUserId={userId}
            currentUserRole={userRole}
          />
        </div>

        {/* Map column — desktop only */}
        {showMap && (
          <div className="hidden lg:flex lg:w-[45%] border-l border-slate-200 flex-col bg-white">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <p className="text-xs font-semibold text-slate-600">
                  Localizacao do Consultor
                </p>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 relative">
              {consultorPos ? (
                <MapaConsultores
                  center={consultorPos}
                  radiusKm={2}
                  mode="buyer"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Aguardando posicao do consultor...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map toggle button — floating */}
      {!showMap && (
        <button
          onClick={() => setShowMap(true)}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-[#059669] text-white shadow-lg shadow-[#059669]/30 flex items-center justify-center hover:bg-[#047857] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503.249l1.624 1.624c.683.683 1.808.21 1.808-.778V6.356c0-.99-1.118-1.618-1.808-.89L9.503 7.873M12 2.25l7.624 7.624c.683.683.21 1.808-.778 1.808H12m0 0V4.5m0 0L4.376 12.124c-.683.683-.21 1.808.778 1.808H12" />
          </svg>
        </button>
      )}
    </div>
  );
}
