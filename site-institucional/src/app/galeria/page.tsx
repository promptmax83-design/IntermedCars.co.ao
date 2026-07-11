import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria - IntermedCars",
  description:
    "Viaturas disponíveis na IntermedCars. Encontre o carro perfeito.",
};

const viaturas = [
  {
    marca: "BMW",
    modelo: "Serie 5 530e",
    ano: "2023",
    preco: "42.900",
    km: "15.000",
    combustivel: "Híbrido",
    caixa: "Automática",
    cor: "Preto",
  },
  {
    marca: "Mercedes-Benz",
    modelo: "Classe C 200",
    ano: "2022",
    preco: "38.500",
    km: "22.000",
    combustivel: "Gasolina",
    caixa: "Automática",
    cor: "Branco",
  },
  {
    marca: "Audi",
    modelo: "Q5 40 TDI",
    ano: "2023",
    preco: "49.900",
    km: "10.000",
    combustivel: "Diesel",
    caixa: "Automática",
    cor: "Cinza",
  },
  {
    marca: "Volkswagen",
    modelo: "Tiguan R-Line",
    ano: "2022",
    preco: "36.900",
    km: "28.000",
    combustivel: "Diesel",
    caixa: "Automática",
    cor: "Azul",
  },
  {
    marca: "Volvo",
    modelo: "XC60 B5",
    ano: "2023",
    preco: "52.900",
    km: "8.000",
    combustivel: "Híbrido",
    caixa: "Automática",
    cor: "Prata",
  },
  {
    marca: "Porsche",
    modelo: "Macan S",
    ano: "2022",
    preco: "68.900",
    km: "18.000",
    combustivel: "Gasolina",
    caixa: "Automática",
    cor: "Vermelho",
  },
  {
    marca: "Tesla",
    modelo: "Model 3 Long Range",
    ano: "2023",
    preco: "44.900",
    km: "12.000",
    combustivel: "Elétrico",
    caixa: "Automática",
    cor: "Branco",
  },
  {
    marca: "Toyota",
    modelo: "RAV4 Hybrid",
    ano: "2022",
    preco: "33.900",
    km: "32.000",
    combustivel: "Híbrido",
    caixa: "Automática",
    cor: "Verde",
  },
  {
    marca: "Hyundai",
    modelo: "Tucson N-Line",
    ano: "2023",
    preco: "35.900",
    km: "14.000",
    combustivel: "Híbrido",
    caixa: "Automática",
    cor: "Cinza",
  },
];

export default function Galeria() {
  return (
    <div>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-2">
            As Melhores Viaturas
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">Galeria</h1>
        </div>
      </section>

      <section className="py-8 bg-light border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {["Todas", "SUV", "Sedan", "Elétrico", "Híbrido", "Desportivo"].map(
              (f) => (
                <button
                  key={f}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    f === "Todas"
                      ? "bg-accent text-primary"
                      : "bg-white text-muted hover:bg-accent hover:text-primary border border-gray-200"
                  }`}
                >
                  {f}
                </button>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {viaturas.map((car) => (
              <div
                key={`${car.marca}-${car.modelo}`}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <span className="text-gray-400 text-3xl font-bold group-hover:scale-110 transition-transform">
                    {car.marca}
                  </span>
                  <div className="absolute top-3 right-3 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full">
                    {car.combustivel}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-accent text-sm font-semibold">
                    {car.marca}
                  </p>
                  <h3 className="text-xl font-bold mb-3">{car.modelo}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted mb-4">
                    <span>{car.ano}</span>
                    <span>{car.km} km</span>
                    <span>{car.caixa}</span>
                    <span>{car.cor}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="text-accent text-2xl font-bold">
                      {car.preco}Kz
                    </p>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
