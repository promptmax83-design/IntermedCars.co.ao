"use client";

const artigos = [
  {
    titulo: "Como Escolher a Viatura Ideal para a Família",
    resumo:
      "Descubra os critérios essenciais para escolher o carro perfeito para as necessidades da sua família.",
    categoria: "Dicas",
    data: "5 Jul 2026",
    tempo: "5 min",
  },
  {
    titulo: "Guia Completo: Documentos Necessários para Comprar um Carro",
    resumo:
      "Tudo o que precisa de saber sobre a documentação ao comprar uma viatura em Angola.",
    categoria: "Guia",
    data: "28 Jun 2026",
    tempo: "8 min",
  },
  {
    titulo: "Tendências do Mercado Automóvel 2026",
    resumo:
      "Quais são as marcas e modelos mais procurados este ano e o que esperar do futuro.",
    categoria: "Mercado",
    data: "20 Jun 2026",
    tempo: "6 min",
  },
  {
    titulo: "Elétricos vs Híbridos: Qual a Melhor Opção?",
    resumo:
      "Análise comparativa entre veículos elétricos e híbridos para ajudá-lo a decidir.",
    categoria: "Análise",
    data: "12 Jun 2026",
    tempo: "7 min",
  },
  {
    titulo: "5 Erros ao Vender o Seu Carro e Como Evitá-los",
    resumo:
      "Os erros mais comuns ao vender uma viatura e como maximizar o preço de venda.",
    categoria: "Dicas",
    data: "5 Jun 2026",
    tempo: "4 min",
  },
  {
    titulo: "O Que É o Cofre Fiduciário e Como Protege a Sua Negociação",
    resumo:
      "Explicação detalhada do nosso sistema de cofre fiduciário e benefícios para compradores e vendedores.",
    categoria: "IntermedCars",
    data: "28 Mai 2026",
    tempo: "5 min",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#10b981] font-semibold tracking-widest uppercase text-sm mb-2">
            Novidades
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Blog</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artigos.map((artigo) => (
              <article
                key={artigo.titulo}
                className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors group cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-b border-slate-200">
                  <span className="text-[#10b981] text-4xl font-bold opacity-20 group-hover:opacity-40 transition-opacity">
                    {artigo.categoria}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full">
                      {artigo.categoria}
                    </span>
                    <span className="text-slate-500 text-xs">{artigo.data}</span>
                    <span className="text-slate-500 text-xs">
                      · {artigo.tempo} leitura
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#10b981] transition-colors">
                    {artigo.titulo}
                  </h2>
                  <p className="text-slate-500 text-sm">{artigo.resumo}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Receba as Últimas Notícias
          </h2>
          <p className="text-slate-500 mb-6">
            Subscreva a nossa newsletter para ficar a par de tudo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="O seu email"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-[#52525b] focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition"
            />
            <button className="bg-[#10b981] text-[#060608] px-6 py-3 rounded-xl hover:bg-[#0ea573] transition-colors font-semibold">
              Subscrever
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
