# Backend (API) container
FROM node:20-alpine

WORKDIR /app

# Install only the libraries the API needs
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy the API code
COPY src ./src

# Run as the built-in "node" user, not as root
USER node

EXPOSE 4000

CMD ["node", "src/index.js"]
