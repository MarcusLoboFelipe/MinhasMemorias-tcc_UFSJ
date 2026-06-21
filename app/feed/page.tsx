"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Trash2, Pencil, MapPin,Camera, MessageCircle, Settings } from "lucide-react";
import { Home, Search, Users } from "lucide-react";
import { Plus } from "lucide-react";
import { MoreVertical } from "lucide-react";



export default function FeedPage() {
  const router = useRouter();

  const [pontos, setPontos] = useState<any[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  const [modalUsuarios, setModalUsuarios] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [seguindo, setSeguindo] = useState<number[]>([]);

  const [comentarios, setComentarios] = useState<{ [key: number]: string }>({});
  const [abrirComentario, setAbrirComentario] = useState<{ [key: number]: boolean }>({});
  const [editandoComentario, setEditandoComentario] = useState<{ [key: number]: boolean }>({});
  const [textoEditado, setTextoEditado] = useState<{ [key: number]: string }>({});
  const [mostrarComentarios, setMostrarComentarios] = useState<{ [key: number]: boolean }>({});
  const [fotoAtual, setFotoAtual] = useState<{ [key: number]: number }>({});

  const [busca, setBusca] = useState("");

  const [comentarioParaExcluir, setComentarioParaExcluir] = useState<number | null>(null);

  const [acoesAberto, setAcoesAberto] = useState<{ [key: number]: boolean }>({});
  const [pontoParaExcluir, setPontoParaExcluir] = useState<number | null>(null);

  useEffect(() => {
    carregar();
    pegarUsuario();
  }, []);

  async function carregar() {
    const res = await fetch("/api/feed");
    const data = await res.json();
    setPontos(data);
  }

  function pegarUsuario() {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("usuario="));

    if (cookie) {
      const dados = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
      setUsuario(dados);
    }
  }

  function logout() {
    document.cookie = "usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  }

  async function confirmarExclusaoPonto() {
    if (!pontoParaExcluir) return;

    await fetch(`/api/pontos/${pontoParaExcluir}`, {
      method: "DELETE",
    });

    setPontoParaExcluir(null);
    carregar();
  }

  async function comentar(pontoId: number) {
    const texto = comentarios[pontoId];
    if (!texto) return;

    await fetch("/api/comentarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texto, pontoId }),
    });

    setComentarios((prev) => ({ ...prev, [pontoId]: "" }));
    setAbrirComentario((prev) => ({ ...prev, [pontoId]: false }));
    carregar();
  }

  async function confirmarExclusaoComentario() {
    if (!comentarioParaExcluir) return;

    await fetch(`/api/comentarios/${comentarioParaExcluir}`, {
      method: "DELETE",
    });

    setComentarioParaExcluir(null);
    carregar();
  }

  async function carregarUsuarios() {
  const res = await fetch("/api/seguidores");
  const data = await res.json();

  setUsuarios(data.usuarios);
  setSeguindo(data.seguindo);
  }

  async function salvarEdicaoComentario(id: number) {
    const texto = textoEditado[id];
    if (!texto) return;

    await fetch(`/api/comentarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texto }),
    });

    setEditandoComentario((prev) => ({ ...prev, [id]: false }));
    carregar();
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* HEADER */}
      <div className="bg-black text-white flex justify-between items-center px-4 py-2">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuAberto(!menuAberto)}>☰</button>
          <span>Minhas Memórias</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span>Bem-vindo, {usuario?.nome}</span>
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* MENU */}
        {menuAberto && (
          <div className="w-60 bg-gray-100 border-r min-h-screen">
            <div className="p-4 font-bold border-b">Menu</div>

            <div className="p-4 flex flex-col gap-3 text-sm">
              <div onClick={() => router.push("/feed")} className="cursor-pointer hover:text-blue-600">
                📰 Feed
              </div>

              <div 
               onClick={() => router.push("/explorar")} className="cursor-pointer hover:text-blue-600">
                🔎 Explorar
              </div>

              <div onClick={() => router.push("/pontos")} className="cursor-pointer hover:text-blue-600">
                📍 Locais de Recordação
              </div>

              <div
  onClick={() => router.push("/pontos/meu-cadastro")}
  className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
>
  <User size={16} />
  Meu Cadastro
</div>
             <div
  onClick={() => {
    setModalUsuarios(true);
    carregarUsuarios();
  }}
  className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
>
  <Users size={16} />
  Usuários
</div>
            </div>
          </div>
        )}

        {/* CONTEÚDO */}
        <div className="flex-1 p-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Feed</h1>

            <button
              onClick={() => router.push("/pontos/novo")}
              className="flex items-center gap-2 bg-white text-black border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-200 text-sm font-medium"
            >
              <Plus size={18} />
            Cadastrar Local
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {pontos.map((ponto) => (
              <div key={ponto.id} className="bg-white p-4 rounded shadow">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
  <User size={16} />
  <span>{ponto.usuario.nome}</span>
</div>

                  <div className="relative">
                    
                    <button
  onClick={() =>
    setAcoesAberto((prev) => ({
      ...prev,
      [ponto.id]: !prev[ponto.id],
    }))
  }
  className="p-2 rounded-full hover:bg-gray-200 transition"
>
  <MoreVertical size={18} />
</button>

                    {acoesAberto[ponto.id] && (
                      <div className="absolute right-0 mt-2 bg-white border rounded shadow w-44 z-50 overflow-hidden">
                        <div
  onClick={() => router.push(`/pontos/editar/${ponto.id}`)}
  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
>
  <Pencil size={16} />
  <span>Editar</span>
</div>

                        <div
  onClick={() => router.push(`/pontos/fotos/${ponto.id}`)}
  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
>
  <Camera size={16} />
  <span>Fotos</span>
</div>

                        <div
  onClick={() => setPontoParaExcluir(ponto.id)}
  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
>
  <Trash2 size={16} />
  <span>Excluir</span>
</div>
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-2">{ponto.nome}</h2>

                {ponto.fotos?.length > 0 && (
  <div className="relative">

    <img
      src={
        ponto.fotos[fotoAtual[ponto.id] ?? 0].url.startsWith("/uploads")
          ? ponto.fotos[fotoAtual[ponto.id] ?? 0].url
          : `/uploads/${ponto.fotos[fotoAtual[ponto.id] ?? 0].url}`
      }
      className="w-full h-[300px] object-cover rounded mb-3"
    />

    {/* BOTÃO ESQUERDA */}
    {(fotoAtual[ponto.id] ?? 0) > 0 && (
      <button
        onClick={() =>
          setFotoAtual(prev => ({
            ...prev,
            [ponto.id]: (prev[ponto.id] ?? 0) - 1,
          }))
        }
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70"
      >
        ←
      </button>
    )}

    {/* BOTÃO DIREITA */}
    {(fotoAtual[ponto.id] ?? 0) < ponto.fotos.length - 1 && (
      <button
        onClick={() =>
          setFotoAtual(prev => ({
            ...prev,
            [ponto.id]: (prev[ponto.id] ?? 0) + 1,
          }))
        }
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70"
      >
        →
      </button>
    )}

  </div>
)}

                <p className="mb-2">{ponto.descricao}</p>
                <p className="text-sm text-gray-500 mb-3">📍 {ponto.endereco}</p>

                <hr className="my-3" />

                {/* COMENTÁRIOS */}
                <button
                  onClick={() =>
                    setMostrarComentarios((prev) => ({
                      ...prev,
                      [ponto.id]: !prev[ponto.id],
                    }))
                  }
                  className="text-sm text-gray-600 hover:underline mb-2"
                >
                  {mostrarComentarios[ponto.id]
                    ? "Ocultar comentários"
                    : `Ver comentários (${ponto.comentarios.length})`}
                </button>

                {mostrarComentarios[ponto.id] && (
                  <div>

                    {ponto.comentarios.map((c: any) => (
                      <div key={c.id} className="flex justify-between text-sm mb-1">

                        {!editandoComentario[c.id] ? (
                          <div>
                            <strong>{c.usuario.nome}:</strong> {c.texto}
                          </div>
                        ) : (
                          <input
                            value={textoEditado[c.id] ?? ""}
                            onChange={(e) =>
                              setTextoEditado({
                                ...textoEditado,
                                [c.id]: e.target.value,
                              })
                            }
                            className="border border-gray-300 bg-white p-1 text-sm w-full rounded"
                          />
                        )}

                       {c.usuario.id === usuario?.id && (
  <div className="flex gap-2">

    {!editandoComentario[c.id] ? (
      <>
        <button
          onClick={() => {
            setEditandoComentario(prev => ({ ...prev, [c.id]: true }));
            setTextoEditado(prev => ({ ...prev, [c.id]: c.texto }));
          }}
        >
          ✏️
        </button>

        <button
          onClick={() => setComentarioParaExcluir(c.id)}
          className="text-red-600 hover:text-red-800"
        >
          🗑
        </button>
      </>
    ) : (
      <>
        <button onClick={() => salvarEdicaoComentario(c.id)}>✔</button>
        <button onClick={() => setEditandoComentario(prev => ({ ...prev, [c.id]: false }))}>❌</button>
      </>
    )}

  </div>
)}
                      </div>
                    ))}

                    {!abrirComentario[ponto.id] && (
                      <button
                        onClick={() =>
                          setAbrirComentario(prev => ({
                            ...prev,
                            [ponto.id]: true,
                          }))
                        }
                        className="mt-3 text-blue-600 text-sm hover:underline font-medium"
                      >
                        💬 Comentar
                      </button>
                    )}

                    {abrirComentario[ponto.id] && (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={comentarios[ponto.id] || ""}
                          onChange={(e) =>
                            setComentarios({
                              ...comentarios,
                              [ponto.id]: e.target.value,
                            })
                          }
                          className="flex-1 border border-gray-300 bg-white p-2 text-sm rounded"
                          placeholder="Escreva um comentário..."
                        />

                        <button
                          onClick={() => comentar(ponto.id)}
                          className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
                        >
                          Enviar
                        </button>

                        <button
                          onClick={() =>
                            setAbrirComentario(prev => ({
                              ...prev,
                              [ponto.id]: false,
                            }))
                          }
                          className="text-gray-500"
                        >
                          ❌
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL PONTO */}
      {pontoParaExcluir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="font-bold mb-3">Excluir local de recordação</h2>
            <p className="mb-4">Tem certeza?</p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setPontoParaExcluir(null)} className="border px-3 py-1 rounded">
                Cancelar
              </button>

              <button onClick={confirmarExclusaoPonto} className="bg-red-600 text-white px-3 py-1 rounded">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {modalUsuarios && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    
    <div className="bg-white w-[380px] rounded-2xl shadow-2xl p-5 animate-fadeIn">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="font-semibold text-lg">👥 Usuários</h2>

        <button
          onClick={() => setModalUsuarios(false)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          ✕
        </button>
      </div>

      {/* 🔍 BUSCA */}
<input
  type="text"
  placeholder="Buscar usuário..."
  value={busca}
  onChange={(e) => setBusca(e.target.value)}
  className="w-full mb-3 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

      {/* LISTA */}
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">

        {usuarios.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase())
  ).map((u) => (
          <div
            key={u.id}
            className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                {u.nome[0]?.toUpperCase()}
              </div>

              <span className="text-sm font-medium">{u.nome}</span>
            </div>

            <button
              onClick={async () => {
                const jaSegue = seguindo.includes(u.id);

                await fetch("/api/seguidores", {
                  method: jaSegue ? "DELETE" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ seguindoId: u.id }),
                });

                carregarUsuarios();
              }}
              className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                seguindo.includes(u.id)
                  ? "bg-gray-400 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {seguindo.includes(u.id) ? "Seguindo" : "Seguir"}
            </button>
          </div>
        ))}

      </div>

      {/* FOOTER */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={() => setModalUsuarios(false)}
          className="border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition"
        >
          Fechar
        </button>
      </div>

    </div>
  </div>
)}

      {/* MODAL COMENTÁRIO */}
      {comentarioParaExcluir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="font-bold mb-3">Excluir comentário</h2>
            <p className="mb-4">Tem certeza?</p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setComentarioParaExcluir(null)} className="border px-3 py-1 rounded">
                Cancelar
              </button>

              <button onClick={confirmarExclusaoComentario} className="bg-red-600 text-white px-3 py-1 rounded">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
