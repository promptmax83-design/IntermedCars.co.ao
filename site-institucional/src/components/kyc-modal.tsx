"use client";
import { useState } from "react";

type KycStep = "bi_frente" | "bi_verso" | "selfie" | "processing" | "done";

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function KycModal({
  isOpen,
  onClose,
  onComplete,
}: KycModalProps) {
  const [step, setStep] = useState<KycStep>("bi_frente");
  const [biFrente, setBiFrente] = useState<string | null>(null);
  const [biVerso, setBiVerso] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (
    side: "frente" | "verso",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (side === "frente") {
        setBiFrente(result);
        setTimeout(() => setStep("bi_verso"), 500);
      } else {
        setBiVerso(result);
        setTimeout(() => setStep("selfie"), 500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("done");
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    }, 2500);
  };

  const progressPct =
    step === "bi_frente"
      ? 0
      : step === "bi_verso"
        ? 33
        : step === "selfie"
          ? 66
          : step === "processing"
            ? 90
            : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#060608]/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[#71717a] hover:text-[#fafafa] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-lg font-bold text-[#fafafa] mb-1">
          Verificacao de Identidade
        </h2>
        <p className="text-[12px] text-[#71717a] mb-4">
          Confirma a tua identidade para desbloquear todas as funcionalidades.
        </p>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/[0.06] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#10b981] to-[#10b981]/70 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step: BI Frente */}
        {step === "bi_frente" && (
          <div className="space-y-4">
            <p className="text-[11px] text-[#a1a1aa] font-medium uppercase tracking-wider">
              Frente do BI
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload("frente", e)}
              className="hidden"
              id="kyc-bi-frente"
            />
            <label
              htmlFor="kyc-bi-frente"
              className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                biFrente
                  ? "border-[#10b981]/40 bg-[#10b981]/5"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-[#10b981]/30"
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
                    Frente capturada
                  </span>
                </div>
              ) : (
                <>
                  <svg
                    className="w-10 h-10 text-[#52525b] mb-2"
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
                  <p className="text-[12px] text-[#71717a]">
                    Toque para selecionar
                  </p>
                  <p className="text-[10px] text-[#52525b] mt-1">
                    JPG, PNG ou PDF
                  </p>
                </>
              )}
            </label>
          </div>
        )}

        {/* Step: BI Verso */}
        {step === "bi_verso" && (
          <div className="space-y-4">
            <p className="text-[11px] text-[#a1a1aa] font-medium uppercase tracking-wider">
              Verso do BI
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload("verso", e)}
              className="hidden"
              id="kyc-bi-verso"
            />
            <label
              htmlFor="kyc-bi-verso"
              className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                biVerso
                  ? "border-[#10b981]/40 bg-[#10b981]/5"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-[#10b981]/30"
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
                    Verso capturado
                  </span>
                </div>
              ) : (
                <>
                  <svg
                    className="w-10 h-10 text-[#52525b] mb-2"
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
                  <p className="text-[12px] text-[#71717a]">
                    Toque para selecionar
                  </p>
                  <p className="text-[10px] text-[#52525b] mt-1">
                    JPG, PNG ou PDF
                  </p>
                </>
              )}
            </label>
          </div>
        )}

        {/* Step: Selfie */}
        {step === "selfie" && (
          <div className="space-y-4">
            <p className="text-[11px] text-[#a1a1aa] font-medium uppercase tracking-wider">
              Reconhecimento Facial
            </p>

            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full border-[3px] border-[#10b981]/40 bg-[#0d0d10] flex items-center justify-center">
                <div className="absolute inset-2 rounded-full border border-[#10b981]/15" />
                {/* Corner accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#10b981] rounded-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#10b981] rounded-full" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] bg-[#10b981] rounded-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[3px] bg-[#10b981] rounded-full" />

                <svg
                  className="w-14 h-14 text-[#27272a]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <p className="text-[11px] text-[#71717a] mt-3 text-center">
                Posiciona o rosto dentro da moldura
              </p>
            </div>

            <button
              onClick={handleCapture}
              className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200"
            >
              Tirar Selfie
            </button>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center py-8">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#10b981]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-[#10b981] border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#10b981]"
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
            </div>
            <p className="text-[14px] text-[#fafafa] font-medium">
              A verificar identidade...
            </p>
            <p className="text-[12px] text-[#71717a] mt-1">
              Comparando BI com selfie
            </p>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-4">
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
            <p className="text-[14px] text-[#fafafa] font-medium">
              Identidade Verificada!
            </p>
            <p className="text-[12px] text-[#71717a] mt-1">
              Agora tens acesso completo a plataforma.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
