"use client";
import { useState } from "react";

const negociacoes = [
  {
    id: 1,
    veiculo: "BMW Serie 5 530e",
    valor: 41500000,
    comprador: "Joao Ferreira",
    vendedor: "Ana Rodrigues",
    comissaoComprador: 415000,
    comissaoVendedor: 415000,
    prazo: "15 Jul 2026",
    etapas: [
      { nome: "Proposta Aceite", status: "concluido", data: "08/07 10:15" },
      { nome: "Deposito no Cofre", status: "concluido", data: "09/07 14:30" },
      { nome: "Vistoria", status: "concluido", data: "10/07 09:00" },
      { nome: "Comissao Pendente", status: "ativo", data: "Prazo: 72h" },
      { nome: "Transferencia", status: "pendente", data: "" },
      { nome: "Entrega", status: "pendente", data: "" },
      { nome: "Concluido", status: "pendente", data: "" },
    ],
  },
  {
    id: 2,
    veiculo: "Porsche Macan S",
    valor: 67000000,
    comprador: "Pedro Santos",
    vendedor: "Carlos Mendes",
    comissaoComprador: 670000,
    comissaoVendedor: 670000,
    prazo: "20 Jul 2026",
    etapas: [
      { nome: "Proposta Aceite", status: "concluido", data: "05/07 11:00" },
      { nome: "Deposito no Cofre", status: "concluido", data: "06/07 16:45" },
      { nome: "Vistoria", status: "concluido", data: "07/07 10:30" },
      { nome: "Comissao Pendente", status: "concluido", data: "08/07 14:00" },
      { nome: "Transferencia", status: "ativo", data: "Processando..." },
      { nome: "Entrega", status: "pendente", data: "" },
      { nome: "Concluido", status: "pendente", data: "" },
    ],
  },
  {
    id: 3,
    veiculo: "Audi Q5 40 TDI",
    valor: 48500000,
    comprador: "Maria Silva",
    vendedor: "Ana S.",
    comissaoComprador: 485000,
    comissaoVendedor: 485000,
    prazo: "12 Jul 2026",
    etapas: [
      { nome: "Proposta Aceite", status: "concluido", data: "01/07 09:30" },
      { nome: "Deposito no Cofre", status: "concluido", data: "02/07 11:00" },
      { nome: "Vistoria", status: "concluido", data: "03/07 15:00" },
      { nome: "Comissao Pendente", status: "concluido", data: "04/07 10:00" },
      { nome: "Transferencia", status: "concluido", data: "05/07 14:30" },
      { nome: "Entrega", status: "concluido", data: "06/07 11:00" },
      { nome: "Concluido", status: "concluido", data: "07/07 09:00" },
    ],
  },
];

const IBAN_DESTINO = "000600008398497030137";
const BENEFICIARIO = "Ebivandro Terbio Manuel Agostinho";

