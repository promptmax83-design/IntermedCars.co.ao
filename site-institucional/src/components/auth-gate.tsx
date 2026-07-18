"use client";
import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthGate() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Logo size="lg" showText={false} />
          <p className="text-sm text-slate-500 mt-2">
            Plataforma de mobilidade inteligente
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full py-3.5 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]"
          >
            Entrar
          </Link>
          <Link
            href="/registo"
            className="block w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 transition-all duration-200"
          >
            Criar Conta
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 mt-8">
          Compre e venda veiculos de forma segura em Angola
        </p>
      </div>
    </div>
  );
}
