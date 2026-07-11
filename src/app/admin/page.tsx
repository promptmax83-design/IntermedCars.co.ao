"use client";
import { useState } from "react";
import StatusBadge, { type VehicleStatus } from "@/components/status-badge";

const stats = [
  { valor: "1.247", label: "Utilizadores", change: "+12%", cor: "emerald" },
  { valor: "156", label: "Veiculos Ativos", change: "+18", cor: "emerald" },
  { valor: "34", label: "Em Negociacao", change: "+5", cor: "amber" },
  { valor: "89", label: "Vendidos", change: "+8 esta semana", cor: "gold" },
  { valor: "Kz 42.5M", label: "Volume Total", change: "+23%", cor: "emerald" },
  { valor: "Kz 2.1M", label: "Comissoes", change: "+15%", cor: "gold" },
];

const tabs = [
  "Dashboard",
  "Utilizadores",
  "Veiculos",
  "Pagamentos",
  "Escrow",
  "Denuncias",
  "Suporte",
  "Analytics",
  "Logs",
];

const veiculos: {
  id: number;
  marca: string;
  modelo: string;
  preco: string;
  vendedor: string;
  status: VehicleStatus;
  data: string;
}[] = [
  {
    id: 1,
    marca: "BMW",
    modelo: "M3 Competition",
    preco: "18.500.000",
    vendedor: "Joao Silva",
    status: "disponivel",
    data: "10/07/2026",
  },
  {
    id: 2,
    marca: "Mercedes-AMG",
    modelo: "GT 63 S",
    preco: "42.000.000",
    vendedor: "Maria Santos",
    status: "em_negociacao",
    data: "08/07/2026",
  },
  {
    id: 3,
    marca: "Porsche",
    modelo: "911 Turbo S",
    preco: "65.000.000",
    vendedor: "Pedro Costa",
    status: "disponivel",
    data: "09/07/2026",
  },
  {
    id: 4,
    marca: "Ford",
    modelo: "Mustang GT",
    preco: "12.800.000",
    vendedor: "Ana Oliveira",
    status: "comprado",
    data: "05/07/2026",
  },
  {
    id: 5,
    marca: "Audi",
    modelo: "RS6 Avant",
    preco: "28.500.000",
    vendedor: "Carlos Mendes",
    status: "em_negociacao",
    data: "07/07/2026",
  },
  {
    id: 6,
    marca: "Lamborghini",
    modelo: "Huracan EVO",
    preco: "89.000.000",
    vendedor: "Sofia Ramos",
    status: "cancelado",
    data: "01/07/2026",
  },
];

const utilizadores = [
  { nome: "Joao Silva", tipo: "Vendedor", status: "Ativo", data: "01/2024" },
  { nome: "Ana Oliveira", tipo: "Comprador", status: "Ativo", data: "03/2023" },
  { nome: "Carlos Mendes", tipo: "Vendedor", status: "Ativo", data: "09/2024" },
  {
    nome: "Pedro Santos",
    tipo: "Comprador",
    status: "Pendente",
    data: "07/2026",
  },
  {
    nome: "Maria Santos",
    tipo: "Vendedor",
    status: "Suspenso",
    data: "01/2025",
  },
];

export default function AdminPage() {
  const [tabAtiva, setTabAtiva] = useState("Dashboard");

  return (
    <div className="flex h-full overflow-hidden bg-[#060608]">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-52 bg-[#0a0a0c] border-r border-white/[0.04] shrink-0 py-4 px-3">
        <h2 className="font-bold text-sm px-3 mb-4 text-[#fafafa]">
          Painel Admin
        </h2>
        <div className="space-y-0.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTabAtiva(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                t === tabAtiva
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "text-[#71717a] hover:text-[#fafafa] hover:bg-white/[0.03]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Mobile Tabs */}
        <div className="flex items-center gap-2 lg:hidden mb-4 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTabAtiva(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                t === tabAtiva
                  ? "bg-[#10b981] text-[#060608]"
                  : "bg-white/[0.04] text-[#71717a]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tabAtiva === "Dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#fafafa]">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="glass-card rounded-xl p-5">
                  <p
                    className={`text-2xl font-bold ${
                      s.cor === "emerald"
                        ? "text-[#10b981]"
                        : s.cor === "amber"
                          ? "text-[#f59e0b]"
                          : "text-[#c9a84c]"
                    }`}
                  >
                    {s.valor}
                  </p>
                  <p className="text-sm text-[#71717a] mt-1">{s.label}</p>
                  <p className="text-xs text-[#10b981] mt-2">{s.change}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-[#fafafa] mb-3">
                Atividade Recente
              </h3>
              <div className="space-y-3">
                {[
                  "Nova negociacao #1247 - BMW M3 Competition",
                  "Pagamento de Kz 41.500.000 processado no cofre",
                  "Veiculo BMW M3 marcado como Vendido",
                  "Denuncia #89 recebida - verificar",
                  "Proposta de Kz 40.000.000 aceite para Mercedes-AMG",
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 bg-[#10b981] rounded-full shrink-0" />
                    <span className="text-[#a1a1aa]">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Utilizadores Tab */}
        {tabAtiva === "Utilizadores" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#fafafa]">
                Utilizadores
              </h1>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] outline-none"
              />
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Nome
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Tipo
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Desde
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {utilizadores.map((u, i) => (
                    <tr key={i} className="border-t border-white/[0.04]">
                      <td className="px-4 py-3 font-medium text-[#fafafa]">
                        {u.nome}
                      </td>
                      <td className="px-4 py-3 text-[#71717a]">{u.tipo}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            u.status === "Ativo"
                              ? "bg-[#10b981]/10 text-[#10b981]"
                              : u.status === "Pendente"
                                ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                                : "bg-[#ef4444]/10 text-[#ef4444]"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#71717a]">{u.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Veiculos Tab */}
        {tabAtiva === "Veiculos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#fafafa]">Veiculos</h1>
              <div className="flex gap-2">
                <select className="text-sm border border-white/[0.06] rounded-lg px-3 py-1.5 bg-white/[0.04] text-[#fafafa] outline-none">
                  <option>Todos os estados</option>
                  <option>Disponivel</option>
                  <option>Em Negociacao</option>
                  <option>Vendido</option>
                  <option>Cancelado</option>
                </select>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Veiculo
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Preco
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Vendedor
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[#71717a]">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {veiculos.map((v, i) => (
                    <tr key={i} className="border-t border-white/[0.04]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#fafafa]">
                          {v.marca} {v.modelo}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[#10b981] font-medium">
                        Kz {v.preco}
                      </td>
                      <td className="px-4 py-3 text-[#71717a]">{v.vendedor}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-4 py-3 text-[#71717a]">{v.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholder Tabs */}
        {tabAtiva !== "Dashboard" &&
          tabAtiva !== "Utilizadores" &&
          tabAtiva !== "Veiculos" && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-4xl mb-2 text-[#27272a]">WIP</p>
                <p className="text-[#52525b] text-sm">
                  Painel {tabAtiva} em construcao
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
