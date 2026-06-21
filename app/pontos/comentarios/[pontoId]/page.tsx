"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Comentario = {
  id: number;
  texto: string;
  createdAt: string;
};

type Ponto = {
  id: number;
  nome: string;
};

export default function ComentariosPage() {

  const params = useParams();
  const router = useRouter();
  const pontoId = Number(params.pontoId);

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [ponto, setPonto] = useState<Ponto | null>(null);
  const [abertoId, setAbertoId] = useState<number | null>(null);

  async function carregar() {

    const resComentarios = await fetch(`/api/comentarios?pontoId=${pontoId}`);
    const dataComentarios = await resComentarios.json();
    setComentarios(dataComentarios);

    const resPonto = await fetch(`/api/pontos/${pontoId}`);
    const dataPonto = await resPonto.json();
    setPonto(dataPonto);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id:number){

    await fetch(`/api/comentarios/${id}`,{
      method:"DELETE"
    });

    setComentarios(prev => prev.filter(c => c.id !== id));
  }

  function formatarData(data?: string) {
  if (!data) return "-";

  if (data.includes("/")) return data; 

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
    <div className="p-8 max-w-6xl mx-auto">

      <div className="flex justify-between items-start mb-6">

        <div>

          <h1 className="text-2xl font-bold">
            Comentários do Local
          </h1>

          {ponto && (
            <p className="text-gray-600 mt-1">
              {ponto.nome}
            </p>
          )}

        </div>

        <Link
          href={`/pontos/comentarios/${pontoId}/novo`}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Novo Comentário
        </Link>

      </div>

      {/* LINHA IGUAL DA TELA DE PONTOS */}
      <div className="border-t mb-4"></div>

      <div className="border rounded overflow-hidden">

        <div className="max-h-[400px] overflow-y-auto">

          <table className="w-full border-collapse">

            <thead className="sticky top-0 bg-gray-100 z-10">

              <tr>
                <th className="px-4 py-2 border text-left">Comentário</th>
                <th className="px-4 py-2 border text-left">Data</th>
                <th className="px-4 py-2 border text-center w-32">Ações</th>
              </tr>

            </thead>

            <tbody>

              {comentarios.map((comentario) => (

                <tr key={comentario.id} className="hover:bg-gray-50">

                  <td className="px-4 py-2 border">
                    {comentario.texto}
                  </td>

                  <td className="px-4 py-2 border">
                    {formatarData(comentario.createdAt)}
                  </td>

                  <td className="px-4 py-2 border text-center relative">

                    <button
                      onClick={() =>
                        setAbertoId(
                          abertoId === comentario.id ? null : comentario.id
                        )
                      }
                      className="inline-flex items-center gap-2 border px-3 py-1 rounded bg-white hover:bg-gray-100"
                    >
                      ⚙️ Ações
                    </button>

                    {abertoId === comentario.id && (

                      <div className="absolute right-2 mt-2 w-40 bg-white border rounded shadow-lg z-50">

                        <Link
                          href={`/pontos/comentarios/${pontoId}/editar/${comentario.id}`}
                          onClick={() => setAbertoId(null)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          ✏️ Editar
                        </Link>

                        <button
                          onClick={() => {
                            excluir(comentario.id);
                            setAbertoId(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          🗑️ Excluir
                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))}

              {comentarios.length === 0 && (

                <tr>

                  <td
                    colSpan={3}
                    className="text-center py-6 text-gray-500"
                  >
                    Nenhum comentário cadastrado
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      <div className="mt-6">

        <button
          onClick={()=>router.push("/pontos")}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Voltar
        </button>

      </div>

    </div>
  );
}
