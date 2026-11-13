#!/bin/sh

set -e

echo "$(cat $VITE_JWT_PUBLIC_KEY)" > jwt.key.pub

sed -i -e ':a;N;$!ba;s/\n//g' jwt.key.pub

export VITE_JWT_PUBLIC_KEY=$(cat jwt.key.pub)

sed -i \
 -e "s@VITE_ISSUER_VALUE@${VITE_ISSUER}@g" \
 -e "s@VITE_JWT_PUBLIC_KEY_VALUE@${VITE_JWT_PUBLIC_KEY}@g" \
 -e "s@VITE_TITLE_VALUE@${VITE_TITLE}@g" \
 -e "s@VITE_API_GATEWAY_VALUE@${VITE_API_GATEWAY}@g" \
 -e "s@VITE_DESCRIPTION_VALUE@${VITE_DESCRIPTION}@g" build/assets/*.js build/index.html

sed -i -e "s@VITE_API_GATEWAY@${VITE_API_GATEWAY}@g" build/serve.json

if [ -f "$SSL_CERT_PATH" ] && [ -f "$SSL_KEY_PATH" ]; then
    serve -s -n \
        -l "${PORT_HTTPS:-443}" \
        --ssl-cert "$SSL_CERT_PATH" \
        --ssl-key "$SSL_KEY_PATH" \
        --config serve.json \
        build
else
    serve -s -n \
        -l "${PORT_HTTP:-80}" \
        --config serve.json \
        build
fi