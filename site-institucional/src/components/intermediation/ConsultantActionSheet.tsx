"use client";

import { useState } from "react";

interface ConsultantActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onChat: () => void;
  onSms: () => void;
  onCall: () => void;
  consultantName: string;
  consultantPhone?: string;
}

export default function ConsultantActionSheet({
  isOpen,
  onClose,
  onChat,
  onSms,
  onCall,
  consultantName,
  consultantPhone,
}: ConsultantActionSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl p-6 animate-in slide-in-from-bottom-4 shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        <h3 className="text-lg font-bold text-slate-800 mb-1">
          Contactar Consultor
        </h3>
        <p className="text-[13px] text-slate-500 mb-6">
          {consultantName} — como deseja contactar?
        </p>

        <div className="space-y-3">
          {/* Chat */}
          <button
            onClick={() => { onChat(); onClose(); }}
            className="w-full flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#10b981]/40 hover:bg-[#10b981]/5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A1.875 1.875 0 015.625 3h12.75A1.875 1.875 0 0120.25 4.875v10.5a1.875 1.875 0 01-1.875 1.875H5.625A1.875 1.875 0 013.75 20.105z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Chat na App</p>
              <p className="text-[12px] text-slate-500">Sala síncrona tripartida</p>
            </div>
          </button>

          {/* SMS */}
          <button
            onClick={() => { onSms(); onClose(); }}
            className="w-full flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#f59e0b]/40 hover:bg-[#f59e0b]/5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">SMS de Alerta</p>
              <p className="text-[12px] text-slate-500">Enviar link para o painel</p>
            </div>
          </button>

          {/* Chamada */}
          <a
            href={consultantPhone ? `tel:+244${consultantPhone.replace(/\D/g, '')}` : undefined}
            onClick={() => { onCall(); onClose(); }}
            className="w-full flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#0ea5e9]/40 hover:bg-[#0ea5e9]/5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#0ea5e9]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Chamada de Voz</p>
              <p className="text-[12px] text-slate-500">Ligar direto ao consultor</p>
            </div>
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 text-slate-500 text-[13px] hover:text-slate-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
