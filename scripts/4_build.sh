# sem set -e
set -e
export PATH="/home/cauldrun/.bun/bin:$PATH"
cd /opt/cauldrun
echo "### 4/5: Buildando a aplicação... ###"

echo "=== VARS DISPONÍVEIS NO BUILD ==="
printenv | sort
echo "================================="

bun --bun vite build --debug 2>&1 | tail -80
