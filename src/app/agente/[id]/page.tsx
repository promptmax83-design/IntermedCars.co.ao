export default function AgentePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-accent rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-primary text-2xl font-bold">AR</span>
            </div>
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Ana Rodrigues</h1>
            <span className="text-accent">✓</span>
          </div>
          <p className="text-sm text-muted">Agente Certificado · Porto</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-accent">★★★★★</span>
            <span className="text-sm text-muted">4.9 (312 avaliações)</span>
          </div>
          <div className="flex gap-2 mt-3">
            <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">
              Nível Ouro
            </span>
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
              Top Agent #2
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { valor: "247", label: "Vendas" },
          { valor: "98.2%", label: "Sucesso" },
          { valor: "12.4kKz", label: "Comissão Total" },
          { valor: "#2", label: "Ranking Nacional" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <p className="text-xl font-bold text-accent">{s.valor}</p>
            <p className="text-[10px] text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">Medalhas</h2>
        <div className="flex gap-3">
          {[
            "🏆 Primeira Venda",
            "💯 100 Negócios",
            "⭐ Top Agente",
            "🤝 Negociação Perfeita",
            "🏅 Cliente Ouro",
          ].map((m) => (
            <div
              key={m}
              className="bg-light rounded-lg px-3 py-2 text-xs font-medium text-center"
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">Ranking</h2>
        <div className="space-y-2">
          {[
            { pos: 1, nome: "Carlos Mendes", vendas: 253, medalha: "🥇" },
            {
              pos: 2,
              nome: "Ana Rodrigues",
              vendas: 247,
              medalha: "🥈",
              destaque: true,
            },
            { pos: 3, nome: "Miguel Costa", vendas: 231, medalha: "🥉" },
          ].map((a) => (
            <div
              key={a.pos}
              className={`flex items-center gap-3 p-2 rounded-lg ${a.destaque ? "bg-accent/5 border border-accent/20" : ""}`}
            >
              <span className="text-lg">{a.medalha}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.nome}</p>
                <p className="text-xs text-muted">{a.vendas} vendas</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
