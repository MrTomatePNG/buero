#!/bin/bash
# Fail fast if any command fails
set -e
export PATH="/home/cauldrun/.bun/bin:$PATH"
cd /opt/cauldrun
echo "### 5/5: Reiniciando o servidor da aplicação... ###"
pm2 restart sveltekit-app
pm2 save

echo ">>> Deploy concluído com sucesso! <<<"
