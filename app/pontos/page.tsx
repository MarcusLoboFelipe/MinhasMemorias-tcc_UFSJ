"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PontosTable from "./components/PontosTable";
import { Ponto } from "@/types/Ponto";

export default function PontosPage() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  async function carregar() {
    const res = await fetch("/api/pontos");
    const data = await res.json();
    setPontos(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id: number) {
    await fetch(`/api/pontos/${id}`, { method: "DELETE" });
    setPontos((prev) => prev.filter((p) => p.id !== id));
  }

  const pontosFiltrados = pontos.filter((ponto) => {
    if (!filtro) return true;

    const termo = filtro.toLowerCase();

    return (
      ponto.nome.toLowerCase().includes(termo) ||
      (ponto.endereco ?? "").toLowerCase().includes(termo)
    );
  });

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">
            Locais de Recordação
          </h1>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMostrarFiltro((v) => !v)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                🔍 Filtro
              </button>

              {mostrarFiltro && (
                <input
                  type="text"
                  placeholder="Filtrar por nome ou endereço..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="border px-3 py-2 rounded w-72"
                  autoFocus
                />
              )}
            </div>

            <Link
              href="/pontos/novo"
              className="bg-black text-white px-4 py-2 rounded whitespace-nowrap"
            >
              Novo Local de Interesse
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 h-full">
          <div className="h-full overflow-y-auto">
            <PontosTable
              pontos={pontosFiltrados}
              onExcluir={excluir}
            />

            {pontosFiltrados.length === 0 && filtro && (
              <p className="text-center text-gray-500 mt-6">
                Nenhum local encontrado para{" "}
                <strong>"{filtro}"</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
