FROM node:24-slim

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    ECOPARK_DB_PATH=/tmp/ecopark/ecopark.sqlite

COPY package*.json ./
RUN npm ci --omit=dev

COPY public ./public
COPY server ./server

EXPOSE 8080

CMD ["npm", "run", "dev"]
