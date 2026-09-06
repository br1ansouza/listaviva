<div align="center">

<img src="frontend/public/icons/icon-192.png" alt="Marca do ListaViva" width="88" height="88">

# ListaViva

### Combine agora. Resolva junto.

Listas colaborativas em tempo real, sem cadastro e sem anúncios.<br>
Do mercado da semana ao próximo rolê: crie, compartilhe e risque junto.

[![CI](https://github.com/br1ansouza/listaviva/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/br1ansouza/listaviva/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/br1ansouza/listaviva?label=release)](https://github.com/br1ansouza/listaviva/releases)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=61DAFB)](frontend/package.json)
[![Rails](https://img.shields.io/badge/Rails-8.1-CC0000?logo=rubyonrails&logoColor=white)](backend/Gemfile)

[**Abrir o ListaViva**](https://listaviva.br1ansouza.workers.dev) · [Como rodar](#rodando-localmente) · [Contribuir](#contribuindo) · [Reportar um problema](https://github.com/br1ansouza/listaviva/issues)

</div>

---

## Uma lista, todo mundo junto

O ListaViva tira as pequenas combinações do meio das mensagens do grupo. Cada pessoa abre o mesmo link, vê o que falta e atualiza a lista na hora, pelo computador ou celular.

- **Comece sem conta.** Escolha um nome para identificar o que você anota.
- **Organize do seu jeito.** Tarefas, compras, eventos, refeições e ideias, com seis cores e uma seleção de ícones.
- **Edite em tempo real.** Adicione, renomeie e risque itens; as mudanças aparecem para quem está na lista.
- **Compartilhe por link.** Envie pelo WhatsApp ou copie o endereço, com validade de 8 horas, 1 dia ou 1 semana.
- **Retome depois.** As listas que você criou ficam no histórico do app, inclusive quando o link expira.
- **Use em qualquer tela.** Interface responsiva, temas claro e escuro, transições suaves e suporte à instalação como PWA.

### Do primeiro item ao último risco

1. **Crie a lista:** escolha o tipo, o título, a cor e o ícone. Os itens já são salvos antes de compartilhar.
2. **Convide o grupo:** gere um link e escolha sua validade. Quem abrir pode editar o título e os itens; a personalização e a geração de links ficam com quem criou.
3. **Resolva junto:** acompanhe o progresso e a autoria das anotações. Se o link vencer, o criador pode gerar outro pelo histórico.

Gerar outro link substitui o anterior. Listas com compartilhamento expirado há mais de 90 dias entram na rotina de limpeza.

## Rodando localmente

Você precisa de **Git**, **Bun** e **Docker com Compose**. Ruby e PostgreSQL rodam em containers; não é necessário instalá-los na máquina. Os scripts abaixo usam Bash.

### 1. Prepare o projeto

```bash
git clone --branch dev https://github.com/br1ansouza/listaviva.git
cd listaviva
cp .env.example .env

cd frontend
bun install --frozen-lockfile
cd ..
```

No `.env`, ajuste `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`. Para uso local, mantenha `FRONTEND_URL=http://localhost:5173`. As variáveis da seção de produção não são necessárias.

### 2. Prepare o banco no primeiro uso

```bash
docker compose up -d --wait db
docker compose run --build --rm api bin/rails db:prepare
```

### 3. Inicie o app

```bash
./scripts/dev.sh
```

| Serviço | Endereço |
| --- | --- |
| Frontend | [localhost:5173](http://localhost:5173) |
| API | [localhost:3000](http://localhost:3000) |
| Saúde da API | [localhost:3000/up](http://localhost:3000/up) |

`Ctrl+C` encerra o frontend. Para parar também a API e o banco, execute `docker compose stop`. Os dados ficam no volume do PostgreSQL.

<details>
<summary>Comandos do dia a dia</summary>

No diretório `frontend/`:

```bash
bun run dev         # desenvolvimento com atualização automática
bun run check       # Biome e TypeScript
bun run verify      # Biome, TypeScript e build de produção
bun run build       # gera frontend/dist
bun run preview     # serve o build gerado
```

Na raiz do repositório:

```bash
docker compose logs -f api
docker compose run --rm api bin/rails console
docker compose run --rm api bin/rails db:migrate
docker compose run --rm api bin/rubocop
```

O `scripts/dev.sh` configura os hooks de Git: o `pre-commit` verifica os arquivos do frontend e do backend conforme as alterações, e o `pre-push` gera o build quando as dependências do frontend estão instaladas.

</details>

## Por dentro do projeto

| Camada | Tecnologias |
| --- | --- |
| Interface | React 19, TypeScript, Rsbuild e Tailwind CSS 4 |
| Componentes e interação | shadcn/ui, Radix UI, Lucide e Motion |
| Estado do cliente | Zustand, atualizações otimistas e reconciliação dos eventos |
| API | Ruby on Rails 8.1 em modo API |
| Tempo real e jobs | Action Cable, Solid Cable e Solid Queue |
| Persistência | PostgreSQL |
| Qualidade | Biome, TypeScript, Rubocop, Brakeman e Bundler Audit |
| Hospedagem | Cloudflare Workers para o frontend, Render para a API e Neon para o banco |

### Tempo real

As alterações saem do navegador por HTTP, são persistidas pela API e transmitidas por WebSocket no canal da lista. O cliente atualiza a interface imediatamente e reconcilia a confirmação sem recriar a linha do item.

O navegador não precisa consultar a lista periodicamente. No servidor, o Solid Cable usa polling no PostgreSQL para distribuir as mensagens entre processos, dispensando Redis. Não há CRDT: escritas concorrentes no mesmo campo são resolvidas pela última atualização persistida.

### Identidade sem cadastro

O navegador gera um UUID e o mantém em `localStorage` e cookie. O app também solicita armazenamento persistente ao navegador para reduzir a chance de remoção automática dos dados — isso não cria uma terceira cópia do identificador.

O histórico pertence a essa identidade, não a uma conta sincronizada entre aparelhos. Limpar os dados do site pode fazer você perder o acesso como criador. O nome escolhido acompanha as anotações para indicar quem escreveu ou editou cada item.

### Estrutura

```text
frontend/
  src/app/              Entrada e rotas
  src/components/       Componentes compartilhados e layout
  src/features/         Listas, identidade e termos de uso
  src/lib/              API, tema, identidade e utilitários
  src/styles/           Paleta, superfícies e estilos globais
  public/               Ícones, manifest e service worker
backend/
  app/                  API, modelos, canais e jobs
  config/               Banco, rotas, filas e ambientes
  db/                   Schema e migrations
scripts/                Desenvolvimento e preview
.github/workflows/      CI, deploy e releases
```

<details>
<summary>Referência rápida da API</summary>

| Método | Rota | Função |
| --- | --- | --- |
| `POST` | `/api/lists` | Cria uma lista sem link de compartilhamento |
| `GET` | `/api/lists/mine` | Lista o histórico do criador |
| `GET` | `/api/lists/:id` | Consulta a lista e seus itens |
| `PATCH` | `/api/lists/:id` | Atualiza título, tipo, cor ou ícone, conforme a permissão |
| `POST` | `/api/lists/:id/share` | Gera um link com `expires_in`: `8h`, `1d` ou `1w` |
| `GET` | `/api/lists/by_token/:token` | Abre uma lista compartilhada |
| `POST` | `/api/lists/:list_id/items` | Adiciona um item |
| `PATCH` | `/api/lists/:list_id/items/:id` | Edita ou marca um item |
| `DELETE` | `/api/lists/:list_id/items/:id` | Remove um item |
| `GET` | `/cable` | Conexão WebSocket do Action Cable |

O frontend envia `X-Device-Id` em todas as requisições, `X-Device-Name` quando há um nome escolhido e `X-Share-Token` nas operações de quem entrou pelo link. Um link expirado retorna `410 Gone` para visitantes; o criador continua com acesso durante o período de retenção.

</details>

## Contribuindo

O fluxo do projeto é **`feature/*` ou `docs/*` → `dev` → `main`**.

1. Atualize a `dev` e crie uma branch para a mudança.
2. Faça commits no padrão Conventional Commits, em português e minúsculas: `feat:`, `fix:`, `docs:` ou `chore:`.
3. Abra o PR da sua branch **para `dev`**.
4. Depois da integração e validação, abra um PR separado **de `dev` para `main`**.

```bash
git switch dev
git pull --ff-only origin dev
git switch -c feature/nome-da-mudanca
```

A `main` representa a versão publicada. Features não devem abrir PR diretamente para ela. Registre o motivo das decisões no commit ou na descrição do PR; o projeto evita comentários no código.

Ao atualizar dependências do frontend, mantenha `package.json` e `bun.lock` sincronizados. A CI usa `bun install --frozen-lockfile` e rejeita um lockfile desatualizado, inclusive em PRs do Dependabot.

## Publicação

### Deploy automático

Pushes na `main` executam a [CI](.github/workflows/ci.yml). Quando as verificações do frontend e do backend passam, o workflow publica a API no Render, aguarda o serviço ficar disponível e confere `/up`. Em seguida, publica o frontend no Cloudflare Workers e confere `/` e `/historico`.

PRs e pushes na `dev` executam as verificações, sem publicar em produção.

O workflow usa os segredos `RENDER_API_KEY`, `RENDER_SERVICE_ID`, `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. A variável `PUBLIC_API_URL` é incorporada no build do frontend e também define o endereço do WebSocket; mudar a API exige gerar um novo build.

### Releases e imagem Docker

Tags `v*` acionam o [workflow de release](.github/workflows/release.yml), que publica a imagem da API no GitHub Container Registry e anexa o bundle do frontend ao release.

```bash
docker pull ghcr.io/br1ansouza/listaviva/api:latest
```

[Ver releases](https://github.com/br1ansouza/listaviva/releases) · [Ver imagem da API](https://github.com/br1ansouza/listaviva/pkgs/container/listaviva%2Fapi)

---

Feito por [Brian Souza](https://github.com/br1ansouza). Encontrou um problema ou tem uma ideia? [Abra uma issue](https://github.com/br1ansouza/listaviva/issues).
