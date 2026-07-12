"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type PaymentDetails = {
  iban: string;
  beneficiary: string;
};

type Transaction = {
  id: number;
  vehicle_id: number;
  buyer_id: number;
  seller_id: number;
  proposed_price: number;
  status: string;
  deposit_amount: number | null;
  marca: string;
  modelo: string;
  vehicle_price: number;
  buyer_name: string;
  seller_name: string;
  created_at: string;
  commission_deadline: string | null;
};

const statusFlow: Record<string, { label: string; index: number }> = {
  proposta_enviada: { label: "Proposta Enviada", index: 0 },
  proposta_aceite: { label: "Proposta Aceite", index: 1 },
  deposito_efetuado: { label: "Deposito no Cofre", index: 2 },
  vistoria_concluida: { label: "Vistoria Concluida", index: 3 },
  comissao_pendente: { label: "Comissao Pendente", index: 4 },
  comissao_paga: { label: "Comissao Paga", index: 5 },
  transacao_concluida: { label: "Concluido", index: 6 },
  prazo_excedido: { label: "Prazo Excedido", index: 4 },
  multa_aplicada: { label: "Multa Aplicada", index: 5 },
  divida_pendente: { label: "Divida Pendente", index: 5 },
  transacao_cancelada: { label: "Cancelado", index: -1 },
  proposta_recusada: { label: "Recusado", index: -1 },
};

const etapas = [
  "Proposta Aceite",
  "Deposito no Cofre",
  "Vistoria",
  "Comissao Pendente",
  "Transferencia",
  "Entrega",
  "Concluido",
];

function formatKz(value: number): string {
  return value.toLocaleString("pt-AO") + " Kz";
}

