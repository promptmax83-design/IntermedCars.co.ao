"use client";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

export default function DefinicoesPage() {
  const { user, logout } = useAuth();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Definicoes</h1>
        <p className="text-sm text-slate-500 mb-6">Gerir a sua conta e preferencias.</p>

        {/* Perfil */}
        <section className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Dados da Conta</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Nome</span>
              <span className="text-sm font-medium text-slate-800">{user?.nome || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-800">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Estado</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${user?.verificado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {user?.verificado ? "Verificado" : "Pendente"}
              </span>
            </div>
          </div>
          <Link href="/perfil" className="block mt-4 text-sm font-medium text-[var(--imc-verde-terra)] hover:underline">
            Ver perfil completo →
          </Link>
        </section>

        {/* Notificacoes */}
        <section className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Notificacoes</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">Email</p>
                <p className="text-xs text-slate-400">Receber notificacoes por email</p>
              </div>
              <div
                onClick={() => setNotifEmail(!notifEmail)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${notifEmail ? "bg-[var(--imc-verde-terra)]" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${notifEmail ? "translate-x-[22px]" : "translate-x-0.5"}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">Push</p>
                <p className="text-xs text-slate-400">Notificacoes no navegador</p>
              </div>
              <div
                onClick={() => setNotifPush(!notifPush)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${notifPush ? "bg-[var(--imc-verde-terra)]" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${notifPush ? "translate-x-[22px]" : "translate-x-0.5"}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">SMS</p>
                <p className="text-xs text-slate-400">Receber por SMS (KambaSMS)</p>
              </div>
              <div
                onClick={() => setNotifSms(!notifSms)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${notifSms ? "bg-[var(--imc-verde-terra)]" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${notifSms ? "translate-x-[22px]" : "translate-x-0.5"}`} />
              </div>
            </label>
          </div>
        </section>

        {/* Seguranca */}
        <section className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Seguranca</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between">
              <span className="text-sm text-slate-700">Alterar palavra-passe</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between">
              <span className="text-sm text-slate-700">Verificacao em duas etapas</span>
              <span className="text-xs text-slate-400">Em breve</span>
            </button>
          </div>
        </section>

        {/* Sair */}
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Terminar sessao
        </button>
      </div>
    </div>
  );
}
