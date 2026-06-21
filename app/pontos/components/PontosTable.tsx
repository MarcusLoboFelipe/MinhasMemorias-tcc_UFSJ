"use client";

import { useState } from "react";
import Link from "next/link";
import { Ponto } from "@/types/Ponto";

type Props = {
  pontos: Ponto[];
  onExcluir: (id: number) => void;
};

export default function PontosTable({ pontos, onExcluir }: Props) {
  const [abertoId, setAbertoId] = useState<number | null>(null);
  const [confirmar, setConfirmar] = useState<Ponto | null>(null);

  function formatarData(data?: string) {
    if (!data) return "-";

    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  }

  if (!pontos || pontos.length === 0) {
    return (
      <p className="text-center text-gray-500 py-6">
        Nenhum local de recordação cadastrado
      </p>
    );
  }

  return (
    <div className="border rounded overflow-hidden">
      <div className="max-h-[65vh] overflow-y-auto relative">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="px-4 py-2 border text-left">Nome</th>
              <th className="px-4 py-2 border text-left">Descrição</th>
              <th className="px-4 py-2 border text-left">Endereço</th>
              <th className="px-4 py-2 border text-left">Data cadastro</th>
              <th className="px-4 py-2 border text-left">Latitude</th>
              <th className="px-4 py-2 border text-left">Longitude</th>
              <th className="px-4 py-2 border text-center w-32">Ações</th>
            </tr>
          </thead>

          <tbody>
            {pontos.map((ponto) => (
              <tr key={ponto.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{ponto.nome}</td>

                <td className="px-4 py-2 border">
                  {ponto.descricao}
                </td>

                <td className="px-4 py-2 border">
                  {ponto.endereco || "-"}
                </td>

                <td className="px-4 py-2 border">
                  {formatarData(ponto.dataCadastro)}
                </td>

                <td className="px-4 py-2 border">
                  {ponto.latitude ?? "-"}
                </td>

                <td className="px-4 py-2 border">
                  {ponto.longitude ?? "-"}
                </td>

                <td className="px-4 py-2 border text-center relative">
                  <button
                    onClick={() =>
                      setAbertoId(
                        abertoId === ponto.id ? null : ponto.id
                      )
                    }
                    className="inline-flex items-center gap-2 border px-3 py-1 rounded bg-white hover:bg-gray-100"
                  >
                    ⚙️ Ações
                  </button>

                  {abertoId === ponto.id && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                      
                      <Link
                        href={`/pontos/comentarios/${ponto.id}`}
                        onClick={() => setAbertoId(null)}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        💬 Comentários
                      </Link>

                      <Link
                        href={`/pontos/fotos/${ponto.id}`}
                        onClick={() => setAbertoId(null)}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        📸 Fotos
                      </Link>

                      <Link
                        href={`/pontos/editar/${ponto.id}`}
                        onClick={() => setAbertoId(null)}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        ✏️ Editar
                      </Link>

                      <button
                        onClick={() => {
                          setConfirmar(ponto);
                          setAbertoId(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-2">
              Excluir local
            </h2>

            <p className="mb-4">
              Tem certeza que deseja excluir o local{" "}
              <strong>{confirmar.nome}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmar(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  onExcluir(confirmar.id);
                  setConfirmar(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
