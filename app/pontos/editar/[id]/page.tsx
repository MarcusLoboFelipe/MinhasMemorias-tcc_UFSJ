"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import * as L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

async function buscarEnderecoPorCep(cep: string) {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  const data = await res.json();

  if (data.erro) return null;

  return {
    rua: data.logradouro || "",
    bairro: data.bairro || "",
    cidade: data.localidade || "",
    estado: data.uf || "",
    cep: data.cep || "",
  };
}

async function obterLatLng(endereco: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      endereco
    )}`
  );

  const data = await res.json();

  if (!data || data.length === 0) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}

async function obterEnderecoPorLatLng(lat: number, lon: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );

  const data = await res.json();

  if (!data?.address) return null;

  return {
    rua: data.address.road || "",
    numero: data.address.house_number || "",
    bairro: data.address.suburb || "",
    cidade:
      data.address.city ||
      data.address.town ||
      data.address.village ||
      "",
    estado: data.address.state || "",
    cep: data.address.postcode || "",
  };
}

function MapClick({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e: any) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function CentralizarMapa({ centro }: { centro: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(centro, 15);
  }, [centro, map]);

  return null;
}

export default function EditarPonto() {
  const { id } = useParams();
  const router = useRouter();

  const mapaRef = useRef<HTMLDivElement | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [posicao, setPosicao] = useState<[number, number] | null>(null);
  const [centroMapa, setCentroMapa] = useState<[number, number]>([
    -23.55,
    -46.63,
  ]);

  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [erro, setErro] = useState("");

  function montarEndereco() {
    return [rua, numero, bairro, cep, cidade, estado]
      .filter(Boolean)
      .join(", ");
  }

  useEffect(() => {
    fetch(`/api/pontos/${id}`)
      .then((res) => res.json())
      .then((p) => {
        if (!p) return;

        setNome(p.nome ?? "");
        setDescricao(p.descricao ?? "");

        if (p.endereco) {
          const partes = p.endereco.split(",");

          setRua(partes[0]?.trim() ?? "");
          setNumero(partes[1]?.trim() ?? "");
          setBairro(partes[2]?.trim() ?? "");
          setCidade(partes[3]?.trim() ?? "");
          setEstado(partes[4]?.trim() ?? "");
          setCep(partes[5]?.trim() ?? "");
        }

        if (p.latitude && p.longitude) {
          const pos: [number, number] = [p.latitude, p.longitude];
          setPosicao(pos);
          setCentroMapa(pos);
        }
     });
 }, [id]);

  async function preencherPorCep() {
    const dados = await buscarEnderecoPorCep(cep);

    if (!dados) return;

    setRua(dados.rua);
    setBairro(dados.bairro);
    setCidade(dados.cidade);
    setEstado(dados.estado);
  }

  async function selecionarNoMapa(lat: number, lng: number) {
    setPosicao([lat, lng]);

    const endereco = await obterEnderecoPorLatLng(lat, lng);

    if (!endereco) return;

    setRua(endereco.rua);
    setNumero(endereco.numero);
    setBairro(endereco.bairro);
    setCidade(endereco.cidade);
    setEstado(endereco.estado);
    setCep(endereco.cep);
  }

  async function salvar() {
    setErro("");

    const enderecoCompleto = montarEndereco();

    const geo = await obterLatLng(enderecoCompleto);

    if (!geo) {
      setErro("Endereço não encontrado.");
      return;
    }

    await fetch(`/api/pontos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        descricao,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        latitude: geo.latitude,
        longitude: geo.longitude,
      }),
    });

    router.push("/feed");
  }

  function abrirMapa() {
    setMostrarMapa(true);

    if (posicao) setCentroMapa(posicao);

    setTimeout(() => {
      mapaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold mb-6">Editar Local de recordação</h1>

      <label className="block mb-1 font-medium">Nome</label>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-1 font-medium">Descrição</label>
      <textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-1 font-medium">CEP</label>
      <div className="flex gap-3 mb-4">
        <input
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onBlur={preencherPorCep}
          className="flex-1 border p-2"
        />

        <button
          type="button"
          onClick={abrirMapa}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          🗺️ Ajustar no mapa
        </button>
      </div>

      <label className="block mb-1 font-medium">Rua</label>
      <input
        value={rua}
        onChange={(e) => setRua(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-1 font-medium">Número</label>
      <input
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-1 font-medium">Bairro</label>
      <input
        value={bairro}
        onChange={(e) => setBairro(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-1 font-medium">Cidade</label>
      <input
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <label className="block mb-1 font-medium">Estado</label>
      <input
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      {mostrarMapa && (
        <div ref={mapaRef} className="mt-6">
          <MapContainer center={centroMapa} zoom={15} style={{ height: "300px" }}>
            <CentralizarMapa centro={centroMapa} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClick onSelect={selecionarNoMapa} />
            {posicao && <Marker position={posicao} />}
          </MapContainer>
        </div>
      )}

      {erro && <p className="text-red-600 mt-4">{erro}</p>}

      <div className="flex gap-3 mt-6">
        <button
          onClick={salvar}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Salvar
        </button>

        <button
          onClick={() => router.push("/feed")}
          className="border px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
