"use client";

import { useState, useEffect } from "react";
import ReelCard from "./ReelCard";

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

interface ReelFeedProps {
  title: string;
  subtitle?: string;
  sort?: string;
  provincia?: string;
  onSelectReel: (reel: Reel) => void;
}

export default function ReelFeed({ title, subtitle, sort = "trending", provincia, onSelectReel }: ReelFeedProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const params = new URLSearchParams({ sort, limit: "20" });
        if (provincia) params.set("provincia", provincia);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/reels?${params}`);
        const data = await res.json();
        if (data.success) {
          setReels(data.data?.reels || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, [sort, provincia]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="px-4">
          <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          {subtitle && <div className="h-3 w-64 bg-slate-100 rounded mt-1 animate-pulse" />}
        </div>
        <div className="flex gap-3 px-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[200px] h-[320px] bg-slate-200 rounded-2xl animate-pulse shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (reels.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="px-4">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-hide">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} onClick={onSelectReel} />
        ))}
      </div>
    </div>
  );
}
