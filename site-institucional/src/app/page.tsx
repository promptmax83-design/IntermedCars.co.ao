"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Logo from "@/components/logo";

/* ─── Animated Counter Hook ────────────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─── Data ─────────────────────────────────────────────── */
const highlights = [
  { icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Mediação profissional" },
  { icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Negociação segura" },
  { icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Vendedores verificados" },
  { icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Compradores verificados" },
  { icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Processo transparente" },
];

const steps = [
  { num: "01", title: "Criar conta", desc: "Registe-se gratuitamente em poucos segundos." },
  { num: "02", title: "Publicar ou procurar veículo", desc: "Anuncie o seu ou encontre o ideal." },
  { num: "03", title: "Iniciar mediação", desc: "O IntermedCars acompanha a negociação." },
  { num: "04", title: "Negociação acompanhada", desc: "Propostas, contratos e vistoria integrados." },
  { num: "05", title: "Conclusão do negócio", desc: "Entrega segura e documentação em ordem." },
];

const securityPillars = [
  { icon: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z", title: "Identidade verificada" },
  { icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", title: "Histórico de negociações" },
  { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", title: "Auditoria" },
  { icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155", title: "Suporte humano" },
  { icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z", title: "Proteção contra fraude" },
];

const stats = [
  { label: "Veículos anunciados", value: 1240 },
  { label: "Negócios realizados", value: 380 },
  { label: "Utilizadores registados", value: 4500 },
  { label: "Taxa de satisfação", value: 98, suffix: "%" },
];

const testimonials = [
  { name: "Carlos Mendes", role: "Comprador", text: "Comprei o meu BMW 520i de forma muito segura. O IntermedCards acompanhou todo o processo.", rating: 5 },
  { name: "Ana Ferreira", role: "Vendedora", text: "Vendi o meu Toyota em menos de uma semana. A mediação fez toda a diferença.", rating: 5 },
  { name: "Pedro Santos", role: "Comprador", text: "Excelente plataforma. Transparente, organizada e profissional. Recomendo.", rating: 5 },
];

const faqs = [
  { q: "O IntermedCars cobra comissão do comprador?", a: "Não. O comprador não paga nenhuma comissão obrigatória. Pode deixar uma gratificação voluntária se desejar." },
  { q: "Como funciona a taxa de mediação?", a: "O vendedor paga uma taxa fixa de 100.000 Kz por negócio concluído. O pagamento é feito diretamente ao IntermedCars." },
  { q: "O pagamento do veículo é feito pela plataforma?", a: "Não. O pagamento é feito diretamente entre comprador e vendedor. O IntermedCars apenas media e acompanha o negócio." },
  { q: "Como são verificados os utilizadores?", a: "Cada utilizador passa por verificação de identidade com BI, selfie e dados pessoais. Garantimos segurança em cada transação." },
  { q: "O que acontece se o vendedor não pagar a taxa?", a: "Após 72 horas é enviado um aviso. Após 7 dias sem pagamento, a conta é suspensa automaticamente." },
];

/* ─── Component ────────────────────────────────────────── */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const stat1 = useCounter(stats[0].value);
  const stat2 = useCounter(stats[1].value);
  const stat3 = useCounter(stats[2].value);
  const stat4 = useCounter(stats[3].value);
  const counters = [stat1, stat2, stat3, stat4];

  return (
    <div className="min-h-screen bg-[#060608]">
      {/* ═══ HEADER ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#060608]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="sm" theme="dark" />
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#como-funciona" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Como Funciona</a>
            <a href="#servicos" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Serviços</a>
            <a href="#seguranca" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Ajuda</a>
            <a href="#contactos" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Contactos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">
              Entrar
            </Link>
            <Link href="/registo" className="px-4 py-2 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] text-[13px] font-semibold rounded-lg transition-all">
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold text-[#fafafa] leading-tight mb-6">
                Negocie o seu próximo veículo{" "}
                <span className="text-[#f59e0b]">com confiança.</span>
              </h1>
              <p className="text-[15px] lg:text-base text-[#71717a] leading-relaxed mb-8 max-w-lg">
                O IntermedCars liga compradores e vendedores através de uma mediação profissional, tornando cada negociação mais segura, organizada e transparente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/explorar" className="px-6 py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] text-sm font-semibold rounded-xl transition-all text-center">
                  Procurar Veículos
                </Link>
                <Link href="/anunciar" className="px-6 py-3 bg-white/[0.04] border border-white/[0.06] hover:border-[#f59e0b]/40 text-[#fafafa] text-sm font-semibold rounded-xl transition-all text-center">
                  Anunciar Veículo
                </Link>
              </div>
            </div>

            {/* Right — Mosaic Grid */}
            <div className="grid grid-cols-3 grid-rows-3 gap-3 h-[320px] lg:h-[400px]">
              {/* Large tile */}
              <div className="col-span-2 row-span-2 rounded-2xl bg-gradient-to-br from-[#10b981]/10 to-[#060608] border border-white/[0.04] flex items-center justify-center overflow-hidden">
                <div className="text-center p-6">
                  <svg className="w-12 h-12 text-[#10b981] mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-sm font-medium text-[#71717a]">Mediação Automóvel</p>
                </div>
              </div>
              {/* Small tiles */}
              <div className="rounded-2xl bg-[#f59e0b]/5 border border-white/[0.04] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#f59e0b]/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="rounded-2xl bg-[#10b981]/5 border border-white/[0.04] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#10b981]/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#52525b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#52525b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HIGHLIGHTS ═══ */}
      <section className="py-12 border-y border-white/[0.04]" id="servicos">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.04]">
                <div className="w-9 h-9 rounded-lg bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={h.icon} />
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-slate-800">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section className="py-20 lg:py-28" id="como-funciona">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-medium text-[#f59e0b] uppercase tracking-widest mb-3">Processo</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">Como Funciona</h2>
            <p className="text-[15px] text-slate-500 max-w-md mx-auto">Do registo à entrega, acompanhamos cada etapa.</p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.06]" />

            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.num} className="flex items-start gap-6 relative">
                  <div className="w-12 h-12 rounded-full bg-[#060608] border-2 border-[#f59e0b] flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-[13px] font-bold text-[#f59e0b]">{s.num}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-[15px] font-semibold text-slate-800 mb-1">{s.title}</h3>
                    <p className="text-[13px] text-[#71717a]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SEGURANÇA ═══ */}
      <section className="py-20 lg:py-28 bg-white" id="seguranca">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-medium text-[#10b981] uppercase tracking-widest mb-3">Pilares</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">Segurança em Primeiro Lugar</h2>
            <p className="text-[15px] text-slate-500 max-w-md mx-auto">A confiança é a nossa maior moeda.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {securityPillars.map((p) => (
              <div key={p.title} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.04] hover:border-[#10b981]/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={p.icon} />
                  </svg>
                </div>
                <h3 className="text-[14px] font-semibold text-slate-800">{p.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ESTATÍSTICAS ═══ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={s.label} ref={counters[i].ref} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-slate-800 mb-1">
                  {counters[i].count.toLocaleString("pt-AO")}{s.suffix || ""}
                </p>
                <p className="text-[13px] text-[#71717a]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEPOIMENTOS ═══ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-medium text-[#f59e0b] uppercase tracking-widest mb-3">Depoimentos</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">O que dizem os nossos utilizadores</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.04]">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{t.name}</p>
                  <p className="text-[12px] text-[#52525b]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-medium text-[#10b981] uppercase tracking-widest mb-3">Ajuda</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] border border-white/[0.04] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-[14px] font-medium text-slate-800 pr-4">{f.q}</span>
                  <svg className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-[13px] text-slate-500 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 text-center">
          <div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-[#10b981]/10 via-[#060608] to-[#f59e0b]/5 border border-white/[0.04]">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
              Pronto para começar?
            </h2>
            <p className="text-[15px] text-slate-500 mb-8 max-w-md mx-auto">
              Junte-se a milhares de compradores e vendedores em Angola.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/registo" className="px-8 py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] text-sm font-semibold rounded-xl transition-all">
                Criar Conta Grátis
              </Link>
              <Link href="/explorar" className="px-8 py-3 bg-white/[0.04] border border-white/[0.06] hover:border-[#f59e0b]/40 text-slate-800 text-sm font-semibold rounded-xl transition-all">
                Explorar Veículos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.04] py-12" id="contactos">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
          <Logo size="sm" theme="dark" />
              <p className="text-[13px] text-[#71717a] mt-4 leading-relaxed">
                Plataforma de mediação automóvel em Angola. Segurança e confiança em cada negócio.
              </p>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-[#fafafa] uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li><Link href="/explorar" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Explorar Veículos</Link></li>
                <li><Link href="/anunciar" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Anunciar Veículo</Link></li>
                <li><Link href="/servicos" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Serviços</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-[#fafafa] uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="text-[13px] text-[#71717a] hover:text-[#fafafa] transition-colors">Termos de Utilização</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-[#fafafa] uppercase tracking-wider mb-4">Contactos</h4>
              <ul className="space-y-2">
                <li className="text-[13px] text-[#71717a]">info@intermedcars.co.ao</li>
                <li className="text-[13px] text-[#71717a]">+244 923 456 789</li>
                <li className="text-[13px] text-[#71717a]">Luanda, Angola</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-8 text-center">
            <p className="text-[12px] text-[#52525b]">
              © 2026 IntermedCars. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
