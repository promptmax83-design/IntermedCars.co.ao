"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const marcas = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Tesla", "Volkswagen", "Volvo", "Toyota", "Hyundai", "Ford", "Renault", "Peugeot", "Opel", "Nissan", "Honda"];
const tipos = ["Carro", "Carrinha", "Camiao"];
const combustiveis = ["Gasolina", "Diesel", "Eletrico", "Hibrido"];
const caixas = ["Automatica", "Manual"];
const tracoes = ["Dianteira", "Traseira", "Integral"];
const cores = ["Preto", "Branco", "Cinza", "Prata", "Azul", "Vermelho", "Verde", "Amarelo", "Laranja", "Bege", "Castanho"];
const provincias = ["Luanda", "Benguela", "Huambo", "Lubango", "Cabinda", "Namibe", "Uige", "Malanje", "Kuanza Norte", "Kuanza Sul"];

type FormData = {
  tipo: string;
  marca: string;
  modelo: string;
  ano: string;
  preco: string;
  combustivel: string;
  caixa: string;
  cor: string;
  potencia: string;
  tracao: string;
  km: string;
  local: string;
  descricao: string;
  fotos: File[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AnunciarPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    tipo: "Carro",
    marca: "",
    modelo: "",
    ano: "",
    preco: "",
    combustivel: "Gasolina",
    caixa: "Automatica",
    cor: "",
    potencia: "",
    tracao: "Dianteira",
    km: "",
    local: "",
    descricao: "",
    fotos: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (form.fotos.length + files.length > 10) {
      setError("Maximo 10 fotos");
      return;
    }
    setForm((prev) => ({ ...prev, fotos: [...prev.fotos, ...files] }));
  };

  const removeFoto = (index: number) => {
    setForm((prev) => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Sessao expirada. Faz login novamente.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        tipo: form.tipo.toLowerCase(),
        marca: form.marca,
        modelo: form.modelo,
        ano: parseInt(form.ano),
        preco: parseFloat(form.preco.replace(/\./g, "")),
        combustivel: form.combustivel.toLowerCase(),
        caixa: form.caixa.toLowerCase(),
        cor: form.cor,
        potencia: parseInt(form.potencia) || 0,
        tracao: form.tracao.toLowerCase(),
        km: parseInt(form.km) || 0,
        local: form.local,
        descricao: form.descricao || null,
      };

      const res = await fetch(`${API_BASE}/api/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Erro ao criar anuncio");
      }

      const vehicleId = data.vehicle_id;

      if (form.fotos.length > 0 && vehicleId) {
        setUploadingPhotos(true);
        for (let i = 0; i < form.fotos.length; i++) {
          const formData = new FormData();
          formData.append("image", form.fotos[i]);
          formData.append("is_primary", i === 0 ? "1" : "0");
          formData.append("sort_order", String(i));

          await fetch(`${API_BASE}/api/vehicles/${vehicleId}/images`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
        }
        setUploadingPhotos(false);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar anuncio");
    } finally {
      setLoading(false);
    }
  };

  const formatKz = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Anuncio Criado!</h1>
          <p className="text-[13px] text-slate-500 mb-6">
            O teu veiculo foi publicado com sucesso. Aparecera no marketplace apos revisao.
          </p>
          <Link
            href="/feed"
            className="inline-block w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200"
          >
            Ir para o Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/feed" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Anunciar Veiculo</h1>
          <p className="text-sm text-slate-500 mt-1">Preencha os dados do teu veiculo para publicar no marketplace</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
            {error}
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-[#10b981]" : "bg-white/[0.06]"}`} />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Vehicle Info */}
          {step === 1 && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <p className="text-[12px] text-slate-500 font-medium">Dados do Veiculo</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none">
                    {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Marca</label>
                  <select name="marca" value={form.marca} onChange={handleChange} required className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none">
                    <option value="">Selecionar</option>
                    {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Modelo</label>
                <input type="text" name="modelo" value={form.modelo} onChange={handleChange} required placeholder="Ex: Serie 5 530e" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Ano</label>
                  <input type="number" name="ano" value={form.ano} onChange={handleChange} required placeholder="2023" min="1990" max="2027" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Km</label>
                  <input type="number" name="km" value={form.km} onChange={handleChange} required placeholder="15000" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Preco (Kz)</label>
                <input type="text" name="preco" value={formatKz(form.preco)} onChange={(e) => setForm((prev) => ({ ...prev, preco: e.target.value.replace(/\D/g, "") }))} required placeholder="42.900.000" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Combustivel</label>
                  <select name="combustivel" value={form.combustivel} onChange={handleChange} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none">
                    {combustiveis.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Caixa</label>
                  <select name="caixa" value={form.caixa} onChange={handleChange} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none">
                    {caixas.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tracao</label>
                  <select name="tracao" value={form.tracao} onChange={handleChange} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none">
                    {tracoes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cor</label>
                  <select name="cor" value={form.cor} onChange={handleChange} required className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none">
                    <option value="">Selecionar</option>
                    {cores.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Potencia (cv)</label>
                  <input type="number" name="potencia" value={form.potencia} onChange={handleChange} placeholder="299" className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Localizacao</label>
                <select name="local" value={form.local} onChange={handleChange} required className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none">
                  <option value="">Selecionar provincia</option>
                  {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Descricao</label>
                <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={4} placeholder="Descreva o estado do veiculo, revisoes, extras..." className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-[#52525b] outline-none resize-none" />
              </div>

              <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200">
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <p className="text-[12px] text-slate-500 font-medium">Fotos do Veiculo</p>

              <div className="relative">
                <input type="file" accept="image/*" multiple onChange={handleFotos} className="hidden" id="fotos-upload" />
                <label htmlFor="fotos-upload" className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-white/[0.08] bg-slate-50 cursor-pointer hover:border-[#10b981]/30 hover:bg-slate-50 transition-all">
                  <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-[12px] text-slate-500">Toque para adicionar fotos</p>
                  <p className="text-[10px] text-slate-400 mt-1">Maximo 10 fotos</p>
                </label>
              </div>

              {form.fotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {form.fotos.map((foto, i) => (
                    <div key={i} className="relative h-24 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <span className="text-xs text-slate-500">{foto.name.slice(0, 15)}...</span>
                      <button type="button" onClick={() => removeFoto(i)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ef4444] text-slate-800 text-[10px] flex items-center justify-center">
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 text-sm hover:text-slate-800 transition-colors">
                  Voltar
                </button>
                <button type="submit" disabled={loading || uploadingPhotos} className="flex-1 py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50">
                  {uploadingPhotos ? "A enviar fotos..." : loading ? "A publicar..." : "Publicar Anuncio"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
