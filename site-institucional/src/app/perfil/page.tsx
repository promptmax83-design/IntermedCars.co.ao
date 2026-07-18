"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type UserProfile = {
  id: number;
  nome: string;
  email: string;
  telemovel: string;
  verificado: boolean;
  status: string;
  created_at: string;
  verified_at: string | null;
  veiculos: number;
  vendas: number;
};

type Vehicle = {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  status: string;
  created_at: string;
};

export default function PerfilPage() {
  const [tab, setTab] = useState("inventario");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) {
        setError("Precisa de fazer login para ver o perfil");
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        const [profileRes, vehiclesRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/vehicles?status=disponivel`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json();
          const allVehicles = vehiclesData.data || vehiclesData;
          // Filter vehicles owned by current user
          const myVehicles = Array.isArray(allVehicles)
            ? allVehicles.filter((v: Vehicle & { user_id?: number }) => v.user_id === user.id)
            : [];
          setVehicles(myVehicles);
        }
      } catch {
        setError("Erro ao carregar perfil");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
        <Logo size="md" />
        <p className="text-slate-500 mt-4">{error || "Perfil nao encontrado"}</p>
        <Link href="/login" className="text-[#10b981] text-sm mt-2 hover:underline">
          Fazer login
        </Link>
      </div>
    );
  }

  const initials = profile.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString("pt-AO", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#10b981]/20 via-[#c9a84c]/20 to-[#10b981]/20 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#c9a84c] to-[#b8933d] rounded-full border-4 border-slate-200 flex items-center justify-center">
                <span className="text-[#060608] text-2xl font-bold">{initials}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pt-14 px-6 pb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{profile.nome}</h1>
              {profile.verificado && (
                <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              Membro desde {memberSince}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200/60">
                <p className="text-xl font-bold text-[#10b981]">{profile.veiculos}</p>
                <p className="text-[10px] text-slate-500">Veiculos</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200/60">
                <p className="text-xl font-bold text-[#c9a84c]">{profile.vendas}</p>
                <p className="text-[10px] text-slate-500">Vendas</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200/60">
                <p className="text-xl font-bold text-slate-800">
                  {profile.verificado ? "✓" : "—"}
                </p>
                <p className="text-[10px] text-slate-500">Verificado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200">
          {["inventario", "configuracoes"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-[#10b981] text-[#060608]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "inventario" && (
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm">Ainda nao tem veiculos anunciados.</p>
                <Link
                  href="/anunciar"
                  className="inline-block mt-3 text-[#10b981] text-sm font-medium hover:underline"
                >
                  Anunciar primeiro veiculo
                </Link>
              </div>
            ) : (
              vehicles.map((v) => (
                <Link
                  key={v.id}
                  href={`/viatura/${v.id}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl">
                        🚗
                      </div>
                      <div>
                        <p className="text-[11px] text-[#10b981] font-semibold uppercase tracking-wider">
                          {v.marca}
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {v.modelo} · {v.ano}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#10b981]">
                        Kz {v.preco.toLocaleString("pt-AO")}
                      </p>
                      <p
                        className={`text-[10px] font-medium ${
                          v.status === "comprado" ? "text-[#10b981]" : "text-[#f59e0b]"
                        }`}
                      >
                        {v.status === "disponivel" ? "Ativo" : v.status === "comprado" ? "Vendido" : v.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === "configuracoes" && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">
                Dados Pessoais
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500">Nome</span>
                  <span className="text-[13px] text-slate-800">{profile.nome}</span>
                </div>
                <div className="h-px bg-slate-50" />
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500">Email</span>
                  <span className="text-[13px] text-slate-800">{profile.email}</span>
                </div>
                <div className="h-px bg-slate-50" />
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500">Telemovel</span>
                  <span className="text-[13px] text-slate-800">{profile.telemovel}</span>
                </div>
                <div className="h-px bg-slate-50" />
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500">Estado</span>
                  <span className={`text-[13px] font-medium ${
                    profile.verificado ? "text-[#10b981]" : "text-[#f59e0b]"
                  }`}>
                    {profile.verificado ? "Verificado" : "Pendente"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="w-full py-3 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] font-semibold text-sm rounded-xl transition-all duration-200 hover:bg-[#ef4444]/20"
            >
              Terminar_sessao
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
