import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { enviarEmail } from "../../../lib/email";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const token = crypto.randomBytes(32).toString("hex");

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailValido.test(body.email)) {
  return NextResponse.json(
    { erro: "Email inválido." },
    { status: 400 }
  );
}

    const senhaHash = await bcrypt.hash(body.senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome: body.nome,
        email: body.email,
        senha: senhaHash,
        tokenVerificacao: token,
        emailVerificado: false
      }
    });

 await enviarEmail(
  body.email,
  "Bem-vindo as Minhas Memórias",
  `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      
      <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <h2 style="color: #111; margin-bottom: 10px;">
          Bem-vindo as Minhas Memórias
        </h2>

        <p style="margin: 0 0 15px 0;">
          Olá, <strong>${body.nome}</strong>,
        </p>

        <p style="margin-bottom: 20px;">
          Sua conta foi criada com sucesso. Agora você já pode acessar a plataforma e explorar os pontos turísticos.
        </p>

        <!-- BOTÃO -->
        <div style="text-align: center; margin: 25px 0;">
          <a 
            href="http://localhost:3000"
            style="
              background-color: #2563eb;
              color: white;
              padding: 12px 22px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              display: inline-block;
            "
          >
            Acessar sistema
          </a>
        </div>

        <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #777; text-align: center;">
          Caso não tenha sido você que realizou este cadastro,<br/>
          recomendamos que entre em contato com o suporte.
        </p>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 10px;">
          © Minhas Memórias - Todos os direitos reservados
        </p>

      </div>

    </div>
  `
);

    return NextResponse.json(usuario);

  } catch (error: any) {

    if (error.code === "P2002") {
      return NextResponse.json(
        { erro: "Este email já está cadastrado." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erro: "Erro ao cadastrar usuário." },
      { status: 500 }
    );
  }

}

export async function PUT(req: Request) {

  try {

    const cookieStore = await cookies();
    const usuarioCookie = cookieStore.get("usuario");

    if (!usuarioCookie) {
      return NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const usuarioLogado = JSON.parse(usuarioCookie.value);
    const body = await req.json();

    let dados: any = {
      nome: body.nome,
      email: body.email
    };

    if (body.senha && body.senha.trim() !== "") {
      dados.senha = await bcrypt.hash(body.senha, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioLogado.id },
      data: dados
    });

    return NextResponse.json(usuario);

  } catch (error) {

    return NextResponse.json(
      { erro: "Erro ao atualizar usuário." },
      { status: 500 }
    );
  }

}

export async function DELETE() {

  try {

    const cookieStore = await cookies();
    const usuarioCookie = cookieStore.get("usuario");

    if (!usuarioCookie) {
      return NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const usuarioLogado = JSON.parse(usuarioCookie.value);

    await prisma.usuario.delete({
      where: { id: usuarioLogado.id }
    });

    return NextResponse.json({ sucesso: true });

  } catch (error) {

    return NextResponse.json(
      { erro: "Erro ao excluir conta." },
      { status: 500 }
    );
  }

}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const usuarioCookie = cookieStore.get("usuario");

    if (!usuarioCookie) return NextResponse.json([]);

    const usuario = JSON.parse(usuarioCookie.value);

    const seguindo = await prisma.seguidor.findMany({
      where: {
        seguidorId: usuario.id,
      },
      select: {
        seguindoId: true,
      },
    });

    const idsSeguindo = seguindo.map((s) => s.seguindoId);

    const usuarios = await prisma.usuario.findMany({
      where: {
        NOT: {
          id: usuario.id,
        },
      },
    });

    const resultado = usuarios.map((u) => ({
      ...u,
      seguindo: idsSeguindo.includes(u.id),
    }));

    return NextResponse.json(resultado);

  } catch (error) {
    console.log(error);
    return NextResponse.json([]);
  }
}
