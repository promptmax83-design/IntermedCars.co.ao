"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import Logo from "@/components/logo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Credenciais invalidas");
      }

      login(data.token, data.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* ═══ LEFT — Visual Panel ═══ */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.1)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.05)_0%,transparent_50%)]" />

        <div className="relative z-10 max-w-lg px-12">
          {/* Logo + Brand */}
          <div className="mb-12">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold text-slate-800 mt-6">
              Bem-vindo de volta
            </h1>
            <p className="text-[15px] text-slate-500 mt-3 leading-relaxed">
              Acesse a sua conta e continue a negociar veiculos de forma segura.
            </p>
          </div>

          {/* Visual Cards — Representing digital intermediation */}
          <div className="space-y-4">
            {/* Card 1: Security Shield */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Mediação 100% Segura</p>
                <p className="text-[12px] text-slate-500">Cada negociacao é acompanhada e protegida</p>
              </div>
            </div>

            {/* Card 2: Verified Users */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Utilizadores Verificados</p>
                <p className="text-[12px] text-slate-500">Identidade confirmada para sua seguranca</p>
              </div>
            </div>

            {/* Card 3: Transparent Process */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Processo Transparente</p>
                <p className="text-[12px] text-slate-500">Acompanhe cada etapa da negociacao</p>
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-10 flex items-center gap-2 text-[12px] text-slate-400">
            <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Milhares de negocios concluidos com seguranca</span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT — Login Form ═══ */}
      <div className="flex-1 lg:flex-none lg:w-[480px] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <Logo size="md" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Entrar</h2>
          <p className="text-sm text-slate-500 mb-8">
            Acesse a tua conta para continuar
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Email ou Telefone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemplo@email.com"
                className="w-full mt-1.5 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none focus:border-[#10b981]/30 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="A tua palavra-passe"
                className="w-full mt-1.5 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none focus:border-[#10b981]/30 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/[0.1] bg-slate-50 text-[#10b981] focus:ring-[#10b981]/30" />
                <span className="text-[12px] text-slate-500">Lembrar-me</span>
              </label>
              <a href="#" className="text-[12px] text-[#10b981] hover:underline">
                Esqueceu a password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]"
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Nao tens conta?{" "}
              <Link
                href="/registo"
                className="text-[#10b981] font-semibold hover:underline"
              >
                Criar Conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
