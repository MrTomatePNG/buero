#!/bin/bash
# Fail fast if any command fails
set -e
cd /opt/cauldrun
echo "### 1/5: Puxando código mais recente... ###"
git fetch origin master
git reset --hard origin/master
chmod +x scripts/*.sh