export default function CofrePage() {
  const [negociacaoAtiva, setNegociacaoAtiva] = useState(0);
  const [showComprovativo, setShowComprovativo] = useState(false);
  const [comprovativoFile, setComprovativoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "analyzing" | "approved" | "suspicious"
  >("idle");

  const neg = negociacoes[negociacaoAtiva];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprovativoFile(file);
      setUploadStatus("idle");
    }
  };

  const handleUpload = () => {
    if (!comprovativoFile) return;
    setUploadStatus("analyzing");

    // Simulate AI analysis
    setTimeout(() => {
      setUploadStatus("approved");
    }, 3000);
  };

  const formatKz = (value: number) => {
    return value.toLocaleString("pt-AO") + " Kz";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">Cofre Fiduciario</h1>
        <p className="text-sm text-[#71717a]">
          Custodia segura de fundos. Pagamento de comissao com comprovativo
          verificado por IA.
        </p>
      </div>

      {/* Negotiation Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {negociacoes.map((n, i) => (
          <button
            key={n.id}
            onClick={() => {
              setNegociacaoAtiva(i);
              setShowComprovativo(false);
              setUploadStatus("idle");
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              i === negociacaoAtiva
                ? "bg-[#10b981] text-[#060608]"
                : "bg-white/[0.04] text-[#71717a] border border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            {n.veiculo.split(" ")[0]} {n.veiculo.split(" ")[1]}
          </button>
        ))}
      </div>

      {/* Negotiation Details */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#10b981]/10 to-[#c9a84c]/5 p-6 border-b border-white/[0.06]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Veiculo
              </p>
              <p className="font-bold text-sm text-[#fafafa] mt-1">
                {neg.veiculo}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Valor
              </p>
              <p className="font-bold text-[#10b981] text-lg mt-1">
                {formatKz(neg.valor)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Estado
              </p>
              <p className="font-bold text-sm text-[#f59e0b] mt-1">
                {neg.etapas.find((e) => e.status === "ativo")?.nome ||
                  "Concluido"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Prazo
              </p>
              <p className="font-bold text-sm text-[#fafafa] mt-1">
                {neg.prazo}
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
            <div>
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Comprador
              </p>
              <p className="text-sm text-[#fafafa] mt-1">{neg.comprador}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Vendedor
              </p>
              <p className="text-sm text-[#fafafa] mt-1">{neg.vendedor}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Comissao (2%)
              </p>
              <p className="text-sm text-[#c9a84c] font-semibold mt-1">
                {formatKz(neg.comissaoComprador + neg.comissaoVendedor)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-6">
          <h3 className="font-bold text-[#fafafa] mb-6">Progresso do Cofre</h3>
          <div className="space-y-0">
            {neg.etapas.map((etapa, i) => (
              <div key={etapa.nome} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      etapa.status === "concluido"
                        ? "bg-[#10b981] text-[#060608]"
                        : etapa.status === "ativo"
                          ? "bg-[#f59e0b]/20 text-[#f59e0b] animate-pulse"
                          : "bg-white/[0.04] text-[#52525b]"
                    }`}
                  >
                    {etapa.status === "concluido" ? "\u2713" : i + 1}
                  </div>
                  {i < neg.etapas.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        etapa.status === "concluido"
                          ? "bg-[#10b981]/30"
                          : "bg-white/[0.06]"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-medium text-sm ${
                        etapa.status === "concluido"
                          ? "text-[#10b981]"
                          : etapa.status === "ativo"
                            ? "text-[#f59e0b] font-bold"
                            : "text-[#52525b]"
                      }`}
                    >
                      {etapa.nome}
                    </p>
                    {etapa.data && (
                      <span className="text-xs text-[#71717a]">
                        {etapa.data}
                      </span>
                    )}
                  </div>
                  {etapa.status === "ativo" &&
                    etapa.nome === "Comissao Pendente" && (
                      <div className="mt-3">
                        <button
                          onClick={() => setShowComprovativo(!showComprovativo)}
                          className="w-full py-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl text-[#f59e0b] text-sm font-semibold hover:bg-[#f59e0b]/20 transition-colors"
                        >
                          Enviar Comprovativo de Pagamento
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Proof Modal */}
      {showComprovativo && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#fafafa]">
              Comprovativo de Pagamento
            </h3>
            <button
              onClick={() => {
                setShowComprovativo(false);
                setUploadStatus("idle");
              }}
              className="text-[#71717a] hover:text-[#fafafa] transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Payment Details */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
              Dados para Pagamento
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#71717a]">IBAN Destino</p>
                <p className="text-sm text-[#fafafa] font-mono font-semibold">
                  {IBAN_DESTINO}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#71717a]">Beneficiario</p>
                <p className="text-sm text-[#fafafa] font-semibold">
                  {BENEFICIARIO}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-xs text-[#71717a]">
                Valor a Transferir (Comissao 2%)
              </p>
              <p className="text-lg text-[#10b981] font-bold">
                {formatKz(neg.comissaoComprador + neg.comissaoVendedor)}
              </p>
            </div>
          </div>

          {/* Upload Area */}
          {uploadStatus === "idle" && (
            <div className="space-y-3">
              <p className="text-[11px] text-[#71717a] uppercase tracking-wider font-bold">
                Carregar Comprovativo
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="comprovativo-upload"
                />
                <label
                  htmlFor="comprovativo-upload"
                  className={`flex items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    comprovativoFile
                      ? "border-[#10b981]/40 bg-[#10b981]/5"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-[#10b981]/30 hover:bg-white/[0.04]"
                  }`}
                >
                  {comprovativoFile ? (
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 text-[#10b981] mx-auto mb-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <p className="text-[12px] text-[#10b981] font-medium">
                        {comprovativoFile.name}
                      </p>
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
                        Toque para selecionar talao bancario
                      </p>
                      <p className="text-[10px] text-[#52525b] mt-1">
                        JPG, PNG ou PDF (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={!comprovativoFile}
                className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Enviar e Validar
              </button>
            </div>
          )}

          {/* AI Analysis */}
          {uploadStatus === "analyzing" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full border-4 border-[#10b981] border-t-transparent animate-spin mb-4" />
              <p className="text-[14px] text-[#fafafa] font-medium">
                IA a analisar comprovativo...
              </p>
              <p className="text-[12px] text-[#71717a] mt-1">
                Verificando valor, IBAN, data e autenticidade
              </p>
            </div>
          )}

          {/* AI Result */}
          {uploadStatus === "approved" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#060608]"
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
                <div>
                  <p className="text-[#10b981] font-semibold text-sm">
                    Comprovativo Validado pela IA
                  </p>
                  <p className="text-[11px] text-[#71717a]">
                    Confianca: 95% | Valor:{" "}
                    {formatKz(neg.comissaoComprador + neg.comissaoVendedor)} |
                    IBAN verificado
                  </p>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Detalhes da Analise IA
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Valor transferido</span>
                    <span className="text-[#fafafa]">
                      {formatKz(neg.comissaoComprador + neg.comissaoVendedor)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">IBAN destino</span>
                    <span className="text-[#fafafa] font-mono">
                      {IBAN_DESTINO}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Beneficiario</span>
                    <span className="text-[#fafafa]">{BENEFICIARIO}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Sinais de edicao</span>
                    <span className="text-[#10b981]">Nenhum detectado</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowComprovativo(false);
                  setUploadStatus("idle");
                }}
                className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200"
              >
                Confirmar Pagamento
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[#f59e0b]">3</p>
          <p className="text-sm text-[#71717a] mt-1">Negocios Ativos</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[#10b981]">157.000.000 Kz</p>
          <p className="text-sm text-[#71717a] mt-1">Em Cofre</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[#10b981]">1</p>
          <p className="text-sm text-[#71717a] mt-1">Concluidos</p>
        </div>
      </div>
    </div>
  );
}
