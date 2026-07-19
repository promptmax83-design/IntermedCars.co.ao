"use client";

type Props = {
  onSelect: (type: "cliente" | "consultor") => void;
};

export default function AccountTypeChoice({ onSelect }: Props) {
  return (
    <div>
      {/* Banner de aviso de permanência */}
      <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-[13px] font-semibold text-amber-800">Escolha permanente</p>
          <p className="text-[12px] text-amber-700 mt-0.5">
            O tipo de conta que escolheres nao podera ser alterado depois. Escolhe com atencao.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-1">Que tipo de conta queres?</h2>
      <p className="text-[13px] text-slate-500 mb-8">
        Selecione uma opcao para continuar.
      </p>

      <div className="space-y-3">
        {/* Cartão Cliente */}
        <button
          onClick={() => onSelect("cliente")}
          className="w-full flex items-center gap-4 p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:border-[#10b981] hover:bg-[#10b981]/5 transition-all duration-200 text-left group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center shrink-0 group-hover:bg-[#10b981]/20 transition-colors">
            <svg className="w-7 h-7 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-slate-800">Sou Cliente</p>
            <p className="text-[12px] text-slate-500 mt-1">
              Compro viaturas e preciso de intermediacao para negociar com seguranca.
            </p>
          </div>
          <svg className="w-5 h-5 text-slate-300 group-hover:text-[#10b981] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Cartão Consultor */}
        <button
          onClick={() => onSelect("consultor")}
          className="w-full flex items-center gap-4 p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:border-[var(--imc-ouro)] hover:bg-[var(--imc-ouro)]/5 transition-all duration-200 text-left group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--imc-ouro)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--imc-ouro)]/20 transition-colors">
            <svg className="w-7 h-7 text-[var(--imc-ouro)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-slate-800">Sou Consultor</p>
            <p className="text-[12px] text-slate-500 mt-1">
              Ajudo clientes a negociar viaturas e ganho comissao por intermediacao.
            </p>
          </div>
          <svg className="w-5 h-5 text-slate-300 group-hover:text-[var(--imc-ouro)] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
