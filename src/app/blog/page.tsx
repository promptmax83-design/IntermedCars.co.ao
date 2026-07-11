import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog - IntermedCars",
  description: "Notícias, dicas e novidades do mundo automóvel.",
};

const artigos = [
  {
    titulo: "Como Escolher a Viatura Ideal para a Família",
    resumo: "Descubra os critérios essenciais para escolher o carro perfeito para as necessidades da sua família.",
    categoria: "Dicas",
    data: "5 Jul 2026",
    tempo: "5 min",
  },
  {
    titulo: "Guia Completo: Documentos Necessários para Comprar um Carro",
    resumo: "Tudo o que precisa de saber sobre a documentação ao comprar uma viatura em Portugal.",
    categoria: "Guia",
    data: "28 Jun 2026",
    tempo: "8 min",
  },
  {
    titulo: "Tendências do Mercado Automóvel 2026",
    resumo: "Quais são as marcas e modelos mais procurados este ano e o que esperar do futuro.",
    categoria: "Mercado",
    data: "20 Jun 2026",
    tempo: "6 min",
  },
  {
    titulo: "Elétricos vs Híbridos: Qual a Melhor Opção?",
    resumo: "Análise comparativa entre veículos elétricos e híbridos para ajudá-lo a decidir.",
    categoria: "Análise",
    data: "12 Jun 2026",
    tempo: "7 min",
  },
  {
    titulo: "5 Erros ao Vender o Seu Carro e Como Evitá-los",
    resumo: "Os erros mais comuns ao vender uma viatura e como maximizar o preço de venda.",
    categoria: "Dicas",
    data: "5 Jun 2026",
    tempo: "4 min",
  },
  {
    titulo: "O Que É o Cofre Fiduciário e Como Protege a Sua Negociação",
    resumo: "Explicação detalhada do nosso sistema de cofre fiduciário e benefícios para compradores e vendedores.",
    categoria: "IntermedCars",
    data: "28 Mai 2026",
    tempo: "5 min",
  },
];

export default function Blog() {
  return (
    <div>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-2">Novidades</p>
          <h1 className="text-4xl md:text-5xl font-bold">Blog</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artigos.map((artigo) => (
              <article
                key={artigo.titulo}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-accent text-4xl font-bold opacity-20 group-hover:opacity-40 transition-opacity">
                    {artigo.categoria}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-accent bg-opacity-10 text-accent text-xs font-bold px-3 py-1 rounded-full">
                      {artigo.categoria}
                    </span>
                    <span className="text-muted text-xs">{artigo.data}</span>
                    <span className="text-muted text-xs">· {artigo.tempo} leitura</span>
                  </div>
                  <h2 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                    {artigo.titulo}
                  </h2>
                  <p className="text-muted text-sm">{artigo.resumo}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Receba as Últimas Notícias</h2>
          <p className="text-muted mb-6">Subscreva a nossa newsletter para ficar a par de tudo.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="O seu email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
            <button className="bg-accent text-primary px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors font-semibold">
              Subscrever
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
