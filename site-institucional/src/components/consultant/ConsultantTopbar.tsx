"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import StatusSelector from "./StatusSelector";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ id: number; event: string; created_at: string }>>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/notifications/logs?limit=5`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const logs = Array.isArray(data) ? data : data.data || [];
        setNotifications(logs.slice(0, 5));
        setCount(logs.filter((l: { status: string }) => l.status === "enviado").length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
        <svg className="w-[18px] h-[18px] text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {count > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--imc-ouro)] rounded-full" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200/60 shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100"><p className="text-sm font-semibold text-slate-800">Notificacoes</p></div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">Sem notificacoes</p>
            ) : notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <p className="text-xs text-slate-700">{n.event}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.created_at).toLocaleString("pt-AO")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesIcon() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/messages/unread/count`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((data) => setCount(data.count || 0))
      .catch(() => {});
  }, []);

  return (
    <Link href="/chat" className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
      <svg className="w-[18px] h-[18px] text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[var(--imc-verde-online)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count > 99 ? "99+" : count}</span>
      )}
    </Link>
  );
}

function AvatarMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = user?.nome ? user.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[var(--imc-verde-terra)] to-emerald-700 flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer">
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200/60 shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.nome}</p>
            <p className="text-[11px] text-[var(--imc-verde-terra)] font-medium">Consultor</p>
          </div>
          <div className="py-1">
            <Link href="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Perfil
            </Link>
            <Link href="/definicoes" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Definicoes
            </Link>
          </div>
          <div className="border-t border-slate-100 py-1">
            <button onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              Terminar sessao
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsultantTopbar() {
  return (
    <header className="sticky top-0 z-40 h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <Link href="/consultor/painel" className="flex items-center gap-2">
          <svg className="h-5 w-auto" viewBox="0 0 140 24" fill="none">
            <text x="0" y="18" fontFamily="system-ui" fontWeight="800" fontSize="16" fill="#2F6B3A">Intermed</text>
            <text x="68" y="18" fontFamily="system-ui" fontWeight="800" fontSize="16" fill="#C99B3E">Cars</text>
          </svg>
          <span className="text-[11px] font-medium text-[var(--imc-verde-terra)] bg-[var(--imc-verde-claro-bg)] px-2 py-0.5 rounded-md">Consultor</span>
        </Link>
      </div>
      <div className="flex items-center gap-[14px]">
        <StatusSelector />
        <NotificationBell />
        <MessagesIcon />
        <AvatarMenu />
      </div>
    </header>
  );
}
