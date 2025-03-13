#!/bin/sh
echo "Generating config.json..."
cat > /usr/share/nginx/html/config.json << EOF
{
  "BACKEND_URL": "${BACKEND_URL}"
}
EOF

echo "Starting nginx..."
nginx -g 'daemon off;'