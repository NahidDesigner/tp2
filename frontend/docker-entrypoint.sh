#!/bin/sh
# Generate config.js from environment variable at runtime
cat > /app/dist/config.js <<EOF
// Runtime configuration - injected at container startup
window.APP_CONFIG = {
  API_URL: '${VITE_API_URL:-http://localhost:8000}'
};
EOF

# Start the server
exec serve -s dist -l 3000