export default function CofrePage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [negociacaoAtiva, setNegociacaoAtiva] = useState(0);
  const [showComprovativo, setShowComprovativo] = useState(false);
  const [comprovativoFile, setComprovativoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "analyzing" | "approved" | "rejected">("idle");
  const [uploadError, setUploadError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({ iban: "", beneficiary: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTransactions([]);
        setLoading(false);
      });

    fetch(`${API_BASE}/api/commission/payment-details`)
      .then((r) => r.json())
      .then((data) => setPaymentDetails(data))
      .catch(() => {});
  }, [router]);

  const activeTransactions = transactions.filter(
    (t) => !["transacao_concluida", "transacao_cancelada", "proposta_recusada"].includes(t.status)
  );

  const tx = activeTransactions[negociacaoAtiva];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprovativoFile(file);
      setUploadStatus("idle");
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!comprovativoFile || !tx) return;
    setUploadStatus("analyzing");
    setUploadError("");

    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("proof", comprovativoFile);
    formData.append("transaction_id", String(tx.id));
    formData.append("amount", "100000");
    formData.append("role", "seller");

    try {
      const res = await fetch(`${API_BASE}/api/commission/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Erro ao enviar comprovativo");
      }

      setUploadStatus(data.status === "confirmado" ? "approved" : "rejected");
    } catch (err) {
      setUploadStatus("idle");
      setUploadError(err instanceof Error ? err.message : "Erro ao enviar");
    }
  };

  const getStepStatus = (stepIndex: number, txStatus: string): "concluido" | "ativo" | "pendente" => {
    const flow = statusFlow[txStatus];
    if (!flow) return "pendente";
    if (flow.index < 0) return "pendente";
    if (stepIndex < flow.index) return "concluido";
    if (stepIndex === flow.index) return "ativo";
    return "pendente";
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        <p className="text-[#52525b] text-sm">A carregar transacoes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">Cofre Fiduciario</h1>
        <p className="text-sm text-[#71717a]">
          Custodia segura de fundos. Pagamento de taxa fixa com comprovativo verificado por IA.
        </p>
      </div>

      {activeTransactions.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#fafafa] mb-2">Nenhuma transacao ativa</h2>
          <p className="text-sm text-[#71717a]">As tuas transacoes aparecerao aqui quando iniciares negociacoes.</p>
        </div>
      ) : (
        <>
          {/* Negotiation Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {activeTransactions.map((t, i) => (
              <button
                key={t.id}
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
                {t.marca} {t.modelo}
              </button>
            ))}
          </div>

          {/* Negotiation Details */}
          {tx && (
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#10b981]/10 to-[#c9a84c]/5 p-6 border-b border-white/[0.06]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Veiculo</p>
                    <p className="font-bold text-sm text-[#fafafa] mt-1">{tx.marca} {tx.modelo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Valor</p>
                    <p className="font-bold text-[#10b981] text-lg mt-1">{formatKz(tx.proposed_price)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Estado</p>
                    <p className="font-bold text-sm text-[#f59e0b] mt-1">{statusFlow[tx.status]?.label || tx.status}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Taxa Fixa (Vendedor)</p>
                    <p className="font-bold text-sm text-[#c9a84c] mt-1">{formatKz(100000)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
                  <div>
                    <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Comprador</p>
                    <p className="text-sm text-[#fafafa] mt-1">{tx.buyer_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Vendedor</p>
                    <p className="text-sm text-[#fafafa] mt-1">{tx.seller_name}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="p-6">
                <h3 className="font-bold text-[#fafafa] mb-6">Progresso do Cofre</h3>
                <div className="space-y-0">
                  {etapas.map((etapa, i) => {
                    const stepStatus = getStepStatus(i, tx.status);
                    return (
                      <div key={etapa} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                              stepStatus === "concluido"
                                ? "bg-[#10b981] text-[#060608]"
                                : stepStatus === "ativo"
                                  ? "bg-[#f59e0b]/20 text-[#f59e0b] animate-pulse"
                                  : "bg-white/[0.04] text-[#52525b]"
                            }`}
                          >
                            {stepStatus === "concluido" ? "\u2713" : i + 1}
                          </div>
                          {i < etapas.length - 1 && (
                            <div className={`w-0.5 h-12 ${stepStatus === "concluido" ? "bg-[#10b981]/30" : "bg-white/[0.06]"}`} />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className={`font-medium text-sm ${
                                stepStatus === "concluido"
                                  ? "text-[#10b981]"
                                  : stepStatus === "ativo"
                                    ? "text-[#f59e0b] font-bold"
                                    : "text-[#52525b]"
                              }`}
                            >
                              {etapa}
                            </p>
                          </div>
                          {stepStatus === "ativo" && etapa === "Comissao Pendente" && (
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
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Payment Proof Modal */}
          {showComprovativo && tx && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#fafafa]">Comprovativo de Pagamento</h3>
                <button
                  onClick={() => { setShowComprovativo(false); setUploadStatus("idle"); }}
                  className="text-[#71717a] hover:text-[#fafafa] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Payment Details */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Dados para Pagamento</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#71717a]">IBAN Destino</p>
                    <p className="text-sm text-[#fafafa] font-mono font-semibold">{paymentDetails.iban || "A carregar..."}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#71717a]">Beneficiario</p>
                    <p className="text-sm text-[#fafafa] font-semibold">{paymentDetails.beneficiary || "A carregar..."}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-xs text-[#71717a]">Valor a Transferir (Taxa Fixa - Vendedor)</p>
                  <p className="text-lg text-[#10b981] font-bold">{formatKz(100000)}</p>
                </div>
              </div>

              {/* Upload Area */}
              {uploadStatus === "idle" && (
                <div className="space-y-3">
                  {uploadError && (
                    <div className="px-4 py-2 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
                      {uploadError}
                    </div>
                  )}
                  <div className="relative">
                    <input type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" id="comprovativo-upload" />
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
                          <svg className="w-8 h-8 text-[#10b981] mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <p className="text-[12px] text-[#10b981] font-medium">{comprovativoFile.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="w-8 h-8 text-[#52525b] mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <p className="text-[11px] text-[#71717a]">Toque para selecionar talao bancario</p>
                          <p className="text-[10px] text-[#52525b] mt-1">JPG, PNG ou PDF (max 10MB)</p>
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
                  <p className="text-[14px] text-[#fafafa] font-medium">IA a analisar comprovativo...</p>
                  <p className="text-[12px] text-[#71717a] mt-1">Verificando valor, IBAN, data e autenticidade</p>
                </div>
              )}

              {/* AI Result */}
              {uploadStatus === "approved" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#060608]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#10b981] font-semibold text-sm">Comprovativo Validado pela IA</p>
                      <p className="text-[11px] text-[#71717a]">Pagamento confirmado com sucesso</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowComprovativo(false); setUploadStatus("idle"); }}
                    className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {uploadStatus === "rejected" && (
                <div className="flex items-center gap-3 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#ef4444] font-semibold text-sm">Comprovativo Rejeitado</p>
                    <p className="text-[11px] text-[#71717a]">A IA detectou irregularidades. Tente novamente.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-[#f59e0b]">{activeTransactions.length}</p>
              <p className="text-sm text-[#71717a] mt-1">Negocios Ativos</p>
            </div>
            <div className="glass-card rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-[#10b981]">
                {formatKz(activeTransactions.reduce((sum, t) => sum + t.proposed_price, 0))}
              </p>
              <p className="text-sm text-[#71717a] mt-1">Em Cofre</p>
            </div>
            <div className="glass-card rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-[#10b981]">
                {transactions.filter((t) => t.status === "transacao_concluida").length}
              </p>
              <p className="text-sm text-[#71717a] mt-1">Concluidos</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
