export default function StandPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-primary via-secondary to-primary relative">
          <div className="absolute -bottom-12 left-6 flex items-end gap-4">
            <div className="w-24 h-24 bg-accent rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
              <span className="text-primary text-3xl font-bold">AP</span>
            </div>
          </div>
        </div>
        <div className="pt-16 px-6 pb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">AutoPremium</h1>
            <span className="text-accent text-lg">✓</span>
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">
              Stand Verificado
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Stand automóvel premium em Lisboa. Especializado em viaturas de gama
            alta.
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted">
            <span>★ 4.9 (127 avaliações)</span>
            <span>•</span>
            <span>89 vendas</span>
            <span>•</span>
            <span>Desde 2015</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icono: "📞", label: "Telefone", valor: "+351 210 123 456" },
          { icono: "💬", label: "WhatsApp", valor: "+351 912 345 678" },
          { icono: "🌐", label: "Website", valor: "autpremium.pt" },
          { icono: "📍", label: "Localização", valor: "Lisboa" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <span className="text-2xl">{c.icono}</span>
            <p className="text-[10px] text-muted mt-1">{c.label}</p>
            <p className="text-xs font-medium mt-0.5">{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">Horário</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Seg - Sex</span>
            <span className="font-medium">9:00 - 19:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Sábado</span>
            <span className="font-medium">10:00 - 14:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Domingo</span>
            <span className="text-red-500">Fechado</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Viaturas em Stock (12)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { marca: "BMW", modelo: "Serie 5", preco: "42.900" },
            { marca: "Mercedes", modelo: "Classe C", preco: "38.500" },
            { marca: "Audi", modelo: "Q5", preco: "49.900" },
          ].map((v) => (
            <div
              key={`${v.marca}-${v.modelo}`}
              className="bg-light rounded-lg p-3"
            >
              <div className="h-24 bg-gray-200 rounded flex items-center justify-center mb-2">
                🚗
              </div>
              <p className="text-xs text-accent font-semibold">{v.marca}</p>
              <p className="text-sm font-medium">{v.modelo}</p>
              <p className="text-accent font-bold mt-1">{v.preco}€</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
