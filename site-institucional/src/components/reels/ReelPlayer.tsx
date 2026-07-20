"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

interface Reel {
  id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  preco_aoa: number | null;
  caption: string | null;
  provincia: string | null;
  views_count: number;
  likes_count: number;
  is_liked?: boolean;
  vehicle_id?: number | null;
}

interface ReelPlayerProps {
  reel: Reel;
  onClose: () => void;
  onRadar?: (vehicleId: number | null, vehicleName: string) => void;
}

export default function ReelPlayer({ reel, onClose, onRadar }: ReelPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(reel.is_liked || false);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
    apiPost(`/api/reels/${reel.id}/view`).catch(() => {});
  }, [reel.id]);

  const handleLike = async () => {
    try {
      const res = await apiPost<{ liked: boolean; likes_count: number }>(`/api/reels/${reel.id}/like`);
      setLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch {
      // Silent fail
    }
  };

  const handleRadar = () => {
    const vehicleName = `${reel.marca || ""} ${reel.modelo || ""} ${reel.ano || ""}`.trim();
    if (onRadar) {
      onRadar(reel.vehicle_id || null, vehicleName);
    }
  };

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url || undefined}
        className="h-full max-h-screen w-auto mx-auto object-contain"
        loop
        playsInline
        muted={isMuted}
        onClick={() => setIsMuted(!isMuted)}
      />

      <button
        onClick={onClose}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-16 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        {isMuted ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        )}
      </button>

      <div className="absolute right-4 bottom-1/3 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            liked ? "bg-[#ef4444]/20" : "bg-white/20 backdrop-blur-sm"
          }`}>
            <svg className={`w-6 h-6 ${liked ? "text-[#ef4444] fill-[#ef4444]" : "text-white"}`} viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span className="text-white text-[10px]">{formatViews(likesCount)}</span>
        </button>

        <button
          onClick={() => router.push("/chat")}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A1.875 1.875 0 015.625 3h12.75A1.875 1.875 0 0120.25 4.875v10.5a1.875 1.875 0 01-1.875 1.875H5.625A1.875 1.875 0 013.75 20.105z" />
            </svg>
          </div>
          <span className="text-white text-[10px]">Chat</span>
        </button>

        <button onClick={handleRadar} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-[#c9a84c]/90 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#060608]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503.249l1.624 1.624c.683.683 1.808.21 1.808-.778V6.356c0-.99-1.118-1.618-1.808-.89L9.503 7.873M12 2.25l7.624 7.624c.683.683.21 1.808-.778 1.808H12m0 0V4.5m0 0L4.376 12.124c-.683.683-.21 1.808.778 1.808H12" />
            </svg>
          </div>
          <span className="text-white text-[10px]">Consultor</span>
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-white/60 text-[10px]">{formatViews(reel.views_count)}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-16 p-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
            reel.user_role === "consultor"
              ? "bg-[#c9a84c] text-[#060608]"
              : "bg-[#10b981] text-white"
          }`}>
            {reel.user_name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-white text-[13px] font-semibold">{reel.user_name}</p>
            <p className="text-white/50 text-[10px]">
              {reel.user_role === "consultor" ? "Consultor" : "Vendedor"}
            </p>
          </div>
        </div>

        {reel.marca && reel.modelo && (
          <p className="text-white text-lg font-bold">
            {reel.marca} {reel.modelo} {reel.ano || ""}
          </p>
        )}

        {reel.preco_aoa && (
          <p className="text-[#10b981] text-xl font-bold">
            Kz {reel.preco_aoa.toLocaleString("pt-AO")}
          </p>
        )}

        {reel.caption && (
          <p className="text-white/70 text-[13px] max-w-md">{reel.caption}</p>
        )}
      </div>
    </div>
  );
}
