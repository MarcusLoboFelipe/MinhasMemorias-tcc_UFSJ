# GeoTur

GeoTur é uma plataforma web desenvolvida para o compartilhamento e gerenciamento de pontos turísticos. O sistema permite que usuários cadastrem locais de interesse, publiquem fotografias, realizem comentários e interajam com outros usuários por meio de um sistema de seguidores.

Além de funcionar como um guia colaborativo de pontos turísticos, a plataforma também atua como um álbum digital de recordações, permitindo o registro e compartilhamento de experiências de viagem.

## Tecnologias Utilizadas

### Frontend

* React
* Next.js
* TypeScript
* CSS

### Backend

* Node.js
* Next.js API Routes

### Banco de Dados

* PostgreSQL
* Prisma ORM

### Bibliotecas Utilizadas

* NextAuth (autenticação)
* Nodemailer (envio de e-mails)
* Bcrypt (criptografia de senhas)
* Leaflet e React-Leaflet (mapas interativos)

## Pré-requisitos

Antes de executar o projeto, certifique-se de possuir instalado:

* Node.js (versão 18 ou superior)
* PostgreSQL
* NPM ou Yarn

Verifique as versões instaladas:

```bash
node -v
npm -v
```

## Instalação

Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/next-teste2.git
```

Acesse a pasta do projeto:

```bash
cd next-teste2
```

Instale as dependências:

```bash
npm install
```

## Configuração do Banco de Dados

Crie um banco de dados PostgreSQL e configure as variáveis de ambiente no arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/geotur"
```

Execute as migrações do Prisma:

```bash
npx prisma migrate deploy
```

Ou, durante o desenvolvimento:

```bash
npx prisma migrate dev
```

## Executando o Projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Funcionalidades

* Cadastro e autenticação de usuários
* Recuperação de senha por e-mail
* Cadastro de pontos turísticos
* Upload de fotografias
* Comentários em publicações
* Sistema de seguidores
* Feed de publicações
* Exploração de conteúdos compartilhados
* Visualização de pontos turísticos em mapa
* Gerenciamento de perfil

## Estrutura Geral do Projeto

```text
app/
├── api/
├── cadastro/
├── login/
├── feed/
├── explorar/
├── pontos/
├── resetar-senha/
└── esqueci-senha/

prisma/
public/
lib/
```

## Autor

Marcus Vinícius Silva Lobo Felipe

Universidade Federal de São João del-Rei (UFSJ)

Curso de Ciência da Computação

## Licença

Este projeto foi desenvolvido para fins acadêmicos como Trabalho de Conclusão de Curso (TCC) do Bacharelado em Ciência da Computação da UFSJ.
