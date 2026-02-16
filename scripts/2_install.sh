#!/bin/bash
# Fail fast if any command fails
set -e

echo "### 2/5: Instalando dependências... ###"
# --frozen-lockfile garante que a versão exata do bun.lockb seja instalada
bun install --frozen-lockfile
