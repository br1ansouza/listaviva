<div align="center">

<img src="frontend/public/icons/icon-192.png" alt="ListaViva" width="88" height="88">

# ListaViva

**Listas colaborativas em tempo real, sem cadastro.**
Cria a lista, escolhe a validade do link, manda no WhatsApp — quem abrir edita junto, ao vivo.

[![CI](https://github.com/br1ansouza/listaviva/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/br1ansouza/listaviva/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/br1ansouza/listaviva?label=release)](https://github.com/br1ansouza/listaviva/releases)
[![Rails](https://img.shields.io/badge/Rails-8.1-CC0000)](https://rubyonrails.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)

[**Abrir o app**](https://listaviva.br1ansouza.workers.dev) · [Releases](https://github.com/br1ansouza/listaviva/releases) · [Pacotes](https://github.com/br1ansouza/listaviva/pkgs/container/listaviva%2Fapi)

</div>

---

## Como funciona

1. Abre o app e cria uma lista — sem login, sem e-mail, sem nada.
2. Escolhe o tipo (tarefas, compras, evento, refeições, ideias), o título, a cor e o ícone.
3. Anota os itens. Tudo já fica salvo, mesmo antes de compartilhar.
4. Compartilha e escolhe por quanto tempo o link vale: **8 horas, 1 dia ou 1 semana**.
5. Quem abre o link entra na mesma sala e edita junto — riscou um item, todo mundo vê na hora.
6. Quando o link expira, quem criou continua com a lista no histórico e gera um link novo.

Não existe tabela de usuários. A identidade é um UUID de aparelho, guardado em três lugares que
se curam entre si (`localStorage`, cookie de 400 dias e `navigator.storage.persist()`), enviado
no header `X-Device-Id`. O nome que aparece nos itens é escolhido no primeiro acesso e viaja em
`X-Device-Name` — carimbado no item na hora da escrita.

## Stack

| Camada | O que roda |
|---|---|
| Frontend | React 19 · TypeScript 7 (tsgo) · Rsbuild · Tailwind CSS 4 · shadcn/ui · `motion` · `zustand` · bun |
| Backend | Rails 8.1 API-only · Action Cable sobre **Solid Cable** (pub/sub no Postgres, sem Redis) · Solid Queue |
| Banco | PostgreSQL |
| Lint | Biome no frontend, `rubocop-rails-omakase` no backend |
| Infra | Neon (banco) · Render (API) · Cloudflare Workers (estático) — tudo em free tier |

O real-time não usa polling: toda escrita persiste e depois faz `broadcast` no canal da lista,
e o cliente aplica de forma otimista e reconcilia. Conflito de item é resolvido por
last-write-wins — sem CRDT, porque os itens já são granulares o bastante.

## Rodar local

Ruby não precisa estar instalado: o backend roda em container.

```bash
cp .env.example .env   # preencher
./scripts/dev.sh
```

Frontend em `http://localhost:5173`, API em `http://localhost:3000`.

O `scripts/dev.sh` também configura `core.hooksPath` para `.githooks/`, então o `pre-commit`
roda Biome + `tsc` quando há mudança no `frontend/` e Rubocop quando há no `backend/`.

### Comandos úteis

```bash
# frontend
cd frontend
bun run dev          # servidor de desenvolvimento
bun run check        # biome + tsc
bun run verify       # biome + tsc + build
bun run deploy       # build + wrangler deploy

# backend (sempre em container)
docker compose run --rm api bin/rails console
docker compose run --rm api bin/rails db:migrate
docker compose run --rm api bin/rubocop
```

## API

| Método | Rota | Uso |
|---|---|---|
| `POST` | `/api/lists` | cria a lista (sem token, sem expiração) |
| `GET` | `/api/lists/mine` | histórico do aparelho |
| `PATCH` | `/api/lists/:id` | título, cor, ícone |
| `POST` | `/api/lists/:id/share` | gera `share_token` e `expires_at` (`8h`, `1d`, `1w`) |
| `GET` | `/api/lists/by_token/:token` | entra na sala; `410` se expirou e não for o criador |
| `POST/PATCH/DELETE` | `/api/lists/:id/items[/:id]` | itens |
| `GET` | `/cable` | Action Cable (WebSocket) |

Headers em toda requisição: `X-Device-Id` sempre, `X-Device-Name` quando a pessoa escolheu um
nome, `X-Share-Token` para quem entrou pelo link.

## Pacotes

A imagem Docker do backend é publicada no GitHub Container Registry a cada tag `v*`:

```bash
docker pull ghcr.io/br1ansouza/listaviva/api:latest
```

## Releases

Cada tag `v*` publica a imagem do backend e um release com o bundle do frontend anexado.

```bash
git tag v1.0.0 && git push origin v1.0.0
```

## Deploy

Automático. Todo push na `main` roda a CI e, se os dois jobs passarem, publica as duas pontas
na ordem certa — backend primeiro, porque as migrations sobem no boot e o frontend não pode
apontar para uma API que ainda não migrou.

| Etapa | O que faz |
|---|---|
| `deploy-backend` | dispara o deploy no Render pela API, espera ficar `live` e confere `GET /up` |
| `deploy-frontend` | builda com `PUBLIC_API_URL` e publica o Worker, depois confere `/` e `/historico` |

O `PUBLIC_API_URL` entra em **build time** e também define a origem do WebSocket, então trocar a
URL da API exige rebuild, não só redeploy.

Segredos usados pelo workflow: `RENDER_API_KEY`, `RENDER_SERVICE_ID`, `CLOUDFLARE_API_TOKEN` e
`CLOUDFLARE_ACCOUNT_ID`.

## Manutenção

O Dependabot abre PR agrupado toda segunda para as dependências do backend e do frontend, e
mensalmente para as GitHub Actions e a imagem base do Docker. A CI roda Rubocop, Brakeman e
bundler-audit no backend, e Biome, `tsc --noEmit` e build no frontend.

Atualizações do frontend vindas do Dependabot **falham de propósito**: ele não regenera o
`bun.lock`, e a CI roda `bun install --frozen-lockfile`. Essas sobem à mão, com o lock junto.

## Contribuindo

Branch `feature/<nome-em-kebab-case>` a partir da `dev`, PR para a `dev`, Conventional Commits
em português e minúsculas. A `main` é a branch publicada.

Sem comentários no código: o porquê vai na mensagem de commit ou na descrição do PR.
