FROM node:16-alpine

# Create web-app directory
RUN mkdir -p /usr/src/web-app
WORKDIR /usr/src/web-app

# Copy app source
COPY . /usr/src/web-app

# Install dependencies and Build project
RUN npm install ;\
    export VITE_ISSUER=VITE_ISSUER_VALUE ;\
    export VITE_JWT_PUBLIC_KEY=VITE_JWT_PUBLIC_KEY_VALUE ;\
    export VITE_TITLE=VITE_TITLE_VALUE ;\
    export VITE_DESCRIPTION=VITE_DESCRIPTION_VALUE ;\
    npm run build ;\
    npm uninstall package.json ;\
    rm -rf node_modules/ src/ ;\
    npm install -g serve

COPY --chmod=755 entrypoint.sh .

# Start Web-app
ENTRYPOINT ["./entrypoint.sh"]