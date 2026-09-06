#!/bin/bash
set -e

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Falta o .env na raiz. Copie de .env.example e preencha."
  exit 1
fi

if [ "$(git config core.hooksPath)" != ".githooks" ]; then
  git config core.hooksPath .githooks
fi

docker compose up -d --build db api

echo "Subindo frontend (porta 5173)..."
cd frontend
bun run dev --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

trap "kill $FRONTEND_PID 2>/dev/null; exit" INT TERM

IP=$(hostname -I | awk '{print $1}')
echo ""
echo "ListaViva rodando:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo "  Celular:  http://$IP:5173"
echo ""
echo "Ctrl+C para o frontend. Backend e banco seguem em container (docker compose down para parar)."

wait
