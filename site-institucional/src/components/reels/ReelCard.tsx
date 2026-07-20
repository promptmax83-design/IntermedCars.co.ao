"use client";

import { useRef, useEffect, useState } from "react";

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
}

interface ReelCardProps {
  reel: Reel;
  onClick: (reel: Reel) => void;
}

export default function ReelCard({ reel, onClick }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  const formatPrice = (n: number) => {
    return `Kz ${n.toLocaleString("pt-AO")}`;
  };

  return (
    <div
      className="relative w-[200px] h-[320px] rounded-2xl overflow-hidden cursor-pointer group shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(reel)}
    >
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url || undefined}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
        {reel.duration_seconds}s
      </div>

      <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full ${
        reel.user_role === "consultor"
          ? "bg-[#c9a84c]/90 text-[#060608]"
          : "bg-[#10b981]/90 text-white"
      }`}>
        {reel.user_role === "consultor" ? "Consultor" : "Vendedor"}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
        {reel.marca && reel.modelo && (
          <p className="text-white text-[13px] font-bold leading-tight">
            {reel.marca} {reel.modelo} {reel.ano || ""}
          </p>
        )}
        {reel.preco_aoa && (
          <p className="text-[#10b981] text-[12px] font-bold">
            {formatPrice(reel.preco_aoa)}
          </p>
        )}
        {reel.caption && (
          <p className="text-white/80 text-[11px] line-clamp-2">{reel.caption}</p>
        )}
        <div className="flex items-center gap-3 text-white/60 text-[10px]">
          <span>{formatViews(reel.views_count)} views</span>
          <span>{formatViews(reel.likes_count)} likes</span>
          {reel.provincia && <span>{reel.provincia}</span>}
        </div>
      </div>

      <div className={`absolute inset-0 bg-black/20 transition-opacity ${
        isHovered ? "opacity-100" : "opacity-0"
      }`} />
    </div>
  );
}
