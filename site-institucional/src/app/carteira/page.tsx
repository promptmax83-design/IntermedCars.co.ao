"use client";
import { useState } from "react";

export default function CarteiraPage() {
  const [tab, setTab] = useState("saldo");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Carteira</h1>
        <p className="text-sm text-slate-500 mb-6">Gestao financeira da sua conta.</p>

        {/* Saldo Card */}
        <div className="bg-gradient-to-br from-[var(--imc-verde-terra)] to-emerald-800 rounded-2xl p-6 mb-6 text-white">
          <p className="text-sm opacity-80 mb-1">Saldo Disponivel</p>
          <p className="text-3xl font-bold">Kz 0</p>
          <p className="text-xs opacity-60 mt-2">Sem transacoes registadas ainda.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "saldo", label: "Saldo" },
            { key: "transacoes", label: "Transacoes" },
            { key: "pagamentos", label: "Pagamentos" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-[var(--imc-verde-terra)] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "saldo" && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">Saldo em breve</p>
            <p className="text-xs text-slate-500 mt-1">A carteira digital estara disponivel em breve.</p>
          </div>
        )}

        {tab === "transacoes" && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">Sem transacoes</p>
            <p className="text-xs text-slate-500 mt-1">O historico de transacoes aparecera aqui.</p>
          </div>
        )}

        {tab === "pagamentos" && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">Sem pagamentos</p>
            <p className="text-xs text-slate-500 mt-1">Os seus pagamentos aparecerao aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
