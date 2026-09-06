#!/bin/bash
set -e

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Falta o .env na raiz. Copie de .env.example e preencha."
  exit 1
fi

docker compose up -d --build db api

echo "Buildando frontend..."
cd frontend
bun run build

echo "Subindo preview (porta 4173)..."
bun run preview --host 0.0.0.0 --port 4173 &
FRONTEND_PID=$!
cd ..

trap "kill $FRONTEND_PID 2>/dev/null; exit" INT TERM

IP=$(hostname -I | awk '{print $1}')
echo ""
echo "ListaViva (preview):"
echo "  Frontend: http://localhost:4173"
echo "  Backend:  http://localhost:3000"
echo "  Celular:  http://$IP:4173"
echo ""
echo "Ctrl+C para parar o preview."

wait
