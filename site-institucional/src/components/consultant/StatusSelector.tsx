"use client";
import { useState, useRef, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Status = "online" | "offline" | "ocupado" | "ausente";

const statusConfig: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  online: { label: "Disponivel", color: "text-white", bg: "bg-[var(--imc-verde-online)]", dot: "bg-white" },
  ocupado: { label: "Ocupado", color: "text-white", bg: "bg-amber-500", dot: "bg-white" },
  ausente: { label: "Em deslocacao", color: "text-white", bg: "bg-blue-500", dot: "bg-white" },
  offline: { label: "Offline", color: "text-slate-600", bg: "bg-slate-200", dot: "bg-slate-400" },
};

export default function StatusSelector({ initialStatus = "offline" }: { initialStatus?: Status }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeStatus = async (newStatus: Status) => {
    const prev = status;
    setStatus(newStatus); // optimistic
    setOpen(false);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/consultants/me/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: newStatus }),
      });
      if (!res.ok) setStatus(prev); // rollback
    } catch {
      setStatus(prev); // rollback
    } finally {
      setLoading(false);
    }
  };

  const config = statusConfig[status];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${config.bg} ${config.color} hover:opacity-90 disabled:opacity-60 cursor-pointer`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        {config.label}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200/60 shadow-lg z-50 overflow-hidden">
          {(Object.entries(statusConfig) as [Status, typeof config][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => changeStatus(key)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                status === key ? "bg-slate-50 font-semibold" : "hover:bg-slate-50"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${cfg.bg}`} />
              <span className="text-slate-700">{cfg.label}</span>
              {status === key && (
                <svg className="w-4 h-4 text-[var(--imc-verde-terra)] ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
