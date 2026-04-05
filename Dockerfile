# Runnable image for the same API the tests exercise (CI/CD + local parity).
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY app.js server.js ./
COPY bugs ./bugs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
