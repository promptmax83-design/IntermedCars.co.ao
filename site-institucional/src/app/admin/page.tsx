"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Tab = "dashboard" | "utilizadores" | "veiculos" | "escrow" | "analytics";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "\u{1F4CA}" },
  { id: "utilizadores", label: "Utilizadores", icon: "\u{1F465}" },
  { id: "veiculos", label: "Veiculos", icon: "\u{1F697}" },
  { id: "escrow", label: "Escrow", icon: "\u{1F3E6}" },
  { id: "analytics", label: "Analytics", icon: "\u{1F4C8}" },
];

type User = { id: number; nome: string; email: string; telemovel: string; status: string; bi_passaporte: string; created_at: string };
type Vehicle = { id: number; marca: string; modelo: string; preco: number; vendedor_nome: string; status: string; created_at: string; vendedor_id: number };
type Transaction = { id: number; marca: string; modelo: string; proposed_price: number; buyer_name: string; seller_name: string; status: string; created_at: string; commission_deadline: string | null };
type AdminStats = { disponivel: number; em_negociacao: number; comprado: number; cancelado: number; total: number; user_count: number; transaction_count: number; commission_revenue: number };

function formatKz(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-AO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const statusLabels: Record<string, string> = {
  disponivel: "Disponivel",
  em_negociacao: "Em Negociacao",
  comprado: "Vendido",
  cancelado: "Cancelado",
  verificado: "Verificado",
  pendente_verificacao: "Pendente",
  temporariamente_banido: "Banido",
  proposta_enviada: "Proposta Enviada",
  proposta_aceite: "Proposta Aceite",
  deposito_efetuado: "Deposito Efetuado",
  vistoria_concluida: "Vistoria Concluida",
  comissao_pendente: "Comissao Pendente",
  comissao_paga: "Comissao Paga",
  transacao_concluida: "Concluido",
  transacao_cancelada: "Cancelado",
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, usersRes, vehiclesRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, { headers }),
        fetch(`${API_BASE}/api/admin/users`, { headers }),
        fetch(`${API_BASE}/api/admin/vehicles`, { headers }),
        fetch(`${API_BASE}/api/admin/transactions`, { headers }),
      ]);

      const [statsData, usersData, vehiclesData, txData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        vehiclesRes.json(),
        txRes.json(),
      ]);

      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch {
      // API not available
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <p className="text-[#52525b] text-sm">A carregar painel admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a0a0c] border-r border-white/[0.06] flex flex-col">
        <div className="p-6 border-b border-white/[0.06]">
          <h1 className="text-lg font-bold text-[#fafafa]">Painel Admin</h1>
          <p className="text-[11px] text-[#71717a] mt-1">IntermedCars Management</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "text-[#71717a] hover:bg-white/[0.04] hover:text-[#fafafa]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Dashboard */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#fafafa]">Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-5">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Utilizadores</p>
                <p className="text-2xl font-bold text-[#10b981] mt-2">{stats.user_count}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Veiculos Ativos</p>
                <p className="text-2xl font-bold text-[#10b981] mt-2">{stats.total}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Transacoes</p>
                <p className="text-2xl font-bold text-[#10b981] mt-2">{stats.transaction_count}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Receita Total</p>
                <p className="text-2xl font-bold text-[#10b981] mt-2">{formatKz(stats.commission_revenue)} Kz</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Disponiveis</p>
                <p className="text-2xl font-bold text-[#10b981] mt-2">{stats.disponivel}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Em Negociacao</p>
                <p className="text-2xl font-bold text-[#f59e0b] mt-2">{stats.em_negociacao}</p>
              </div>
            </div>
          </div>
        )}

        {/* Utilizadores */}
        {activeTab === "utilizadores" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#fafafa]">Utilizadores ({users.length})</h2>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none w-64"
              />
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Nome</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">BI</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((u) => !search || u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
                    .map((u) => (
                    <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="p-4 text-sm text-[#fafafa]">{u.nome}</td>
                      <td className="p-4 text-sm text-[#71717a]">{u.email}</td>
                      <td className="p-4 text-xs text-[#52525b] font-mono">{u.bi_passaporte || "-"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          u.status === "verificado" ? "bg-[#10b981]/10 text-[#10b981]" :
                          u.status === "temporariamente_banido" ? "bg-[#ef4444]/10 text-[#ef4444]" :
                          "bg-[#f59e0b]/10 text-[#f59e0b]"
                        }`}>
                          {statusLabels[u.status] || u.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[#52525b]">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Veiculos */}
        {activeTab === "veiculos" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#fafafa]">Veiculos ({vehicles.length})</h2>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Marca</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Modelo</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Preco</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Vendedor</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="p-4 text-sm text-[#10b981] font-medium">{v.marca}</td>
                      <td className="p-4 text-sm text-[#fafafa]">{v.modelo}</td>
                      <td className="p-4 text-sm text-[#fafafa]">{formatKz(v.preco)} Kz</td>
                      <td className="p-4 text-sm text-[#71717a]">{v.vendedor_nome}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          v.status === "disponivel" ? "bg-[#10b981]/10 text-[#10b981]" :
                          v.status === "em_negociacao" ? "bg-[#f59e0b]/10 text-[#f59e0b]" :
                          "bg-[#52525b]/10 text-[#52525b]"
                        }`}>
                          {statusLabels[v.status] || v.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[#52525b]">{formatDate(v.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Escrow */}
        {activeTab === "escrow" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#fafafa]">Transacoes Escrow ({transactions.length})</h2>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Veiculo</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Valor</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Comprador</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Vendedor</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Estado</th>
                    <th className="text-left p-4 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const isActive = !["transacao_concluida", "transacao_cancelada"].includes(t.status);
                    return (
                      <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="p-4 text-sm text-[#fafafa]">{t.marca} {t.modelo}</td>
                        <td className="p-4 text-sm text-[#10b981] font-semibold">{formatKz(t.proposed_price)} Kz</td>
                        <td className="p-4 text-sm text-[#71717a]">{t.buyer_name}</td>
                        <td className="p-4 text-sm text-[#71717a]">{t.seller_name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            isActive ? "bg-[#f59e0b]/10 text-[#f59e0b]" : "bg-[#10b981]/10 text-[#10b981]"
                          }`}>
                            {statusLabels[t.status] || t.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#52525b]">{formatDate(t.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && stats && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#fafafa]">Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-[#10b981]">{stats.total}</p>
                <p className="text-sm text-[#71717a] mt-1">Total Veiculos</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-[#f59e0b]">{formatKz(stats.commission_revenue)} Kz</p>
                <p className="text-sm text-[#71717a] mt-1">Comissoes</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-[#10b981]">{stats.user_count}</p>
                <p className="text-sm text-[#71717a] mt-1">Utilizadores</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-[#10b981]">{stats.transaction_count}</p>
                <p className="text-sm text-[#71717a] mt-1">Transacoes</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-[#fafafa] mb-4">Distribuicao de Veiculos</h3>
              <div className="space-y-3">
                {[
                  { label: "Disponiveis", count: stats.disponivel, color: "bg-[#10b981]" },
                  { label: "Em Negociacao", count: stats.em_negociacao, color: "bg-[#f59e0b]" },
                  { label: "Vendidos", count: stats.comprado, color: "bg-[#52525b]" },
                  { label: "Cancelados", count: stats.cancelado, color: "bg-[#ef4444]" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-xs text-[#71717a] w-28">{item.label}</span>
                    <div className="flex-1 h-6 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#fafafa] w-12 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
