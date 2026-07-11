"use client";
import { useState } from "react";

const periodos = ["Hoje", "Esta Semana", "Este Mês", "Este Ano"];

const resumoHoje = [
  { valor: "€4.250", label: "Comissões", cor: "text-accent" },
  { valor: "€41.500", label: "Em Escrow", cor: "text-blue-500" },
  { valor: "€82.400", label: "Receitas", cor: "text-emerald-500" },
  { valor: "3", label: "Negócios Ativos", cor: "text-amber-500" },
];

const transacoes = [
  { data: "10/07", descricao: "Comissão - BMW Serie 5 #1247", valor: "+€2.075", tipo: "receita" },
  { data: "09/07", descricao: "Escrow liberado - Audi Q5 #1245", valor: "+€2.425", tipo: "receita" },
  { data: "08/07", descricao: "Pagamento cofre - Porsche Macan #1246", valor: "€67.000", tipo: "escrow" },
  { data: "07/07", descricao: "Comissão - Tesla Model 3 #1240", valor: "+€2.150", tipo: "receita" },
  { data: "05/07", descricao: "Taxa de平台 - Mensal", valor: "-€299", tipo: "despesa" },
];

export default function DashboardFinanceiroPage() {
  const [periodo, setPeriodo] = useState("Hoje");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
        <p className="text-sm text-muted">Visão geral das suas finanças.</p>
      </div>

      <div className="flex gap-2">
        {periodos.map((p) => (
          <button key={p} onClick={() => setPeriodo(p)} className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${p === periodo ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {resumoHoje.map((r) => (
          <div key={r.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className={`text-2xl font-bold ${r.cor}`}>{r.valor}</p>
            <p className="text-xs text-muted mt-1">{r.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Gráfico de Receitas</h2>
        <div className="flex items-end gap-2 h-40">
          {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-accent/20 rounded-t" style={{ height: `${h}%` }}>
                <div className="w-full bg-accent rounded-t" style={{ height: "100%" }} />
              </div>
              <span className="text-[10px] text-muted">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"][i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold">Transações Recentes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {transacoes.map((t, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t.descricao}</p>
                <p className="text-xs text-muted">{t.data}</p>
              </div>
              <span className={`text-sm font-bold ${t.tipo === "receita" ? "text-emerald-500" : t.tipo === "escrow" ? "text-blue-500" : "text-red-500"}`}>
                {t.valor}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
