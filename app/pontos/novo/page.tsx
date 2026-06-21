"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

async function obterEnderecoPorLatLng(lat: number, lon: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );

  const data = await res.json();

  if (!data?.address) return null;

  return {
    rua: data.address.road || "",
    bairro: data.address.suburb || "",
    cidade:
      data.address.city ||
      data.address.town ||
      data.address.village ||
      "",
    estado: data.address.state || "",
    cep: data.address.postcode || "",
    pais: data.address.country || "Brasil",
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


function AjustarMapa() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}


export default function NovoPonto() {
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
  const [pais, setPais] = useState("Brasil");

  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [posicao, setPosicao] = useState<[number, number] | null>(null);

  const [centroMapa, setCentroMapa] = useState<[number, number]>([
    -23.55,
    -46.63,
  ]);

  const [erro, setErro] = useState("");


  function montarEndereco() {
    return [rua, numero, bairro, cep, cidade, estado, pais]
      .filter(Boolean)
      .join(", ");
  }


  function centralizarNaLocalizacaoAtual() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCentroMapa([
          pos.coords.latitude,
          pos.coords.longitude,
        ]);
      },
      () => {
        setCentroMapa([-23.55, -46.63]);
      }
    );
  }


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
    setBairro(endereco.bairro);
    setCidade(endereco.cidade);
    setEstado(endereco.estado);
    setCep(endereco.cep);
    setPais(endereco.pais);
  }


  async function salvar() {
    setErro("");

    const enderecoCompleto = montarEndereco();
    const geo = await obterLatLng(enderecoCompleto);

    if (!geo) {
      setErro("Endereço não encontrado.");
      return;
    }

    const res = await fetch("/api/pontos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        descricao,
        rua,
        numero,
        cep,
        cidade,
        bairro,
        estado,
        latitude: geo.latitude,
        longitude: geo.longitude,
      }),
    });

    if (!res.ok) {
  setErro("Erro ao salvar ponto.");
  return;
}

const pontoCriado = await res.json();

router.push(`/pontos/fotos/${pontoCriado.id}`);
  }


  useEffect(() => {
    if (mostrarMapa && mapaRef.current) {
      mapaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mostrarMapa]);


  return (
    <div className="p-8 max-w-xl">

      <h1 className="text-xl font-bold mb-6">
        Novo Local de Recrodação
      </h1>


      <label className="block mb-1 font-medium">Nome</label>
      <input
        className="w-full border p-2 mb-4"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />


      <label className="block mb-1 font-medium">Descrição</label>
      <textarea
        className="w-full border p-2 mb-4"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />


      <label className="block mb-1 font-medium">
        CEP
      </label>

      <div className="flex gap-3 mb-4">

        <input
          className="flex-1 border p-2"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onBlur={preencherPorCep}
        />

        <button
          type="button"
          onClick={() => {
            const novo = !mostrarMapa;
            setMostrarMapa(novo);

            if (novo) {
              centralizarNaLocalizacaoAtual();
            }
          }}
          className="bg-black text-white px-4 py-2 rounded whitespace-nowrap"
        >
          🗺️ Mapa
        </button>

      </div>


      <label className="block mb-1 font-medium">Rua</label>
      <input
        className="w-full border p-2 mb-4"
        value={rua}
        onChange={(e) => setRua(e.target.value)}
      />


      <label className="block mb-1 font-medium">Número</label>
      <input
        className="w-full border p-2 mb-4"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />


      <label className="block mb-1 font-medium">Bairro</label>
      <input
        className="w-full border p-2 mb-4"
        value={bairro}
        onChange={(e) => setBairro(e.target.value)}
      />


      <label className="block mb-1 font-medium">Cidade</label>
      <input
        className="w-full border p-2 mb-4"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
      />


      <label className="block mb-1 font-medium">Estado</label>
      <input
        className="w-full border p-2 mb-4"
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      />


      {mostrarMapa && (
        <div ref={mapaRef} className="mt-6">

          <MapContainer
            center={centroMapa}
            zoom={15}
            style={{
              height: "300px",
              width: "100%",
            }}
          >

            <AjustarMapa />

            <CentralizarMapa centro={centroMapa} />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClick onSelect={selecionarNoMapa} />

            {posicao && (
              <Marker position={posicao} />
            )}

          </MapContainer>

        </div>
      )}


      {erro && (
        <p className="text-red-600 mt-4">
          {erro}
        </p>
      )}


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
