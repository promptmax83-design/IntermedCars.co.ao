"use client";
import { useState } from "react";

const stats = [
  {
    valor: "1.247",
    label: "Utilizadores",
    change: "+12%",
    cor: "text-blue-500",
  },
  { valor: "89", label: "Agentes", change: "+5", cor: "text-accent" },
  { valor: "34", label: "Stands", change: "+2", cor: "text-emerald-500" },
  {
    valor: "156",
    label: "Mediações Ativas",
    change: "+18",
    cor: "text-amber-500",
  },
  { valor: "€2.4M", label: "Volume Total", change: "+23%", cor: "text-accent" },
  {
    valor: "€180k",
    label: "Comissões",
    change: "+15%",
    cor: "text-emerald-500",
  },
];

const tabs = [
  "Dashboard",
  "Utilizadores",
  "Agentes",
  "Stands",
  "Mediações",
  "Veículos",
  "Pagamentos",
  "Escrow",
  "Denúncias",
  "Suporte",
  "Analytics",
  "Logs",
  "Permissões",
];

const utilizadores = [
  { nome: "João Ferreira", tipo: "Agente", status: "Ativo", data: "01/2024" },
  { nome: "Ana Rodrigues", tipo: "Agente", status: "Ativo", data: "03/2023" },
  { nome: "AutoPremium", tipo: "Stand", status: "Ativo", data: "06/2022" },
  { nome: "Carlos Mendes", tipo: "Agente", status: "Ativo", data: "09/2024" },
  {
    nome: "Pedro Santos",
    tipo: "Comprador",
    status: "Pendente",
    data: "07/2026",
  },
  { nome: "EcoCars", tipo: "Stand", status: "Suspenso", data: "01/2025" },
];

export default function AdminPage() {
  const [tabAtiva, setTabAtiva] = useState("Dashboard");

  return (
    <div className="flex h-full overflow-hidden">
      <div className="hidden lg:flex flex-col w-52 bg-white border-r border-gray-200 shrink-0 py-4 px-3">
        <h2 className="font-bold text-sm px-3 mb-4">Painel Admin</h2>
        <div className="space-y-0.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTabAtiva(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${t === tabAtiva ? "bg-primary text-white" : "text-gray-600 hover:bg-light"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 lg:hidden mb-4 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTabAtiva(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${t === tabAtiva ? "bg-primary text-white" : "bg-white border border-gray-200"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tabAtiva === "Dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                >
                  <p className={`text-2xl font-bold ${s.cor}`}>{s.valor}</p>
                  <p className="text-sm text-muted mt-1">{s.label}</p>
                  <p className="text-xs text-emerald-500 mt-2">{s.change}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold mb-3">Atividade Recente</h3>
              <div className="space-y-3">
                {[
                  "Nova negociação #1247 - BMW Serie 5",
                  "Pagamento de €41.500 processado no cofre",
                  "Agente Ana Rodrigues atingiu nível Ouro",
                  "Stand EcoCars suspenso por falta de documentos",
                  "Denúncia #89 recebida - verificar",
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 bg-accent rounded-full shrink-0" />
                    <span className="text-muted">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tabAtiva === "Utilizadores" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Utilizadores</h1>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-light">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 font-medium">Desde</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizadores.map((u, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium">{u.nome}</td>
                      <td className="px-4 py-3 text-muted">{u.tipo}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === "Ativo" ? "bg-emerald-50 text-emerald-600" : u.status === "Pendente" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{u.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tabAtiva !== "Dashboard" && tabAtiva !== "Utilizadores" && (
          <div className="flex items-center justify-center h-64 text-muted text-sm">
            <div className="text-center">
              <p className="text-4xl mb-2">🚧</p>
              <p>Painel {tabAtiva} em construção</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
