#!/bin/bash
set -e
export PATH="/home/cauldrun/.bun/bin:$PATH"
export NVM_DIR="/home/cauldrun/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Garante o uso da versão que você deseja
nvm install 22.13.1
nvm use 22.13.1

cd /opt/cauldrun
echo "### 4/5: Buildando a aplicação com Node $(node -v)... ###"

# Define o limite de memória para 3GB (dentro dos seus 4GB de RAM)
export NODE_OPTIONS="--max-old-space-size=3072"

# Rodar sem o --bun aqui é a chave para a estabilidade na VPS
bun svelte-kit sync
npm run build
