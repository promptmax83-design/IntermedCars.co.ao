"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Step = "register" | "verify" | "kyc" | "success";
type RegMethod = "choose" | "email" | "phone";

export default function RegistoPage() {
  const [step, setStep] = useState<Step>("register");
  const [regMethod, setRegMethod] = useState<RegMethod>("choose");
  const [verifyMethod, setVerifyMethod] = useState<"email" | "phone">("email");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telemovel: "",
    bi_passaporte: "",
    password: "",
    confirmarPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Submit form → go to verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmarPassword) {
      setError("As passwords nao coincidem");
      return;
    }

    if (form.password.length < 8) {
      setError("Password deve ter minimo 8 caracteres");
      return;
    }

    setVerifyMethod(regMethod as "email" | "phone");
    setStep("verify");
  };

  // Send verification code
  const sendVerificationCode = async () => {
    setSendingCode(true);
    setCodeError(null);
    setCode("");
    const value = verifyMethod === "email" ? form.email : form.telemovel;

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: verifyMethod, value, purpose: "registration" }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        throw new Error(data.message || "Erro ao enviar codigo");
      }

      setCodeSent(true);
      setCountdown(60);
      if (data.debug_code) {
        setDebugCode(data.debug_code);
      }
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Erro ao enviar codigo");
    } finally {
      setSendingCode(false);
    }
  };

  // Auto-send code when entering verify step
  useEffect(() => {
    if (step === "verify" && !codeSent) {
      sendVerificationCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Verify code
  const handleVerifyCode = async () => {
    setVerifyingCode(true);
    setCodeError(null);
    const value = verifyMethod === "email" ? form.email : form.telemovel;

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: verifyMethod, value, code, purpose: "registration" }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        throw new Error(data.message || "Codigo invalido");
      }

      setVerified(true);
      setTimeout(() => registerUser(), 1000);
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Codigo invalido");
    } finally {
      setVerifyingCode(false);
    }
  };

  // Register user
  const registerUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email || `${form.telemovel}@intermedcars.local`,
          telemovel: form.telemovel || "",
          bi_passaporte: form.bi_passaporte,
          password: form.password,
          reg_method: verifyMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Erro ao criar conta");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user_id,
          nome: form.nome,
          email: form.email,
          verificado: false,
        })
      );

      setStep("kyc");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  // Mask value for display
  const maskValue = (value: string, type: "email" | "phone") => {
    if (type === "email") {
      const [name, domain] = value.split("@");
      if (!domain) return value;
      return `${name.slice(0, 2)}***@${domain}`;
    }
    if (value.length <= 4) return `***${value}`;
    return `${value.slice(0, 3)}****${value.slice(-2)}`;
  };

  const canSubmit = form.nome && form.bi_passaporte && form.password && form.confirmarPassword && (form.email || form.telemovel);

  return (
    <div className="min-h-screen bg-[#060608] flex">
      {/* LEFT — Visual Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.1)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.05)_0%,transparent_50%)]" />

        <div className="relative z-10 max-w-lg px-12">
          <div className="mb-10">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold text-[#fafafa] mt-6">
              Junte-se ao <span className="text-[#10b981]">IntermedCars</span>
            </h1>
            <p className="text-[15px] text-[#71717a] mt-3 leading-relaxed">
              Crie a sua conta gratuita e comece a negociar veiculos de forma segura.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#fafafa]">Registo Rapido</p>
                <p className="text-[12px] text-[#71717a]">Crie a sua conta em menos de 2 minutos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#fafafa]">Identidade Verificada</p>
                <p className="text-[12px] text-[#71717a]">BI e selfie para garantir seguranca</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#fafafa]">Plataforma Segura</p>
                <p className="text-[12px] text-[#71717a]">Os seus dados estao protegidos</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-2 text-[12px] text-[#52525b]">
            <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Milhares de utilizadores ja confiam no IntermedCars</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className="flex-1 lg:flex-none lg:w-[520px] flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <Logo size="md" />
          </div>

          {step !== "register" && (
            <div className="flex items-center gap-2 mb-6">
              {(["register", "verify", "kyc"] as Step[]).map((s) => {
                const steps = ["register", "verify", "kyc"];
                const currentIdx = steps.indexOf(step);
                const thisIdx = steps.indexOf(s);
                return (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      thisIdx < currentIdx
                        ? "bg-[#10b981]"
                        : thisIdx === currentIdx
                        ? "bg-[#10b981]/50"
                        : "bg-white/[0.06]"
                    }`}
                  />
                );
              })}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-[13px] text-[#ef4444]">
              {error}
            </div>
          )}

          {/* STEP: Choose Method */}
          {step === "register" && regMethod === "choose" && (
            <div>
              <h2 className="text-2xl font-bold text-[#fafafa] mb-1">Criar Conta</h2>
              <p className="text-[13px] text-[#71717a] mb-8">
                Escolhe como queres registar-te.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setRegMethod("email")}
                  className="w-full flex items-center gap-4 p-4 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:border-[#10b981]/40 hover:bg-[#10b981]/5 transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#fafafa]">Usar Email</p>
                    <p className="text-[12px] text-[#71717a]">Regista-te com o teu endereco de email</p>
                  </div>
                </button>

                <button
                  onClick={() => setRegMethod("phone")}
                  className="w-full flex items-center gap-4 p-4 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:border-[#10b981]/40 hover:bg-[#10b981]/5 transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#fafafa]">Usar Telemovel</p>
                    <p className="text-[12px] text-[#71717a]">Regista-te com o teu numero de telefone</p>
                  </div>
                </button>
              </div>

              <p className="text-center text-[13px] text-[#71717a] mt-8">
                Ja tens conta?{" "}
                <Link href="/login" className="text-[#10b981] font-semibold hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          )}

          {/* STEP: Form */}
          {step === "register" && (regMethod === "email" || regMethod === "phone") && (
            <div>
              <button
                onClick={() => setRegMethod("choose")}
                className="text-[12px] text-[#71717a] hover:text-[#fafafa] transition-colors mb-4 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Voltar
              </button>

              <h2 className="text-2xl font-bold text-[#fafafa] mb-1">
                Criar Conta com {regMethod === "email" ? "Email" : "Telemovel"}
              </h2>
              <p className="text-[13px] text-[#71717a] mb-6">
                Preenche os teus dados para comecar.
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

                {regMethod === "email" && (
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
                )}

                {regMethod === "phone" && (
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
                      placeholder="9XX XXX XXX"
                      className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                    />
                  </div>
                )}

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

                <div>
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Minimo 8 caracteres"
                      className="w-full mt-1.5 px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-[#52525b] hover:text-[#71717a] transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                    Confirmar Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmarPassword"
                      value={form.confirmarPassword}
                      onChange={handleChange}
                      required
                      placeholder="Repete a password"
                      className="w-full mt-1.5 px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                    />
                  </div>
                </div>

                {form.confirmarPassword && form.password !== form.confirmarPassword && (
                  <p className="text-[11px] text-[#ef4444] -mt-2">As passwords nao coincidem</p>
                )}
                {form.confirmarPassword && form.password === form.confirmarPassword && form.password.length >= 8 && (
                  <p className="text-[11px] text-[#10b981] -mt-2">Passwords coincidem</p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "A processar..." : "Continuar"}
                </button>
              </form>

              <p className="text-center text-[13px] text-[#71717a] mt-6">
                Ja tens conta?{" "}
                <Link href="/login" className="text-[#10b981] font-semibold hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          )}

          {/* STEP: Verify Code */}
          {step === "verify" && (
            <div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${verified ? "bg-[#10b981]/10" : "bg-white/[0.04]"}`}>
                  {verified ? (
                    <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-[#71717a]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#fafafa]">
                  {verified ? "Verificado!" : "Codigo de Verificacao"}
                </h2>
                <p className="text-[13px] text-[#71717a] mt-1">
                  {verified
                    ? "Codigo confirmado com sucesso"
                    : `Enviamos um codigo de 6 digitos para ${maskValue(verifyMethod === "email" ? form.email : form.telemovel, verifyMethod)}`}
                </p>

                {!verified && debugCode && (
                  <div className="mt-4 p-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl">
                    <p className="text-[11px] font-medium text-[#c9a84c] uppercase tracking-wider mb-1">
                      Modo Desenvolvimento
                    </p>
                    <p className="text-2xl font-mono font-bold text-[#c9a84c] tracking-[0.3em]">
                      {debugCode}
                    </p>
                    <p className="text-[11px] text-[#c9a84c]/60 mt-1">
                      Copia este codigo e clica em &quot;Verificar Codigo&quot;
                    </p>
                  </div>
                )}
              </div>

              {!verified && (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                      Codigo de 6 digitos
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full mt-1.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] text-center tracking-[0.5em] font-mono outline-none focus:border-[#10b981]/40 transition-colors"
                    />
                  </div>

                  {codeError && (
                    <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-[13px] text-[#ef4444] text-center">
                      {codeError}
                    </div>
                  )}

                  <button
                    onClick={handleVerifyCode}
                    disabled={code.length !== 6 || verifyingCode}
                    className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingCode ? "A verificar..." : "Verificar Codigo"}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-[12px] text-[#52525b]">Reenviar em {countdown}s</p>
                    ) : (
                      <button
                        onClick={() => { setCodeSent(false); setDebugCode(null); sendVerificationCode(); }}
                        disabled={sendingCode}
                        className="text-[12px] text-[#10b981] hover:underline disabled:opacity-50"
                      >
                        {sendingCode ? "A enviar..." : "Reenviar codigo"}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => { setStep("register"); setCodeSent(false); setCode(""); setDebugCode(null); }}
                    className="w-full py-2 text-[#71717a] text-[12px] hover:text-[#fafafa] transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP: KYC */}
          {step === "kyc" && (
            <KycStep
              onComplete={() => setStep("success")}
              onSkip={() => setStep("success")}
            />
          )}

          {/* STEP: Success */}
          {step === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[#fafafa] mb-2">Conta Criada!</h1>
              <p className="text-[13px] text-[#71717a] mb-6">
                A tua conta foi criada com sucesso. Podes comecar a explorar o marketplace.
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
    </div>
  );
}

/* KYC Step */
function KycStep({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [kycStep, setKycStep] = useState<"bi" | "selfie" | "processing">("bi");
  const [biFrenteFile, setBiFrenteFile] = useState<File | null>(null);
  const [biVersoFile, setBiVersoFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [biFrentePreview, setBiFrentePreview] = useState<string | null>(null);
  const [biVersoPreview, setBiVersoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const handleFile = (side: "frente" | "verso", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (side === "frente") { setBiFrenteFile(file); setBiFrentePreview(ev.target?.result as string); }
      else { setBiVersoFile(file); setBiVersoPreview(ev.target?.result as string); }
    };
    reader.readAsDataURL(file);
  };

  const handleSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSelfiePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFile = async (endpoint: string, file: File) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "Erro ao carregar"); }
  };

  const handleBi = async () => {
    if (!biFrenteFile || !biVersoFile) return;
    setUploading(true); setKycError(null);
    try {
      await uploadFile("/api/auth/upload-bi-frente", biFrenteFile);
      await uploadFile("/api/auth/upload-bi-verso", biVersoFile);
      setKycStep("selfie");
    } catch (err) { setKycError(err instanceof Error ? err.message : "Erro"); }
    finally { setUploading(false); }
  };

  const handleSelfieAndProcess = async () => {
    if (!selfieFile) return;
    setKycStep("processing"); setKycError(null);
    try {
      await uploadFile("/api/auth/upload-selfie", selfieFile);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/auth/process-kyc`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "Erro KYC"); }
      setTimeout(() => onComplete(), 2000);
    } catch (err) { setKycError(err instanceof Error ? err.message : "Erro"); setKycStep("selfie"); }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#fafafa] mb-1">Verificacao de Identidade</h1>
      <p className="text-[13px] text-[#71717a] mb-6">Valida o teu BI e rosto para acesso completo.</p>

      {kycError && <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-[13px] text-[#ef4444]">{kycError}</div>}

      <div className="flex items-center gap-2 mb-6">
        {["bi", "selfie", "processing"].map((s) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${(s === "bi" && kycStep === "bi") || (s === "selfie" && (kycStep === "selfie" || kycStep === "processing")) || (s === "processing" && kycStep === "processing") ? "bg-[#10b981]" : "bg-white/[0.06]"}`} />
          </div>
        ))}
      </div>

      {kycStep === "bi" && (
        <div className="space-y-4">
          <p className="text-[12px] text-[#a1a1aa] font-medium">Passo 1: Bilhete de Identidade</p>
          {["frente", "verso"].map((side) => (
            <div key={side}>
              <label className="text-[11px] text-[#71717a] uppercase tracking-wider">{side === "frente" ? "Frente do BI" : "Verso do BI"}</label>
              <div className="mt-1.5">
                <input type="file" accept="image/*" onChange={(e) => handleFile(side as "frente" | "verso", e)} className="hidden" id={`bi-${side}`} />
                <label htmlFor={`bi-${side}`} className={`flex items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${(side === "frente" ? biFrentePreview : biVersoPreview) ? "border-[#10b981]/40 bg-[#10b981]/5" : "border-white/[0.08] bg-white/[0.02] hover:border-[#10b981]/30"}`}>
                  {(side === "frente" ? biFrentePreview : biVersoPreview) ? (
                    <div className="flex items-center gap-2 text-[#10b981]"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-[12px] font-medium">Carregado</span></div>
                  ) : (
                    <div className="text-center"><svg className="w-8 h-8 text-[#52525b] mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg><p className="text-[11px] text-[#71717a]">Toque para selecionar</p></div>
                  )}
                </label>
              </div>
            </div>
          ))}
          <button onClick={handleBi} disabled={!biFrenteFile || !biVersoFile || uploading} className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed">
            {uploading ? "A carregar..." : "Continuar"}
          </button>
          <button onClick={onSkip} className="w-full py-2 text-[#71717a] text-[12px] hover:text-[#fafafa]">Verificar depois</button>
        </div>
      )}

      {kycStep === "selfie" && (
        <div className="space-y-4">
          <p className="text-[12px] text-[#a1a1aa] font-medium">Passo 2: Reconhecimento Facial</p>
          <div className="flex flex-col items-center">
            <div className="relative w-56 h-56 rounded-full border-4 border-[#10b981]/40 bg-[#0d0d10] flex items-center justify-center overflow-hidden">
              {selfiePreview ? (<img src={selfiePreview} alt="Selfie" className="w-full h-full rounded-full object-cover" />) : (
                <div className="text-center"><svg className="w-16 h-16 text-[#27272a] mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg></div>
              )}
            </div>
          </div>
          <input type="file" accept="image/*" capture="user" onChange={handleSelfie} className="hidden" id="selfie-input" />
          <label htmlFor="selfie-input" className="block w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl text-center cursor-pointer">
            {selfiePreview ? "Trocar Selfie" : "Tirar Selfie"}
          </label>
          {selfieFile && <button onClick={handleSelfieAndProcess} className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl">Confirmar e Verificar</button>}
          <button onClick={onSkip} className="w-full py-2 text-[#71717a] text-[12px] hover:text-[#fafafa]">Verificar depois</button>
        </div>
      )}

      {kycStep === "processing" && (
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 rounded-full border-4 border-[#10b981] border-t-transparent animate-spin mb-4" />
          <p className="text-[14px] text-[#fafafa] font-medium">A verificar identidade...</p>
          <p className="text-[12px] text-[#71717a] mt-1">Isto demora apenas alguns segundos</p>
        </div>
      )}
    </div>
  );
}
