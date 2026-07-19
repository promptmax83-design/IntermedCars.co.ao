"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import AccountTypeChoice from "@/components/auth/AccountTypeChoice";
import PermanentChoiceModal from "@/components/auth/PermanentChoiceModal";
import ClientRegisterForm from "@/components/auth/ClientRegisterForm";
import ConsultantRegisterForm from "@/components/auth/ConsultantRegisterForm";

type FlowStep = "choice" | "confirm" | "form" | "success";

export default function RegistoPage() {
  const [step, setStep] = useState<FlowStep>("choice");
  const [chosenType, setChosenType] = useState<"cliente" | "consultor" | null>(null);

  const handleSelectType = (type: "cliente" | "consultor") => {
    setChosenType(type);
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("form");
  };

  const handleFormBack = () => {
    setStep("choice");
  };

  const handleFormSuccess = () => {
    setStep("success");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Conta Criada!</h1>
          <p className="text-[13px] text-slate-500 mb-6">
            A tua conta foi criada com sucesso. Podes comecar a explorar o marketplace.
          </p>
          <Link
            href="/feed"
            className="inline-block w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200"
          >
            Ir para o Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* LEFT — Visual Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.1)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.05)_0%,transparent_50%)]" />

        <div className="relative z-10 max-w-lg px-12">
          <div className="mb-10">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold text-slate-800 mt-6">
              Junte-se ao <span className="text-[#10b981]">IntermedCars</span>
            </h1>
            <p className="text-[15px] text-slate-500 mt-3 leading-relaxed">
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
                <p className="text-[13px] font-semibold text-slate-800">Registo Rapido</p>
                <p className="text-[12px] text-slate-500">Crie a sua conta em menos de 2 minutos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Identidade Verificada</p>
                <p className="text-[12px] text-slate-500">BI e selfie para garantir seguranca</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Plataforma Segura</p>
                <p className="text-[12px] text-slate-500">Os seus dados estao protegidos</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-2 text-[12px] text-slate-400">
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

          {step === "choice" && (
            <AccountTypeChoice onSelect={handleSelectType} />
          )}

          {step === "confirm" && chosenType && (
            <PermanentChoiceModal
              type={chosenType}
              onConfirm={handleConfirm}
              onBack={handleFormBack}
            />
          )}

          {step === "form" && chosenType === "cliente" && (
            <ClientRegisterForm onBack={handleFormBack} onSuccess={handleFormSuccess} />
          )}

          {step === "form" && chosenType === "consultor" && (
            <ConsultantRegisterForm onBack={handleFormBack} onSuccess={handleFormSuccess} />
          )}

          <p className="text-center text-[13px] text-slate-500 mt-6">
            Ja tens conta?{" "}
            <Link href="/login" className="text-[#10b981] font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
