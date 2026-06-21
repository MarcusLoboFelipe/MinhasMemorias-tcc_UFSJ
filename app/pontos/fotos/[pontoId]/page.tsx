"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FotosPage() {
  const { pontoId } = useParams();
  const router = useRouter();

  const [fotos, setFotos] = useState<any[]>([]);
  const [pontoNome, setPontoNome] = useState("");

  const [fotoParaExcluir, setFotoParaExcluir] = useState<number | null>(null);

  async function carregar() {
    const resFotos = await fetch(`/api/fotos?pontoId=${pontoId}`);
    const dataFotos = await resFotos.json();
    setFotos(dataFotos);

    const resPonto = await fetch(`/api/pontos/${pontoId}`);
    const dataPonto = await resPonto.json();
    setPontoNome(dataPonto.nome);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusaoFoto() {
    if (!fotoParaExcluir) return;

    await fetch(`/api/fotos/${fotoParaExcluir}`, {
      method: "DELETE",
    });

    setFotoParaExcluir(null);
    carregar();
  }

  function formatarData(data?: string) {
    if (!data) return "-";

    const d = new Date(data);

    return (
      d.getDate().toString().padStart(2, "0") +
      "/" +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      d.getFullYear()
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Cadastrar Fotos
            </h1>

            <p className="text-gray-600 mt-1">
              {pontoNome}
            </p>
          </div>

          <button
            onClick={() => router.push(`/pontos/fotos/${pontoId}/nova`)}
            className="bg-black text-white px-5 py-2 rounded hover:opacity-90"
          >
            Nova Foto
          </button>

        </div>

        <hr className="my-6" />

        {fotos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-60 text-gray-500">

            <p className="mb-6 text-lg">
              Nenhuma foto cadastrada
            </p>

            <button
              onClick={() => router.push("/feed")}
              className="border px-4 py-2 rounded hover:bg-gray-100"
            >
              Voltar
            </button>

          </div>
        )}

        {fotos.length > 0 && (

          <>
            {/* GRID DE FOTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

              {fotos.map((foto) => (

                <div
                  key={foto.id}
                  className="border rounded overflow-hidden bg-white shadow-sm"
                >

                  <img
                    src={foto.url}
                    className="w-full h-[180px] object-cover"
                  />

                  <div className="flex justify-between items-center p-3">

                    <span className="text-gray-500 text-sm">
                      {formatarData(foto.data)}
                    </span>

                    <button
                      onClick={() => setFotoParaExcluir(foto.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Excluir
                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push("/feed")}
                className="border px-4 py-2 rounded hover:bg-gray-100"
              >
                Voltar
              </button>
            </div>
          </>
        )}

      </div>

      {/* MODAL DE EXCLUSÃO */}
      {fotoParaExcluir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded shadow-lg w-[300px]">

            <h2 className="font-bold mb-3">
              Excluir foto
            </h2>

            <p className="mb-4">
              Tem certeza que deseja excluir esta foto?
            </p>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setFotoParaExcluir(null)}
                className="border px-3 py-1 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarExclusaoFoto}
                className="bg-red-600 text-white px-3 py-1 rounded"
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
