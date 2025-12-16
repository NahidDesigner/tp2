#!/bin/sh
set -e

# Generate config.js from environment variable at runtime
echo "Generating config.js with API URL: ${VITE_API_URL:-http://localhost:8000}"
cat > /app/dist/config.js <<EOF
// Runtime configuration - injected at container startup
window.APP_CONFIG = {
  API_URL: '${VITE_API_URL:-http://localhost:8000}'
};
EOF

# Verify dist folder exists and has files
echo "Checking dist folder contents..."
ls -la /app/dist/ || echo "WARNING: dist folder not found or empty"

# Change to app directory and start the server
cd /app
echo "Starting serve on port 3000..."
exec serve -s dist -l 3000

