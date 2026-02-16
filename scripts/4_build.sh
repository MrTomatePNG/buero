#!/bin/bash
# Fail fast if any command fails
set -e
export PATH="/home/cauldrun/.bun/bin:$PATH"
cd /opt/cauldrun
echo "### 4/5: Buildando a aplicação... ###"
# A DATABASE_URL pode ser necessária durante o build, então o runner do CI/CD deve provê-la
bun --bun run build
