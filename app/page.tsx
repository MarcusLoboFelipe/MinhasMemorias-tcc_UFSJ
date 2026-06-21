"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  async function login(e: any) {

    e.preventDefault();
    setErro("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        senha
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.erro || "Erro ao fazer login.");
      return;
    }

    router.push("/feed");
  }

  return (

    <div className="flex items-center justify-between min-h-screen bg-gray-200 px-16">

      {/* TEXTO ESQUERDA */}
      <div className="max-w-xl">

        <h1 className="text-5xl font-bold mb-6">
          Minhas Memórias
        </h1>

        <p className="text-lg mb-4 text-gray-700">
          Cadastre e visualize locais de recordação com informações completas,
          incluindo localização, fotos e comentários.
        </p>

        <p className="text-lg text-gray-700">
          Ideal para organizar e compartilhar locais interessantes da cidade.
        </p>

      </div>


      {/* LOGIN DIREITA */}
      <form
        onSubmit={login}
        autoComplete="off"
        className="bg-white p-8 rounded shadow w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <label>Email</label>

        <input
          type="email"
          name="email_fake"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-4 bg-white"
          placeholder="Digite seu email"
        />

        <label>Senha</label>

        <div className="flex items-center border mb-4 bg-white">

          <input
            type={mostrarSenha ? "text" : "password"}
            name="senha_fake"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 outline-none bg-white"
            placeholder="Digite sua senha"
          />

          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="px-3 text-gray-600"
          >
            {mostrarSenha ? "👁" : "👁"}
          </button>

        </div>

        {erro && (
          <p className="text-red-600 mb-4">
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="bg-black text-white w-full py-2 rounded mb-4"
        >
          Entrar
        </button>

        <div className="text-center text-sm flex flex-col gap-2">

          <a href="/esqueci-senha" className="text-blue-600 hover:underline">
            Esqueci minha senha
          </a>

          <a href="/cadastro" className="text-blue-600 hover:underline">
            Cadastre-se
          </a>

        </div>

      </form>

    </div>
  );
}
