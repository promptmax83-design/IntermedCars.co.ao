"use client";

type Props = {
  type: "cliente" | "consultor";
  onConfirm: () => void;
  onBack: () => void;
};

export default function PermanentChoiceModal({ type, onConfirm, onBack }: Props) {
  const typeLabel = type === "cliente" ? "Cliente" : "Consultor";
  const color = type === "cliente" ? "#10b981" : "var(--imc-ouro)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onBack} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Icone */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}15` }}>
          <svg className="w-7 h-7" style={{ color }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
          Confirmar tipo de conta
        </h3>

        <p className="text-[13px] text-slate-500 text-center mb-2">
          Vais registar-te como <strong className="text-slate-700">{typeLabel}</strong>.
        </p>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-6">
          <p className="text-[12px] text-amber-800 text-center">
            <strong>Esta escolha e permanente.</strong> Depois de te registares como {typeLabel}, nao e possivel mudar de tipo de conta.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 font-semibold text-sm rounded-xl transition-colors text-white"
            style={{ backgroundColor: color }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
