"use client";

export default function ContratoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contrato Digital</h1>
        <p className="text-sm text-muted">
          Negociação #1247 · BMW Serie 5 530e
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary text-white p-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Contrato de Mediação Automóvel
          </p>
          <p className="font-bold text-lg">IntermedCars</p>
          <p className="text-xs text-gray-400 mt-1">Ref: IC-2026-1247</p>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-light rounded-lg p-3">
              <p className="text-[10px] text-muted uppercase">Comprador</p>
              <p className="font-medium mt-0.5">João Ferreira</p>
            </div>
            <div className="bg-light rounded-lg p-3">
              <p className="text-[10px] text-muted uppercase">Vendedor</p>
              <p className="font-medium mt-0.5">Ana Rodrigues</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-light rounded-lg p-3">
              <p className="text-[10px] text-muted uppercase">Viatura</p>
              <p className="font-medium mt-0.5">BMW Serie 5 530e M Sport</p>
            </div>
            <div className="bg-light rounded-lg p-3">
              <p className="text-[10px] text-muted uppercase">Valor</p>
              <p className="font-bold text-accent mt-0.5">41.500€</p>
            </div>
          </div>
          <div className="bg-light rounded-lg p-3">
            <p className="text-[10px] text-muted uppercase">Condições</p>
            <p className="text-muted mt-0.5">
              Pagamento via cofre fiduciário IntermedCars. Transferência
              bancária SEPA. Entrega em 5 dias úteis após confirmação do
              pagamento. Veículo entregue com documentação completa e vistoria
              realizada.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Assinaturas</h2>
        <div className="space-y-3">
          {[
            {
              nome: "João Ferreira (Comprador)",
              status: "Assinado",
              data: "10/07/2026 14:32",
              cor: "text-emerald-500",
            },
            {
              nome: "Ana Rodrigues (Vendedor)",
              status: "Pendente",
              data: "Aguardando...",
              cor: "text-amber-500",
            },
            {
              nome: "IntermedCars (Mediador)",
              status: "Pendente",
              data: "Aguardando ambas as partes",
              cor: "text-gray-400",
            },
          ].map((s) => (
            <div
              key={s.nome}
              className="flex items-center justify-between p-3 bg-light rounded-lg"
            >
              <div>
                <p className="text-sm font-medium">{s.nome}</p>
                <p className="text-xs text-muted">{s.data}</p>
              </div>
              <span className={`text-xs font-medium ${s.cor}`}>
                {s.status === "Assinado" ? "✓ " : ""}
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-4xl mb-3">📱</p>
        <p className="text-sm font-medium mb-2">QR Code de Validação</p>
        <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto flex items-center justify-center text-gray-300 text-4xl">
          ▦
        </div>
        <p className="text-xs text-muted mt-3">
          Escaneie para validar o contrato
        </p>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-white border border-gray-200 text-center py-3 rounded-xl font-medium text-sm">
          📄 Download PDF
        </button>
        <button className="flex-1 bg-accent text-primary text-center py-3 rounded-xl font-bold text-sm">
          ✍ Assinar Agora
        </button>
      </div>
    </div>
  );
}
