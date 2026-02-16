#!/bin/bash
# Fail fast if any command fails
set -e

echo "### 3/5: Rodando as migrations do banco de dados... ###"
# 'prisma migrate deploy' é o comando seguro para ambientes de produção
# A DATABASE_URL é esperada como uma variável de ambiente passada pelo runner do CI/CD
bunx prisma migrate deploy
