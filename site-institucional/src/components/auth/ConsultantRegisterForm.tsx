"use client";

import { useState, useEffect, useTransition } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando-Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Icolo e Bengo", "Luanda", "Luanda Norte", "Luanda Sul",
  "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe",
  "Uíge", "Zaire"
];

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

type RegMethod = "choose" | "email" | "phone";
type Step = "form" | "verify" | "done";

export default function ConsultantRegisterForm({ onBack, onSuccess }: Props) {
  const [regMethod, setRegMethod] = useState<RegMethod>("choose");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telemovel: "",
    zona: "",
    password: "",
    confirmarPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [verifyMethod, setVerifyMethod] = useState<"email" | "phone">("email");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nome || !form.password || !form.confirmarPassword || !form.zona) {
      setError("Preencha todos os campos obrigatorios");
      return;
    }

    if (regMethod === "email" && !form.email) {
      setError("Insira o teu email");
      return;
    }

    if (regMethod === "phone" && !form.telemovel) {
      setError("Insira o teu telemovel");
      return;
    }

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

  const sendVerificationCode = async () => {
    setSendingCode(true);
    setCodeError(null);
    setCode("");
    const value = verifyMethod === "email" ? form.email : form.telemovel;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: verifyMethod, value, purpose: "registration" }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        throw new Error(data.message || "Erro ao enviar codigo");
      }

      setCodeSent(true);
      setCountdown(60);
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        setCodeError("Servidor indisponivel. Verifica se o backend esta a correr em localhost:8080 e tenta novamente.");
      } else {
        setCodeError(err instanceof Error ? err.message : "Erro ao enviar codigo. Verifica se o backend esta a correr.");
      }
    } finally {
      setSendingCode(false);
    }
  };

  useEffect(() => {
    if (step === "verify" && !codeSent) {
      startTransition(() => { sendVerificationCode(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, codeSent, verifyMethod, form.email, form.telemovel]);

  const handleVerifyCode = async () => {
    setVerifyingCode(true);
    setCodeError(null);
    const value = verifyMethod === "email" ? form.email : form.telemovel;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: verifyMethod, value, code, purpose: "registration" }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        throw new Error(data.message || "Codigo invalido");
      }

      setVerified(true);
      setTimeout(() => registerUser(), 1000);
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        setCodeError("Servidor indisponivel. Tenta novamente.");
      } else {
        setCodeError(err instanceof Error ? err.message : "Codigo invalido");
      }
    } finally {
      setVerifyingCode(false);
    }
  };

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
          password: form.password,
          bi_passaporte: "PENDENTE",
          role: "consultor",
          zona: form.zona,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Erro ao criar conta");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const maskValue = (value: string, type: "email" | "phone") => {
    if (type === "email") {
      const [name, domain] = value.split("@");
      if (!domain) return value;
      return `${name.slice(0, 2)}***@${domain}`;
    }
    if (value.length <= 4) return `***${value}`;
    return `${value.slice(0, 3)}****${value.slice(-2)}`;
  };

  const canSubmit =
    form.nome &&
    form.zona &&
    form.password &&
    form.confirmarPassword &&
    (regMethod === "email" ? form.email : form.telemovel);

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-[13px] text-[#ef4444]">
          {error}
        </div>
      )}

      {/* STEP: Choose Method */}
      {step === "form" && regMethod === "choose" && (
        <div>
          <button
            onClick={onBack}
            className="text-[12px] text-slate-500 hover:text-slate-800 transition-colors mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Voltar
          </button>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Criar Conta Consultor</h2>
          <p className="text-[13px] text-slate-500 mb-8">
            Escolhe como queres registar-te.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setRegMethod("email")}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#10b981]/40 hover:bg-[#10b981]/5 transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Usar Email</p>
                <p className="text-[12px] text-slate-500">Regista-te com o teu endereco de email</p>
              </div>
            </button>

            <button
              onClick={() => setRegMethod("phone")}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#10b981]/40 hover:bg-[#10b981]/5 transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Usar Telemovel</p>
                <p className="text-[12px] text-slate-500">Regista-te com o teu numero de telefone</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP: Form */}
      {step === "form" && (regMethod === "email" || regMethod === "phone") && (
        <div>
          <button
            onClick={() => setRegMethod("choose")}
            className="text-[12px] text-slate-500 hover:text-slate-800 transition-colors mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Voltar
          </button>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Criar Conta com {regMethod === "email" ? "Email" : "Telemovel"}
          </h2>
          <p className="text-[13px] text-slate-500 mb-6">
            Preenche os teus dados para comecar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Joao Silva"
                className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
              />
            </div>

            {regMethod === "email" && (
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@exemplo.com"
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                />
              </div>
            )}

            {regMethod === "phone" && (
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Telemovel
                </label>
                <input
                  type="tel"
                  name="telemovel"
                  value={form.telemovel}
                  onChange={handleChange}
                  required
                  placeholder="9XX XXX XXX"
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Zona de Atuacao
              </label>
              <select
                name="zona"
                value={form.zona}
                onChange={handleChange}
                required
                className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-[#10b981]/40 transition-colors appearance-none"
              >
                <option value="">Selecione a provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
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
                  className="w-full mt-1.5 px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-slate-400 hover:text-slate-500 transition-colors"
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
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
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
                  className="w-full mt-1.5 px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none focus:border-[#10b981]/40 transition-colors"
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
        </div>
      )}

      {/* STEP: Verify Code */}
      {step === "verify" && (
        <div>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${verified ? "bg-[#10b981]/10" : "bg-slate-50"}`}>
              {verified ? (
                <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {verified ? "Verificado!" : "Codigo de Verificacao"}
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              {verified
                ? "Codigo confirmado com sucesso"
                : `Enviamos um codigo de 6 digitos para ${maskValue(verifyMethod === "email" ? form.email : form.telemovel, verifyMethod)}`}
            </p>
          </div>

          {!verified && (
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Codigo de 6 digitos
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 text-center tracking-[0.5em] font-mono outline-none focus:border-[#10b981]/40 transition-colors"
                />
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Em modo desenvolvimento, qualquer codigo de 6 digitos e aceite.
                </p>
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
                  <p className="text-[12px] text-slate-400">Reenviar em {countdown}s</p>
                ) : (
                  <button
                    onClick={() => { setCodeSent(false); sendVerificationCode(); }}
                    disabled={sendingCode}
                    className="text-[12px] text-[#10b981] hover:underline disabled:opacity-50"
                  >
                    {sendingCode ? "A enviar..." : "Reenviar codigo"}
                  </button>
                )}
              </div>

              <button
                onClick={() => { setStep("form"); setCodeSent(false); setCode(""); }}
                className="w-full py-2 text-slate-500 text-[12px] hover:text-slate-800 transition-colors"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
