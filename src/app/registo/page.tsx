"use client";
import { useState } from "react";
import Link from "next/link";

type Step = "register" | "kyc" | "success";

export default function RegistoPage() {
  const [step, setStep] = useState<Step>("register");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telemovel: "",
    bi_passaporte: "",
    password: "",
    confirmarPassword: "",
    nome_pai: "",
    nome_mae: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmarPassword) {
      alert("As passwords nao coincidem");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("kyc");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#10b981" />
            <path d="M14 12h4v24h-4V12z" fill="#fff" />
            <path
              d="M34 12c-2.2 0-4.2.9-5.7 2.3l2.1 2.1c1-1 2.4-1.6 3.6-1.6 2.8 0 5 2.2 5 5s-2.2 5-5 5c-1.2 0-2.6-.6-3.6-1.6l-2.1 2.1C29.8 27.1 31.8 28 34 28c5 0 9-4 9-9s-4-9-9-9z"
              fill="#fff"
              opacity="0.9"
            />
          </svg>
          <span className="text-xl font-bold text-[#fafafa]">
            Intermed<span className="text-[#10b981]">Cars</span>
          </span>
        </Link>

        {/* Step 1: Register */}
        {step === "register" && (
          <div className="glass-card rounded-2xl p-6 lg:p-8">
            <h1 className="text-xl font-bold text-[#fafafa] mb-1">
              Criar Conta
            </h1>
            <p className="text-[13px] text-[#71717a] mb-6">
              Junta-te a milhares de compradores e vendedores em Angola.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Joao Silva"
                  className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@exemplo.com"
                  className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                    Telemovel
                  </label>
                  <input
                    type="tel"
                    name="telemovel"
                    value={form.telemovel}
                    onChange={handleChange}
                    required
                    placeholder="+244 9XX XXX XXX"
                    className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                    BI / Passaporte
                  </label>
                  <input
                    type="text"
                    name="bi_passaporte"
                    value={form.bi_passaporte}
                    onChange={handleChange}
                    required
                    placeholder="Minimo 9 caracteres"
                    minLength={9}
                    className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                    Nome do Pai
                  </label>
                  <input
                    type="text"
                    name="nome_pai"
                    value={form.nome_pai}
                    onChange={handleChange}
                    required
                    placeholder="Nome completo do pai"
                    className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                    Nome da Mae
                  </label>
                  <input
                    type="text"
                    name="nome_mae"
                    value={form.nome_mae}
                    onChange={handleChange}
                    required
                    placeholder="Nome completo da mae"
                    className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Minimo 8 caracteres"
                  className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                  Confirmar Password
                </label>
                <input
                  type="password"
                  name="confirmarPassword"
                  value={form.confirmarPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repete a password"
                  className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "A criar conta..." : "Criar Conta"}
              </button>
            </form>

            <p className="text-center text-[13px] text-[#71717a] mt-6">
              Ja tens conta?{" "}
              <Link href="/perfil" className="text-[#10b981] hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: KYC */}
        {step === "kyc" && (
          <KycStep
            onComplete={() => setStep("success")}
            onSkip={() => setStep("success")}
          />
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="glass-card rounded-2xl p-6 lg:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#10b981]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#fafafa] mb-2">
              Conta Criada!
            </h1>
            <p className="text-[13px] text-[#71717a] mb-6">
              A tua conta foi criada com sucesso. Podes comecar a explorar o
              marketplace.
            </p>
            <Link
              href="/"
              className="inline-block w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200"
            >
              Ir para o Feed
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── KYC Step Sub-component ─── */
function KycStep({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [kycStep, setKycStep] = useState<"bi" | "selfie" | "processing">("bi");
  const [biFrente, setBiFrente] = useState<string | null>(null);
  const [biVerso, setBiVerso] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const handleFileUpload = (
    side: "frente" | "verso",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (side === "frente") setBiFrente(result);
      else setBiVerso(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    // Simulate capture with a placeholder
    setSelfie(
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDYwNjA4IiBmb250LXNpemU9IjE0Ij5TZWxmaWU8L3RleHQ+PC9zdmc+",
    );
    setKycStep("processing");
    setTimeout(() => onComplete(), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8">
      <h1 className="text-xl font-bold text-[#fafafa] mb-1">
        Verificacao de Identidade
      </h1>
      <p className="text-[13px] text-[#71717a] mb-6">
        Para a tua seguranca, precisamos validar o teu BI e rosto. Isto garante
        acesso completo a plataforma.
      </p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {["bi", "selfie", "processing"].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                (s === "bi" && kycStep === "bi") ||
                (s === "selfie" &&
                  (kycStep === "selfie" || kycStep === "processing")) ||
                (s === "processing" && kycStep === "processing")
                  ? "bg-[#10b981]"
                  : "bg-white/[0.06]"
              }`}
            />
          </div>
        ))}
      </div>

      {/* BI Upload */}
      {kycStep === "bi" && (
        <div className="space-y-4">
          <p className="text-[12px] text-[#a1a1aa] font-medium">
            Passo 1: Bilhete de Identidade
          </p>

          {/* Frente */}
          <div>
            <label className="text-[11px] text-[#71717a] uppercase tracking-wider">
              Frente do BI
            </label>
            <div className="mt-1.5 relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload("frente", e)}
                className="hidden"
                id="bi-frente"
              />
              <label
                htmlFor="bi-frente"
                className={`flex items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  biFrente
                    ? "border-[#10b981]/40 bg-[#10b981]/5"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-[#10b981]/30 hover:bg-white/[0.04]"
                }`}
              >
                {biFrente ? (
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-[12px] font-medium">
                      Frente carregada
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 text-[#52525b] mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="text-[11px] text-[#71717a]">
                      Toque para selecionar
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Verso */}
          <div>
            <label className="text-[11px] text-[#71717a] uppercase tracking-wider">
              Verso do BI
            </label>
            <div className="mt-1.5 relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload("verso", e)}
                className="hidden"
                id="bi-verso"
              />
              <label
                htmlFor="bi-verso"
                className={`flex items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  biVerso
                    ? "border-[#10b981]/40 bg-[#10b981]/5"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-[#10b981]/30 hover:bg-white/[0.04]"
                }`}
              >
                {biVerso ? (
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-[12px] font-medium">
                      Verso carregado
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 text-[#52525b] mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="text-[11px] text-[#71717a]">
                      Toque para selecionar
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            onClick={() => biFrente && biVerso && setKycStep("selfie")}
            disabled={!biFrente || !biVerso}
            className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continuar
          </button>

          <button
            onClick={onSkip}
            className="w-full py-2 text-[#71717a] text-[12px] hover:text-[#fafafa] transition-colors"
          >
            Verificar depois
          </button>
        </div>
      )}

      {/* Selfie / Camera */}
      {kycStep === "selfie" && (
        <div className="space-y-4">
          <p className="text-[12px] text-[#a1a1aa] font-medium">
            Passo 2: Reconhecimento Facial
          </p>

          <div className="flex flex-col items-center">
            {/* Camera Circle */}
            <div className="relative w-56 h-56 rounded-full border-4 border-[#10b981]/40 bg-[#0d0d10] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-2 rounded-full border-2 border-[#10b981]/20" />
              {selfie ? (
                <div className="w-full h-full rounded-full bg-[#10b981]/10 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[#10b981]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-[#27272a] mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                    />
                  </svg>
                  <p className="text-[11px] text-[#52525b]">
                    Posiciona o rosto na moldura
                  </p>
                </div>
              )}
            </div>

            <p className="text-[12px] text-[#71717a] mt-4 text-center max-w-xs">
              Mantenha o rosto dentro da moldura. O reconhecimento e automatico.
            </p>
          </div>

          <button
            onClick={handleCapture}
            className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200"
          >
            {selfie ? "Confirmar Selfie" : "Tirar Selfie"}
          </button>

          <button
            onClick={onSkip}
            className="w-full py-2 text-[#71717a] text-[12px] hover:text-[#fafafa] transition-colors"
          >
            Verificar depois
          </button>
        </div>
      )}

      {/* Processing */}
      {kycStep === "processing" && (
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 rounded-full border-4 border-[#10b981] border-t-transparent animate-spin mb-4" />
          <p className="text-[14px] text-[#fafafa] font-medium">
            A verificar identidade...
          </p>
          <p className="text-[12px] text-[#71717a] mt-1">
            Isto demora apenas alguns segundos
          </p>
        </div>
      )}
    </div>
  );
}
