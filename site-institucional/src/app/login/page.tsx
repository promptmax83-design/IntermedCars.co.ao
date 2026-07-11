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
    <div className="min-h-screen bg-[#060608] flex">
      {/* LEFT — Animations */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-md px-8">
          {/* Branding */}
          <div className="mb-10 flex flex-col items-start">
            <Logo size="lg" showText={false} />
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-[#fafafa]">
                Intermed<span className="text-[#10b981]">Cars</span>
              </h2>
              <p className="text-sm text-[#71717a] mt-1">
                Compre e venda veiculos de forma segura
              </p>
            </div>
          </div>

          {/* Animation: Chat + Vehicle Pipeline */}
          <div className="space-y-8">
            {/* Chat Animation */}
            <div className="relative">
              <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider mb-3">
                Chat em tempo real
              </p>
              <div className="space-y-2">
                {/* Message 1 — left */}
                <div className="flex items-end gap-2 chat-anim-1">
                  <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[10px] font-bold text-[#c9a84c] shrink-0">
                    JS
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[200px]">
                    <p className="text-[12px] text-[#fafafa]">O BMW ainda esta disponivel?</p>
                  </div>
                </div>

                {/* Message 2 — right */}
                <div className="flex items-end gap-2 justify-end chat-anim-2">
                  <div className="bg-[#10b981] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[200px]">
                    <p className="text-[12px] text-[#060608]">Sim! Posso mandar fotos</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[10px] font-bold text-[#10b981] shrink-0">
                    AR
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex items-end gap-2 chat-anim-3">
                  <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[10px] font-bold text-[#c9a84c] shrink-0">
                    JS
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52525b] typing-dot" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52525b] typing-dot" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52525b] typing-dot" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Pipeline Animation */}
            <div className="relative">
              <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider mb-3">
                Processo de mediacao
              </p>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                {/* Car icon + progress */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="car-move w-8 h-8 text-[#10b981]">
                    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] rounded-full pipeline-bar" />
                  </div>
                </div>

                {/* Steps */}
                <div className="flex justify-between">
                  {[
                    { label: "Negociacao", delay: "0s" },
                    { label: "Vistoria", delay: "0.6s" },
                    { label: "Pago", delay: "1.2s" },
                  ].map((step) => (
                    <div key={step.label} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full bg-[#10b981]/10 flex items-center justify-center step-pop"
                        style={{ animationDelay: step.delay }}
                      >
                        <svg className="w-3 h-3 text-[#10b981] step-check" style={{ animationDelay: step.delay }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-[#71717a] step-label" style={{ animationDelay: step.delay }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 lg:flex-none lg:w-[480px] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <Logo size="md" showText={false} />
            <div className="mt-3">
              <h1 className="text-xl font-bold text-[#fafafa]">
                Intermed<span className="text-[#10b981]">Cars</span>
              </h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#fafafa] mb-1">Entrar</h2>
          <p className="text-sm text-[#71717a] mb-6">
            Acesse a tua conta para continuar
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                Email ou Telefone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemplo@email.com"
                className="w-full mt-1.5 px-4 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/30 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="A tua palavra-passe"
                className="w-full mt-1.5 px-4 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]"
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#71717a]">
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
