# Split

Sistema de gestão de serviços multi-workspace: cadastro de clientes, prestadores (providers) e serviços, com cálculo automático de valor de venda, custo do prestador e margem por item.

Monorepo simples com duas pastas independentes:

- [`api/`](api) — backend Fastify + TypeScript + PostgreSQL (Drizzle ORM)
- [`web/`](web) — frontend React 19 + Vite + TanStack Router/Query + Tailwind

## Funcionalidades

- Autenticação via cookie de sessão (JWT)
- Workspaces multi-tenant com convite por código (invite code) e troca de workspace
- CRUD de clientes (customers) e prestadores (providers)
- CRUD de serviços com itens, cada item calculando total de venda, total do prestador e margem
- Status de serviço: `pending`, `in_progress`, `completed`, `delivered`, `cancelled`
- Dashboard com cards de resumo

## Stack

**API** (`api/`)
- Fastify 5 + `fastify-type-provider-zod`
- Drizzle ORM + PostgreSQL (`pg`/`postgres`)
- Zod para validação de env e schemas
- `jose` (JWT) + `bcryptjs` (hash de senha) para auth
- Vitest para testes
- `tsup` para build, `tsx` para dev

**Web** (`web/`)
- React 19 + Vite
- TanStack Router (roteamento) + TanStack Query (data fetching)
- Tailwind CSS 4 + componentes shadcn/radix
- React Hook Form + Zod
- Biome/oxlint para lint

## Pré-requisitos

- Node.js >= 22
- pnpm (`corepack enable` já habilita)
- Docker (para subir o PostgreSQL) ou um Postgres local

## Instalação

Clone o repositório e instale as dependências de cada pacote (não há workspace raiz, `api` e `web` são independentes):

```bash
git clone <url-do-repo>
cd split

cd api && pnpm install
cd ../web && pnpm install
```

## Configuração (API)

Copie os arquivos de ambiente de exemplo:

```bash
cd api
cp .env.example .env
cp .env.test.example .env.test
```

Variáveis de `.env`:

| Variável | Descrição | Default |
|---|---|---|
| `NODE_ENV` | `development` \| `preview` \| `production` | `development` |
| `PORT` | Porta HTTP da API | `3333` |
| `DATABASE_URL` | URL de conexão do PostgreSQL | — (obrigatória) |
| `JWT_SECRET` | Segredo para assinar o JWT de sessão | — (obrigatória) |
| `COOKIE_NAME` | Nome do cookie de sessão | `split_session` |
| `CORS_ORIGIN` | Origem permitida no CORS (URL do front) | `*` |

`.env.example` já vem pronto para uso local com o banco do `docker-compose.yml`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://split:split@localhost:5432/split
JWT_SECRET=change-me
COOKIE_NAME=split_session
CORS_ORIGIN=http://localhost:5173
```

## Subindo o banco de dados

Na pasta `api/`, suba o PostgreSQL via Docker Compose:

```bash
cd api
docker compose up -d db
```

Isso cria o banco `split` (usuário/senha `split`/`split`) na porta `5432`.

## Rodando a API em desenvolvimento

```bash
cd api
pnpm db:migrate   # aplica as migrations do Drizzle
pnpm dev          # sobe o servidor com watch (tsx)
```

API disponível em `http://localhost:3333`.

Opcional — popular banco com dados de teste:

```bash
pnpm db:seed
```

### Scripts úteis da API

| Script | Descrição |
|---|---|
| `pnpm dev` | Sobe o servidor em modo watch |
| `pnpm build` | Compila com `tsup` (saída em `dist/`) |
| `pnpm start` | Roda migrations de produção + inicia `dist/server.js` |
| `pnpm test` | Roda os testes com Vitest (usa `.env.test`) |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm typecheck` | Checagem de tipos sem emitir arquivos |
| `pnpm db:generate` | Gera novas migrations a partir do schema Drizzle |
| `pnpm db:migrate` | Aplica migrations (ambiente dev) |
| `pnpm db:migrate:prod` | Aplica migrations (produção, sem carregar `.env`) |
| `pnpm db:studio` | Abre o Drizzle Studio |
| `pnpm db:seed` | Popula o banco com dados de exemplo |

## Rodando o Web em desenvolvimento

Em outro terminal:

```bash
cd web
pnpm dev
```

Front disponível em `http://localhost:5173` (padrão do Vite), já apontando para a API local.

### Scripts úteis do Web

| Script | Descrição |
|---|---|
| `pnpm dev` | Sobe o Vite em modo dev |
| `pnpm build` | Type-check (`tsc -b`) + build de produção |
| `pnpm preview` | Serve o build de produção localmente |
| `pnpm lint` | Lint com oxlint |

## Testes

```bash
cd api
pnpm test
```

Os testes usam o banco definido em `.env.test` — garanta que o container `db` esteja no ar (o `docker-compose.yml` já cria o schema de teste via `docker/init-test-db.sql`).

## Rodando a API via Docker (produção)

A API tem um `_Dockerfile` multi-stage (renomeie para `Dockerfile` para usar) e um `docker-compose.yml` com os serviços `db` e `api`:

```bash
cd api
docker compose up -d --build
```

Isso sobe o Postgres e a API já buildada, expondo a porta `3333`. Ajuste as variáveis de ambiente do serviço `api` no `docker-compose.yml` antes de usar em produção (principalmente `JWT_SECRET` e `CORS_ORIGIN`).

## Estrutura do projeto

```
split/
├── api/
│   ├── src/
│   │   ├── db/           # conexão, schema Drizzle, migrations, seed
│   │   ├── http/
│   │   │   ├── routes/   # rotas Fastify (uma por arquivo, REST)
│   │   │   └── plugins/  # auth, error-handler
│   │   └── lib/          # auth, cálculo de totais, hash, cookies, erros
│   ├── drizzle/          # migrations geradas
│   └── docker-compose.yml
└── web/
    └── src/
        ├── routes/       # rotas TanStack Router (file-based)
        ├── features/     # auth, customers, providers, services, workspaces
        ├── components/   # componentes de UI (shadcn) e app-shell
        └── lib/          # cliente HTTP, query client, utils
```

## Fluxo de uso

1. Criar usuário (`/register`) e workspace
2. Convidar membros com o código de convite do workspace (`join-workspace`)
3. Cadastrar clientes e prestadores
4. Criar serviços vinculados a um cliente (e opcionalmente um prestador), adicionando itens com quantidade, preço de venda e custo do prestador
5. Acompanhar status do serviço e a margem calculada automaticamente
