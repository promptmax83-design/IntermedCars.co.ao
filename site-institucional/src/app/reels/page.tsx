"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ReelPlayer from "@/components/reels/ReelPlayer";
import ConsultantRadarModal from "@/components/intermediation/ConsultantRadarModal";

interface Reel {
  id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  vehicle_id: number | null;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  preco_aoa: number | null;
  caption: string | null;
  provincia: string | null;
  views_count: number;
  likes_count: number;
  is_liked?: boolean;
}

export default function ReelsPage() {
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [radarOpen, setRadarOpen] = useState(false);
  const [radarVehicleId, setRadarVehicleId] = useState(0);
  const [radarVehicleName, setRadarVehicleName] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const fetchReels = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/reels?sort=trending&page=${pageNum}&limit=20`
      );
      const data = await res.json();
      if (data.success) {
        const newReels = data.data?.reels || [];
        if (pageNum === 1) {
          setReels(newReels);
        } else {
          setReels((prev) => [...prev, ...newReels]);
        }
        setHasMore(newReels.length === 20);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/reels?sort=trending&page=1&limit=20`
        );
        const data = await res.json();
        if (!cancelled && data.success) {
          setReels(data.data?.reels || []);
          setHasMore((data.data?.reels || []).length === 20);
        }
      } catch {
        // Silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        hasMore &&
        !loading
      ) {
        const next = pageRef.current + 1;
        pageRef.current = next;
        fetchReels(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, fetchReels]);

  const handleOpenRadar = (vehicleId: number | null, vehicleName: string) => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    setRadarVehicleId(vehicleId || 0);
    setRadarVehicleName(vehicleName);
    setRadarOpen(true);
    setSelectedReel(null);
  };

  const handleRadarFound = (consultantId: number, sessionId: number) => {
    setRadarOpen(false);
    router.push(`/sessao/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Reels</h1>
            <p className="text-[11px] text-slate-500">Descubra veiculos em video</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">Nenhum reel ainda</p>
            <p className="text-xs text-slate-500">Seja o primeiro a compartilhar um video</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedReel(reel)}
            >
              <video
                src={reel.video_url}
                poster={reel.thumbnail_url || undefined}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                {reel.duration_seconds}s
              </div>

              <div className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                reel.user_role === "consultor"
                  ? "bg-[#c9a84c]/90 text-[#060608]"
                  : "bg-[#10b981]/90 text-white"
              }`}>
                {reel.user_role === "consultor" ? "Consultor" : "Vendedor"}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5">
                {reel.marca && (
                  <p className="text-white text-[12px] font-bold leading-tight">
                    {reel.marca} {reel.modelo}
                  </p>
                )}
                {reel.preco_aoa && (
                  <p className="text-[#10b981] text-[11px] font-bold">
                    Kz {reel.preco_aoa.toLocaleString("pt-AO")}
                  </p>
                )}
                <div className="flex items-center gap-2 text-white/50 text-[9px]">
                  <span>{reel.views_count} views</span>
                  <span>{reel.likes_count} likes</span>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="col-span-full flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {selectedReel && (
        <ReelPlayer
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
          onRadar={handleOpenRadar}
        />
      )}

      <ConsultantRadarModal
        isOpen={radarOpen}
        vehicleId={radarVehicleId}
        vehicleName={radarVehicleName}
        onFound={handleRadarFound}
        onNotFound={() => setRadarOpen(false)}
        onCancel={() => setRadarOpen(false)}
      />
    </div>
  );
}
