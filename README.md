# ListaViva

Listas colaborativas em tempo real, sem cadastro. Cria a lista, escolhe a validade do link, manda no WhatsApp — quem abrir edita junto, ao vivo.

- **Frontend:** React 19 + TypeScript 7 + Rsbuild + Tailwind CSS 4 + Untitled UI
- **Backend:** Ruby on Rails 8.1 (API-only) + Action Cable sobre Solid Cable
- **Banco:** PostgreSQL 16
- **Infra:** Neon + Render + Cloudflare

## Rodar local

```bash
cp .env.example .env   # preencher
./scripts/dev.sh
```

Frontend em `http://localhost:5173`, API em `http://localhost:3000`.
Ruby não é necessário na máquina — o backend roda em container.
