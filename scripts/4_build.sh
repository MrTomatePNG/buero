# sem set -e
export PATH="/home/cauldrun/.bun/bin:$PATH"
cd /opt/cauldrun
echo "### 4/5: Buildando a aplicação... ###"
NODE_OPTIONS="--trace-uncaught --trace-warnings" bun --bun vite build --logLevel silly 2>&1
echo "Exit code do build: $?"
